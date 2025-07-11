import React, { useEffect, useRef } from 'react';
import { useChatStore } from '../store/useChat';
import ChatHeader from './ChatHeader';
import MessageInput from './MessageInput';
import MessageSkeleton from './MessageSkeleton';
import { useAuth } from '../store/useAuth';
import { formatMessageTime } from '../lib/utlil';

const ChatContainer = () => {
  const { messages, getMessages, isMessagesLoading, selectedUser,subscribeMessage, unSubscribeMessage } = useChatStore();
  const { authUser } = useAuth();
  const messageRef = useRef(null)

  useEffect(() => {
      getMessages(selectedUser._id);

      subscribeMessage()
      return () => unSubscribeMessage()
  }, [selectedUser, getMessages,subscribeMessage,unSubscribeMessage]);

  useEffect(()=> {
    if(messageRef.current && messages)
    {
      messageRef.current.scrollIntoView({behavior: "smooth"})
    }
  },[messages])

  if (isMessagesLoading) return (
    <div className='flex flex-1 flex-col overflow-auto'>
      <ChatHeader />
      <MessageSkeleton />
      <MessageInput />
    </div>
  );

  return (
    <div className='flex-1 flex flex-col overflow-auto'>
      <ChatHeader />
      <div className='flex-1 overflow-auto p-4 space-y-4'>
        {messages.map((message) => (
          <div 
            key={message._id}
            className={`chat ${message.senderId === authUser._id ? "chat-end" : "chat-start"}`}
            ref={messageRef}
          >
            <div className='chat-image avatar'>
              <div className='size-10 rounded-full border'>
                <img 
                  src={message.senderId === authUser._id ? authUser.profilePic || '/avatar.png' : selectedUser.profilePic || '/avatar.png'} 
                  alt='profile pic' 
                />
              </div>
            </div>
            <div className='chat-header mb-1'>
              <time className='text-xs opacity-50 ml-1'>
                {formatMessageTime(message.createdAt)}
              </time>
            </div>
            <div className='chat-bubble flex flex-col'>
                {message.image && (
                  <img src={message.image}
                  alt="Attachment"
                  className='sm:max-w-[200px] rounded-md mb-2' />
                )}
                {message.text && <p>{message.text}</p>}
            </div>
          </div>
        ))}
      </div>
      <MessageInput />
    </div>
  );
};

export default ChatContainer;
