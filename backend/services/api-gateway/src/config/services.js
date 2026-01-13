import dotenv from 'dotenv';
dotenv.config();

export const services = {
    authService: process.env.AUTH_SERVICE_URL ,
    chatService: process.env.CHAT_SERVICE_URL ,
    uploadService: process.env.UPLOAD_SERVICE_URL ,
};