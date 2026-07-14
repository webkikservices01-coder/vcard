import { useState } from 'react';
import { motion } from 'framer-motion';
import { Copy, Check, Volume2, VolumeX } from 'lucide-react';
import { BotMessage } from './markdown';
import { speakText } from './useSpeech';

const MessageBubble = ({ msg, avatarLetter }) => {
  const [copied, setCopied] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const isUser = msg.role === 'user';

  const handleCopy = () => {
    navigator.clipboard.writeText(msg.content).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    });
  };

  const handleSpeak = () => {
    if (speaking) { window.speechSynthesis?.cancel(); setSpeaking(false); return; }
    setSpeaking(true);
    speakText(msg.content);
    const check = setInterval(() => {
      if (!window.speechSynthesis?.speaking) { setSpeaking(false); clearInterval(check); }
    }, 300);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 8, scale: 0.98 }} animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.22, ease: 'easeOut' }}
      className={`flex items-end gap-2 group ${isUser ? 'justify-end' : 'justify-start'}`}
    >
      {!isUser && (
        <div className="w-6 h-6 rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center flex-shrink-0 mb-0.5 text-[10px] font-bold text-white">
          {avatarLetter || 'A'}
        </div>
      )}

      <div className="max-w-[82%] space-y-1">
        <div className={`px-3.5 py-2.5 rounded-2xl text-sm ${
          isUser
            ? 'bg-white text-black rounded-br-sm font-medium'
            : 'bg-[#161616] border border-[#272727] text-gray-200 rounded-bl-sm font-light'
        }`}>
          {isUser ? <span className="whitespace-pre-wrap">{msg.content}</span> : <BotMessage text={msg.content} />}
        </div>

        {!isUser && (
          <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity pl-1">
            <button onClick={handleCopy} title="Copy" className="p-1 rounded-lg text-gray-600 hover:text-white hover:bg-white/5 transition-all">
              {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
            </button>
            <button onClick={handleSpeak} title={speaking ? 'Stop' : 'Read aloud'}
              className={`p-1 rounded-lg transition-all ${speaking ? 'text-indigo-400' : 'text-gray-600 hover:text-white hover:bg-white/5'}`}>
              {speaking ? <VolumeX className="w-3 h-3" /> : <Volume2 className="w-3 h-3" />}
            </button>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default MessageBubble;
