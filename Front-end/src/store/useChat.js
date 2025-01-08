import { create } from "zustand";
import toast from 'react-hot-toast'
import {axiosInstance} from '../lib/axios';
import { useAuth } from "./useAuth";

export const useChatStore = create((set, get) => ({
    messages: [], // Ensure this is initialized as an empty array
    users: [],
    selectedUser: null,
    isUsersLoading: false,
    isMessagesLoading: false,
  
    getUsers: async () => {
      set({ isUsersLoading: true });
      try {
        const res = await axiosInstance.get('/messages/users');
        set({ users: res.data });
      } catch (error) {
        toast.error(error.response.data.message);
      } finally {
        set({ isUsersLoading: false });
      }
    },
  
    getMessages: async (userId) => {
      set({ isMessagesLoading: true });
      try {
        const res = await axiosInstance.get(`/messages/${userId}`);
        set({ messages: res.data });
      } catch (error) {
        toast.error(error.response.data.message);
      } finally {
        set({ isMessagesLoading: false });
      }
    },
  
    sendMessage: async (MessageData) => {
      const { selectedUser, messages } = get(); // Ensure this is 'messages'
      try {
        const res = await axiosInstance.post(`/messages/send/${selectedUser._id}`, MessageData);
        console.log("Response data:", res.data); // Log the response data
        if (res.data) {
          set({ messages: [...messages, res.data] });
        } else {
          console.error('No data in response');
        }
      } catch (error) {
        console.error("Error sending message:", error); // Log the error
        toast.error(error.response.data.message);
      }
    },
  
    setSelectedUser: async (selectedUser) => {
      set({ selectedUser });
    },

    subscribeMessage: () => {
      const {selectedUser} = get()
      if(!selectedUser) return;

      const socket = useAuth.getState().socket;

      socket.on("NewMessage",(newMessage)=> {
        if(newMessage.senderId !== selectedUser._id) return
        set({messages: [...get().messages, newMessage]})
      })
    },

    unSubscribeMessage: () => {
      const socket = useAuth.getState().socket;
      socket.off("NewMessage")
    },

    setselectedUser:  (selectedUser) => set({selectedUser})
  }));
  