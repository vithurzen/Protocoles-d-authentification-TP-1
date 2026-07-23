const db = require('../config/db')

// Sauvegarde la session OAuth temporaire (Anti-CSRF et PKCE)
function saveOAuthSession (state, codeVerifier) {
  const statement = db.prepare(`
        INSERT INTO oauth_sessions (state, code_verifier) 
        VALUES (?, ?)
    `)
  return statement.run(state, codeVerifier)
}

// Récupère les informations de session liées au 'state'
function getOAuthSession (state) {
  const statement = db.prepare(`SELECT code_verifier FROM oauth_sessions WHERE state = ?`)
  return statement.get(state)
}

// Supprime la session OAuth une fois qu'elle a été consommée
function deleteOAuthSession (state) {
  const statement = db.prepare(`DELETE FROM oauth_sessions WHERE state = ?`)
  return statement.run(state)
}

// Enregistre l'utilisateur s'il n'existe pas, ou met à jour ses données (Upsert)
// Reçoit le payload extrait de l'ID Token d'OpenID Connect
function upsertUser (userProfile) {
  const statement = db.prepare(`
        INSERT INTO users (id, email, name, provider) 
        VALUES (?, ?, ?, 'google')
        ON CONFLICT(id) DO UPDATE SET 
            name = excluded.name, 
            email = excluded.email
    `)
  return statement.run(userProfile.sub, userProfile.email, userProfile.name)
}

module.exports = {
  saveOAuthSession,
  getOAuthSession,
  deleteOAuthSession,
  upsertUser
}