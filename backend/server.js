require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const dayRoutes = require('./routes/dayRoutes');
const app = express();
const routineRoutes = require('./routes/routineRoutes');

connectDB();

app.use(cors({
  origin: ['http://localhost:5173', 'https://consistency-tracker-sandy.vercel.app'],
  credentials: true,
}));
app.use(express.json());
app.use('/api/days', dayRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/routines', routineRoutes);
app.get('/', (req, res) => res.send('API is running'));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));