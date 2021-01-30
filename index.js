const express = require('express');
const Joi = require('joi'); //used for validation
const path = require('path')
const MongoClient = require('mongodb').MongoClient;
const fs = require('fs');
const bodyParser= require('body-parser');
const app = express();
app.use(express.static(path.join(__dirname, 'templates')));
app.use(bodyParser.urlencoded({ extended: true }));

// Parse config.json wiht out db info
let rawdata = fs.readFileSync('config.json');
let parsed = JSON.parse(rawdata);
let pwd = parsed['password'];
let un  = parsed['username'];
let dbname = parsed['dbname'];

app.get('/', (req, res) => {
    // render our HTML templates upon load-in
    res.sendFile(path.join(__dirname,"templates/login.html"));
});

app.post('/quotes', (req, res) => {
    console.log(req.body);
});

app.listen(3000, function() {
    // Mongodb connection setup
    var connectionString = `mongodb+srv://${un}:${pwd}@cluster0.0iwam.mongodb.net/${dbname}?retryWrites=true&w=majority`;
    MongoClient.connect(connectionString,{
        useUnifiedTopology: true
    }).then(client => {
        const db = client.db('stonks');
        const quotesCollection = db.collection('quotes');
    }).catch(error => {
        console.log(error);
    });

    // if it gets here, then its up
    console.log("Started app on localhost/3000 successfully");
});