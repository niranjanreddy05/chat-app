import { StatusCodes } from "http-status-codes";
import { BadRequestError, UnauthenticatedError } from "../errors/CustomErrors.js";
import User from "../models/UserModel.js";
import { hashPassword, comparePassword } from "../utils/passwordUtils.js";
import { createJWT } from "../utils/tokenUtils.js";

export const register = async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password || username === '' || password === '') {
    throw new BadRequestError('Username and password cannot be empty');
  }
  const result = await User.findOne({ username })
  if (result) {
    throw new BadRequestError('Username unavailable. Please choose another one.');
  }
  const hashedPassword = await hashPassword(password);
  const user = await User.create({ username, password: hashedPassword });
  res.status(StatusCodes.OK).json(user);
}

export const login = async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password || username === '' || password === '') {
    throw new BadRequestError('Username and password cannot be empty');
  }
  const user = await User.findOne({ username })
  const isValidUser = user && (await comparePassword(password, user.password));
  if (!isValidUser) throw new UnauthenticatedError('invalid credentials');
  const token = createJWT({userId: user._id});
  const oneDay = 1000 * 60 * 60 * 24;
  res.cookie('token', token, {
    httpOnly: true,
    expires: new Date(Date.now() + oneDay),
    secure: process.env.NODE_ENV === 'production',
  }); 
  res.status(StatusCodes.OK).json({msg: "user logged in"})
}

export const logout = (req, res) => {
  res.cookie('token', 'logout', {
    httpOnly: true,
    expires: new Date(Date.now()),
  });
  res.status(StatusCodes.OK).json({ msg: 'user logged out!' });
};
