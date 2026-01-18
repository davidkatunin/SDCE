import { useState, useEffect } from "react";
import { Lock } from "lucide-react";

interface CodeEntryModalProps {
  code: string;
  action: 'resume' | 'disable';
  onVerify: (enteredCode: string) => void;
  onClose: () => void;
}

export function CodeEntryModal({ code, action, onVerify, onClose }: CodeEntryModalProps) {
  const [enteredCode, setEnteredCode] = useState("");
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    if (hasError) {
      const timer = setTimeout(() => {
        setHasError(false);
      }, 600); // Match animation duration
      return () => clearTimeout(timer);
    }
  }, [hasError]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (enteredCode.trim() === code) {
      onVerify(enteredCode);
    } else {
      setEnteredCode("");
      setHasError(true);
    }
  };

  const actionText = action === 'resume' ? 'Resume' : 'Turn Off Extension';
  const actionDescription = action === 'resume' 
    ? 'Please enter the following code to resume:' 
    : 'Please enter the following code to turn off the extension:';
  const buttonText = action === 'resume' ? 'Resume' : 'Turn Off';

  return (
    <div className="absolute inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-[#121212] border border-gray-700 rounded-xl w-[300px] p-5 shadow-lg">
        <h2 className="text-white text-lg font-semibold mb-4 flex items-center gap-2">
          <Lock className="w-5 h-5" /> Enter Code to {actionText}
        </h2>
        <div className="mb-4">
          <p className="text-gray-400 text-sm mb-2">
            {actionDescription}
          </p>
          <div className="bg-gray-800/50 border border-purple-500/30 rounded-lg px-4 py-3 mb-4">
            <p className="text-purple-400 text-center text-xl font-mono font-bold tracking-wider select-none">
              {code}
            </p>
          </div>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="flex flex-col gap-3 mb-4">
            <label htmlFor="code-input" className="text-gray-400 text-sm">
              Enter Code:
            </label>
            <input
              id="code-input"
              type="text"
              value={enteredCode}
              onChange={(e) => setEnteredCode(e.target.value.toUpperCase())}
              placeholder="Enter code here"
              className={`bg-gray-800 text-white px-3 py-2 rounded-lg focus:outline-none font-mono tracking-wider text-center transition-all duration-300 border-2 ${
                hasError 
                  ? 'shake-animation border-red-500 focus:ring-2 focus:ring-red-500' 
                  : 'border-transparent focus:ring-2 focus:ring-purple-500'
              }`}
              autoFocus
            />
          </div>
          <div className="flex flex-row gap-2 pt-2 border-t border-white/10">
            <button
              type="button"
              onClick={onClose}
              className="text-gray-400 hover:text-white text-sm px-3 py-1 mt-3 flex-1 hover:cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="bg-gradient-to-r from-blue-500 to-purple-600 text-white text-sm px-3 py-1 rounded-md mt-3 flex-1 hover:cursor-pointer"
            >
              {buttonText}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

