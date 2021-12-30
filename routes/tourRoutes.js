const express = require("express");
const {
  createTour,
  getTour,
  updateTour,
  deleteTour,
  getAllTours,
  aliasTopTours,
  getTourStats,
  getMonthlyPlan,
} = require("../controllers/tourController");
const {
  isAuthenticated,
  restrictTo,
} = require("../controllers/authController");

const router = express.Router();

// router.param('id', checkID)

router.route("/top-5-cheap").get(aliasTopTours, getAllTours);

router.route("/tour-stats").get(getTourStats);
router.route("/monthly-plan/:year").get(getMonthlyPlan);

router.route("/").get(isAuthenticated, getAllTours).post(createTour);

router
  .route("/:id")
  .get(getTour)
  .patch(updateTour)
  .delete(isAuthenticated, restrictTo("admin", "lead-guide"), deleteTour);
module.exports = router;
