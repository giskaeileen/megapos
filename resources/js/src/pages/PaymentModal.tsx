import { useState } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { Fragment } from "react";
import { loadStripe } from "@stripe/stripe-js";
import {
  Elements,
  CardElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_KEY); 


interface PaymentModalProps {
  isOpen: boolean;
  closeModal: () => void;
  clientSecret: string;
}

const CheckoutForm: React.FC<{ clientSecret: string }> = ({ clientSecret }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleSubmit = async (event: React.FormEvent) => {
      event.preventDefault();
      setLoading(true);

      if (!stripe || !elements) {
          setLoading(false);
          return;
      }

      // Ambil client secret dari backend
      const response = await fetch(`${import.meta.env.VITE_SERVER_URI_BASE}api/stripe/setup-intent`, {
          method: "POST",
          headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${localStorage.getItem("token")}` // Jika pakai autentikasi
          }
      });

      const { clientSecret } = await response.json();

      if (!clientSecret) {
          alert("Gagal mendapatkan client secret");
          setLoading(false);
          return;
      }

      // Konfirmasi setup kartu untuk mendapatkan PaymentMethod ID
      const { setupIntent, error } = await stripe.confirmCardSetup(clientSecret, {
          payment_method: {
              card: elements.getElement(CardElement)!,
              billing_details: { name: "John Doe" }
          }
      });

      if (error) {
          console.error(error);
          setLoading(false);
          return;
      }

      // Kirim PaymentMethod ID ke backend Laravel untuk menyimpan subscription
      const res = await fetch(`${import.meta.env.VITE_SERVER_URI_BASE}api/api/subscription`, {
          method: "POST",
          headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${localStorage.getItem("token")}`
          },
          body: JSON.stringify({
              // payment_method: setupIntent.payment_method
              token: setupIntent.payment_method,
              plan: "basic-monthly"
          })
      });

      setLoading(false);

      if (res.ok) {
          alert("Subscription berhasil!");
      } else {
          const data = await res.json();
          alert(`Error: ${data.message}`);
      }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <label className="block text-sm font-medium text-gray-700">Card Details</label>
      <div className="border border-gray-300 rounded-md p-2">
        <CardElement className="p-2" />
      </div>
      {errorMessage && <p className="text-red-600">{errorMessage}</p>}
      <button
        type="submit"
        disabled={!stripe || loading}
        className="w-full bg-indigo-600 text-white py-2 rounded-md hover:bg-indigo-500 transition"
      >
        {loading ? "Processing..." : "Pay"}
      </button>
    </form>
  );
};

const PaymentModal: React.FC<PaymentModalProps> = ({ isOpen, closeModal, clientSecret }) => {
  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" open={isOpen} onClose={closeModal} className="relative z-[51]">
        <Transition.Child 
          as={Fragment} 
          enter="ease-out duration-300" 
          enterFrom="opacity-0" 
          enterTo="opacity-100" 
          leave="ease-in duration-200" 
          leaveFrom="opacity-100" 
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/60" />
        </Transition.Child>

        <div className="fixed inset-0 flex items-center justify-center px-4 py-8">
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0 scale-95"
            enterTo="opacity-100 scale-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100 scale-100"
            leaveTo="opacity-0 scale-95"
          >
            <Dialog.Panel className="bg-white p-6 rounded-lg w-full max-w-md">
              <button onClick={closeModal} className="absolute top-4 right-4 text-gray-400 hover:text-gray-800">✕</button>
              <h2 className="text-lg font-medium text-gray-900 mb-4">Complete Your Payment</h2>
              <Elements stripe={stripePromise} options={{ clientSecret }}>
                <CheckoutForm clientSecret={clientSecret} />
              </Elements>
            </Dialog.Panel>
          </Transition.Child>
        </div>
      </Dialog>
    </Transition>
  );
};

export default PaymentModal;
