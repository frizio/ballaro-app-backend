const { Router } = require('express');
const { Pool } = require('pg');

const router = Router();

const pool = new Pool(
    {
        connectionString: process.env.DATABASE_URL,
        ssl: true
    }
);

router.get(
    '/',
    (req, res) => {
        console.log("Hit route /testdb with GET");
        res.json( { name: 'Hello from Ballaro backend' } );
    }
);


router.get(
    '/testdb', 
    async (req, res) => {
        console.log("Hit route /testdb with GET");
        try {
            console.log("Connect to the database. Request is: ");
            console.log(req);
            const client = await pool.connect()
            const result = await client.query('SELECT * FROM test_table');
            const results = { 'info': (result) ? result.rows : null};
            res.json(results);
            client.release();
        } catch (err) {
            console.error(err);
            res.send("Error " + err);
        }
    }
);

module.exports = router;
