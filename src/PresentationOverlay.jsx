import React, { useState, useEffect, useRef } from 'react';
import DragDropGame from './DragDropGame';
import CatchOriginGame from './CatchOriginGame';
import { getPresentationSpeed } from './config.js';

function PresentationOverlay({
  sentences = [],
  isVisible,
  shouldPulse = false,
  pulseKey = 0,
  onClose,
  initialSpeed = 'Medium',
  onFinished,
  mediaMap = {},
  dragDropGameCorrect,
  catchOriginGameCorrect,
  quizCorrect,
  initialSentenceIndex = 0,
  mode = 'reading', // Add mode prop
  onRestart = null, // Add onRestart callback
}) {
  const [localPulse, setLocalPulse] = useState(false);

  useEffect(() => {
    if (shouldPulse) {
      setLocalPulse(true);
    }
  }, [shouldPulse, pulseKey]);

  // Combined game correct state for backward compatibility
  const gameCorrect = dragDropGameCorrect || catchOriginGameCorrect;
  const [sentenceIndex, setSentenceIndex] = useState(0);
  const [charIndex, setCharIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [countdown, setCountdown] = useState(null);
  const [currentSpeed, setCurrentSpeed] = useState(initialSpeed);
  const [mediaDelayRemaining, setMediaDelayRemaining] = useState(null);
  const [statusMessage, setStatusMessage] = useState('');
  const [showStatusToast, setShowStatusToast] = useState(false);
  const [triggerGameCheck, setTriggerGameCheck] = useState(false);
  const [videoKey, setVideoKey] = useState(Date.now()); // Key to force iframe re-render

  const intervalRef = useRef(null);
  const mediaDelayTimerRef = useRef(null);
  const mediaDelayCountdownRef = useRef(null);
  const countdownTimersRef = useRef([]);

  const sentence = sentences[sentenceIndex] || '';
  // Calculate total steps (sentences + media items) for progress
  const totalSteps = sentences.length;

  // Separate clear functions to avoid clearing the wrong timers
  const clearAnimationTimer = () => {
    clearInterval(intervalRef.current);
    intervalRef.current = null;
  };

  const clearMediaTimers = () => {
    clearTimeout(mediaDelayTimerRef.current);
    clearInterval(mediaDelayCountdownRef.current);
    mediaDelayTimerRef.current = null;
    mediaDelayCountdownRef.current = null;
  };

  const clearCountdownTimers = () => {
    countdownTimersRef.current.forEach(timer => clearTimeout(timer));
    countdownTimersRef.current = [];
  };

  // Simplified countdown logic and state reset
  useEffect(() => {

    // Reset state when visibility changes or initial index changes
    setSentenceIndex(initialSentenceIndex);
    setCharIndex(0);
    // Calculate initial progress based on starting sentence index (now counts all steps)
    setProgress(totalSteps > 0 ? ((initialSentenceIndex + 1) / totalSteps) * 100 : 0);
    setIsPlaying(false); // Always start paused
    setMediaDelayRemaining(null);
    setCountdown(null); // Ensure countdown is reset
    setVideoKey(Date.now()); // Force video remount/stop when visibility changes

    // Clear all timers when becoming invisible or when resetting
    clearAnimationTimer();
    clearMediaTimers();
    clearCountdownTimers();

    if (isVisible) {
      // Start countdown only if becoming visible
      setCountdown(3);

      const timer1 = setTimeout(() => {
        setCountdown(2);

        const timer2 = setTimeout(() => {
          setCountdown(1);

          const timer3 = setTimeout(() => {
            setCountdown(null);
            setIsPlaying(true); // Start playing after countdown
          }, 1000);

          countdownTimersRef.current.push(timer3);
        }, 1000);

        countdownTimersRef.current.push(timer2);
      }, 1000);

      countdownTimersRef.current.push(timer1);
    }

    // Cleanup function to clear all timers on unmount or when visibility/index changes
    return () => {
      clearAnimationTimer();
      clearMediaTimers();
      clearCountdownTimers();
    };
  }, [isVisible, initialSentenceIndex, totalSteps]); // Added totalSteps dependency

  // Sentence animation logic
  useEffect(() => {
    clearAnimationTimer(); // Clear previous animation timer

    // Check if it's a text sentence (not in mediaMap) and should be animating
    if (isPlaying && countdown === null && sentenceIndex < sentences.length && !mediaMap[sentenceIndex] && mediaDelayRemaining === null) {
      const currentSentenceText = sentences[sentenceIndex] || '';

      // Update progress based on steps (sentences/media items)
      setProgress(totalSteps > 0 ? ((sentenceIndex + 1) / totalSteps) * 100 : 0);

      if (charIndex < currentSentenceText.length) {
        // If sentence not fully displayed, continue typing animation
        intervalRef.current = setInterval(() => {
          setCharIndex(prev => prev + 1);
        }, getPresentationSpeed()[currentSpeed]);
      } else {
        // If sentence finished, but paused before advance() scheduled, call advance immediately
        advance();
      }
    }

    // Cleanup function for the animation timer
    return clearAnimationTimer;

  }, [sentenceIndex, charIndex, isPlaying, countdown, currentSpeed, sentences, mediaMap, mediaDelayRemaining, totalSteps]); // Added totalSteps

  // Media display and delay logic
  useEffect(() => {

    clearMediaTimers(); // Clear previous media timers

      // Check if it's a media item and should be displayed/delayed
      if (isPlaying && countdown === null && mediaMap[sentenceIndex] && mediaDelayRemaining === null) {
        const currentMedia = mediaMap[sentenceIndex];
        const type = currentMedia.type;
        let shouldStartDelay = false;
        let delayDuration = 0; // Default delay

        // Update progress immediately when showing media
        const stepsCompleted = sentenceIndex + 1; // Count current media item as completed step
        setProgress(totalSteps > 0 ? (stepsCompleted / totalSteps) * 100 : 0);

        // Set appropriate status messages based on media type
        if (type === 'image') {
          setStatusMessage('Viewing image...');
          shouldStartDelay = true;
          delayDuration = currentMedia.delay ?? 8; // seconds, default 8
        } else if (type === 'minigame') {
          // Check if it's a drag-drop game or catch-origin game
          const isDragDropGame = currentMedia.element && currentMedia.element.type === DragDropGame;
          const isCatchOriginGame = currentMedia.element && currentMedia.element.type === CatchOriginGame;
          
          // Default message
          setStatusMessage('Complete the game to continue');
          
          const isGameDone = (isDragDropGame && dragDropGameCorrect) || (isCatchOriginGame && catchOriginGameCorrect);
          if (isGameDone) {
            advance();
            return; // skip delay and toast
          } else {
            // If game not correct, pause indefinitely until user interacts or exits
            setIsPlaying(false);
            setStatusMessage('❌ Game not correct yet, please try again.');
          }
        } else if (type === 'quiz') {
          // Only delay if the quiz is already marked correct
          if (quizCorrect) {
            advance();
            return; // skip delay and toast
          } else {
            // If quiz not correct, pause indefinitely
            setIsPlaying(false);
            setStatusMessage('Answer correctly to continue');
         }
        } else if (type === 'video') {
          setStatusMessage('Playing video...');
          shouldStartDelay = true;
          delayDuration = 15; // Adjust delay for video viewing time
        }
        // Removed highlight type check - it's treated as text now

        // Start the delay timer if applicable
        if (shouldStartDelay && delayDuration > 0) {
         setMediaDelayRemaining(delayDuration);

          // Countdown timer for the UI
          mediaDelayCountdownRef.current = setInterval(() => {
            setMediaDelayRemaining(prev => (prev !== null && prev > 1) ? prev - 1 : null);
          }, 1000);

          // Timer to advance after the delay
          mediaDelayTimerRef.current = setTimeout(advance, delayDuration * 1000);
        }
      }

    // Cleanup function for media timers
    return clearMediaTimers;

  }, [isPlaying, countdown, mediaMap, sentenceIndex, dragDropGameCorrect, catchOriginGameCorrect, quizCorrect, totalSteps]); // Dependencies updated

  // Function to advance to the next sentence/media item
  const advance = () => {
    clearAnimationTimer();
    clearMediaTimers();
    setMediaDelayRemaining(null); // Clear remaining delay display

    if (sentenceIndex >= sentences.length - 1) {
      // Reached the end
      setIsPlaying(false);
      setProgress(100); // Ensure progress bar is full
      onFinished?.(); // Optional callback when finished
    } else {
      // Move to the next index
      const nextIndex = sentenceIndex + 1;
      setSentenceIndex(nextIndex);
      setCharIndex(0); // Reset character index for the next sentence/media placeholder
      setIsPlaying(true); // Ensure playing continues
       // Update progress immediately for the next step
       setProgress(totalSteps > 0 ? ((nextIndex + 1) / totalSteps) * 100 : 0);
    }
  };

  // Function to skip the current media delay
  const skipDelay = () => {
    advance(); // Immediately advance to the next item
  };

  // Function to fully reset presentation state
  const resetPresentation = () => {
    clearAnimationTimer();
    clearMediaTimers();
    clearCountdownTimers();

    setSentenceIndex(0);
    setCharIndex(0);
    setProgress(0);
    setMediaDelayRemaining(null);
    setCountdown(null);
    setVideoKey(Date.now());
    setIsPlaying(true);
  };

  // Function to toggle play/pause state
  const togglePlayPause = () => {
    if (countdown !== null) return; // Don't allow play/pause during countdown

    const currentlyPlaying = !isPlaying;
    setIsPlaying(currentlyPlaying);

    if (currentlyPlaying) {
      // If resuming and was paused during a media delay, restart the delay timer
      if (mediaDelayRemaining !== null) {
         mediaDelayCountdownRef.current = setInterval(() => {
             setMediaDelayRemaining(prev => (prev !== null && prev > 1) ? prev - 1 : null);
         }, 1000);
         mediaDelayTimerRef.current = setTimeout(advance, mediaDelayRemaining * 1000);
      }
      // If resuming at the very end, restart from beginning with full reset
      else if (sentenceIndex >= sentences.length - 1 && (mediaMap[sentenceIndex] || charIndex >= sentence.length)) {
        if (typeof onRestart === 'function') {
          onRestart();
        } else {
          resetPresentation();
        }
      }
    } else {
      // If pausing, clear any active timers
      clearAnimationTimer();
      clearMediaTimers();
   }
  };


  if (!isVisible) return null; // Don't render anything if not visible

  // Determine the element to display (text or media)
  const currentMediaData = countdown === null && mediaMap[sentenceIndex];
  let currentDisplayElement = null;

  if (currentMediaData) {
    // If it's a media item (excluding highlight, which is now treated as text)
    if (currentMediaData.type === 'video') {
      const videoSrc = mode === 'presentation'
        ? `${currentMediaData.src}?autoplay=1&muted=1&title=0&byline=0&portrait=0`
        : currentMediaData.src;
      currentDisplayElement = (
         <div key={videoKey} className="relative w-full" style={{ paddingTop: '56.25%' }}>
           <iframe
             src={videoSrc}
             title={currentMediaData.title}
             frameBorder="0"
             allow="autoplay; fullscreen; picture-in-picture"
             allowFullScreen
             className="absolute top-0 left-0 w-full h-full rounded-lg"
           ></iframe>
         </div>
      );
    } else if (currentMediaData.element && currentMediaData.type !== 'highlight') { // Exclude highlight element
       // Pass externalTriggerCheck to DragDropGame and Quiz
       const isDragDropGame = currentMediaData.element && currentMediaData.element.type === DragDropGame;
       const isQuiz = currentMediaData.type === 'quiz';
       
       const elementType = currentMediaData.element?.type;
       const extraProps = { mode: 'presentation' };
       if (elementType === DragDropGame || elementType?.name === 'Quiz') {
         extraProps.externalTriggerCheck = triggerGameCheck;
       }
       currentDisplayElement = React.cloneElement(
         currentMediaData.element,
         extraProps
       );
    }
  }

  // If it's not a media item OR it's a highlight item (treated as text), render the text animation
  if (!currentDisplayElement && countdown === null) {
     currentDisplayElement = (
       <p className="text-4xl md:text-5xl lg:text-6xl font-semibold leading-normal whitespace-pre-wrap">
         {sentence.split('').map((char, i) => (
           <span
             key={i}
             className={i < charIndex ? 'text-yellow-400' : 'text-gray-300'}
           >
             {char}
           </span>
         ))}
       </p>
     );
  }

  // Use the shouldPulse prop passed from App

  return (
    // Ensure flex-col and overflow-hidden on the main container
    <div className="fixed inset-0 bg-brand-gray-darker text-gray-100 flex flex-col items-center z-50 overflow-hidden presentation">
      {/* Countdown Overlay */}
      {countdown !== null && (
        <div className="absolute inset-0 flex items-center justify-center z-20 bg-black bg-opacity-50">
          <div className="text-white text-9xl font-bold animate-ping opacity-75">{countdown}</div>
        </div>
      )}

      {/* Main Content Area - Add overflow-y-auto and bottom padding */}
      <div className={`flex-1 overflow-y-auto w-full max-w-5xl text-center p-1 sm:p-6 pb-24`}> {/* Added pb-24 */}
        <div className="min-h-full flex flex-col justify-center items-center w-full">
          {currentDisplayElement ? (
            // Render media element wrapper - conditional padding/bg/border for mobile
             <div className={`w-full ${currentMediaData?.type !== 'video' ? 'sm:p-4 sm:bg-gray-800 sm:rounded-lg' : ''}`}>
              {currentDisplayElement}
            </div>
          ) : (
            // Render text content directly if not media or during countdown
            countdown === null ? (
               <p className="text-4xl md:text-5xl lg:text-6xl font-semibold leading-normal whitespace-pre-wrap">
                 {sentence.split('').map((char, i) => (
                   <span
                     key={i}
                     className={i < charIndex ? 'text-yellow-400' : 'text-gray-300'}
                   >
                     {char}
                   </span>
                 ))}
               </p>
            ) : <div></div> // Placeholder during countdown if no media
          )}
        </div>
      </div>

      {/* Media Delay Indicator */}
      {mediaDelayRemaining !== null && !(currentMediaData && (currentMediaData.type === 'image' || currentMediaData.type === 'video')) && (
        <div className="absolute top-5 right-5 z-40 flex items-center gap-2 p-2 bg-black bg-opacity-50 rounded-lg">
          <span className="text-sm text-gray-300">
            {statusMessage || `Next in... ${mediaDelayRemaining}s`}
          </span>
          {(currentMediaData?.type === 'image' || 
            currentMediaData?.type === 'video' || 
            (currentMediaData?.type === 'quiz' && quizCorrect)) && (
            <button
              onClick={skipDelay}
              className="px-3 py-1 bg-gray-600 hover:bg-gray-500 text-white text-xs rounded-md font-medium"
            >
              Skip
            </button>
          )}
        </div>
      )}

      {/* Game/Quiz Status Toast */}
      {showStatusToast && (
        <div className="fixed top-5 left-1/2 transform -translate-x-1/2 z-50 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg shadow">
          {statusMessage}
        </div>
      )}

      {/* Footer Controls - Reverted to fixed positioning */}
      <div className="fixed bottom-0 left-0 right-0 w-full bg-black bg-opacity-50 backdrop-blur-sm z-30">
        <div className="max-w-4xl mx-auto p-3 md:p-4">
          {/* Progress Bar */}
          <div className="bg-gray-600 h-1.5 rounded-full overflow-hidden mb-3">
            <div
              className="bg-yellow-400 h-full transition-all duration-150 ease-linear"
              style={{ width: `${progress}%` }}
            />
          </div>
          {/* Buttons */}
          <div className="flex justify-between items-center text-sm">
            {/* Speed Controls */}
            <div className="flex gap-2 items-center">
              <span className="hidden sm:inline text-gray-300 text-xs font-medium">Speed:</span>
              {Object.keys(getPresentationSpeed()).map(speedKey => (
                <button
                  key={speedKey}
                  onClick={() => setCurrentSpeed(speedKey)}
                  className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${
                    currentSpeed === speedKey
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  }`}
                >
                  {speedKey}
                </button>
              ))}
            </div>
            {/* Play/Pause/Exit Controls */}
            <div className="flex gap-3">
              <button
                key={pulseKey}
                onClick={() => {
                  setLocalPulse(false);
                  const isImageOrVideo = currentMediaData && (currentMediaData.type === 'image' || currentMediaData.type === 'video');

                  if (isImageOrVideo) {
                    skipDelay();
                    return;
                  }

                  const isMinigame = currentMediaData?.type === 'minigame';
                  const isQuizType = currentMediaData?.type === 'quiz';
                  const isDragDropGame = currentMediaData?.element && currentMediaData.element.type === DragDropGame;
                  const isCatchOriginGame = currentMediaData?.element && currentMediaData.element.type === CatchOriginGame;
                  const isGameDone = (isDragDropGame && dragDropGameCorrect) || (isCatchOriginGame && catchOriginGameCorrect);
                  const isQuizDone = quizCorrect;

                  if (
                    !isPlaying &&
                    (
                      (isMinigame && !isGameDone) ||
                      (isQuizType && !isQuizDone)
                    )
                  ) {
                    if (isMinigame && !isGameDone) {
                      setStatusMessage('Complete the game to continue');
                      setShowStatusToast(true);
                      setTimeout(() => setShowStatusToast(false), 2000);
                      return;
                    }

                    if (isQuizType && !isQuizDone) {
                      setStatusMessage('Complete the quiz to continue');
                      setShowStatusToast(true);
                      setTimeout(() => setShowStatusToast(false), 2000);
                      return;
                    }
                  }

                  if (
                    !isPlaying &&
                    (
                      (isMinigame && !isGameDone) ||
                      (isQuizType && !isQuizDone)
                    )
                  ) {
                    // If game/quiz is not done, check if it's ready to check
                    if (isMinigame && !isGameDone) {
                      if (isDragDropGame) {
                        setTriggerGameCheck(prev => !prev);
                        return;
                      } else if (isCatchOriginGame) {
                        setShowStatusToast(true);
                        setTimeout(() => setShowStatusToast(false), 2000);
                        return;
                      }
                    } else if (isQuizType && !isQuizDone) {
                      setTriggerGameCheck(prev => !prev);
                      return;
                    }
                  }

                  togglePlayPause();
                }}
                disabled={countdown !== null}
                className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors shadow ${
                  countdown !== null
                    ? 'bg-gray-500 text-gray-400 cursor-not-allowed'
                    : (currentMediaData && (currentMediaData.type === 'image' || currentMediaData.type === 'video'))
                      ? 'bg-yellow-500 hover:bg-yellow-600 text-black'
                      : isPlaying
                        ? 'bg-gray-300 hover:bg-gray-400 text-gray-800'
                        : 'bg-brand-green hover:bg-brand-green-dark text-white'
                } ${localPulse ? 'animate-pulse-custom' : ''}`}
              >
{(() => {
  const isImageOrVideo = currentMediaData && (currentMediaData.type === 'image' || currentMediaData.type === 'video');
  if (isImageOrVideo) {
    return (
      <>
        <i className="fas fa-forward"></i>
        <span className="hidden sm:inline ml-1">Skip</span>
      </>
    );
  } else if (isPlaying) {
    return (
      <>
        <i className="fas fa-pause"></i>
        <span className="hidden sm:inline ml-1">Pause</span>
      </>
    );
  } else {
    return (
      <>
        <i className={`fas ${
          (sentenceIndex === 0 || (sentenceIndex >= sentences.length - 1 && (mediaMap[sentenceIndex] || charIndex >= sentence.length)))
            ? ((sentenceIndex === 0) ? 'fa-play' : 'fa-rotate-right')
            : 'fa-play'
        }`}></i>
        <span className="hidden sm:inline ml-1">
          {(sentenceIndex === 0 || (sentenceIndex >= sentences.length - 1 && (mediaMap[sentenceIndex] || charIndex >= sentence.length)))
            ? ((sentenceIndex === 0) ? 'Start' : 'Start Over')
            : 'Continue'}
        </span>
      </>
    );
  }
})()}
              </button>
<button
  onClick={() => onClose(sentenceIndex)} // Pass current sentenceIndex on close
  className="px-4 py-1.5 rounded-md bg-gray-300 hover:bg-gray-400 text-gray-800 text-sm font-medium transition-colors"
>
  <i className="hidden sm:inline fas fa-times"></i>
  <span className="ml-0 sm:ml-1">Close</span>
</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default PresentationOverlay;
