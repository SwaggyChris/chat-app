const express = require('express');
const cors = require('cors');
const bcrypt = require('bcrypt');
const db = require('./database.js');

const app = express();
app.use(cors());
app.use(express.json());

const HTTP_PORT = 8000;

app.listen(HTTP_PORT, () => {
    console.log(`Server running on port ${HTTP_PORT}`);
});

// Signup endpoint
app.post('/api/signup', (req, res, next) => {
    const { username, password } = req.body;
    if (!username || !password) {
        res.status(400).json({ "error": "Username and password are required" });
        return;
    }
    const saltRounds = 10;
    bcrypt.hash(password, saltRounds, (err, hash) => {
        if (err) {
            res.status(500).json({ "error": err.message });
            return;
        }
        const insert = 'INSERT INTO users (username, password) VALUES (?,?)';
        db.run(insert, [username, hash], (err) => {
            if (err) {
                res.status(409).json({ "error": "Username already taken" });
                return;
            }
            res.json({
                "message": "success",
                "data": { "username": username }
            });
        });
    });
});

// Login endpoint
app.post('/api/login', (req, res, next) => {
    const { username, password } = req.body;
    if (!username || !password) {
        res.status(400).json({ "error": "Username and password are required" });
        return;
    }
    const sql = 'SELECT * FROM users WHERE username = ?';
    db.get(sql, [username], (err, row) => {
        if (err) {
            res.status(500).json({ "error": err.message });
            return;
        }
        if (!row) {
            res.status(404).json({ "error": "User not found" });
            return;
        }
        bcrypt.compare(password, row.password, (err, result) => {
            if (err) {
                res.status(500).json({ "error": err.message });
                return;
            }
            if (result) {
                res.json({
                    "message": "success",
                    "data": { "username": row.username }
                });
            } else {
                res.status(401).json({ "error": "Incorrect password" });
            }
        });
    });
});

// Get messages endpoint
app.get('/api/messages', (req, res, next) => {
    const sql = 'SELECT * FROM messages ORDER BY timestamp ASC';
    db.all(sql, [], (err, rows) => {
        if (err) {
            res.status(500).json({ "error": err.message });
            return;
        }
        res.json({
            "message": "success",
            "data": rows
        });
    });
});

// Post message endpoint
app.post('/api/messages', (req, res, next) => {
    const { username, message } = req.body;
    if (!username || !message) {
        res.status(400).json({ "error": "Username and message are required" });
        return;
    }
    const insert = 'INSERT INTO messages (username, message) VALUES (?,?)';
    db.run(insert, [username, message], function (err) {
        if (err) {
            res.status(500).json({ "error": err.message });
            return;
        }
        res.json({
            "message": "success",
            "data": {
                "id": this.lastID,
                "username": username,
                "message": message
            }
        });
    });
});

app.use(function(req, res){
    res.status(404);
});