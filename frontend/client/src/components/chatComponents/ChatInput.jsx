import React from 'react';
import { Send } from 'lucide-react';
import ChatUploadTool from './ChatUploadTool';

const ChatInput = ({ text, setText, onSend, onSendMedia, placeholder }) => {
  return (
    <div className="bg-white border-t border-gray-200">
      <ChatUploadTool onUploadSuccess={onSendMedia} />
      <div className="flex items-center gap-1 px-3 py-1">
        <input 
          className="flex-1 bg-transparent border-none focus:ring-0 text-[14px] py-2 outline-none"
          placeholder={placeholder}
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && onSend()}
        />
        <button 
          onClick={() => onSend()} 
          disabled={!text.trim()} 
          className={`p-2 ${text.trim() ? 'text-[#0068ff]' : 'text-gray-300'}`}
        >
          <Send size={24} fill={text.trim() ? "currentColor" : "none"} />
        </button>
      </div>
    </div>
  );
};

export default ChatInput;