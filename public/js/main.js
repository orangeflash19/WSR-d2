let Peer = require("simple-peer");
let socket = io();
const video = document.querySelector("#smallVideoTag");
let client = {};
let constraints = {
  video: {
    width: 1920,
    height: 1080,
    aspectRatio: 1.777777778
  },
  audio: true
};
//get the stream
navigator.mediaDevices
  .getUserMedia(constraints)
  .then(stream => {
    socket.emit("NewClient");
    video.srcObject = stream;
    video.play();
    //used to initialize a peer
    function InitPeer(type) {
      let peer = new Peer({
        initiator: type == "init" ? true : false,
        stream: stream,
        trickle: false
      });

      peer.on("stream", function(stream) {
        CreateVideo(stream);
      });

      peer.on("close", function() {
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
      peer.on("signal", function(data) {
        if (!client.gotAnswer) {
          socket.emit("Offer", data);
        }
      });
      client.peer = peer;
    }
    //for peer type notinit
    function FrontAnswer(offer) {
      let peer = InitPeer("notInit");
      peer.on("signal", data => {
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
      document.querySelector("#peerDiv").appendChild(video);
      video.play();
    }

    function SessionActive() {
      document.write("Session Active. Please come back later.");
      var url = "http://localhost:3000/logout";
      document.write("Redirecting to the Homepage in 3 seconds...");
      setTimeout(function() {
        window.location = url;
      }, 3000);
    }

    socket.on("BackOffer", FrontAnswer);
    socket.on("BackAnswer", SignalAnswer);
    socket.on("SessionActive", SessionActive);
    socket.on("CreatePeer", MakePeer);
    socket.on("RemovePeer", RemovePeer);
  })
  .catch(err => console.log(err));
