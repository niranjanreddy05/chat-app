import { StatusCodes } from "http-status-codes";
import Message from "../models/MessageModel.js";
import { BadRequestError } from "../errors/CustomErrors.js";

export const getMessages = async (req, res) => {
  const { senderId, receiverId } = req.body;
  try {
    const messages = await Message.find({
      $or: [
        { sender: senderId, receiver: receiverId },
        { sender: receiverId, receiver: senderId }
      ]
    }).sort({ createdAt: 1 });

    res.status(StatusCodes.OK).json(messages);
  } catch (error) {
    throw new BadRequestError("Something went wrong please try again later");
  }
};

export const getUnreadMessageCount = async (req, res) => {
  const { senderId, receiverId } = req.body;
  try {
    const messages = await Message.find({ sender: senderId, receiver: receiverId, read: false })
    const count = messages.length
    res.status(StatusCodes.OK).json(count);
  } catch (error) {
    console.log(error);
    throw new BadRequestError("Something went wrong please try again later");
  }
};

export const deleteAllMessages = async (req, res) => {
  try{
    const { senderId, receiverId } = req.body;
    const result = await Message.deleteMany({
      $or: [
        { sender: senderId, receiver: receiverId },
        { sender: receiverId, receiver: senderId }
      ]
    })
    res.status(StatusCodes.OK).send(result);
  } catch (error) {
    console.log(error);
    throw new BadRequestError('Something went wrong')
  }
}