const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    service: 'gmail',
    port: 465,
    secure: true, 
    auth: {
      user: "senabhinav542@gmail.com",
      pass: "foclwkgslssrcyto"
    }
});

const sendEmail = async (to, otp, subject) => {
    const htmlContent = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px; background-color: #f9f9f9;">
        <h2 style="color: #333; text-align: center;">Email Verification</h2>
        <p style="font-size: 16px; color: #555;">Hello,</p>
        <p style="font-size: 16px; color: #555;">
            Thank you for signing up! To complete your registration, please use the OTP below:
        </p>
        <div style="text-align: center; margin: 20px 0;">
            <span style="font-size: 24px; font-weight: bold; color: #4CAF50;">${otp}</span>
        </div>
        <p style="font-size: 16px; color: #555;">This OTP is valid for 1 minute.</p>
        <p style="font-size: 16px; color: #555;">If you didn't request this email, please ignore it.</p>
        <p style="font-size: 16px; color: #555;">Best regards,<br>The HevenStay Team</p>
    </div>
`;
    const mailOptions = {
        from: 'senabhinav542@gmail.com',
        to,
        subject,
        html: htmlContent
    };

    await transporter.sendMail(mailOptions);
};


module.exports = sendEmail;
