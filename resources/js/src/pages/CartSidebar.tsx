import React, { useState } from "react";

const CartSidebar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div className="flex transition-all duration-300">
      {/* Konten Utama */}
      <div
        className={`flex-grow transition-all duration-300 ${
          isOpen ? "mr-[400px]" : "mr-0"
        }`}
      >
        <div className="p-4">
          <p>
            Lorem ipsum dolor sit amet consectetur adipisicing elit.
            Necessitatibus ea autem illo consequatur! Consequuntur repudiandae,
            voluptatem temporibus possimus est animi.
          </p>
        </div>
      </div>

      {/* Sidebar */}
        {/* <div
            className={`fixed top-0 right-0 h-full w-80 bg-white shadow-lg z-40 transition-all duration-300 ${
            isOpen ? " translate-x-0" : "translate-x-full"
            }`}
        > */}
        <nav
            className={`${
                (isOpen && 'ltr:!right-0 rtl:!left-0') || 'hidden'
            } bg-white fixed ltr:-right-[400px] rtl:-left-[400px] top-0 bottom-0 w-full max-w-[400px] shadow-[5px_0_25px_0_rgba(94,92,154,0.1)] transition-[right] duration-300 z-[51] dark:bg-black p-4`}
        >
            <div className="flex items-center justify-between p-4 border-b">
                <h2 className="text-lg font-bold">Your Cart</h2>
                <button
                    onClick={toggleSidebar}
                    className="text-red-500 focus:outline-none"
                >
                    Close
                </button>
            </div>
            <div className="p-4">
                {/* Isi cart */}
                <p>Your cart is empty.</p>
            </div>
        </nav>
      {/* </div> */}

      {/* Toggle Button */}
      <button
        onClick={toggleSidebar}
        className="fixed top-4 right-4 bg-blue-500 text-white px-4 py-2 rounded-lg shadow-lg z-50"
      >
        {isOpen ? "Close Cart" : "Open Cart"}
      </button>
    </div>
  );
};

export default CartSidebar;