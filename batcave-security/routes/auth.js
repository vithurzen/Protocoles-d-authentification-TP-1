const express = require('express');
const router = express.Router();
const path = require('path')
const db = require('../config/db');
const bcrypt = require('bcrypt');
const session = require('express-session');

router.get('/login', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'views', 'login.html'))
})

router.post('/login', async (req, res) => {
  const { username, password } = req.body

  if (!username || !password) {
    return res.status(400).send('Nom d’utilisateur et mot de passe requis')
  }

  const user = db
    .prepare('SELECT * FROM users WHERE username = ?')
    .get(username)

  if (!user) {
    return res.status(401).send('Identifiants invalides')
  }

  const passwordIsValid = await bcrypt.compare(password, user.password_hash)

  if (!passwordIsValid) {
    return res.status(401).send('Identifiants invalides')
  }

  req.session.regenerate((err) => {
    if (err) {
      console.error(err)
      return res.status(500).send('Erreur lors de la création de session')
    }

    req.session.user = {
      id: user.id,
      username: user.username
    }

    req.session.save((err) => {
      if (err) {
        console.error(err)
        return res.status(500).send('Erreur lors de la sauvegarde de session')
      }

      res.redirect('/bat-computer')
    })
  })
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