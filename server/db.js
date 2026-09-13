const fs = require('fs');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

// ───── 1. Supabase Initialization (Cloud PostgreSQL) ─────
let supabase = null;
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;

if (supabaseUrl && supabaseKey && !supabaseUrl.includes('your-project-ref')) {
    try {
        supabase = createClient(supabaseUrl, supabaseKey);
        console.log(`🌐 Supabase client connected: ${supabaseUrl}`);
    } catch (err) {
        console.error('⚠️ Failed to initialize Supabase client:', err.message);
    }
} else {
    console.log('ℹ️ Supabase credentials not found in .env. Using local SQLite database as primary storage.');
}

// ───── 2. SQLite Database (Local Fallback & Offline Storage) ─────
const dataDir = path.join(__dirname, 'data');
if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
}

const dbPath = path.join(dataDir, 'messages.db');
const sqliteDb = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('❌ Failed to connect to SQLite fallback:', err.message);
    } else {
        console.log(`📦 SQLite local database active at: ${dbPath}`);
    }
});

sqliteDb.serialize(() => {
    sqliteDb.run(`
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
    `);
});

/**
 * Save a message into Supabase (Cloud SQL).
 * If Supabase is not configured or fails, falls back automatically to SQLite!
 */
async function insertMessage({ name, email, subject, message, ip_address }) {
    // 1. Try Supabase first if configured
    if (supabase) {
        try {
            const { data, error } = await supabase
                .from('messages')
                .insert([{
                    name,
                    email,
                    subject: subject || 'No Subject',
                    message,
                    ip_address: ip_address || null,
                    status: 'unread'
                }])
                .select();

            if (error) {
                console.warn('⚠️ Supabase insert failed, storing in SQLite backup:', error.message);
            } else if (data && data.length > 0) {
                console.log(`☁️ Message saved to Supabase (Row ID: ${data[0].id})`);
                return {
                    source: 'supabase',
                    id: data[0].id,
                    name,
                    email,
                    subject,
                    message,
                    status: 'unread',
                    created_at: data[0].created_at
                };
            }
        } catch (supaErr) {
            console.warn('⚠️ Network error connecting to Supabase. Saving to SQLite backup:', supaErr.message);
        }
    }

    // 2. Fallback to local SQLite
    return new Promise((resolve, reject) => {
        const query = `
            INSERT INTO messages (name, email, subject, message, ip_address)
            VALUES (?, ?, ?, ?, ?)
        `;
        sqliteDb.run(query, [name, email, subject || 'No Subject', message, ip_address || null], function (err) {
            if (err) return reject(err);
            console.log(`💾 Message saved to local SQLite (ID: ${this.lastID})`);
            resolve({
                source: 'sqlite',
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
 * Retrieve messages from Supabase or SQLite
 */
async function getAllMessages() {
    if (supabase) {
        try {
            const { data, error } = await supabase
                .from('messages')
                .select('*')
                .order('created_at', { ascending: false });

            if (!error && data) {
                return { source: 'supabase', messages: data };
            }
        } catch (supaErr) {
            console.warn('⚠️ Could not fetch from Supabase, loading from SQLite:', supaErr.message);
        }
    }

    // SQLite query
    return new Promise((resolve, reject) => {
        const query = `SELECT * FROM messages ORDER BY created_at DESC`;
        sqliteDb.all(query, [], (err, rows) => {
            if (err) return reject(err);
            resolve({ source: 'sqlite', messages: rows });
        });
    });
}

/**
 * Mark message as read
 */
async function markMessageAsRead(id) {
    if (supabase) {
        try {
            const { data, error } = await supabase
                .from('messages')
                .update({ status: 'read' })
                .eq('id', id);

            if (!error) return { source: 'supabase', updated: true };
        } catch (supaErr) {
            console.warn('⚠️ Supabase update failed:', supaErr.message);
        }
    }

    return new Promise((resolve, reject) => {
        const query = `UPDATE messages SET status = 'read' WHERE id = ?`;
        sqliteDb.run(query, [id], function (err) {
            if (err) return reject(err);
            resolve({ source: 'sqlite', updated: this.changes > 0 });
        });
    });
}

module.exports = {
    insertMessage,
    getAllMessages,
    markMessageAsRead,
    isSupabaseActive: () => Boolean(supabase)
};
