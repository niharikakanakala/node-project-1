const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios');
const app = express();

//Allow all requests from all domains & localhost
app.all('/*', function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "X-Requested-With, Content-Type, Accept");
  res.header("Access-Control-Allow-Methods", "GET");
  next();
});


app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));

//Todos => deleted userId

app.get('/todos', async (req, res) => {
    try {
        const { data } = await axios.get('https://jsonplaceholder.typicode.com/todos');
        const desiredData = data.map(todo => {
            delete todo.userId;
            return todo;
        })
        res.status(200).send(desiredData);
    } catch (error) {
        console.log('errror', error);
        res.status(500).send(error.toString());
    }
});



app.get('/user/:id', async(req, res) => {
    try {
        const id = req.params.id;
        const { data: userData } = await axios.get(`https://jsonplaceholder.typicode.com/users/${id}`);
        const desiredUser = {
            id: userData.id,
            name: userData.name,
            email: userData.email,
            phone: userData.phone,
        };
        const { data: todos } = await axios.get('https://jsonplaceholder.typicode.com/todos');
        const userTodos = todos.filter(todo => todo.userId === parseInt(id));
        desiredUser.todos = userTodos
        res.status(200).send(desiredUser);
    } catch (error) {
        console.log('errror', error);
        res.status(500).send(error.toString());
    }
});

app.listen(4001);
