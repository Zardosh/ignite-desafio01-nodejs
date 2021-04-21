const express = require('express');
const cors = require('cors');

const { v4: uuidv4 } = require('uuid');

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {
	const { username } = request.headers;

	const user = users.find(user => user.username === username);

	if (!user) {
		return response.status(404).json({ error: 'User not found' });
	}

	request.user = user;

	return next();
}

app.post('/users', (request, response) => {
	const { name, username } = request.body;

	const userExists = users.find(user => user.username === username);

	if (userExists) {
		return response.status(400).json({ error: 'User already exists!' });
	}

	const user = {
		id: uuidv4(),
		name,
		username,
		todos: [],
	};

	users.push(user);

	return response.status(201).json(user);
});

app.get('/todos', checksExistsUserAccount, (request, response) => {
	const { todos } = request.user;

	return response.json(todos);
});

app.post('/todos', checksExistsUserAccount, (request, response) => {
	const { title, deadline } = request.body;

	const todo = {
		id: uuidv4(),
		title,
		done: false,
		deadline,
		created_at: new Date(),
	};

	request.user.todos.push(todo);

	return response.status(201).json(todo);
});

app.put('/todos/:id', checksExistsUserAccount, (request, response) => {
	const { id } = request.params;
	const { title, deadline } = request.body;

	const todo = request.user.todos.find(todo => todo.id === id);

	if (!todo) {
		return response.status(404).json({ error: 'Todo not found for informed user' });
	}

	todo.title = title;
	todo.deadline = deadline;

	return response.status(201).json(todo);
});

app.patch('/todos/:id/done', checksExistsUserAccount, (request, response) => {
	const { id } = request.params;

	const todo = request.user.todos.find(todo => todo.id === id);

	if (!todo) {
		return response.status(404).json({ error: 'Todo not found for informed user' });
	}

	todo.done = true;
	
	return response.status(201).json(todo);
});

app.delete('/todos/:id', checksExistsUserAccount, (request, response) => {
	const { id } = request.params;

	const todo = request.user.todos.find(todo => todo.id === id);

	if (!todo) {
		return response.status(404).json({ error: 'Todo not found for informed user' });
	}

	request.user.todos.splice(todo, 1);

	return response.status(204).send();
});

module.exports = app;