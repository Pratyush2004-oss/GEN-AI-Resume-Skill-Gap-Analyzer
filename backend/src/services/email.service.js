import { SendEmailCommand } from "@aws-sdk/client-sesv2";
import { sesClient } from "./aws.service.js";

export const sendEmailOtp = async ({ email, otp }) => {
    if (process.env.OTP_DELIVERY_MODE === "log") {
        console.log(`Email OTP delivery is in log mode for ${email.replace(/(.{2}).+(@.*)/, "$1***$2")}`);
        return "local-log";
    }

    const fromEmail = process.env.AWS_SES_FROM_EMAIL;
    if (!fromEmail) {
        throw new Error("AWS_SES_FROM_EMAIL is not configured");
    }

    const expiryMinutes = Math.floor(Number(process.env.OTP_TTL_SECONDS || 300) / 60);
    const htmlBody = `
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Your verification code</title>
  </head>
  <body style="margin:0;background-color:#111111;color:#f5f5f5;font-family:Arial,Helvetica,sans-serif;">
    <div style="padding:32px 16px;background-color:#111111;">
      <div style="display:none;max-height:0;overflow:hidden;opacity:0;">
        Your Resume Skill Gap Analyzer verification code expires in ${expiryMinutes} minutes.
      </div>
      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="max-width:560px;margin:0 auto;">
        <tr>
          <td style="padding:0 0 18px;text-align:center;">
            <div style="display:inline-block;width:48px;height:48px;border-radius:14px;background-color:#508740;color:#ffffff;font-size:24px;line-height:48px;font-weight:700;">
              R
            </div>
            <div style="padding-top:12px;color:#a3f07f;font-size:13px;font-weight:700;letter-spacing:1.5px;text-transform:uppercase;">
              Resume Skill Gap Analyzer
            </div>
          </td>
        </tr>
        <tr>
          <td style="padding:36px 32px;border:1px solid #303840;border-radius:24px;background-color:#1a1f27;box-shadow:0 16px 40px rgba(0,0,0,0.35);">
            <h1 style="margin:0;text-align:center;color:#f5f5f5;font-size:26px;line-height:1.25;">
              Verify your email
            </h1>
            <p style="margin:16px 0 0;text-align:center;color:#b8bec5;font-size:15px;line-height:1.6;">
              Use the verification code below to finish creating your account.
            </p>
            <div style="margin:28px 0;padding:20px;border:1px solid #508740;border-radius:16px;background-color:#111111;text-align:center;">
              <div style="color:#7ed957;font-size:12px;font-weight:700;letter-spacing:2px;text-transform:uppercase;">
                Verification code
              </div>
              <div style="padding-top:10px;color:#ffffff;font-size:36px;font-weight:700;letter-spacing:10px;line-height:1.2;">
                ${otp}
              </div>
            </div>
            <p style="margin:0;text-align:center;color:#b8bec5;font-size:14px;line-height:1.6;">
              This code expires in <strong style="color:#7ed957;">${expiryMinutes} minutes</strong>.
              If you did not request this code, you can safely ignore this email.
            </p>
          </td>
        </tr>
        <tr>
          <td style="padding:22px 16px 0;text-align:center;color:#707983;font-size:12px;line-height:1.6;">
            This is an automated message. Please do not reply.
          </td>
        </tr>
      </table>
    </div>
  </body>
</html>`;

    const command = new SendEmailCommand({
        FromEmailAddress: fromEmail,
        Destination: { ToAddresses: [email] },
        Content: {
            Simple: {
                Subject: { Data: "Your verification code", Charset: "UTF-8" },
                Body: {
                    Text: {
                        Data: `Your Resume Skill Gap Analyzer verification code is ${otp}. It expires in ${expiryMinutes} minutes.`,
                        Charset: "UTF-8",
                    },
                    Html: {
                        Data: htmlBody,
                        Charset: "UTF-8",
                    },
                },
            },
        },
    });

    const result = await sesClient.send(command);
    return result.MessageId;
};
