const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios');
const app = express();
const mongoose = require('mongoose');
//Allow all requests from all domains & localhost//2OFL5PrOw2ByKnwD
app.all('/*', function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "X-Requested-With, Content-Type, Accept");
  res.header("Access-Control-Allow-Methods", "GET");
  next();
});


app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));

//Todos => deleted userId

const TodoSchema = new mongoose.Schema (
    {
        userId: Number,
        id: Number,
        title: String,
        completed: Boolean
    }
);

const Todo  = mongoose.model('to-do', TodoSchema);



app.get('/sync/with/mongo', async (req, res, next) => {
    // const id = req.body.id;
    // const title = req.body.title;
    try {
        const { data } = await axios.get('https://jsonplaceholder.typicode.com/todos');
        const desiredData = await Promise.all(data.map(async todo => {
            delete todo.userId;
            return todo;
        }));
        await Todo.bulkWrite(desiredData.map(todo => ({
            updateOne: {
                filter: {id: todo.id},
                update: todo,
                upsert: true,
            }
        })))
        res.status(200).send(desiredData);
    } catch (error) {
        console.log('errror', error);
        res.status(500).send(error.toString());
    }
});

//retrieving data from mongo db to show all todos
app.get('/todos', async(req, res) => {
    try {
        const data = await Todo.find({});

        res.status(200).send(data);
    } catch (error) {
        console.log('errror', error);
        res.status(500).send(error.toString());
    }
});


//retrieving data from database (with todo/:id)


app.get('/todos/:id', async(req, res) => {
    try {
        const data = await Todo.find({id: req.params.id});

        res.status(200).send(data);
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

// app.listen(4001);

mongoose.connect (
    'mongodb+srv://niharika:2OFL5PrOw2ByKnwD@cluster0.ur84y.mongodb.net/myFirstDatabase?retryWrites=true&w=majority'
).then(result => {
    app.listen(5001);
})
.catch(err => console.log(err));
