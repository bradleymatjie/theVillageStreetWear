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

  const sortedElements = useMemo(
    () => [...currentElements].sort((a, b) => b.zIndex - a.zIndex),
    [currentElements]
  );

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
    <div className="w-full lg:w-120 bg-theme-surface border-t lg:border-l border-theme-ink/15 p-4 overflow-y-auto">
      <h2 className="text-lg font-black mb-4">LAYERS ({currentView.toUpperCase()})</h2>
      <p className="text-xs text-theme-muted mb-4">Drag to reorder (top = frontmost)</p>

      {sortedElements.length === 0 ? (
        <p className="text-sm text-theme-muted text-center py-8">No elements added yet</p>
      ) : (
        <div className="space-y-2" onDragOver={handleDragOver}>
          {sortedElements.map((element, index) => (
            <div
              key={element.id}
              className={`p-3 rounded-lg border-2 cursor-pointer transition-all draggable group ${
                selectedElementId === element.id
                  ? 'border-theme-ink bg-theme-soft shadow-md'
                  : 'border-theme-ink/15 hover:border-theme-ink/15 hover:bg-theme-soft'
              }`}
              draggable
              onDragStart={(e) => handleDragStart(e, element.id)}
              onDrop={(e) => handleDrop(e, element.id)}
              onClick={() => handleClick(element.id)}
            >
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <GripVertical className="w-5 h-5 text-theme-muted flex-shrink-0" />

                  {element.type === 'image' ? (
                    <img
                      src={(element as ImageElement).src}
                      alt="Layer preview"
                      className="w-10 h-10 object-cover rounded flex-shrink-0"
                    />
                  ) : (
                    <div className="w-10 h-10 bg-theme-matte rounded flex items-center justify-center flex-shrink-0">
                      <Type className="w-6 h-6 text-theme-muted" />
                    </div>
                  )}

                  <div className="min-w-0">
                    <p className="text-xs font-bold text-theme-muted">
                      {element.type === 'image' ? 'Image' : 'Text'} Layer {index + 1}
                    </p>
                    {element.type === 'text' ? (
                      <p className="text-sm font-medium truncate max-w-full">
                        {(element as TextElement).text || 'Empty text'}
                      </p>
                    ) : (
                      <p className="text-xs text-theme-muted">Uploaded Image</p>
                    )}
                  </div>
                </div>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteElement(element.id);
                  }}
                  className="text-theme-error-ink hover:text-theme-error-ink opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0"
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