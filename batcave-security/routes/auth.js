const express = require('express');
const router = express.Router();
const path = require('path')
const db = require('../config/db');
const bcrypt = require('bcrypt');
const session = require('express-session');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const checkJWT = require('../middlewares/authCheck');
const authController = require('../controllers/authController');

router.post('/setup-2fa', checkJWT, authController.setup2FA);

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
      { expiresIn: '15m' }
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

router.post('/refresh', (req, res) => {
  const refreshToken = req.headers.cookie?.split(';').find(c => c.trim().startsWith('refreshToken='))?.split('=')[1];
  if (!refreshToken) return res.status(401).json({ erreur: 'Accès refusé' });

  const storedToken = db.prepare('SELECT * FROM refresh_tokens WHERE token = ?').get(refreshToken);
  
  if (!storedToken || new Date() > new Date(storedToken?.expires_at)) {
    return res.status(401).json({ erreur: 'Session expirée, reconnectez-vous' });
  }

  const user = db.prepare('SELECT * FROM users WHERE id = ?').get(storedToken.user_id);
  const newToken = jwt.sign(
    { id: user.id, username: user.username, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: '15m' }
  );

  res.cookie('token', newToken, { httpOnly: true, sameSite: 'strict', maxAge: 15000 });
  res.json({ message: 'Jeton d\'accès rafraîchi.' });
});

router.post('/logout', (req, res) => {
  const refreshToken = req.headers.cookie?.split(';').find(c => c.trim().startsWith('refreshToken='))?.split('=')[1];
  
  if (refreshToken) {
    db.prepare('DELETE FROM refresh_tokens WHERE token = ?').run(refreshToken);
  }

  res.clearCookie('token');
  res.clearCookie('refreshToken');
  res.json({ message: 'Déconnexion et révocation réussies.' });
});

router.post('/change-password', checkJWT, async (req, res) => {
  const { oldPassword, newPassword } = req.body;

  if (!oldPassword || !newPassword) {
    return res.status(400).json({ erreur: 'Ancien et nouveau mots de passe requis' });
  }

  const strongPasswordRegex =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9\s]).{12,}$/;

  if (!strongPasswordRegex.test(newPassword)) {
    return res.status(400).json({
      erreur:
        'Le nouveau mot de passe doit contenir au moins 12 caractères, une majuscule, une minuscule, un chiffre et un caractère spécial'
    });
  }

   try {
    const user = db
      .prepare(`
        SELECT id, password_hash
        FROM users
        WHERE id = ?
      `)
      .get(req.user.id);

    if (!user) {
      return res.status(404).json({
        erreur: 'Utilisateur introuvable'
      });
    }

    const oldPasswordIsValid = await bcrypt.compare(
      oldPassword,
      user.password_hash
    );

    if (!oldPasswordIsValid) {
      return res.status(401).json({
        erreur: 'Ancien mot de passe incorrect'
      });
    }

    const newPasswordHash = await bcrypt.hash(newPassword, 12);

    const result = db
      .prepare(`
        UPDATE users
        SET password_hash = ?
        WHERE id = ?
      `)
      .run(newPasswordHash, req.user.id);

    return res.json({
      message: 'Mot de passe modifié avec succès'
    });
  } catch (error) {
    console.error('Erreur changement mot de passe :', error);

    return res.status(500).json({
      erreur: 'Erreur serveur'
    });
  }
});

module.exports = router;