const generatePasswordResetTemplate = (options = {}) => {
    const {
        resetUrl = '#',
        platformName = 'Your Platform Name',
        faviconUrl = 'https://your-domain.com/favicon.ico',
        supportEmail = 'support@yourplatform.com',
        companyAddress = '123 Business Street, City, State 12345',
        expiryMinutes = 15,
        userEmail = ''
    } = options;

    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Reset Your Password - ${platformName}</title>
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
                        <td style="background: linear-gradient(135deg, #e53e3e 0%, #c53030 100%); padding: 40px 30px; text-align: center;">
                            <!-- Favicon Icon -->
                            <div style="margin-bottom: 20px;">
                                <img src="${faviconUrl}" alt="${platformName} Logo" width="48" height="48" style="display: inline-block; border-radius: 8px;">
                            </div>
                            <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 700; letter-spacing: -0.5px;">
                                Password Reset Request
                            </h1>
                            <p style="color: #fed7d7; margin: 10px 0 0 0; font-size: 16px; opacity: 0.9;">
                                Secure your account
                            </p>
                        </td>
                    </tr>
                    
                    <!-- Content -->
                    <tr>
                        <td style="padding: 50px 40px;">
                            
                            <!-- Main Message -->
                            <div style="text-align: center; margin-bottom: 40px;">
                                <div style="margin-bottom: 20px;">
                                    <span style="font-size: 48px;">🔐</span>
                                </div>
                                <h2 style="color: #2c3e50; margin: 0 0 15px 0; font-size: 24px; font-weight: 600;">
                                    Reset Your Password
                                </h2>
                                <p style="color: #6c7b7f; margin: 0; font-size: 16px; line-height: 1.5;">
                                    We received a request to reset your password for your ${platformName} account. Click the button below to create a new password.
                                </p>
                            </div>
                            
                            <!-- Reset Button -->
                            <div style="text-align: center; margin: 40px 0;">
                                <a href="${resetUrl}" style="display: inline-block; background: linear-gradient(135deg, #e53e3e 0%, #c53030 100%); color: #ffffff; text-decoration: none; padding: 16px 40px; border-radius: 50px; font-weight: 600; font-size: 16px; box-shadow: 0 4px 15px rgba(229, 62, 62, 0.3); transition: all 0.3s ease;">
                                    Reset My Password
                                </a>
                            </div>
                            
                            <!-- Alternative Link -->
                            <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 25px; margin: 30px 0;">
                                <h3 style="color: #2d3748; margin: 0 0 10px 0; font-size: 16px; font-weight: 600;">
                                    Can't click the button?
                                </h3>
                                <p style="color: #4a5568; margin: 0 0 15px 0; font-size: 14px;">
                                    Copy and paste this link into your browser:
                                </p>
                                <div style="background-color: #ffffff; border: 1px solid #e2e8f0; border-radius: 6px; padding: 12px; word-break: break-all;">
                                    <a href="${resetUrl}" style="color: #e53e3e; text-decoration: none; font-size: 14px;">${resetUrl}</a>
                                </div>
                            </div>
                            
                            <!-- Expiry Notice -->
                            <div style="background: linear-gradient(135deg, #fff5f5 0%, #fed7d7 100%); border: 2px solid #feb2b2; border-radius: 12px; padding: 25px; margin: 30px 0; text-align: center;">
                                <div style="color: #c53030; font-size: 24px; margin-bottom: 10px;">⏰</div>
                                <h3 style="color: #742a2a; margin: 0 0 8px 0; font-size: 16px; font-weight: 600;">
                                    Time Sensitive
                                </h3>
                                <p style="color: #9c2626; margin: 0; font-size: 14px;">
                                    This password reset link will expire in <strong>${expiryMinutes} minutes</strong> for security purposes.
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
                                            If you didn't request this password reset, please ignore this email. Your password will remain unchanged. For security concerns, contact our support team immediately.
                                        </p>
                                    </div>
                                </div>
                            </div>
                            
                            <!-- Additional Info -->
                            <div style="text-align: center; margin: 30px 0;">
                                <p style="color: #718096; font-size: 14px; margin: 0;">
                                    Need help? Our support team is here to assist you.
                                </p>
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
                                    <a href="mailto:${supportEmail}" style="color: #e53e3e; text-decoration: none; font-weight: 500;">${supportEmail}</a>
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
exports.generatePasswordResetTemplate = generatePasswordResetTemplate;