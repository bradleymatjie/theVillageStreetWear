"use client"
import { useState, useEffect } from 'react';
import { Shirt, Trash2 } from 'lucide-react';
import useDesignStore from '@/app/lib/useDesignStore';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';

export default function DesignHeader() {
  const {
    currentDesign,
    currentView,
    savedDesigns,
    cart,
    addDesign,
    removeDesign,
    removeFromCart,
    loadCurrentFromSaved,
    getCartItemCount,
    updateCartItemQuantity,
    getCartTotal,
  } = useDesignStore();

  const [showSaveModal, setShowSaveModal] = useState(false);
  const [showCartModal, setShowCartModal] = useState(false);
  const [designName, setDesignName] = useState('');
  const [saveMessage, setSaveMessage] = useState('');
  const [loadMessage, setLoadMessage] = useState('');

  const totalElements = currentDesign.elements.front.length + currentDesign.elements.back.length;
  const router = useRouter();

  const saveDesign = () => {
    if (!designName.trim()) {
      setSaveMessage('Please enter a design name');
      return;
    }

    if (totalElements === 0) {
      setSaveMessage('Add at least one element before saving');
      return;
    }

    addDesign({
      name: designName,
      elements: currentDesign.elements,
      tshirtColor: currentDesign.tshirtColor,
    });

    setSaveMessage('Design saved successfully!');
    setDesignName('');
    setTimeout(() => {
      setSaveMessage('');
    }, 2000);
  };

  const handleLoadDesign = (design: any) => {
    loadCurrentFromSaved(design);
    setLoadMessage('Design loaded successfully!');
    setShowSaveModal(false);
    setTimeout(() => setLoadMessage(''), 2000);
  };

  return (
    <>
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
              onClick={() => setShowCartModal(true)}
              className="px-3 sm:px-4 py-2 border border-white text-xs sm:text-sm font-bold hover:bg-white hover:text-black transition-colors relative"
            >
              CART ({getCartItemCount()})
              {getCartItemCount() > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
                  {getCartItemCount()}
                </span>
              )}
            </button>
          </div>
        </div>
      </header>

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
            {loadMessage && (
              <div className="mb-4 p-3 rounded bg-green-100 text-green-800">
                {loadMessage}
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
                Save design
              </button>
              <button
                onClick={() => {
                  setShowSaveModal(false);
                  setSaveMessage('');
                  setLoadMessage('');
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
                          onClick={() => handleLoadDesign(design)}
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
                      {/* Screenshot Preview */}
                      <div className="w-24 h-24 bg-gray-100 rounded overflow-hidden flex-shrink-0 relative">
                        {item.screenshot ? (
                          <img 
                            src={item.screenshot} 
                            alt={item.name} 
                            className="w-full h-full object-contain" 
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Shirt className="w-12 h-12 text-gray-400" />
                          </div>
                        )}
                      </div>

                      {/* Item Details */}
                      <div className="flex-1">
                        <h3 className="font-bold">{item.name}</h3>
                        <p className="text-sm text-gray-600">Color: {item.tshirtColor}</p>
                        <p className="text-sm text-gray-600">View: {item.view}</p>
                        <p className="text-sm text-gray-600">
                          Elements: {item.elements.length}
                        </p>
                        <div className="flex items-center gap-2 mt-2">
                          <span className="text-sm text-gray-600">Qty:</span>
                          <button
                            onClick={() => updateCartItemQuantity(item.id, item.quantity - 1)}
                            className="px-2 py-1 border border-gray-300 rounded hover:bg-gray-100 text-sm"
                          >
                            -
                          </button>
                          <span className="px-3 py-1 border border-gray-300 rounded text-sm">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => updateCartItemQuantity(item.id, item.quantity + 1)}
                            className="px-2 py-1 border border-gray-300 rounded hover:bg-gray-100 text-sm"
                          >
                            +
                          </button>
                        </div>
                        <p className="font-bold mt-2">R{(item.price * item.quantity).toFixed(2)}</p>
                      </div>

                      {/* Delete Button */}
                      <button
                        onClick={() => removeFromCart(item.id)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  ))}
                </div>

                {/* Cart Total */}
                <div className="border-t border-gray-200 pt-4">
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-lg font-black">Total:</span>
                    <span className="text-2xl font-black">
                      R{getCartTotal().toFixed(2)}
                    </span>
                  </div>
                  <Button 
                    onClick={() => {
                      router.push("/studio/checkout");
                      setShowCartModal(false);
                    }}
                    className="w-full bg-black text-white py-3 rounded font-bold hover:bg-gray-800 transition-colors"
                  >
                    Proceed to Checkout
                  </Button>
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

      {/* Success Messages */}
      {loadMessage && (
        <div className="fixed top-20 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 animate-fade-in">
          {loadMessage}
        </div>
      )}
    </>
  );
}