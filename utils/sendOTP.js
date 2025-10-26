const nodemailer = require("nodemailer");

const sendOTP = async (email, otp) => {
    try {
        
        const transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
                user: process.env.MAIL_USER, 
                pass: process.env.MAIL_PASS, 
            },
        });

        
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: email,
            subject: "Your OTP for Verification",
            text: `Your OTP for verification is: ${otp}. It is valid for 10 minutes.`,
        };

        
        await transporter.sendMail(mailOptions);
        console.log("OTP sent successfully");
    } catch (error) {
        console.error("Error sending OTP:", error);
    }
};

module.exports = sendOTP;
