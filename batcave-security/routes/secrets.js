const express = require('express');
const router = express.Router();
const checkAuth = require('../middlewares/checkAuth');
const checkJWT = require('../middlewares/authCheck');

router.get('/', checkJWT, (req, res) => {
  const gadgets = [
    {
      "name": "Batarang",
      "desc": "Arme de jet",
      "icon": "fa-shuriken"
    },
    {
      "name": "Grapnel Gun",
      "desc": "Pistolet-grappin pour se déplacer rapidement",
      "icon": "fa-anchor"
    },
    {
      "name": "Smoke Bomb",
      "desc": "Bombe fumigène pour disparaître discrètement",
      "icon": "fa-cloud"
    }
  ]
  res.json(gadgets)
})

module.exports = router;