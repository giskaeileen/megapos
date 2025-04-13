// import { scanBarcode } from "./scanBarcode";

// const ScanBarcodePage = () => {
//     return (
//         <div>
//             <h1>Scan Barcode</h1>
//             <button onClick={scanBarcode}>Mulai Scan</button>
//         </div>
//     );
// };

// export default ScanBarcodePage;

// import { useEffect, useRef, useState } from "react";
// import jsQR from "jsqr";

// const ScanBarcode = () => {
//     const videoRef = useRef<HTMLVideoElement>(null);
//     const canvasRef = useRef<HTMLCanvasElement>(null);
//     const [scannedCode, setScannedCode] = useState<string | null>(null);

//     useEffect(() => {
//         const video = videoRef.current;
//         const canvasElement = canvasRef.current;
//         const canvas = canvasElement?.getContext("2d");

//         if (!video || !canvasElement || !canvas) return;

//         navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } })
//             .then((stream) => {
//                 video.srcObject = stream;
//                 video.setAttribute("playsinline", "true");
//                 video.play();
//                 requestAnimationFrame(scanBarcode);
//             })
//             .catch((error) => console.error("Error membuka kamera:", error));

//         function scanBarcode() {
//             if (video.readyState === video.HAVE_ENOUGH_DATA) {
//                 canvasElement.width = video.videoWidth;
//                 canvasElement.height = video.videoHeight;
//                 canvas.drawImage(video, 0, 0, canvasElement.width, canvasElement.height);

//                 const imageData = canvas.getImageData(0, 0, canvasElement.width, canvasElement.height);
//                 const code = jsQR(imageData.data, imageData.width, imageData.height);

//                 if (code && code.data !== scannedCode) {
//                     setScannedCode(code.data); // Menampilkan hasil scan
//                 }
//             }
//             requestAnimationFrame(scanBarcode);
//         }

//         return () => {
//             video.srcObject?.getTracks().forEach(track => track.stop());
//         };
//     }, [scannedCode]); // Dependensi memastikan state terbaru

//     return (
//         <div>
//             <h2>Scan Barcode</h2>
//             <video ref={videoRef} style={{ width: "100%", maxWidth: "500px" }} />
//             <canvas ref={canvasRef} style={{ display: "none" }} />
//             {scannedCode && <h3>Kode: {scannedCode}</h3>}
//         </div>
//     );
// };

// export default ScanBarcode;

import { useEffect, useRef, useState } from "react";
import Quagga from "quagga";

const BarcodeScanner = () => {
    const scannerRef = useRef<HTMLDivElement>(null);
    const [scannedCode, setScannedCode] = useState<string | null>(null);

    useEffect(() => {
        if (!scannerRef.current) return;

        Quagga.init({
            inputStream: {
                type: "LiveStream",
                target: scannerRef.current,
                constraints: {
                    facingMode: "environment",
                },
            },
            decoder: {
                readers: ["ean_reader", "code_128_reader", "upc_reader"],
            },
            locator: {
                patchSize: "medium",
                halfSample: true,
            },
        }, (err) => {
            if (err) {
                console.error("Error QuaggaJS:", err);
                return;
            }
            Quagga.start();
        });

        Quagga.onDetected((result: any) => {
            console.log("Barcode ditemukan:", result.codeResult.code);
            setScannedCode((prevCode) => {
                if (prevCode !== result.codeResult.code) {
                    return result.codeResult.code;
                }
                return prevCode;
            });
        });

        return () => {
            Quagga.stop();
        };
    }, []);

    return (
        <div>
            <h2>Scan Barcode</h2>
            {scannedCode && <h3>Kode: {scannedCode}</h3>}
            <div ref={scannerRef} style={{ width: "100%", height: "300px", border: "2px solid black" }}></div>
        </div>
    );
};

export default BarcodeScanner;
