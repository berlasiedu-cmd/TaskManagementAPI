const express = require('express');
const app = express();

app.use(express.json());

let todos = [];
let nextId = 1;

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'UP', timestamp: new Date() });
});

// Get all todos
app.get('/todos', (req, res) => {
  res.json(todos);
});

// Get one todo
app.get('/todos/:id', (req, res) => {
  const todo = todos.find(t => t.id === parseInt(req.params.id));
  if (!todo) return res.status(404).json({ error: 'Todo not found' });
  res.json(todo);
});

// Create todo
app.post('/todos', (req, res) => {
  const { title } = req.body;
  if (!title) return res.status(400).json({ error: 'Title is required' });
  const todo = { id: nextId++, title, completed: false };
  todos.push(todo);
  res.status(201).json(todo);
});

// Update todo
app.put('/todos/:id', (req, res) => {
  const todo = todos.find(t => t.id === parseInt(req.params.id));
  if (!todo) return res.status(404).json({ error: 'Todo not found' });
  const { title, completed } = req.body;
  if (title !== undefined) todo.title = title;
  if (completed !== undefined) todo.completed = completed;
  res.json(todo);
});

// Delete todo
app.delete('/todos/:id', (req, res) => {
  const index = todos.findIndex(t => t.id === parseInt(req.params.id));
  if (index === -1) return res.status(404).json({ error: 'Todo not found' });
  todos.splice(index, 1);
  res.json({ message: 'Todo deleted' });
});

module.exports = { app, resetTodos: () => { todos = []; nextId = 1; } };