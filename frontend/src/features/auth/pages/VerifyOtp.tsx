import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router";
import { useResendOtpMutation, useVerifyOtpMutation } from "../mutations";

type VerificationState = {
    verificationId?: string;
    email?: string;
};

const VerifyOtp = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const state = (location.state || {}) as VerificationState;
    const [emailOtp, setEmailOtp] = useState("");
    const [emailVerified, setEmailVerified] = useState(false);
    const [verifyOtpMutation, resendOtpMutation] = [useVerifyOtpMutation(), useResendOtpMutation()];
    const [resendSeconds, setResendSeconds] = useState(60);

    useEffect(() => {
        if (resendSeconds <= 0) {
            return;
        }

        const timer = window.setInterval(() => {
            setResendSeconds((seconds) => Math.max(seconds - 1, 0));
        }, 1000);

        return () => window.clearInterval(timer);
    }, [resendSeconds]);

    if (!state.verificationId || !state.email) {
        return (
            <main>
                <div className="form-container">
                    <h1>Verification session unavailable</h1>
                    <button className="btn primary-btn" onClick={() => navigate("/signup")}>Back to signup</button>
                </div>
            </main>
        );
    }

    const { verificationId, email } = state;

    const verifyEmail = async (event: React.FormEvent) => {
        event.preventDefault();
        verifyOtpMutation.mutate({ verificationId, email, otp: emailOtp }, {
            onSuccess: () => {
                setEmailVerified(true);
                // redirect to home if verification is successful.
                navigate('/');
            }
        })
    };

    const resendEmailOtp = () => {
        if (resendSeconds > 0 || resendOtpMutation.isPending) {
            return;
        }

        resendOtpMutation.mutate(
            { verificationId, email },
            {
                onSuccess: () => {
                    setEmailOtp("");
                    setResendSeconds(60);
                },
            },
        );
    };

    return (
        <main>
            <div className="form-container">
                <h1>Verify your account</h1>
                <form onSubmit={verifyEmail}>
                    <div className="input-group">
                        <label htmlFor="emailOtp">Email OTP</label>
                        <input id="emailOtp" value={emailOtp} onChange={(event) => setEmailOtp(event.target.value)} inputMode="numeric" maxLength={6} required disabled={emailVerified} />
                    </div>
                    <button className="btn primary-btn" disabled={emailVerified} type="submit">
                        {emailVerified ? "Email verified" : "Verify email"}
                    </button>
                </form>
                <button
                    className="btn primary-btn"
                    type="button"
                    onClick={resendEmailOtp}
                    disabled={emailVerified || resendSeconds > 0 || resendOtpMutation.isPending}
                >
                    {resendOtpMutation.isPending
                        ? "Sending..."
                        : resendSeconds > 0
                            ? `Resend code in ${resendSeconds}s`
                            : "Resend code"}
                </button>
            </div>
        </main>
    );
};

export default VerifyOtp;
