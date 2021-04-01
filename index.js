const express = require('express');
const bcrypt = require('bcrypt');
const Joi = require('joi'); //used for validation
const path = require('path')
const MongoClient = require('mongodb').MongoClient;
const fs = require('fs');
const bodyParser = require('body-parser');
const https = require('https');
const http = require('http');
const app = express();
const saltRounds = 10;

// Setup http and https protocols
//http.createServer(app).listen(80);
//https.createServer(app).listen(443);

// Get these bad boys to configure the app
app.use(express.static(__dirname + '/static'));
app.use(bodyParser.urlencoded({ extended: false }));

// Parse config.json wiht out db info
let rawdata = fs.readFileSync('config.json');
let parsed = JSON.parse(rawdata);
let pwd = parsed['password'];
let un  = parsed['username'];
let dbname = parsed['dbname'];

app.get('/', (req, res) => {
    // render our HTML templates upon load-in
    res.sendFile(path.join(__dirname,"/static/index.html"));
});

app.get('/signup', (req, res) => {
    // Load the login data
    res.sendFile(path.join(__dirname,"/static/signup.html"));
});

app.get('/favicon.ico',(req, res) => {
    // Load the login data
    res.sendFile(path.join(__dirname,"/favicon.ico"));
});

app.listen(3000, '172.26.0.119', function() {
    // Mongodb connection setup
    var connectionString = `mongodb+srv://${un}:${pwd}@cluster0.0iwam.mongodb.net/${dbname}?retryWrites=true&w=majority`;
    MongoClient.connect(connectionString,{
        useUnifiedTopology: true
    }).then(client => {
        // Load up DB for entries
        const db = client.db('stonks');
        const users = db.collection('users');
        
        app.post('/signup', (req, res) => {
            // render our HTML templates upon load-in
            let username = req.body.username;
            bcrypt.genSalt(saltRounds, function(err, salt) {
                bcrypt.hash(req.body.password, salt, function(err, hash) {
                    var user = { "username" : username, "password" : hash }
                    users.insertOne(user).then(res.sendStatus(200)).catch(error => console.error(error));
                });
            });
        });

    }).catch(error => {
	console.log("\n\nERR: Unable to start Node server due to error:\n\n");
        console.log(error);
    });

    // if it gets here, then its up
    console.log("Started app on localhost:3000 successfully");
});
