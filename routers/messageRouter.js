import { Router } from "express";
import { getMessages, getUnreadMessageCount, deleteAllMessages } from "../controllers/messageController.js";
import { authenticateUser } from "../middleware/authMiddleware.js";


const router = Router();
router.post('/get-messages', authenticateUser, getMessages);
router.post('/get-unread-count', authenticateUser, getUnreadMessageCount);
router.delete('/delete-all-messages', deleteAllMessages);

export default router;