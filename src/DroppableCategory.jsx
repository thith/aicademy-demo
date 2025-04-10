import React from 'react';
import { useDroppable } from '@dnd-kit/core';

export function DroppableCategory({ id, name, children, isDarkMode, logo }) {
  const { setNodeRef, isOver } = useDroppable({ id });

  // Base classes - adjust padding, min-height for better fit
  const baseClasses = "flex-grow flex flex-col items-center justify-start p-2 rounded-lg transition-colors min-h-[4.5rem]"; // rounded-lg

  // Mode-specific background and border
  const bgClasses = isDarkMode ? 'bg-gray-700 border border-gray-600' : 'bg-brand-gray-light border border-gray-300';

  // Highlight when dragging over - subtle background change and ring
  const overClasses = isOver
    ? `ring-2 ring-offset-2 ring-brand-green ${isDarkMode ? 'bg-gray-600 ring-offset-gray-700' : 'bg-green-50 ring-offset-brand-gray-light'}`
    : '';

  return (
    <div
      ref={setNodeRef}
      className={`${baseClasses} ${bgClasses} ${overClasses}`}
      data-category-id={id}
    >
      {/* Category Name with Logo */}
      {name && (
        <div className="flex items-center justify-center gap-1.5 mb-2">
          {logo && (
            <span className={`inline-flex ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              {logo({ width: 14, height: 14 })}
            </span>
          )}
          <p className={`text-xs font-medium text-center ${isDarkMode ? 'text-gray-400' : 'text-brand-gray'}`}>{name}</p>
        </div>
      )}

      {/* Container for the draggable items - ensure it centers content */}
      <div className="flex flex-wrap gap-1.5 justify-center w-full flex-grow items-center"> {/* Adjusted gap */}
         {children}
      </div>
    </div>
  );
}
