const express = require('express');
const tourController = require('../controllers/tourController');

const router = express.Router();

//router.param('id', tourController.checkID);

router
    .route('/top-5-cheap')
    .get(tourController.aliasTopTours, tourController.getAllToursAsync);

router
    .route('/tour-stats')
    .get(tourController.getTourStatsAsync);

router
    .route('/monthly-plan/:year')
    .get(tourController.getMonthlyPlanAsync);

router
    .route('/')
    .get(tourController.getAllToursAsync)
    .post(tourController.createTourAsync);

router
    .route('/:id')
    .get(tourController.getTourAsync)
    .patch(tourController.updateTourAsync)
    .delete(tourController.deleteTourAsync);

module.exports = router;
