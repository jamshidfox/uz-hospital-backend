const jwt = require('jsonwebtoken');
const secretKey = 'hello';

function authorize(req, res, next) {
  const authorizationHeader = req.headers.authorization;
  if (!authorizationHeader) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  const [scheme, token] = authorizationHeader.split(' ');
  if (scheme !== 'Bearer') {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  try {
    const decoded = jwt.verify(token, secretKey);

    req.user = decoded;
    next();
  } catch (error) {
    console.error(error);
    res.status(401).json({ error: 'Unauthorized' });
  }
}
module.exports = { authorize };
