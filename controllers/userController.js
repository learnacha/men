const User = require("../models/userModel");
const catchAsync = require("./../utils/catchAsync");
const AppError = require("../utils/appError");

const filterObj = (obj, ...allowedFields) => {
  const data = {};
  Object.keys(obj).forEach((el) => {
    if (allowedFields.includes(el)) data[el] = obj[el];
  });

  return data;
};

const getAllUsers = catchAsync(async (req, res, next) => {
  const users = await User.find();

  res.status(200).json({
    status: "success",
    results: users.length,
    data: {
      users,
    },
  });
});

const deleteMe = catchAsync(async (req, res, next) => {
  await User.findByIdAndUpdate(req.user.id, { active: false });
  res.status(204).json({
    status: "sucess",
    data: {}
  });
});
const updateMe = catchAsync(async (req, res, next) => {
  // 1. Create error if user posts password data

  if (req.body.password || req.body.passwordConfirm) {
    return next(
      new AppError(
        "Password update is not supported this API, Please use /updatePassword",
        401
      )
    );
  }

  const data = filterObj(req.body, "name", "email");
  const updateUser = await User.findByIdAndUpdate(req.user.id, data, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({
    status: "success",
    data: {
      user: updateUser,
    },
  });
});

const createUser = (req, res) => {
  return res.status(500).json({
    status: "error",
    message: "Route is not yet implemented",
  });
};

const getUser = (req, res) => {
  return res.status(500).json({
    status: "error",
    message: "Route is not yet implemented",
  });
};

const updateUser = (req, res) => {
  return res.status(500).json({
    status: "error",
    message: "Route is not yet implemented",
  });
};

const deleteUser = (req, res) => {
  return res.status(500).json({
    status: "error",
    message: "Route is not yet implemented",
  });
};

module.exports = {
  getAllUsers,
  createUser,
  getUser,
  updateUser,
  deleteUser,
  updateMe,
  deleteMe,
};
