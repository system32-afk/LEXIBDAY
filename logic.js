const flame = document.getElementById("flame");

let audioContext;
let analyser;
let dataArray;
let blowing = false;

async function startMic() {
  const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

  audioContext = new (window.AudioContext || window.webkitAudioContext)();
  const source = audioContext.createMediaStreamSource(stream);

  analyser = audioContext.createAnalyser();
  analyser.fftSize = 256;

  source.connect(analyser);
  dataArray = new Uint8Array(analyser.frequencyBinCount);

  detectBlow();
}

function detectBlow() {
  analyser.getByteFrequencyData(dataArray);

  let sum = 0;
  for (let i = 0; i < dataArray.length; i++) {
    sum += dataArray[i];
  }

  const volume = sum / dataArray.length;

  // 🔥 Adjust this threshold if needed
  if (volume > 60 && !blowing) {
    blowing = true;
    console.log("blow detected")
    flame.style.transform = `scale(${1 + volume / 120}) skewX(${(volume - 30) / 4}deg)`;
    blowOutCandle();
  } else {
    requestAnimationFrame(detectBlow);
  }
}

function blowOutCandle() {
  flame.classList.add("out");

  // Optional: fully disable after animation
  setTimeout(() => {
    flame.style.display = "none";
  }, 600);
}



document.querySelector(".cake").addEventListener("click", () => {
  startMic();
});
