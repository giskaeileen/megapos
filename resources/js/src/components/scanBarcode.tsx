import jsQR from "jsqr";

export const scanBarcode = () => {
    const video = document.createElement("video");
    const canvasElement = document.createElement("canvas");
    const canvas = canvasElement.getContext("2d");

    navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } }).then((stream) => {
        video.srcObject = stream;
        video.setAttribute("playsinline", "true");
        video.play();

        requestAnimationFrame(tick);
    });

    function tick() {
        if (video.readyState === video.HAVE_ENOUGH_DATA) {
            canvasElement.height = video.videoHeight;
            canvasElement.width = video.videoWidth;
            canvas?.drawImage(video, 0, 0, canvasElement.width, canvasElement.height);

            const imageData = canvas?.getImageData(0, 0, canvasElement.width, canvasElement.height);
            if (imageData) {
                const code = jsQR(imageData.data, imageData.width, imageData.height);
                if (code) {
                    alert(`Barcode ditemukan: ${code.data}`);
                    video.srcObject.getTracks().forEach(track => track.stop()); // Stop kamera setelah scan
                }
            }
        }
        requestAnimationFrame(tick);
    }
};
