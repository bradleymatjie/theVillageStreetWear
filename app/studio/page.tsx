"use client"
import { useState, useRef, useCallback, useMemo, useEffect } from 'react';
import { Upload, Type, Palette, Download, RotateCcw, Trash2, AlignLeft, AlignCenter, AlignRight, Bold, Italic, Shirt, GripVertical } from 'lucide-react';
import useDesignStore from '../lib/useDesignStore';

interface BaseElement {
  id: number;
  zIndex: number;
  type: 'text' | 'image';
}

interface TextElement extends BaseElement {
  type: 'text';
  text: string;
  color: string;
  fontSize: number;
  fontFamily: string;
  x: number;
  y: number;
  align: string;
  bold: boolean;
  italic: boolean;
}

interface ImageElement extends BaseElement {
  type: 'image';
  src: string;
  x: number;
  y: number;
  width: number;
  height: number;
  aspect: number;
}

type Element = TextElement | ImageElement;

interface TShirtColor {
  name: string;
  hex: string;
  frontImage: string;
  backImage: string;
}

interface SavedDesign {
  id: number;
  name: string;
  elements: { front: Element[]; back: Element[] };
  tshirtColor: string;
  createdAt: string;
}

interface CartItem {
  id: number;
  name: string;
  elements: { front: Element[]; back: Element[] };
  tshirtColor: string;
  price: number;
  addedAt: string;
}

interface DesignStore {
  savedDesigns: SavedDesign[];
  cart: CartItem[];
  addDesign: (design: SavedDesign) => void;
  removeDesign: (id: number) => void;
  addToCart: (item: CartItem) => void;
  removeFromCart: (id: number) => void;
  clearCart: () => void;
}


