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

const filterData = (data, field, value) => {
    console.log("field: ", field);
    console.log("value: ", value)
    let result = [];
    if (data && data.length > 0) {
        result = data.filter(e => {
            if (field === "name" && value.trim() !== '') {
                let lowerCaseName = e[field].toLowerCase();
                let searchString = value.toLowerCase();
                return lowerCaseName.includes(searchString);
            }
            else return e.Essentials[field] === value
        });
    }
    return result;
}

router.get('/', async (req, res) => {
    try {
        let data = formatData(API_DATA);
        const query = url.parse(req.url, true).query.lazyQuery ? JSON.parse(url.parse(req.url, true).query.lazyQuery) : url.parse(req.url, true).query;

        if (query.filters) {
            for (let fieldName in query.filters) {
                if (query.filters[fieldName].value !== null) {
                    data = filterData(data, fieldName, query.filters[fieldName].value);
                }
            }
        }

        res.status(200).json(getPaginatedData(query, data));
    } catch(e) {
        console.log(e);
        res.status(500).json({ message: 'Internal Server Error' });
    }
})

// Mocking update table behavior for this PUT call. Not update any data 
// since database is not implemented for this backend.
// Changes will be saved in localStorage at frontend side
router.put('/:processorId', async (req, res) => {
    try {
       let processorId = req.params.processorId;
       let data = API_DATA;
       console.log("Payload: ", req.body);
       if (!data[processorId]) res.status(404).json({message: "Failed to update data. Proccessor not found!"});
        else res.status(200).json({message: "Updated processor successfully"});
    } catch(e) {
        console.log(e);
        res.status(500).json({ message: 'Internal Server Error' });
    }
})

router.get('/uniqueEssentials', async (req, res) => {
    try{
        let data = formatData(API_DATA);
        let status = [];
        let collection = [];
        let lithography = [];
        let segment = [];
        data.forEach(e => {
            let essentials = e.Essentials;
            if (essentials?.Status) status.push(essentials?.Status);
            if (essentials?.Lithography) lithography.push(essentials?.Lithography);
            if(essentials?.["Product Collection"]) collection.push(essentials?.["Product Collection"]);
            if(essentials?.["Vertical Segment"]) segment.push(essentials?.["Vertical Segment"]);
        })

        let result = {};
        result.Status = [...new Set(status)];
        result.Lithography = [...new Set(lithography)];
        result["Product Collection"] = [...new Set(collection)];
        result["Vertical Segment"] = [...new Set(segment)];

        res.status(200).json(result);
    } catch(e) {
        console.log(e);
        res.status(500).json({ message: 'Internal Server Error' });
    }
})

module.exports = router;