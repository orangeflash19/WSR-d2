//----------------------screen recording part start ------------//

// ---------------- speechRecognitionClass ------------------//
class SpeechRecognitionApi {
  constructor(options) {
    const speechToText =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    this.speechApi = new speechToText();
    this.speechApi.continuous = true;
    this.speechApi.interimResult = false;
    this.output = options.output
      ? options.output
      : document.createElement("div");
    this.speechApi.onresult = (event) => {
      var resultIndex = event.resultIndex;
      var transcript = event.results[resultIndex][0].transcript;
      this.output.textContent += transcript;
    };
  }
  init() {
    this.speechApi.start();
  }
  stop() {
    this.speechApi.stop();
  }
}

//------------------------end of speechRecognitionClass -----//

//const adapter = require("webrtc-adapter");
//const RecordRTC = require("recordrtc");
const starter = document.querySelector("#starter");
const stopper = document.querySelector("#stopper");
const downloader = document.querySelector("#downloader");
const downloadtxt = document.querySelector("#downloadtxt");

// globally accessible
var courtstream;
var witstream;
var recorder;
var blob;
//var url;

starter.style.display = "block";
stopper.style.display = "none";
downloader.style.display = "none";
downloadtxt.style.display = "none";

// var mediastreamconstraints = {
//   video: {
//     displaySurface: "browser", // monitor, window, application, browser
//     logicalSurface: true,
//     cursor: "always", // never, always,
//   },
// };

// var constraints = {
//   video: false,
//   audio: true,
// };

//var deviceInfos = navigator.mediaDevices.enumerateDevices();
//console.log(deviceInfos);
let output = [];
var speech = new SpeechRecognitionApi({
  output: document.querySelector("#outputTextArea"),
});
// Capture screen
async function startCapture() {
  //console.log(navigator.mediaDevices.getSupportedConstraints());

  var courtVideo = document.getElementById("smallVideoTag");
  var witVideo = document.getElementById("mainVideoTag");

  courtstream = courtVideo.srcObject;
  witstream = witVideo.srcObject;
  recorder = new RecordRTCPromisesHandler([courtstream, witstream], {
    type: "video",
    mimeType: "video/webm",
    video: {
      width: 1920,
      height: 1080,
    },
    frameInterval: 90,
  });

  recorder.startRecording();
  speech.init();
}

// stop Capturing Screen
async function stopCapture() {
  speech.stop();
  await recorder.stopRecording();
  blob = await recorder.getBlob();
  console.log("blob: " + blob);
  [courtstream, witstream].forEach(function (stream) {
    stream.getTracks().forEach(function (track) {
      track.stop();
    });
  });
}

// Create download link
function down() {
  RecordRTC.invokeSaveAsDialog(blob, "nicevideo.webm");
  console.log("state: " + recorder.getState());
  //stream.stop();
  recorder.destroy();
  recorder = null;
}

// for audio text
function downtxt() {
  output.push(document.querySelector("#outputTextArea").textContent);
  console.log(output);
  let blob1 = new Blob(output, { type: "text/plain" });
  RecordRTC.invokeSaveAsDialog(blob1, "audiotext.txt");
}

starter.addEventListener("click", () => {
  starter.style.display = "none";
  stopper.style.display = "block";
  downloader.style.display = "none";
  downloadtxt.style.display = "none";
  startCapture();
});

stopper.addEventListener("click", () => {
  starter.style.display = "none";
  stopper.style.display = "none";
  downloader.style.display = "block";
  downloadtxt.style.display = "block";
  stopCapture();
  // Sync the text inside the text area with the noteContent variable.
  // outputTextarea.on("input", function() {
  //   output = outputTextarea.textContent;
  // });
});

downloader.addEventListener("click", () => {
  starter.style.display = "block";
  stopper.style.display = "none";
  downloader.style.display = "none";
  down();
});

downloadtxt.addEventListener("click", () => {
  starter.style.display = "block";
  stopper.style.display = "none";
  downloadtxt.style.display = "none";
  downtxt();
});

//---------------------------screen recording part end ------------//
