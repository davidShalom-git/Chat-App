import express from 'express';
import authRoutes from './routes/authRoutes.js'; 
import messageRoutes from './routes/messageRoutes.js'; 
import dotenv from 'dotenv';
import { connectDB } from './lib/DB.js';
import cookieParser from 'cookie-parser';
dotenv.config();
import cors from 'cors';
import { app, server, io } from './lib/socket.js';
import path from 'path'

app.use(cors({
    origin: 'http://localhost:5173',
    credentials: true // Use lowercase 'credentials'
}));

const PORT = process.env.PORT;
const __dirname = path.resolve()

app.use(express.json());
app.use(cookieParser());

app.use('/api/auth', authRoutes);
app.use('/api/messages', messageRoutes);

if(process.env.NODE_ENV === 'production'){
    app.use(express.static(path.join(__dirname, '../Front-end/dist')))

    app.get("*", (req,res)=> {
        res.sendFile(path.join(__dirname, "../Front-end", "dist", "index.html"))
    })
}

server.listen(PORT, () => {
    console.log("Server Started...");
    connectDB();
});
