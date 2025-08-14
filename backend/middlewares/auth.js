const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const mongoose = require('mongoose');

// Validar variable de entorno al cargar
const JWT_SECRET = process.env.JWT_SECRET?.trim();
if (!JWT_SECRET) {
  console.error('❌ Fatal: JWT_SECRET no configurado');
  process.exit(1);
}
module.exports = async (req, res, next) => {
  console.log('Validando token para ruta:', req.path);
  
  const token = req.cookies?.token || 
               req.header('Authorization')?.replace('Bearer ', '');
  
  if (!token) {
    console.log('No se proporcionó token');
    return res.status(401).json({ success: false, message: 'Token requerido' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log('Token válido para usuario:', decoded.id);
    
    req.user = decoded;
    next();
  } catch (err) {
    console.error('Error validando token:', err.message);
    return res.status(401).json({ success: false, message: 'Token inválido' });
  }
};

module.exports = (req, res, next) => {
  // Configurar cabeceras de seguridad
  res.header('X-Content-Type-Options', 'nosniff');
  res.header('X-Frame-Options', 'DENY');
  
  // Excluir rutas públicas
  if (req.path === '/refresh' && req.method === 'POST') {
    return next();
  }

  // Obtener token de múltiples fuentes
  const token = req.cookies?.token || 
                req.header('Authorization')?.replace('Bearer ', '') || 
                req.query?.token;

  // Logging detallado
  console.debug('🔍 Authentication check:', {
    path: req.path,
    method: req.method,
    hasToken: !!token,
    source: token ? 
      (req.cookies?.token ? 'cookie' : 
       req.header('Authorization') ? 'header' : 'query') : 'none'
  });

  if (!token) {
    console.warn('⛔ No token provided for protected route:', req.path);
    return res.status(401).json({ 
      success: false,
      code: 'MISSING_TOKEN',
      msg: 'Token de autenticación requerido' 
    });
  }

  try {
    // Validación básica de estructura del token
    if (typeof token !== 'string' || token.split('.').length !== 3) {
      throw new jwt.JsonWebTokenError('Token malformado');
    }

    // Verificación manual de la firma primero
    const tokenParts = token.split('.');
    const signature = tokenParts[2];
    const unsignedToken = `${tokenParts[0]}.${tokenParts[1]}`;
    
    const expectedSignature = crypto
      .createHmac('sha256', JWT_SECRET)
      .update(unsignedToken)
      .digest('base64url');

    if (!crypto.timingSafeEqual(
      Buffer.from(signature), 
      Buffer.from(expectedSignature)
    )) {
      throw new jwt.JsonWebTokenError('Firma inválida');
    }

    // Verificación completa del token
    const decoded = jwt.verify(token, JWT_SECRET);
    
    // Validación del payload
    if (!decoded.id || !decoded.role) {
      throw new jwt.JsonWebTokenError('Payload del token inválido');
    }

    console.debug('🔓 Token decoded:', {
      id: decoded.id,
      role: decoded.role,
      exp: new Date(decoded.exp * 1000).toISOString()
    });

    // Adjuntar usuario al request
    req.user = {
      _id: decoded.id,
      id: decoded.id,
      role: decoded.role,
      ...(decoded.additionalData || {})
    };

    next();
  } catch (err) {
    console.error('❌ Token verification failed:', {
      name: err.name,
      message: err.message,
      expiredAt: err.expiredAt,
      tokenPreview: token.substring(0, 8) + '...'
    });

    // Limpiar cookie si existe
    res.clearCookie('token', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict'
    });

    const response = {
      success: false,
      code: err.name === 'TokenExpiredError' ? 'TOKEN_EXPIRED' : 
            err.name === 'JsonWebTokenError' ? 'INVALID_TOKEN' : 'AUTH_ERROR',
      msg: err.name === 'TokenExpiredError' ? 'Token expirado' : 
           err.name === 'JsonWebTokenError' ? 'Token inválido' : 'Error de autenticación'
    };

    return res.status(401).json(response);
  }
};