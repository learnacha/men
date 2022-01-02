const express = require("express");
const morgan = require("morgan");
const rateLimit = require("express-rate-limit");
const helmet = require("helmet");
const mongoSanitize = require("express-mongo-sanitize");
const xss = require("xss-clean");
const hpp = require("hpp");

const tourRouter = require("./routes/tourRoutes");
const userRouter = require("./routes/userRoutes");
const reviewRouter = require("./routes/reviewRoutes");

const AppError = require("./utils/appError");
const erroHandler = require("./controllers/errorController");

const app = express();

// Global middleware
// security http headers
app.use(helmet());

// limit requests
const limiter = rateLimit({
  max: 100,
  windowMs: 60 * 60 * 1000,
  message: "Too many requests from this IP, please try again in an hour",
});

app.use("/api", limiter);

// logging for development
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}
app.use((req, res, next) => {
  // console.log(req.headers);
  next();
});

// body parser, reading data from body into rq.body
app.use(
  express.json({
    limit: "10kb",
  })
);

// data sanitization against NoSQL query injection
// data sanitization against XSS attack
app.use(mongoSanitize());

// data sanitize
app.use(xss());

// prevent parameter pollution -- to be used at the end
app.use(
  hpp({
    whitelist: [
      "duration",
      "ratingsQuantity",
      "ratingsAverage",
      "maxGroupSize",
      "difficulty",
      "price",
    ],
  })
);

// serving static files
app.use(express.static(`${__dirname}/public`));

app.use("/api/v1/tours", tourRouter);
app.use("/api/v1/users", userRouter);
app.use("/api/v1/reviews", reviewRouter);

app.all("*", (req, res, next) => {
  const errorMessage = `Cant find ${req.originalUrl} on this server!`;
  const statusCode = 404;

  next(new AppError(errorMessage, statusCode));
});

app.use(erroHandler);

module.exports = app;
