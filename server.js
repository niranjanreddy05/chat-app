import 'express-async-errors';
import * as dotenv from 'dotenv';
dotenv.config();
import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import mongoose from 'mongoose';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import { StatusCodes } from 'http-status-codes';
import authRouter from './routers/authRouter.js'
import userRouter from './routers/userRouter.js';
import messageRouter from './routers/messageRouter.js';
import User from './models/UserModel.js';
import Message from './models/MessageModel.js';
import { NotFoundError } from './errors/CustomErrors.js';


const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: ['http://localhost:5173', 'https://admin.socket.io'] } });

app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true
}));
app.use(express.json());
app.use(cookieParser());

io.on('connection', (socket) => {
  socket.on('login', async (userId) => {
    try{
    const user = await User.findById(userId);
    user.socketId = socket.id;
    await user.save();
    } catch (error) {
      throw new NotFoundError('User not found');
    }
  })
  socket.on('send-message', async (msg, userId) => {
    const user = await User.findById(userId);
    const sender = await User.findOne({ socketId: socket.id });
    const message = new Message({
      receiver: user._id,
      sender: sender._id,
      message: msg
    })
    await message.save();
    socket.to(user.socketId).emit('receive-message', msg, socket.id);
  })
})

app.use('/api/auth', authRouter)
app.use('/api/users', userRouter);
app.use('/api/messages', messageRouter);

app.use('*', (req, res) => {
  res.status(404).json({ msg: 'route not found' })
})

app.use((err, req, res, next) => {
  console.log(err);
  const statusCode = err.statusCode || StatusCodes.INTERNAL_SERVER_ERROR;
  const msg = err.message || 'Something went wrong, try again later';

  res.status(statusCode).json({ msg });
});

const port = process.env.PORT || 3000;
try {
  await mongoose.connect(process.env.MONGO_URL)
  server.listen(port, console.log(`server is running on port ${port}...`))
} catch (err) {
  console.log(err);
  process.exit(1);
}
