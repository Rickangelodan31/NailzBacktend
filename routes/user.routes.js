const router = require("express").Router();
const User = require("../models/User.model");
const uploader = require("../middlewares/cloudinary.config");
const { isAuthenticated } = require("../middlewares/route-gaurd.middleware");
const Designer = require("../models/Designer.model");

// All routes start with /api/users

// Route to handle profile picture uploads
router.post(
  "/profilePicture",
  isAuthenticated,
  uploader.single("profilePicture"),
  async (req, res) => {
    try {
      // Update the user's profile picture path in the database
      await User.findByIdAndUpdate(req.tokenPayload.userId, {
        image: req.file.path,
      });
      res
        .status(200)
        .json({ message: "Profile picture uploaded successfully" });
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }
);

router.post("/", isAuthenticated, async (req, res) => {
  try {
    const user = await User.create({
      ...req.body,
      vendor: req.tokenPayload.userId,
    });
    res.status(201).json(user);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

router.get("/", isAuthenticated, async (req, res) => {
  try {
    const users = await Designer.findOne({
      vendor: req.tokenPayload.userId,
    }).populate({
      path: "vendor",
      select: "-hashedPassword",
    }); // Make sure to strip away the password
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.put("/", isAuthenticated, async (req, res) => {
  console.log(req.body);
  try {
    const user = await User.findByIdAndUpdate(
      req.tokenPayload.userId,
      req.body,
      {
        new: true,
        runValidators: true,
      }
    );
    if (user) {
      res.json(user);
    } else {
      res.status(404).json({ message: "user not found" });
    }
  } catch (error) {
    console.log(error);
    res.status(400).json({ message: error.message });
  }
});

router.delete("/:id", async (req, res) => {


  
  try {
    const { id } = req.params;
    const user = await User.findByIdAndDelete(id);
    if (user) {
      res.json({ message: "user deleted successfully" });
    } else {
      res.status(404).json({ message: "user not found" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
