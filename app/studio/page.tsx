"use client"

import { useState, useRef } from 'react';
import { Upload, Type, Palette, Download, RotateCcw, Trash2, AlignLeft, AlignCenter, AlignRight, Bold, Italic } from 'lucide-react';

interface TextElement {
  id: number;
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

interface ImageElement {
  id: number;
  src: string;
  x: number;
  y: number;
  width: number;
  height: number;
}

export default function DesignStudio() {
  const [selectedTool, setSelectedTool] = useState<string>('upload');
  const [textElements, setTextElements] = useState<TextElement[]>([]);
  const [imageElements, setImageElements] = useState<ImageElement[]>([]);
  const [selectedElement, setSelectedElement] = useState<number | null>(null);
  const [tshirtColor, setTshirtColor] = useState<string>('#FFFFFF');
  const [currentText, setCurrentText] = useState<string>('Your Text Here');
  const [textColor, setTextColor] = useState<string>('#000000');
  const [fontSize, setFontSize] = useState<number>(24);
  const [fontFamily, setFontFamily] = useState<string>('Arial');
  const [textAlign, setTextAlign] = useState<string>('center');
  const [isBold, setIsBold] = useState<boolean>(false);
  const [isItalic, setIsItalic] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const colors = [
    '#FFFFFF', '#000000', '#FF0000', '#00FF00', '#0000FF', 
    '#FFFF00', '#FF00FF', '#00FFFF', '#FFA500', '#800080'
  ];

  const fonts = [
    'Arial', 'Helvetica', 'Times New Roman', 'Courier New', 
    'Georgia', 'Verdana', 'Impact', 'Comic Sans MS'
  ];

  const addTextElement = () => {
    const newElement = {
      id: Date.now(),
      text: currentText,
      color: textColor,
      fontSize: fontSize,
      fontFamily: fontFamily,
      x: 50,
      y: 40,
      align: textAlign,
      bold: isBold,
      italic: isItalic
    };
    setTextElements([...textElements, newElement]);
    setSelectedElement(newElement.id);
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Check file size (10MB limit)
      if (file.size > 10 * 1024 * 1024) {
        alert('File size must be less than 10MB');
        return;
      }

      // Check file type
      if (!file.type.startsWith('image/')) {
        alert('Please upload an image file (PNG, JPG, etc.)');
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        const newImage: ImageElement = {
          id: Date.now(),
          src: e.target?.result as string,
          x: 50,
          y: 40,
          width: 120,
          height: 120
        };
        setImageElements([...imageElements, newImage]);
        setSelectedElement(newImage.id);
      };
      reader.readAsDataURL(file);
    }
  };

  const deleteTextElement = (id: number) => {
    setTextElements(textElements.filter(el => el.id !== id));
    if (selectedElement === id) setSelectedElement(null);
  };

  const deleteImageElement = (id: number) => {
    setImageElements(imageElements.filter(el => el.id !== id));
    if (selectedElement === id) setSelectedElement(null);
  };

