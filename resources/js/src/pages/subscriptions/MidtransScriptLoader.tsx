// components/MidtransScriptLoader.tsx
import { useEffect } from 'react';

interface MidtransScriptLoaderProps {
  clientKey: string;
}

const MidtransScriptLoader: React.FC<MidtransScriptLoaderProps> = ({ clientKey }) => {
  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://app.sandbox.midtrans.com/snap/snap.js';
    script.setAttribute('data-client-key', clientKey);
    script.async = true;
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, [clientKey]);

  return null;
};

export default MidtransScriptLoader;