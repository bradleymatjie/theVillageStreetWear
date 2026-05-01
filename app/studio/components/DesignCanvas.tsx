"use client";
import { useRef, useCallback, useMemo, useState } from 'react';
import { Trash2, RotateCw, Download, ShoppingCart, ChevronLeft } from 'lucide-react';
import useDesignStore from '@/app/lib/useDesignStore';
import { toPng, toJpeg } from 'html-to-image';
import Link from 'next/link';
import { v4 as uuidv4 } from 'uuid';
import { supabase } from '@/lib/supabaseClient';
import { useUser } from '@/app/lib/user';

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

// Helper function to convert data URL to Blob
const dataURLtoBlob = (dataUrl: string): Blob => {
  debugger;
  const arr = dataUrl.split(',');
  const mime = arr[0].match(/:(.*?);/)?.[1] || 'image/jpeg';
  const bstr = atob(arr[1]);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }
  return new Blob([u8arr], { type: mime });
};

export default function DesignCanvas() {
  const {
    currentDesign,
    currentView,
    selectedElementId,
    setSelectedElementId,
    updateElement,
    deleteElement,
    addToCart,
    setCurrentView,
  } = useDesignStore();
  const {user} = useUser();
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const ToCaptureRef = useRef<HTMLDivElement>(null);
  const designAreaRef = useRef<HTMLDivElement>(null);

  const hasElements = useMemo(
    () => currentDesign.elements.front.length > 0 || currentDesign.elements.back.length > 0,
    [currentDesign.elements]
  );

  // High quality PNG for downloads
  const highQualityOptions = {
    cacheBust: true,
    backgroundColor: '#ffffff',
    pixelRatio: 2,
  };

  // Compressed JPEG for cart previews (much smaller size to avoid localStorage quota issues)
  const cartPreviewOptions = {
    cacheBust: true,
    backgroundColor: '#ffffff',
    pixelRatio: 1,
    quality: 0.8,
  };

  const handleAddToCart = async () => {
    debugger;
    if (!ToCaptureRef.current) return;
    debugger;
    setIsAddingToCart(true);
    const originalView = currentView;
    const prevId = selectedElementId;
    setSelectedElementId(null); // Hide handles for clean previews

    let frontDataUrl: string | null = null;
    let backDataUrl: string | null = null;
    debugger;
    try {
      // Generate unique ID for this design
      const itemUuid = uuidv4();

      // Capture front as JPEG
      setCurrentView('front');
      await new Promise(resolve => setTimeout(resolve, 300));
      frontDataUrl = await toJpeg(ToCaptureRef.current!, cartPreviewOptions);

      // Capture back as JPEG
      setCurrentView('back');
      await new Promise(resolve => setTimeout(resolve, 300));
      backDataUrl = await toJpeg(ToCaptureRef.current!, cartPreviewOptions);

      // Convert data URLs to Blobs then Files
      const blobToFile = (blob: Blob, filename: string) => 
        new File([blob], filename, { type: blob.type });

      const frontBlob = dataURLtoBlob(frontDataUrl);
      const backBlob = dataURLtoBlob(backDataUrl);
      const frontFile = blobToFile(frontBlob, `${itemUuid}_front.jpg`);
      const backFile = blobToFile(backBlob, `${itemUuid}_back.jpg`);

      // Get user ID from store
      const userId = user?.id;
      debugger;
      if (!userId) throw new Error('Login required');

      // Upload to Supabase Storage
      const { data: frontData, error: frontError } = await supabase.storage
        .from('design-assets')
        .upload(`previews/${userId}/${itemUuid}_front.jpg`, frontFile, { upsert: true });

      if (frontError) throw frontError;

      const { data: backData, error: backError } = await supabase.storage
        .from('design-assets')
        .upload(`previews/${userId}/${itemUuid}_back.jpg`, backFile, { upsert: true });

      if (backError) throw backError;

      // Get public URLs
      const frontUrl = supabase.storage
        .from('design-assets')
        .getPublicUrl(frontData.path).data.publicUrl;

      const backUrl = supabase.storage
        .from('design-assets')
        .getPublicUrl(backData.path).data.publicUrl;

      // Add to cart with URLs instead of data URLs
      addToCart({
        name: `${currentDesign.tshirtColor.charAt(0).toUpperCase() + currentDesign.tshirtColor.slice(1)} T-Shirt`,
        front: frontUrl,
        back: backUrl,
        elements: currentDesign.elements,
        tshirtColor: currentDesign.tshirtColor,
        price: 250,
      }, user);
    } catch (err) {
      console.error('Failed to generate previews or add to cart:', err);
      alert('Failed to add to cart. Please make sure you are logged in and try again.');
    } finally {
      setCurrentView(originalView);
      await new Promise(resolve => setTimeout(resolve, 100));
      setSelectedElementId(prevId);
      setIsAddingToCart(false);
    }
  };

  const handleDownload = async () => {
    if (!ToCaptureRef.current) return;

    const prevId = selectedElementId;
    setSelectedElementId(null);

    setTimeout(async () => {
      try {
        const dataUrl = await toPng(ToCaptureRef.current!, highQualityOptions);
        const link = document.createElement('a');
        link.download = `village-design-${currentDesign.tshirtColor}-${currentView}.png`;
        link.href = dataUrl;
        link.click();
      } catch (err) {
        console.error('Screenshot failed:', err);
      } finally {
        setSelectedElementId(prevId);
      }
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

  // Helper function to get coordinates from touch or mouse event
  const getEventCoordinates = (e: MouseEvent | TouchEvent) => {
    if ('touches' in e) {
      const touch = e.touches[0];
      return { clientX: touch.clientX, clientY: touch.clientY };
    } else {
      return { clientX: e.clientX, clientY: e.clientY };
    }
  };

  const handleDragStart = useCallback((e: React.MouseEvent | React.TouchEvent, id: number) => {
    e.preventDefault();
    e.stopPropagation();
    const rect = designAreaRef.current?.getBoundingClientRect();
    const element = currentElements.find((el) => el.id === id);
    if (!rect || !element) return;

    const coords = 'touches' in e ? 
      { clientX: e.touches[0].clientX, clientY: e.touches[0].clientY } :
      { clientX: e.clientX, clientY: e.clientY };

    dragRef.current = {
      id,
      startX: coords.clientX,
      startY: coords.clientY,
      initialX: element.x,
      initialY: element.y,
    };
    setSelectedElementId(id);
    
    document.addEventListener('mousemove', handleDragMove);
    document.addEventListener('touchmove', handleDragMove, { passive: false });
    document.addEventListener('mouseup', handleDragEnd);
    document.addEventListener('touchend', handleDragEnd);
  }, [currentElements, setSelectedElementId]);

  const handleDragMove = useCallback((e: MouseEvent | TouchEvent) => {
    if (!dragRef.current || !designAreaRef.current) return;
    const rect = designAreaRef.current.getBoundingClientRect();
    const coords = getEventCoordinates(e);
    const deltaX = ((coords.clientX - dragRef.current.startX) / rect.width) * 100;
    const deltaY = ((coords.clientY - dragRef.current.startY) / rect.height) * 100;

    updateElement(dragRef.current.id, {
      x: Math.max(0, Math.min(100, dragRef.current.initialX + deltaX)),
      y: Math.max(0, Math.min(100, dragRef.current.initialY + deltaY)),
    });
  }, [updateElement]);

  const handleDragEnd = useCallback(() => {
    document.removeEventListener('mousemove', handleDragMove);
    document.removeEventListener('touchmove', handleDragMove);
    document.removeEventListener('mouseup', handleDragEnd);
    document.removeEventListener('touchend', handleDragEnd);
    dragRef.current = null;
  }, [handleDragMove]);

  const handleResizeStart = useCallback((e: React.MouseEvent | React.TouchEvent, anchor: string, id: number) => {
    e.preventDefault();
    e.stopPropagation();
    const el = currentElements.find((el) => el.id === id);
    if (el?.type !== 'image') return;
    
    const coords = 'touches' in e ? 
      { clientX: e.touches[0].clientX, clientY: e.touches[0].clientY } :
      { clientX: e.clientX, clientY: e.clientY };

    resizeRef.current = {
      anchor,
      startX: coords.clientX,
      initialWidth: el.width,
      aspect: el.aspect || 1,
    };
    document.addEventListener('mousemove', handleResizeMove);
    document.addEventListener('touchmove', handleResizeMove, { passive: false });
    document.addEventListener('mouseup', handleResizeEnd);
    document.addEventListener('touchend', handleResizeEnd);
  }, [currentElements]);

  const handleResizeMove = useCallback((e: MouseEvent | TouchEvent) => {
    if (!resizeRef.current || !selectedElementId) return;
    const coords = getEventCoordinates(e);
    const deltaX = coords.clientX - resizeRef.current.startX;
    const multiplier = resizeRef.current.anchor.includes('e') ? 1 : -1;
    const newWidth = Math.max(20, resizeRef.current.initialWidth + (deltaX * multiplier));

    updateElement(selectedElementId, {
      width: newWidth,
      height: newWidth / resizeRef.current.aspect,
    });
  }, [selectedElementId, updateElement]);

  const handleResizeEnd = useCallback(() => {
    document.removeEventListener('mousemove', handleResizeMove);
    document.removeEventListener('touchmove', handleResizeMove);
    document.removeEventListener('mouseup', handleResizeEnd);
    document.removeEventListener('touchend', handleResizeEnd);
    resizeRef.current = null;
  }, [handleResizeMove]);

  const handleRotateStart = useCallback((e: React.MouseEvent | React.TouchEvent, id: number) => {
    e.preventDefault();
    e.stopPropagation();
    const rect = designAreaRef.current?.getBoundingClientRect();
    const el = currentElements.find((el) => el.id === id);
    if (!rect || !el) return;

    const coords = 'touches' in e ? 
      { clientX: e.touches[0].clientX, clientY: e.touches[0].clientY } :
      { clientX: e.clientX, clientY: e.clientY };

    const centerX = rect.left + (rect.width * el.x / 100);
    const centerY = rect.top + (rect.height * el.y / 100);
    const startAngle = Math.atan2(coords.clientY - centerY, coords.clientX - centerX) * (180 / Math.PI);

    rotateRef.current = { startAngle, initialRotation: el.rotation || 0 };
    document.addEventListener('mousemove', handleRotateMove);
    document.addEventListener('touchmove', handleRotateMove, { passive: false });
    document.addEventListener('mouseup', handleRotateEnd);
    document.addEventListener('touchend', handleRotateEnd);
  }, [currentElements]);

  const handleRotateMove = useCallback((e: MouseEvent | TouchEvent) => {
    if (!rotateRef.current || !selectedElementId || !designAreaRef.current) return;
    const rect = designAreaRef.current.getBoundingClientRect();
    const el = currentElements.find((el) => el.id === selectedElementId);
    if (!el) return;

    const coords = getEventCoordinates(e);
    const centerX = rect.left + (rect.width * el.x / 100);
    const centerY = rect.top + (rect.height * el.y / 100);
    const currentAngle = Math.atan2(coords.clientY - centerY, coords.clientX - centerX) * (180 / Math.PI);

    updateElement(selectedElementId, {
      rotation: (rotateRef.current.initialRotation + (currentAngle - rotateRef.current.startAngle)) % 360,
    });
  }, [selectedElementId, updateElement, currentElements]);

  const handleRotateEnd = useCallback(() => {
    document.removeEventListener('mousemove', handleRotateMove);
    document.removeEventListener('touchmove', handleRotateMove);
    document.removeEventListener('mouseup', handleRotateEnd);
    document.removeEventListener('touchend', handleRotateEnd);
    rotateRef.current = null;
  }, [handleRotateMove]);

  const handleTouchEndOnDesignArea = useCallback((e: React.TouchEvent) => {
    if (e.target === e.currentTarget) {
      setSelectedElementId(null);
    }
  }, [setSelectedElementId]);

  return (
    <div className="h-full w-full flex flex-col bg-gradient-to-br from-slate-50 to-slate-100 rounded-xl shadow-inner">
      <div className="p-4 border-b border-slate-200 bg-white/80 backdrop-blur-sm flex items-center justify-between flex-wrap gap-3">
        <Link href="/" className="text-lg font-bold text-slate-800 flex items-center gap-2">
          <ChevronLeft className="w-5 h-5" /> Home
        </Link>
        <div className="flex gap-3">
          <button
            onClick={handleAddToCart}
            disabled={isAddingToCart || !hasElements}
            className="flex items-center gap-2 px-5 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md hover:shadow-lg font-medium"
          >
            <ShoppingCart className="w-5 h-5" />
            {isAddingToCart ? 'Adding...' : 'Add to Cart'}
          </button>
          <button
            onClick={handleDownload}
            className="flex items-center gap-2 px-5 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all shadow-md hover:shadow-lg font-medium"
          >
            <Download className="w-5 h-5" />
            Save Current View
          </button>
        </div>
      </div>

      <div className="flex-1 p-8 flex items-center justify-center overflow-hidden">
        <div
          ref={ToCaptureRef}
          className="relative w-full max-w-2xl aspect-square bg-white rounded-2xl shadow-2xl overflow-hidden"
        >
          <img
            src={currentTshirtImage}
            alt="T-Shirt"
            className="absolute inset-0 w-full h-full object-contain pointer-events-none select-none"
            draggable={false}
          />

          <div
            ref={designAreaRef}
            className="absolute inset-0 cursor-crosshair"
            onClick={(e) => e.target === e.currentTarget && setSelectedElementId(null)}
            onTouchEnd={handleTouchEndOnDesignArea}
          >
            {sortedElements.map((element) => (
              <div key={element.id}>
                <div
                  onMouseDown={(e) => handleDragStart(e, element.id)}
                  onTouchStart={(e) => handleDragStart(e, element.id)}
                  style={{
                    position: 'absolute',
                    left: `${element.x}%`,
                    top: `${element.y}%`,
                    transform: `translate(-50%, -50%) rotate(${element.rotation || 0}deg)`,
                    cursor: 'move',
                    zIndex: element.zIndex,
                    touchAction: 'none', // Prevent browser default touch actions
                  }}
                >
                  {element.type === 'image' ? (
                    <img
                      src={element.src}
                      alt="Design element"
                      style={{
                        width: `${element.width}px`,
                        height: `${element.height}px`,
                        objectFit: 'contain',
                        pointerEvents: 'none',
                        userSelect: 'none',
                      }}
                      draggable={false}
                    />
                  ) : (
                    <div
                      style={{
                        color: element.color,
                        fontSize: `${element.fontSize}px`,
                        fontFamily: element.fontFamily,
                        fontWeight: element.bold ? 'bold' : 'normal',
                        fontStyle: element.italic ? 'italic' : 'normal',
                        textAlign: element.align as any,
                        whiteSpace: 'nowrap',
                        pointerEvents: 'none',
                        userSelect: 'none',
                      }}
                    >
                      {element.text}
                    </div>
                  )}

                  {selectedElementId === element.id && (
                    <>
                      <div
                        className="absolute inset-0 border-2 border-blue-500 rounded pointer-events-none"
                        style={{ transform: 'translate(0, 0)' }}
                      />

                      {element.type === 'image' && (
                        <div
                          onMouseDown={(e) => handleResizeStart(e, 'se', element.id)}
                          onTouchStart={(e) => handleResizeStart(e, 'se', element.id)}
                          className="absolute -bottom-3 -right-3 w-6 h-6 bg-blue-500 border-3 border-white rounded-full cursor-se-resize hover:bg-blue-600 transition-colors shadow-lg z-10"
                          style={{ touchAction: 'none' }}
                        />
                      )}

                      <div
                        onMouseDown={(e) => handleRotateStart(e, element.id)}
                        onTouchStart={(e) => handleRotateStart(e, element.id)}
                        className="absolute -top-10 left-1/2 -translate-x-1/2 cursor-grab active:cursor-grabbing z-10"
                        style={{ touchAction: 'none' }}
                      >
                        <RotateCw className="w-6 h-6 text-blue-500 hover:text-blue-600 drop-shadow-md" />
                      </div>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteElement(element.id);
                        }}
                        onTouchEnd={(e) => {
                          e.stopPropagation();
                          deleteElement(element.id);
                        }}
                        className="absolute -top-5 -right-5 bg-rose-500 text-white p-2 rounded-full shadow-lg hover:bg-rose-600 transition-colors z-20"
                        style={{ touchAction: 'none' }}
                      >
                        <Trash2 className="w-4 h-4" />
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