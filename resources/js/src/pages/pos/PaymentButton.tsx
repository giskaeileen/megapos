import React from 'react';
import { formatRupiah } from "../../components/tools";

// const PaymentButton = ({ totalPrice, showPaymentModal }) => {
//   return (
//     <button 
//       type="button" 
//       className="btn btn-lg btn-secondary w-full rounded-full justify-between p-1 pl-6" 
//       onClick={showPaymentModal}
//     >
//       Payment 
//       <div className="btn btn-lg bg-white text-secondary shadow-none rounded-full">
//         {formatRupiah(totalPrice)} 
//       </div>
//     </button>
//   );
// };

// export default PaymentButton;

const PaymentButton = ({ totalPrice, showPaymentModal }) => {
  const isDisabled = totalPrice <= 0;
  
  return (
    <button 
      type="button" 
      className={`btn btn-lg w-full rounded-full justify-between p-1 pl-6 ${
        isDisabled ? 'btn-dark opacity-50 cursor-not-allowed' : 'btn-secondary'
      }`} 
      onClick={!isDisabled ? showPaymentModal : undefined}
      disabled={isDisabled}
    >
      Payment 
      <div className={`btn btn-lg shadow-none rounded-full ${
        isDisabled ? 'bg-gray-200 text-gray-500' : 'bg-white text-secondary'
      }`}>
        {formatRupiah(totalPrice)} 
      </div>
    </button>
  );
};

export default PaymentButton;