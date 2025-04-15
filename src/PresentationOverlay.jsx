import React, { useState, useEffect, useRef, useCallback } from 'react';
import DragDropGame from './DragDropGame';
import CatchOriginGame from './CatchOriginGame';
import { getPresentationSpeed } from './config.js';

// Helper to find the block index, paragraph index, and sentence index within that block
const findBlockAndSentenceIndex = (globalSentenceIndex, lessonContent) => {
  let sentenceCounter = 0; // Tracks the global sentence index across all content
  let currentBlockIndex = -1;
  let paragraphIndexInBlock = -1; // Index of the paragraph within the voiced-text block
  let sentenceIndexInParagraph = -1; // Index of the sentence within the paragraph
  let blockData = null;
  let isVoicedBlock = false;
  let voicedBlockSentencesData = []; // Store detailed info ONLY for the target voiced block

  for (let i = 0; i < lessonContent.length; i++) {
    const item = lessonContent[i];
    currentBlockIndex = i;
    isVoicedBlock = item.type === 'voiced-text';

    if (item.type === 'paragraph' || item.type === 'highlight') {
      // Handle highlight title as a separate sentence
      if (item.title && item.type === 'highlight') {
        if (sentenceCounter === globalSentenceIndex) {
           return { blockIndex: i, paragraphIndexInBlock: -1, sentenceIndexInParagraph: -1, blockData: item, isVoicedBlock: false, voicedBlockSentencesData: [] };
        }
        sentenceCounter++;
      }
      // Store result to return after processing all sentences
      let result = null;
      
      item.value.forEach(line => {
        const lineSentences = line.match(/[^.!?]+[.!?]+[\])'"`'"]*|.+/g) || [line];
        lineSentences.forEach(sentenceText => {
          if (sentenceText.trim()) {
            if (sentenceCounter === globalSentenceIndex) {
              result = { blockIndex: i, paragraphIndexInBlock: -1, sentenceIndexInParagraph: -1, blockData: item, isVoicedBlock: false, voicedBlockSentencesData: [] };
            }
            sentenceCounter++;
          }
        });
      });
      
      // Return result if found in this paragraph
      if (result) {
        return result;
      }
    } else if (isVoicedBlock) {
      let tempVoicedSentencesData = []; // Temp storage for this block's data
      let foundInBlock = false; // Flag if the target index is within this block

      for (let pIdx = 0; pIdx < item.paragraphs.length; pIdx++) {
        const paragraph = item.paragraphs[pIdx];
        for (let sIdx = 0; sIdx < paragraph.sentences.length; sIdx++) {
          const sentenceData = paragraph.sentences[sIdx];
          if (sentenceData.text.trim()) {
            tempVoicedSentencesData.push({
                text: sentenceData.text,
                timings: sentenceData.char_timings,
                globalSentenceStartIndex: sentenceCounter,
                paragraphIndex: pIdx,
                sentenceIndex: sIdx,
            });
            if (sentenceCounter === globalSentenceIndex) {
              paragraphIndexInBlock = pIdx;
              sentenceIndexInParagraph = sIdx;
              blockData = item;
              voicedBlockSentencesData = tempVoicedSentencesData; // Assign collected data
              foundInBlock = true;
              // Don't return yet, finish collecting data for the whole block
            }
            sentenceCounter++;
          }
        }
      }
      // If found in this block, return now after collecting all its sentence data
      if (foundInBlock) {
          return { blockIndex: i, paragraphIndexInBlock, sentenceIndexInParagraph, blockData, isVoicedBlock: true, voicedBlockSentencesData };
      }

    } else if (item.type !== 'page-break') { // Other non-text blocks
      if (sentenceCounter === globalSentenceIndex) {
         return { blockIndex: i, paragraphIndexInBlock: -1, sentenceIndexInParagraph: -1, blockData: item, isVoicedBlock: false, voicedBlockSentencesData: [] };
      }
      sentenceCounter++;
    }
  }
  return { blockIndex: -1, paragraphIndexInBlock: -1, sentenceIndexInParagraph: -1, blockData: null, isVoicedBlock: false, voicedBlockSentencesData: [] }; // Not found
};


