const express = require('express');
const router = express.Router();
const checkAuth = require('../middlewares/checkAuth');

router.get('/', checkAuth, (req, res) => {
  const {id, username} = req.user
  res.json({id, username})
})

module.exports = router;