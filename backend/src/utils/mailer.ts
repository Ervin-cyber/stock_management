// backend/src/utils/mailer.ts
import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.SMTP_EMAIL,
        pass: process.env.SMTP_PASSWORD
    }
});

export const sendVerificationEmail = async (toEmail: string, userName: string | null, token: string) => {
    const verifyUrl = `${process.env.FRONTEND_URL}/verify-email?token=${token}`;

    const mailOptions = {
        from: `"StockFlow" <${process.env.SMTP_EMAIL}>`,
        to: toEmail,
        subject: 'Activate account - StockFlow',
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 30px; border: 1px solid #e2e8f0; border-radius: 12px; background-color: #ffffff;">
                
                <div style="text-align: center; margin-bottom: 30px;">
                    <div style="display: inline-flex; align-items: center; justify-content: center; gap: 8px;">
                        <img src="https://stockmanagement.papstack.net/logo.png" alt="StockFlow Package" width="28" height="28" style="vertical-align: middle; display: inline-block;" />
                        <span style="font-size: 24px; font-weight: bold; letter-spacing: 1px; color: #0f172a; vertical-align: middle; margin-left: 8px;">STOCKFLOW</span>
                    </div>
                </div>

                <h2 style="color: #0f172a; text-align: center;">Welcome, ${userName}!</h2>
                <p style="color: #334155; font-size: 16px; line-height: 1.5; text-align: center;">
                    Thank you for joining us. You have successfully registered. Please click the button below to verify your email address and activate your account:
                </p>
                
                <div style="text-align: center; margin: 35px 0;">
                    <a href="${verifyUrl}" style="background-color: #2563eb; color: #ffffff; padding: 14px 28px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block; font-size: 16px;">Activate Account</a>
                </div>
                
                <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e2e8f0;">
                    <p style="color: #64748b; font-size: 14px; margin-bottom: 5px;">Or copy and paste this link into your browser:</p>
                    <p style="color: #2563eb; font-size: 13px; word-break: break-all; margin-top: 0;">${verifyUrl}</p>
                </div>
            </div>
        `
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log(`✉️ Email successfully sent to the following address: ${toEmail}`);
    } catch (error) {
        console.error('❌ Error sending email:', error);
        throw new Error('The confirmation email could not be sent.');
    }
};

export const sendResetPasswordEmail = async (toEmail: string, userName: string | null, resetLink: string) => {

    const mailOptions = {
        from: `"StockFlow" <${process.env.SMTP_EMAIL}>`,
        to: toEmail,
        subject: 'Reset password - StockFlow',
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 30px; border: 1px solid #e2e8f0; border-radius: 12px; background-color: #ffffff;">
                
                <div style="text-align: center; margin-bottom: 30px;">
                    <div style="display: inline-flex; align-items: center; justify-content: center; gap: 8px;">
                        <img src="https://stockmanagement.papstack.net/logo.png" alt="StockFlow Package" width="28" height="28" style="vertical-align: middle; display: inline-block;" />
                        <span style="font-size: 24px; font-weight: bold; letter-spacing: 1px; color: #0f172a; vertical-align: middle; margin-left: 8px;">STOCKFLOW</span>
                    </div>
                </div>

                <h2 style="color: #0f172a; text-align: center;">Password Reset Request</h2>
                <p style="color: #334155; font-size: 16px; line-height: 1.5; text-align: center;">
                    Hi ${userName},<br><br>
                    We received a request to reset your password for your STOCKFLOW account. If you made this request, please click the button below to create a new password.
                </p>
                
                <div style="text-align: center; margin: 35px 0;">
                    <a href="${resetLink}" style="background-color: #2563eb; color: #ffffff; padding: 14px 28px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block; font-size: 16px;">Reset Password</a>
                </div>

                <p style="color: #64748b; font-size: 14px; text-align: center;">
                    <em>This link will expire in 15 minutes. If you didn't request a password reset, you can safely ignore this email.</em>
                </p>
                
                <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e2e8f0;">
                    <p style="color: #64748b; font-size: 14px; margin-bottom: 5px;">Or copy and paste this link into your browser:</p>
                    <p style="color: #2563eb; font-size: 13px; word-break: break-all; margin-top: 0;">${resetLink}</p>
                </div>
            </div>
        `
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log(`✉️ Email successfully sent to the following address: ${toEmail}`);
    } catch (error) {
        console.error('❌ Error sending email:', error);
        throw new Error('The password reset email could not be sent.');
    }
};