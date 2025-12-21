"use client"
import { useState, useRef, useCallback, useMemo, useEffect } from 'react';
import { Upload, Type, Palette, Download, RotateCcw, Trash2, AlignLeft, AlignCenter, AlignRight, Bold, Italic, Shirt, GripVertical, RotateCw } from 'lucide-react';
import useDesignStore from '../lib/useDesignStore';
import DesignTools from './components/DesignTools';
import DesignCanvas from './components/DesignCanvas';
import DesignLayers from './components/DesignLayers';

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
  rotation: number;
}

interface ImageElement extends BaseElement {
  type: 'image';
  src: string;
  x: number;
  y: number;
  width: number;
  height: number;
  widthPct: number;
  heightPct: number;
  aspect: number;
  rotation: number;
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
  screenshot?: string;
  view?: 'front' | 'back';
  quantity?: number;
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
  const [rotation, setRotation] = useState<number>(0);
  const [isRotating, setIsRotating] = useState<boolean>(false);
  const [rotateStart, setRotateStart] = useState<{ startAngle: number; initialRotation: number } | null>(null);
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
      setRotation(el.rotation || 0);
    }
  }, [selectedElement, elementType, selectedElementData]);

  useEffect(() => {
    if (elementType === 'image' && selectedElementData) {
      const el = selectedElementData as ImageElement;
      setImageSize(el.width);
      setRotation(el.rotation || 0);
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


  const handleRotateMove = useCallback((e: MouseEvent) => {
    if (!isRotating || !rotateStart || !designAreaRef.current || !selectedElement) return;
    const rect = designAreaRef.current.getBoundingClientRect();
    const el = currentElements.find(el => el.id === selectedElement);
    if (!el) return;
    const centerX = rect.left + (rect.width * el.x / 100);
    const centerY = rect.top + (rect.height * el.y / 100);
    const currentAngle = Math.atan2(e.clientY - centerY, e.clientX - centerX) * (180 / Math.PI);
    const deltaAngle = currentAngle - rotateStart.startAngle;
    const newRotation = (rotateStart.initialRotation + deltaAngle) % 360;
    setRotation(newRotation);
    setElements(prev => ({
      ...prev,
      [view]: prev[view].map(el =>
        el.id === selectedElement ? { ...el, rotation: newRotation } : el
      )
    }));
  }, [isRotating, rotateStart, selectedElement, currentElements, view]);

  const handleRotateEnd = useCallback(() => {
    setIsRotating(false);
    setRotateStart(null);
    document.removeEventListener('mousemove', handleRotateMove);
    document.removeEventListener('mouseup', handleRotateEnd);
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
      italic: isItalic,
      rotation: 0
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
            widthPct: 15,
            heightPct: 15,
            aspect,
            rotation: 0,
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
        const centerX = designLeft + (designWidth * (el.x / 100));
        const centerY = designTop + (designHeight * (el.y / 100));
        const rotation = (el.type === 'image' ? (el as ImageElement).rotation : (el as TextElement).rotation) || 0;
        ctx.save();
        ctx.translate(centerX, centerY);
        ctx.rotate((rotation * Math.PI) / 180);
        if (el.type === 'image') {
          const designImg = new Image();
          designImg.src = el.src;
          await new Promise((resolve, reject) => {
            designImg.onload = () => resolve(true);
            designImg.onerror = reject;
          });
          const scaledWidth = el.width * 2;
          const scaledHeight = el.height * 2;
          ctx.drawImage(designImg, -scaledWidth / 2, -scaledHeight / 2, scaledWidth, scaledHeight);
        } else {
          const textEl = el as TextElement;
          const fontWeight = textEl.bold ? 'bold' : 'normal';
          const fontStyle = textEl.italic ? 'italic' : 'normal';
          ctx.font = `${fontStyle} ${fontWeight} ${textEl.fontSize * 2}px "${textEl.fontFamily}"`;
          ctx.fillStyle = textEl.color;
          ctx.textAlign = (textEl.align as CanvasTextAlign) || 'center';
          ctx.fillText(textEl.text, 0, 0);
        }
        ctx.restore();
      }
    } else {
      ctx.fillStyle = currentTshirtColor?.hex || '#FFFFFF';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      const designLeft = canvas.width * 0.15;
      const designTop = canvas.height * 0.25;
      const designWidth = canvas.width * 0.7;
      const designHeight = canvas.height * 0.45;
      for (const el of sortedElements) {
        const centerX = designLeft + (designWidth * (el.x / 100));
        const centerY = designTop + (designHeight * (el.y / 100));
        const rotation = (el.type === 'image' ? (el as ImageElement).rotation : (el as TextElement).rotation) || 0;
        ctx.save();
        ctx.translate(centerX, centerY);
        ctx.rotate((rotation * Math.PI) / 180);
        if (el.type === 'image') {
          const designImg = new Image();
          designImg.src = el.src;
          await new Promise((resolve, reject) => {
            designImg.onload = () => resolve(true);
            designImg.onerror = reject;
          });
          const scaledWidth = el.width * 2;
          const scaledHeight = el.height * 2;
          ctx.drawImage(designImg, -scaledWidth / 2, -scaledHeight / 2, scaledWidth, scaledHeight);
        } else {
          const textEl = el as TextElement;
          const fontWeight = textEl.bold ? 'bold' : 'normal';
          const fontStyle = textEl.italic ? 'italic' : 'normal';
          ctx.font = `${fontStyle} ${fontWeight} ${textEl.fontSize * 2}px "${textEl.fontFamily}"`;
          ctx.fillStyle = textEl.color;
          ctx.textAlign = (textEl.align as CanvasTextAlign) || 'center';
          ctx.fillText(textEl.text, 0, 0);
        }
        ctx.restore();
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
      <div className="flex-1 flex flex-col lg:flex-row">
        <DesignTools />
        <DesignCanvas />
        <DesignLayers />
      </div>
    </div>
  );
}