// backend/src/utils/mailer.ts
import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.SMTP_EMAIL,
        pass: process.env.SMTP_PASSWORD
    }
});

export const sendVerificationEmail = async (toEmail: string, token: string) => {
    const verifyUrl = `${process.env.FRONTEND_URL}/verify-email?token=${token}`;

    const mailOptions = {
        from: `"Stock Management System" <${process.env.SMTP_EMAIL}>`,
        to: toEmail,
        subject: 'Activate account - Stock Management',
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;">
                <h2 style="color: #0f172a;">Welcome to the system!</h2>
                <p style="color: #334155; font-size: 16px;">You have successfully registered. Please click the button below to activate your account.:</p>
                
                <div style="text-align: center; margin: 30px 0;">
                    <a href="${verifyUrl}" style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">Account Activation</a>
                </div>
                
                <p style="color: #64748b; font-size: 14px;">Or copy this link into your browser:</p>
                <p style="color: #2563eb; font-size: 14px; word-break: break-all;">${verifyUrl}</p>
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