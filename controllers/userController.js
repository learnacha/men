const User = require("../models/userModel");
const catchAsync = require("./../utils/catchAsync");
const AppError = require("../utils/appError");
const factory = require("./handlerFactory");

const filterObj = (obj, ...allowedFields) => {
  const data = {};
  Object.keys(obj).forEach((el) => {
    if (allowedFields.includes(el)) data[el] = obj[el];
  });

  return data;
};
const deleteMe = catchAsync(async (req, res, next) => {
  await User.findByIdAndUpdate(req.user.id, { active: false });
  res.status(204).json({
    status: "sucess",
    data: {},
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

const getMe = (req, res, next) => {
  req.params.id = req.user.id;

  next();
};
const createUser = (req, res) => {
  return res.status(500).json({
    status: "error",
    message: "Please use /signup instead",
  });
};

const getAllUsers = factory.getAll(User);
const getUser = factory.getOne(User);
const deleteUser = factory.deleteOne(User);
const updateUser = factory.updateOne(User);

module.exports = {
  getAllUsers,
  createUser,
  getUser,
  updateUser,
  deleteUser,
  updateMe,
  deleteMe,
  getMe
};
