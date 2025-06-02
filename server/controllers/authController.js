import { User } from '../models/User.js';

export const authController = {
  login: async (req, res) => {
    try {
      const { email, password } = req.body;
      const user = await User.findOne({ email });
      
      // Verifica credenciales
      if (user && user.password === password) {
        const token = user.generateToken(); // Genera JWT
        res.json({ 
          success: true, 
          message: 'Login successful',
          token,
          userId: user._id
        });
      } else {
        res.status(401).json({ success: false, message: 'Invalid credentials' });
      }
    } catch (error) {
      res.status(500).json({ success: false, message: 'Server error' });
    }
  }
};