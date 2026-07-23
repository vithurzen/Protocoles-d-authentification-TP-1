const cryptoService = require('../services/cryptoService')
const oauthService = require('../services/oauthService')
const userModel = require('../models/userModel')

async function redirectToGoogle (req, res) {
  const state = cryptoService.generateState()
  const codeVerifier = cryptoService.generateCodeVerifier()
  const codeChallenge = cryptoService.generateCodeChallenge(codeVerifier)

  // Persistance temporaire de la session PKCE
  userModel.saveOAuthSession(state, codeVerifier)

  // Construction de l'URL via le service dédié
  const authUrl = oauthService.getGoogleAuthUrl(state, codeChallenge)

  res.redirect(authUrl)
}

async function handleGoogleCallback (req, res) {
  const { code, state } = req.query
  const session = userModel.getOAuthSession(state)
  if (!session) {
    return res.status(403).send('Invalid state token. Access Denied.')
  }
  userModel.deleteOAuthSession(state)

  try {
    const tokens = await oauthService.exchangeCodeForTokens(
      code,
      session.code_verifier
    )

    const userProfile = oauthService.decodeIdToken(tokens.id_token)
    userModel.upsertUser(userProfile)

    req.session.userId = userProfile.sub // On stocke l'ID unique Google
    req.session.userName = userProfile.name
    req.session.userEmail = userProfile.email

    res.redirect('/dashboard')
  } catch (error) {
    console.error(error)
    res.status(500).send('Authentication workflow failed.')
  }
}

// Renvoie le profil stocké dans la session (401 si non connecté)
function getMe (req, res) {
  if (!req.session.userId) {
    return res.status(401).json({ error: 'Non authentifié' })
  }
  res.json({
    id: req.session.userId,
    name: req.session.userName,
    email: req.session.userEmail
  })
}

// Détruit la session côté serveur et supprime le cookie
function logout (req, res) {
  req.session.destroy(() => {
    res.clearCookie('bat_identity')
    res.json({ message: 'Déconnexion réussie.' })
  })
}

module.exports = {
  redirectToGoogle,
  handleGoogleCallback,
  getMe,
  logout
}