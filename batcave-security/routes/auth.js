const express = require('express');
const router = express.Router();
const path = require('path')
const db = require('../config/db');
const bcrypt = require('bcrypt');
const session = require('express-session');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');

router.get('/login', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'views', 'login.html'))
})

router.post('/login', async (req, res) => {
    const { username, password } = req.body;
  try {
    const user = db.prepare('SELECT * FROM users WHERE username = ?').get(username);
    if (!user || !(await bcrypt.compare(password, user.password_hash))) {
      return res.status(401).json({ erreur: 'Identifiants incorrects' });
    }

    const token = jwt.sign(
      { id: user.id, username: user.username, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '15s' }
    );

    const refreshToken = crypto.randomBytes(40).toString('hex');
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(); 

    db.prepare('INSERT INTO refresh_tokens (token, user_id, expires_at) VALUES (?, ?, ?)')
      .run(refreshToken, user.id, expiresAt);

    res.cookie('token', token, { httpOnly: true, sameSite: 'strict', maxAge: 15000 });
    res.cookie('refreshToken', refreshToken, { httpOnly: true, sameSite: 'strict', maxAge: 7 * 24 * 60 * 60 * 1000 });

    res.json({ message: 'Connexion réussie.' });
  } catch (error) {
    res.status(500).json({ erreur: 'Erreur serveur' });
  }
})

router.get('/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error(err)
      return res.status(500).send('Erreur lors de la déconnexion')
    }

    res.clearCookie('bat_identity')
    res.redirect('/auth/login')
  })
})

module.exports = router;