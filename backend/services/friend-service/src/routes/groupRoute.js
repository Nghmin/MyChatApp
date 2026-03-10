import express from 'express';
import { 
    createGroup,
    acceptGroupInvite,
    declineGroupInvite,
    getPendingGroups,
    getSentGroupInvites,
    getSentGroupInvitesByUser,
    inviteToGroup,
    leaveGroup,
    updateGroupAvatar
} from '../controllers/groupController.js';

const groupRouter = express.Router();

groupRouter.post('/group/createGroup', createGroup);
groupRouter.post('/group/invite', inviteToGroup);
groupRouter.put('/group/accept', acceptGroupInvite);
groupRouter.put('/group/decline', declineGroupInvite);
groupRouter.get('/group/pending/:userId', getPendingGroups);
groupRouter.get('/group/sent/:adminId', getSentGroupInvites);
groupRouter.get('/group/sent-by-user/:userId', getSentGroupInvitesByUser);
groupRouter.post('/group/leave', leaveGroup);
groupRouter.put('/group/update-avatar', updateGroupAvatar);


export default groupRouter;