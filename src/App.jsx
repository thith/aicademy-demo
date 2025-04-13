import React, { useState, useEffect, useMemo } from 'react';
import Homepage from './Homepage';
import DragDropGame from './DragDropGame';
import Quiz from './Quiz';
import PresentationOverlay from './PresentationOverlay';
import ModeTransitionDialog from './ModeTransitionDialog';
import CatchOriginGame from './CatchOriginGame';

import { getLessonContent } from './config.js';

const mockContent = getLessonContent();

function App() {
  const [isCourseStarted, setIsCourseStarted] = useState(false);
  const [presentationMode, setPresentationMode] = useState(false);
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
  const [showModeDialog, setShowModeDialog] = useState(false);
  const [targetMode, setTargetMode] = useState('reading');
  const [previousPage, setPreviousPage] = useState(0);

  const handleStartCourse = () => {
    setIsCourseStarted(true);
    setPresentationMode(false);
  };

  const handleStartTheaterMode = () => {
    setIsCourseStarted(true);
    setPresentationMode(true);
  };

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
  }, [mockContent]);

  // Recalculate flatSentences and mediaMap for Presentation Mode
  const { flatSentences, mediaMap } = useMemo(() => {
    const sentences = [];
    const map = {};
    let counter = 0; // Global sentence/item counter

    mockContent.forEach((item) => {
      if (item.type === 'paragraph' || item.type === 'highlight') {
        if (item.title && item.type === 'highlight') {
           sentences.push(item.title);
           counter++;
        }
        item.value.forEach((line) => {
          const lineSentences = line.match(/[^.!?]+[.!?]+[\])'"`'"]*|.+/g) || [line];
          lineSentences.forEach(sentence => {
            if (sentence.trim()) {
              sentences.push(sentence.trim());
              counter++;
            }
          });
        });
      } else if (item.type === 'voiced-text') {
        // Iterate through paragraphs and sentences for voiced-text
        item.paragraphs.forEach((paragraph) => {
          paragraph.sentences.forEach((sentenceData) => {
            const sentenceText = sentenceData.text;
            // Treat each sentence as a step in presentation mode
            if (sentenceText.trim()) {
              sentences.push(sentenceText.trim());
              // Store detailed info needed for presentation overlay
              map[counter] = {
                type: 'voiced-text',
                src: item.src, // Audio source for the whole block
                text: sentenceText.trim(),
                char_timings: sentenceData.char_timings
              };
              counter++;
            }
          });
        });
      } else if (item.type !== 'page-break') { // Handle other types like game, quiz, image, video
        sentences.push(`[${item.type}] ${item.title || ''}`); // Placeholder text
        map[counter] = {
          type: item.type,
          ...(item.type === 'game' && { gameType: item.gameType }),
          title: item.title,
          ...(item.type === 'game' && { instruction: item.instruction }),
          ...(item.type === 'game' && { element: item.gameType === 'catch-origin' ? (
            <CatchOriginGame
              key={counter} // Use counter for unique key
              onComplete={(correct) => { setCatchOriginGameCorrect(correct); if (correct) { setShouldPulse(true); setPulseKey(Date.now()); } }}
              mode="presentation"
              winningThreshold={item.winningThreshold || 8}
              baskets={item.baskets || []}
              basketIcons={item.basketIcons || {}}
              items={item.items || []}
            />
          ) : (
            <DragDropGame
              key={counter} // Use counter for unique key
              title={item.title}
              instruction={item.instruction}
              onCorrect={(correct) => { setDragDropGameCorrect(correct); if (correct) { setShouldPulse(true); setPulseKey(Date.now()); } }}
              mode="presentation"
              items={item.items || []}
              categories={item.categories || []}
              correctPairs={item.correctPairs || {}}
            />
          )}),
          ...(item.type === 'quiz' && {
            element: (
              <Quiz
                key={counter} // Use counter for unique key
                title={item.title}
                questions={item.questions}
                onCorrect={(correct) => { setQuizCorrect(correct); if (correct) { setShouldPulse(true); setPulseKey(Date.now()); } }}
                mode="reading" // Quiz interaction happens in reading mode style even in overlay
              />
            )
          }),
          ...(item.type === 'image' && { src: item.src, alt: item.alt }),
          ...(item.type === 'video' && { src: item.src, title: item.title }),
        };
        counter++;
      }
      // Ignore page-break type
    });
    return { flatSentences: sentences, mediaMap: map };
  }, [mockContent]); // Dependency remains mockContent

  const handleNext = () => {
    setShouldPulse(false);
    const dragDropPageIndex = pages.findIndex(page => page.some(item => item.type === 'game' && item.gameType !== 'catch-origin'));
    const catchOriginPageIndex = pages.findIndex(page => page.some(item => item.type === 'game' && item.gameType === 'catch-origin'));
    const quizPageIndex = pages.findIndex(page => page.some(item => item.type === 'quiz'));

    if (currentPage === dragDropPageIndex && !dragDropGameCorrect) return;
    if (currentPage === catchOriginPageIndex && !catchOriginGameCorrect) return;
    if (currentPage === quizPageIndex && !quizCorrect) return;

    if (currentPage === dragDropPageIndex && dragDropGameCorrect) setDragDropGameCompletedAndNext(true);
    if (currentPage === catchOriginPageIndex && catchOriginGameCorrect) setCatchOriginGameCompletedAndNext(true);
    if (currentPage === quizPageIndex && quizCorrect) setQuizCompletedAndNext(true);

    setCurrentPage((p) => Math.min(p + 1, pages.length - 1));
  };

  const handlePrev = () => setCurrentPage((p) => Math.max(p - 1, 0));

  const resetActivity = (type) => {
    if (type === 'dragDrop') { setDragDropGameCorrect(false); setDragDropGameCompletedAndNext(false); }
    else if (type === 'catchOrigin') { setCatchOriginGameCorrect(false); setCatchOriginGameCompletedAndNext(false); setCatchOriginResetKey(k => k + 1); } // Also reset key for catch origin
    else if (type === 'quiz') { setQuizCorrect(false); setQuizCompletedAndNext(false); }
  };

  // Function to calculate the starting sentence index for Presentation Mode
  const calculateInitialSentenceIndex = (targetPage) => {
    let currentItemIndex = 0;
    for (let pageIdx = 0; pageIdx < pages.length && pageIdx < targetPage; pageIdx++) {
      pages[pageIdx].forEach(item => {
        if (item.type === 'paragraph' || item.type === 'highlight') {
           if (item.title && item.type === 'highlight') { currentItemIndex++; }
           item.value.forEach(line => {
             const sentences = line.match(/[^.!?]+[.!?]+[\])'"`'"]*|.+/g) || [];
             sentences.forEach(sentence => { if(sentence.trim()) currentItemIndex++; });
           });
        } else if (item.type === 'voiced-text') {
            // Count each sentence within each paragraph
            item.paragraphs.forEach(para => {
                para.sentences.forEach(sentenceData => {
                    if (sentenceData.text.trim()) currentItemIndex++;
                });
            });
        } else if (item.type !== 'page-break') {
          currentItemIndex++;
        }
      });
    }
    return currentItemIndex;
 };

  if (!isCourseStarted) {
    return (
      <Homepage
        onStartCourse={handleStartCourse}
        onStartTheaterMode={handleStartTheaterMode}
      />
    );
  }

  // Render the original course content
  return (
    <div className="flex flex-col min-h-screen bg-brand-gray-light font-sans">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex justify-between items-center w-full">
           <div className="flex items-center text-base text-brand-gray-dark">
             <a href="#" onClick={(e) => { e.preventDefault(); setIsCourseStarted(false); }} className="hover:text-brand-green-dark transition-colors flex items-center">
               <i className="fas fa-graduation-cap"></i>
               <span className="ml-1 hidden sm:inline">AI Course</span>
             </a>
             <i className="fas fa-chevron-right mx-2 text-gray-400 text-xs"></i>
             {pageTitles?.[currentPage] && (<span className="text-brand-gray">{pageTitles[currentPage]}</span>)}
           </div>
          <button
            onClick={() => {
              const initialIndex = window.lastSentenceIndex ?? calculateInitialSentenceIndex(currentPage);
              window.initialSentenceIndex = initialIndex;
              if (currentPage === 0) { window.initialSentenceIndex = 0; setPresentationMode(true); }
              else { setTargetMode('presentation'); setPreviousPage(currentPage); setShowModeDialog(true); }
            }}
            className="px-5 py-2 bg-brand-gray-darker hover:bg-brand-gray-darker text-gray-100 hover:text-yellow-400 rounded-lg shadow-sm font-semibold transition-colors text-sm"
          >
            <i className="hidden sm:inline fas fa-film"></i>
            <span className="ml-0 sm:ml-1">Theater<span className="hidden sm:inline"> Mode</span></span>
          </button>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto p-0 sm:px-6 lg:px-8 sm:py-8 bg-course-gradient">
        <div className="bg-white md:mx-auto p-3 pt-5 sm:p-8 md:p-10 rounded-xl shadow-lg lg:max-w-4xl w-full">
          {pages?.[currentPage]?.map((item, idx) => {
            switch (item.type) {
              case 'paragraph':
                return item.style === 'info' ? (
                  <p key={idx} className="mt-4 text-sm text-gray-500 italic">{item.value.join(' ')}</p>
                ) : (
                  <p key={idx} className="mb-6 text-base text-brand-gray-dark leading-relaxed">{item.value.join(' ')}</p>
                );
              case 'voiced-text': // Render voiced-text in reading mode with paragraphs
                return (
                  <div key={idx} className="my-6 text-base text-brand-gray-dark leading-relaxed">
                    {item.paragraphs.map((paragraph, pIdx) => (
                      <p key={pIdx} className="mb-4"> {/* Add margin between paragraphs */}
                        {paragraph.sentences.map((sentence, sIdx) => (
                          <span key={sIdx}>{sentence.text} </span> // Join sentences within a paragraph
                        ))}
                      </p>
                    ))}
                  </div>
                );
              case 'game':
                if (item.gameType === 'catch-origin') {
                  return (
                    <div key={idx} className="my-6">
                      <div className="relative p-0 sm:p-4">
                        {catchOriginGameCompletedAndNext && (
                          <>
                            <div className="absolute inset-0 bg-white bg-opacity-50 z-10 flex flex-col items-center justify-center rounded-lg">
                              <div className="bg-green-100 text-green-800 font-medium px-4 py-2 rounded-lg shadow-md mb-3">✓ Game completed successfully!</div>
                              <button onClick={() => resetActivity('catchOrigin')} className="px-4 py-2 bg-brand-green hover:bg-brand-green-dark text-white rounded-lg shadow-sm text-sm font-medium">Try Again</button>
                            </div>
                          </>
                        )}
                        <CatchOriginGame
                          title={item.title} instruction={item.instruction} key={catchOriginResetKey}
                          onComplete={(success) => setCatchOriginGameCorrect(success)}
                          mode={presentationMode ? 'presentation' : 'reading'} started={!catchOriginGameCompletedAndNext}
                          winningThreshold={item.winningThreshold || 8} baskets={item.baskets || []}
                          basketIcons={item.basketIcons || {}} items={item.items || []}
                        />
                      </div>
                    </div>
                  );
                }
                return ( // DragDrop Game
                  <div key={idx} className="my-6">
                    <div className="relative">
                      {dragDropGameCompletedAndNext && (
                        <>
                          <div className="absolute inset-0 bg-white bg-opacity-50 z-10 flex flex-col items-center justify-center rounded-lg">
                            <div className="bg-green-100 text-green-800 font-medium px-4 py-2 rounded-lg shadow-md mb-3">✓ Game completed successfully!</div>
                            <button onClick={() => resetActivity('dragDrop')} className="px-4 py-2 bg-brand-green hover:bg-brand-green-dark text-white rounded-lg shadow-sm text-sm font-medium">Try Again</button>
                          </div>
                        </>
                      )}
                      <DragDropGame
                        title={item.title} instruction={item.instruction} onCorrect={setDragDropGameCorrect}
                        mode={presentationMode ? 'presentation' : 'reading'} items={item.items || []}
                        categories={item.categories || []} correctPairs={item.correctPairs || {}}
                      />
                    </div>
                  </div>
                );
              case 'quiz':
                return (
                  <div key={idx} className="my-6">
                    <div className="relative">
                      {quizCompletedAndNext && (
                        <>
                          <div className="absolute inset-0 bg-white bg-opacity-50 z-10 flex flex-col items-center justify-center rounded-lg">
                            <div className="bg-green-100 text-green-800 font-medium px-4 py-2 rounded-lg shadow-md mb-3">✓ Quiz completed successfully!</div>
                            <button onClick={() => resetActivity('quiz')} className="px-4 py-2 bg-brand-green hover:bg-brand-green-dark text-white rounded-lg shadow-sm text-sm font-medium">Try Again</button>
                          </div>
                        </>
                      )}
                      <Quiz title={item.title} questions={item.questions} onCorrect={setQuizCorrect} mode={presentationMode ? 'presentation' : 'reading'} />
                    </div>
                  </div>
                );
              case 'image':
                return <img key={idx} src={item.src} alt={item.alt} className="rounded shadow mx-auto my-4" />;
              case 'video':
                return (
                  <div key={idx} className="my-6">
                     <hr className="my-6 border-gray-300" />
                     <h4 className="text-md font-semibold mb-3 text-brand-gray-dark">{item.title}</h4>
                     <div className="relative w-full" style={{ paddingTop: '56.25%' }}>
                       <iframe src={item.src} title={item.title} frameBorder="0" allow="fullscreen; picture-in-picture" allowFullScreen className="absolute top-0 left-0 w-full h-full rounded-lg"></iframe>
                     </div>
                  </div>
                );
               case 'highlight':
                 return (
                   <div key={idx} className="my-6 p-5 bg-green-50 rounded-lg text-base">
                     <h4 className="font-semibold text-green-800 mb-2">{item.title}</h4>
                     <p className="text-green-700 leading-relaxed">{item.value.join(' ')}</p>
                   </div>
                 );
              default: return null;
            }
          })}
        </div>
      </main>

      <footer className="bg-white border-t border-gray-200 sticky bottom-0 z-10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between w-full">
          <button onClick={handlePrev} className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-brand-gray-dark rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm font-medium" disabled={currentPage === 0}>Previous</button>
          <span className="text-sm text-brand-gray font-medium">Page {currentPage + 1} / {pages.length}</span>
          <button onClick={handleNext} className="px-5 py-2 bg-brand-green hover:bg-brand-green-dark text-white rounded-lg shadow-sm disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm font-semibold"
            disabled={
              (pages[currentPage]?.some(item => item.type === 'game' && item.gameType !== 'catch-origin') && !dragDropGameCorrect) ||
              (pages[currentPage]?.some(item => item.type === 'game' && item.gameType === 'catch-origin') && !catchOriginGameCorrect) ||
              (pages[currentPage]?.some(item => item.type === 'quiz') && !quizCorrect) ||
              currentPage === pages.length - 1
            }
          >Next</button>
        </div>
      </footer>

      {presentationMode && (
        <PresentationOverlay
          isVisible={presentationMode}
          shouldPulse={shouldPulse}
          pulseKey={pulseKey}
          onClose={(lastSentenceIndex) => {
            // Calculate reading page based on lastSentenceIndex (global index)
            let currentItemIndex = 0;
            let targetPage = 0;
             for (let pageIdx = 0; pageIdx < pages.length; pageIdx++) {
               let foundOnPage = false;
               pages[pageIdx].forEach(item => {
                 if (item.type === 'paragraph' || item.type === 'highlight') {
                    if (item.title && item.type === 'highlight') {
                        if (currentItemIndex === lastSentenceIndex) { targetPage = pageIdx; foundOnPage = true; }
                        currentItemIndex++;
                    }
                    if (foundOnPage) return;
                   item.value.forEach(line => {
                     const sentences = line.match(/[^.!?]+[.!?]+[\])'"`'"]*|.+/g) || [];
                      sentences.forEach(sentence => {
                         if(sentence.trim()) {
                             if (currentItemIndex === lastSentenceIndex) { targetPage = pageIdx; foundOnPage = true; }
                             currentItemIndex++;
                         }
                         if (foundOnPage) return;
                      });
                      if (foundOnPage) return;
                   });
                 } else if (item.type === 'voiced-text') {
                     item.paragraphs.forEach(para => {
                         para.sentences.forEach(sentenceData => {
                             if (sentenceData.text.trim()) {
                                 if (currentItemIndex === lastSentenceIndex) { targetPage = pageIdx; foundOnPage = true; }
                                 currentItemIndex++;
                             }
                             if (foundOnPage) return;
                         });
                         if (foundOnPage) return;
                     });
                 } else if (item.type !== 'page-break') {
                    if (currentItemIndex === lastSentenceIndex) { targetPage = pageIdx; foundOnPage = true; }
                    currentItemIndex++;
                 }
                 if (foundOnPage) return;
               });
               if (foundOnPage) break;
               if (pageIdx === pages.length - 1) targetPage = pageIdx; // Default to last page if not found
             }
            setCurrentPage(targetPage);
            setPresentationMode(false);
          }}
          sentences={flatSentences} // Pass the flattened sentences for presentation logic
          mediaMap={mediaMap} // Pass the map for media/voiced-text details
          dragDropGameCorrect={dragDropGameCorrect}
          catchOriginGameCorrect={catchOriginGameCorrect}
          quizCorrect={quizCorrect}
          initialSentenceIndex={window.initialSentenceIndex || 0}
          mode={presentationMode ? 'presentation' : 'reading'}
          onRestart={() => {
            setDragDropGameCorrect(false); setCatchOriginGameCorrect(false); setQuizCorrect(false);
            setDragDropGameCompletedAndNext(false); setCatchOriginGameCompletedAndNext(false); setQuizCompletedAndNext(false);
            setShouldPulse(false); setPulseKey(0); window.initialSentenceIndex = 0; setCurrentPage(0);
            setPresentationMode(false); setTimeout(() => setPresentationMode(true), 0); // Remount overlay
          }}
        />
      )}

      <ModeTransitionDialog
        isOpen={showModeDialog}
        onClose={() => setShowModeDialog(false)}
        targetMode={targetMode}
        onContinue={() => {
          setShowModeDialog(false);
          if (targetMode === 'presentation') { setPresentationMode(true); }
        }}
        onStartOver={() => {
          setShowModeDialog(false);
          if (targetMode === 'presentation') {
            setDragDropGameCorrect(false); setCatchOriginGameCorrect(false); setQuizCorrect(false);
            setDragDropGameCompletedAndNext(false); setCatchOriginGameCompletedAndNext(false); setQuizCompletedAndNext(false);
            window.initialSentenceIndex = 0; setCurrentPage(0); setPresentationMode(true);
          }
        }}
      />
    </div>
  );
}

export default App;
