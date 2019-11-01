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
        res.json( { name: 'Hello from Ballaro backend - v2' } );
    }
);


router.get(
    '/testdb', 
    async (req, res) => {
        console.log("Hit route /testdb with GET");
        try {
            console.log("Connect to the database. Request is: ");
            //console.log(req);
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

router.get(
    '/mercati', 
    async (req, res) => {
        console.log("Hit route /mercati with GET");
        try {
            console.log("Connect to the database");
            const client = await pool.connect()
            const query_string = 'SELECT * FROM mercati';
            const result = await client.query(query_string);
            const results = (result) ? result.rows : null ;
            res.json(results);
            client.release();
        } catch (err) {
            console.error(err);
            res.send("Error " + err);
        }
    }
);

router.get(
    '/mercati/:provincia', 
    async (req, res) => {
        console.log("Hit route /mercati with GET");
        //console.log(req.params.provincia);
        const provincia = req.params.provincia.toUpperCase();
        try { 
            console.log("Connect to the database");
            const query_string = `SELECT * FROM mercati where provincia = \'${provincia}\'`;
            console.log(query_string);
            const client = await pool.connect()
            const result = await client.query(query_string);
            const results = (result) ? result.rows : null ;
            res.json(results);
            client.release();
        } catch (err) {
            console.error(err);
            res.send("Error " + err);
        }
    }
);


router.get(
    '/coltivazioni/:provincia/:n', 
    async (req, res) => {
        console.log("Hit route /coltivazioni with GET");
        //console.log(req.params.provincia);
        const provincia = req.params.provincia.toUpperCase();
        const n = req.params.n;
        try { 
            console.log("Connect to the database");
            const query_string = `SELECT * FROM coltivazioni where provincia = \'${provincia}\' order by quantita desc limit ${n}`;
            console.log(query_string);
            const client = await pool.connect()
            const result = await client.query(query_string);
            const results =  (result) ? result.rows : null ;
            res.json(results);
            client.release();
        } catch (err) {
            console.error(err);
            res.send("Error " + err);
        }
    }
);

router.get(
    '/porti', 
    async (req, res) => {
        console.log("Hit route /porti with GET");
        try {
            console.log("Connect to the database");
            const client = await pool.connect()
            const query_string = 'SELECT * FROM porti';
            const result = await client.query(query_string);
            const results = (result) ? result.rows : null ;
            res.json(results.info);
            client.release();
        } catch (err) {
            console.error(err);
            res.send("Error " + err);
        }
    }
);

router.get(
    '/pescato/:porto/:n', 
    async (req, res) => {
        console.log("Hit route /pescato/porto with GET");
        //console.log(req.params.provincia);
        const porto = req.params.porto.toUpperCase();
        const n = req.params.n;
        try { 
            console.log("Connect to the database");
            const query_string = `SELECT specie, quantita FROM pescato where porto = \'${porto}\' order by quantita desc limit ${n}`;
            console.log(query_string);
            const client = await pool.connect()
            const result = await client.query(query_string);
            const results =  (result) ? result.rows : null ;
            res.json(results);
            client.release();
        } catch (err) {
            console.error(err);
            res.send("Error " + err);
        }
    }
);

module.exports = router;
