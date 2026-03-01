import Database from 'better-sqlite3';
import path from 'path';

const DB_PATH = path.join(process.cwd(), 'mathdb.sqlite');

let db;

function getDb() {
    if (!db) {
        db = new Database(DB_PATH);
        db.pragma('journal_mode = WAL');
        db.pragma('foreign_keys = ON');
        initSchema();
    }
    return db;
}

function initSchema() {
    db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      coins INTEGER DEFAULT 100,
      streak INTEGER DEFAULT 0,
      last_active TEXT,
      rank TEXT DEFAULT 'Beginner',
      created_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS solutions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER,
      problem TEXT NOT NULL,
      final_answer TEXT,
      topic TEXT,
      steps_json TEXT,
      solved_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (user_id) REFERENCES users(id)
    );

    CREATE TABLE IF NOT EXISTS saved_problems (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      problem TEXT NOT NULL,
      solution_json TEXT,
      saved_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (user_id) REFERENCES users(id)
    );

    CREATE TABLE IF NOT EXISTS quiz_sessions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER,
      topic TEXT,
      score INTEGER DEFAULT 0,
      total INTEGER DEFAULT 0,
      completed_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (user_id) REFERENCES users(id)
    );

    CREATE TABLE IF NOT EXISTS proficiency (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      topic TEXT NOT NULL,
      score INTEGER DEFAULT 50,
      updated_at TEXT DEFAULT (datetime('now')),
      UNIQUE(user_id, topic),
      FOREIGN KEY (user_id) REFERENCES users(id)
    );

    CREATE TABLE IF NOT EXISTS daily_challenges (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      topic TEXT NOT NULL,
      problem TEXT NOT NULL,
      difficulty TEXT NOT NULL,
      reward_coins INTEGER DEFAULT 50,
      challenge_date TEXT DEFAULT (date('now'))
    );
  `);

    // Seed daily challenges if empty
    const count = db.prepare('SELECT COUNT(*) as c FROM daily_challenges').get();
    if (count.c === 0) {
        const seedChallenges = [
            { topic: 'Calculus', problem: '∫ (x² + 1)/(x³ - x) dx', difficulty: 'Hard', reward_coins: 75 },
            { topic: 'Algebra', problem: 'Solve: x⁴ - 5x² + 4 = 0', difficulty: 'Medium', reward_coins: 50 },
            { topic: 'Probability', problem: 'P(A∪B) if P(A)=0.4, P(B)=0.3, P(A∩B)=0.1', difficulty: 'Medium', reward_coins: 40 },
            { topic: 'Calculus', problem: 'Find lim(x→0) [sin(3x) / (2x)]', difficulty: 'Medium', reward_coins: 45 },
            { topic: 'Algebra', problem: 'Find all complex roots of z³ + 8 = 0', difficulty: 'Hard', reward_coins: 60 },
            { topic: 'Geometry', problem: 'Find the area of a regular hexagon with side 6', difficulty: 'Medium', reward_coins: 40 },
            { topic: 'Calculus', problem: 'Find the derivative of f(x) = x^x', difficulty: 'Hard', reward_coins: 70 },
        ];
        const insert = db.prepare('INSERT INTO daily_challenges (topic, problem, difficulty, reward_coins) VALUES (?, ?, ?, ?)');
        for (const ch of seedChallenges) {
            insert.run(ch.topic, ch.problem, ch.difficulty, ch.reward_coins);
        }
    }
}

export default getDb;
