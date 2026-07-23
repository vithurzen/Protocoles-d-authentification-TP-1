const db = require('../config/db')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const { authenticator } = require('@otplib/preset-v11')
const qrcode = require('qrcode')
  
exports.setup2FA = async (req, res) => {
  const username = req.body?.username || req.user.username
  const secret = authenticator.generateSecret()

  const otpauth = authenticator.keyuri(username, 'Secure!', secret)

  db.prepare('UPDATE users SET two_factor_secret = ? WHERE username = ?').run(
    secret,
    username
  )

  const qrCodeImage = await qrcode.toDataURL(otpauth)

  res.json({ qrCode: qrCodeImage, secret: secret })
}

exports.confirm2FA = (req, res) => {
  const { username, code } = req.body
  const user = db
    .prepare('SELECT * FROM users WHERE username = ?')
    .get(username)

  const isValid = authenticator.check(code, user.two_factor_secret)

  if (!isValid) {
    return res
      .status(401)
      .json({ error: 'Code incorrect. Activation avortée.' })
  }

  db.prepare('UPDATE users SET two_factor_enabled = 1 WHERE username = ?').run(
    username
  )
  res.json({
    success: true,
    message: 'La 2FA est désormais activée sur votre compte !'
  })
}

exports.login = async (req, res) => {
  try {
    const { username, password } = req.body
    const user = db
      .prepare('SELECT * FROM users WHERE username = ?')
      .get(username)
    if (!user || !(await bcrypt.compare(password, user.password_hash))) {
      return res.status(401).json({ error: 'Identifiants incorrects' })
    }

    if (user.two_factor_enabled === 0 || !user.two_factor_secret) {
      return res.status(403).json({
        error: 'Accès refusé. La double authentification est obligatoire.'
      })
    }

    if (user.two_factor_enabled === 1) {
      return res.json({
        requires2FA: true,
        message: 'Étape 1 validée. Veuillez fournir votre code à 6 chiffres.',
        username: user.username
      })
    }
  } catch (error) {
    console.error('Erreur lors du login :', error)
    return res.status(500).json({ error: 'Erreur interne du serveur' })
  }
}