import { Router } from "express";
import { getAllUsers, singleUser } from "../controllers/userController.js";
import { authenticateUser } from '../middleware/authMiddleware.js';


const router = Router();
router.get('/all-users', authenticateUser, getAllUsers);
router.get('/single-user/:id', authenticateUser, singleUser);
export default router;