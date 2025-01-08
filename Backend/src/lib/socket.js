import {Server} from 'socket.io';
import http from 'http'
import express from 'express'

const app = express();
const server  = http.createServer(app)

const io = new Server(server,{
    cors: {
        origin: ['http://localhost:5173'],

    }
})

export function getReceiverSocketId(userid){
    return userSocketMap[userid]
}

// use to store online user
const userSocketMap = {} // {userid: socketid}

io.on('connection', (socket)=> {
    console.log("A User Connnected", socket.id)

    const userId = socket.handshake.query.userId;
    if(userId){
        userSocketMap[userId] = socket.id
    }

    io.emit("getOnlineUsers",Object.keys(userSocketMap))


    socket.on('disconnect',()=>  {
        console.log("A User disconnected", socket.id)
        delete userSocketMap[userId]
        io.emit('getOnlineUsers', Object.keys(userSocketMap))
    });
})

export {io,app,server} 