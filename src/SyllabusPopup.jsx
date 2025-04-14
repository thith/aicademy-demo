import React, { useEffect, useRef } from 'react';

export default function SyllabusPopup({ isOpen, onClose }) {
  const popupRef = useRef(null);
  
  // Prevent body scroll when popup is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      // Trigger animation
      setTimeout(() => {
        if (popupRef.current) {
          popupRef.current.classList.remove('opacity-0', 'scale-95');
        }
      }, 10);
    } else {
      document.body.style.overflow = 'auto';
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center sm:p-4 bg-black bg-opacity-30 backdrop-blur-sm transition-opacity duration-200">
      <div
        ref={popupRef}
        className="relative bg-white sm:rounded-2xl shadow-xl h-[100vh] sm:h-auto sm:max-h-[90vh] w-[100vw] sm:w-full sm:max-w-3xl overflow-hidden opacity-0 scale-95 transition-all duration-300 transform"
      >
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-600 hover:text-brand-green-dark text-3xl font-light z-10 w-10 h-10 flex items-center justify-center"
          aria-label="Close popup"
        >
          &times;
        </button>
        
        <div className="overflow-y-auto h-full sm:max-h-[80vh] p-4 sm:p-6 md:p-8">
          <div className="flex flex-col gap-4 mb-6">
            <div className="bg-brand-green rounded-full px-2 py-0.5 w-fit flex items-center">
              <span className="text-white text-[10px] font-semibold uppercase tracking-wide">Syllabus</span>
            </div>
            <h1 className="text-2xl font-bold text-brand-green-dark">
              Understanding and Applying AI to Study and Work
            </h1>

            <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-gray-400">
              <div className="flex items-center gap-2">
                <i className="fas fa-user text-brand-green"></i>
                <span>aicademy team</span>
              </div>
              <div className="flex items-center gap-2">
                <i className="fas fa-edit text-brand-green"></i>
                <span>Apr 2025</span>
              </div>
              <div className="flex items-center gap-2">
                <i className="fas fa-user-graduate text-brand-green"></i>
                <span>Beginner</span>
              </div>
              <div className="flex items-center gap-2">
                <i className="fas fa-clock text-brand-green"></i>
                <span>3 hours</span>
              </div>
            </div>

            <hr className="border-t border-gray-200 my-2" />
          </div>

          <div className="space-y-6">
            <div>
              <h4 className="text-xl font-bold mb-2 text-brand-green-dark">1. What even is AI?</h4>
              <p className="text-gray-600 mb-4">
                No fluff. Just the core: how machines "think" and why it matters.
              </p>
            </div>

            <div>
              <h4 className="text-xl font-bold mb-2 text-brand-green-dark">2. Generative AI — The Spark of a New Era</h4>
              <p className="text-gray-600 mb-4">
                From text to images to code. This tech isn't just trending — it's rewriting the rules.
              </p>
            </div>

            <div>
              <h4 className="text-xl font-bold mb-2 text-brand-green-dark">3. Do It With AI</h4>
              <p className="text-gray-600 mb-4">
                Study smarter. Work faster. Create more.
                We'll show you tools to chat, learn, code, draw, edit, compose — and automate.
              </p>
              <div className="bg-brand-green-light/10 rounded-lg p-4 mb-4">
                <p className="font-medium mb-3 text-brand-green-dark">Featured tools:</p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="bg-white p-3 rounded-lg shadow-sm border border-gray-100">
                    <p className="font-medium">ChatGPT</p>
                    <p className="text-sm text-gray-600 mt-1">For questions big or small, every day</p>
                  </div>
                  <div className="bg-white p-3 rounded-lg shadow-sm border border-gray-100">
                    <p className="font-medium">NotebookLM</p>
                    <p className="text-sm text-gray-600 mt-1">For learning deeper, with your own notes</p>
                  </div>
                  <div className="bg-white p-3 rounded-lg shadow-sm border border-gray-100">
                    <p className="font-medium">n8n</p>
                    <p className="text-sm text-gray-600 mt-1">For automating what you'd rather not do</p>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <h4 className="text-xl font-bold mb-2 text-brand-green-dark">4. Prompt Like a Pro</h4>
              <p className="text-gray-600 mb-4">
                Tips and hacks to make AI actually useful.
              </p>
            </div>

            <div>
              <h4 className="text-xl font-bold mb-2 text-brand-green-dark">5. The Edge of Intelligence</h4>
              <p className="text-gray-600 mb-4">
                Agents. Robotics. Autonomous systems. Welcome to the frontlines of AI.
              </p>
            </div>

            <div>
              <h4 className="text-xl font-bold mb-2 text-brand-green-dark">6. The AI Mindset</h4>
              <p className="text-gray-600">
                AI is not here to replace you — it's here to free you.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
