const { Router } = require('express');
const router = Router();

router.get(
    '/',
    (req, res) => {
        console.log("Get route /");
        res.json( { name: 'Hello from Ballaro backend' } );
    }
);

module.exports = router;
