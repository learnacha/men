const express = require("express");
const {
  getAllUsers,
  createUser,
  getUser,
  updateUser,
  deleteUser,
  updateMe,
  deleteMe,
} = require("../controllers/userController");

const {
  signup,
  signin,
  forgotPassword,
  resetPassword,
  updatePassword,
  isAuthenticated,
} = require("../controllers/authController");

const router = express.Router();

router.post("/signup", signup);
router.post("/signin", signin);
router.post("/forgotPassword", forgotPassword);
router.patch("/resetPassword/:token", resetPassword);
router.patch("/updatePassword", isAuthenticated, updatePassword);

router.patch("/updateMe", isAuthenticated, updateMe);
router.delete("/deleteMe", isAuthenticated, deleteMe);

router.route("/").get(getAllUsers).post(createUser);

router.route("/:id").get(getUser).patch(updateUser).delete(deleteUser);

module.exports = router;
