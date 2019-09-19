const express = require('express');
const bodyParser = require('body-parser');
const api = require('./routes/api');

// Initialization and configs
const app = express();

app.set('port', 3000);
const port = app.get('port');

// Middlewares
app.use(bodyParser.json());


// Routes
app.use('/api', api);

// Static files

// Listening the server
app.listen(
    port,
    () => {
        console.log("Server listening on port " + port);
    }
);
