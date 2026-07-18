const express = require('express');
const router = express.Router();
const checkAuth = require('../middlewares/checkAuth');
const checkJWT = require('../middlewares/authCheck');

router.get('/', checkJWT, (req, res) => {
  const {id, username} = req.user
  res.json({id, username})
})

module.exports = router;