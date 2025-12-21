"use client";

import { useState, useRef, useEffect, useMemo } from 'react';
import {
  Upload,
  Type,
  Palette,
  Bold,
  Italic,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Trash2,
  X,
} from 'lucide-react';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import useDesignStore, { Element, TextElement, ImageElement } from '@/app/lib/useDesignStore';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader,
  DialogTitle, 
  DialogTrigger 
} from '@/components/ui/dialog';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Select, 
  SelectTrigger, 
  SelectValue, 
  SelectContent, 
  SelectItem 
} from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';

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

const textColors = [
  '#FFFFFF', '#000000', '#FF0000', '#00FF00', '#0000FF',
  '#FFFF00', '#FF00FF', '#00FFFF',  
];

const fonts = [
  'Arial', 'Helvetica', 'Times New Roman', 'Courier New',
  'Georgia', 'Verdana', 'Impact', 'Comic Sans MS'
];

export default function DesignTools() {
  const {
    currentDesign,
    currentView,
    selectedElementId,
    addElement,
    deleteElement,
    setCurrentView,
    setSelectedElementId,
    setCurrentTshirtColor,
    updateElement,
  } = useDesignStore();

  const currentElements = currentDesign.elements[currentView];

  const selectedElement = useMemo(
    () => currentElements.find(e => e.id === selectedElementId) ?? null,
    [currentElements, selectedElementId]
  );

  const elementType = selectedElement?.type ?? null;

  const [selectedTool, setSelectedTool] = useState<'upload' | 'text' | 'color'>('text');
  const [uploadModalOpen, setUploadModalOpen] = useState(false);

  const [textSettings, setTextSettings] = useState({
    text: 'Your Text Here',
    color: '#000000',
    fontSize: 32,
    fontFamily: 'Arial',
    align: 'center' as 'left' | 'center' | 'right',
    bold: false,
    italic: false,
  });

  const [selectedRotation, setSelectedRotation] = useState(0);
  const [selectedImageWidth, setSelectedImageWidth] = useState<number | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!selectedElement) {
      setTextSettings({
        text: 'Your Text Here',
        color: '#000000',
        fontSize: 32,
        fontFamily: 'Arial',
        align: 'center',
        bold: false,
        italic: false,
      });
      setSelectedImageWidth(null);
      setSelectedRotation(0);
      return;
    }

    setSelectedRotation(selectedElement.rotation ?? 0);

    if (selectedElement.type === 'text') {
      const te = selectedElement as TextElement;
      setTextSettings({
        text: te.text,
        color: te.color,
        fontSize: te.fontSize,
        fontFamily: te.fontFamily,
        align: te.align as 'left' | 'center' | 'right',
        bold: te.bold,
        italic: te.italic,
      });
    } else if (selectedElement.type === 'image') {
      const ie = selectedElement as ImageElement;
      setSelectedImageWidth(ie.width ?? 200);
    }
  }, [selectedElement]);

  useEffect(() => {
    setSelectedElementId(null);
  }, [currentView, setSelectedElementId]);

  const updateTextSetting = <K extends keyof typeof textSettings>(
    key: K,
    value: (typeof textSettings)[K]
  ) => {
    setTextSettings(prev => ({ ...prev, [key]: value }));
    if (elementType === 'text' && selectedElementId) {
      updateElement(selectedElementId, { [key]: value } as Partial<TextElement>);
    }
  };

  const addTextElement = () => {
    const newEl: TextElement = {
      id: Date.now(),
      type: 'text',
      zIndex: currentElements.length,
      ...textSettings,
      x: 50,
      y: 50,
      rotation: 0,
    };
    addElement(newEl);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Please upload an image file');
      return;
    }

    const reader = new FileReader();
    reader.onload = (ev) => {
      const src = ev.target?.result as string;
      const img = new Image();
      img.onload = () => {
        const aspect = img.naturalWidth / img.naturalHeight;
        const width = 200;
        const height = width / aspect;

        const newEl: ImageElement = {
          id: Date.now(),
          type: 'image',
          zIndex: currentElements.length,
          src,
          x: 50,
          y: 50,
          width,
          height,
          aspect,
          rotation: 0,
        };
        addElement(newEl);
        setUploadModalOpen(false);
      };
      img.src = src;
    };
    reader.readAsDataURL(file);
  };

  const handleImageSize = (value: number[]) => {
    if (elementType !== 'image' || !selectedElementId) return;
    const width = value[0];
    setSelectedImageWidth(width);
    const el = selectedElement as ImageElement;
    updateElement(selectedElementId, { width, height: width / el.aspect } as Partial<ImageElement>);
  };

  const handleRotation = (value: number[]) => {
    const rot = value[0];
    setSelectedRotation(rot);
    if (selectedElementId) {
      updateElement(selectedElementId, { rotation: rot } as Partial<Element>);
    }
  };

  return (
    <div className="w-full lg:w-96 bg-background border-r border-border flex flex-col h-auto lg:h-screen overflow-y-auto">
      <div className="p-6 border-b border-border bg-background flex-shrink-0">
        <h1 className="text-3xl font-bold text-foreground">Design Tools</h1>
        <p className="text-muted-foreground mt-2">Create your custom t-shirt</p>
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="p-6 space-y-6">
          <Card className="p-6">
            <div className="grid grid-cols-2 gap-4">
              <Button
                variant={currentView === 'front' ? 'default' : 'outline'}
                size="lg"
                onClick={() => setCurrentView('front')}
                className="font-semibold h-12"
              >
                Front
              </Button>
              <Button
                variant={currentView === 'back' ? 'default' : 'outline'}
                size="lg"
                onClick={() => setCurrentView('back')}
                className="font-semibold h-12"
              >
                Back
              </Button>
            </div>
          </Card>

          <Tabs value={selectedTool} onValueChange={(v) => setSelectedTool(v as any)} className="w-full">
            <TabsList className="grid w-full grid-cols-3 mb-8 h-12">
              <TabsTrigger value="upload" className="flex items-center gap-2">
                <Upload className="w-4 h-4" /> Upload
              </TabsTrigger>
              <TabsTrigger value="text" className="flex items-center gap-2">
                <Type className="w-4 h-4" /> Text
              </TabsTrigger>
              <TabsTrigger value="color" className="flex items-center gap-2">
                <Palette className="w-4 h-4" /> Color
              </TabsTrigger>
            </TabsList>

            {/* Upload Tab */}
            <TabsContent value="upload" className="space-y-6">
              <Dialog open={uploadModalOpen} onOpenChange={setUploadModalOpen}>
                <DialogTrigger asChild>
                  <Button size="lg" className="w-full h-12">
                    <Upload className="w-5 h-5 mr-2" /> Upload New Image
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-lg">
                  <DialogHeader>
                    <DialogTitle className="text-2xl font-bold">Upload Image</DialogTitle>
                    <DialogDescription className="text-base">
                      We recommend uploading images with transparent backgrounds for best results
                    </DialogDescription>
                  </DialogHeader>
                  <div className="py-8">
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                    <div
                      onClick={() => fileInputRef.current?.click()}
                      className="border-4 border-dashed border-border rounded-xl p-12 text-center cursor-pointer hover:border-primary transition-all hover:bg-muted/50 bg-muted/30"
                    >
                      <div className="flex flex-col items-center gap-4">
                        <div className="p-4 bg-primary/10 rounded-full">
                          <Upload className="w-12 h-12 text-primary" />
                        </div>
                        <div>
                          <p className="text-lg font-semibold mb-1">Click to upload image</p>
                          <p className="text-sm text-muted-foreground">PNG, JPG, GIF • Max 10MB</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>

              {currentElements.filter(e => e.type === 'image').length > 0 && (
                <div className="space-y-4">
                  <Label className="text-base font-semibold">Uploaded Images</Label>
                  <div className="grid grid-cols-3 gap-3">
                    {currentElements
                      .filter((el): el is ImageElement => el.type === 'image')
                      .map(img => (
                        <Card
                          key={img.id}
                          className="relative overflow-hidden cursor-pointer transition-all hover:scale-105 hover:shadow-md border-2"
                          onClick={() => setSelectedElementId(img.id)}
                        >
                          <div className="aspect-square">
                            <img src={img.src} alt="Uploaded thumbnail" className="w-full h-full object-cover" />
                          </div>
                          <Button
                            size="icon"
                            variant="destructive"
                            className="absolute top-2 right-2 h-7 w-7 rounded-full opacity-90 hover:opacity-100 transition-opacity shadow-lg"
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteElement(img.id);
                            }}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </Card>
                      ))}
                  </div>
                </div>
              )}

              {elementType === 'image' && selectedElementId && (
                <Card className="p-6 space-y-6">
                  <div className="space-y-3">
                    <Label className="text-base font-semibold">Size: {selectedImageWidth?.toFixed(0)}px</Label>
                    <Slider
                      value={[selectedImageWidth ?? 200]}
                      onValueChange={handleImageSize}
                      min={50}
                      max={400}
                      step={10}
                      className="mt-3"
                    />
                  </div>
                  <div className="space-y-3">
                    <Label className="text-base font-semibold">Rotation: {selectedRotation}°</Label>
                    <Slider
                      value={[selectedRotation]}
                      onValueChange={handleRotation}
                      min={0}
                      max={359}
                      step={1}
                      className="mt-3"
                    />
                  </div>
                </Card>
              )}
            </TabsContent>

            {/* Text Tab */}
            <TabsContent value="text" className="space-y-6">
              <div className="space-y-6">
                <div className="space-y-3">
                  <Label htmlFor="text-input" className="text-base font-semibold">Text Content</Label>
                  <Input
                    id="text-input"
                    value={textSettings.text}
                    onChange={(e) => updateTextSetting('text', e.target.value)}
                    placeholder="Enter your text"
                    className="text-lg h-12"
                  />
                </div>

                <div className="space-y-3">
                  <Label htmlFor="font-select" className="text-base font-semibold">Font Family</Label>
                  <Select value={textSettings.fontFamily} onValueChange={(v) => updateTextSetting('fontFamily', v)}>
                    <SelectTrigger id="font-select" className="h-12">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {fonts.map(f => <SelectItem key={f} value={f}>{f}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-3">
                  <Label className="text-base font-semibold">Font Size: {textSettings.fontSize}px</Label>
                  <Slider
                    value={[textSettings.fontSize]}
                    onValueChange={(v) => updateTextSetting('fontSize', v[0])}
                    min={12}
                    max={100}
                    step={4}
                    className="mt-3"
                  />
                </div>

                <div className="space-y-3">
                  <Label className="text-base font-semibold">Text Color</Label>
                  <div className="grid grid-cols-4 gap-3">
                    {textColors.map(color => (
                      <Button
                        key={color}
                        variant={textSettings.color === color ? 'default' : 'outline'}
                        className="aspect-square p-0 h-14 border-2"
                        style={{ backgroundColor: color }}
                        onClick={() => updateTextSetting('color', color)}
                      />
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <Label className="text-base font-semibold">Style</Label>
                    <div className="flex gap-2">
                      <Button
                        variant={textSettings.bold ? 'default' : 'outline'}
                        onClick={() => updateTextSetting('bold', !textSettings.bold)}
                        className="flex-1 h-12"
                      >
                        <Bold className="w-5 h-5" />
                      </Button>
                      <Button
                        variant={textSettings.italic ? 'default' : 'outline'}
                        onClick={() => updateTextSetting('italic', !textSettings.italic)}
                        className="flex-1 h-12"
                      >
                        <Italic className="w-5 h-5" />
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <Label className="text-base font-semibold">Alignment</Label>
                    <div className="grid grid-cols-3 gap-2">
                      <Button
                        variant={textSettings.align === 'left' ? 'default' : 'outline'}
                        size="icon"
                        onClick={() => updateTextSetting('align', 'left')}
                        className="h-12"
                      >
                        <AlignLeft className="w-5 h-5" />
                      </Button>
                      <Button
                        variant={textSettings.align === 'center' ? 'default' : 'outline'}
                        size="icon"
                        onClick={() => updateTextSetting('align', 'center')}
                        className="h-12"
                      >
                        <AlignCenter className="w-5 h-5" />
                      </Button>
                      <Button
                        variant={textSettings.align === 'right' ? 'default' : 'outline'}
                        size="icon"
                        onClick={() => updateTextSetting('align', 'right')}
                        className="h-12"
                      >
                        <AlignRight className="w-5 h-5" />
                      </Button>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <Label className="text-base font-semibold">Rotation: {selectedRotation}°</Label>
                  <Slider
                    value={[selectedRotation]}
                    onValueChange={handleRotation}
                    min={0}
                    max={359}
                    step={5}
                    className="mt-3"
                  />
                </div>

                <Button onClick={addTextElement} size="lg" className="w-full h-12 text-base font-semibold">
                  Add New Text
                </Button>
              </div>
            </TabsContent>

            {/* Color Tab */}
            <TabsContent value="color" className="space-y-6">
              <div className="space-y-6">
                <h3 className="text-xl font-bold text-center">T-Shirt Color</h3>
                <div className="grid grid-cols-3 gap-4">
                  {tshirtColors.map(color => (
                    <Button
                      key={color.name}
                      variant={currentDesign.tshirtColor === color.name ? 'default' : 'outline'}
                      className="aspect-square h-20 border-2"
                      style={{ 
                        backgroundColor: currentDesign.tshirtColor === color.name ? color.hex : color.hex,
                        borderColor: currentDesign.tshirtColor === color.name ? 'black' : 'transparent'
                      }}
                      onClick={() => setCurrentTshirtColor(color.name)}
                    >
                      <span className="sr-only">{color.name}</span>
                    </Button>
                  ))}
                </div>
                <p className="text-sm text-center text-muted-foreground capitalize">
                  Selected: {currentDesign.tshirtColor}
                </p>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}