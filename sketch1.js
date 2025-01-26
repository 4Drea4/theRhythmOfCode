let song;
let amplitude;
let flowField = [];
let resolution = 20;
let cols, rows;
let isPlaying = false;
let playbackRate = 1; // Default playback speed

function preload() {
  song = loadSound("Design.mp3");
}

function setup() {
  let canvasSize = min(windowWidth, windowHeight) * 0.7;
  let canvas = createCanvas(canvasSize, canvasSize);
  canvas.parent("canvas-container");

  amplitude = new p5.Amplitude();

  cols = floor(width / resolution);
  rows = floor(height / resolution);

  for (let i = 0; i < cols * rows; i++) {
    flowField[i] = createVector(0, 0);
  }

  noLoop();

  setupControls(); // Add event listeners for controls
}

function draw() {
  background(30, 30, 30, 20);
  noFill();

  let level = amplitude.getLevel();
  let beatSensitivity = map(level, 0, 0.3, 0, 20);

  let yOff = 0;
  for (let y = 0; y < rows; y++) {
    let xOff = 0;
    for (let x = 0; x < cols; x++) {
      let index = x + y * cols;
      let angle = noise(xOff, yOff) * TWO_PI * beatSensitivity;

      flowField[index] = p5.Vector.fromAngle(angle);
      xOff += 0.1;
    }
    yOff += 0.1;
  }

  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      let index = x + y * cols;
      let vector = flowField[index];
      let x1 = x * resolution;
      let y1 = y * resolution;

      stroke(255, 150);
      push();
      translate(x1, y1);
      rotate(vector.heading());
      line(0, 0, resolution * 0.5, 0);
      pop();
    }
  }
}

function setupControls() {
  document.getElementById("play-pause").addEventListener("click", () => {
    if (isPlaying) {
      song.pause();
      noLoop();
      document.getElementById("play-pause").innerText = "▶️";
    } else {
      song.play();
      loop();
      document.getElementById("play-pause").innerText = "⏸️";
    }
    isPlaying = !isPlaying;
  });

  document.getElementById("prev").addEventListener("click", () => {
    playbackRate = max(0.5, playbackRate - 0.1);
    song.rate(playbackRate);
  });

  document.getElementById("next").addEventListener("click", () => {
    playbackRate = min(2.0, playbackRate + 0.1);
    song.rate(playbackRate);
  });

  document.getElementById("shuffle").addEventListener("click", () => {
    resolution = random(10, 30);
  });
}

function windowResized() {
  let canvasSize = min(windowWidth, windowHeight) * 0.7;
  resizeCanvas(canvasSize, canvasSize);

  cols = floor(width / resolution);
  rows = floor(height / resolution);
  flowField = [];
  for (let i = 0; i < cols * rows; i++) {
    flowField[i] = createVector(0, 0);
  }
}
