require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');

const seoRoutes = require('./routes/seo.route');
const pageSpeedRoutes = require('./routes/pagespeed.route');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(bodyParser.json());

app.use('/api/seo', seoRoutes);
app.use('/api/pagespeed', pageSpeedRoutes);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});