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
        console.log("Get route /");
        res.json( { name: 'Hello from Ballaro backend' } );
    }
);


router.get(
    '/testdb', 
    async (req, res) => {
        try {
        const client = await pool.connect()
        const result = await client.query('SELECT * FROM test_table');
        const results = { 'results': (result) ? result.rows : null};
        res.json(results);
        client.release();
        } catch (err) {
        console.error(err);
        res.send("Error " + err);
        }
    }
);

module.exports = router;
