const crypto = require("crypto");
const { promisify } = require("util");

const jwt = require("jsonwebtoken");
const User = require("./../models/userModel");
const AppError = require("../utils/appError");

const catchAsync = require("./../utils/catchAsync");
const sendEmail = require("./../utils/email");

const signToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });

const createSendToken = (user, statusCode, res) => {
  const token = signToken(user._id);
  const cookieOptions = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
  };

  if (process.env.NODE_ENV === "production") cookieOptions.secure = true;

  res.cookie("jwt", token, cookieOptions);

  // remove password from the output
  user.password = undefined;

  res.status(statusCode).json({
    status: "success",
    token,
    data: {
      user,
    },
  });
};

const signup = catchAsync(async (req, res, next) => {
  const { name, email, password, passwordConfirm, passwordChangedAt } =
    req.body;
  const newUser = await User.create(req.body);
  // secure
  // const newUser = await User.create({
  //   name,
  //   email,
  //   password,
  //   passwordConfirm,
  //   passwordChangedAt,
  // });

  createSendToken(newUser, 201, res);
});

const signin = catchAsync(async (req, res, next) => {
  // 1 check if the email and password exist
  // 2 check if the user exists and password is correct
  // 3 if everything okay, send token to client
  const { email, password } = req.body;

  if (!email || !password) {
    return next(new AppError("Please provide email and password", 400));
  }

  const user = await User.findOne({ email }).select("+password");

  if (!user || !(await user.validatePassword(password, user.password))) {
    return next(new AppError("Invalid email or password", 401));
  }

  createSendToken(user, 200, res);
});

const restrictTo = (...roles) => {
  return (req, res, next) => {
    // roles ['admin', 'lead-guide']
    if (!roles.includes(req.user.role)) {
      return next(
        new AppError("User is not authorized to perform this action", 403)
      );
    }

    next();
  };
};

const isAuthenticated = catchAsync(async (req, res, next) => {
  // 1. check if the request contains token
  // 2. check if the token is valid
  // 3. check if the user exists
  // 4. check if user changed password after the token was issue

  const { name, email, password, passwordConfirm } = req.body;
  const { authorization } = req.headers;
  let token;

  if (authorization && authorization.startsWith("Bearer")) {
    token = authorization.split(" ")[1];
  }

  if (!token) {
    return next(new AppError("Kindly login to get the details", 401));
  }

  const decodedToken = await promisify(jwt.verify)(
    token,
    process.env.JWT_SECRET
  );

  const currentUser = await User.findById(decodedToken.id);

  if (!currentUser) {
    return next(
      new AppError("The user belonging to token no longer exist", 401)
    );
  }
  if (currentUser.changedPasswordAfter(decodedToken.iat)) {
    return next(
      new AppError("User recently changed password! Please log in again", 401)
    );
  }

  // grant access to protected route
  req.user = currentUser;
  next();
});

const forgotPassword = catchAsync(async (req, res, next) => {
  // get user based on posted email
  // generate random reset token
  // send it to users email
  const user = await User.findOne({ email: req.body.email });

  if (!user) {
    return next(new AppError("There is no user with email address", 401));
  }
  console.log("processing forgot password");

  const resetToken = user.createPasswordResetToken();
  await user.save({ validateBeforeSave: false });

  const resetURL = `${req.protocol}://${req.get(
    "host"
  )}/api/v1/users/resetPassword/${resetToken}`;

  const message = `Forgot your password? Submit a PATCH request with your new password and passwordConfirm to: ${resetURL}.\n If you didnt forget your password, please ignore this email!`;

  try {
    await sendEmail({
      email: user.email,
      subject: "Your password reset token (valid for 10 mins)",
      message,
    });
  } catch (error) {
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save({ validateBeforeSave: false });

    return next(
      new AppError("Error while sending an email, try again later", 500)
    );
  }

  res.status(200).json({
    status: "success",
    message: "Token sent to email",
  });
});

const resetPassword = catchAsync(async (req, res, next) => {
  // 1. Get user based on the token
  // 2. Check if token exists
  // 3. Check if user exists
  // 4. Set the new password
  // 5. Update changedPasswordAt property
  // 6. Log the user in, send in JWT

  const hashedToken = crypto
    .createHash("sha256")
    .update(req.params.token)
    .digest("hex");

  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() },
  });

  if (!user) {
    return next(new AppError("Token is invalid or has expired", 400));
  }

  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;

  await user.save();

  createSendToken(user, 200, res);
});

const updatePassword = catchAsync(async (req, res, next) => {
  // 1. Get user from DB
  // 2. Check if the password is correct
  // 3. Update the password
  // 4. Log user in by creating signin token

  const user = await User.findById(req.user.id).select("+password");

  if (!user) {
    return next(new AppError("User with email not found", 400));
  }

  const passwordValidation = await user.validatePassword(
    req.body.passwordCurrent,
    user.password
  );

  if (!passwordValidation) {
    return next(new AppError("Invalid current password", 401));
  }

  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  await user.save();

  createSendToken(user, 200, res);
});

module.exports = {
  signup,
  signin,
  isAuthenticated,
  restrictTo,
  forgotPassword,
  resetPassword,
  updatePassword,
};
