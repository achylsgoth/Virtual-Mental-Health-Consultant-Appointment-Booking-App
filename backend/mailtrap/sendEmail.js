const { MailtrapClient } = require('mailtrap');
const {VERIFICATION_EMAIL_TEMPLATE, PASSWORD_RESET_REQUEST_TEMPLATE, PASSWORD_RESET_SUCCESS_TEMPLATE} = require('../mailtrap/emailTemplates.js');
const {transport, sender} = require('../mailtrap/verification.js');

const sendVerificationEmail = async (email, verificationToken) => {
    const recipient = email;

    try{
        const response = await transport.sendMail({
            from: sender,
            to: recipient,
            subject: "Verify your email",
            html: VERIFICATION_EMAIL_TEMPLATE.replace("{verificationCode}", verificationToken),
            category: "Verification Token",
        })
        console.log("Email send successfully", response);
    }catch (error) {
        throw new Error(`Error sending verification email: ${error}`);
    }
}


const sendPasswordResetEmail = async (email, resetUrl) => {
    const recipient = email;

    try {
        const response = await transport.sendMail({
            from:sender,
            to: recipient,
            subject: "Reset your password",
            html: PASSWORD_RESET_REQUEST_TEMPLATE.replace("{resetURL}", resetUrl),
            category:"Password reset request",
        })
        console.log("Email sent successfully.", response);
    } catch (error) {
        throw new Error(`Error sending verification email: ${error}`);
    }
}

const sendResetSuccessEmail = async (email) =>  {
    const recipient = email;

    try{
        const response = await transport.sendMail({
            from: sender,
            to: recipient,
            subject: "Password Reset Successful",
            html: PASSWORD_RESET_SUCCESS_TEMPLATE,
            category: "Password Reset"
        } )
        console.log("Email sent successfully.", response);
    } catch(error){
        throw new Error(`Error sending verification email: ${error}`);
    }
}
module.exports = {sendVerificationEmail,
    sendPasswordResetEmail,
sendResetSuccessEmail};