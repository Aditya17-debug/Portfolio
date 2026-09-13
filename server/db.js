const fs = require('fs');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();

// Ensure data directory exists
const dataDir = path.join(__dirname, 'data');
if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
}

const dbPath = path.join(dataDir, 'messages.db');
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('❌ Failed to connect to SQLite database:', err.message);
    } else {
        console.log(`📦 Connected to SQLite database at: ${dbPath}`);
    }
});

// Initialize database schema
db.serialize(() => {
    db.run(`
        CREATE TABLE IF NOT EXISTS messages (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            email TEXT NOT NULL,
            subject TEXT,
            message TEXT NOT NULL,
            ip_address TEXT,
            status TEXT DEFAULT 'unread',
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    `, (err) => {
        if (err) {
            console.error('❌ Error creating messages table:', err.message);
        } else {
            console.log('✅ Messages table verified/ready.');
        }
    });
});

/**
 * Save a new message submission to the database
 */
function insertMessage({ name, email, subject, message, ip_address }) {
    return new Promise((resolve, reject) => {
        const query = `
            INSERT INTO messages (name, email, subject, message, ip_address)
            VALUES (?, ?, ?, ?, ?)
        `;
        db.run(query, [name, email, subject || 'No Subject', message, ip_address || null], function (err) {
            if (err) {
                return reject(err);
            }
            resolve({
                id: this.lastID,
                name,
                email,
                subject,
                message,
                status: 'unread',
                created_at: new Date().toISOString()
            });
        });
    });
}

/**
 * Retrieve all messages, sorted with newest first
 */
function getAllMessages() {
    return new Promise((resolve, reject) => {
        const query = `SELECT * FROM messages ORDER BY created_at DESC`;
        db.all(query, [], (err, rows) => {
            if (err) {
                return reject(err);
            }
            resolve(rows);
        });
    });
}

/**
 * Mark a message as read
 */
function markMessageAsRead(id) {
    return new Promise((resolve, reject) => {
        const query = `UPDATE messages SET status = 'read' WHERE id = ?`;
        db.run(query, [id], function (err) {
            if (err) {
                return reject(err);
            }
            resolve({ updated: this.changes });
        });
    });
}

module.exports = {
    db,
    insertMessage,
    getAllMessages,
    markMessageAsRead
};
