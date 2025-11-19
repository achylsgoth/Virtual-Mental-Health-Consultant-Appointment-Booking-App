// utils/encryption.js
const crypto = require('crypto');

const algorithm = 'aes-256-cbc';
const secretKey = process.env.NOTES_SECRET_KEY;
const ivLength = 16;

function encrypt(text) {
    const iv = crypto.randomBytes(ivLength);
    const cipher = crypto.createCipheriv(algorithm, secretKey, iv);
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    return JSON.stringify({
        iv: iv.toString('hex'),
        content: encrypted
    });
}

function decrypt(encryptedString) {
    const encryptedData = JSON.parse(encryptedString);
    const decipher = crypto.createDecipheriv(
        algorithm, 
        secretKey, 
        Buffer.from(encryptedData.iv, 'hex')
    );
    let decrypted = decipher.update(encryptedData.content, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
}

module.exports = { encrypt, decrypt };