let song;
let amplitude;
let particles = [];
let isPlaying = false; // Track if music/animation is playing
let playbackRate = 1; // Default playback speed

function preload() {
  song = loadSound("Familiar.mp3");
}

function setup() {
  let canvasWidth = windowWidth * 0.7;
  let canvasHeight = windowHeight * 0.7;
  let canvas = createCanvas(canvasWidth, canvasHeight);
  canvas.parent("canvas-container");

  amplitude = new p5.Amplitude();

  for (let i = 0; i < 300; i++) {
    particles.push(new Particle(random(width), random(height)));
  }

  noLoop();

  setupControls(); // Add event listeners for controls
}

function draw() {
  background("#1E2019");

  let level = amplitude.getLevel();
  let wind = map(level, 0, 0.3, -1, 1);

  for (let p of particles) {
    let isMouseNearby = dist(mouseX, mouseY, p.pos.x, p.pos.y) < 100;

    if (isMouseNearby) {
      p.applyMouseForce();
    } else {
      p.applyForce(wind, level);
    }

    p.update();
    p.show();
  }
}

function windowResized() {
  let canvasWidth = windowWidth * 0.7;
  let canvasHeight = windowHeight * 0.7;
  resizeCanvas(canvasWidth, canvasHeight);

  particles = [];
  for (let i = 0; i < 300; i++) {
    particles.push(new Particle(random(width), random(height)));
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
    particles.forEach((p) => (p.color = color(random(255), random(255), random(255))));
  });
}

class Particle {
  constructor(x, y) {
    this.pos = createVector(x, y);
    this.vel = p5.Vector.random2D();
    this.acc = createVector(0, 0);
    this.size = random(4, 8);
    this.color = color(150, 200, 255);
  }

  applyForce(wind, level) {
    let soundForce = createVector(random(-wind * 5, wind * 5), random(-level * 5, level * 5));
    this.acc.add(soundForce);
  }

  applyMouseForce() {
    let mouse = createVector(mouseX, mouseY);
    let force = p5.Vector.sub(mouse, this.pos);
    let distance = constrain(force.mag(), 5, 50);
    force.setMag(5 / distance);
    this.acc.add(force);
  }

  update() {
    this.vel.add(this.acc);
    this.vel.limit(2);
    this.pos.add(this.vel);
    this.acc.mult(0);

    if (this.pos.x > width) this.pos.x = 0;
    if (this.pos.x < 0) this.pos.x = width;
    if (this.pos.y > height) this.pos.y = 0;
    if (this.pos.y < 0) this.pos.y = height;
  }

  show() {
    noStroke();
    fill(this.color);
    ellipse(this.pos.x, this.pos.y, this.size + amplitude.getLevel() * 50);
  }
}
