"use client"
import { useState, useEffect } from 'react';
import { Lock as LockIcon, ShoppingCart, Trash2 } from 'lucide-react';
import useDesignStore, { useCartItems } from '@/app/lib/useDesignStore';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { useUser } from '@/app/lib/user';
import { toast } from 'sonner';

export default function DesignHeader() {
  const {
    currentDesign,
    savedDesigns,
    loadSavedDesigns,
    loadCart,
    addDesign,
    removeDesign,
    removeFromCart,
    loadCurrentFromSaved,
    getCartItemCount,
    updateCartItemQuantity,
    getCartTotal,
    isLoading
  } = useDesignStore();

  const { user} = useUser();

  const userId = user?.id;

  // Use the selector to get cart items
  const cart = useCartItems();
  
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [showCartModal, setShowCartModal] = useState(false);
  const [designName, setDesignName] = useState('');
  const [saveMessage, setSaveMessage] = useState('');
  const [loadMessage, setLoadMessage] = useState('');
  const totalElements = currentDesign.elements.front.length + currentDesign.elements.back.length;
  const router = useRouter();

  useEffect(() => {
    if (user) {
      loadCart(user);
      loadSavedDesigns(user.id);
    }
  }, [user]);

  const saveDesign = () => {
    if (!designName.trim()) {
      setSaveMessage('Please enter a design name');
      return;
    }
    if (totalElements === 0) {
      setSaveMessage('Add at least one element before saving');
      return;
    }
    if (!user) {
      setSaveMessage('Please log in to save designs');
      return;
    }
    
    addDesign({
      name: designName,
      elements: currentDesign.elements,
      tshirtColor: currentDesign.tshirtColor,
    },userId!);
    
    toast.success('Design saved successfully!');
    setDesignName('');
    setTimeout(() => {
      setSaveMessage('');
    }, 2000);
  };
  
  const handleLoadDesign = (design: any) => {
    loadCurrentFromSaved(design);
    toast.success('Design loaded successfully!');
    setShowSaveModal(false);
    setTimeout(() => setLoadMessage(''), 2000);
  };

  // Handle opening cart modal
  const handleOpenCartModal = () => {
    if (!user) {
      setSaveMessage('Please log in to view your cart');
      return;
    }
    setShowCartModal(true);
  };

  return (
    <>
      <header className="bg-black text-white px-4 sm:px-6 py-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-4">
            <a href="/" className="text-xl sm:text-2xl font-black">🎨</a>
            <span className="text-xs sm:text-sm text-gray-400">Design Studio</span>
          </div>
          <div className="flex gap-2 sm:gap-4">
            <button 
              onClick={() => setShowSaveModal(true)}
              className="px-3 sm:px-4 py-2 border border-white text-xs sm:text-sm font-bold hover:bg-white hover:text-black transition-colors rounded"
            >
              SAVE
            </button>
            <button 
              onClick={handleOpenCartModal}
              className="px-3 sm:px-4 py-2 text-xs sm:text-sm font-bold hover:bg-white hover:text-black transition-colors relative rounded"
            >
              <ShoppingCart className="w-5 h-5" />
              {getCartItemCount() > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-bold">
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
                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-black"
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
                    <div key={design.id} className="flex items-center justify-between p-3 border border-gray-200 rounded hover:bg-gray-50 transition-colors">
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-sm truncate">{design.name}</p>
                        <p className="text-xs text-gray-500">
                          {design.tshirtColor.charAt(0).toUpperCase() + design.tshirtColor.slice(1)} • {new Date(design.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex gap-2 ml-4">
                        <button
                          onClick={() => handleLoadDesign(design)}
                          className="px-3 py-1 bg-black text-white text-xs font-bold rounded hover:bg-gray-800 transition-colors"
                        >
                          Load
                        </button>
                        <button
                          onClick={() => removeDesign(design.id, userId!)}
                          disabled={isLoading}
                          className="px-3 py-1 bg-red-500 text-white text-xs font-bold rounded hover:bg-red-600 transition-colors"
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
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-black">Shopping Cart</h2>
              <button
                onClick={() => setShowCartModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>
            {!user ? (
              <p className="text-center text-gray-500 py-8">Please log in to view your cart</p>
            ) : cart.length === 0 ? (
              <p className="text-center text-gray-500 py-8">Your cart is empty</p>
            ) : (
              <>
                <div className="space-y-6 mb-6">
                  {cart.map((item) => {
                    const frontElements = item.elements.front.length;
                    const backElements = item.elements.back.length;
                    const totalElements = frontElements + backElements;
                    const capitalizedColor = item.tshirtColor.charAt(0).toUpperCase() + item.tshirtColor.slice(1);

                    return (
                      <div key={item.id} className="p-4 border border-gray-200 rounded-lg">
                        <div className="flex flex-col sm:flex-row gap-6">
                          {/* Previews */}
                          <div className="grid grid-cols-2 gap-3 sm:gap-4 flex-shrink-0">
                            <div>
                              <p className="text-xs font-medium text-gray-600 text-center mb-1">Front</p>
                              <div className="relative w-32 h-32 bg-gray-100 rounded-lg overflow-hidden shadow-sm">
                                <img 
                                  src={item.front} 
                                  alt="Front design" 
                                  className="w-full h-full object-contain"
                                />
                                {frontElements === 0 && (
                                  <div className="absolute inset-0 flex items-center justify-center bg-gray-50 bg-opacity-75">
                                    <span className="text-xs text-gray-500">Blank</span>
                                  </div>
                                )}
                              </div>
                            </div>
                            <div>
                              <p className="text-xs font-medium text-gray-600 text-center mb-1">Back</p>
                              <div className="relative w-32 h-32 bg-gray-100 rounded-lg overflow-hidden shadow-sm">
                                <img 
                                  src={item.back} 
                                  alt="Back design" 
                                  className="w-full h-full object-contain"
                                />
                                {backElements === 0 && (
                                  <div className="absolute inset-0 flex items-center justify-center bg-gray-50 bg-opacity-75">
                                    <span className="text-xs text-gray-500">Blank</span>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>

                          {/* Details */}
                          <div className="flex-1 flex flex-col justify-between">
                            <div>
                              <h3 className="font-bold text-lg">{item.name}</h3>
                              <p className="text-sm text-gray-600 mt-1">Color: {capitalizedColor}</p>
                              <p className="text-sm text-gray-600">
                                Design elements: {totalElements} ({frontElements} front, {backElements} back)
                              </p>
                            </div>

                            <div className="flex items-center justify-between mt-4">
                              <div className="flex items-center gap-3">
                                <span className="text-sm text-gray-600">Qty:</span>
                                <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden">
                                  <button
                                    onClick={() => {
                                      if (item.quantity > 1) {
                                        updateCartItemQuantity(item.id,userId!, item.quantity - 1);
                                      } else {
                                        removeFromCart(item.id,userId!);
                                      }
                                    }}
                                    className="px-3 py-1.5 hover:bg-gray-100 text-sm font-bold"
                                  >
                                    -
                                  </button>
                                  <span className="px-4 py-1.5 text-sm font-bold min-w-12 text-center">
                                    {item.quantity}
                                  </span>
                                  <button
                                    onClick={() => updateCartItemQuantity(item.id,userId!, item.quantity + 1)}
                                    className="px-3 py-1.5 hover:bg-gray-100 text-sm font-bold"
                                  >
                                    +
                                  </button>
                                </div>
                              </div>

                              <div className="flex items-center gap-4">
                                <p className="font-bold text-lg">R{(item.price * item.quantity).toFixed(2)}</p>
                                <button
                                  onClick={() => removeFromCart(item.id,userId!)}
                                  className="text-red-500 hover:text-red-700"
                                >
                                  <Trash2 className="w-5 h-5" />
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
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
                    className="w-full bg-black text-white py-3 rounded font-bold hover:bg-gray-800 transition-colors flex items-center justify-center gap-2"
                  >
                    <LockIcon className="w-5 h-5" />
                    Proceed to Checkout
                  </Button>
                </div>
              </>
            )}
            {cart.length > 0 && (
              <button
                onClick={() => setShowCartModal(false)}
                className="w-full mt-4 border border-gray-300 py-2 rounded font-bold hover:bg-gray-100 transition-colors"
              >
                Close
              </button>
            )}
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