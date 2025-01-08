import Message from "../models/message.model.js";
import user from "../models/user.model.js";
import cloudinary from '../lib/cloudinary.js'
import { getReceiverSocketId,io } from "../lib/socket.js";

export const getUserForSideBar = async(req,res) => {

    try{

        const loggedUserId = req.user._id;
        const filteredUsers = await user.find({_id: {$ne:loggedUserId}}).select("-password")
        res.status(200).json(filteredUsers);

    }catch(error){
        console.log("Error in getUsersForSideBar: ",error.message);
        res.status(500).json({error: "Internal Server Error"})
    }
}

export const getMessages = async(req,res) => {
    try{
        const {id: userToChatId} = req.params
        const myId = req.user._id;

        const message = await Message.find({
            $or:[
                {senderId: myId, receiverId:userToChatId},
                {senderId:userToChatId, receiverId:myId}
            ]
        })
        res.status(200).json(message)
    }
    catch(error)
    {
        console.log(error.message)
        res.status(500).json({error: 'Internal Server Error'})
    }
}

export const sendMessage = async (req,res) => {
    try {
        const {text,image} = req.body;
        const {id: receiverId} = req.params;
        const senderId = req.user._id;
        
        let imageUrl;

        if(image)
        {
            const uploadResponse = await cloudinary.uploader.upload(image)
            imageUrl = uploadResponse.secure_url;

        }

        const newMessage = new Message({
            senderId,
            receiverId,
            text,
            image: imageUrl
        })

        await newMessage.save();
        res.status(201).json(newMessage)

        const receiverSocketid = getReceiverSocketId(receiverId);
        if(receiverSocketid){
            io.to(receiverSocketid).emit("NewMessage",newMessage)
        }

    } catch (error) {
        console.log(error.message)
        res.status(500).json({error: 'Internal Server Error'})
    }
}

