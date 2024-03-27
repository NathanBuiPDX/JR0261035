const express = require('express');
const app = express();
const helmet = require('helmet');
const morgan = require('morgan');
const processors = require('./routes/processors');
const port = process.env.PORT || 8000;
var cors = require('cors')

app.use(cors(
    {
        origin: '*',
        method: ['GET', 'POST', 'DELETE', 'PUT']
    }
))

app.use(express.json());
app.use(helmet());
app.use(morgan('common'));

app.use('/table', processors);

app.listen(port, () => { console.log(`Server listening to port ${port}`) });