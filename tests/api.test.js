const request = require('supertest');
const mongoose = require('mongoose');
require('dotenv').config();

const app = require('../src/index');

const testEmail = 'testuser@example.com';
const testPass = 'Test123!';
let token = '';
let projectId = '';

beforeAll(async () => {
  // Conectar a la base de pruebas
  await mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
});

afterAll(async () => {
  await mongoose.disconnect();
});

describe('API Santander Construction', () => {
  it('debe registrar un usuario', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ name: 'Test', email: testEmail, password: testPass, role: 'admin' });
    expect([201, 400]).toContain(res.statusCode);
    if (res.statusCode === 201) {
      expect(res.body.token).toBeDefined();
    } else {
      expect(res.body.message).toMatch(/User already exists/);
    }
  });

  it('debe loguear y devolver token', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: testEmail, password: testPass });
    expect(res.statusCode).toBe(200);
    expect(res.body.token).toBeDefined();
    token = res.body.token;
  });

  it('debe crear un proyecto', async () => {
    const res = await request(app)
      .post('/api/projects')
      .set('Authorization', `Bearer ${token}`)
      .send({
        client: 'Cliente Test',
        address: 'Calle 123',
        sidingType: 'Vinyl',
        area: 100,
        price: 5000,
        status: 'pending',
        startDate: new Date().toISOString(),
        notes: 'Proyecto de prueba'
      });
    expect(res.statusCode).toBe(201);
    expect(res.body._id).toBeDefined();
    projectId = res.body._id;
  });

  it('debe consultar el proyecto creado', async () => {
    const res = await request(app)
      .get(`/api/projects/${projectId}`)
      .set('Authorization', `Bearer ${token}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.client).toBe('Cliente Test');
  });
});
