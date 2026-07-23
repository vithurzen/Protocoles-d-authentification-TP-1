const express = require('express')
const router = express.Router()
const authController = require('../controllers/authController')

router.get('/login/google', authController.redirectToGoogle)
router.get('/callback/google', authController.handleGoogleCallback)
router.get('/me', authController.getMe)
router.post('/logout', authController.logout)

module.exports = router