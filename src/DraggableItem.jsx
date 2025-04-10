import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

export function DraggableItem({ id, name, isDarkMode }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition: transition || 'transform 0.2s ease', // Add default transition
    opacity: isDragging ? 0.6 : 1,
    zIndex: isDragging ? 100 : 'auto', // Higher z-index when dragging
  };

  // Base classes - more padding, slightly larger text
  const baseClasses = "px-3 py-1.5 text-sm font-medium rounded-md shadow-sm cursor-grab touch-none border";

  // Mode-specific classes - adjust colors for better fit with design
  const modeClasses = isDarkMode
    ? 'bg-gray-500 text-white border-gray-600 hover:bg-gray-400'
    : 'bg-white text-brand-gray-dark border-gray-300 hover:bg-gray-50';

  // Dragging-specific classes - use brand green ring
  const draggingClasses = isDragging ? 'ring-2 ring-brand-green shadow-lg' : 'shadow-sm';

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`${baseClasses} ${modeClasses} ${draggingClasses}`}
      data-item-id={id}
    >
      {name}
    </div>
  );
}
