import React, { useState, useEffect, useRef } from 'react';

function shuffle(array) {
  return array.sort(() => Math.random() - 0.5);
}

export default function CatchOriginGame({
  onComplete,
  mode = 'reading',
  started = true,
  winningThreshold = 8,
  baskets = [],
  basketIcons = {},
  items = [],
  title = '',
  instruction = ''
}) {
  const isDarkMode = mode === 'presentation';
  const [allItems, setAllItems] = useState([]);
  const [caughtItems, setCaughtItems] = useState([]);
  const [score, setScore] = useState(0);
  const correctCountRef = useRef(0);
  const processedItemsRef = useRef(new Set()); // Track processed items
  const [basketHighlight, setBasketHighlight] = useState(null); // For basket effects
  const [basketsX, setBasketsX] = useState(50); // Percentage, center
  const [gameOver, setGameOver] = useState(false);
  const [message, setMessage] = useState('');
  const containerRef = useRef(null);
  const [containerHeight, setContainerHeight] = useState(0);
  const [isMobile, setIsMobile] = useState(false);

  // Detect container height and device type
  useEffect(() => {
    const updateContainerHeight = () => {
      if (containerRef.current) {
        const height = containerRef.current.clientHeight;
        setContainerHeight(height);
        setIsMobile(window.innerWidth < 640); // sm breakpoint in Tailwind is 640px
      }
    };
    
    // Initial measurement
    updateContainerHeight();
    
    // Re-measure on resize
    window.addEventListener('resize', updateContainerHeight);
    
    return () => {
      window.removeEventListener('resize', updateContainerHeight);
    };
  }, []);

  useEffect(() => {
    if (started) {
      startGame();
    }
    return () => {};
  }, []); // Run only once on mount, does not depend on 'started'

  const startGame = () => {
    setGameOver(false);
    setMessage('');
    setCaughtItems([]);
    setScore(0);
    correctCountRef.current = 0;
    processedItemsRef.current.clear(); // Reset processed items
    setBasketHighlight(null);
    
    const shuffled = shuffle([...items]); // Use items from props
    let lastStartTime = performance.now();
    const allItems = shuffled.map((item, idx) => {
      let x;
          if (item.basket === 'Europe') {
            x = Math.random() * 50 + 10; // 10-60%
          } else if (item.basket === 'USA') {
            x = Math.random() * 50 + 25; // 25-75%
          } else if (item.basket === 'China') {
            x = Math.random() * 50 + 40; // 40-90%
          }
      const delay = 3000 + Math.random() * 2000; // 3-5 seconds
      const startTime = idx === 0 ? lastStartTime : lastStartTime + delay;
      lastStartTime = startTime;
      return {
        ...item,
        id: idx,
        x,
        y: -5,
        speed: 0.5,
        status: 'normal',
        startTime,
      };
    });
    setAllItems(allItems);
  };

  // Keyboard arrow key control
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'ArrowLeft') {
        setBasketsX((prev) => Math.max(0, prev - 5));
      } else if (e.key === 'ArrowRight') {
        setBasketsX((prev) => Math.min(100, prev + 5));
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleMove = (e) => {
    const containerWidth = containerRef.current.offsetWidth;
    let x;
    if (e.type === 'mousemove') {
      x = (e.clientX / containerWidth) * 100;
    } else if (e.type === 'touchmove') {
      x = (e.touches[0].clientX / containerWidth) * 100;
    }
    setBasketsX(Math.max(0, Math.min(100, x)));
  };

  const lastTimestampRef = useRef(performance.now());

  useEffect(() => {
    if (!started || gameOver) {
      return () => {}; // Do not create interval, no need to clear
    }

    lastTimestampRef.current = performance.now();

    const interval = setInterval(() => {
      const now = performance.now();
      const deltaTime = (now - lastTimestampRef.current) / 16; // Normalize to 60fps frame unit
      lastTimestampRef.current = now;

      setAllItems((prev) =>
        prev.map((item) => {
          const nowTime = performance.now();
          if (nowTime < item.startTime) return item; // Not yet time to drop
          if (item.y >= 1000) return item; // Already dropped past the floor
          return { ...item, y: item.y + item.speed * deltaTime };
        })
      );
    }, 16);
    return () => clearInterval(interval);
  }, [started, gameOver]);

  // Calculate detection thresholds based on container height and device type
  const getDetectionThresholds = () => {
    if (!containerHeight) return { basketTop: 270, floor: 350 }; // Default fallback
    
    // Different detection thresholds for mobile vs desktop
    if (isMobile) {
      // On mobile: detect when item touches the top edge of basket (about 80% down the container)
      // and detect floor hits immediately when they reach the bottom
      return {
        basketTop: containerHeight * 0.80, // Detect at basket top edge
        floor: containerHeight - 10 // Detect almost at the bottom (10px from bottom)
      };
    } else {
      // On desktop: detect when item is much closer to the basket (about 85% down)
      // This fixes the issue of catching items too early on desktop
      return {
        basketTop: containerHeight * 0.85, // Detect closer to basket
        floor: containerHeight * 0.95 // Detect slightly before bottom
      };
    }
  };

  useEffect(() => {
    if (!started) return;
    if (gameOver) return;

    const { basketTop, floor } = getDetectionThresholds();

    let hasWrong = false;

    allItems.forEach((item) => {
      if (!processedItemsRef.current.has(item.id)) {
        if (item.y > floor) {
          processedItemsRef.current.add(item.id);
          setBasketHighlight({ index: -1, type: 'wrong' });
          if (!gameOver) {
            hasWrong = true;
            setGameOver(true);
            setMessage(`Bạn đã để rơi mất ${item.name} (${item.basket})!`);
            setAllItems((prev) =>
              prev
                .map((f) => (f.id === item.id ? { ...f, status: 'wrong' } : f))
                .filter((f) => f.id !== item.id)
            );
            onComplete(false);
          }
        } else if (item.y > basketTop) {
          const groupWidth = 90;
          const groupLeft = basketsX - groupWidth / 2;
          const relativeX = ((item.x - groupLeft) / groupWidth) * 100;
          if (relativeX < -10 || relativeX > 110) {
            return;
          }
          processedItemsRef.current.add(item.id);
          let basketIndex;
          if (relativeX < 30) basketIndex = 0;
          else if (relativeX < 70) basketIndex = 1;
          else basketIndex = 2;
          const basketRegion = baskets[Math.max(0, Math.min(2, basketIndex))];

          if (basketRegion === item.basket) {
            setCaughtItems((prev) => [...prev, item]);
            setScore((prev) => prev + 1);
            correctCountRef.current += 1;
            setBasketHighlight({ index: basketIndex, type: 'correct' });
            setTimeout(() => setBasketHighlight(null), 300);
            if (correctCountRef.current >= winningThreshold) {
              setGameOver(true);
              setMessage('🎉 Bạn đã phân loại đúng tất cả!');
              setTimeout(() => onComplete(true), 0);
            }
            setAllItems((prev) =>
              prev.map((f) =>
                f.id === item.id ? { ...f, status: 'correct' } : f
              )
            );
            setTimeout(() => {
              setAllItems((prev) => prev.filter((f) => f.id !== item.id));
            }, 300);
          } else {
            if (!gameOver) {
              hasWrong = true;
              setGameOver(true);
              setMessage(`Sai rồi! ${item.name} là của ${item.basket}.`);
              setBasketHighlight({ index: basketIndex, type: 'wrong' });
              setTimeout(() => setBasketHighlight(null), 300);
              setAllItems((prev) =>
                prev.map((f) =>
                  f.id === item.id ? { ...f, status: 'wrong' } : f
                )
              );
              setTimeout(() => {
                setAllItems((prev) => prev.filter((f) => f.id !== item.id));
              }, 300);
              setTimeout(() => onComplete(false), 0);
            }
          }
        }
      }
    });
  }, [allItems, basketsX, gameOver, caughtItems, onComplete, containerHeight, isMobile]);

  return (
    <>
      {(title || instruction) && (
        <div className="mb-4">
          {title && <h3 className="text-lg font-semibold">{title}</h3>}
          {instruction && <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-brand-gray'}`}>{instruction}</p>}
        </div>
      )}
      <div
        ref={containerRef}
        onMouseMove={handleMove}
        onTouchMove={handleMove}
        className={`relative w-full h-80 sm:h-96 border rounded-lg overflow-hidden ${
          isDarkMode ? 'bg-gray-800' : 'bg-white'
        }`}
        style={{ touchAction: 'none' }} // Prevent scrolling on touch drag
        onTouchStart={(e) => e.preventDefault()} // Prevent default touch behavior
      >
        {/* Score Counter - top left corner */}
        <div className="absolute top-2 left-2 bg-black bg-opacity-50 text-white font-bold px-2 py-1 rounded-lg text-sm z-10">
          {score}/{winningThreshold}
        </div>
        {/* Floor indicator - shows red flash when items hit the floor */}
        <div 
          className={`absolute bottom-0 left-0 right-0 h-1 transition-colors duration-300 ${
            basketHighlight?.index === -1 && basketHighlight.type === 'wrong'
              ? 'bg-red-500'
              : 'bg-transparent'
          }`}
        />
        {/* Falling items - improved visibility */}
        {allItems
          .filter((item) => item.y >= 0 && item.y < 1000)
          .map((item) => (
            <div
              key={item.id}
              className={`absolute text-xs sm:text-sm font-semibold px-2 py-1 rounded-lg shadow-md ${
                item.status === 'correct'
                  ? 'bg-green-500 text-white'
                  : item.status === 'wrong'
                  ? 'bg-red-500 text-white'
                  : 'bg-gray-400 text-white'
              }`}
              style={{
                left: `${item.x}%`,
                top: `${item.y}px`,
                transform: 'translate(-50%, 0)',
                transition: 'top 0.016s linear',
                minWidth: '80px',
                textAlign: 'center',
              }}
            >
              {item.name}
            </div>
          ))}

        {/* Baskets - styled to look more like actual baskets */}
        <div
          className="absolute bottom-0 flex justify-between w-full transition-all duration-100"
          style={{
            left: `${basketsX}%`,
            transform: 'translateX(-50%)',
            width: '90%', // Increased from 60% to 90% for mobile
          }}
        >
          {baskets.map((region, index) => (
            <div
              key={region}
              className={`flex-1 mx-1 text-xs font-semibold text-center relative ${
                mode === 'presentation' ? 'text-white' : 'text-green-800'
              }`}
            >
              {/* Basket label */}
              <div className="absolute -top-5 left-0 right-0 text-center">
                {basketIcons[region]} {region}
              </div>
              
              {/* Basket shape with highlight effect */}
              <div 
                className={`h-12 sm:h-10 rounded-b-xl border-b-2 border-l-2 border-r-2 border-t-0 transition-colors duration-300 ${
                  basketHighlight?.index === index 
                    ? (basketHighlight.type === 'correct' 
                        ? 'bg-green-400 border-green-500' 
                        : 'bg-red-400 border-red-500')
                    : (mode === 'presentation' 
                        ? 'bg-gray-700 border-gray-600' 
                        : 'bg-green-50 border-green-200')
                }`}
                style={{
                  borderTopLeftRadius: '40%',
                  borderTopRightRadius: '40%',
                }}
              >
                {/* Basket handle */}
                <div 
                  className={`mx-auto w-12 sm:w-8 h-3 border-t-2 rounded-t-full -mt-2 transition-colors duration-300 ${
                    basketHighlight?.index === index 
                      ? (basketHighlight.type === 'correct' 
                          ? 'border-green-500' 
                          : 'border-red-500')
                      : (mode === 'presentation' 
                          ? 'border-gray-600' 
                          : 'border-green-200')
                  }`}
                ></div>
              </div>
            </div>
          ))}
        </div>

        {/* Message */}
        {gameOver && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black bg-opacity-50 p-4">
            <div className={`mb-4 px-4 py-3 rounded-lg border font-semibold text-lg text-center max-w-xs
              ${message.includes('🎉') ? 'bg-green-100 text-green-700 border-green-300' : 'bg-red-100 text-red-700 border-red-300'}`}>
              {message.includes('🎉') ? message : `❌ ${message}`}
            </div>
            <button
              onClick={startGame}
              className={`px-4 py-2 rounded shadow font-semibold ${
                message.includes('🎉')
                  ? 'bg-gray-300 hover:bg-gray-400 text-gray-800'
                  : 'bg-red-600 hover:bg-red-700 text-white'
              }`}
            >
              Thử lại
            </button>
          </div>
        )}
      </div>
      
      {/* Game info instructions - styled for better mobile display */}
      <div className="mt-2 grid grid-cols-1 sm:flex sm:justify-between items-center text-xs">
        <div className="bg-gray-100 rounded-lg p-2 text-gray-600 w-full">
          <span className="hidden sm:inline">👉 Dùng phím mũi tên trên bàn phím để di chuyển giỏ ổn định hơn</span>
          <span className="sm:hidden">👉 Tap vào điểm trên màn hình để gióng giỏ USA theo đó.</span>
        </div>
      </div>
    </>
  );
}
