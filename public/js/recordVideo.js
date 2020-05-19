//----------------------screen recording part start ------------//
//const adapter = require("webrtc-adapter");
//const RecordRTC = require("recordrtc");
const starter = document.querySelector("#starter");
const stopper = document.querySelector("#stopper");
const downloader = document.querySelector("#downloader");

// globally accessible
var courtstream;
var witstream;
var recorder;
var blob;
//var url;

starter.style.display = "block";
stopper.style.display = "none";
downloader.style.display = "none";

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
}

// stop Capturing Screen
async function stopCapture() {
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
  //const a = document.createElement("a");
  // a.style.display = "none";
  // a.href = url;
  // a.download = "video.webm";
  // document.body.appendChild(a);
  // a.click();
  // setTimeout(() => {
  //   document.body.removeChild(a);
  //   URL.revokeObjectURL(url);
  // }, 3000);
}

starter.addEventListener("click", () => {
  starter.style.display = "none";
  stopper.style.display = "block";
  downloader.style.display = "none";
  startCapture();
});

stopper.addEventListener("click", () => {
  starter.style.display = "none";
  stopper.style.display = "none";
  downloader.style.display = "block";
  stopCapture();
});

downloader.addEventListener("click", () => {
  starter.style.display = "block";
  stopper.style.display = "none";
  downloader.style.display = "none";
  down();
});

//---------------------------screen recording part end ------------//
