import React from 'react';

export default function LanguagePopup({ isOpen, onClose, onLanguageSelect }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-8 max-w-md w-full">
        <h2 className="text-2xl font-bold mb-6 text-center">Select course language</h2>
        
        <div className="space-y-4">
          <button
            onClick={() => onLanguageSelect('en')}
            className="w-full flex items-center justify-between p-4 border-2 border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <span className="text-2xl">🇺🇸</span>
            <span className="text-lg font-medium">English</span>
          </button>

          <button
            onClick={() => onLanguageSelect('vi')}
            className="w-full flex items-center justify-between p-4 border-2 border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <span className="text-2xl">🇻🇳</span>
            <span className="text-lg font-medium">Tiếng Việt</span>
          </button>
        </div>

        <button
          onClick={onClose}
          className="mt-6 text-gray-500 hover:text-gray-700 text-sm"
        >
          CANCEL
        </button>
      </div>
    </div>
  );
}
