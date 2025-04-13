import React, { useEffect, useState } from 'react';

interface QuotaFormProps {
    onSubmit: (quota: { transactions: number; products: number; employees: number; stores: number }) => void;
    initialValues: {
        transactions: number;
        products: number;
        employees: number;
        stores: number;
    };
}

const QuotaForm: React.FC<QuotaFormProps> = ({ onSubmit, initialValues }) => {
  const [quota, setQuota] = useState(initialValues);
  const [errors, setErrors] = useState({
    transactions: '',
    products: '',
    employees: '',
    stores: ''
  });

  useEffect(() => {
    setQuota(initialValues);
  }, [initialValues]);

  const validate = (name: string, value: number): boolean => {
    if (name === 'stores' && value < 1) {
      setErrors(prev => ({...prev, [name]: 'Minimum 1 store required'}));
      return false;
    } else if (value < 0) {
      setErrors(prev => ({...prev, [name]: 'Cannot be negative'}));
      return false;
    }
    setErrors(prev => ({...prev, [name]: ''}));
    return true;
  };

  const handleQuotaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const numValue = parseInt(value, 10) || 0;
    validate(name, numValue);
    setQuota({
      ...quota,
      [name]: numValue,
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate all fields before submit
    const isValid = Object.entries(quota).every(([name, value]) => {
      return validate(name, value);
    });

    if (isValid) {
      onSubmit(quota);
    }
  };

    return (
        <div className="bg-white rounded-lg shadow-md p-6 max-w-2xl mx-auto">
            <div className="mb-6">
                <h2 className="text-2xl font-bold text-gray-800">Subscription Quota Settings</h2>
                <p className="text-gray-600 mt-1">Configure your monthly usage limits. The transaction daily quota will reset every day until one month from settings</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                    {/* Quota Transactions */}
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
                            {/* <span className="font-medium">English:</span> This daily quota will reset every day until one month from settings
              <br /> */}
                            {/* <span className="font-medium"></span> Kuota harian ini akan direset setiap hari hingga satu bulan dari pengaturan */}
                        </p>
                    </div>

                    {/* Quota Products */}
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
                            {/* <span className="font-medium">English:</span> This monthly quota will be valid for one billing period */}
                            {/* <br /> */}
                            {/* <span className="font-medium"></span> Kuota bulanan ini berlaku untuk satu periode penagihan */}
                        </p>
                    </div>

                    {/* Quota Employees */}
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
                            {/* <span className="font-medium">English:</span> This monthly quota will be valid for one billing period
              <br /> */}
                            {/* <span className="font-medium"></span> Kuota bulanan ini berlaku untuk satu periode penagihan */}
                        </p>
                    </div>

                    {/* Quota Stores */}
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
                            {/* <span className="font-medium">English:</span> This monthly quota will be valid for one billing period
              <br /> */}
                            {/* <span className="font-medium"></span> Kuota bulanan ini berlaku untuk satu periode penagihan */}
                        </p>
                    </div>
                </div>

                {/* <div className="flex justify-end pt-4">
          <button
            type="submit"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
          >
            Save Settings
          </button>
        </div> */}
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
