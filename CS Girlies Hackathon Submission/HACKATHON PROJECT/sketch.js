let video;

function setup() {
  let canvas = createCanvas(320, 240);
  canvas.parent('videoCanvas');
  video = createCapture(VIDEO);
  video.size(320, 240);
  video.hide();
}

function draw() {
  image(video, 0, 0);
}