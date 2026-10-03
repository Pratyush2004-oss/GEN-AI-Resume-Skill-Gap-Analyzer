import crypto from "crypto";
import { getRedisClient } from "../config/redis.js";

const OTP_TTL_SECONDS = Number(process.env.OTP_TTL_SECONDS || 300);
const RESEND_COOLDOWN_SECONDS = Number(process.env.OTP_RESEND_COOLDOWN_SECONDS || 60);
const MAX_VERIFY_ATTEMPTS = Number(process.env.OTP_MAX_VERIFY_ATTEMPTS || 5);
const MAX_REQUESTS_PER_HOUR = Number(process.env.OTP_MAX_REQUESTS_PER_HOUR || 5);
const MAX_REQUESTS_PER_IP_PER_HOUR = Number(process.env.OTP_MAX_REQUESTS_PER_IP_PER_HOUR || 20);
const OTP_LENGTH = Number(process.env.OTP_LENGTH || 6);

const hashValue = (value) => crypto
    .createHash("sha256")
    .update(String(value).trim().toLowerCase())
    .digest("hex");

const hashOtp = (verificationId, channel, otp) => crypto
    .createHmac("sha256", process.env.OTP_HASH_SECRET || process.env.ACCESS_TOKEN_SECRET)
    .update(`${verificationId}:${channel}:${otp}`)
    .digest("hex");

const otpKey = (verificationId, channel) => `otp:${verificationId}:${channel}`;
const cooldownKey = (channel, destination) => `otp:cooldown:${channel}:${hashValue(destination)}`;
const destinationRateKey = (channel, destination) => `otp:rate:${channel}:${hashValue(destination)}`;
const ipRateKey = (ip) => `otp:rate:ip:${hashValue(ip)}`;

const incrementWithExpiry = async (client, key, windowSeconds, limit) => {
    const count = await client.incr(key);
    if (count === 1) {
        await client.expire(key, windowSeconds);
    }
    if (count > limit) {
        return false;
    }
    return true;
};

export const createVerificationId = () => crypto.randomUUID();

export const generateOtp = () => {
    const minimum = 10 ** (OTP_LENGTH - 1);
    const maximum = 10 ** OTP_LENGTH;
    return String(crypto.randomInt(minimum, maximum));
};

export const enforceOtpRateLimits = async ({ channel, destination, ip }) => {
    const client = await getRedisClient();
    const destinationAllowed = await incrementWithExpiry(
        client,
        destinationRateKey(channel, destination),
        60 * 60,
        MAX_REQUESTS_PER_HOUR,
    );
    const ipAllowed = await incrementWithExpiry(
        client,
        ipRateKey(ip || "unknown"),
        60 * 60,
        MAX_REQUESTS_PER_IP_PER_HOUR,
    );

    if (!destinationAllowed || !ipAllowed) {
        const error = new Error("Too many OTP requests. Please try again later.");
        error.statusCode = 429;
        throw error;
    }
};

export const ensureResendCooldown = async ({ channel, destination }) => {
    const client = await getRedisClient();
    const created = await client.set(
        cooldownKey(channel, destination),
        "1",
        { NX: true, EX: RESEND_COOLDOWN_SECONDS },
    );
    if (created !== "OK") {
        const error = new Error("Please wait before requesting another OTP.");
        error.statusCode = 429;
        throw error;
    }
};

export const storeOtp = async ({ verificationId, channel, destination, userId, otp }) => {
    const client = await getRedisClient();
    await client.set(
        otpKey(verificationId, channel),
        JSON.stringify({
            userId: String(userId),
            destinationHash: hashValue(destination),
            otpHash: hashOtp(verificationId, channel, otp),
            attempts: 0,
        }),
        { EX: OTP_TTL_SECONDS },
    );
};

export const verifyStoredOtp = async ({ verificationId, channel, destination, otp }) => {
    const client = await getRedisClient();
    const key = otpKey(verificationId, channel);
    const storedValue = await client.get(key);

    if (!storedValue) {
        return { valid: false, reason: "expired" };
    }

    const stored = JSON.parse(storedValue);
    if (stored.destinationHash !== hashValue(destination)) {
        return { valid: false, reason: "invalid" };
    }

    if (stored.attempts >= MAX_VERIFY_ATTEMPTS) {
        await client.del(key);
        return { valid: false, reason: "attempts_exceeded" };
    }

    const expectedHash = hashOtp(verificationId, channel, otp);
    const valid = crypto.timingSafeEqual(
        Buffer.from(stored.otpHash),
        Buffer.from(expectedHash),
    );

    if (!valid) {
        stored.attempts += 1;
        if (stored.attempts >= MAX_VERIFY_ATTEMPTS) {
            await client.del(key);
            return { valid: false, reason: "attempts_exceeded" };
        }
        const ttl = await client.ttl(key);
        await client.set(key, JSON.stringify(stored), { EX: Math.max(ttl, 1) });
        return { valid: false, reason: "invalid" };
    }

    await client.del(key);
    return { valid: true, userId: stored.userId };
};

export const getStoredOtpContext = async ({ verificationId, channel, destination }) => {
    const client = await getRedisClient();
    const storedValue = await client.get(otpKey(verificationId, channel));
    if (!storedValue) return null;

    const stored = JSON.parse(storedValue);
    if (stored.destinationHash !== hashValue(destination)) return null;
    return { userId: stored.userId };
};

export const deleteVerification = async (verificationId) => {
    const client = await getRedisClient();
    await client.del(otpKey(verificationId, "email"));
};
