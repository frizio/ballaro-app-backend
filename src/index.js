const express = require('express');
const bodyParser = require('body-parser');
const api = require('./routes/api');
const path = require('path');

// Initialization and configs
const app = express();

const PORT = process.env.PORT || 3000

app.set('port', PORT);
const port = app.get('port');

// Middlewares
app.use(bodyParser.json());


// Routes
app.use('/api', api);

// Web pages 
app.get(
    '/',
    (req, res) => {
        console.log('Home page hit');
        res.sendFile(path.join(__dirname, '/views/index.html'));
    }
);

// Data Files
app.get(
    '/data/fruttadistagione',
    (req, res) => {
        console.log('Data hit');
        res.sendFile(path.join(__dirname, '/data/stagionalita_frutta.json'));
    }
);

app.get(
    '/data/verduradistagione',
    (req, res) => {
        console.log('Data hit');
        res.sendFile(path.join(__dirname, '/data/stagionalita_verdura.json'));
    }
);

app.get(
    '/data/pescedistagione',
    (req, res) => {
        console.log('Data hit');
        res.sendFile(path.join(__dirname, '/data/stagionalita_pescato.json'));
    }
);

// Static files

// Listening the server
app.listen(
    port,
    () => {
        console.log("Server listening on port " + port);
    }
);
