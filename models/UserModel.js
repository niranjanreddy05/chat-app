import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true, 
  },
  socketId: String,
  password: {
    type: String,
    required: true,
  },
  isOnline: {
    type: Boolean,
    default: false,
    required: true
  }
}, { timestamps: true });

const User = mongoose.model('User', userSchema);
export default User;
