import { Trash2, X } from 'lucide-react';
import IconButton from '../ui/IconButton';

const ChatHeader = ({ aiName, avatarLetter, onClear, onClose }) => (
  <div className="bg-[#0f0f0f] border-b border-[#232323] px-4 py-3 flex items-center justify-between flex-shrink-0">
    <div className="flex items-center gap-2.5">
      <div className="relative flex-shrink-0">
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-[12px] font-bold text-white">
          {avatarLetter || 'A'}
        </div>
        <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-[#0f0f0f]" />
      </div>
      <div>
        <p className="text-white text-[13px] font-semibold leading-none tracking-[-0.2px]">{aiName}</p>
        <p className="text-gray-500 text-[10px] mt-1 flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block" />
          Online now
        </p>
      </div>
    </div>
    <div className="flex items-center gap-1">
      <IconButton variant="bare" onClick={onClear} title="Clear chat" className="text-gray-600 hover:text-white hover:bg-white/5">
        <Trash2 className="w-3.5 h-3.5" />
      </IconButton>
      <IconButton variant="bare" onClick={onClose} title="Close" className="text-gray-600 hover:text-white hover:bg-white/5">
        <X className="w-4 h-4" />
      </IconButton>
    </div>
  </div>
);

export default ChatHeader;
