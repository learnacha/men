const express = require("express");
const {
  getAllUsers,
  createUser,
  getUser,
  updateUser,
  deleteUser,
  updateMe,
  deleteMe,
  getMe,
} = require("../controllers/userController");

const {
  signup,
  signin,
  forgotPassword,
  resetPassword,
  updatePassword,
  isAuthenticated,
  restrictTo,
} = require("../controllers/authController");

const router = express.Router();

router.post("/signup", signup);
router.post("/signin", signin);
router.post("/forgotPassword", forgotPassword);
router.patch("/resetPassword/:token", resetPassword);

// from below route onwards authentication is required
router.use(isAuthenticated);

router.patch("/updatePassword", updatePassword);
router.patch("/updateMe", updateMe);
router.delete("/deleteMe", deleteMe);
router.get("/me", getMe, getUser);

// from below route onwards only admin can access
router.use(restrictTo('admin'));

router.route("/").get(getAllUsers).post(createUser);
router.route("/:id").get(getUser).patch(updateUser).delete(deleteUser);

module.exports = router;
