import React from 'react';

export default function ModeTransitionDialog({ 
  isOpen, 
  onClose, 
  onContinue, 
  onStartOver, 
  targetMode 
}) {
  if (!isOpen) return null;

  // Determine text based on which mode we're transitioning to
  const title = targetMode === 'presentation' 
    ? 'Chuyển sang chế độ trình chiếu' 
    : 'Quay lại chế độ đọc';
  
  const description = targetMode === 'presentation'
    ? 'Bạn có muốn tiếp tục từ vị trí hiện tại hay bắt đầu lại từ đầu?'
    : 'Bạn có muốn giữ tiến độ hiện tại hay quay lại trang đang xem trước đó?';

  const continueText = targetMode === 'presentation'
    ? 'Tiếp tục từ vị trí hiện tại'
    : 'Giữ tiến độ hiện tại';

  const startOverText = targetMode === 'presentation'
    ? 'Bắt đầu lại từ đầu'
    : 'Quay lại trang trước đó';

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6 animate-fade-in-up">
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-50 mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-1">{title}</h3>
          <p className="text-gray-600">{description}</p>
        </div>
        
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <button
            onClick={onContinue}
            className="flex items-center justify-center px-4 py-3 bg-brand-green hover:bg-brand-green-dark text-white rounded-lg shadow-sm font-medium transition-colors text-sm"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {continueText}
          </button>
          
          <button
            onClick={onStartOver}
            className="flex items-center justify-center px-4 py-3 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-lg font-medium transition-colors text-sm"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            {startOverText}
          </button>
        </div>
        
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  );
}
