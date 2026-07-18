const jwt = require('jsonwebtoken');

function checkJWT(req, res, next) {
  const cookieHeader = req.headers.cookie;
  if (!cookieHeader) {
    return res.status(401).json({ erreur: 'Accès refusé. Aucun jeton fourni.' });
  }

  const tokenCookie = cookieHeader.split(';').find(c => c.trim().startsWith('token='));
  if (!tokenCookie) {
    return res.status(401).json({ erreur: 'Accès refusé. Jeton introuvable.' 
  })};

  const token = tokenCookie.split('=')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ erreur: 'Jeton invalide ou expiré.' });
  }
}

module.exports = checkJWT;