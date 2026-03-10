import express from 'express';
import { 
    acceptFriendRequest , 
    getReceivedRequests,
    getSentRequests,
    sendFriendRequest , 
    declineFriendRequest , 
    searchUserByPhone,
    unfriend,
} from '../controllers/friendController.js';
const friendRouter = express.Router();
friendRouter.put('/friend/accept', acceptFriendRequest);
friendRouter.get('/friend/received/:userId', getReceivedRequests);
friendRouter.get('/friend/sent/:userId', getSentRequests);
friendRouter.post('/friend/send', sendFriendRequest);
friendRouter.delete('/friend/decline', declineFriendRequest);
friendRouter.get('/friend/search' , searchUserByPhone);
friendRouter.post('/friend/unfriend', unfriend);
export default friendRouter;