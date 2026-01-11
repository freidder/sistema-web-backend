const express = require('express');
const router = express.Router();
const { body, param } = require('express-validator');
const multer = require('multer');
const path = require('path');
const Project = require('../models/Project');
const auth = require('../middleware/auth');
const checkRole = require('../middleware/roles');
const validate = require('../middleware/validate');
// Configuración de multer para fotos
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, '../../uploads'));
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname);
    const name = `${Date.now()}-${Math.round(Math.random()*1e9)}${ext}`;
    cb(null, name);
  }
});

const uploadPhoto = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    if (!file.mimetype.match(/^image\/(jpeg|png)$/)) {
      return cb(new Error('Solo se permiten imágenes JPEG o PNG'));
    }
    cb(null, true);
  }
});
// Endpoint para subir foto a proyecto
router.post('/:id/photos', auth, uploadPhoto.single('photo'), async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ message: 'Not found' });
    if (!req.file) return res.status(400).json({ message: 'No file uploaded' });
    // Guardar ruta relativa
    const relPath = `uploads/${req.file.filename}`;
    project.photos.push(relPath);
    await project.save();
    res.json({ message: 'Photo uploaded', path: relPath, project });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message || 'Server error' });
  }
});



// Create project (any authenticated user)
router.post(
  '/',
  auth,
  [
    body('client').trim().notEmpty().withMessage('Client is required'),
    body('address').trim().notEmpty().withMessage('Address is required'),
    body('sidingType').trim().notEmpty().withMessage('Siding type is required'),
    body('area').isFloat({ gt: 0 }).withMessage('Area must be a number > 0'),
    body('price').isFloat({ gt: -1 }).withMessage('Price must be a number >= 0'),
    body('status').optional().isIn(['pending', 'in_progress', 'finished']).withMessage('Invalid status')
  ],
  validate,
  async (req, res) => {
    try {
      const proj = new Project(req.body);
      await proj.save();
      res.status(201).json(proj);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Server error' });
    }
  }
);

// Get all projects (authenticated)
router.get('/', auth, async (req, res) => {
  try {
    const projects = await Project.find().sort({ createdAt: -1 });
    res.json(projects);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get single project
router.get('/:id', auth, async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ message: 'Not found' });
    res.json(project);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update project (authenticated) - only admin/supervisor can change status
router.put(
  '/:id',
  auth,
  [
    param('id').isMongoId().withMessage('Invalid project id'),
    body('area').optional().isFloat({ gt: 0 }).withMessage('Area must be a number > 0'),
    body('price').optional().isFloat({ gt: -1 }).withMessage('Price must be a number >= 0'),
    body('status').optional().isIn(['pending', 'in_progress', 'finished']).withMessage('Invalid status')
  ],
  validate,
  async (req, res) => {
    try {
      // If status is being changed, ensure role
      if (req.body.status && !['admin', 'supervisor'].includes(req.user.role)) {
        return res.status(403).json({ message: 'Forbidden - insufficient role to change status' });
      }

      const project = await Project.findByIdAndUpdate(req.params.id, req.body, { new: true });
      if (!project) return res.status(404).json({ message: 'Not found' });
      res.json(project);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Server error' });
    }
  }
);

// Delete project (only admin)
router.delete('/:id', auth, checkRole(['admin']), async (req, res) => {
  try {
    const project = await Project.findByIdAndDelete(req.params.id);
    if (!project) return res.status(404).json({ message: 'Not found' });
    res.json({ message: 'Deleted' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
