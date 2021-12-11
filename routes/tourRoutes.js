const express = require('express');
const {
  createTour,
  getTour,
  updateTour,
  deleteTour,
  getAllTours,
  checkID,
  validateCreateTourRequest,
} = require('../controllers/tourController');

const router = express.Router();

router.param('id', checkID)

router.route('/').get(getAllTours).post(validateCreateTourRequest, createTour);

router.route('/:id').get(getTour).patch(updateTour).delete(deleteTour);

module.exports = router;
