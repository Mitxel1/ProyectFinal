const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    // Validar que la URI esté presente
    if (!process.env.MONGO_URI) {
      throw new Error('MONGO_URI no está definida en las variables de entorno');
    }

    // Configuración de conexión compatible
    const options = {
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
      retryWrites: true,
      w: 'majority'
    };

    await mongoose.connect(process.env.MONGO_URI, options);
    
    console.log('✅ MongoDB conectado correctamente...');
    console.log(`📊 Base de datos: ${mongoose.connection.name}`);
    console.log(`🌐 Host: ${mongoose.connection.host}:${mongoose.connection.port}`);
    
  } catch (err) {
    console.error('❌ Error de conexión:', err.message);
    
    // Log más detallado en desarrollo
    if (process.env.NODE_ENV === 'development') {
      console.error('Detalles del error:', err);
    }
    
    process.exit(1);
  }
};

// Event listeners para monitorear la conexión
mongoose.connection.on('connected', () => {
  console.log('🔗 Mongoose conectado a MongoDB');
});

mongoose.connection.on('error', err => {
  console.error('❌ Error de conexión MongoDB:', err);
});

mongoose.connection.on('disconnected', () => {
  console.log('🔌 Mongoose desconectado de MongoDB');
});

// Manejo elegante del cierre de la aplicación
process.on('SIGINT', async () => {
  try {
    await mongoose.connection.close();
    console.log('🔌 Conexión MongoDB cerrada por terminación de la aplicación');
    process.exit(0);
  } catch (err) {
    console.error('Error al cerrar la conexión:', err);
    process.exit(1);
  }
});

module.exports = connectDB;