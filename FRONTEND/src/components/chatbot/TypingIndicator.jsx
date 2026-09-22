import { motion } from 'framer-motion';

const TypingIndicator = ({ avatarLetter }) => (
  <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="flex items-end gap-2 justify-start">
    <div className="w-6 h-6 rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center flex-shrink-0 text-[10px] font-bold text-white">
      {avatarLetter || 'A'}
    </div>
    <div className="bg-[#161616] border border-[#272727] px-4 py-3 rounded-2xl rounded-bl-sm flex gap-1.5 items-center">
      {[0, 0.15, 0.3].map((d, i) => (
        <motion.span key={i} className="w-1.5 h-1.5 bg-gray-500 rounded-full"
          animate={{ y: [0, -4, 0] }}
          transition={{ duration: 0.55, repeat: Infinity, delay: d, ease: 'easeInOut' }} />
      ))}
    </div>
  </motion.div>
);

export default TypingIndicator;
