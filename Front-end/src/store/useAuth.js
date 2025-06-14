import { create } from 'zustand';
import { axiosInstance } from '../lib/axios';
import toast from 'react-hot-toast';
import io from 'socket.io-client'

const url = import.meta.env.MODE === "development" ? 'http://localhost:5001/api': '/'

export const useAuth = create((set,get) => ({
  authUser: null,
  isSigningUp: false,
  isLoggingIn: false,
  isUpdatingProfile: false,
  isCheckingAuth: true,
  onlineUsers: [],

  checkAuth: async () => {
    try {
      const res = await axiosInstance.get('/auth/check');
      set({ authUser: res.data });
      get().connectSocket();
    } catch (error) {
      console.log(error);
      set({ authUser: null });
    } finally {
      set({ isCheckingAuth: false });
    }
  },

  signup: async (data) => {
    set({ isSigningUp: true });
    try {
      const res = await axiosInstance.post('/auth/signup', data);
      set({ authUser: res.data });
      toast.success('Account Created');
      get().connectSocket();
    } catch (error) {
      toast.error(error.response.data.message);
      return false;
    } finally {
      set({ isSigningUp: false });
    }
  },

  logout: async() => {
    try {
      
      await axiosInstance.post('/auth/logout')
      set({authUser: null});
      toast.success("Logged Out Successfully")
      get().disconnectSocket()

    } catch (error) {
      toast.error(error.response.data.message)
    }
  }, 
  login: async(data) => {
    set({isLoggingIn: false})
    try
    {
      const res = await axiosInstance.post("/auth/login", data)
      set({authUser: res.data})
      toast.success("Logged in Successfully")
      get().connectSocket()
    }
   catch(error)
   {
    toast.error(error.response.data.message)
   }finally 
   {
    set({isLoggingIn: false})
   }
    
  },

  updateProfile: async(data) => {
    set({isUpdatingProfile: true})
  

    try {
        const res = await axiosInstance.put('/auth/update-profile',data)
        set({authUser: res.data})
        toast.success("Profile Upload Successfully")
      } catch (error) {
        console.log(error)
        toast.error(error.response.data.message)
    }finally{
      set({isUpdatingProfile: false})
    }
  },

  connectSocket: () => {
    const {authUser} = get()
  if(!authUser || get().socket?.connected)
      return;
    const socket = io(url,{
      query: {
        userId: authUser._id
      }
    })
    socket.connect();
    set({socket: socket})
    socket.on("getOnlineUsers", (userids) => {
      set({onlineUsers: userids})
    })
  },

  disconnectSocket: () => {

  }

}));
