//----------------------screen recording part start ------------//

// ---------------- speechRecognitionClass ------------------//
try {
  var SpeechRecognition =
    window.SpeechRecognition || window.webkitSpeechRecognition;
  var recognition = new SpeechRecognition();
} catch (e) {
  console.error("error: " + e);
}

var outputTextarea = document.querySelector("#output");
var output = [];

/*-----------------------------Voice Recognition------------------------------*/

// If false, the recording will stop after a few seconds of silence.
// When true, the silence period is longer (about 15 seconds),
// allowing us to keep recording even when the user pauses.
recognition.continuous = true;

// This block is called every time the Speech APi captures a line.
recognition.onresult = function(event) {
  // event is a SpeechRecognitionEvent object.
  // It holds all the lines we have captured so far.
  // We only need the current one.
  var current = event.resultIndex;

  // Get a transcript of what was said.
  var transcript = event.results[current][0].transcript;

  // Add the current transcript to the contents of our Note.
  // There is a weird bug on mobile, where everything is repeated twice.
  // There is no official solution so far so we have to handle an edge case.
  var mobileRepeatBug =
    current == 1 && transcript == event.results[0][0].transcript;

  if (!mobileRepeatBug) {
    output.push(transcript);
    outputTextarea.textContent = output.toLocaleString();
  }
};

recognition.onstart = function() {
  // instructions.text(
  //   "Voice recognition activated. Try speaking into the microphone."
  // );
  console.log("Voice recognition activated. Try speaking into the microphone.");
};

recognition.onspeechend = function() {
  // instructions.text(
  //   "You were quiet for a while so voice recognition turned itself off."
  // );
  console.log(
    "You were quiet for a while so voice recognition turned itself off."
  );
};

recognition.onerror = function(event) {
  if (event.error == "no-speech") {
    console.log("No speech was detected. Try again.");
  }
};

// ------------------------------------------------------------- //

//------------------------end of speechRecognitionClass -----//

var witnessVoice;

async function startWitnessVoiceCapture() {
  witnessVoice = await navigator.mediaDevices.getUserMedia({
    video: false,
    audio: true
  });

  console.log("witnessVoice: " + witnessVoice);
}
// for witness stream capture
if (window.location.pathname == "/videoscreen") {
  window.onload = startWitnessVoiceCapture;

  const logout = document.getElementById("logout-link");
  logout.addEventListener("click", function() {
    witnessVoice.forEach(track => {
      track.stop();
    });
  });
}
const starter = document.querySelector("#starter");
const stopper = document.querySelector("#stopper");
const downloader = document.querySelector("#downloader");
const downloadtxt = document.querySelector("#downloadtxt");

// globally accessible
var stream;
var cameraStream;
var recorder;
var blob;
//var url;

starter.style.display = "block";
stopper.style.display = "none";
downloader.style.display = "none";
downloadtxt.style.display = "none";

var mediastreamconstraints = {
  video: {
    displaySurface: "browser", // monitor, window, application, browser
    logicalSurface: true,
    cursor: "always" // never, always,
  }
};

var constraints = {
  video: false,
  audio: true
};

//var deviceInfos = navigator.mediaDevices.enumerateDevices();
//console.log(deviceInfos);

// Capture screen
async function startCapture() {
  //console.log(navigator.mediaDevices.getSupportedConstraints());

  stream = await navigator.mediaDevices.getDisplayMedia(mediastreamconstraints);
  cameraStream = await navigator.mediaDevices.getUserMedia(constraints);
  recorder = new RecordRTCPromisesHandler(
    [stream, witnessVoice, cameraStream],
    {
      type: "video",
      mimeType: "video/webm",
      video: {
        width: 1920,
        height: 1080
      },
      frameInterval: 90
    }
  );
  recorder.startRecording();
}

// stop Capturing Screen
async function stopCapture() {
  await recorder.stopRecording();

  blob = await recorder.getBlob();
  console.log("blob: " + blob);

  [stream, witnessVoice, cameraStream].forEach(function(stream) {
    stream.getTracks().forEach(function(track) {
      track.stop();
    });
  });
}

// Create download links
// for video
function down() {
  RecordRTC.invokeSaveAsDialog(blob, "nicevideo.webm");
  console.log("state: " + recorder.getState());
  //stream.stop();
  recorder.destroy();
  recorder = null;
}

// for audio text
function downtxt() {
  console.log(output);
  let blob1 = new Blob(output, { type: "text/plain" });
  RecordRTC.invokeSaveAsDialog(blob1, "audiotext.txt");
  // let url1 = window.URL.createObjectURL(blob1);
  // output = [];

  // downloadtxt.addEventListener("click", () => {
  //   const a = document.createElement("a");
  //   a.style.display = "none";
  //   a.href = url1;
  //   a.download = "audiotext.txt";
  //   document.body.appendChild(a);
  //   a.click();
  //   setTimeout(() => {
  //     document.body.removeChild(a);
  //     window.URL.revokeObjectURL(url);
  //   }, 3000);
  // });
}

starter.addEventListener("click", () => {
  starter.style.display = "none";
  stopper.style.display = "block";
  downloader.style.display = "none";
  downloadtxt.style.display = "none";
  startCapture();
  recognition.start();
});

stopper.addEventListener("click", () => {
  starter.style.display = "none";
  stopper.style.display = "none";
  downloader.style.display = "block";
  downloadtxt.style.display = "block";
  stopCapture();
  recognition.stop();
  // Sync the text inside the text area with the noteContent variable.
  // outputTextarea.on("input", function() {
  //   output = outputTextarea.textContent;
  // });
});

downloader.addEventListener("click", () => {
  starter.style.display = "block";
  stopper.style.display = "none";
  downloader.style.display = "none";
  recognition.stop();
  down();
});

downloadtxt.addEventListener("click", () => {
  starter.style.display = "block";
  stopper.style.display = "none";
  downloadtxt.style.display = "none";
  downtxt();
});

//---------------------------screen recording part end ------------//
