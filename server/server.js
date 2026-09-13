const express = require('express');
const cors = require('cors');
const nodemailer = require('nodemailer');
require('dotenv').config();

const { insertMessage, getAllMessages, markMessageAsRead } = require('./db');

const app = express();
const PORT = process.env.PORT || 5000;
const CLIENT_URL = process.env.CLIENT_URL || '*';

// ───── Middleware ─────
app.use(cors({
    origin: CLIENT_URL === '*' ? '*' : CLIENT_URL.split(',').map(s => s.trim()),
    methods: ['GET', 'POST', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'x-admin-key']
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logger
app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`);
    next();
});

// ───── Optional Email Transporter (Nodemailer) ─────
let transporter = null;
if (process.env.SMTP_USER && process.env.SMTP_PASS) {
    transporter = nodemailer.createTransport({
        service: process.env.SMTP_SERVICE || 'gmail',
        auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS
        }
    });
    console.log('📧 Nodemailer email notifications enabled.');
} else {
    console.log('ℹ️ Nodemailer credentials not configured. Messages will be stored in SQLite database only.');
}

// ───── Health Check Endpoint ─────
app.get('/api/health', (req, res) => {
    res.json({
        status: 'online',
        uptime: process.uptime(),
        timestamp: new Date().toISOString()
    });
});

// ───── Contact Form Submission Endpoint ─────
app.post('/api/contact', async (req, res) => {
    try {
        const { name, email, subject, message } = req.body;

        // Basic validation
        if (!name || typeof name !== 'string' || !name.trim()) {
            return res.status(400).json({ success: false, error: 'Name is required.' });
        }

        if (!email || typeof email !== 'string' || !email.includes('@')) {
            return res.status(400).json({ success: false, error: 'A valid email is required.' });
        }

        if (!message || typeof message !== 'string' || !message.trim()) {
            return res.status(400).json({ success: false, error: 'Message content cannot be empty.' });
        }

        const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;

        // Save to SQLite Database
        const savedRecord = await insertMessage({
            name: name.trim(),
            email: email.trim(),
            subject: subject ? subject.trim() : 'Portfolio Contact Inquiry',
            message: message.trim(),
            ip_address: typeof ip === 'string' ? ip : null
        });

        console.log(`💾 Stored message #${savedRecord.id} from ${savedRecord.name} (${savedRecord.email})`);

        // Send Email Alert (Optional if SMTP is configured)
        if (transporter) {
            try {
                const receiver = process.env.NOTIFICATION_RECEIVER || process.env.SMTP_USER;
                await transporter.sendMail({
                    from: `"${name.trim()}" <${process.env.SMTP_USER}>`,
                    replyTo: email.trim(),
                    to: receiver,
                    subject: subject ? `[Portfolio] ${subject.trim()}` : `[Portfolio] Message from ${name.trim()}`,
                    text: `New contact inquiry received:\n\nName: ${name}\nEmail: ${email}\nSubject: ${subject || 'N/A'}\n\nMessage:\n${message}`,
                    html: `
                        <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #222;">
                            <h2 style="color: #0ea5e9;">New Message Received</h2>
                            <p><strong>Name:</strong> ${name}</p>
                            <p><strong>Email:</strong> <a href="mailto:${email}">${email}</a></p>
                            <p><strong>Subject:</strong> ${subject || 'Portfolio Inquiry'}</p>
                            <hr style="border: 0; border-top: 1px solid #ddd; margin: 15px 0;">
                            <p><strong>Message:</strong></p>
                            <p style="white-space: pre-wrap; background: #f8fafc; padding: 12px; border-radius: 6px; border: 1px solid #e2e8f0;">${message}</p>
                        </div>
                    `
                });
                console.log(`✉️ Email alert sent to ${receiver}`);
            } catch (mailErr) {
                console.error('⚠️ Could not send email alert (saved to database successfully):', mailErr.message);
            }
        }

        res.status(201).json({
            success: true,
            message: 'Your message has been sent and recorded successfully!',
            submissionId: savedRecord.id
        });

    } catch (err) {
        console.error('❌ Error handling contact form submission:', err);
        res.status(500).json({
            success: false,
            error: 'Server error while processing your message. Please try again later.'
        });
    }
});

// ───── Admin: View Stored Messages ─────
app.get('/api/messages', async (req, res) => {
    try {
        const clientKey = req.headers['x-admin-key'] || req.query.key;
        const requiredKey = process.env.ADMIN_SECRET_KEY;

        if (requiredKey && clientKey !== requiredKey) {
            return res.status(401).json({
                success: false,
                error: 'Unauthorized: Provide valid x-admin-key header or ?key= query parameter'
            });
        }

        const messages = await getAllMessages();
        const unreadCount = messages.filter(m => m.status === 'unread').length;

        res.json({
            success: true,
            total: messages.length,
            unreadCount,
            messages
        });
    } catch (err) {
        console.error('❌ Error fetching messages:', err);
        res.status(500).json({ success: false, error: 'Failed to retrieve messages.' });
    }
});

// ───── Admin: Mark Message As Read ─────
app.patch('/api/messages/:id/read', async (req, res) => {
    try {
        const clientKey = req.headers['x-admin-key'] || req.query.key;
        const requiredKey = process.env.ADMIN_SECRET_KEY;

        if (requiredKey && clientKey !== requiredKey) {
            return res.status(401).json({ success: false, error: 'Unauthorized' });
        }

        const result = await markMessageAsRead(req.params.id);
        res.json({ success: true, updated: result.updated });
    } catch (err) {
        res.status(500).json({ success: false, error: 'Failed to update message status.' });
    }
});

// ───── Start Server ─────
app.listen(PORT, () => {
    console.log(`\n🚀 Portfolio Backend Server running at http://localhost:${PORT}`);
    console.log(`📡 Health endpoint:  http://localhost:${PORT}/api/health`);
    console.log(`📨 Form endpoint:    http://localhost:${PORT}/api/contact (POST)`);
    console.log(`📋 Admin messages:   http://localhost:${PORT}/api/messages?key=${process.env.ADMIN_SECRET_KEY || ''}\n`);
});
