const { Router } = require('express');
const rp = require('request-promise');
const { requstPositionInfo } = require('../services/position');
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
            const client = await pool.connect();
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
            const query_string = `SELECT * FROM mercati where UPPER(provincia) = \'${provincia}\'`;
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
            const query_string = `SELECT * FROM coltivazioni where UPPER(provincia) = \'${provincia}\' order by quantita desc limit ${n}`;
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
            res.json(results);
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
            const query_string = `SELECT specie, quantita FROM pescato where UPPER(porto) = \'${porto}\' order by quantita desc limit ${n}`;
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

router.post(
    '/add-market',
    async (req, res) => {
        console.log("Hit route /add-market with POST");
        let lat = req.body.lat;
        let lon = req.body.lon;
        let market = req.body.market;
        let day = req.body.day;
        let other = req.body.other;
        const days = ["Everyday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
        if (!isNaN(lat) && !isNaN(lon) && days.includes(day)) {
            try {
                let position = await requstPositionInfo(lat, lon);
                console.log('posizione');
                console.log(position);
                const sql = 'INSERT INTO mercati VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9)';
                position.city =  position.city ? position.city.substring(0, 30) : '';
                position.county = position.county ? position.county.substring(0, 30) : '';
                position.state = position.state ? position.state.substring(0, 30) : '';
                const values = [position.city, position.county, position.state, market, position.osmid, lon, lat, day, other];
                const client = await pool.connect();
                await client.query(sql, values);
                client.release();
                res.status(200).send();
            } catch (err) {
                console.log(err);
                res.status(400).send("Bad request")
            }
        } else {
            res.status(400).send("Bad request")
        }
    }
);

// Parameters:
// lat
// lon
// dist - search radius (in km), optional
// n - max number of results, optional
router.get(
    '/nearby/:tipo(porti|mercati|pescato|coltivazioni)',
    async (req, res) => {
        const tipo = req.params.tipo;
        console.log(`Hit route /nearby/${tipo} with GET`);

        let lat = parseFloat(req.query.lat);
        let lon = parseFloat(req.query.lon);
        if (isNaN(lat) || isNaN(lon))
            return res.status(400).send("Bad request");

        let dist = req.query.dist;
        if (typeof dist == 'undefined')
            dist = 50;

        let n = req.query.n;
        if (typeof n == 'undefined')
            n = 1;

        let results = [];
        if (tipo === 'coltivazioni')
            results = await nearbyColtivations(lat, lon);
        else
            results = await nearbyThings(lat, lon, tipo, dist, n);
        return await res.json(results)
    }
);

async function nearbyColtivations(lat, lon) {
    try {
        let position = await requstPositionInfo(lat, lon);
        let provincia = position.county.toUpperCase();
        if (!(new RegExp(/^[a-z ]+$/i)).test(provincia))
            return [];
        let sql = `SELECT * FROM coltivazioni WHERE UPPER(provincia) = '${provincia}'`;
        console.log("Connect to the database");
        const client = await pool.connect();
        console.log(sql);
        const result = await client.query(sql);
        let results =  (result) ? result.rows : [];
        client.release();
        return results;
    } catch (e) {
        console.log(e);
        return [];
    }
}

async function nearbyThings(lat, lon, tipo, dist, n) {
    const distToLat = dist / 111; // Convert distance to latitude, each latitude degree ~ 111 km
    const lonDegreeLength = Math.cos(lat * (Math.PI/180)) * 111.321; // 1 longitude degree in km at given latitude
    const distToLon = dist / lonDegreeLength; // Convert distance to longitude

    const minLat = lat - distToLat;
    const maxLat = lat + distToLat;
    const minLon = lon - distToLon;
    const maxLon = lon + distToLon;

    try {
        let sql = `SELECT * FROM ${tipo} WHERE latitude BETWEEN ${minLat} AND ${maxLat} AND longitude BETWEEN ${minLon} AND ${maxLon}`;
        console.log("Connect to the database");
        console.log(sql);
        const client = await pool.connect();
        const result = await client.query(sql);
        let rows =  (result) ? result.rows : [];
        let results = [];
        client.release();
        for (let i = 0; i < rows.length; i++) {
            let row = rows[i];
            row.dist = distance(lat, lon, parseFloat(row.latitude), parseFloat(row.longitude));
            if (row.dist <= dist)
                results.push(row);
        }
        results.sort(function(x, y) {
            if (x.dist < y.dist) return -1;
            if (x.dist > y.dist) return 1;
            return 0;
        });
        results = results.slice(0, n);
        return results;
    } catch (err) {
        console.error(err);
    }
}

function distance(lat1, lon1, lat2, lon2) {
    const decimals = 4;
    const earthRadius = 6371; // km

    let dLat = (lat2 - lat1) * Math.PI / 180;
    let dLon = (lon2 - lon1) * Math.PI / 180;
    let lat1rad = lat1 * Math.PI / 180;
    let lat2rad = lat2 * Math.PI / 180;

    let a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.sin(dLon / 2) * Math.sin(dLon / 2) * Math.cos(lat1rad) * Math.cos(lat2rad);
    let d = earthRadius * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return Math.round(d * Math.pow(10, decimals)) / Math.pow(10, decimals);
}

module.exports = router;
