const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const bookRoutes = require('./routes/bookRoutes');


dotenv.config();


connectDB();

const app = express();


app.use(cors()); 
app.use(express.json()); 

app.get('/', (req, res) => res.send('API Running')); 
app.use('/api/auth', authRoutes);
app.use('/api/books', bookRoutes);



const PORT = process.env.PORT || 5001;

app.listen(PORT, () => console.log(`Server started on port ${PORT}`));