function PresentationOverlay({
  content = [], // Array of lesson content
  sentences = [], // Flat array of all sentence strings  
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
  mode = 'reading',
  onRestart = null,
}) {
  const [localPulse, setLocalPulse] = useState(false);
  const [currentGlobalSentenceIndex, setCurrentGlobalSentenceIndex] = useState(initialSentenceIndex);
  const [currentSentenceText, setCurrentSentenceText] = useState('');
  const [highlightedCharIndex, setHighlightedCharIndex] = useState(-1);
  const [charIndex, setCharIndex] = useState(0);

  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [countdown, setCountdown] = useState(null);
  const [currentSpeed, setCurrentSpeed] = useState(initialSpeed);
  const [mediaDelayRemaining, setMediaDelayRemaining] = useState(null);
  const [statusMessage, setStatusMessage] = useState('');
  const [showStatusToast, setShowStatusToast] = useState(false);
  const [videoKey, setVideoKey] = useState(Date.now());
  const [isMuted, setIsMuted] = useState(false); // Mute state

  const intervalRef = useRef(null);
  const mediaDelayTimerRef = useRef(null);
  const mediaDelayCountdownRef = useRef(null);
  const audioRef = useRef(null);
  const highlightTimersRef = useRef([]);
  const countdownTimersRef = useRef([]);
  const currentVoicedBlockInfo = useRef(null);

  // --- Determine current item type & data ---
  const { blockIndex, paragraphIndexInBlock, sentenceIndexInParagraph, blockData, isVoicedBlock, voicedBlockSentencesData } = findBlockAndSentenceIndex(currentGlobalSentenceIndex, content);
  
  // Consider both paragraph and highlight as regular text
  const isRegularText = !isVoicedBlock && !mediaMap[currentGlobalSentenceIndex] && (blockData?.type === 'paragraph' || blockData?.type === 'highlight');

  // --- Update displayed sentence text ---
  useEffect(() => {
    if (isVoicedBlock && blockData?.paragraphs && paragraphIndexInBlock >= 0 && sentenceIndexInParagraph >= 0) {
       setCurrentSentenceText(blockData.paragraphs[paragraphIndexInBlock]?.sentences[sentenceIndexInParagraph]?.text || '');
    } else if (isRegularText) {
      setCurrentSentenceText(sentences[currentGlobalSentenceIndex] || '');
    } else {
       setCurrentSentenceText('');
    }
    setHighlightedCharIndex(-1);
    setCharIndex(0);
  }, [currentGlobalSentenceIndex, blockData, paragraphIndexInBlock, sentenceIndexInParagraph, isRegularText, sentences, isVoicedBlock]);


  // --- Cleanup Functions ---
  const clearAnimationTimer = () => { clearInterval(intervalRef.current); intervalRef.current = null; };
  const clearMediaTimers = () => { clearTimeout(mediaDelayTimerRef.current); clearInterval(mediaDelayCountdownRef.current); mediaDelayTimerRef.current = null; mediaDelayCountdownRef.current = null; };
  const clearHighlightTimers = useCallback(() => { highlightTimersRef.current.forEach(clearTimeout); highlightTimersRef.current = []; }, []);
  const clearCountdownTimers = () => { countdownTimersRef.current.forEach(clearTimeout); countdownTimersRef.current = []; };
  const stopAndCleanupAudio = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      // Remove listeners safely
      const currentAudio = audioRef.current;
      // Assuming handlers are stable or defined outside, otherwise this might not work reliably
      // currentAudio.removeEventListener('canplay', handleAudioReady);
      // currentAudio.removeEventListener('error', handleError);
      currentAudio.removeAttribute('src');
      currentAudio.load();
      audioRef.current = null;
    }
    clearHighlightTimers();
    setHighlightedCharIndex(-1);
    currentVoicedBlockInfo.current = null;
  }, [clearHighlightTimers]);

  // --- Core Logic Hooks ---

  // Initial Countdown & State Reset
  useEffect(() => {
    setCurrentGlobalSentenceIndex(initialSentenceIndex);
    setProgress(sentences.length > 0 ? ((initialSentenceIndex + 1) / sentences.length) * 100 : 0);
    setIsPlaying(false);
    setMediaDelayRemaining(null);
    setCountdown(null);
    setVideoKey(Date.now());
    stopAndCleanupAudio();
    clearAnimationTimer();
    clearMediaTimers();
    clearCountdownTimers();

    if (isVisible) {
      setCountdown(3);
      const timer1 = setTimeout(() => setCountdown(2), 1000);
      const timer2 = setTimeout(() => setCountdown(1), 2000);
      const timer3 = setTimeout(() => { setCountdown(null); setIsPlaying(true); }, 3000);
      countdownTimersRef.current = [timer1, timer2, timer3];
    }

    return () => { clearAnimationTimer(); clearMediaTimers(); clearCountdownTimers(); stopAndCleanupAudio(); };
  }, [isVisible, initialSentenceIndex, sentences.length, stopAndCleanupAudio, content]);

  // Advance Function
  const advance = useCallback((forceGlobalIndex = null) => {
      clearAnimationTimer();
      clearMediaTimers();

      let nextIndex;
      let isForcedAdvance = forceGlobalIndex !== null;

      if (isForcedAdvance) {
          nextIndex = forceGlobalIndex;
          stopAndCleanupAudio();
      } else {
          const { blockIndex: currentBlockIdx } = findBlockAndSentenceIndex(currentGlobalSentenceIndex, content);
          const { blockIndex: nextBlockIndex, blockData: nextBlockData } = findBlockAndSentenceIndex(currentGlobalSentenceIndex + 1, content);
          const leavingVoicedBlock = isVoicedBlock && (!nextBlockData || nextBlockData.type !== 'voiced-text' || nextBlockIndex !== currentBlockIdx);

          if (leavingVoicedBlock) {
              stopAndCleanupAudio();
          } else {
              clearHighlightTimers();
          }
          nextIndex = currentGlobalSentenceIndex + 1;
      }

      setMediaDelayRemaining(null);

      if (nextIndex >= sentences.length) {
          setIsPlaying(false); setProgress(100); onFinished?.();
      } else {
          setCurrentGlobalSentenceIndex(nextIndex);
          setProgress(sentences.length > 0 ? ((nextIndex + 1) / sentences.length) * 100 : 0);
          
          // Check if the next item is a paragraph or highlight (regular text)
          const { blockData: nextItemData } = findBlockAndSentenceIndex(nextIndex, content);
          const isNextRegularText = nextItemData && (nextItemData.type === 'paragraph' || nextItemData.type === 'highlight');
          
          // Always auto-play regular text content
          if (isNextRegularText) {
              console.log('Next content is regular text, auto-playing');
              setIsPlaying(true);
          } else {
              // For other content types, follow the original logic
              const shouldAutoPlayNext = nextItemData && nextItemData.type !== 'game' && nextItemData.type !== 'quiz';
              setIsPlaying(shouldAutoPlayNext);
          }
      }
  }, [currentGlobalSentenceIndex, sentences.length, onFinished, stopAndCleanupAudio, isVoicedBlock, clearHighlightTimers]);


  // Regular Text Animation
  useEffect(() => {
    clearAnimationTimer();
    if (isPlaying && countdown === null && isRegularText && mediaDelayRemaining === null) {
      if (charIndex < currentSentenceText.length) {
        intervalRef.current = setInterval(() => setCharIndex(prev => prev + 1), getPresentationSpeed()[currentSpeed]);
      } else {
        const timer = setTimeout(advance, 500); return () => clearTimeout(timer);
      }
    }
    return clearAnimationTimer;
  }, [charIndex, isPlaying, countdown, currentSpeed, currentSentenceText.length, isRegularText, mediaDelayRemaining, advance]);

  // Non-Voiced Media Delay / Game/Quiz Pause
  useEffect(() => {
    clearMediaTimers();
    const mediaData = mediaMap[currentGlobalSentenceIndex];
    if (isPlaying && countdown === null && mediaData && !isVoicedBlock && mediaDelayRemaining === null) {
      const type = mediaData.type;
      let shouldPause = false, shouldStartDelayTimer = false, delayDuration = 0;
      setProgress(sentences.length > 0 ? ((currentGlobalSentenceIndex + 1) / sentences.length) * 100 : 0);

      if (type === 'image') { setStatusMessage('Viewing image...'); shouldStartDelayTimer = true; delayDuration = mediaData.delay ?? 8; }
      else if (type === 'video') { setStatusMessage('Playing video...'); shouldStartDelayTimer = true; delayDuration = 15; }
      else if (type === 'game' || type === 'quiz') {
        shouldPause = true;
        const isGame = type === 'game';
        const isCorrect = isGame ? (mediaData.gameType === 'drag-drop' && dragDropGameCorrect) || (mediaData.gameType === 'catch-origin' && catchOriginGameCorrect) : quizCorrect;
        if (isCorrect) { setLocalPulse(true); setStatusMessage(isGame ? '✓ Game completed!' : '✓ Quiz completed!'); }
        else { setStatusMessage(isGame ? 'Complete the game to continue' : 'Answer correctly to continue'); }
      }

      if (shouldPause) setIsPlaying(false);
      else if (shouldStartDelayTimer && delayDuration > 0) {
        setMediaDelayRemaining(delayDuration);
        mediaDelayCountdownRef.current = setInterval(() => setMediaDelayRemaining(prev => (prev !== null && prev > 1) ? prev - 1 : null), 1000);
        mediaDelayTimerRef.current = setTimeout(advance, delayDuration * 1000);
      }
    }
    return clearMediaTimers;
  }, [isPlaying, countdown, currentGlobalSentenceIndex, mediaMap, isVoicedBlock, dragDropGameCorrect, catchOriginGameCorrect, quizCorrect, sentences.length, advance]);

  // Game/Quiz Completion Pulse
  useEffect(() => {
    const mediaData = mediaMap[currentGlobalSentenceIndex];
    if (mediaData) {
      const isGame = mediaData.type === 'game'; const isQuiz = mediaData.type === 'quiz';
      const isCorrect = isGame ? (mediaData.gameType === 'drag-drop' && dragDropGameCorrect) || (mediaData.gameType === 'catch-origin' && catchOriginGameCorrect) : (isQuiz && quizCorrect);
      if (isCorrect) { 
        setLocalPulse(true); 
        setIsPlaying(false); 
      } else {
        setLocalPulse(false);
      }
    }
  }, [dragDropGameCorrect, catchOriginGameCorrect, quizCorrect, currentGlobalSentenceIndex, mediaMap]);

  // --- Voiced Text Logic ---
  const scheduleVoicedTextTimers = useCallback((startTime = 0) => {
    if (!currentVoicedBlockInfo.current || !audioRef.current) return;
    console.log(`Scheduling timers from audio time: ${startTime}`);

    clearHighlightTimers();
    const { sentencesData, blockTotalSentences, blockGlobalStartIndex } = currentVoicedBlockInfo.current;
    const audioCurrentTime = startTime;

    for (let dataIdx = 0; dataIdx < sentencesData.length; dataIdx++) {
        const sentenceData = sentencesData[dataIdx];
        const sentenceText = sentenceData.text;
        const timings = sentenceData.timings;
        const sentenceGlobalIndex = sentenceData.globalSentenceStartIndex;
        const isLastSentenceInBlock = (dataIdx === sentencesData.length - 1);

        if (!timings || timings.length === 0) { console.warn(`Sentence globalIdx ${sentenceGlobalIndex} has no timings.`); continue; }

        let sentenceTimingIndex = 0;
        for (let charIdx = 0; charIdx < sentenceText.length; charIdx++) {
            const char = sentenceText[charIdx];
            if (/\s/.test(char)) continue;

            if (sentenceTimingIndex < timings.length) {
                const absoluteTimestamp = timings[sentenceTimingIndex];
                const isLastCharOfSentence = (sentenceTimingIndex === timings.length - 1);
                const isLastCharOfBlock = isLastSentenceInBlock && isLastCharOfSentence;

                if (absoluteTimestamp >= audioCurrentTime) {
                    const delay = Math.max(0, (absoluteTimestamp - audioCurrentTime) * 1000);
                    const timerId = setTimeout(() => {
                        if (audioRef.current && !audioRef.current.paused) {
                            // Use functional update for setCurrentGlobalSentenceIndex
                            setCurrentGlobalSentenceIndex(prevGlobalIndex => {
                                if (prevGlobalIndex !== sentenceGlobalIndex) {
                                    // Schedule highlight update after state change
                                    setTimeout(() => setHighlightedCharIndex(charIdx), 0);
                                    return sentenceGlobalIndex; // Update global index
                                } else {
                                    setHighlightedCharIndex(charIdx); // Already correct sentence, just highlight
                                    return prevGlobalIndex; // Keep same global index
                                }
                            });

                            if (isLastCharOfBlock) {
                                console.log("VOICED BLOCK: Last char timer fired, advancing.");
                                setTimeout(() => {
                                     const nextGlobalIndex = blockGlobalStartIndex + blockTotalSentences;
                                     advance(nextGlobalIndex);
                                }, 50);
                            }
                        }
                    }, delay);
                    highlightTimersRef.current.push(timerId);
                }
                sentenceTimingIndex++;
            } else { console.warn(`Timing mismatch sentence globalIdx ${sentenceGlobalIndex}, char ${charIdx}`); break; }
        }
        if (sentenceTimingIndex < sentenceText.replace(/\s/g, '').length) { console.warn(`Not enough timings sentence globalIdx ${sentenceGlobalIndex}`); }
    }
  }, [clearHighlightTimers, advance]); // Removed currentGlobalSentenceIndex dependency

  // Effect to Preload/Load Audio and Schedule Timers ONCE per voiced block
  useEffect(() => {
    // Preload/Prepare audio as soon as a voiced block is visible
    if (isVisible && isVoicedBlock && blockData && !audioRef.current) {
        if (!currentVoicedBlockInfo.current || currentVoicedBlockInfo.current.src !== blockData.src) {
            const blockStartIndex = voicedBlockSentencesData[0]?.globalSentenceStartIndex ?? 0;
            currentVoicedBlockInfo.current = {
                src: blockData.src, sentencesData: voicedBlockSentencesData,
                blockGlobalStartIndex: blockStartIndex,
                blockTotalSentences: voicedBlockSentencesData.length
            };
            console.log("VOICED BLOCK: Preparing info for", currentVoicedBlockInfo.current.src);
        }

        console.log("VOICED BLOCK: Preloading audio", currentVoicedBlockInfo.current.src);
        audioRef.current = new Audio(currentVoicedBlockInfo.current.src);
        audioRef.current.muted = isMuted;
        audioRef.current.preload = 'auto';

        const handleAudioReady = () => {
            // Only schedule and play if the presentation is actually playing (after countdown)
            if (audioRef.current && isPlaying && countdown === null) {
                console.log("VOICED BLOCK: Audio ready, scheduling timers from", audioRef.current.currentTime);
                scheduleVoicedTextTimers(audioRef.current.currentTime);
                audioRef.current.play().catch(e => console.error("Audio play failed on ready:", e));
            }
        };

        const handleError = (e) => { console.error("Audio error:", e); stopAndCleanupAudio(); };

        audioRef.current.addEventListener('canplay', handleAudioReady);
        audioRef.current.addEventListener('error', handleError);
        audioRef.current.load(); // Start loading

        return () => { // Cleanup listeners
            if (audioRef.current) {
                audioRef.current.removeEventListener('canplay', handleAudioReady);
                audioRef.current.removeEventListener('error', handleError);
            }
        };
    // Play/Schedule timers only when isPlaying becomes true *after* countdown
    } else if (isVisible && isPlaying && countdown === null && isVoicedBlock && audioRef.current && audioRef.current.paused) {
         // If audio was preloaded but not played (e.g., countdown finished), play now
         console.log("VOICED BLOCK: Playing preloaded audio and scheduling timers from", audioRef.current.currentTime);
         scheduleVoicedTextTimers(audioRef.current.currentTime);
         audioRef.current.play().catch(e => console.error("Audio play failed on delayed start:", e));
    } else if (!isVoicedBlock && audioRef.current) {
        stopAndCleanupAudio(); // Cleanup if moved out of voiced block
    }

  }, [isVisible, isPlaying, countdown, isVoicedBlock, blockData, voicedBlockSentencesData, stopAndCleanupAudio, scheduleVoicedTextTimers, isMuted]); // Refined dependencies


  // --- Skip & Reset ---
  const skipDelay = () => advance();
  const resetPresentation = useCallback(() => {
    clearAnimationTimer(); clearMediaTimers(); clearCountdownTimers(); stopAndCleanupAudio();
    setCurrentGlobalSentenceIndex(0); setProgress(0); setMediaDelayRemaining(null); setCountdown(null); setVideoKey(Date.now());
    setTimeout(() => {
        if (isVisible) {
             setCountdown(3);
             const t1 = setTimeout(() => setCountdown(2), 1000), t2 = setTimeout(() => setCountdown(1), 2000), t3 = setTimeout(() => { setCountdown(null); setIsPlaying(true); }, 3000);
             countdownTimersRef.current = [t1, t2, t3];
        }
    }, 10);
  }, [stopAndCleanupAudio, isVisible]);

  // --- Play/Pause ---
  const togglePlayPause = useCallback(() => {
    if (countdown !== null) return;
    if (isVoicedBlock && !audioRef.current) { 
      console.log("TogglePlayPause: Audio ref missing."); 
      return; 
    }

    const currentlyPlaying = !isPlaying;
    setIsPlaying(currentlyPlaying);

    if (currentlyPlaying) { // --- Resuming ---
      if (audioRef.current && isVoicedBlock) {
        audioRef.current.play().catch(e => console.error("Audio resume failed:", e));
        setTimeout(() => {
          if (audioRef.current) {
            console.log("VOICED BLOCK: Resuming, scheduling timers from", audioRef.current.currentTime);
            scheduleVoicedTextTimers(audioRef.current.currentTime);
          }
        }, 50);
      } else if (mediaDelayRemaining !== null && !isVoicedBlock) {
        mediaDelayCountdownRef.current = setInterval(() => setMediaDelayRemaining(prev => (prev !== null && prev > 1) ? prev - 1 : null), 1000);
        mediaDelayTimerRef.current = setTimeout(advance, mediaDelayRemaining * 1000);
      }
    } else { // --- Pausing ---
      clearAnimationTimer(); clearMediaTimers(); clearHighlightTimers();
      if (audioRef.current) audioRef.current.pause();
    }
  }, [isPlaying, countdown, mediaDelayRemaining, isVoicedBlock, advance, scheduleVoicedTextTimers, clearHighlightTimers]);

  // --- Mute Toggle ---
  const toggleMute = () => {
      const newMutedState = !isMuted;
      setIsMuted(newMutedState);
      if (audioRef.current) {
          audioRef.current.muted = newMutedState;
      }
  };


  // --- UI Rendering ---
  if (!isVisible) return null;

  // Determine display element
  let currentDisplayElement = null;
  if (countdown === null) {
    if (isVoicedBlock) {
      currentDisplayElement = (
        <p className="text-4xl md:text-5xl lg:text-6xl font-semibold leading-normal whitespace-pre-wrap">
          {currentSentenceText.split('').map((char, i) => (
            <span key={i} className={i <= highlightedCharIndex && char !== ' ' ? 'text-yellow-400' : 'text-gray-300'}>
              {char}
            </span>
          ))}
        </p>
      );
    } else if (isRegularText) {
       currentDisplayElement = (
        <p className="text-4xl md:text-5xl lg:text-6xl font-semibold leading-normal whitespace-pre-wrap">
          {currentSentenceText.split('').map((char, i) => (
            <span key={i} className={i < charIndex ? 'text-yellow-400' : 'text-gray-300'}>
              {char}
            </span>
          ))}
        </p>
      );
    } else { // Other media types
        const mediaData = mediaMap[currentGlobalSentenceIndex];
        if (mediaData?.type === 'video') {
            const videoSrc = mode === 'presentation' ? `${mediaData.src}?autoplay=1&muted=1&title=0&byline=0&portrait=0` : mediaData.src;
            currentDisplayElement = <div key={videoKey} className="relative w-full" style={{ paddingTop: '56.25%' }}><iframe src={videoSrc} title={mediaData.title} frameBorder="0" allow="autoplay; fullscreen; picture-in-picture" allowFullScreen className="absolute top-0 left-0 w-full h-full rounded-lg"></iframe></div>;
        } else if (mediaData?.type === 'image') {
            currentDisplayElement = mediaData.element || (mediaData.src ? <img src={mediaData.src} alt={mediaData.title || "Image"} className="max-w-full max-h-[70vh] mx-auto rounded-lg"/> : null);
        } else if (mediaData?.element && mediaData.type !== 'highlight') {
            const isCatchOriginGame = mediaData.element?.type === CatchOriginGame;
            const extraProps = { mode: 'presentation' };
            if (isCatchOriginGame) {
                extraProps.title = mediaData.title || '';
                extraProps.instruction = mediaData.instruction || '';
            }
            currentDisplayElement = React.cloneElement(mediaData.element, extraProps);
        }
    }
  }

  // Button Logic
  const isGameOrQuiz = blockData?.type === 'game' || blockData?.type === 'quiz';
  const isGameDone = (blockData?.type === 'game' && blockData.gameType === 'drag-drop' && dragDropGameCorrect) || (blockData?.type === 'game' && blockData.gameType === 'catch-origin' && catchOriginGameCorrect);
  const isQuizDone = blockData?.type === 'quiz' && quizCorrect;
  const isGameOrQuizDone = isGameDone || isQuizDone;
  const isImageOrVideo = blockData && !isVoicedBlock && (blockData.type === 'image' || blockData.type === 'video');
  const isEndOfPresentation = currentGlobalSentenceIndex >= sentences.length - 1;

  const renderButtonContent = () => {
    // For regular paragraph text
    if (isRegularText) {
      if (isPlaying) {
        return <><i className="fas fa-pause"></i><span className="hidden sm:inline ml-1">Pause</span></>;
      } else {
        if (isEndOfPresentation && charIndex >= currentSentenceText.length) {
          return <><i className="fas fa-rotate-right"></i><span className="hidden sm:inline ml-1">Start Over</span></>;
        }
        return <><i className="fas fa-play"></i><span className="hidden sm:inline ml-1">Continue</span></>;
      }
    }
    
    // For voiced-text content
    if (isVoicedBlock) {
      if (isPlaying) {
        return <><i className="fas fa-pause"></i><span className="hidden sm:inline ml-1">Pause</span></>;
      } else {
        if (isEndOfPresentation && 
            currentVoicedBlockInfo.current && 
            highlightedCharIndex >= (currentVoicedBlockInfo.current.sentencesData[
              currentVoicedBlockInfo.current.sentencesData.length - 1
            ]?.text.length - 1)) {
          return <><i className="fas fa-rotate-right"></i><span className="hidden sm:inline ml-1">Start Over</span></>;
        }
        return <><i className="fas fa-play"></i><span className="hidden sm:inline ml-1">Continue</span></>;
      }
    }
    
    // For game or quiz content
    if (isGameOrQuiz) {
      return isGameOrQuizDone ? 
        <><i className="fas fa-play"></i><span className="hidden sm:inline ml-1">Continue</span></> : 
        <><i className="fas fa-hourglass-half"></i><span className="hidden sm:inline ml-1">Waiting...</span></>;
    }
    
    // For image or video content
    if (isImageOrVideo) {
      return <><i className="fas fa-forward"></i><span className="hidden sm:inline ml-1">Skip</span></>;
    }
    
    // Fallback for any other content type
    return <><i className="fas fa-play"></i><span className="hidden sm:inline ml-1">Continue</span></>;
  };

  // Only disable the button during countdown or when a regular text sentence is complete
  // For voiced-text, the button should always be enabled for play/pause
  const isButtonDisabled = countdown !== null || 
    (isRegularText && charIndex >= currentSentenceText.length && !isEndOfPresentation);

  const handleButtonClick = () => {
    // Always stop pulsing animation when button is clicked
    setLocalPulse(false);

    // Handle paragraph or voiced-text content first (most common case)
    if (isRegularText || isVoicedBlock) {
      // Special case for end of presentation
      if (!isPlaying && isEndOfPresentation) {
        const isLastVoicedCharDone =
          isVoicedBlock &&
          currentVoicedBlockInfo.current &&
          highlightedCharIndex >=
            (currentVoicedBlockInfo.current.sentencesData[
              currentVoicedBlockInfo.current.sentencesData.length - 1
            ]?.text.length - 1);
        const isLastTypedCharDone = isRegularText && charIndex >= currentSentenceText.length;
        
        if (isLastVoicedCharDone || isLastTypedCharDone) {
          console.log('Button Click: End of presentation, calling onRestart/resetPresentation.');
          if (typeof onRestart === 'function') {
            onRestart();
          } else {
            resetPresentation();
          }
          return;
        }
      }
      
      // Normal paragraph/voiced-text toggle play/pause
      console.log('Button Click: Toggling play/pause for text.');
      togglePlayPause();
      return;
    }
    
    // Handle image or video content
    if (isImageOrVideo) {
      skipDelay();
      return;
    }

    // Handle game or quiz content
    if (isGameOrQuiz) {
      if (isGameOrQuizDone) {
        console.log('Game/Quiz completed, advancing to next content');
        
        // Log the current state for debugging
        const nextIndex = currentGlobalSentenceIndex + 1;
          const { blockData: nextItemData } = findBlockAndSentenceIndex(nextIndex, content);
        console.log('Next content type:', nextItemData?.type);
        
        // Directly advance to next content
        advance();
        
        // Force isPlaying to true immediately and log it
        console.log('Setting isPlaying to true');
        setIsPlaying(true);
      } else {
        setStatusMessage(
          blockData?.type === 'quiz' ? 'Complete the quiz to continue' : 'Complete the game to continue'
        );
        setShowStatusToast(true);
        setTimeout(() => setShowStatusToast(false), 3000);
      }
      return;
    }

    // Handle other media at end of presentation
    if (!isPlaying && isEndOfPresentation && mediaMap[currentGlobalSentenceIndex]) {
      console.log('Button Click: End of presentation with media, calling onRestart/resetPresentation.');
      if (typeof onRestart === 'function') {
        onRestart();
      } else {
        resetPresentation();
      }
      return;
    }
  };

  // --- Component Return ---
  return (
    <div className="fixed inset-0 bg-brand-gray-darker text-gray-100 flex flex-col items-center z-50 overflow-hidden presentation">
      {countdown !== null && <div className="absolute inset-0 flex items-center justify-center z-20 bg-black bg-opacity-50"><div className="text-white text-9xl font-bold animate-ping opacity-75">{countdown}</div></div>}
      <div className={`flex-1 overflow-y-auto w-full max-w-5xl text-center p-1 sm:p-6 pb-24`}>
        <div className="min-h-full flex flex-col justify-center items-center w-full">
          {countdown === null && currentDisplayElement && (
             <div className={`w-full ${blockData?.type !== 'video' && !isVoicedBlock ? 'sm:p-4 sm:bg-gray-800 sm:rounded-lg' : ''}`}>
               {currentDisplayElement}
             </div>
          )}
        </div>
      </div>
      {mediaDelayRemaining !== null && !isVoicedBlock && !(blockData?.type === 'image' || blockData?.type === 'video') && (
        <div className="absolute top-5 right-5 z-40 flex items-center gap-2 p-2 bg-black bg-opacity-50 rounded-lg">
          <span className="text-sm text-gray-300">{statusMessage || `Next in... ${mediaDelayRemaining}s`}</span>
          {(blockData?.type === 'quiz' && quizCorrect) && (<button onClick={skipDelay} className="px-3 py-1 bg-gray-600 hover:bg-gray-500 text-white text-xs rounded-md font-medium">Skip</button>)}
        </div>
      )}
      {showStatusToast && <div className="fixed top-5 left-1/2 transform -translate-x-1/2 z-50 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg shadow">{statusMessage}</div>}
      <div className="fixed bottom-0 left-0 right-0 w-full bg-black bg-opacity-50 backdrop-blur-sm z-30">
        <div className="max-w-4xl mx-auto p-3 md:p-4">
          <div className="bg-gray-600 h-1.5 rounded-full overflow-hidden mb-3"><div className="bg-yellow-400 h-full transition-all duration-150 ease-linear" style={{ width: `${progress}%` }}/></div>
          <div className="flex justify-between items-center text-sm">
            {/* Left side: Speed Controls (only for regular text) or Mute Button (only for voiced text) or Placeholder */}
            <div className="flex-1 flex justify-start min-w-[150px]"> {/* Added min-width to prevent collapse */}
                {isRegularText ? (
                    <div className={`flex gap-2 items-center`}>
                      <span className="hidden sm:inline text-gray-300 text-xs font-medium">Speed:</span>
                      {Object.keys(getPresentationSpeed()).map(speedKey => <button key={speedKey} onClick={() => setCurrentSpeed(speedKey)} className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${currentSpeed === speedKey ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'}`}>{speedKey}</button>)}
                    </div>
                ) : isVoicedBlock ? (
                     <button onClick={toggleMute} className="px-4 py-1.5 rounded-md text-sm font-medium transition-colors bg-gray-700 text-gray-300 hover:bg-gray-600">
                         <i className={`fas ${isMuted ? 'fa-volume-mute' : 'fa-volume-high'}`}></i>
                         <span className="hidden sm:inline ml-1">{isMuted ? 'Unmute' : 'Mute'}</span>
                     </button>
                ) : (
                    <div></div> // Empty div as placeholder for other types (game, image, etc.)
                )}
            </div>
            {/* Action Buttons */}
            <div className="flex gap-3">
              {countdown === null && (
                <button key={pulseKey} onClick={handleButtonClick} disabled={isButtonDisabled} className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors shadow ${isButtonDisabled ? 'bg-gray-500 text-gray-400 cursor-not-allowed' : isImageOrVideo ? 'bg-yellow-500 hover:bg-yellow-600 text-black' : isGameOrQuiz ? (isGameOrQuizDone ? 'bg-brand-green hover:bg-brand-green-dark text-white' : 'bg-blue-500 hover:bg-blue-600 text-white') : isPlaying ? 'bg-gray-300 hover:bg-gray-400 text-gray-800' : 'bg-brand-green hover:bg-brand-green-dark text-white'} ${(localPulse || (isGameOrQuiz && isGameOrQuizDone)) ? 'animate-pulse-custom' : ''}`}>
                  {renderButtonContent()}
                </button>
              )}
              <button onClick={() => onClose(currentGlobalSentenceIndex)} className="px-4 py-1.5 rounded-md bg-gray-300 hover:bg-gray-400 text-gray-800 text-sm font-medium transition-colors">
                <i className="hidden sm:inline fas fa-times"></i><span className="ml-0 sm:ml-1">Close</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default PresentationOverlay;
