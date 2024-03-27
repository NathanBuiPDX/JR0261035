const router = require('express').Router();
const {API_DATA} = require('../assets/API_DATA');
router.get('/', async (req, res) => {
    try {
        res.status(200).json(API_DATA);
    } catch(e) {
        res.status(500).json(e);
    }
})

module.exports = router;