import express from 'express';
import { 
    createGroup,
    acceptGroupInvite,
    declineGroupInvite,
    getPendingGroups,
    getSentGroupInvites,
    inviteToGroup
} from '../controllers/groupController.js';

const groupRouter = express.Router();

groupRouter.post('/group/createGroup', createGroup);
groupRouter.post('/group/invite', inviteToGroup);
groupRouter.put('/group/accept', acceptGroupInvite);
groupRouter.put('/group/decline', declineGroupInvite);

groupRouter.get('/group/pending/:userId', getPendingGroups);
groupRouter.get('/group/sent/:adminId', getSentGroupInvites);

export default groupRouter;