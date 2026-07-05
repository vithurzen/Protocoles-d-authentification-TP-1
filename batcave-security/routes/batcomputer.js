const express = require('express');
const router = express.Router();
const checkAuth = require('../middlewares/checkAuth');
const path = require('path')

router.get('/', checkAuth, (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'private', 'bat-computer.html'))
})

module.exports = router;