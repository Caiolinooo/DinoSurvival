const initSqlJs = require('sql.js');
let db = null;

async function initDatabase() {
    const SQL = await initSqlJs();
    db = new SQL.Database();

    db.run(`CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        created_at TEXT DEFAULT (datetime('now')),
        last_login TEXT,
        total_play_time REAL DEFAULT 0,
        is_banned INTEGER DEFAULT 0,
        ban_reason TEXT,
        is_admin INTEGER DEFAULT 0
    )`);

    db.run(`CREATE TABLE IF NOT EXISTS sessions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        token TEXT UNIQUE NOT NULL,
        ip_address TEXT,
        created_at TEXT DEFAULT (datetime('now')),
        expires_at TEXT NOT NULL,
        is_active INTEGER DEFAULT 1,
        FOREIGN KEY (user_id) REFERENCES users(id)
    )`);

    db.run(`CREATE TABLE IF NOT EXISTS players (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        player_name TEXT NOT NULL,
        current_dino_id TEXT,
        is_online INTEGER DEFAULT 0,
        created_at TEXT DEFAULT (datetime('now')),
        last_active TEXT,
        total_play_time REAL DEFAULT 0,
        total_kills INTEGER DEFAULT 0,
        total_deaths INTEGER DEFAULT 0,
        FOREIGN KEY (user_id) REFERENCES users(id)
    )`);

    db.run(`CREATE TABLE IF NOT EXISTS dinosaur_instances (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        player_id INTEGER,
        user_id INTEGER NOT NULL,
        dinosaur_id TEXT NOT NULL,
        dino_name TEXT,
        health REAL,
        max_health REAL,
        stamina REAL,
        max_stamina REAL,
        hunger REAL,
        max_hunger REAL,
        thirst REAL,
        max_thirst REAL,
        growth_stage TEXT DEFAULT 'adult',
        experience REAL DEFAULT 0,
        level INTEGER DEFAULT 1,
        kills INTEGER DEFAULT 0,
        deaths INTEGER DEFAULT 0,
        is_alive INTEGER DEFAULT 1,
        death_cause TEXT,
        killed_by TEXT,
        position_x REAL,
        position_z REAL,
        time_alive REAL DEFAULT 0,
        created_at TEXT DEFAULT (datetime('now')),
        died_at TEXT,
        updated_at TEXT DEFAULT (datetime('now')),
        FOREIGN KEY (player_id) REFERENCES players(id),
        FOREIGN KEY (user_id) REFERENCES users(id)
    )`);

    db.run(`CREATE TABLE IF NOT EXISTS dino_events (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        dino_instance_id INTEGER,
        event_type TEXT NOT NULL,
        event_data TEXT,
        position_x REAL,
        position_z REAL,
        timestamp TEXT DEFAULT (datetime('now')),
        FOREIGN KEY (dino_instance_id) REFERENCES dinosaur_instances(id)
    )`);

    db.run(`CREATE TABLE IF NOT EXISTS eggs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        mother_instance_id INTEGER,
        father_instance_id INTEGER,
        egg_code TEXT UNIQUE NOT NULL,
        position_x REAL,
        position_z REAL,
        incubation_progress REAL DEFAULT 0,
        genetics TEXT,
        is_hatched INTEGER DEFAULT 0,
        hatched_by INTEGER,
        created_at TEXT DEFAULT (datetime('now')),
        hatched_at TEXT,
        FOREIGN KEY (mother_instance_id) REFERENCES dinosaur_instances(id),
        FOREIGN KEY (father_instance_id) REFERENCES dinosaur_instances(id)
    )`);

    db.run(`CREATE TABLE IF NOT EXISTS mutations (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        dino_instance_id INTEGER,
        mutation_id TEXT NOT NULL,
        slot_number INTEGER CHECK(slot_number >= 0 AND slot_number <= 15),
        is_active INTEGER DEFAULT 1,
        unlocked_at TEXT DEFAULT (datetime('now')),
        FOREIGN KEY (user_id) REFERENCES users(id),
        FOREIGN KEY (dino_instance_id) REFERENCES dinosaur_instances(id)
    )`);

    db.run(`CREATE TABLE IF NOT EXISTS nests (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        owner_instance_id INTEGER,
        owner_id INTEGER,
        position_x REAL,
        position_z REAL,
        egg_count INTEGER DEFAULT 0,
        max_eggs INTEGER DEFAULT 5,
        is_active INTEGER DEFAULT 1,
        created_at TEXT DEFAULT (datetime('now')),
        abandoned_at TEXT,
        FOREIGN KEY (owner_instance_id) REFERENCES dinosaur_instances(id)
    )`);

    db.run(`CREATE TABLE IF NOT EXISTS tribes (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT UNIQUE NOT NULL,
        tag TEXT UNIQUE NOT NULL,
        description TEXT,
        owner_id INTEGER NOT NULL,
        created_at TEXT DEFAULT (datetime('now')),
        max_members INTEGER DEFAULT 30,
        total_members INTEGER DEFAULT 1,
        FOREIGN KEY (owner_id) REFERENCES users(id)
    )`);

    db.run(`CREATE TABLE IF NOT EXISTS tribe_members (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        tribe_id INTEGER NOT NULL,
        user_id INTEGER NOT NULL,
        role TEXT DEFAULT 'member' CHECK(role IN ('leader','admin','member')),
        joined_at TEXT DEFAULT (datetime('now')),
        FOREIGN KEY (tribe_id) REFERENCES tribes(id),
        FOREIGN KEY (user_id) REFERENCES users(id)
    )`);

    db.run(`CREATE TABLE IF NOT EXISTS world_state (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        state_key TEXT UNIQUE NOT NULL,
        state_value TEXT,
        updated_at TEXT DEFAULT (datetime('now'))
    )`);

    db.run(`CREATE TABLE IF NOT EXISTS plants (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        plant_type TEXT NOT NULL,
        biome TEXT,
        position_x REAL,
        position_z REAL,
        growth_stage REAL DEFAULT 0,
        is_harvested INTEGER DEFAULT 0,
        harvest_count INTEGER DEFAULT 0,
        max_harvests INTEGER DEFAULT 5,
        respawn_time INTEGER DEFAULT 300,
        created_at TEXT DEFAULT (datetime('now')),
        last_harvested TEXT
    )`);

    db.run(`CREATE TABLE IF NOT EXISTS animals (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        animal_type TEXT NOT NULL,
        health REAL DEFAULT 100,
        max_health REAL DEFAULT 100,
        is_alive INTEGER DEFAULT 1,
        is_tamed INTEGER DEFAULT 0,
        tamed_by INTEGER,
        position_x REAL,
        position_y REAL,
        position_z REAL,
        biome TEXT,
        behavior_state TEXT DEFAULT 'idle',
        created_at TEXT DEFAULT (datetime('now')),
        FOREIGN KEY (tamed_by) REFERENCES users(id)
    )`);

    db.run(`CREATE TABLE IF NOT EXISTS chat_log (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        player_id INTEGER,
        message TEXT NOT NULL,
        channel TEXT DEFAULT 'global' CHECK(channel IN ('global','tribe','local')),
        timestamp TEXT DEFAULT (datetime('now'))
    )`);

    console.log('Database initialized with all tables');
    return db;
}

function getDb() {
    return db;
}

function saveDb() {
    if (db) {
        const data = db.export();
        const buffer = Buffer.from(data);
        require('fs').writeFileSync('dinosurvival.db', buffer);
    }
}

// Auto-save every 30 seconds
setInterval(saveDb, 30000);

process.on('SIGINT', () => { saveDb(); process.exit(); });
process.on('SIGTERM', () => { saveDb(); process.exit(); });

module.exports = { initDatabase, getDb, saveDb };
