const express = require('express');

const router = express.Router();

const dashboardRoute = require('./dashboard.route');
const companyRoute = require('./company.route');

router.use('/', dashboardRoute);
router.use('/company', companyRoute);

module.exports = router;
