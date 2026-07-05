const express = require('express');
const router = express.Router();

router.post('/', async (req, res) => {
  // Récupère les identifiants saisis par l'utilisateur
  const { username, password } = req.body
  username.trim()

  if (password.length < 8) {
    return res.status(400).send('Le mot de passe doit contenir au moins 8 caractères.')
  }


  // Hachage du mot de passe avant stockage !
  const hash = await bcrypt.hash(password, 10)

  try {
    // Requête SQL pour insérer le nouvel utilisateur en base
    const insert = db.prepare(
      'INSERT INTO users (username, password_hash) VALUES (?, ?)'
    )
    insert.run(username, hash)
    res.status(201).send('Utilisateur créé avec succès !')
  } catch (err) {
    if (err.code === 'SQLITE_CONSTRAINT_UNIQUE') {
      return res.status(409).send("Ce nom d'utilisateur est déjà utilisé.")
    }
    res.status(500).send('Erreur interne du serveur.')
  }
})

module.exports = router;