import React, { useState, useEffect } from 'react';
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  DragOverlay,
  // Removed incorrect arrayMove import from @dnd-kit/core
} from '@dnd-kit/core';
import {
  SortableContext,
  rectSortingStrategy,
  arrayMove // Correctly import arrayMove from @dnd-kit/sortable
} from '@dnd-kit/sortable';
import { DraggableItem } from './DraggableItem';
import { DroppableCategory } from './DroppableCategory';

function shuffle(array) {
  return array.sort(() => Math.random() - 0.5);
}

export default function DragDropGame({
  title,
  instruction,
  onCorrect,
  mode = 'reading',
  externalTriggerCheck = false,
  items: propItems,
  categories: propCategories,
  correctPairs: propCorrectPairs
}) {
  const initialItems = propItems || [];
  const initialCategories = propCategories || [];
  const correctPairs = propCorrectPairs || {};

  const [items, setItems] = useState(shuffle([...initialItems]));
  const [cats, setCats] = useState(shuffle([...initialCategories]));

  const [containers, setContainers] = useState({
    source: items.map((item) => item.id),
    ...cats.reduce((acc, cat) => ({ ...acc, [cat.id]: [] }), {}),
  });
  const [activeId, setActiveId] = useState(null);
  const [checked, setChecked] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);

  const sensors = useSensors(useSensor(PointerSensor));
  const isDarkMode = mode === 'presentation';
  
  // Watch for external trigger to check results
  useEffect(() => {
    if (externalTriggerCheck && !checked && containers.source.length === 0) {
      handleCheck();
    }
  }, [externalTriggerCheck]);

  const findContainer = (id) => {
    if (!id) return null;
    if (id === 'source' || cats.some(cat => cat.id === id)) return id;
    return Object.keys(containers).find((key) => containers[key].includes(id));
  };

  const handleDragStart = ({ active }) => {
    setActiveId(active.id);
    setChecked(false);
    setIsCorrect(false);
    onCorrect(false);
  };

  // handleDragOver is now minimal - only used for potential visual feedback if needed
  const handleDragOver = ({ active, over }) => {
    // Can add logic here later if specific hover effects are needed beyond what DroppableCategory handles
  };

  const handleDragEnd = ({ active, over }) => {
    setActiveId(null); // Reset active item display

    if (!over) { // Dropped outside any droppable
        // If the item came from a category, move it back to source
        const activeContainerId = findContainer(active.id);
        if (activeContainerId && activeContainerId !== 'source') {
            setContainers(prev => {
                const newContainers = JSON.parse(JSON.stringify(prev));
                newContainers[activeContainerId] = newContainers[activeContainerId].filter(id => id !== active.id);
                if (!newContainers.source.includes(active.id)) {
                    newContainers.source.push(active.id);
                }
                return newContainers;
            });
        }
        setChecked(false);
        setIsCorrect(false);
        onCorrect(false);
        return;
    }

    const activeContainerId = findContainer(active.id);
    const overContainerId = findContainer(over.id);

    if (!activeContainerId || !overContainerId) return; // Should not happen if over is valid

    // --- Logic moved from handleDragOver to handleDragEnd ---
    if (activeContainerId !== overContainerId) {
        // Prevent dropping back into the source container if item started elsewhere
        if (overContainerId === 'source' && activeContainerId !== 'source') {
            // Reset check status as the attempt is invalidated
            setChecked(false);
            setIsCorrect(false);
            onCorrect(false);
            return;
        }

        setContainers((prev) => {
            const newContainers = JSON.parse(JSON.stringify(prev));
            const activeItems = newContainers[activeContainerId];
            const overItems = newContainers[overContainerId];
            let itemToMoveToSource = null;

            // 1. Identify item to displace (if any)
            if (overContainerId !== 'source' && overItems.length > 0 && overItems[0] !== active.id) {
                itemToMoveToSource = overItems[0];
            }

            // 2. Remove activeId from its original container
            newContainers[activeContainerId] = activeItems.filter((id) => id !== active.id);

            // 3. If an item was displaced, remove it from the target container
            if (itemToMoveToSource) {
                newContainers[overContainerId] = [];
            }

            // 4. Add activeId to the target container
            if (!Array.isArray(newContainers[overContainerId])) {
                newContainers[overContainerId] = [];
            }
            if (!newContainers[overContainerId].includes(active.id)) {
                newContainers[overContainerId] = [active.id];
            }

            // 5. Add displaced item back to source, preventing duplicates
            if (itemToMoveToSource) {
                if (!newContainers.source.includes(itemToMoveToSource)) {
                    newContainers.source.push(itemToMoveToSource);
                }
            }

             // 6. Final check: Ensure active.id doesn't exist anywhere else (safeguard)
             Object.keys(newContainers).forEach(key => {
                 if (key !== overContainerId) {
                     newContainers[key] = newContainers[key].filter(id => id !== active.id);
                 }
             });

            return newContainers;
        });

    } else if (activeContainerId === 'source') {
        // Handle reordering within the source container
        const items = containers[activeContainerId];
        const oldIndex = items.indexOf(active.id);
        const newIndex = over.id === 'source' ? items.length - 1 : items.indexOf(over.id);

        if (oldIndex !== newIndex && newIndex !== -1) {
            setContainers((prev) => ({
                ...prev,
                [activeContainerId]: arrayMove(prev[activeContainerId], oldIndex, newIndex),
            }));
        }
    }
     // --- End moved logic ---

    // Always reset check status after a drag operation completes
    setChecked(false);
    setIsCorrect(false);
    onCorrect(false);
  };

  // handleCheck remains the same - only runs when button is clicked
  const handleCheck = () => {
     if (checked) return;

    const correct = Object.entries(correctPairs).every(
      ([itemId, categoryId]) => containers[categoryId]?.includes(itemId)
    ) && containers.source.length === 0;

    setChecked(true);
    setIsCorrect(correct);
    onCorrect(correct);
  };

  const getActiveItemData = () => items.find(item => item.id === activeId);

  return (
    <div className={`p-3 sm:p-8 my-6 -mx-3 rounded-none sm:mx-0 sm:rounded-lg shadow-lg border ${
        isDarkMode 
          ? 'bg-gray-800 border-gray-700 text-white max-sm:border-none max-sm:bg-transparent max-sm:shadow-none max-sm:rounded-none max-sm:p-3 max-sm:my-0 max-sm:-mx-3'
          : 'bg-white border-gray-200 text-brand-gray-darker'
      } ${checked && isCorrect ? '!border-brand-green' : ''}`}>
      {title && (
        <h3 className={`text-lg font-semibold mb-1 ${isDarkMode ? 'text-white' : 'text-brand-gray-darker'}`}>{title}</h3>
      )}
      {instruction && (
        <p className={`text-sm mb-5 ${isDarkMode ? 'text-gray-300' : 'text-brand-gray'}`}>{instruction}</p>
      )}

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver} // Keep for potential future hover effects
        onDragEnd={handleDragEnd}   // State updates happen here now
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Source Container */}
          <div className={`p-0 sm:p-4 rounded-lg min-h-[10rem] flex flex-col ${isDarkMode ? 'bg-gray-700' : 'bg-brand-gray-light'}`}>
            <DroppableCategory id="source" name="Kéo từ đây" isDarkMode={isDarkMode}>
              <SortableContext items={containers.source} strategy={rectSortingStrategy}>
                <div className="flex flex-wrap gap-2 justify-center">
                  {containers.source.map((itemId) => {
                    const item = items.find((i) => i.id === itemId);
                    return item ? <DraggableItem key={itemId} id={itemId} name={item.name} logo={item.logo} isDarkMode={isDarkMode} /> : null;
                  })}
                </div>
              </SortableContext>
            </DroppableCategory>
          </div>

          {/* Category Containers */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {cats.map((category) => (
              <div key={category.id} className={`p-2 rounded-lg min-h-[6rem] flex flex-col ${isDarkMode ? 'bg-gray-700' : 'bg-brand-gray-light'}`}>
                <DroppableCategory id={category.id} name={category.name} logo={category.logo} isDarkMode={isDarkMode}>
                  <SortableContext items={containers[category.id] || []} strategy={rectSortingStrategy}>
                    <div className="flex-grow flex items-center justify-center min-h-[2.5rem]">
                      {(containers[category.id] || []).map((itemId) => {
                        const item = items.find((i) => i.id === itemId);
                        return item ? <DraggableItem key={itemId} id={itemId} name={item.name} logo={item.logo} isDarkMode={isDarkMode} /> : null;
                      })}
                    </div>
                  </SortableContext>
                </DroppableCategory>
              </div>
            ))}
          </div>
        </div>

        <DragOverlay>
          {activeId ? (
            <div className={`p-2 rounded-md shadow-xl text-sm font-medium ${isDarkMode ? 'bg-gray-600 text-white' : 'bg-white text-brand-gray-darker'}`}>
              {getActiveItemData()?.name}
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>

      {/* Controls and Feedback Area */}
      <div className="flex items-center gap-4 mt-6">
        <button
          onClick={handleCheck}
          disabled={containers.source.length > 0 || checked}
          className={`px-5 py-2.5 rounded-lg shadow-sm text-sm font-medium transition-colors ${
            (containers.source.length > 0 || checked)
              ? `cursor-not-allowed ${isDarkMode ? 'bg-gray-600 text-gray-400' : 'bg-gray-200 text-gray-500'}`
              : `text-white bg-brand-green hover:bg-brand-green-dark`
          }`}
        >
          {checked ? 'Checked' : 'Check'}
        </button>

        {checked && (
          <span
            className={`text-sm font-semibold ${
              isCorrect
                ? (isDarkMode ? 'text-green-400' : 'text-brand-green')
                : (isDarkMode ? 'text-red-400' : 'text-red-600')
            }`}
          >
            {isCorrect
              ? (mode === 'reading' ? '✅ Great! Click Next to continue.' : '✅ Great! Click Continue.')
              : "❌ Incorrect, let's try again."}
          </span>
        )}
      </div>
    </div>
  );
}
