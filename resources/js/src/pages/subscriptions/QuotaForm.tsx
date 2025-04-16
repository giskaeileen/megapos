// Import React dan hooks bawaan
import React, { useEffect, useState } from 'react';

// Interface untuk props komponen QuotaForm
interface QuotaFormProps {
    onSubmit: (quota: { transactions: number; products: number; employees: number; stores: number }) => void; // Fungsi callback ketika form disubmit
    initialValues: {
        transactions: number;
        products: number;
        employees: number;
        stores: number;
    }; // Nilai awal untuk form
}

// Komponen utama QuotaForm
const QuotaForm: React.FC<QuotaFormProps> = ({ onSubmit, initialValues }) => {
  // State untuk menyimpan data kuota yang diinputkan user
  const [quota, setQuota] = useState(initialValues);

  // State untuk menyimpan error validasi masing-masing field
  const [errors, setErrors] = useState({
    transactions: '',
    products: '',
    employees: '',
    stores: ''
  });

  // Effect untuk update state quota saat nilai awal berubah dari props
  useEffect(() => {
    setQuota(initialValues);
  }, [initialValues]);

  // Fungsi validasi input berdasarkan nama field dan nilainya
  const validate = (name: string, value: number): boolean => {
    if (name === 'stores' && value < 1) {
      setErrors(prev => ({...prev, [name]: 'Minimum 1 store required'})); // Validasi khusus untuk store
      return false;
    } else if (value < 0) {
      setErrors(prev => ({...prev, [name]: 'Cannot be negative'})); // Validasi umum tidak boleh negatif
      return false;
    }
    setErrors(prev => ({...prev, [name]: ''})); // Clear error jika valid
    return true;
  };

  // Fungsi handler saat user mengubah input
  const handleQuotaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const numValue = parseInt(value, 10) || 0; // Konversi ke integer
    validate(name, numValue); // Validasi nilai input
    setQuota({
      ...quota,
      [name]: numValue, // Update state sesuai field yang berubah
    });
  };

  // Fungsi handler saat form disubmit
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validasi semua field sebelum submit
    const isValid = Object.entries(quota).every(([name, value]) => {
      return validate(name, value);
    });

    if (isValid) {
      onSubmit(quota); // Kirim data ke parent
    }
  };

    return (
        <div className="bg-white rounded-lg shadow-md p-6 max-w-2xl mx-auto">
            <div className="mb-6">
                <h2 className="text-2xl font-bold text-gray-800">Subscription Quota Settings</h2>
                <p className="text-gray-600 mt-1">Configure your monthly usage limits. The transaction daily quota will reset every day until one month from settings</p>
            </div>

            {/* Form untuk mengatur kuota */}
            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                    {/* Input kuota transaksi harian */}
                    <div className="space-y-2">
                        <div className="flex justify-between items-center">
                            <label htmlFor="transactions" className="block text-sm font-medium text-gray-700">
                                Transaction Quota
                            </label>
                            <span className="text-xs text-gray-500 bg-blue-50 px-2 py-1 rounded">Daily Reset</span>
                        </div>
                        <div className="relative rounded-md shadow-sm">
                            <input
                                type="number"
                                id="transactions"
                                name="transactions"
                                value={quota.transactions}
                                onChange={handleQuotaChange}
                                className="block w-full rounded-md border-gray-300 pl-3 pr-12 py-2 border focus:ring-primary-500 focus:border-primary-500"
                                min="0"
                                aria-describedby="transactions-unit"
                            />
                            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                                <span className="text-gray-500 sm:text-sm" id="transactions-unit">
                                    transactions / day
                                </span>
                            </div>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                            {/* Info kuota harian */}
                        </p>
                    </div>

                    {/* Input kuota produk bulanan */}
                    <div className="space-y-2">
                        <div className="flex justify-between items-center">
                            <label htmlFor="products" className="block text-sm font-medium text-gray-700">
                                Product Quota
                            </label>
                            <span className="text-xs text-gray-500 bg-green-50 px-2 py-1 rounded">Monthly</span>
                        </div>
                        <div className="relative rounded-md shadow-sm">
                            <input
                                type="number"
                                id="products"
                                name="products"
                                value={quota.products}
                                onChange={handleQuotaChange}
                                className="block w-full rounded-md border-gray-300 pl-3 pr-12 py-2 border focus:ring-primary-500 focus:border-primary-500"
                                min="0"
                                aria-describedby="products-unit"
                            />
                            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                                <span className="text-gray-500 sm:text-sm" id="products-unit">
                                    products / month
                                </span>
                            </div>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                            {/* Info kuota bulanan */}
                        </p>
                    </div>

                    {/* Input kuota karyawan bulanan */}
                    <div className="space-y-2">
                        <div className="flex justify-between items-center">
                            <label htmlFor="employees" className="block text-sm font-medium text-gray-700">
                                Employee Quota
                            </label>
                            <span className="text-xs text-gray-500 bg-green-50 px-2 py-1 rounded">Monthly</span>
                        </div>
                        <div className="relative rounded-md shadow-sm">
                            <input
                                type="number"
                                id="employees"
                                name="employees"
                                value={quota.employees}
                                onChange={handleQuotaChange}
                                className="block w-full rounded-md border-gray-300 pl-3 pr-12 py-2 border focus:ring-primary-500 focus:border-primary-500"
                                min="0"
                                aria-describedby="employees-unit"
                            />
                            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                                <span className="text-gray-500 sm:text-sm" id="employees-unit">
                                    employees / month
                                </span>
                            </div>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                            {/* Info kuota bulanan */}
                        </p>
                    </div>

                    {/* Input kuota toko bulanan */}
                    <div className="space-y-2">
                        <div className="flex justify-between items-center">
                            <label htmlFor="stores" className="block text-sm font-medium text-gray-700">
                                Store Quota
                            </label>
                            <span className="text-xs text-gray-500 bg-green-50 px-2 py-1 rounded">Monthly</span>
                        </div>
                        <div className="relative rounded-md shadow-sm">
                            <input
                                type="number"
                                id="stores"
                                name="stores"
                                value={quota.stores}
                                onChange={handleQuotaChange}
                                className="block w-full rounded-md border-gray-300 pl-3 pr-12 py-2 border focus:ring-primary-500 focus:border-primary-500"
                                min="1"
                                aria-describedby="stores-unit"
                            />
                            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                                <span className="text-gray-500 sm:text-sm" id="stores-unit">
                                    stores / month
                                </span>
                            </div>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                            {/* Info kuota bulanan */}
                        </p>
                    </div>
                </div>

                {/* Tombol untuk submit form */}
                <div className="flex justify-end">
                    <button type="submit" className="btn btn-primary">
                        Save Setting
                    </button>
                </div>
            </form>
        </div>
    );
};

export default QuotaForm;
