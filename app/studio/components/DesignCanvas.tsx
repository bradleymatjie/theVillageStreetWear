"use client";
import { useRef, useCallback, useMemo, useState } from 'react';
import { Trash2, RotateCw, Download, ShoppingCart, MoveLeftIcon, ChevronLeft, HomeIcon } from 'lucide-react';
import useDesignStore, { ImageElement, TextElement } from '@/app/lib/useDesignStore';
import { toPng } from 'html-to-image';
import React from 'react';
import Link from 'next/link';

interface TShirtColor {
  name: string;
  hex: string;
  frontImage: string;
  backImage: string;
}

const tshirtColors: TShirtColor[] = [
  { name: 'white', hex: '#FFFFFF', frontImage: '/assets/white_front.png', backImage: '/assets/white_back.png' },
  { name: 'black', hex: '#000000', frontImage: '/assets/black_front.png', backImage: '/assets/black_back.png' },
  { name: 'red', hex: '#FF0000', frontImage: '/assets/red_front.png', backImage: '/assets/red_back.png' },
];

export default function DesignCanvas() {
  const {
    currentDesign,
    currentView,
    selectedElementId,
    setSelectedElementId,
    updateElement,
    deleteElement,
    addToCart,
  } = useDesignStore();

  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const ToCaptureRef = useRef<HTMLDivElement>(null);
  const designAreaRef = useRef<HTMLDivElement>(null);

  const handleAddToCart = async () => {
    if (!ToCaptureRef.current) return;
    
    setIsAddingToCart(true);
    const prevId = selectedElementId;
    setSelectedElementId(null); // Remove blue rings for clean screenshot

    // Give React a moment to clear the UI handles
    setTimeout(async () => {
      try {
        const dataUrl = await toPng(ToCaptureRef.current!, {
          cacheBust: true,
          backgroundColor: '#ffffff',
          pixelRatio: 2,
        });

        // Add to cart with screenshot and current view's elements
        addToCart({
          name: `${currentDesign.tshirtColor} T-Shirt (${currentView})`,
          screenshot: dataUrl,
          elements: currentDesign.elements[currentView],
          view: currentView,
          tshirtColor: currentDesign.tshirtColor,
          price: 250, // Set your price here
        });
        setSelectedElementId(prevId); // Restore UI
      } catch (err) {
        console.error('Failed to add to cart:', err);
        setSelectedElementId(prevId);
      } finally {
        setIsAddingToCart(false);
      }
    }, 150);
  };

  const handleDownload = async () => {
    if (!ToCaptureRef.current) return;

    const prevId = selectedElementId;
    setSelectedElementId(null); // Remove blue rings

    // Give React a moment to clear the UI handles
    setTimeout(() => {
      toPng(ToCaptureRef.current!, {
        cacheBust: true,
        backgroundColor: '#ffffff',
        pixelRatio: 2,
      })
        .then((dataUrl) => {
          const link = document.createElement('a');
          link.download = `village-design-${currentDesign.tshirtColor}-${currentView}.png`;
          link.href = dataUrl;
          link.click();
          setSelectedElementId(prevId); // Restore UI
        })
        .catch((err) => {
          console.error('Screenshot failed:', err);
          setSelectedElementId(prevId);
        });
    }, 150);
  };

  const currentElements = currentDesign.elements[currentView];
  const sortedElements = useMemo(
    () => [...currentElements].sort((a, b) => a.zIndex - b.zIndex),
    [currentElements]
  );

  const currentTshirtImage = useMemo(() => {
    const colorInfo = tshirtColors.find((c) => c.name === currentDesign.tshirtColor);
    return colorInfo ? (currentView === 'front' ? colorInfo.frontImage : colorInfo.backImage) : '';
  }, [currentDesign.tshirtColor, currentView]);

  // --- INTERACTION LOGIC ---
  const dragRef = useRef<any>(null);
  const resizeRef = useRef<any>(null);
  const rotateRef = useRef<any>(null);

  const handleMouseDown = useCallback((e: React.MouseEvent, id: number) => {
    e.preventDefault();
    e.stopPropagation();
    const rect = designAreaRef.current?.getBoundingClientRect();
    const element = currentElements.find((el) => el.id === id);
    if (!rect || !element) return;

    dragRef.current = {
      id,
      startX: e.clientX,
      startY: e.clientY,
      initialX: element.x,
      initialY: element.y
    };
    setSelectedElementId(id);
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  }, [currentElements, setSelectedElementId]);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!dragRef.current || !designAreaRef.current) return;
    const rect = designAreaRef.current.getBoundingClientRect();
    const deltaX = ((e.clientX - dragRef.current.startX) / rect.width) * 100;
    const deltaY = ((e.clientY - dragRef.current.startY) / rect.height) * 100;

    updateElement(dragRef.current.id, {
      x: Math.max(0, Math.min(100, dragRef.current.initialX + deltaX)),
      y: Math.max(0, Math.min(100, dragRef.current.initialY + deltaY)),
    });
  }, [updateElement]);

  const handleMouseUp = useCallback(() => {
    document.removeEventListener('mousemove', handleMouseMove);
    document.removeEventListener('mouseup', handleMouseUp);
    dragRef.current = null;
  }, [handleMouseMove]);

  const handleResizeStart = useCallback((e: React.MouseEvent, anchor: string, id: number) => {
    e.preventDefault();
    e.stopPropagation();
    const el = currentElements.find((el) => el.id === id) as ImageElement;
    resizeRef.current = {
      anchor,
      startX: e.clientX,
      initialWidth: el.width,
      aspect: el.aspect || 1
    };
    document.addEventListener('mousemove', handleResizeMove);
    document.addEventListener('mouseup', handleResizeEnd);
  }, [currentElements]);

  const handleResizeMove = useCallback((e: MouseEvent) => {
    if (!resizeRef.current || !selectedElementId) return;
    const deltaX = e.clientX - resizeRef.current.startX;
    const multiplier = resizeRef.current.anchor.includes('e') ? 1 : -1;
    const newWidth = Math.max(20, resizeRef.current.initialWidth + (deltaX * multiplier));

    updateElement(selectedElementId, {
      width: newWidth,
      height: newWidth / resizeRef.current.aspect
    });
  }, [selectedElementId, updateElement]);

  const handleResizeEnd = useCallback(() => {
    document.removeEventListener('mousemove', handleResizeMove);
    document.removeEventListener('mouseup', handleResizeEnd);
    resizeRef.current = null;
  }, [handleResizeMove]);

  const handleRotateStart = useCallback((e: React.MouseEvent, id: number) => {
    e.preventDefault();
    e.stopPropagation();
    const rect = designAreaRef.current?.getBoundingClientRect();
    const el = currentElements.find((el) => el.id === id);
    if (!rect || !el) return;

    const centerX = rect.left + (rect.width * el.x / 100);
    const centerY = rect.top + (rect.height * el.y / 100);
    const startAngle = Math.atan2(e.clientY - centerY, e.clientX - centerX) * (180 / Math.PI);

    rotateRef.current = { startAngle, initialRotation: el.rotation || 0 };
    document.addEventListener('mousemove', handleRotateMove);
    document.addEventListener('mouseup', handleRotateEnd);
  }, [currentElements]);

  const handleRotateMove = useCallback((e: MouseEvent) => {
    if (!rotateRef.current || !selectedElementId || !designAreaRef.current) return;
    const rect = designAreaRef.current.getBoundingClientRect();
    const el = currentElements.find((el) => el.id === selectedElementId);
    if (!el) return;

    const centerX = rect.left + (rect.width * el.x / 100);
    const centerY = rect.top + (rect.height * el.y / 100);
    const currentAngle = Math.atan2(e.clientY - centerY, e.clientX - centerX) * (180 / Math.PI);

    updateElement(selectedElementId, {
      rotation: (rotateRef.current.initialRotation + (currentAngle - rotateRef.current.startAngle)) % 360
    });
  }, [selectedElementId, updateElement, currentElements]);

  const handleRotateEnd = useCallback(() => {
    document.removeEventListener('mousemove', handleRotateMove);
    document.removeEventListener('mouseup', handleRotateEnd);
    rotateRef.current = null;
  }, [handleRotateMove]);

  return (
    <div className="h-full w-full flex flex-col bg-gradient-to-br from-slate-50 to-slate-100 rounded-xl shadow-inner">
      <div className="p-4 border-b border-slate-200 bg-white/80 backdrop-blur-sm flex items-center justify-between flex-wrap gap-3">
        <Link href="/" className="text-lg font-bold text-slate-800 flex items-center">
          <ChevronLeft /> Home
        </Link>
        <div className="flex gap-2">
          <button
            onClick={handleAddToCart}
            disabled={isAddingToCart || currentElements.length === 0}
            className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-md hover:shadow-lg"
          >
            <ShoppingCart className="w-4 h-4" />
            {isAddingToCart ? 'Adding...' : 'Add to Cart'}
          </button>
          <button
            onClick={handleDownload}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-md hover:shadow-lg"
          >
            <Download className="w-4 h-4" />
            Save Image
          </button>
        </div>
      </div>

      <div className="flex-1 p-8 flex items-center justify-center overflow-hidden">
        <div
          ref={ToCaptureRef}
          className="relative w-full max-w-2xl aspect-square bg-white rounded-2xl shadow-2xl overflow-hidden"
        >
          {/* Layer 1: The T-Shirt */}
          <img
            src={currentTshirtImage}
            alt="T-Shirt"
            className="absolute inset-0 w-full h-full object-contain pointer-events-none select-none"
            draggable={false}
          />

          {/* Layer 2: Interactive Design Space */}
          <div
            ref={designAreaRef}
            className="absolute inset-0 cursor-crosshair"
            onClick={(e) => e.target === e.currentTarget && setSelectedElementId(null)}
          >
            {sortedElements.map((element) => (
              <div key={element.id}>
                <div
                  onMouseDown={(e) => handleMouseDown(e, element.id)}
                  style={{
                    position: 'absolute',
                    left: `${element.x}%`,
                    top: `${element.y}%`,
                    transform: `translate(-50%, -50%) rotate(${element.rotation || 0}deg)`,
                    cursor: 'move',
                    zIndex: element.zIndex,
                  }}
                >
                  {element.type === 'image' ? (
                    <img
                      src={(element as ImageElement).src}
                      alt="Design element"
                      style={{
                        width: `${(element as ImageElement).width}px`,
                        height: `${(element as ImageElement).height}px`,
                        objectFit: 'contain',
                        pointerEvents: 'none',
                        userSelect: 'none',
                      }}
                      draggable={false}
                    />
                  ) : (
                    <div
                      style={{
                        color: (element as TextElement).color,
                        fontSize: `${(element as TextElement).fontSize}px`,
                        fontFamily: (element as TextElement).fontFamily,
                        fontWeight: (element as TextElement).bold ? 'bold' : 'normal',
                        fontStyle: (element as TextElement).italic ? 'italic' : 'normal',
                        textAlign: (element as TextElement).align as any,
                        whiteSpace: 'nowrap',
                        pointerEvents: 'none',
                        userSelect: 'none',
                      }}
                    >
                      {(element as TextElement).text}
                    </div>
                  )}

                  {selectedElementId === element.id && (
                    <>
                      <div className="absolute inset-0 border-2 border-blue-500 rounded pointer-events-none" style={{ transform: 'translate(0, 0)' }} />

                      {element.type === 'image' && (
                        <div
                          onMouseDown={(e) => handleResizeStart(e, 'se', element.id)}
                          className="absolute -bottom-2 -right-2 w-4 h-4 bg-blue-500 border-2 border-white rounded-full cursor-se-resize hover:bg-blue-600 transition-colors z-10"
                        />
                      )}

                      <div
                        onMouseDown={(e) => handleRotateStart(e, element.id)}
                        className="absolute -top-8 left-1/2 -translate-x-1/2 cursor-pointer z-10"
                      >
                        <RotateCw className="w-5 h-5 text-blue-500 hover:text-blue-600" />
                      </div>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteElement(element.id);
                        }}
                        className="absolute -top-4 -right-4 bg-rose-500 text-white p-1.5 rounded-full shadow hover:bg-rose-600 transition-colors z-20"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}