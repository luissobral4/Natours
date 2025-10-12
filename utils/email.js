const nodemailer = require('nodemailer');
const pug = require('pug');
const { htmlToText } = require('html-to-text');
const path = require('node:path');

class Email {
    constructor(user, url) {
        this.to = user.email;
        this.firstName = user.name.split(' ')[0];
        this.url = url;
        this.from = `Luís Sobral <${process.env.EMAIL_FROM}>`;
    }

    newTransport() {
        if (process.env.NODE_ENV === 'production') {
            return 1;
        }

        return nodemailer.createTransport({
            host: process.env.EMAIL_HOST,
            port: process.env.EMAIL_PORT,
            auth: {
                user: process.env.EMAIL_USERNAME,
                pass: process.env.EMAIL_PASSWORD
            }
        });
    }

    async sendAsync(template, subject) {
        const html = pug.renderFile(
            path.join(__dirname, '/../views/email/', `${template}.pug`),
            {
                firstName: this.firstName,
                url: this.url,
                subject
            }
        );

        const mailOptions = {
            from: this.from,
            to: this.to,
            subject,
            html,
            text: htmlToText(html)
        };

        await this.newTransport().sendMail(mailOptions);
    }

    async sendWelcomeAsync() {
        await this.sendAsync('welcome', 'Welcome to the Natours Family!');
    }

    async sendPasswordResetAsync() {
        await this.sendAsync(
            'passwordReset',
            'Your password reset token (valid for 10 minutes)'
        );
    }
}

module.exports = Email;
