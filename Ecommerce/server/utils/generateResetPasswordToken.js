const crypto = require('crypto');

const generateResetPasswordToken = () => {
    const resetToken = crypto.randomBytes(20).toString("hex");
    const hashedToken = crypto.createHash("sha256").update(resetToken).digest("hex");
    const tokenExpiry = Date.now() + 15 * 60 * 1000; // 15 minutes from now
    return { resetToken, hashedToken, tokenExpiry };
};
module.exports = generateResetPasswordToken;
