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
    this.speechApi.onresult = event => {
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
// window.onload = function() {
//   var speech = new SpeechRecognitionApi({
//     output: document.querySelector(".output")
//   });

//   var btnStart = document.querySelector(".btn-start");
//   var btnStop = document.querySelector(".btn-end");

//   btnStart.addEventListener("click", () => {
//     speech.init();
//   });
//   btnStop.addEventListener("click", () => {
//     speech.stop();
//   });
// };
module.exports = SpeechRecognitionApi;
