import 'express-async-errors';
import * as dotenv from 'dotenv';
dotenv.config();
import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import mongoose from 'mongoose';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { StatusCodes } from 'http-status-codes';
import authRouter from './routers/authRouter.js'
import userRouter from './routers/userRouter.js';
import messageRouter from './routers/messageRouter.js';
import User from './models/UserModel.js';
import Message from './models/MessageModel.js';
import { NotFoundError } from './errors/CustomErrors.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const server = http.createServer(app);


const isDevelopment = process.env.NODE_ENV !== 'production';
const clientOrigin = isDevelopment ? 'http://localhost:5173' : process.env.CLIENT_URL || '';


const io = new Server(server, {
  cors: {
    origin: isDevelopment 
      ? [clientOrigin, 'https://admin.socket.io']
      : clientOrigin || true, // Allow same-origin requests in production
    methods: ['GET', 'POST'],
    credentials: true
  }
});

// Express CORS setup
if (isDevelopment) {
  app.use(cors({
    origin: clientOrigin,
    credentials: true
  }));
} else {
  app.use(express.static(path.join(__dirname, './public')));
}

app.use(express.json());
app.use(cookieParser());

// Socket.IO event handlers
io.on('connection', (socket) => {
  socket.on('login', async (userId) => {
    try {
      const user = await User.findById(userId);
      user.socketId = socket.id;
      user.isOnline = true
      await user.save();
      socket.broadcast.emit('user-status-changed', { userId: user._id, isOnline: true })
    } catch (error) {
      throw new NotFoundError('User not found');
    }
  })
  socket.on('send-message', async (msg, userId) => {
    try {
      const user = await User.findById(userId);
      const sender = await User.findOne({ socketId: socket.id });
      const message = new Message({
        receiver: user._id,
        sender: sender._id,
        message: msg,
        read: false
      })
      const result = await message.save();
      socket.to(user.socketId).emit('receive-message', msg, result._id, socket.id);
    } catch (error) {
      throw new Error('Something went wrong')
    }
  })

  socket.on('message-read', async (msgId, userId) => {
    const user = await User.findById(userId);
    const socketId = user.socketId;
    const msg = await Message.findByIdAndUpdate(msgId, { read: true }, { new: true });
    socket.to(socketId).emit('message-read-update')
  })

  socket.on('message-sent', async (userId) => {
    const user = await User.findById(userId);
    const socketId = user.socketId;
    socket.to(socketId).emit('message-received', socket.id);
  })

  socket.on('typing-started', async (userId) => {
    const user = await User.findById(userId);
    const socketId = user.socketId;
    socket.to(socketId).emit('typing-ongoing', socket.id)
  })

  socket.on('typing-stopped', async (userId) => {
    const user = await User.findById(userId);
    const socketId = user.socketId;
    socket.to(socketId).emit('typing-stopped', socket.id)
  })

  socket.on('delete-messages', async (receiverId, senderId) => {
    const user = await User.findById(receiverId);
    const result = await Message.deleteMany({
      $or: [
        { sender: senderId, receiver: receiverId },
        { sender: receiverId, receiver: senderId }
      ]
    })
    const socketId = user.socketId;
    socket.to(socketId).emit('delete-messages', senderId)
  })

  socket.on('disconnect', async () => {
    try {
      const user = await User.findOne({ socketId: socket.id });
      if (user) {
        user.isOnline = false;
        await user.save();

        socket.broadcast.emit('user-status-changed', { userId: user._id, isOnline: false });
      }
    } catch (error) {
      console.error('Error finding user during disconnect:', error);
    }
  });
})

// API routes
app.use('/api/auth', authRouter);
app.use('/api/users', userRouter);
app.use('/api/messages', messageRouter);

if (!isDevelopment) {
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, './public', 'index.html'));
  });
} else {
  app.use('*', (req, res) => {
    res.status(404).json({ msg: 'route not found' });
  });
}

// Error handling middleware
app.use((err, req, res, next) => {
  console.log(err);
  const statusCode = err.statusCode || StatusCodes.INTERNAL_SERVER_ERROR;
  const msg = err.message || 'Something went wrong, try again later';
  res.status(statusCode).json({ msg });
});

const port = process.env.PORT || 3000;
try {
  await mongoose.connect(process.env.MONGO_URL);
  server.listen(port, () => {
    console.log(`Server is running on port ${port}...`);
    console.log(`Mode: ${process.env.NODE_ENV || 'development'}`);
  });
} catch (err) {
  console.log(err);
  process.exit(1);
}