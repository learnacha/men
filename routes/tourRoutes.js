const express = require("express");
const reviewRouter = require("./reviewRoutes");

const {
  createTour,
  getTour,
  updateTour,
  deleteTour,
  getAllTours,
  aliasTopTours,
  getTourStats,
  getMonthlyPlan,
  getToursWithin,
  getDistances,
} = require("../controllers/tourController");
const {
  isAuthenticated,
  restrictTo,
} = require("../controllers/authController");

const router = express.Router();

// router.param('id', checkID)

router.use("/:tourId/reviews", reviewRouter);

router.route("/top-5-cheap").get(aliasTopTours, getAllTours);

router.route("/tour-stats").get(getTourStats);

router.route("/distances/:latlng/unit/:unit").get(getDistances)

router
  .route("/monthly-plan/:year")
  .get(
    isAuthenticated,
    restrictTo("admin", "lead-guide", "guide"),
    getMonthlyPlan
  );

router
  .route("/tours-within/:distance/center/:latlng/unit/:unit")
  .get(getToursWithin);
// /tours-within/:distance/center/:latlng/unit/:unit

router
  .route("/")
  .get(getAllTours)
  .post(isAuthenticated, restrictTo("admin", "lead-guide"), createTour);

router
  .route("/:id")
  .get(getTour)
  .patch(isAuthenticated, restrictTo("admin", "lead-guide"), updateTour)
  .delete(isAuthenticated, restrictTo("admin", "lead-guide"), deleteTour);

module.exports = router;
