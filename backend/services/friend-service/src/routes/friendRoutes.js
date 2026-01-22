import express from 'express';
import { acceptFriendRequest , getReceivedRequests,getSentRequests,sendFriendRequest , declineFriendRequest} from '../controllers/friendController.js';
const friendRouter = express.Router();
friendRouter.put('/accept', acceptFriendRequest);
friendRouter.get('/received/:userId', getReceivedRequests);
friendRouter.get('/sent/:userId', getSentRequests);
friendRouter.post('/send', sendFriendRequest);
friendRouter.delete('/decline', declineFriendRequest);
export default friendRouter;