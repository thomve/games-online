const express = require('express');
const cors = require('cors');
const { router: characterRouter } = require('./routes/character');
const worldRouter = require('./routes/world');

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

app.use('/api/character', characterRouter);
app.use('/api/world', worldRouter);

app.get('/api/health', (req, res) => res.json({ status: 'ok' }));

app.listen(PORT, () => console.log(`Backend running on http://localhost:${PORT}`));
