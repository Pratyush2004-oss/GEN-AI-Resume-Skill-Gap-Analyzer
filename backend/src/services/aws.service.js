import { SESv2Client } from "@aws-sdk/client-sesv2";

const region = process.env.AWS_REGION || "ap-south-1";

export const sesClient = new SESv2Client({ region });
