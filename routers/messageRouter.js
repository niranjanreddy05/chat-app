import { Router } from "express";
import { getMessages } from "../controllers/messageController.js";
import { authenticateUser } from "../middleware/authMiddleware.js";


const router = Router();
router.post('/get-messages', authenticateUser, getMessages);

export default router;