export default function DesignStudio() {
  const { savedDesigns, cart, addDesign, removeDesign, addToCart, removeFromCart } = useDesignStore();
  
  const [selectedTool, setSelectedTool] = useState<string>('upload');
  const [view, setView] = useState<'front' | 'back'>('front');
  const [elements, setElements] = useState<{ front: Element[]; back: Element[] }>({
    front: [],
    back: [],
  });
  const [selectedElement, setSelectedElement] = useState<number | null>(null);
  const [draggedElementId, setDraggedElementId] = useState<number | null>(null);
  const [tshirtColor, setTshirtColor] = useState<string>('white');
  const [currentText, setCurrentText] = useState<string>('Your Text Here');
  const [textColor, setTextColor] = useState<string>('#000000');
  const [fontSize, setFontSize] = useState<number>(24);
  const [fontFamily, setFontFamily] = useState<string>('Arial');
  const [textAlign, setTextAlign] = useState<string>('center');
  const [isBold, setIsBold] = useState<boolean>(false);
  const [isItalic, setIsItalic] = useState<boolean>(false);
  const [imageSize, setImageSize] = useState<number>(150);
  const [isResizing, setIsResizing] = useState<boolean>(false);
  const [resizeAnchor, setResizeAnchor] = useState<'nw' | 'ne' | 'sw' | 'se' | null>(null);
  const [resizeStart, setResizeStart] = useState<{ startX: number; startY: number; width: number; height: number; elementX: number; elementY: number; } | null>(null);
  const [showSaveModal, setShowSaveModal] = useState<boolean>(false);
  const [showCartModal, setShowCartModal] = useState<boolean>(false);
  const [designName, setDesignName] = useState<string>('');
  const [saveMessage, setSaveMessage] = useState<string>('');
  const [cartMessage, setCartMessage] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLDivElement>(null);
  const designAreaRef = useRef<HTMLDivElement>(null);
  const layersRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef<{ id: number; type: 'text' | 'image'; startX: number; startY: number; initialX: number; initialY: number } | null>(null);

  const tshirtColors: TShirtColor[] = [
    { name: 'white', hex: '#FFFFFF', frontImage: '/assets/white_front.png', backImage: '/assets/white_back.png' },
    { name: 'black', hex: '#000000', frontImage: '/assets/black_front.png', backImage: '/assets/black_back.png' },
    { name: 'blue', hex: '#0000FF', frontImage: '/assets/blue_front.png', backImage: '/assets/blue_back.png' },
    { name: 'cyan', hex: '#00FFFF', frontImage: '/assets/cyan_front.png', backImage: '/assets/cyan_back.png' },
    { name: 'gray', hex: '#808080', frontImage: '/assets/gray_front.png', backImage: '/assets/gray_back.png' },
    { name: 'green', hex: '#008000', frontImage: '/assets/green_front.png', backImage: '/assets/green_back.png' },
    { name: 'red', hex: '#FF0000', frontImage: '/assets/red_front.png', backImage: '/assets/red_back.png' },
  ];

  const textColors = [
    '#FFFFFF', '#000000', '#FF0000', '#00FF00', '#0000FF',
    '#FFFF00', '#FF00FF', '#00FFFF', '#FFA500', '#800080'
  ];

  const fonts = [
    'Arial', 'Helvetica', 'Times New Roman', 'Courier New',
    'Georgia', 'Verdana', 'Impact', 'Comic Sans MS'
  ];

  const currentTshirtColor = useMemo(() => {
    return tshirtColors.find(c => c.name === tshirtColor);
  }, [tshirtColor]);

  const currentTshirtImage = useMemo(() => {
    if (!currentTshirtColor) return '';
    return view === 'front' ? currentTshirtColor.frontImage : currentTshirtColor.backImage;
  }, [currentTshirtColor, view]);

  const currentElements = useMemo(() => elements[view], [elements, view]);

  const sortedElements = useMemo(() => [...currentElements].sort((a, b) => b.zIndex - a.zIndex), [currentElements]);

  const getSelectedElementType = () => {
    if (selectedElement === null) return null;
    const el = currentElements.find(el => el.id === selectedElement);
    if (!el) return null;
    return el.type;
  };

  const elementType = getSelectedElementType();

  const selectedElementData = useMemo(() => {
    return currentElements.find(el => el.id === selectedElement);
  }, [selectedElement, currentElements]);

  useEffect(() => {
    if (elementType === 'text' && selectedElementData) {
      const el = selectedElementData as TextElement;
      setCurrentText(el.text);
      setTextColor(el.color);
      setFontSize(el.fontSize);
      setFontFamily(el.fontFamily);
      setTextAlign(el.align);
      setIsBold(el.bold);
      setIsItalic(el.italic);
    }
  }, [selectedElement, elementType, selectedElementData]);

  useEffect(() => {
    if (elementType === 'image' && selectedElementData) {
      const el = selectedElementData as ImageElement;
      setImageSize(el.width);
    }
  }, [selectedElement, elementType, selectedElementData]);

  useEffect(() => {
    setSelectedElement(null);
  }, [view]);

  const saveDesign = () => {
    if (!designName.trim()) {
      setSaveMessage('Please enter a design name');
      return;
    }

    const design: SavedDesign = {
      id: Date.now(),
      name: designName,
      elements,
      tshirtColor,
      createdAt: new Date().toISOString(),
    };

    addDesign(design);
    setSaveMessage('Design saved successfully!');
    setDesignName('');
    setTimeout(() => {
      setShowSaveModal(false);
      setSaveMessage('');
    }, 1500);
  };

  const handleAddToCart = () => {
    const cartItem: CartItem = {
      id: Date.now(),
      name: `Custom T-Shirt Design`,
      elements,
      tshirtColor,
      price: 29.99,
      addedAt: new Date().toISOString(),
    };

    addToCart(cartItem);
    setCartMessage('Added to cart!');
    setTimeout(() => {
      setCartMessage('');
    }, 2000);
  };

  const loadDesign = (design: SavedDesign) => {
    setElements(design.elements);
    setTshirtColor(design.tshirtColor);
    setShowSaveModal(false);
  };

  const handleLayerDragStart = useCallback((e: React.DragEvent, id: number) => {
    setDraggedElementId(id);
    e.dataTransfer.effectAllowed = 'move';
  }, []);

  const handleLayerDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  }, []);

  const handleLayerDrop = useCallback((e: React.DragEvent, targetId: number) => {
    e.preventDefault();
    if (draggedElementId === null || draggedElementId === targetId) return;

    setElements(prev => {
      const currentViewElements = prev[view];
      const draggedEl = currentViewElements.find(el => el.id === draggedElementId);
      const targetEl = currentViewElements.find(el => el.id === targetId);
      if (!draggedEl || !targetEl) return prev;

      return {
        ...prev,
        [view]: currentViewElements.map(el => {
          if (el.id === draggedElementId) {
            return { ...el, zIndex: targetEl.zIndex };
          }
          if (el.id === targetId) {
            return { ...el, zIndex: draggedEl.zIndex };
          }
          return el;
        })
      };
    });
    setDraggedElementId(null);
  }, [draggedElementId, view]);

  const handleMouseDown = useCallback((e: React.MouseEvent, id: number, type: 'text' | 'image') => {
    e.preventDefault();
    e.stopPropagation();
    const rect = designAreaRef.current?.getBoundingClientRect();
    if (!rect) return;
    const startX = e.clientX - rect.left;
    const startY = e.clientY - rect.top;
    const element = currentElements.find(el => el.id === id);
    if (!element) return;
    dragRef.current = {
      id,
      type,
      startX,
      startY,
      initialX: element.x,
      initialY: element.y,
    };
    setSelectedElement(id);
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  }, [currentElements]);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!dragRef.current || !designAreaRef.current) return;
    const rect = designAreaRef.current.getBoundingClientRect();
    const currentX = e.clientX - rect.left;
    const currentY = e.clientY - rect.top;
    const deltaX = (currentX - dragRef.current.startX) / rect.width * 100;
    const deltaY = (currentY - dragRef.current.startY) / rect.height * 100;
    const newX = dragRef.current.initialX + deltaX;
    const newY = dragRef.current.initialY + deltaY;
    setElements(prev => ({
      ...prev,
      [view]: prev[view].map(el =>
        el.id === dragRef.current?.id
          ? { ...el, x: Math.max(0, Math.min(100, newX)), y: Math.max(0, Math.min(100, newY)) }
          : el
      )
    }));
  }, [view]);

  const handleMouseUp = useCallback(() => {
    document.removeEventListener('mousemove', handleMouseMove);
    document.removeEventListener('mouseup', handleMouseUp);
    dragRef.current = null;
  }, [handleMouseMove]);

  const handleResizeStart = useCallback((e: React.MouseEvent, anchor: 'nw' | 'ne' | 'sw' | 'se') => {
    e.preventDefault();
    e.stopPropagation();
    const rect = designAreaRef.current?.getBoundingClientRect();
    if (!rect || !selectedElement) return;
    const startX = e.clientX - rect.left;
    const startY = e.clientY - rect.top;
    const el = currentElements.find(el => el.id === selectedElement) as ImageElement;
    if (!el) return;
    setResizeStart({
      startX,
      startY,
      width: el.width,
      height: el.height,
      elementX: el.x,
      elementY: el.y,
    });
    setResizeAnchor(anchor);
    setIsResizing(true);
    document.addEventListener('mousemove', handleResizeMove);
    document.addEventListener('mouseup', handleResizeEnd);
  }, [selectedElement, currentElements]);

  const handleResizeMove = useCallback((e: MouseEvent) => {
    if (!isResizing || !resizeAnchor || !resizeStart || !designAreaRef.current || !selectedElement) return;
    const rect = designAreaRef.current.getBoundingClientRect();
    const currentX = e.clientX - rect.left;
    const currentY = e.clientY - rect.top;
    const deltaX = currentX - resizeStart.startX;
    const deltaY = currentY - resizeStart.startY;
    const el = currentElements.find(el => el.id === selectedElement) as ImageElement;
    if (!el) return;
    const designWidth = rect.width;
    const designHeight = rect.height;
    let newWidth = resizeStart.width + deltaX * (resizeAnchor.includes('e') ? 1 : -1);
    let newHeight = newWidth / el.aspect;
    newWidth = Math.max(20, Math.min(newWidth, designWidth * 2));
    newHeight = Math.max(20, Math.min(newHeight, designHeight * 2));
    let newX = resizeStart.elementX;
    let newY = resizeStart.elementY;
    if (resizeAnchor.includes('w')) newX += (deltaX / designWidth * 100);
    if (resizeAnchor.includes('n')) newY += (deltaY / designHeight * 100);
    newX = Math.max(0, Math.min(100, newX));
    newY = Math.max(0, Math.min(100, newY));
    setElements(prev => ({
      ...prev,
      [view]: prev[view].map(el =>
        el.id === selectedElement ? { ...el, x: newX, y: newY, width: newWidth, height: newHeight } : el
      )
    }));
  }, [isResizing, resizeAnchor, resizeStart, selectedElement, currentElements, view]);

  const handleResizeEnd = useCallback(() => {
    setIsResizing(false);
    setResizeAnchor(null);
    setResizeStart(null);
    document.removeEventListener('mousemove', handleResizeMove);
    document.removeEventListener('mouseup', handleResizeEnd);
  }, []);

  const handleTouchStart = useCallback((e: React.TouchEvent, id: number, type: 'text' | 'image') => {
    const touch = e.touches[0];
    const mouseEvent = new MouseEvent('mousedown', {
      clientX: touch.clientX,
      clientY: touch.clientY,
    });
    const target = e.currentTarget;
    target.dispatchEvent(mouseEvent);
  }, []);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    e.preventDefault();
    const touch = e.touches[0];
    const mouseEvent = new MouseEvent('mousemove', {
      clientX: touch.clientX,
      clientY: touch.clientY,
    });
    document.dispatchEvent(mouseEvent);
  }, []);

  const handleTouchEnd = useCallback(() => {
    const mouseEvent = new MouseEvent('mouseup', {});
    document.dispatchEvent(mouseEvent);
  }, []);

  const addTextElement = () => {
    const newElement: TextElement = {
      id: Date.now(),
      type: 'text',
      zIndex: currentElements.length,
      text: currentText,
      color: textColor,
      fontSize: fontSize,
      fontFamily: fontFamily,
      x: 50,
      y: 50,
      align: textAlign,
      bold: isBold,
      italic: isItalic
    };
    setElements(prev => ({
      ...prev,
      [view]: [...prev[view], newElement]
    }));
    setSelectedElement(newElement.id);
  };

  const updateSelectedText = (updates: Partial<TextElement>) => {
    if (selectedElement === null) return;
    setElements(prev => ({
      ...prev,
      [view]: prev[view].map(el =>
        el.id === selectedElement && el.type === 'text' ? { ...el, ...updates } : el
      )
    }));
  };

  const updateSelectedImage = (updates: Partial<ImageElement>) => {
    if (selectedElement === null) return;
    setElements(prev => ({
      ...prev,
      [view]: prev[view].map(el =>
        el.id === selectedElement && el.type === 'image' ? { ...el, ...updates } : el
      )
    }));
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        alert('File size must be less than 10MB');
        return;
      }
      if (!file.type.startsWith('image/')) {
        alert('Please upload an image file (PNG, JPG, etc.)');
        return;
      }
      const reader = new FileReader();
      reader.onload = (e) => {
        const readerResult = e.target?.result as string;
        const img = new Image();
        img.onload = () => {
          const aspect = img.naturalWidth / img.naturalHeight;
          const initialWidth = 150;
          const initialHeight = initialWidth / aspect;
          const newImage: ImageElement = {
            id: Date.now(),
            type: 'image',
            zIndex: currentElements.length,
            src: readerResult,
            x: 50,
            y: 50,
            width: initialWidth,
            height: initialHeight,
            aspect,
          };
          setElements(prev => ({
            ...prev,
            [view]: [...prev[view], newImage]
          }));
          setSelectedElement(newImage.id);
        };
        img.src = readerResult;
      };
      reader.readAsDataURL(file);
    }
  };

  const deleteElement = (id: number) => {
    setElements(prev => ({
      ...prev,
      [view]: prev[view].filter(el => el.id !== id)
    }));
    if (selectedElement === id) setSelectedElement(null);
  };

  const clearAll = () => {
    setElements({ front: [], back: [] });
    setSelectedElement(null);
  };

  const downloadDesign = async () => {
    if (!designAreaRef.current) return;
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    canvas.width = 800;
    canvas.height = 600;
    const tshirtImg = new Image();
    tshirtImg.crossOrigin = 'anonymous';
    tshirtImg.src = currentTshirtImage;
    try {
      await new Promise((resolve, reject) => {
        tshirtImg.onload = () => resolve(true);
        tshirtImg.onerror = reject;
      });
    } catch (error) {
      console.error('Failed to load t-shirt image');
      ctx.fillStyle = currentTshirtColor?.hex || '#FFFFFF';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
    if (tshirtImg.complete) {
      const tshirtScale = Math.min(canvas.width / tshirtImg.naturalWidth, canvas.height / tshirtImg.naturalHeight) * 0.8;
      const tshirtWidth = tshirtImg.naturalWidth * tshirtScale;
      const tshirtHeight = tshirtImg.naturalHeight * tshirtScale;
      const tshirtX = (canvas.width - tshirtWidth) / 2;
      const tshirtY = (canvas.height - tshirtHeight) / 2;
      ctx.drawImage(tshirtImg, tshirtX, tshirtY, tshirtWidth, tshirtHeight);
      const designLeft = tshirtX + tshirtWidth * 0.15;
      const designTop = tshirtY + tshirtHeight * 0.25;
      const designWidth = tshirtWidth * 0.7;
      const designHeight = tshirtHeight * 0.45;
      for (const el of sortedElements) {
        if (el.type === 'image') {
          const designImg = new Image();
          designImg.src = el.src;
          await new Promise((resolve, reject) => {
            designImg.onload = () => resolve(true);
            designImg.onerror = reject;
          });
          const centerX = designLeft + (designWidth * (el.x / 100));
          const centerY = designTop + (designHeight * (el.y / 100));
          const scaledWidth = el.width * 2;
          const scaledHeight = el.height * 2;
          const imgX = centerX - (scaledWidth / 2);
          const imgY = centerY - (scaledHeight / 2);
          ctx.drawImage(designImg, imgX, imgY, scaledWidth, scaledHeight);
        } else {
          const textEl = el as TextElement;
          const fontWeight = textEl.bold ? 'bold' : 'normal';
          const fontStyle = textEl.italic ? 'italic' : 'normal';
          ctx.font = `${fontStyle} ${fontWeight} ${textEl.fontSize * 2}px "${textEl.fontFamily}"`;
          ctx.fillStyle = textEl.color;
          ctx.textAlign = (textEl.align as CanvasTextAlign) || 'center';
          const textX = designLeft + (designWidth * (textEl.x / 100));
          const textY = designTop + (designHeight * (textEl.y / 100));
          ctx.fillText(textEl.text, textX, textY);
        }
      }
    } else {
      ctx.fillStyle = currentTshirtColor?.hex || '#FFFFFF';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      const designLeft = canvas.width * 0.15;
      const designTop = canvas.height * 0.25;
      const designWidth = canvas.width * 0.7;
      const designHeight = canvas.height * 0.45;
      for (const el of sortedElements) {
        if (el.type === 'image') {
          const designImg = new Image();
          designImg.src = el.src;
          await new Promise((resolve, reject) => {
            designImg.onload = () => resolve(true);
            designImg.onerror = reject;
          });
          const centerX = designLeft + (designWidth * (el.x / 100));
          const centerY = designTop + (designHeight * (el.y / 100));
          const scaledWidth = el.width * 2;
          const scaledHeight = el.height * 2;
          const imgX = centerX - (scaledWidth / 2);
          const imgY = centerY - (scaledHeight / 2);
          ctx.drawImage(designImg, imgX, imgY, scaledWidth, scaledHeight);
        } else {
          const textEl = el as TextElement;
          const fontWeight = textEl.bold ? 'bold' : 'normal';
          const fontStyle = textEl.italic ? 'italic' : 'normal';
          ctx.font = `${fontStyle} ${fontWeight} ${textEl.fontSize * 2}px "${textEl.fontFamily}"`;
          ctx.fillStyle = textEl.color;
          ctx.textAlign = (textEl.align as CanvasTextAlign) || 'center';
          const textX = designLeft + (designWidth * (textEl.x / 100));
          const textY = designTop + (designHeight * (textEl.y / 100));
          ctx.fillText(textEl.text, textX, textY);
        }
      }
    }
    ctx.textAlign = 'start';
    const link = document.createElement('a');
    link.download = `custom-design-${view}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  };

  const handleTextChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const newText = e.target.value;
    setCurrentText(newText);
    if (selectedElement && elementType === 'text') {
      updateSelectedText({ text: newText });
    }
  }, [selectedElement, elementType]);

  const handleFontSizeChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const newSize = Number(e.target.value);
    setFontSize(newSize);
    if (selectedElement && elementType === 'text') {
      updateSelectedText({ fontSize: newSize });
    }
  }, [selectedElement, elementType]);

  const handleFontFamilyChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    const newFamily = e.target.value;
    setFontFamily(newFamily);
    if (selectedElement && elementType === 'text') {
      updateSelectedText({ fontFamily: newFamily });
    }
  }, [selectedElement, elementType]);

  const handleTextColorChange = useCallback((newColor: string) => {
    setTextColor(newColor);
    if (selectedElement && elementType === 'text') {
      updateSelectedText({ color: newColor });
    }
  }, [selectedElement, elementType]);

  const handleBoldToggle = useCallback(() => {
    const newBold = !isBold;
    setIsBold(newBold);
    if (selectedElement && elementType === 'text') {
      updateSelectedText({ bold: newBold });
    }
  }, [isBold, selectedElement, elementType]);

  const handleItalicToggle = useCallback(() => {
    const newItalic = !isItalic;
    setIsItalic(newItalic);
    if (selectedElement && elementType === 'text') {
      updateSelectedText({ italic: newItalic });
    }
  }, [isItalic, selectedElement, elementType]);

  const handleAlignChange = useCallback((newAlign: string) => {
    setTextAlign(newAlign);
    if (selectedElement && elementType === 'text') {
      updateSelectedText({ align: newAlign });
    }
  }, [selectedElement, elementType]);

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      <header className="bg-black text-white px-4 sm:px-6 py-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-4">
            <a href="#" className="text-xl sm:text-2xl font-black">🎨</a>
            <span className="text-xs sm:text-sm text-gray-400">Design Studio</span>
          </div>
          <div className="flex gap-2 sm:gap-4">
            <button 
              onClick={() => setShowSaveModal(true)}
              className="px-3 sm:px-4 py-2 border border-white text-xs sm:text-sm font-bold hover:bg-white hover:text-black transition-colors"
            >
              SAVE
            </button>
            <button 
              onClick={handleAddToCart}
              className="px-3 sm:px-4 py-2 bg-white text-black text-xs sm:text-sm font-bold hover:bg-gray-200 transition-colors relative"
            >
              ORDER NOW
              {cart.length > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {cart.length}
                </span>
              )}
            </button>
            <button 
              onClick={() => setShowCartModal(true)}
              className="px-3 sm:px-4 py-2 border border-white text-xs sm:text-sm font-bold hover:bg-white hover:text-black transition-colors"
            >
              CART ({cart.length})
            </button>
          </div>
        </div>
      </header>
      <div className="flex-1 flex flex-col lg:flex-row">
        <div className="w-full lg:w-64 bg-white border-b lg:border-r border-gray-200 p-4 overflow-y-auto">
          <h2 className="text-lg font-black mb-4">DESIGN TOOLS</h2>
          <div className="space-y-2 mb-6">
            <button
              onClick={() => setSelectedTool('upload')}
              className={`w-full flex items-center gap-3 p-3 rounded-lg transition-colors ${
                selectedTool === 'upload' ? 'bg-black text-white' : 'bg-gray-100 hover:bg-gray-200'
              }`}
            >
              <Upload className="w-5 h-5" />
              <span className="font-bold text-sm">Upload Image</span>
            </button>
            <button
              onClick={() => setSelectedTool('text')}
              className={`w-full flex items-center gap-3 p-3 rounded-lg transition-colors ${
                selectedTool === 'text' ? 'bg-black text-white' : 'bg-gray-100 hover:bg-gray-200'
              }`}
            >
              <Type className="w-5 h-5" />
              <span className="font-bold text-sm">Add Text</span>
            </button>
            <button
              onClick={() => setSelectedTool('color')}
              className={`w-full flex items-center gap-3 p-3 rounded-lg transition-colors ${
                selectedTool === 'color' ? 'bg-black text-white' : 'bg-gray-100 hover:bg-gray-200'
              }`}
            >
              <Palette className="w-5 h-5" />
              <span className="font-bold text-sm">T-Shirt Color</span>
            </button>
          </div>
          <div className="border-t border-gray-200 pt-4">
            {selectedTool === 'upload' && (
              <div className="space-y-4">
                <h3 className="font-bold text-sm mb-2">UPLOAD IMAGE</h3>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-black transition-colors cursor-pointer"
                >
                  <Upload className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                  <p className="text-xs text-gray-600 font-bold">Click to upload</p>
                  <p className="text-xs text-gray-400 mt-1">PNG, JPG up to 10MB</p>
                </div>
                {currentElements.filter(el => el.type === 'image').length > 0 && (
                  <div className="mt-4">
                    <h4 className="text-xs font-bold mb-2">Uploaded Images ({view}):</h4>
                    <div className="space-y-2">
                      {currentElements.filter(el => el.type === 'image').map((img) => (
                        <div key={img.id} className="flex items-center gap-2 p-2 bg-gray-50 rounded">
                          <img src={img.src} alt="" className="w-10 h-10 object-cover rounded" />
                          <span className="text-xs flex-1">Image</span>
                          <button
                            onClick={() => deleteElement(img.id)}
                            className="text-red-500 hover:text-red-700"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {elementType === 'image' && selectedElement && (
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <h4 className="text-xs font-bold mb-2">Edit Selected Image</h4>
                    <div>
                      <label className="text-xs font-bold block mb-2">Width: {imageSize.toFixed(0)}px</label>
                      <input
                        type="range"
                        min="20"
                        max="300"
                        value={imageSize}
                        onChange={(e) => {
                          const el = selectedElementData as ImageElement;
                          if (el) {
                            const newWidth = Number(e.target.value);
                            const newHeight = newWidth / el.aspect;
                            setImageSize(newWidth);
                            updateSelectedImage({ width: newWidth, height: newHeight });
                          }
                        }}
                        className="w-full"
                      />
                    </div>
                  </div>
                )}
              </div>
            )}
            {selectedTool === 'text' && (
              <div className="space-y-4">
                <h3 className="font-bold text-sm mb-2">TEXT SETTINGS</h3>
                <div>
                  <label className="text-xs font-bold block mb-2">Text Content</label>
                  <input
                    type="text"
                    value={currentText}
                    onChange={handleTextChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
                    placeholder="Enter your text"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold block mb-2">Font</label>
                  <select
                    value={fontFamily}
                    onChange={handleFontFamilyChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
                  >
                    {fonts.map(font => (
                      <option key={font} value={font}>{font}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold block mb-2">Size: {fontSize}px</label>
                  <input
                    type="range"
                    min="12"
                    max="72"
                    value={fontSize}
                    onChange={handleFontSizeChange}
                    className="w-full"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold block mb-2">Text Color</label>
                  <div className="grid grid-cols-5 gap-2">
                    {textColors.map(color => (
                      <button
                        key={color}
                        onClick={() => handleTextColorChange(color)}
                        className={`w-8 h-8 rounded border-2 ${
                          textColor === color ? 'border-black' : 'border-gray-300'
                        }`}
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </div>
                </div>
                <div>
                  <label className="text-xs font-bold block mb-2">Text Style</label>
                  <div className="flex gap-2">
                    <button
                      onClick={handleBoldToggle}
                      className={`flex-1 p-2 rounded border ${
                        isBold ? 'bg-black text-white border-black' : 'border-gray-300'
                      }`}
                    >
                      <Bold className="w-4 h-4 mx-auto" />
                    </button>
                    <button
                      onClick={handleItalicToggle}
                      className={`flex-1 p-2 rounded border ${
                        isItalic ? 'bg-black text-white border-black' : 'border-gray-300'
                      }`}
                    >
                      <Italic className="w-4 h-4 mx-auto" />
                    </button>
                  </div>
                </div>
                <div>
                  <label className="text-xs font-bold block mb-2">Alignment</label>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleAlignChange('left')}
                      className={`flex-1 p-2 rounded border ${
                        textAlign === 'left' ? 'bg-black text-white border-black' : 'border-gray-300'
                      }`}
                    >
                      <AlignLeft className="w-4 h-4 mx-auto" />
                    </button>
                    <button
                      onClick={() => handleAlignChange('center')}
                      className={`flex-1 p-2 rounded border ${
                        textAlign === 'center' ? 'bg-black text-white border-black' : 'border-gray-300'
                      }`}
                    >
                      <AlignCenter className="w-4 h-4 mx-auto" />
                    </button>
                    <button
                      onClick={() => handleAlignChange('right')}
                      className={`flex-1 p-2 rounded border ${
                        textAlign === 'right' ? 'bg-black text-white border-black' : 'border-gray-300'
                      }`}
                    >
                      <AlignRight className="w-4 h-4 mx-auto" />
                    </button>
                  </div>
                </div>
                <button
                  onClick={addTextElement}
                  className="w-full bg-black text-white py-2 rounded font-bold text-sm hover:bg-gray-800 transition-colors"
                >
                  ADD TEXT TO DESIGN
                </button>
              </div>
            )}
            {selectedTool === 'color' && (
              <div className="space-y-4">
                <h3 className="font-bold text-sm mb-2">T-SHIRT COLOR</h3>
                <div className="grid grid-cols-3 gap-3">
                  {tshirtColors.map(color => (
                    <button
                      key={color.name}
                      onClick={() => setTshirtColor(color.name)}
                      className={`w-full aspect-square rounded-lg border-4 transition-all ${
                        tshirtColor === color.name ? 'border-black scale-110' : 'border-gray-300'
                      }`}
                      style={{ backgroundColor: color.hex }}
                      title={color.name}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
        <div className="flex-1 flex flex-col items-center justify-center p-4 sm:p-8 bg-gray-100 relative" ref={canvasRef}>
          <div className="bg-white rounded-lg shadow-xl p-4 sm:p-8 max-w-2xl w-full">
            <div className="flex justify-center mb-4">
              <button
                onClick={() => setView(view === 'front' ? 'back' : 'front')}
                className="flex items-center gap-2 px-4 py-2 bg-black text-white rounded font-bold hover:bg-gray-800 transition-colors"
              >
                <Shirt className="w-4 h-4" />
                {view === 'front' ? 'Switch to Back' : 'Switch to Front'}
              </button>
            </div>
            <div className="relative w-full aspect-[3/4] mx-auto" style={{ maxWidth: '400px' }}>
              <div
                className="absolute inset-0 rounded-lg shadow-inner z-0"
                style={{
                  backgroundImage: `url(${currentTshirtImage})`,
                  backgroundSize: 'contain',
                  backgroundPosition: 'center',
                  backgroundRepeat: 'no-repeat'
                }}
              >
                <div 
                  ref={designAreaRef}
                  className="h-full border-2 border-dashed border-gray-300 relative z-10"
                  onTouchMove={handleTouchMove}
                  onTouchEnd={handleTouchEnd}
                >
                  {sortedElements.map((element) => (
                    <div
                      key={`${element.type}-${element.id}`}
                      className={`absolute group ${selectedElement === element.id ? 'ring-2 ring-blue-500' : ''}`}
                      style={{
                        left: `${element.x}%`,
                        top: `${element.y}%`,
                        transform: 'translate(-50%, -50%)',
                        zIndex: element.zIndex,
                      }}
                      onMouseDown={(e) => handleMouseDown(e, element.id, element.type)}
                      onTouchStart={(e) => handleTouchStart(e, element.id, element.type)}
                    >
                      {element.type === 'image' ? (
                        <>
                          <img
                            src={element.src}
                            alt="Design element"
                            style={{
                              width: `${element.width}px`,
                              height: `${element.height}px`,
                              objectFit: 'contain',
                            }}
                            className="select-none pointer-events-none"
                            draggable={false}
                          />
                          {selectedElement === element.id && (
                            <>
                              <div
                                className="absolute top-0 left-0 w-3 h-3 bg-blue-500 rounded-full cursor-nwse-resize"
                                style={{ transform: 'translate(-50%, -50%)' }}
                                onMouseDown={(e) => handleResizeStart(e, 'nw')}
                              />
                              <div
                                className="absolute top-0 right-0 w-3 h-3 bg-blue-500 rounded-full cursor-nesw-resize"
                                style={{ transform: 'translate(50%, -50%)' }}
                                onMouseDown={(e) => handleResizeStart(e, 'ne')}
                              />
                              <div
                                className="absolute bottom-0 left-0 w-3 h-3 bg-blue-500 rounded-full cursor-nesw-resize"
                                style={{ transform: 'translate(-50%, 50%)' }}
                                onMouseDown={(e) => handleResizeStart(e, 'sw')}
                              />
                              <div
                                className="absolute bottom-0 right-0 w-3 h-3 bg-blue-500 rounded-full cursor-nwse-resize"
                                style={{ transform: 'translate(50%, 50%)' }}
                                onMouseDown={(e) => handleResizeStart(e, 'se')}
                              />
                            </>
                          )}
                        </>
                      ) : (
                        <div
                          style={{
                            color: element.color,
                            fontSize: `${element.fontSize}px`,
                            fontFamily: element.fontFamily,
                            textAlign: element.align as CanvasTextAlign,
                            fontWeight: element.bold ? 'bold' : 'normal',
                            fontStyle: element.italic ? 'italic' : 'normal',
                          }}
                          className="select-none whitespace-nowrap pointer-events-none"
                        >
                          {element.text}
                        </div>
                      )}
                      <button
                        onClick={(e) => { e.stopPropagation(); deleteElement(element.id); }}
                        className="absolute -top-3 -right-3 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="flex justify-center gap-2 mt-6">
              <button
                onClick={clearAll}
                className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded text-sm font-bold hover:bg-gray-100 transition-colors"
              >
                <RotateCcw className="w-4 h-4" />
                RESET
              </button>
              <button
                onClick={downloadDesign}
                className="flex items-center gap-2 px-4 py-2 bg-black text-white rounded text-sm font-bold hover:bg-gray-800 transition-colors"
              >
                <Download className="w-4 h-4" />
                DOWNLOAD {view.toUpperCase()}
              </button>
            </div>
          </div>
        </div>
        <div className="w-full lg:w-64 bg-white border-t lg:border-l border-gray-200 p-4 overflow-y-auto">
          <h2 className="text-lg font-black mb-4">LAYERS ({view.toUpperCase()})</h2>
          <p className="text-xs text-gray-500 mb-2">Drag to reorder (top = above)</p>
          {currentElements.length === 0 ? (
            <p className="text-sm text-gray-500 text-center py-8">No elements added yet</p>
          ) : (
            <div 
              ref={layersRef}
              className="space-y-2"
              onDragOver={handleLayerDragOver}
            >
              {sortedElements.map((element, index) => (
                <div
                  key={`layer-${element.id}`}
                  className={`p-3 rounded-lg border-2 cursor-pointer transition-colors draggable ${
                    selectedElement === element.id
                      ? 'border-black bg-gray-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  draggable
                  onDragStart={(e) => handleLayerDragStart(e, element.id)}
                  onDrop={(e) => handleLayerDrop(e, element.id)}
                  onClick={() => setSelectedElement(element.id)}
                >
                  <div className="flex justify-between items-start gap-2">
                    <div className="flex items-center gap-2 flex-1">
                      <GripVertical className="w-4 h-4 text-gray-400 flex-shrink-0" />
                      {element.type === 'image' ? (
                        <img src={element.src} alt="" className="w-8 h-8 object-cover rounded" />
                      ) : (
                        <Type className="w-8 h-8 text-gray-400" />
                      )}
                      <div>
                        <p className="text-xs font-bold text-gray-500">
                          {element.type === 'image' ? 'Image' : 'Text'} Layer {index + 1}
                        </p>
                        {element.type === 'text' ? (
                          <p className="text-sm font-bold truncate">{(element as TextElement).text}</p>
                        ) : (
                          <p className="text-xs text-gray-400">Uploaded Image</p>
                        )}
                      </div>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteElement(element.id);
                      }}
                      className="text-red-500 hover:text-red-700"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Save Modal */}
      {showSaveModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-black mb-4">Save Design</h2>
            {saveMessage && (
              <div className={`mb-4 p-3 rounded ${saveMessage.includes('successfully') ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                {saveMessage}
              </div>
            )}
            <div className="mb-4">
              <label className="text-sm font-bold block mb-2">Design Name</label>
              <input
                type="text"
                value={designName}
                onChange={(e) => setDesignName(e.target.value)}
                placeholder="Enter design name"
                className="w-full px-3 py-2 border border-gray-300 rounded"
              />
            </div>
            <div className="flex gap-2">
              <button
                onClick={saveDesign}
                className="flex-1 bg-black text-white py-2 rounded font-bold hover:bg-gray-800 transition-colors"
              >
                Save
              </button>
              <button
                onClick={() => {
                  setShowSaveModal(false);
                  setSaveMessage('');
                  setDesignName('');
                }}
                className="flex-1 border border-gray-300 py-2 rounded font-bold hover:bg-gray-100 transition-colors"
              >
                Cancel
              </button>
            </div>

            {savedDesigns.length > 0 && (
              <div className="mt-6 pt-6 border-t border-gray-200">
                <h3 className="text-sm font-black mb-3">Saved Designs ({savedDesigns.length})</h3>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {savedDesigns.map((design) => (
                    <div key={design.id} className="flex items-center justify-between p-3 border border-gray-200 rounded hover:bg-gray-50">
                      <div className="flex-1">
                        <p className="font-bold text-sm">{design.name}</p>
                        <p className="text-xs text-gray-500">
                          {new Date(design.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => loadDesign(design)}
                          className="px-3 py-1 bg-black text-white text-xs font-bold rounded hover:bg-gray-800"
                        >
                          Load
                        </button>
                        <button
                          onClick={() => removeDesign(design.id)}
                          className="px-3 py-1 bg-red-500 text-white text-xs font-bold rounded hover:bg-red-600"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Cart Modal */}
      {showCartModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-black mb-4">Shopping Cart</h2>
            {cart.length === 0 ? (
              <p className="text-center text-gray-500 py-8">Your cart is empty</p>
            ) : (
              <>
                <div className="space-y-4 mb-6">
                  {cart.map((item) => (
                    <div key={item.id} className="flex items-start gap-4 p-4 border border-gray-200 rounded">
                      <div className="w-20 h-20 bg-gray-100 rounded flex items-center justify-center flex-shrink-0">
                        <Shirt className="w-10 h-10 text-gray-400" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-bold">{item.name}</h3>
                        <p className="text-sm text-gray-600">Color: {item.tshirtColor}</p>
                        <p className="text-sm text-gray-600">
                          Elements: {item.elements.front.length + item.elements.back.length}
                        </p>
                        <p className="font-bold mt-2">${item.price.toFixed(2)}</p>
                      </div>
                      <button
                        onClick={() => removeFromCart(item.id)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  ))}
                </div>
                <div className="border-t border-gray-200 pt-4">
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-lg font-black">Total:</span>
                    <span className="text-2xl font-black">
                      ${cart.reduce((sum, item) => sum + item.price, 0).toFixed(2)}
                    </span>
                  </div>
                  <button className="w-full bg-black text-white py-3 rounded font-bold hover:bg-gray-800 transition-colors">
                    Proceed to Checkout
                  </button>
                </div>
              </>
            )}
            <button
              onClick={() => setShowCartModal(false)}
              className="w-full mt-4 border border-gray-300 py-2 rounded font-bold hover:bg-gray-100 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Cart Success Message */}
      {cartMessage && (
        <div className="fixed top-20 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 animate-fade-in">
          {cartMessage}
        </div>
      )}
    </div>
  );
}