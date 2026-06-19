const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { getDb } = require('./database');

const JWT_SECRET = process.env.JWT_SECRET || 'DinoSurvival_JWT_Secret_2024_SecureKey!';
const JWT_EXPIRES = '24h';
const SALT_ROUNDS = 10;

async function register(username, email, password) {
    const db = getDb();
    if (!db) throw new Error('Database not initialized');

    const existing = db.exec(`SELECT id FROM users WHERE username = ? OR email = ?`, { bind: [username, email] });
    if (existing.length > 0 && existing[0].values.length > 0) {
        throw new Error('Usuário ou email já cadastrado');
    }

    const hash = await bcrypt.hash(password, SALT_ROUNDS);
    db.run(`INSERT INTO users (username, email, password_hash) VALUES (?, ?, ?)`, { bind: [username, email, hash] });
    const result = db.exec(`SELECT id FROM users WHERE username = ?`, { bind: [username] });
    const userId = result[0].values[0][0];

    const token = jwt.sign({ userId, username }, JWT_SECRET, { expiresIn: JWT_EXPIRES });
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
    db.run(`INSERT INTO sessions (user_id, token, expires_at) VALUES (?, ?, ?)`, { bind: [userId, token, expiresAt] });

    return { userId, username, token };
}

async function login(username, password) {
    const db = getDb();
    if (!db) throw new Error('Database not initialized');

    const result = db.exec(`SELECT id, username, password_hash, is_banned, ban_reason FROM users WHERE username = ?`, { bind: [username] });
    if (result.length === 0 || result[0].values.length === 0) {
        throw new Error('Usuário ou senha inválidos');
    }

    const row = result[0].values[0];
    const userId = row[0];
    const dbUsername = row[1];
    const hash = row[2];
    const isBanned = row[3];
    const banReason = row[4];

    if (isBanned) {
        throw new Error(`Conta banida: ${banReason || 'Sem motivo'}`);
    }

    const match = await bcrypt.compare(password, hash);
    if (!match) {
        throw new Error('Usuário ou senha inválidos');
    }

    const token = jwt.sign({ userId, username: dbUsername }, JWT_SECRET, { expiresIn: JWT_EXPIRES });
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
    db.run(`INSERT INTO sessions (user_id, token, expires_at) VALUES (?, ?, ?)`, { bind: [userId, token, expiresAt] });
    db.run(`UPDATE users SET last_login = datetime('now') WHERE id = ?`, { bind: [userId] });

    return { userId, username: dbUsername, token };
}

function verifyToken(token) {
    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        const db = getDb();
        if (!db) return null;
        const result = db.exec(`SELECT id FROM sessions WHERE token = ? AND is_active = 1 AND expires_at > datetime('now')`, { bind: [token] });
        if (result.length === 0 || result[0].values.length === 0) return null;
        return decoded;
    } catch (e) {
        return null;
    }
}

function logout(token) {
    const db = getDb();
    if (!db) return;
    db.run(`UPDATE sessions SET is_active = 0 WHERE token = ?`, { bind: [token] });
}

module.exports = { register, login, verifyToken, logout, JWT_SECRET };
