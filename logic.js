// ----- Global variables -----
let audioContext;
let analyser;
let dataArray;
let blowing = false;
const BLOW_THRESHOLD = 67; // adjust if needed
const STABILIZE_DELAY = 200; // ms
const env = document.querySelector(".envelope-wrapper");
const flame = document.getElementById("flame");
const cake = document.querySelector(".cake");

// ----- Function to blow out the candle -----
function blowOutCandle() {
  if (!flame) return;
  
  flame.classList.add("out"); // make flame animate out
  setTimeout(() => {
    flame.style.display = "none";
  }, 600);

  // show envelope
  env.classList.add("show");
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


const envelope = document.querySelector('.envelope-wrapper');
let isOpen = false;
const letter = document.querySelector(".letter");

envelope.addEventListener("click", () => {
  if (!isOpen) {
    envelope.classList.add("flap");
    letter.classList.remove("hide");
    letter.classList.add("show");
    isOpen = true;
  } else {
    envelope.classList.remove("flap");
    letter.classList.remove("show");
    letter.classList.add("hide");
    isOpen = false;
  }

  console.log("isOpen:", isOpen);
});






