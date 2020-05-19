let Peer = require("simple-peer");
let socket = io();
//const SpeechRecognitionApi = require("./speech");
const video = document.querySelector("#smallVideoTag");
let client = {};
let constraints = {
  video: {
    width: { min: 640, ideal: 1280, max: 1920 },
    height: { min: 480, ideal: 720, max: 1080 },
  },
  audio: true,
};

const starter = document.querySelector("#starter");
const stopper = document.querySelector("#stopper");
const downloader = document.querySelector("#downloader");

//get the stream
// navigator.mediaDevices
//   .getUserMedia()
//   .then(stream => {
//     socket.emit("NewClient");
//     video.srcObject = stream;
//     video.play();
navigator.mediaDevices
  .getUserMedia(constraints)
  .then(function (stream) {
    socket.emit("NewClient");
    //connect the media stream to the first video element
    let video = document.querySelector("video");
    if (video) {
      video.srcObject = stream;
    } else {
      //old version
      video.src = window.URL.createObjectURL(stream);
    }
    video.onloadedmetadata = function (ev) {
      //show in the video element what is being captured by the webcam
      video.play();
    };
    //used to initialize a peer
    function InitPeer(type) {
      let peer = new Peer({
        initiator: type == "init" ? true : false,
        stream: stream,
        trickle: false,
      });

      peer.on("stream", function (stream) {
        CreateVideo(stream);
        //mediaDownloader(stream);
      });

      peer.on("close", function () {
        document.getElementById("mainVideoTag").remove();
        peer.destroy();
      });

      return peer;
    }

    function RemovePeer() {
      document.getElementById("mainVideoTag").remove();
    }

    //for peer of type init
    function MakePeer() {
      client.gotAnswer = false;
      let peer = InitPeer("init");
      peer.on("signal", function (data) {
        if (!client.gotAnswer) {
          socket.emit("Offer", data);
        }
      });
      client.peer = peer;
    }
    //for peer type notinit
    function FrontAnswer(offer) {
      let peer = InitPeer("notInit");
      peer.on("signal", (data) => {
        socket.emit("Answer", data);
      });
      peer.signal(offer);
    }

    function SignalAnswer(answer) {
      client.gotAnswer = true;
      let peer = client.peer;
      peer.signal(answer);
    }

    function CreateVideo(stream) {
      let video = document.createElement("video");
      video.id = "mainVideoTag";
      video.srcObject = stream;
      video.class = "embed-responsive-item";
      video.setAttribute("controls", "");
      document.querySelector("#peerDiv").appendChild(video);
      video.play();
    }

    function SessionActive() {
      document.write("Session Active. Please come back later.");
      var url = "http://localhost:3000/logout";
      document.write("Redirecting to the Homepage in 3 seconds...");
      setTimeout(function () {
        window.location = url;
      }, 3000);
    }

    socket.on("BackOffer", FrontAnswer);
    socket.on("BackAnswer", SignalAnswer);
    socket.on("SessionActive", SessionActive);
    socket.on("CreatePeer", MakePeer);
    socket.on("RemovePeer", RemovePeer);
  })
  .catch((err) => console.log(err));
