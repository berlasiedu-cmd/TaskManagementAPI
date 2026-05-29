const request = require('supertest');
const { app, resetTodos } = require('./app');

beforeEach(() => {
  resetTodos();
});

describe('Health Check', () => {
  test('GET /health returns UP', async () => {
    const res = await request(app).get('/health');
    expect(res.statusCode).toBe(200);
    expect(res.body.status).toBe('UP');
  });
});

describe('Todos API', () => {
  test('GET /todos returns empty array', async () => {
    const res = await request(app).get('/todos');
    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual([]);
  });

  test('POST /todos creates a todo', async () => {
    const res = await request(app)
      .post('/todos')
      .send({ title: 'Buy groceries' });
    expect(res.statusCode).toBe(201);
    expect(res.body.title).toBe('Buy groceries');
    expect(res.body.completed).toBe(false);
  });

  test('POST /todos returns 400 if title missing', async () => {
    const res = await request(app).post('/todos').send({});
    expect(res.statusCode).toBe(400);
  });

  test('GET /todos/:id returns a todo', async () => {
    await request(app).post('/todos').send({ title: 'Test todo' });
    const res = await request(app).get('/todos/1');
    expect(res.statusCode).toBe(200);
    expect(res.body.title).toBe('Test todo');
  });

  test('GET /todos/:id returns 404 if not found', async () => {
    const res = await request(app).get('/todos/999');
    expect(res.statusCode).toBe(404);
  });

  test('PUT /todos/:id updates a todo', async () => {
    await request(app).post('/todos').send({ title: 'Old title' });
    const res = await request(app)
      .put('/todos/1')
      .send({ title: 'New title', completed: true });
    expect(res.statusCode).toBe(200);
    expect(res.body.title).toBe('New title');
    expect(res.body.completed).toBe(true);
  });

  test('DELETE /todos/:id deletes a todo', async () => {
    await request(app).post('/todos').send({ title: 'To delete' });
    const res = await request(app).delete('/todos/1');
    expect(res.statusCode).toBe(200);
    expect(res.body.message).toBe('Task deleted');
  });
});