process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

app.use('/api/auth', require('./routes/auth'));
app.use('/api/devices', require('./routes/devices'));

app.get('/', (req, res) => {
  res.json({ message: 'Minhas Lock Server is running!' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Minhas Lock server running on port ${PORT}`);
});
