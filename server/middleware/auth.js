import jwt from 'jsonwebtoken';

export const auth = (req, res, next) => {
  try {
    // Extrae el token del header "Authorization"
    const token = req.header('Authorization').replace('Bearer ', '');
    const decoded = jwt.verify(token, 'your-secret-key');
    // Añade el usuario decodificado al request
    req.user = decoded;
    next(); // Continúa con la siguiente función middleware/ruta
  } catch (error) {
    res.status(401).json({ success: false, message: 'Please authenticate' });
  }
};