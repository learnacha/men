const Tour = require("../models/tourModel");
const AppError = require("../utils/appError");
const APIFeatures = require("./../utils/apiFeature");
const catchAsync = require("./../utils/catchAsync");

const aliasTopTours = (req, res, next) => {
  req.query.limit = "5";
  req.query.sort = "-ratingsAverage,price";
  req.query.fields = "name,price,ratingsAverage,difficulty";
  next();
};

const checkID = (req, res, next, val) => {
  const {
    params: { id = -1 },
  } = req;

  next();
};

const validateCreateTourRequest = (req, res, next) => {
  const {
    body: { name, price },
  } = req;

  const failedRes = {
    status: "fail",
    message: "Invalid ID",
  };

  if (!name || !price) return res.status(404).json(failedRes);

  next();
};

const createTour = catchAsync(async (req, res, next) => {
  const newTour = await Tour.create(req.body);

  res.status(201).json({
    status: "success",
    data: {
      tour: newTour,
    },
  });
});

const getTour = catchAsync(async (req, res, next) => {
  const {
    params: { id = -1 },
  } = req;

  const tour = await Tour.findById(id);

  // if (!tour) {
  //   return next(new AppError("No tour found with that ID", 404));
  // }

  res.status(200).json({
    status: "success",
    data: {
      tour,
    },
  });
});

const updateTour = catchAsync(async (req, res, next) => {
  const {
    params: { id = -1 },
  } = req;

  const tour = await Tour.findByIdAndUpdate(id, req.body, {
    new: true,
    runValidators: true,
  });

  // if (!tour) {
  //   return next(new AppError("No tour found with that ID", 404));
  // }

  res.status(200).json({
    status: "success",
    data: {
      tour,
    },
  });
});

const deleteTour = catchAsync(async (req, res, next) => {
  const {
    params: { id = -1 },
  } = req;

  const tour = await Tour.findByIdAndDelete(id);

  res.status(204).json({
    data: null,
  });
});

const getAllTours = catchAsync(async (req, res, next) => {
  const features = new APIFeatures(Tour.find(), req.query)
    .filter()
    .sort()
    .limitFields()
    .paginate();
  const tours = await features.query;

  res.status(200).json({
    status: "success",
    results: tours.length,
    data: {
      tours,
    },
  });
});

const getTourStats = catchAsync(async (req, res, next) => {
  const stats = await Tour.aggregate([
    {
      $match: { ratingsAverage: { $gte: 4.5 } },
    },
    {
      $group: {
        _id: { $toUpper: "$difficulty" },
        numTours: { $sum: 1 },
        numRatings: { $sum: "$ratingsQuantity" },
        avgRating: { $avg: "$ratingsAverage" },
        avgPrice: { $avg: "$price" },
        minPrice: { $min: "$price" },
        maxPrice: { $max: "$price" },
      },
    },
    {
      $sort: { avgPrice: 1 },
    },
    // {
    //   $match: { _id: { $ne: "EASY" } },
    // },
  ]);

  res.status(200).json({
    status: "success",
    data: {
      stats,
    },
  });
});

const getMonthlyPlan = catchAsync(async (req, res, next) => {
  const {
    params: { year },
  } = req;

  const plan = await Tour.aggregate([
    {
      $unwind: "$startDates",
    },
    {
      $match: {
        startDates: {
          $gte: new Date(`${year}-01-01`),
          $lte: new Date(`${year}-12-31`),
        },
      },
    },
    {
      $group: {
        _id: { $month: "$startDates" },
        numTourStarts: { $sum: 1 },
        tours: { $push: "$name" },
      },
    },
    {
      $addFields: { month: "$_id" },
    },
    {
      $project: {
        _id: 0,
      },
    },
    {
      $sort: {
        numTourStarts: -1,
      },
    },
    {
      $limit: 12,
    },
  ]);

  res.status(200).json({
    status: "success",
    data: {
      plan,
    },
  });
});

module.exports = {
  createTour,
  getTour,
  updateTour,
  deleteTour,
  getAllTours,
  checkID,
  validateCreateTourRequest,
  aliasTopTours,
  getTourStats,
  getMonthlyPlan,
};
