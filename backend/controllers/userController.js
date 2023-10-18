import asyncHandler from "express-async-handler";
import User from "../models/userModel.js";
import generateToken from "../utils/generateToken.js";

const authUser = asyncHandler(async (req, res) => {
  const { username, password, role } = req.body;

  const user = await User.findOne({ username, role });

  if (user && (await user.matchPassword(password))) {
    generateToken(res, user._id);
    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      username: user.username,
      role: user.role
    });
  } else {
    res.status(401);
    throw new Error("Invalid username or password");
  }
});

const registerUser = asyncHandler(async (req, res) => {
  const { name, email, username, password, role } = req.body;

  const userExist = await User.findOne({ username, email });

  if (userExist) {
    res.status(400);
    throw new Error("User exist");
  }

  const user = await User.create({
    name,
    email,
    username,
    password,
    role
  });

  if (user) {
    generateToken(res, user._id);
    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      username: user.username,
      role: user.role
    });
  } else {
    res.status(400);
    throw new Error("Invalid user data");
  }
});

const logoutUser = asyncHandler(async (req, res) => {
    res.cookie('jwt','',{
        httpOnly: true,
        expires: new Date(0)
    });
  res.status(200).json({ message: "Logged out" });
});

const getUserProfile = asyncHandler(async (req, res) => {
    const user = {
        _id: req.user._id,
        name: req.user.name,
        email: req.user.email,
        username: req.user.username,
        role: req.user.role
    }
  res.status(200).json(user);
});

const updateUserProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);

  if(user){
    user.name = req.body.name || user.name;
    user.email = req.body.email || user.email;
    user.username = req.body.username || user.username;
    user.role = user.role;

    if(req.body.password){
        user.password = req.body.password;
    }

    const updatedUser = await user.save();

    res.status(200).json({
        _id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        username: updatedUser.username,
        role: updatedUser.role
    });
  }else{
    res.status(404);
    throw new Error('User not found');
  }

});

export {
  authUser,
  registerUser,
  logoutUser,
  getUserProfile,
  updateUserProfile,
};
