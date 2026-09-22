import { Mic, Square, ArrowUp } from 'lucide-react';
import { useSpeech } from './useSpeech';
import IconButton from '../ui/IconButton';

const ChatInput = ({ value, onChange, onSubmit, isBusy, inputRef }) => {
  const { isListening, isSupported, toggleListening } = useSpeech((transcript) => {
    onChange(transcript);
    if (transcript.trim()) setTimeout(() => onSubmit(transcript), 150);
  });

  const handleSubmit = (e) => {
    e?.preventDefault();
    if (!value.trim() || isBusy) return;
    onSubmit(value);
  };

  return (
    <form onSubmit={handleSubmit} className="px-2.5 pt-2.5 pb-2.5 bg-[#0f0f0f] border-t border-[#232323] flex items-center gap-1.5 flex-shrink-0">
      <input
        ref={inputRef} type="text" value={value} onChange={e => onChange(e.target.value)}
        placeholder={isListening ? 'Listening…' : 'Type a message…'}
        disabled={isBusy || isListening}
        className="flex-1 min-w-0 bg-[#0a0a0a] border border-[#2a2a2a] text-white text-sm px-3.5 py-2.5 rounded-full focus:outline-none focus:border-indigo-500/50 transition-colors placeholder:text-gray-600 disabled:opacity-50"
        onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSubmit(); } }}
      />

      {isSupported && (
        <IconButton
          type="button" size="sm" variant="bare" onClick={toggleListening}
          animate={isListening ? { scale: [1, 1.1, 1] } : { scale: 1 }}
          transition={isListening ? { repeat: Infinity, duration: 0.9 } : {}}
          className={`rounded-full border ${
            isListening
              ? 'bg-red-500 border-red-400 text-white shadow-[0_0_10px_rgba(239,68,68,0.45)]'
              : 'bg-[#1a1a1a] border-[#333] text-gray-400 hover:text-white hover:border-gray-500'
          }`}
          title={isListening ? 'Listening… (auto-sends)' : 'Speak your message'}
        >
          {isListening ? <Square className="w-3 h-3 fill-current" /> : <Mic className="w-4 h-4" />}
        </IconButton>
      )}

      <IconButton
        type="submit" size="sm" variant="bare"
        disabled={isBusy || !value.trim()}
        title="Send message"
        className="rounded-full"
        style={{ background: (!isBusy && value.trim()) ? 'linear-gradient(135deg,#6366f1,#8b5cf6)' : '#1a1a1a' }}
      >
        <ArrowUp className="w-4 h-4" style={{ color: (!isBusy && value.trim()) ? '#fff' : '#555' }} />
      </IconButton>
    </form>
  );
};

export default ChatInput;
