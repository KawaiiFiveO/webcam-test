// Webcam Test
const webcamVideo = document.getElementById('webcamVideo');
const startWebcamButton = document.getElementById('startWebcam');
const stopWebcamButton = document.getElementById('stopWebcam');
let webcamStream = null;

startWebcamButton.addEventListener('click', async () => {
    try {
        webcamStream = await navigator.mediaDevices.getUserMedia({ video: true });
        webcamVideo.srcObject = webcamStream;
        startWebcamButton.disabled = true;
        stopWebcamButton.disabled = false;
    } catch (error) {
        console.error('Error accessing webcam:', error);
        alert('Unable to access the webcam.');
    }
});

stopWebcamButton.addEventListener('click', () => {
    if (webcamStream) {
        const tracks = webcamStream.getTracks();
        tracks.forEach(track => track.stop());
        webcamVideo.srcObject = null;
        startWebcamButton.disabled = false;
        stopWebcamButton.disabled = true;
    }
});

// Microphone Test
const startMicButton = document.getElementById('startMic');
const stopMicButton = document.getElementById('stopMic');
const micStatus = document.getElementById('micStatus');
const canvas = document.getElementById('audioVisualizer');
const canvasCtx = canvas.getContext('2d');
let audioStream = null;
let audioContext = null;
let analyser = null;

startMicButton.addEventListener('click', async () => {
    try {
        audioStream = await navigator.mediaDevices.getUserMedia({ audio: true });
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
        analyser = audioContext.createAnalyser();
        const microphone = audioContext.createMediaStreamSource(audioStream);
        microphone.connect(analyser);
        analyser.fftSize = 256;

        startMicButton.disabled = true;
        stopMicButton.disabled = false;
        micStatus.textContent = 'Microphone is active.';

        visualize();
    } catch (error) {
        console.error('Error accessing microphone:', error);
        alert('Unable to access the microphone.');
    }
});

stopMicButton.addEventListener('click', () => {
    if (audioStream) {
        const tracks = audioStream.getTracks();
        tracks.forEach(track => track.stop());

        startMicButton.disabled = false;
        stopMicButton.disabled = true;
        micStatus.textContent = 'Microphone is off.';
    }
    if (audioContext) {
        audioContext.close();
    }
});

// Visualize Audio Input
function visualize() {
    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    function draw() {
        requestAnimationFrame(draw);

        analyser.getByteFrequencyData(dataArray);
        canvasCtx.clearRect(0, 0, canvas.width, canvas.height);

        canvasCtx.fillStyle = 'rgb(200, 200, 200)';
        canvasCtx.fillRect(0, 0, canvas.width, canvas.height);

        const barWidth = (canvas.width / bufferLength) * 2.5;
        let barHeight;
        let x = 0;

        for (let i = 0; i < bufferLength; i++) {
            barHeight = dataArray[i] / 2;

            canvasCtx.fillStyle = `rgb(${barHeight + 100}, 50, 50)`;
            canvasCtx.fillRect(x, canvas.height - barHeight / 2, barWidth, barHeight);

            x += barWidth + 1;
        }
    }

    draw();
}
