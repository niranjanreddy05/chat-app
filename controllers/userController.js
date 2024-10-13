import { NotFoundError } from "../errors/CustomErrors.js";
import User from "../models/UserModel.js";
import { StatusCodes } from "http-status-codes";


export const getAllUsers = async (req, res) => {
  try {
    // Using find() with projection to exclude password
    const data = await User.find({}, '-password'); 
    const users = data.filter(user => user._id.toString() !== req.userId);

    res.status(StatusCodes.OK).json(users);
  } catch (error) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: "Error fetching users" });
  }
}


export const singleUser = async (req, res) => {
  const { id } = req.params;
  const user = await User.findById(id);
  if(!user) {
    throw new NotFoundError('User not found');
  }
  res.status(StatusCodes.OK).json(user);
}

export const getUserIdFromSocketId = async (req, res) => {
  const { id } = req.body;
  const user = await User.findOne({ socketId: id });
  const userId = user._id;
  res.status(StatusCodes.OK).json(userId);
}