const express = require('express');
const Joi = require('joi'); //used for validation
const path = require('path')
const MongoClient = require('mongodb').MongoClient;
const fs = require('fs');
const bodyParser= require('body-parser');
const app = express();

// Get these bad boys to configure the app
app.use(express.static(path.join(__dirname, 'templates')));
app.use(bodyParser.urlencoded({ extended: false }));

// Parse config.json wiht out db info
let rawdata = fs.readFileSync('config.json');
let parsed = JSON.parse(rawdata);
let pwd = parsed['password'];
let un  = parsed['username'];
let dbname = parsed['dbname'];

app.listen(3000, function() {
    // Mongodb connection setup
    var connectionString = `mongodb+srv://${un}:${pwd}@cluster0.0iwam.mongodb.net/${dbname}?retryWrites=true&w=majority`;
    MongoClient.connect(connectionString,{
        useUnifiedTopology: true
    }).then(client => {
        // Load up DB for entries
        const db = client.db('stonks');
        const users = db.collection('users');

        app.get('/', (req, res) => {
            // render our HTML templates upon load-in
            res.sendFile(path.join(__dirname,"/static/index.html"));
        });
        
        app.get('/login', (req, res) => {
            // Load the login data
            res.sendFile(path.join(__dirname,"/static/login.html"));
        });
        
        app.post('/login', (req, res) => {
            // render our HTML templates upon load-in
            let username = req.body.username;
            let password = req.body.password;
            let user = { "username" : username, "password" : password }
            users.insertOne(user).then(res.redirect('/')).catch(error => console.error(error));
            res.sendStatus(200);
        });

    }).catch(error => {
        console.log(error);
    });

    // if it gets here, then its up
    console.log("Started app on localhost:3000 successfully");
});