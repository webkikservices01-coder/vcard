import { motion } from 'framer-motion';

// Renders the interactive control for one step of the "help me pick a plan"
// guided flow — currently only chip-based single-select steps are used
// (see config.js FLOW_STEPS), but text is kept as an option for future steps.
const FlowStep = ({ step, onAnswer }) => {
  if (step.type === 'chips') {
    return (
      <div className="flex flex-wrap gap-2 px-3 pb-3 pt-1">
        {step.options.map(opt => (
          <motion.button
            key={opt}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => onAnswer(opt)}
            className="rounded-full border px-3.5 py-2 text-xs font-semibold transition-colors"
            style={{ borderColor: 'var(--surface-border)', background: 'var(--glass-bg)', color: 'var(--surface-text)' }}
          >
            {opt}
          </motion.button>
        ))}
      </div>
    );
  }
  return null;
};

export default FlowStep;
