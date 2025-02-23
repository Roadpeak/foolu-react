const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/db');

const router = express.Router();

router.post('/signup', async (req, res) => {
    const { name, username, email, password, role } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = { name, username, email, password: hashedPassword, role: role || 'viewer' }; 

    const query = 'INSERT INTO foolu_users (foolu_name, foolu_username, foolu_email, foolu_pass, foolu_role) VALUES (?, ?, ?, ?, ?)';
    db.query(query, [user.name, user.username, user.email, user.password, user.role], (err, result) => {
        if (err) {
            console.error('Error inserting user into the database:', err);
            return res.status(500).send('Error registering user');
        }
        res.status(201).send('User registered successfully');
    });
});

router.post('/signin', async (req, res) => {
    const { username, password } = req.body;

    const query = 'SELECT * FROM foolu_users WHERE foolu_username = ?';
    db.query(query, [username], async (err, results) => {
        if (err) {
            console.error('Error fetching user from the database:', err);
            return res.status(500).send('Error signing in');
        }
        if (results.length === 0) {
            return res.status(400).send('User not found');
        }

        const user = results[0];
        const isPasswordValid = await bcrypt.compare(password, user.foolu_pass);
        if (!isPasswordValid) {
            return res.status(400).send('Invalid password');
        }

        const token = jwt.sign({ email: user.foolu_email, role: user.foolu_role }, process.env.SECRET_KEY, { expiresIn: '1h' });
        res.send({ token });
    });
});

module.exports = router;
