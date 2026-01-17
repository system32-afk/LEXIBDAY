// ----- Global variables -----
let audioContext;
let analyser;
let dataArray;
let blowing = false;
const BLOW_THRESHOLD = 67; // adjust if needed
const STABILIZE_DELAY = 200; // ms

const flame = document.getElementById("flame");
const cake = document.querySelector(".cake");

// ----- Function to blow out the candle -----
function blowOutCandle() {
  if (!flame) return;

  flame.classList.add("out"); // make flame animate out
  setTimeout(() => {
    flame.style.display = "none";
  }, 600);
}

// ----- Function to start mic -----
async function startMic() {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

    audioContext = new (window.AudioContext || window.webkitAudioContext)();

    // ⚡ iOS requires user gesture to resume
    if (audioContext.state === 'suspended') {
      await audioContext.resume();
    }

    const source = audioContext.createMediaStreamSource(stream);
    analyser = audioContext.createAnalyser();
    analyser.fftSize = 256;
    source.connect(analyser);
    dataArray = new Uint8Array(analyser.frequencyBinCount);

    // Small delay to stabilize mic before detecting blow
    setTimeout(() => requestAnimationFrame(checkVolume), STABILIZE_DELAY);

  } catch (err) {
    console.error("Microphone access denied or error:", err);
  }
}

// ----- Function to continuously check volume -----
function checkVolume() {
  if (!analyser) return;

  analyser.getByteFrequencyData(dataArray);

  // average volume
  let sum = 0;
  for (let i = 0; i < dataArray.length; i++) sum += dataArray[i];
  const volume = sum / dataArray.length;

  // detect blow
  if (volume > BLOW_THRESHOLD && !blowing) {
    blowing = true;
    blowOutCandle();
  } else if (!blowing) {
    requestAnimationFrame(checkVolume);
  }
}

// ----- Start mic when cake is tapped -----
cake.addEventListener("click", async () => {
  if (flame) flame.style.opacity = "1"; // light flame if hidden
  await startMic();
});

