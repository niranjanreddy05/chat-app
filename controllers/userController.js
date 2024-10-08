import { NotFoundError } from "../errors/CustomErrors.js";
import User from "../models/UserModel.js";
import { StatusCodes } from "http-status-codes";


export const getAllUsers = async (req, res) => {
  const data = await User.find();
  const users = data.filter(user => user._id.toString() !== req.userId);
  res.status(StatusCodes.OK).json(users);
} 

export const singleUser = async (req, res) => {
  const { id } = req.params;
  const user = await User.findById(id);
  if(!user) {
    throw new NotFoundError('User not found');
  }
  res.status(StatusCodes.OK).json(user);
}