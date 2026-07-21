import Button from './ui/Button';

// Naya prop add kiya: nextText (jiska default value "Next Step" hai)
const ActionPopup = ({ isOpen, onClose, onPreview, onNext, nextText = "Next Step" }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex justify-center items-center z-[9999] p-4 transition-all duration-300">
      <div className="bg-white p-8 rounded-2xl shadow-2xl max-w-sm w-full text-center transform scale-100 animate-in fade-in zoom-in-95 duration-200">
        
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
          </svg>
        </div>

        <h2 className="text-2xl font-bold text-gray-900 mb-2">Saved Successfully!</h2>
        <p className="text-gray-500 mb-8 text-sm">Aapka data save ho gaya hai. Ab aap kya karna chahte hain?</p>
        
        <div className="flex flex-col gap-3">
          <Button
            variant="themed" fullWidth
            onClick={onPreview}
            className="border-2 border-gray-200 text-gray-700 hover:border-brand-600 hover:text-brand-600 hover:bg-gray-50"
          >
            Preview Vcard
          </Button>

          <Button variant="primary" onClick={onNext}>
            {/* Yahan humne nextText variable laga diya */}
            {nextText}
          </Button>

          <Button
            variant="themed" fullWidth
            onClick={onClose}
            className="mt-2 !py-0 !min-h-0 !font-normal text-sm text-gray-400 hover:text-gray-600 underline"
          >
            Close
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ActionPopup;