import { Router } from "express";
import { getAllUsers, singleUser, getUserIdFromSocketId } from "../controllers/userController.js";
import { authenticateUser } from '../middleware/authMiddleware.js';


const router = Router();
router.get('/all-users', authenticateUser, getAllUsers);
router.get('/single-user/:id', authenticateUser, singleUser);
router.post('/get-user-id', authenticateUser, getUserIdFromSocketId)
export default router;