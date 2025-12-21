"use client";

import { useMemo, useCallback, useRef } from 'react';
import { GripVertical, Type, Trash2 } from 'lucide-react';
import useDesignStore, { Element, TextElement, ImageElement } from '@/app/lib/useDesignStore';

export default function DesignLayers() {
  const {
    currentDesign,
    currentView,
    selectedElementId,
    setSelectedElementId,
    updateElement,
    deleteElement,
  } = useDesignStore();

  const currentElements = currentDesign.elements[currentView];

  // Sort by zIndex descending (highest = topmost layer)
  const sortedElements = useMemo(
    () => [...currentElements].sort((a, b) => b.zIndex - a.zIndex),
    [currentElements]
  );

  // Drag state for reordering
  const draggedIdRef = useRef<number | null>(null);

  const handleDragStart = useCallback((e: React.DragEvent, id: number) => {
    draggedIdRef.current = id;
    e.dataTransfer.effectAllowed = 'move';
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent, targetId: number) => {
      e.preventDefault();

      const draggedId = draggedIdRef.current;
      if (!draggedId || draggedId === targetId) return;

      const draggedEl = currentElements.find((el) => el.id === draggedId);
      const targetEl = currentElements.find((el) => el.id === targetId);

      if (!draggedEl || !targetEl) return;

      // Swap zIndex
      updateElement(draggedId, { zIndex: targetEl.zIndex });
      updateElement(targetId, { zIndex: draggedEl.zIndex });

      draggedIdRef.current = null;
    },
    [currentElements, updateElement]
  );

  const handleClick = useCallback(
    (id: number) => {
      setSelectedElementId(id);
    },
    [setSelectedElementId]
  );

  return (
    <div className="w-full lg:w-64 bg-white border-t lg:border-l border-gray-200 p-4 overflow-y-auto">
      <h2 className="text-lg font-black mb-4">LAYERS ({currentView.toUpperCase()})</h2>
      <p className="text-xs text-gray-500 mb-4">Drag to reorder (top = frontmost)</p>

      {sortedElements.length === 0 ? (
        <p className="text-sm text-gray-500 text-center py-8">No elements added yet</p>
      ) : (
        <div className="space-y-2" onDragOver={handleDragOver}>
          {sortedElements.map((element, index) => (
            <div
              key={element.id}
              className={`p-3 rounded-lg border-2 cursor-pointer transition-all draggable group ${
                selectedElementId === element.id
                  ? 'border-black bg-gray-50 shadow-md'
                  : 'border-gray-200 hover:border-gray-400 hover:bg-gray-50'
              }`}
              draggable
              onDragStart={(e) => handleDragStart(e, element.id)}
              onDrop={(e) => handleDrop(e, element.id)}
              onClick={() => handleClick(element.id)}
            >
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <GripVertical className="w-5 h-5 text-gray-400 flex-shrink-0" />

                  {element.type === 'image' ? (
                    <img
                      src={(element as ImageElement).src}
                      alt="Layer preview"
                      className="w-10 h-10 object-cover rounded flex-shrink-0"
                    />
                  ) : (
                    <div className="w-10 h-10 bg-gray-200 rounded flex items-center justify-center flex-shrink-0">
                      <Type className="w-6 h-6 text-gray-500" />
                    </div>
                  )}

                  <div className="min-w-0">
                    <p className="text-xs font-bold text-gray-600">
                      {element.type === 'image' ? 'Image' : 'Text'} Layer {index + 1}
                    </p>
                    {element.type === 'text' ? (
                      <p className="text-sm font-medium truncate max-w-full">
                        {(element as TextElement).text || 'Empty text'}
                      </p>
                    ) : (
                      <p className="text-xs text-gray-500">Uploaded Image</p>
                    )}
                  </div>
                </div>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteElement(element.id);
                  }}
                  className="text-red-500 hover:text-red-700 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}