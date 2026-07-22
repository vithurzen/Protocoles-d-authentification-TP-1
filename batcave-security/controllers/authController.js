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