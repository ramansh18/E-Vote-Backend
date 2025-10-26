/**
 * OTP Email Template Generator
 * Creates customizable HTML email template for OTP verification
 */

const generateOTPEmailTemplate = (options = {}) => {
    const {
        otpCode = '123456',
        platformName = 'E-Vote',
        faviconUrl = 'https://res.cloudinary.com/duwnm6bjs/image/upload/v1748609859/e-voting-uploads/x6pyk2j2hijwfkjwkven.png',
        supportEmail = 'evote2025@gmail.com',
        companyAddress = 'Lucknow,Uttar Pradesh',
        expiryMinutes = 10,
        userEmail = ''
    } = options;

    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Verify Your Account - OTP Code</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f7fa; line-height: 1.6;">
    
    <!-- Email Container -->
    <table cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color: #f4f7fa; padding: 40px 0;">
        <tr>
            <td align="center">
                
                <!-- Main Email Content -->
                <table cellpadding="0" cellspacing="0" border="0" width="600" style="max-width: 600px; background-color: #ffffff; border-radius: 12px; box-shadow: 0 4px 20px rgba(0,0,0,0.1); overflow: hidden;">
                    
                    <!-- Header -->
                    <tr>
                        <td style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 30px; text-align: center;">
                            <!-- Favicon Icon Placeholder -->
                            <div style="margin-bottom: 20px;">
                                <img src="${faviconUrl}" alt="${platformName} Logo" width="48" height="48" style="display: inline-block; border-radius: 8px;">
                            </div>
                            <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 700; letter-spacing: -0.5px;">
                                Verify Your Account
                            </h1>
                            <p style="color: #e8f0fe; margin: 10px 0 0 0; font-size: 16px; opacity: 0.9;">
                                Complete your registration
                            </p>
                        </td>
                    </tr>
                    
                    <!-- Content -->
                    <tr>
                        <td style="padding: 50px 40px;">
                            
                            <!-- Welcome Message -->
                            <div style="text-align: center; margin-bottom: 40px;">
                                <h2 style="color: #2c3e50; margin: 0 0 15px 0; font-size: 24px; font-weight: 600;">
                                    Welcome to ${platformName}!
                                </h2>
                                <p style="color: #6c7b7f; margin: 0; font-size: 16px; line-height: 1.5;">
                                    Thank you for signing up. To complete your registration and secure your account, please verify your email address using the code below.
                                </p>
                            </div>
                            
                            <!-- OTP Code Section -->
                            <div style="background: linear-gradient(135deg, #f8f9ff 0%, #f1f5ff 100%); border: 2px dashed #667eea; border-radius: 12px; padding: 30px; text-align: center; margin: 30px 0;">
                                <p style="color: #4a5568; margin: 0 0 15px 0; font-size: 14px; font-weight: 500; text-transform: uppercase; letter-spacing: 1px;">
                                    Your Verification Code
                                </p>
                                <div style="background-color: #ffffff; border-radius: 8px; padding: 20px; margin: 15px 0; box-shadow: 0 2px 10px rgba(102, 126, 234, 0.1);">
                                    <span style="font-size: 36px; font-weight: 700; letter-spacing: 8px; color: #667eea; font-family: 'Courier New', monospace;">
                                        ${otpCode}
                                    </span>
                                </div>
                                <p style="color: #718096; margin: 15px 0 0 0; font-size: 14px;">
                                    This code will expire in <strong>${expiryMinutes} minutes</strong>
                                </p>
                            </div>
                            
                            <!-- Instructions -->
                            <div style="background-color: #f8fafc; border-left: 4px solid #48bb78; padding: 20px; margin: 30px 0; border-radius: 0 8px 8px 0;">
                                <h3 style="color: #2d3748; margin: 0 0 10px 0; font-size: 16px; font-weight: 600;">
                                    How to verify:
                                </h3>
                                <ol style="color: #4a5568; margin: 10px 0 0 20px; padding: 0; font-size: 14px;">
                                    <li style="margin-bottom: 8px;">Return to the verification page on our platform</li>
                                    <li style="margin-bottom: 8px;">Enter the 6-digit code shown above</li>
                                    <li>Click "Verify" to complete your registration</li>
                                </ol>
                            </div>
                            
                            <!-- Simple instruction -->
                            <div style="text-align: center; margin: 40px 0 30px 0;">
                                <p style="color: #4a5568; font-size: 16px; font-weight: 500;">
                                    Enter this code on the verification page to complete your registration.
                                </p>
                            </div>
                            
                            <!-- Security Notice -->
                            <div style="background-color: #fef5e7; border: 1px solid #f6d55c; border-radius: 8px; padding: 20px; margin: 30px 0;">
                                <div style="display: flex; align-items: flex-start;">
                                    <div style="color: #d69e2e; font-size: 20px; margin-right: 15px;">⚠️</div>
                                    <div>
                                        <h4 style="color: #744210; margin: 0 0 8px 0; font-size: 14px; font-weight: 600;">
                                            Security Notice
                                        </h4>
                                        <p style="color: #9c6d20; margin: 0; font-size: 13px; line-height: 1.4;">
                                            Never share this code with anyone. Our team will never ask for your verification code. If you didn't request this verification, please ignore this email.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </td>
                    </tr>
                    
                    <!-- Footer -->
                    <tr>
                        <td style="background-color: #f8fafc; padding: 30px 40px; border-top: 1px solid #e2e8f0;">
                            <div style="text-align: center;">
                                <p style="color: #718096; margin: 0 0 10px 0; font-size: 14px;">
                                    Need help? Contact our support team
                                </p>
                                <p style="margin: 0 0 20px 0;">
                                    <a href="mailto:${supportEmail}" style="color: #667eea; text-decoration: none; font-weight: 500;">${supportEmail}</a>
                                </p>
                                
                                <!-- Social Links -->
                                <div style="margin: 20px 0;">
                                    <a href="#" style="display: inline-block; margin: 0 10px; color: #a0aec0; text-decoration: none;">
                                        <span style="font-size: 20px;">📧</span>
                                    </a>
                                    <a href="#" style="display: inline-block; margin: 0 10px; color: #a0aec0; text-decoration: none;">
                                        <span style="font-size: 20px;">🐦</span>
                                    </a>
                                    <a href="#" style="display: inline-block; margin: 0 10px; color: #a0aec0; text-decoration: none;">
                                        <span style="font-size: 20px;">💼</span>
                                    </a>
                                </div>
                                
                                <p style="color: #a0aec0; margin: 20px 0 0 0; font-size: 12px; line-height: 1.4;">
                                    © 2025 ${platformName}. All rights reserved.<br>
                                    ${companyAddress}<br>
                                    <a href="#" style="color: #a0aec0; text-decoration: none;">Unsubscribe</a> | 
                                    <a href="#" style="color: #a0aec0; text-decoration: none;">Privacy Policy</a>
                                </p>
                            </div>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>`;
};

// Export using exports
exports.generateOTPEmailTemplate = generateOTPEmailTemplate;

