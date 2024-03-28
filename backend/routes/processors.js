const router = require('express').Router();
const {API_DATA} = require('../assets/API_DATA');
const url = require('url');

const formatData = (data) => {
    let dataKey = Object.keys(data).sort((a,b) => a - b);
    let result = dataKey.map(key => {
        let processor = data[key];
        processor.id = key;
        return processor;
    })

    return result;
}

const getPaginatedData = (query, data) => {
    let result = {totalRecords: data.length};
    if (query.first !== null && query.rows !== null) {
        let first = parseInt(query.first);
        let rows = parseInt(query.rows);
        let temp = data.slice(first, first + rows);
        result.data = temp;
    }
    else result.data = data;
    return result;
}

router.get('/', async (req, res) => {
    try {
        const data = formatData(API_DATA);
        const query = url.parse(req.url, true).query.lazyQuery ? JSON.parse(url.parse(req.url, true).query.lazyQuery) : url.parse(req.url, true).query;
        res.status(200).json(getPaginatedData(query, data));
    } catch(e) {
        console.log(e);
        res.status(500).json({ message: 'Internal Server Error' });
    }
})

module.exports = router;