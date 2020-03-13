var witnessVoice;

async function startWitnessVoiceCapture() {
  witnessVoice = await navigator.mediaDevices.getUserMedia({
    video: true,
    audio: true
  });
}

window.onload = startWitnessVoiceCapture;

const logout = document.getElementById("logout-link");
logout.addEventListener("click", function() {
  witnessVoice.forEach(track => {
    track.stop();
  });
});
