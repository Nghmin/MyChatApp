import React, { useState, useRef, useEffect } from 'react';
import { Send, Smile } from 'lucide-react';
import EmojiPicker from 'emoji-picker-react';
import ChatUploadTool from './ChatUploadTool';

const ChatInput = ({ text, setText, onSend, onSendMedia, placeholder }) => {
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const pickerRef = useRef(null);

  const onEmojiClick = (emojiData) => {
    setText((prevText) => prevText + emojiData.emoji);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (pickerRef.current && !pickerRef.current.contains(event.target)) {
        setShowEmojiPicker(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSendAction = () => {
    onSend();
    setShowEmojiPicker(false);
  };

  return (
    <div className="bg-white border-t border-gray-200 relative">
      <ChatUploadTool onUploadSuccess={onSendMedia} />

      {/* Bảng Emoji Picker */}
      {showEmojiPicker && (
        <div className="absolute bottom-full right-0 mb-2 z-50" ref={pickerRef}>
          <EmojiPicker 
            onEmojiClick={onEmojiClick}
            autoFocusSearch={false}
            width={320}
            height={400}
            skinTonesDisabled
            searchPlaceHolder="Tìm icon..."
          />
        </div>
      )}

      <div className="flex items-center gap-1 px-3 py-1">
        <input 
          className="flex-1 bg-transparent border-none focus:ring-0 text-[14px] py-2 outline-none"
          placeholder={placeholder}
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSendAction()}
        />

        {/* Nút Emoji */}
        <button
          type="button"
          onClick={() => setShowEmojiPicker(!showEmojiPicker)}
          className={`p-2 transition-colors ${showEmojiPicker ? 'text-[#0068ff]' : 'text-gray-500 hover:text-[#0068ff]'}`}
        >
          <Smile size={24} />
        </button>

        {/* Nút Gửi */}
        <button 
          onClick={handleSendAction} 
          disabled={!text.trim()} 
          className={`p-2 transition-colors ${text.trim() ? 'text-[#0068ff]' : 'text-gray-300'}`}
        >
          <Send size={24} fill={text.trim() ? "currentColor" : "none"} />
        </button>
      </div>
    </div>
  );
};

export default ChatInput;