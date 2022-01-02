const Review = require("../models/reviewModel");
const factory = require("./handlerFactory");

const setTourUserIds = (req, res, next) => {
  // Allow nested routes

  // POST /tour/:tourid/reviews
  // GET /tour/:tourid/reviews
  // GET /tour/:tourid/reviews/:reviewid

  if (!req.body.tour) req.body.tour = req.params.tourId;
  if (!req.body.user) req.body.user = req.user.id;

  next();
};

const getReviews = factory.getAll(Review);
const getReview = factory.getOne(Review);
const createReview = factory.createOne(Review);
const deleteReview = factory.deleteOne(Review);
const updateReview = factory.updateOne(Review);

module.exports = {
  createReview,
  getReviews,
  deleteReview,
  updateReview,
  setTourUserIds,
  getReview,
};
