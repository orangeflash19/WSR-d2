//----------------------screen recording part start ------------//

var witnessVoice;

async function startWitnessVoiceCapture() {
  witnessVoice = await navigator.mediaDevices.getUserMedia({
    video: true,
    audio: true
  });

  console.log("witnessVoice: " + witnessVoice);
}
// for witness stream capture
if (window.location.pathname == "/witness/videocall") {
  window.onload = startWitnessVoiceCapture;

  const logout = document.getElementById("logout-link");
  logout.addEventListener("click", function() {
    witnessVoice.forEach(track => {
      track.stop();
    });
  });
}

if (window.location.pathname == "/admin/videopage") {
  const starter = document.querySelector("#starter");
  const stopper = document.querySelector("#stopper");
  const downloader = document.querySelector("#downloader");

  // globally accessible
  var stream;
  var cameraStream;
  var recorder;
  var blob;
  //var url;

  starter.style.display = "block";
  stopper.style.display = "none";
  downloader.style.display = "none";

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

    stream = await navigator.mediaDevices.getDisplayMedia(
      mediastreamconstraints
    );
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
}
//---------------------------screen recording part end ------------//
