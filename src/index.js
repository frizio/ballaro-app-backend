const express = require('express');
const app = express();

app.set('port', 3000);
const port = app.get('port');

// Middlewares

// Routes

// Static files

// Listening the server
app.listen(
    port,
    () => {
        console.log("Server listening on port " + port);
    }
);
