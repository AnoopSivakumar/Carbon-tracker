require('dotenv').config();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');

const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const activityRoutes = require('./routes/activityRoutes');
const verificationRoutes = require('./routes/verificationRoutes');
const rewardRoutes = require('./routes/rewardRoutes');
const campaignRoutes = require('./routes/campaignRoutes');
const emissionFactorRoutes = require('./routes/emissionFactorRoutes');
const reportRoutes = require('./routes/reportRoutes');

const app = express();

app.use(cors());
app.use(express.json({ limit: '5mb' }));
app.use(morgan('dev'));

app.get('/api/health', (req, res) => res.json({ status: 'ok', service: 'carbon-tracker-api' }));

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/activities', activityRoutes);
app.use('/api/verifications', verificationRoutes);
app.use('/api/rewards', rewardRoutes);
app.use('/api/campaigns', campaignRoutes);
app.use('/api/emission-factors', emissionFactorRoutes);
app.use('/api/reports', reportRoutes);

// 404 handler
app.use((req, res) => res.status(404).json({ message: 'Route not found.' }));

// Central error handler
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ message: 'Internal server error.' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Carbon Tracker API running on port ${PORT}`));
