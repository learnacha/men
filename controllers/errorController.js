const AppError = require("../utils/appError");

const handleCastErrorDB = (err) => {
  const msg = `Invalid ${err.path}: ${err.value}`;
  return new AppError(msg, 400);
};

const handleDuplicateFieldsDB = (err) => {
  const val = err.errmsg.match(/(["'])(?:(?=(\\?))\2.)*?\1/)[0];
  const msg = `Duplicate field value: ${val}. Please use another value`;
  return new AppError(msg, 400);
};

const handleValidationErrorDB = (err) => {
  const errors = Object.values(err.errors).map((el) => el.message);
  const msg = `Invalid input data. ${errors.join(". ")}`;
  return new AppError(msg, 400);
};

const handleJWTError = (err) =>
  new AppError("Invalid token. Please log in again!", 401);

const handleJWTTimeOutError = (err) =>
  new AppError("Timed out token. Please log in again!", 401);

const sendErrorDev = (err, res) => {
  res.status(err.statusCode).json({
    status: err.status,
    error: err,
    message: err.message,
    stack: err.stack,
  });
};

const sendErrorProd = (err, res) => {
  console.log("err", JSON.stringify(err));
  if (err.isOperational) {
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
    });
  } else {
    // Log the error to console
    console.error("ERROR", err);
    res.status(500).json({
      status: "error",
      message: "Something went very wrong",
    });
  }
};

const ErroHandler = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || "error";

  if (process.env.NODE_ENV === "development") {
    sendErrorDev(err, res);
  } else if (process.env.NODE_ENV === "production") {
    if (err.name === "CastError") err = handleCastErrorDB(err);
    if (err.name === "ValidationError") err = handleValidationErrorDB(err);
    if (err.name === "JsonWebTokenError") err = handleJWTError(err);
    if (err.name === "handleJWTTimeOutError") err = handleJWTError(err);
    if (err.code === 11000) err = handleDuplicateFieldsDB(err);

    sendErrorProd(err, res);
  }
};

module.exports = ErroHandler;
