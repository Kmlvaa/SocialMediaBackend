require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();

const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

mongoose
    .connect(process.env.MONGO_URI)
    .then(() => (console.log('MongoDB connected.')))
    .catch((err) => console.log('MongoDB ERROR: ', err));

app.use('/api', require('./routes/auth'));

app.get('/', (req, res) => {
    res.send('✅ Backend is working!');
});

app.listen(PORT, () => console.log(`SERVER RUNNING AT http://localhost:${PORT}`));

