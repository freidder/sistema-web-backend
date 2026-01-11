const request = require('supertest');
const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config();

const app = require('../src/index');

let token = '';
let projectId = '';

beforeAll(async () => {
  await mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
  // Crear usuario admin si no existe
  await request(app)
    .post('/api/auth/register')
    .send({ name: 'Admin', email: 'admin@santander.com', password: 'admin123', role: 'admin' });
  // Login como admin
  const loginRes = await request(app)
    .post('/api/auth/login')
    .send({ email: 'admin@santander.com', password: 'admin123' });
  token = loginRes.body.token;
  // Crear proyecto
  const projectRes = await request(app)
    .post('/api/projects')
    .set('Authorization', `Bearer ${token}`)
    .send({
      client: 'Cliente Upload',
      address: 'Calle 456',
      sidingType: 'Fiber',
      area: 200,
      price: 10000,
      status: 'pending',
      startDate: new Date().toISOString(),
      notes: 'Proyecto para upload'
    });
  projectId = projectRes.body._id;
});

afterAll(async () => {
  await mongoose.disconnect();
});

describe('Subida de archivos', () => {
  it('debe subir una foto al proyecto', async () => {
    const res = await request(app)
      .post(`/api/projects/${projectId}/photos`)
      .set('Authorization', `Bearer ${token}`)
      .attach('photo', path.join(__dirname, 'test-image.jpg'));
  expect(res.statusCode).toBe(200);
  expect(res.body.project).toBeDefined();
  expect(res.body.project.photos.length).toBeGreaterThan(0);
  expect(res.body.project.photos[0]).toMatch(/uploads\//);
  });
});
