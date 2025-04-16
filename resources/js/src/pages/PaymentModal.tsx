// Import hook dan komponen React
import { useState } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { Fragment } from "react";
// Load Stripe SDK (client-side)
import { loadStripe } from "@stripe/stripe-js";
// Import komponen dan hook dari Stripe React
import {
  Elements,
  CardElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";

// Inisialisasi Stripe dengan publishable key dari environment variable
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_KEY);

// Tipe properti yang diterima oleh komponen PaymentModal
interface PaymentModalProps {
  isOpen: boolean;            // Menentukan apakah modal terbuka
  closeModal: () => void;     // Fungsi untuk menutup modal
  clientSecret: string;       // Token rahasia dari backend untuk otorisasi pembayaran
}

// Komponen form checkout untuk input kartu dan proses pembayaran
const CheckoutForm: React.FC<{ clientSecret: string }> = ({ clientSecret }) => {
  const stripe = useStripe();      // Mengakses instance Stripe
  const elements = useElements();  // Mengakses elemen form kartu
  const [loading, setLoading] = useState(false);        // Loading state ketika form diproses
  const [errorMessage, setErrorMessage] = useState(""); // Menyimpan pesan error

  // Fungsi yang dijalankan saat form dikirim
  const handleSubmit = async (event: React.FormEvent) => {
      event.preventDefault();
      setLoading(true);

      // Jika stripe/elements belum siap
      if (!stripe || !elements) {
          setLoading(false);
          return;
      }

      // Request ke backend Laravel untuk mendapatkan setup intent (client secret)
      const response = await fetch(`${import.meta.env.VITE_SERVER_URI_BASE}api/stripe/setup-intent`, {
          method: "POST",
          headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${localStorage.getItem("token")}` // Jika pakai autentikasi JWT
          }
      });

      // Ambil clientSecret dari response backend
      const { clientSecret } = await response.json();

      // Jika tidak ada clientSecret
      if (!clientSecret) {
          alert("Gagal mendapatkan client secret");
          setLoading(false);
          return;
      }

      // Konfirmasi setup kartu (card setup intent) ke Stripe
      const { setupIntent, error } = await stripe.confirmCardSetup(clientSecret, {
          payment_method: {
              card: elements.getElement(CardElement)!, // Ambil elemen kartu
              billing_details: { name: "John Doe" }     // Info pemilik kartu
          }
      });

      // Handle jika terjadi error saat konfirmasi setup kartu
      if (error) {
          console.error(error);
          setLoading(false);
          return;
      }

      // Kirim PaymentMethod ID ke backend Laravel untuk menyimpan langganan
      const res = await fetch(`${import.meta.env.VITE_SERVER_URI_BASE}api/api/subscription`, {
          method: "POST",
          headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${localStorage.getItem("token")}`
          },
          body: JSON.stringify({
              token: setupIntent.payment_method,   // ID metode pembayaran
              plan: "basic-monthly"                // Paket berlangganan
          })
      });

      setLoading(false);

      // Handle respon backend
      if (res.ok) {
          alert("Subscription berhasil!");
      } else {
          const data = await res.json();
          alert(`Error: ${data.message}`);
      }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Label untuk elemen kartu */}
      <label className="block text-sm font-medium text-gray-700">Card Details</label>
      <div className="border border-gray-300 rounded-md p-2">
        {/* Input kartu dari Stripe */}
        <CardElement className="p-2" />
      </div>
      {/* Tampilkan pesan error jika ada */}
      {errorMessage && <p className="text-red-600">{errorMessage}</p>}
      {/* Tombol submit form */}
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

// Komponen utama PaymentModal, digunakan untuk menampilkan modal pembayaran
const PaymentModal: React.FC<PaymentModalProps> = ({ isOpen, closeModal, clientSecret }) => {
  return (
    // Gunakan Transition dari headlessui untuk animasi modal
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" open={isOpen} onClose={closeModal} className="relative z-[51]">
        {/* Background gelap */}
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

        {/* Konten modal */}
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
            {/* Panel dialog utama */}
            <Dialog.Panel className="bg-white p-6 rounded-lg w-full max-w-md">
              {/* Tombol untuk menutup modal */}
              <button onClick={closeModal} className="absolute top-4 right-4 text-gray-400 hover:text-gray-800">✕</button>
              <h2 className="text-lg font-medium text-gray-900 mb-4">Complete Your Payment</h2>
              {/* Stripe Elements wrapper untuk CheckoutForm */}
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
