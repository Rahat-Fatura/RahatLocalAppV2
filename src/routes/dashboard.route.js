const express = require('express');
const { dashboardController } = require('../controllers');

const router = express.Router();

router.get('/', dashboardController.getDashboardPage);

module.exports = router;
