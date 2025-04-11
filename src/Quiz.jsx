import React, { useState, useEffect } from 'react';

export default function Quiz({ title, questions, onCorrect, mode = 'reading', externalTriggerCheck = false }) {
  // Use controlled state based on whether it's checked and correct
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [showIncorrect, setShowIncorrect] = useState({}); // Track which answers were marked incorrect on last check
  const [checked, setChecked] = useState(false); // Tracks if *a* check has been performed
  const [isCorrectOverall, setIsCorrectOverall] = useState(false); // Tracks if the *last* check was correct

  // Reset component state if questions change (e.g., navigating pages)
  useEffect(() => {
    setSelectedAnswers({});
    setShowIncorrect({});
    setChecked(false);
    setIsCorrectOverall(false);
  }, [questions]);
  
  // Watch for external trigger to check results
  useEffect(() => {
    if (externalTriggerCheck && !isCorrectOverall && Object.keys(selectedAnswers).length === questions.length) {
      handleCheck();
    }
  }, [externalTriggerCheck, questions.length]);

  const handleSelect = (qIndex, option) => {
    // Allow changing answer only if the quiz hasn't been successfully completed yet
    if (isCorrectOverall) return;

    setSelectedAnswers(prev => ({ ...prev, [qIndex]: option.charAt(0) }));
    // Reset incorrect status for this question if user changes answer after a check
    if (checked) {
        setShowIncorrect(prev => ({...prev, [qIndex]: false}));
    }
    // Reset overall checked status when an answer is changed after a check
    setChecked(false);
    setIsCorrectOverall(false);
    onCorrect(false); // Notify parent that it's no longer considered correct
  };

  const handleCheck = () => {
    if (isCorrectOverall) return; // Don't re-check if already correct

    const correct = questions.every((q, i) => selectedAnswers[i] === q.answer);
    const incorrectStatus = {};
    questions.forEach((q, i) => {
        if (selectedAnswers[i] && selectedAnswers[i] !== q.answer) {
            incorrectStatus[i] = true; // Mark specific incorrect answers
        }
    });

    setChecked(true); // Mark that a check has been performed
    setIsCorrectOverall(correct); // Store if this check was successful
    setShowIncorrect(incorrectStatus); // Show which specific answers were wrong
    onCorrect(correct); // Notify parent
  };

  const isDarkMode = mode === 'presentation';

  return (
    <div className={`quiz-box p-1 sm:p-8 my-6 rounded-xl shadow-lg border ${
        isDarkMode 
          ? 'bg-gray-800 border-gray-700 text-white max-sm:border-none max-sm:bg-transparent max-sm:shadow-none max-sm:rounded-none max-sm:p-3 max-sm:my-0'
          : 'bg-white border-gray-200 text-brand-gray-darker'
      } ${checked && isCorrectOverall ? '!border-brand-green' : ''}`}>
      <h3 className={`text-lg font-semibold mb-5 ${isDarkMode ? 'text-white' : 'text-brand-gray-darker'}`}>{title}</h3>
      {questions.map((q, qIndex) => (
        <div key={qIndex} className={`mb-6 pb-6 ${isDarkMode ? 'border-b border-gray-700' : 'border-b border-gray-200'} last:border-b-0 last:pb-0`}>
          <p className={`font-medium mb-4 ${isDarkMode ? 'text-gray-100' : 'text-brand-gray-darker'}`}>{q.question}</p>
          <div className="space-y-3">
            {q.options.map((option, oIndex) => {
              const letter = option.charAt(0);
              const isSelected = selectedAnswers[qIndex] === letter;
              const isCorrectAnswer = q.answer === letter;

              const baseButtonClass = 'block w-full text-left px-4 py-2.5 rounded-md border transition-colors text-sm font-medium shadow-sm disabled:opacity-70 disabled:cursor-not-allowed';
              let stateClasses = '';

              if (checked && isSelected && !isCorrectAnswer) {
                 // Incorrectly selected after check
                 stateClasses = isDarkMode
                   ? 'bg-red-800 border-red-600 text-red-100 ring-1 ring-red-600'
                   : 'bg-red-100 border-red-400 text-red-700 ring-1 ring-red-400';
              } else if (checked && isCorrectOverall && isCorrectAnswer) {
                 // Correctly selected after successful check
                 stateClasses = isDarkMode
                   ? 'bg-brand-green-dark border-brand-green text-white ring-1 ring-brand-green'
                   : 'bg-brand-green-light border-brand-green text-brand-green-dark ring-1 ring-brand-green';
              } else if (isSelected) {
                 // Selected before check, or selected after incorrect check
                 stateClasses = isDarkMode
                   ? 'bg-gray-600 border-blue-500 text-white ring-1 ring-blue-500'
                   : 'bg-blue-50 border-blue-400 text-blue-800 ring-1 ring-blue-400';
              } else {
                 // Default unselected state
                 stateClasses = isDarkMode
                   ? 'bg-gray-700 border-gray-600 text-gray-200 hover:bg-gray-600'
                   : 'bg-white border-gray-300 text-brand-gray-dark hover:bg-gray-50';
                 // Dim if checked and this wasn't the selection
                 if (checked) {
                    stateClasses += ' opacity-60';
                 }
              }

              const optionClass = `${baseButtonClass} ${stateClasses}`;

              return (
                <button
                  key={oIndex}
                  onClick={() => handleSelect(qIndex, option)}
                  className={optionClass}
                  disabled={isCorrectOverall} // Disable only when successfully completed
                >
                  {option}
                </button>
              );
            })}
          </div>

            {/* Show explanation ONLY if the entire quiz is checked and correct */}
            {checked && isCorrectOverall && (
              <div className={`mt-4 p-3 rounded-md text-sm ${
                isDarkMode ? 'bg-green-900 bg-opacity-50 text-green-200' : 'bg-green-50 text-green-800'
              }`}>
                {q.explanation}
              </div>
            )}
             {/* Show "Incorrect" hint if checked, this specific answer is wrong */}
             {checked && !isCorrectOverall && showIncorrect[qIndex] && (
                 <div className={`mt-4 p-3 rounded-md text-sm ${
                    isDarkMode ? 'bg-red-900 bg-opacity-50 text-red-200' : 'bg-red-50 text-red-800'
                 }`}>
                    🤔 Có vẻ chưa đúng...
                 </div>
             )}
        </div>
      ))}

      <div className="mt-6 flex justify-end">
        <button
          onClick={handleCheck}
          disabled={Object.keys(selectedAnswers).length !== questions.length || isCorrectOverall} // Disable if not all answered or already correct
          className={`px-5 py-2.5 bg-brand-green hover:bg-brand-green-dark text-white rounded-md shadow font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
             isDarkMode ? 'disabled:bg-gray-600' : 'disabled:bg-gray-300 disabled:text-gray-500' // Added disabled text color for light mode
          }`}
        >
          {isCorrectOverall ? 'Đã hoàn thành ✅' : (checked ? 'Thử lại?' : 'Kiểm tra kết quả')}
        </button>
      </div>
    </div>
  );
}
