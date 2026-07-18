// Import des librairies et de la BDD
const express = require('express')
const bcrypt = require('bcrypt')
const db = require('./config/db')
const authRouter = require('./routes/auth')
const batComputerRouter = require('./routes/batComputer')
const secretsRouter = require('./routes/secrets')
const reportsRouter = require('./routes/reports')
const meRouter = require('./routes/me')
const registerRouter = require('./routes/register')
const session = require('express-session')
const dashboardRouter = require('./routes/dashboard')
require('dotenv').config()


// Créé du serveur Express
const app = express()
// Rend possible la lecture et l'écriture du JSON
app.use(express.json())
// Ouvre les fichiers frontend non protégés
app.use(express.static('public'))

// Lance le serveur en local, sur le port 3000
const PORT = 3000


app.use(express.urlencoded({ extended: true }))

app.use(
  session({
    name: 'bat_identity', // Nom du cookie
    secret: process.env.SESSION_SECRET, // Clé pour chiffrer le cookie
    resave: false, // Ne sauvegarde que si la session change
    saveUninitialized: false, // Pas de session vide pour les anonymes
    cookie: {
      httpOnly: true,
      sameSite: 'strict',
      maxAge: 1800000 // Expiration en millisecondes (1h)
    }
  })
)

app.use('/auth', authRouter);
app.use('/bat-computer', batComputerRouter);
app.use('/api/secrets', secretsRouter);
app.use('/api/reports', reportsRouter);
app.use('/api/me', meRouter);
app.use('/register', registerRouter);
app.use('/dashboard', dashboardRouter);


app.listen(PORT, () => {
  console.log(`Serveur démarré sur http://localhost:${PORT}`)
})