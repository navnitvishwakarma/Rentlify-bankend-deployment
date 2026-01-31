const nodemailer = require('nodemailer');
const config = require('../config/env');

const transport = nodemailer.createTransport(config.email.smtp);

const sendEmail = async (to, subject, text) => {
    const msg = { from: config.email.from, to, subject, text };
    try {
        if (config.env !== 'test') {
            await transport.sendMail(msg);
            console.log(`Email sent to ${to}`);
        }
    } catch (error) {
        console.error('Email sending failed:', error);
        // Don't throw error to avoid breaking main flow, but log it
    }
};

const sendWelcomeEmail = async (to, name) => {
    const subject = 'Welcome to Rentlify';
    const text = `Dear ${name},\n\nWelcome to Rentlify! We are excited to have you on board.`;
    await sendEmail(to, subject, text);
};

module.exports = {
    transport,
    sendEmail,
    sendWelcomeEmail,
};
