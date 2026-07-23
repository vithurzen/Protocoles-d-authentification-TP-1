const express = require('express');
const router = express.Router();
const path = require('path')

router.get('/', (req, res) => {
   // Zone protégée : session OAuth obligatoire
   if (!req.session.userId) {
      return res.redirect('/')
   }
   res.sendFile(path.join(__dirname, '..', 'views', 'dashboard.html'))
})

module.exports = router;