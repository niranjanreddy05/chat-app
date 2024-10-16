import { Router } from "express";
import { getAllUsers, singleUser, getUserIdFromSocketId, getUserStatus } from "../controllers/userController.js";
import { authenticateUser } from '../middleware/authMiddleware.js';


const router = Router();
router.get('/all-users', authenticateUser, getAllUsers);
router.get('/single-user/:id', singleUser);
router.post('/get-user-id', authenticateUser, getUserIdFromSocketId);
router.post('/get-user-status', getUserStatus);
export default router;