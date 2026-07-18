const express = require('express');
const router = express.Router();
const checkAuth = require('../middlewares/checkAuth');
const db = require('../config/db');
const checkJWT = require('../middlewares/authCheck');

router.post('/', checkJWT, (req, res) => {
  const {note} = req.body
  if (!note) {
    return res.status(400).send('Le champ "note" est requis.')
  }

  const result = db.prepare('INSERT INTO reports (user_id, note) VALUES (?, ?)').run(req.user.id, note)
  res.status(201).json({
    message: 'Rapport enregistré avec succès',
    report: {
      id: result.lastInsertRowid,
      user_id: req.user.id,
      note
    }
  })
} )

module.exports = router;