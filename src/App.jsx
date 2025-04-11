import React, { useState, useEffect, useMemo } from 'react';
import DragDropGame from './DragDropGame';
import Quiz from './Quiz';
import PresentationOverlay from './PresentationOverlay';
import ModeTransitionDialog from './ModeTransitionDialog';
import CatchOriginGame from './CatchOriginGame';

import { getLessonContent } from './config.js';

const mockContent = getLessonContent();

function App() {
  const [currentPage, setCurrentPage] = useState(0);
  const [dragDropGameCorrect, setDragDropGameCorrect] = useState(false);
  const [catchOriginGameCorrect, setCatchOriginGameCorrect] = useState(false);
  const [quizCorrect, setQuizCorrect] = useState(false);
  const [shouldPulse, setShouldPulse] = useState(false);
  const [pulseKey, setPulseKey] = useState(0);

  const [catchOriginResetKey, setCatchOriginResetKey] = useState(0);

  const [dragDropGameCompletedAndNext, setDragDropGameCompletedAndNext] = useState(false);
  const [catchOriginGameCompletedAndNext, setCatchOriginGameCompletedAndNext] = useState(false);
  const [quizCompletedAndNext, setQuizCompletedAndNext] = useState(false);
  const [presentationMode, setPresentationMode] = useState(false);
  const [showModeDialog, setShowModeDialog] = useState(false);
  const [targetMode, setTargetMode] = useState('reading');
  const [previousPage, setPreviousPage] = useState(0);

  // Recalculate pages and page titles based on lessonContent
  const { pages, pageTitles } = useMemo(() => {
    const calculatedPages = [];
    const titles = [];
    let currentPageItems = [];
    let nextPageTitle = 'AI là gì?'; // Default title for the first page

    mockContent.forEach(item => {
      if (item.type === 'page-break') {
        if (currentPageItems.length > 0) {
          calculatedPages.push(currentPageItems);
          titles.push(nextPageTitle);
        }
        currentPageItems = []; // Start a new page
        nextPageTitle = item.title || nextPageTitle; // Set title for the NEXT page
      } else {
        currentPageItems.push(item);
      }
    });

    if (currentPageItems.length > 0) {
      calculatedPages.push(currentPageItems);
      titles.push(nextPageTitle);
    }

    if (calculatedPages.length === 0) {
      calculatedPages.push([]);
      titles.push('AI là gì?');
    }

    return { pages: calculatedPages, pageTitles: titles };
  }, []);


  const { flatSentences, mediaMap } = useMemo(() => {
    // Recalculate flatSentences and mediaMap based on potentially updated lessonContent
    const sentences = [];
    const map = {};
    let counter = 0;

    mockContent.forEach((item) => {
      if (item.type === 'paragraph' || item.type === 'highlight') { // Treat highlight text like paragraph text for presentation
        if (item.title && item.type === 'highlight') { // Add title for highlight block
           sentences.push(item.title);
           counter++; // Always increment counter for highlight titles
        }
        item.value.forEach((line) => {
          const lineSentences = line.match(/[^.!?]+[.!?]+[\])'"`'"]*|.+/g) || [line]; // Handle lines without punctuation
          lineSentences.forEach(sentence => {
            if (sentence.trim()) { // Avoid empty strings
              sentences.push(sentence.trim());
              counter++; // Always increment counter for each sentence
            }
          });
        });
      } else if (item.type === 'game') {
        sentences.push(`🔍 ${item.title}`); // Placeholder text
        map[counter] = {
          type: 'minigame',
          gameType: item.gameType,
          title: item.title,
              instruction: item.instruction,
              element: item.gameType === 'catch-origin' ? (
                <CatchOriginGame
                  title={item.title}
                  instruction={item.instruction}
                  key={counter}
                  onComplete={(correct) => {
                    setCatchOriginGameCorrect(correct);
                    if (correct) {
                      setShouldPulse(true);
                      setPulseKey(Date.now());
                    }
                  }}
                  mode="presentation"
                  winningThreshold={
                    item.winningThreshold || 8
                  }
                  baskets={item.baskets || []}
                  basketIcons={item.basketIcons || {}}
                  items={item.items || []}
                />
              ) : (
                <DragDropGame
                  title={item.title}
                  instruction={item.instruction}
                  onCorrect={(correct) => {
                    setDragDropGameCorrect(correct);
                    if (correct) {
                      setShouldPulse(true);
                      setPulseKey(Date.now());
                    }
                  }}
                  mode="presentation"
                  items={item.items || []}
                  categories={item.categories || []}
                  correctPairs={item.correctPairs || {}}
                />
              )
        };
        counter++;
      } else if (item.type === 'image') {
        sentences.push("🌍 Hình ảnh minh họa:"); // Placeholder text
        map[counter] = {
          type: 'image',
          element: (
            <img
              src={item.src}
              alt={item.alt}
              className="rounded shadow mx-auto my-4"
            />
          )
        };
        counter++;
      } else if (item.type === 'quiz') {
        // Add a placeholder for the quiz in the presentation mode
        sentences.push(`🧠 ${item.title}`);
        map[counter] = {
          type: 'quiz',
          element: (
            <Quiz
              title={item.title}
              questions={item.questions}
              onCorrect={(correct) => {
                setQuizCorrect(correct);
                if (correct) {
                  setShouldPulse(true);
                  setPulseKey(Date.now());
                }
              }}
              mode="reading"
            />
          )
        };
        counter++;
      } else if (item.type === 'video') {
        sentences.push(`🎬 ${item.title}`); // Placeholder text
        map[counter] = {
          type: 'video',
          src: item.src,
          title: item.title,
          element: null // Rendered specially in PresentationOverlay
        };
        counter++;
      }
      // Ignore page-break type
    });
    return { flatSentences: sentences, mediaMap: map };
  }, []); // Rerun if mockContent changes

  const handleNext = () => {
    // Reset pulse effect when user clicks Next (Continue)
    setShouldPulse(false);

    // Find current page index based on currentPage state
    const dragDropPageIndex = pages.findIndex(page => page.some(item => item.type === 'game' && item.gameType !== 'catch-origin'));
    const catchOriginPageIndex = pages.findIndex(page => page.some(item => item.type === 'game' && item.gameType === 'catch-origin'));
    const quizPageIndex = pages.findIndex(page => page.some(item => item.type === 'quiz'));

    if (currentPage === dragDropPageIndex && !dragDropGameCorrect) return;
    if (currentPage === catchOriginPageIndex && !catchOriginGameCorrect) return;
    if (currentPage === quizPageIndex && !quizCorrect) return;

    // If user has completed the game/quiz and clicks Next, set completedAndNext = true
    if (currentPage === dragDropPageIndex && dragDropGameCorrect) setDragDropGameCompletedAndNext(true);
    if (currentPage === catchOriginPageIndex && catchOriginGameCorrect) setCatchOriginGameCompletedAndNext(true);
    if (currentPage === quizPageIndex && quizCorrect) setQuizCompletedAndNext(true);

    setCurrentPage((p) => Math.min(p + 1, pages.length - 1));
  };

  const handlePrev = () => setCurrentPage((p) => Math.max(p - 1, 0));

  // Function to reset a specific activity
  const resetActivity = (type) => {
    if (type === 'dragDrop') {
      setDragDropGameCorrect(false);
      setDragDropGameCompletedAndNext(false);
    } else if (type === 'catchOrigin') {
      setCatchOriginGameCorrect(false);
      setCatchOriginGameCompletedAndNext(false);
    } else if (type === 'quiz') {
      setQuizCorrect(false);
      setQuizCompletedAndNext(false);
    }
  };

  // Function to calculate the starting sentence index for Presentation Mode
 const calculateInitialSentenceIndex = (targetPage) => {
    let currentItemIndex = 0;
    for (let pageIdx = 0; pageIdx < pages.length && pageIdx < targetPage; pageIdx++) {
      pages[pageIdx].forEach(item => {
        if (item.type === 'paragraph' || item.type === 'highlight') {
           if (item.title && item.type === 'highlight') {
               currentItemIndex++; // Count title as a step
           }
          item.value.forEach(line => {
            const sentences = line.match(/[^.!?]+[.!?]+[\])'"`'"]*|.+/g) || [];
            sentences.forEach(sentence => {
              if(sentence.trim()) currentItemIndex++;
            });
          });
        } else if (item.type !== 'page-break') { // Count other non-page-break items as one step
          currentItemIndex++;
        }
      });
    }
    return currentItemIndex;
 };


  return (
    // Use brand-gray-light and ensure min-height for footer stickiness
    <div className="flex flex-col min-h-screen bg-brand-gray-light font-sans">
      {/* Header: White bg, bottom border instead of shadow, increased padding */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-20">
        {/* Adjust max-width and padding to match design */}
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex justify-between items-center w-full">
           {/* Title styling - slightly larger */}
           {/* Dynamically set header title based on current page? */}
           <h1 className="text-2xl font-bold text-brand-gray-darker">
             {`Page ${currentPage + 1}: ${pageTitles[currentPage] || 'AI là gì?'}`}
           </h1>
          {/* Presentation Mode Button: Match green button style from design */}
          <button
            onClick={() => {
              // Use lastSentenceIndex if available, else fallback to page start
              const initialIndex = window.lastSentenceIndex ?? calculateInitialSentenceIndex(currentPage);
              window.initialSentenceIndex = initialIndex;

              if (currentPage === 0) {
                 window.initialSentenceIndex = 0;
                 setPresentationMode(true);
              } else {
                setTargetMode('presentation');
                setPreviousPage(currentPage);
                setShowModeDialog(true);
              }
            }}
            className="px-5 py-2 bg-brand-gray-darker hover:bg-brand-gray-darker text-gray-100 hover:text-yellow-400 rounded-lg shadow-sm font-semibold transition-colors text-sm" // Rounded-lg, font-semibold, text-sm
          >
            <i className="hidden sm:inline fas fa-film"></i>
            <span className="ml-0 sm:ml-1">Theater<span className="hidden sm:inline"> Mode</span></span>
          </button>
        </div>
      </header>

      {/* Main content area: Apply gradient, adjust padding */}
      <main className="flex-1 overflow-y-auto p-0 sm:px-6 lg:px-8 sm:py-8 bg-course-gradient">
        {/* Content card: white bg, rounded-xl, larger shadow, more padding */}
        <div className="bg-white md:mx-auto p-3 pt-5 sm:p-8 md:p-10 rounded-xl shadow-lg lg:max-w-4xl w-full">
          {pages[currentPage]?.map((item, idx) => { // Add optional chaining for safety
            switch (item.type) {
              case 'paragraph':
                // Check for the 'info' style
                if (item.style === 'info') {
                  return (
                    <p key={idx} className="mt-4 text-sm text-gray-500 italic"> {/* Adjusted styling */}
                      👉 {item.value.join(' ')} {/* Added emoji */}
                    </p>
                  );
                }
                // Default paragraph rendering
                return (
                  <p key={idx} className="mb-6 text-base text-brand-gray-dark leading-relaxed">
                    {item.value.join(' ')}
                  </p>
                );
            case 'game':
              if (item.gameType === 'catch-origin') {
                return (
                  <div key={idx} className="my-6">
                    
                    <div className="relative p-0 sm:p-4">
                      {/* Show completion status and try again button if completed */}
                      {catchOriginGameCompletedAndNext && (
                        <>
                          {/* Semi-transparent overlay to prevent interaction */}
                          <div className="absolute inset-0 bg-white bg-opacity-50 z-10 flex flex-col items-center justify-center rounded-lg">
                            <div className="bg-green-100 text-green-800 font-medium px-4 py-2 rounded-lg shadow-md mb-3">
                              ✓ Game completed successfully!
                            </div>
                            <button 
                              onClick={() => {
                                resetActivity('catchOrigin');
                                setCatchOriginResetKey(k => k + 1);
                              }}
                              className="px-4 py-2 bg-brand-green hover:bg-brand-green-dark text-white rounded-lg shadow-sm text-sm font-medium"
                            >
                              Try Again
                            </button>
                          </div>
                          
                        </>
                      )}
                      
                      <CatchOriginGame
                        title={item.title}
                        instruction={item.instruction}
                        key={catchOriginResetKey}
                        onComplete={(success) => {
                          setCatchOriginGameCorrect(success);
                        }}
                        mode={presentationMode ? 'presentation' : 'reading'}
                        started={!catchOriginGameCompletedAndNext}
                        winningThreshold={
                          mockContent.find(
                            (item) => item.type === 'game' && item.gameType === 'catch-origin'
                          )?.winningThreshold || 8
                        }
                        baskets={
                          mockContent.find(
                            (item) => item.type === 'game' && item.gameType === 'catch-origin'
                          )?.baskets || []
                        }
                        basketIcons={
                          mockContent.find(
                            (item) => item.type === 'game' && item.gameType === 'catch-origin'
                          )?.basketIcons || {}
                        }
                        items={
                          mockContent.find(
                            (item) => item.type === 'game' && item.gameType === 'catch-origin'
                          )?.items || []
                        }
                      />
                    </div>
                  </div>
                );
              }
              return (
                <div key={idx} className="my-6">
                  <div className="relative">
                    {/* Show completion status and try again button if completed */}
                    {dragDropGameCompletedAndNext && (
                      <>
                        {/* Semi-transparent overlay to prevent interaction */}
                        <div className="absolute inset-0 bg-white bg-opacity-50 z-10 flex flex-col items-center justify-center rounded-lg">
                          <div className="bg-green-100 text-green-800 font-medium px-4 py-2 rounded-lg shadow-md mb-3">
                            ✓ Game completed successfully!
                          </div>
                          <button 
                            onClick={() => resetActivity('dragDrop')}
                            className="px-4 py-2 bg-brand-green hover:bg-brand-green-dark text-white rounded-lg shadow-sm text-sm font-medium"
                          >
                            Try Again
                          </button>
                        </div>
                        
                      </>
                    )}
                    
                    <DragDropGame
                      title={item.title}
                      instruction={item.instruction}
                      onCorrect={setDragDropGameCorrect}
                      mode="reading"
                      items={item.items || []}
                      categories={item.categories || []}
                      correctPairs={item.correctPairs || {}}
                    />
                  </div>
                </div>
              );
            case 'quiz':
              return (
                <div key={idx} className="my-6">
                  <h4 className="text-md font-semibold mb-3 text-brand-gray-dark">{item.title}</h4>
                  
                  <div className="relative">
                    {/* Show completion status and try again button if completed */}
                    {quizCompletedAndNext && (
                      <>
                        {/* Semi-transparent overlay to prevent interaction */}
                        <div className="absolute inset-0 bg-white bg-opacity-50 z-10 flex flex-col items-center justify-center rounded-lg">
                          <div className="bg-green-100 text-green-800 font-medium px-4 py-2 rounded-lg shadow-md mb-3">
                            ✓ Quiz completed successfully!
                          </div>
                          <button 
                            onClick={() => resetActivity('quiz')}
                            className="px-4 py-2 bg-brand-green hover:bg-brand-green-dark text-white rounded-lg shadow-sm text-sm font-medium"
                          >
                            Try Again
                          </button>
                        </div>
                        
                      </>
                    )}
                    
                    <Quiz
                      title={item.title}
                      questions={item.questions}
                      onCorrect={setQuizCorrect}
                      mode="reading"
                    />
                  </div>
                </div>
              );
            case 'image':
              return (
                <img
                  key={idx}
                  src={item.src}
                  alt={item.alt}
                  className="rounded shadow mx-auto my-4" // Keep shadow for image
                />
              );
            case 'video':
              return (
                <div key={idx} className="my-6">
                   <hr className="my-6 border-gray-300" />
                   <h4 className="text-md font-semibold mb-3 text-brand-gray-dark">{item.title}</h4>
                   <div className="relative w-full" style={{ paddingTop: '56.25%' }}>
                     <iframe
                       src={item.src} // No autoplay in reading mode
                       title={item.title}
                       frameBorder="0"
                       allow="fullscreen; picture-in-picture"
                       allowFullScreen
                       className="absolute top-0 left-0 w-full h-full rounded-lg" // No shadow
                     ></iframe>
                   </div>
                </div>
              );
             case 'highlight': // Render highlight box in Reading Mode
               return (
                 <div key={idx} className="my-6 p-5 bg-green-50 rounded-lg text-base"> {/* Light green bg, larger text */}
                   <h4 className="font-semibold text-green-800 mb-2">{item.title}</h4>
                   <p className="text-green-700 leading-relaxed">{item.value.join(' ')}</p> {/* Adjusted leading */}
                 </div>
               );
            default:
              return null;
          }
          })}
        </div>
      </main>

      {/* Footer: White background, top border, consistent padding */}
      <footer className="bg-white border-t border-gray-200 sticky bottom-0 z-10">
         {/* Adjust max-width and padding */}
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between w-full">
          {/* Previous Button: Lighter style */}
          <button
            onClick={handlePrev}
            className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-brand-gray-dark rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm font-medium"
            disabled={currentPage === 0}
          >
            Previous
          </button>
          {/* Page Indicator: Darker text */}
          <span className="text-sm text-brand-gray font-medium">
            Page {currentPage + 1} / {pages.length}
          </span>
          {/* Next Button: Match green button style */}
          <button
            onClick={handleNext}
            className="px-5 py-2 bg-brand-green hover:bg-brand-green-dark text-white rounded-lg shadow-sm disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm font-semibold" // Added font-semibold
            disabled={
              (pages[currentPage]?.some(item => item.type === 'game' && item.gameType !== 'catch-origin') && !dragDropGameCorrect) ||
              (pages[currentPage]?.some(item => item.type === 'game' && item.gameType === 'catch-origin') && !catchOriginGameCorrect) ||
              (pages[currentPage]?.some(item => item.type === 'quiz') && !quizCorrect) ||
              currentPage === pages.length - 1
            }
          >
            Next
          </button>
        </div>
      </footer>

      {presentationMode && (
        <PresentationOverlay
          isVisible={presentationMode}
          shouldPulse={shouldPulse}
          pulseKey={pulseKey}
          onClose={(lastSentenceIndex) => {
            // Calculate the reading page corresponding to the last sentence shown
            let currentItemIndex = 0;
            let targetPage = 0;
             for (let pageIdx = 0; pageIdx < pages.length; pageIdx++) {
               let foundOnPage = false;
               pages[pageIdx].forEach(item => {
                 if (item.type === 'paragraph' || item.type === 'highlight') {
                    if (item.title && item.type === 'highlight') {
                        if (currentItemIndex === lastSentenceIndex) {
                            targetPage = pageIdx;
                            foundOnPage = true;
                        }
                        currentItemIndex++;
                    }
                    if (foundOnPage) return; // Optimization: stop checking items on this page if found

                   item.value.forEach(line => {
                     const sentences = line.match(/[^.!?]+[.!?]+[\])'"`'"]*|.+/g) || [];
                      sentences.forEach(sentence => {
                         if(sentence.trim()) {
                             if (currentItemIndex === lastSentenceIndex) {
                                 targetPage = pageIdx;
                                 foundOnPage = true;
                             }
                             currentItemIndex++;
                         }
                         if (foundOnPage) return; // Optimization
                      });
                      if (foundOnPage) return; // Optimization
                   });
                 } else if (item.type !== 'page-break') {
                    if (currentItemIndex === lastSentenceIndex) {
                        targetPage = pageIdx;
                        foundOnPage = true;
                    }
                    currentItemIndex++;
                 }
                 if (foundOnPage) return; // Optimization
               });
                // If the target page was found on this page, break the outer loop
               if (foundOnPage) {
                   break;
               }
               // If it's the last page and we haven't found it, default to last page
               if (pageIdx === pages.length - 1) {
                   targetPage = pageIdx;
               }
             }

            setCurrentPage(targetPage); // Set the reading page
            setPresentationMode(false); // Close the overlay
          }}
          sentences={flatSentences}
          mediaMap={mediaMap}
          dragDropGameCorrect={dragDropGameCorrect}
          catchOriginGameCorrect={catchOriginGameCorrect}
          quizCorrect={quizCorrect}
          initialSentenceIndex={window.initialSentenceIndex || 0}
          mode={presentationMode ? 'presentation' : 'reading'} // Pass mode to overlay
          onRestart={() => {
            setDragDropGameCorrect(false);
            setCatchOriginGameCorrect(false);
            setQuizCorrect(false);
            setDragDropGameCompletedAndNext(false);
            setCatchOriginGameCompletedAndNext(false);
            setQuizCompletedAndNext(false);
            setShouldPulse(false);
            setPulseKey(0);
            window.initialSentenceIndex = 0;
            setCurrentPage(0);
            setPresentationMode(false);
            setTimeout(() => setPresentationMode(true), 0); // Remount overlay
          }}
        />
      )}

      {/* Mode Transition Dialog */}
      <ModeTransitionDialog
        isOpen={showModeDialog}
        onClose={() => setShowModeDialog(false)}
        targetMode={targetMode}
        onContinue={() => {
          setShowModeDialog(false);
          if (targetMode === 'presentation') {
            setPresentationMode(true); // initialSentenceIndex is already set on window
          }
          // No 'else' needed as returning to reading is handled by PresentationOverlay's onClose
        }}
        onStartOver={() => {
          setShowModeDialog(false);
          if (targetMode === 'presentation') {
            setDragDropGameCorrect(false);
            setCatchOriginGameCorrect(false);
            setQuizCorrect(false);
            setDragDropGameCompletedAndNext(false);
            setCatchOriginGameCompletedAndNext(false);
            setQuizCompletedAndNext(false);
            window.initialSentenceIndex = 0; // Reset index for start over
            setCurrentPage(0); // Go to first page for presentation start over
            setPresentationMode(true);
          }
          // No 'else' needed
        }}
      />
    </div>
  );
}

export default App;
