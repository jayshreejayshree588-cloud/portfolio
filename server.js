const express = require('express');
const nodemailer = require('nodemailer');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// Email transporter configuration
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

// Verify transporter connection
transporter.verify((error, success) => {
    if (error) {
        console.error('Email transporter error:', error);
    } else {
        console.log('✓ Email server is ready to send messages');
    }
});

// API endpoint for contact form
app.post('/api/contact', async (req, res) => {
    const { name, email, subject, message } = req.body;

    // Validation
    if (!name || !email || !message) {
        return res.status(400).json({
            success: false,
            message: 'Please fill in all required fields'
        });
    }

    // Email validation regex
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        return res.status(400).json({
            success: false,
            message: 'Please provide a valid email address'
        });
    }

    // Email content
    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: process.env.RECEIVER_EMAIL,
        replyTo: email,
        subject: `Portfolio Contact: ${subject || 'New Message'} from ${name}`,
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e74c3c; border-radius: 10px;">
                <h2 style="color: #e74c3c; border-bottom: 2px solid #f39c12; padding-bottom: 10px;">
                    📧 New Portfolio Contact Message
                </h2>
                <div style="background: #fff5f5; padding: 15px; border-radius: 8px; margin: 15px 0;">
                    <p><strong style="color: #e74c3c;">Name:</strong> ${name}</p>
                    <p><strong style="color: #e74c3c;">Email:</strong> ${email}</p>
                    <p><strong style="color: #e74c3c;">Subject:</strong> ${subject || 'Not specified'}</p>
                </div>
                <div style="background: #f9f9f9; padding: 15px; border-radius: 8px; border-left: 4px solid #f39c12;">
                    <h3 style="color: #333; margin-top: 0;">Message:</h3>
                    <p style="color: #555; line-height: 1.6;">${message.replace(/\n/g, '<br>')}</p>
                </div>
                <p style="color: #888; font-size: 12px; margin-top: 20px; text-align: center;">
                    Sent from your Portfolio Website
                </p>
            </div>
        `
    };

    // Auto-reply to sender
    const autoReplyOptions = {
        from: process.env.EMAIL_USER,
        to: email,
        subject: 'Thank you for contacting me!',
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e74c3c; border-radius: 10px;">
                <h2 style="color: #e74c3c;">Hello ${name}! 👋</h2>
                <p style="color: #555; line-height: 1.6;">
                    Thank you for reaching out! I have received your message and will get back to you as soon as possible.
                </p>
                <p style="color: #555; line-height: 1.6;">
                    In the meantime, feel free to check out my projects and connect with me on social media.
                </p>
                <div style="background: #fff5f5; padding: 15px; border-radius: 8px; margin: 15px 0;">
                    <p style="color: #e74c3c; font-weight: bold;">Best regards,</p>
                    <p style="color: #333;">jayshree<br>BCA Cloud Computing Student<br>Kristu Jayanti University</p>
                </div>
            </div>
        `
    };

    try {
        // Send main email
        await transporter.sendMail(mailOptions);
        
        // Send auto-reply
        await transporter.sendMail(autoReplyOptions);

        res.status(200).json({
            success: true,
            message: 'Message sent successfully! I will get back to you soon.'
        });
    } catch (error) {
        console.error('Email sending error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to send message. Please try again later.'
        });
    }
});

// Serve the main HTML file
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Start server
app.listen(PORT, () => {
    console.log(`
    ╔════════════════════════════════════════╗
    ║   🚀 Portfolio Server Running!         ║
    ║   📍 http://localhost:${PORT}              ║
    ╚════════════════════════════════════════╝
    `);
});
