const express = require("express");

const {
  getReviews,
  deleteReview,
  createReview,
  updateReview,
  setTourUserIds,
  getReview,
} = require("./../controllers/reviewController");

const {
  isAuthenticated,
  restrictTo,
} = require("./../controllers/authController");

const router = express.Router({ mergeParams: true });

router.use(isAuthenticated);

router
  .route("/")
  .get(getReviews)
  .post(restrictTo("user"), setTourUserIds, createReview);

router
  .route("/:id")
  .get(getReview)
  .patch(restrictTo("user", "admin"), updateReview)
  .delete(restrictTo("user", "admin"), deleteReview);

module.exports = router;