  const clearAll = () => {
    setTextElements([]);
    setImageElements([]);
    setSelectedElement(null);
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      {/* Header */}
      <header className="bg-black text-white px-4 sm:px-6 py-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-4">
            <a href="#" className="text-xl sm:text-2xl font-black">PrintWaves</a>
            <span className="text-xs sm:text-sm text-gray-400">Design Studio</span>
          </div>
          <div className="flex gap-2 sm:gap-4">
            <button className="px-3 sm:px-4 py-2 border border-white text-xs sm:text-sm font-bold hover:bg-white hover:text-black transition-colors">
              SAVE
            </button>
            <button className="px-3 sm:px-4 py-2 bg-white text-black text-xs sm:text-sm font-bold hover:bg-gray-200 transition-colors">
              ORDER NOW
            </button>
          </div>
        </div>
      </header>

      <div className="flex-1 flex flex-col lg:flex-row">
        {/* Left Sidebar - Tools */}
        <div className="w-full lg:w-64 bg-white border-b lg:border-r border-gray-200 p-4 overflow-y-auto">
          <h2 className="text-lg font-black mb-4">DESIGN TOOLS</h2>
          
          {/* Tool Selection */}
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

          {/* Tool Options */}
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
                
                {imageElements.length > 0 && (
                  <div className="mt-4">
                    <h4 className="text-xs font-bold mb-2">Uploaded Images:</h4>
                    <div className="space-y-2">
                      {imageElements.map((img, index) => (
                        <div key={img.id} className="flex items-center gap-2 p-2 bg-gray-50 rounded">
                          <img src={img.src} alt={`Upload ${index + 1}`} className="w-10 h-10 object-cover rounded" />
                          <span className="text-xs flex-1">Image {index + 1}</span>
                          <button
                            onClick={() => deleteImageElement(img.id)}
                            className="text-red-500 hover:text-red-700"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
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
                    onChange={(e) => setCurrentText(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
                    placeholder="Enter your text"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold block mb-2">Font</label>
                  <select
                    value={fontFamily}
                    onChange={(e) => setFontFamily(e.target.value)}
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
                    onChange={(e) => setFontSize(Number(e.target.value))}
                    className="w-full"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold block mb-2">Text Color</label>
                  <div className="grid grid-cols-5 gap-2">
                    {colors.map(color => (
                      <button
                        key={color}
                        onClick={() => setTextColor(color)}
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
                      onClick={() => setIsBold(!isBold)}
                      className={`flex-1 p-2 rounded border ${
                        isBold ? 'bg-black text-white border-black' : 'border-gray-300'
                      }`}
                    >
                      <Bold className="w-4 h-4 mx-auto" />
                    </button>
                    <button
                      onClick={() => setIsItalic(!isItalic)}
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
                      onClick={() => setTextAlign('left')}
                      className={`flex-1 p-2 rounded border ${
                        textAlign === 'left' ? 'bg-black text-white border-black' : 'border-gray-300'
                      }`}
                    >
                      <AlignLeft className="w-4 h-4 mx-auto" />
                    </button>
                    <button
                      onClick={() => setTextAlign('center')}
                      className={`flex-1 p-2 rounded border ${
                        textAlign === 'center' ? 'bg-black text-white border-black' : 'border-gray-300'
                      }`}
                    >
                      <AlignCenter className="w-4 h-4 mx-auto" />
                    </button>
                    <button
                      onClick={() => setTextAlign('right')}
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
                <div className="grid grid-cols-5 gap-3">
                  {colors.map(color => (
                    <button
                      key={color}
                      onClick={() => setTshirtColor(color)}
                      className={`w-full aspect-square rounded-lg border-4 transition-all ${
                        tshirtColor === color ? 'border-black scale-110' : 'border-gray-300'
                      }`}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Center - Canvas */}
        <div className="flex-1 flex flex-col items-center justify-center p-4 sm:p-8 bg-gray-100">
          <div className="bg-white rounded-lg shadow-xl p-4 sm:p-8 max-w-2xl w-full">
            <div className="relative w-full aspect-[3/4] mx-auto" style={{ maxWidth: '400px' }}>
              {/* T-Shirt Shape */}
              <div 
                className="absolute inset-0 rounded-lg shadow-inner"
                style={{ backgroundColor: tshirtColor }}
              >
                {/* Design Area */}
                <div className="absolute top-[25%] left-[15%] right-[15%] bottom-[30%] border-2 border-dashed border-gray-300">
                  {/* Render Images */}
                  {imageElements.map((element) => (
                    <div
                      key={`img-${element.id}`}
                      className="absolute cursor-move group"
                      style={{
                        left: `${element.x}%`,
                        top: `${element.y}%`,
                        transform: 'translate(-50%, -50%)',
                      }}
                    >
                      <img
                        src={element.src}
                        alt="Design element"
                        style={{
                          width: `${element.width}px`,
                          height: `${element.height}px`,
                          objectFit: 'contain',
                        }}
                        className="select-none"
                        draggable={false}
                      />
                      <button
                        onClick={() => deleteImageElement(element.id)}
                        className="absolute -top-3 -right-3 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                  
                  {/* Render Text */}
                  {textElements.map((element) => (
                    <div
                      key={`text-${element.id}`}
                      className="absolute cursor-move group"
                      style={{
                        left: `${element.x}%`,
                        top: `${element.y}%`,
                        transform: 'translate(-50%, -50%)',
                      }}
                    >
                      <div
                        style={{
                          color: element.color,
                          fontSize: `${element.fontSize}px`,
                          fontFamily: element.fontFamily,
                          textAlign: element.align as any,
                          fontWeight: element.bold ? 'bold' : 'normal',
                          fontStyle: element.italic ? 'italic' : 'normal',
                        }}
                        className="select-none whitespace-nowrap"
                      >
                        {element.text}
                      </div>
                      <button
                        onClick={() => deleteTextElement(element.id)}
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
              <button className="flex items-center gap-2 px-4 py-2 bg-black text-white rounded text-sm font-bold hover:bg-gray-800 transition-colors">
                <Download className="w-4 h-4" />
                DOWNLOAD
              </button>
            </div>
          </div>
        </div>

        {/* Right Sidebar - Layers */}
        <div className="w-full lg:w-64 bg-white border-t lg:border-l border-gray-200 p-4 overflow-y-auto">
          <h2 className="text-lg font-black mb-4">LAYERS</h2>
          
          {textElements.length === 0 && imageElements.length === 0 ? (
            <p className="text-sm text-gray-500 text-center py-8">No elements added yet</p>
          ) : (
            <div className="space-y-2">
              {/* Image Layers */}
              {imageElements.map((element, index) => (
                <div
                  key={`img-layer-${element.id}`}
                  className={`p-3 rounded-lg border-2 cursor-pointer transition-colors ${
                    selectedElement === element.id 
                      ? 'border-black bg-gray-50' 
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => setSelectedElement(element.id)}
                >
                  <div className="flex justify-between items-start gap-2">
                    <div className="flex items-center gap-2 flex-1">
                      <img src={element.src} alt="" className="w-8 h-8 object-cover rounded" />
                      <div>
                        <p className="text-xs font-bold text-gray-500">Image Layer {index + 1}</p>
                        <p className="text-xs text-gray-400">Uploaded Image</p>
                      </div>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteImageElement(element.id);
                      }}
                      className="text-red-500 hover:text-red-700"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
              
              {/* Text Layers */}
              {textElements.map((element, index) => (
                <div
                  key={`text-layer-${element.id}`}
                  className={`p-3 rounded-lg border-2 cursor-pointer transition-colors ${
                    selectedElement === element.id 
                      ? 'border-black bg-gray-50' 
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => setSelectedElement(element.id)}
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <p className="text-xs font-bold text-gray-500">Text Layer {index + 1}</p>
                      <p className="text-sm font-bold truncate">{element.text}</p>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteTextElement(element.id);
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
    </div>
  );
}