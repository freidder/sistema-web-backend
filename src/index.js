require('dotenv').config();
const express = require('express');
const morgan = require('morgan');
const cors = require('cors');

const connectDB = require('./config/db');

const authRoutes = require('./routes/auth');
const projectRoutes = require('./routes/projects');
const errorHandler = require('./middleware/errorHandler');

const app = express();

// Connect DB
connectDB();

// Middlewares
app.use(express.json());
app.use(morgan('dev'));
app.use(cors());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/projects', projectRoutes);

// Servir archivos estáticos de /uploads
const path = require('path');
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Basic health
app.get('/', (req, res) => res.json({ ok: true, env: process.env.NODE_ENV || 'development' }));


if (require.main === module) {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

module.exports = app;

// Central error handler (should be last middleware)
app.use(errorHandler);
