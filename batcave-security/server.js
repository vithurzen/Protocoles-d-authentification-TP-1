// Import des librairies et de la BDD
const express = require('express')
const bcrypt = require('bcrypt')
const db = require('./db')

// Créé du serveur Express
const app = express()
// Rend possible la lecture et l'écriture du JSON
app.use(express.json())
// Ouvre les fichiers frontend non protégés
app.use(express.static('public'))

// Lance le serveur en local, sur le port 3000
const PORT = 3000
app.listen(PORT, () => {
  console.log(`Serveur démarré sur http://localhost:${PORT}`)
})

app.post('/register', async (req, res) => {
  // Récupère les identifiants saisis par l'utilisateur
  const { username, password } = req.body

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
    res.status(400).send("Erreur : l'utilisateur existe déjà.")
  }
})