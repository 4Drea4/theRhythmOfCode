let song;
let amplitude;
let flowField = [];
let resolution = 20;
let cols, rows;
let mouseParticles = [];
let isPlaying = false; // Track whether the animation and audio are active

function preload() {
  song = loadSound("Design.mp3");
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  amplitude = new p5.Amplitude();

  // Calculate the grid for the Perlin noise field
  cols = floor(width / resolution);
  rows = floor(height / resolution);

  // Initialize the flow field
  for (let i = 0; i < cols * rows; i++) {
    flowField[i] = createVector(0, 0);
  }

  noLoop(); // Pause the animation initially
}

function draw() {
  background(30, 30, 30, 20); // Semi-transparent background for trails
  noFill();

  // Get the amplitude level
  let level = amplitude.getLevel();
  let beatSensitivity = map(level, 0, 0.3, 0, 20); // Increase sensitivity based on amplitude
  let mouseInfluence = 50; // Radius of mouse influence

  // Generate Perlin noise field
  let yOff = 0;
  for (let y = 0; y < rows; y++) {
    let xOff = 0;
    for (let x = 0; x < cols; x++) {
      let index = x + y * cols;
      let angle = noise(xOff, yOff) * TWO_PI * beatSensitivity;

      // Intensify Perlin noise near the mouse
      let distance = dist(mouseX, mouseY, x * resolution, y * resolution);
      if (distance < mouseInfluence) {
        angle += QUARTER_PI; // Rotate the field more strongly near the mouse
      }

      flowField[index] = p5.Vector.fromAngle(angle);
      xOff += 0.1;
    }
    yOff += 0.1;
  }

  // Visualize the Perlin noise field
  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      let index = x + y * cols;
      let vector = flowField[index];
      let x1 = x * resolution;
      let y1 = y * resolution;

      // Add color intensity based on distance from the mouse
      let distance = dist(mouseX, mouseY, x1, y1);
      let intensity = map(distance, 0, mouseInfluence, 255, 50);
      stroke(255, intensity, intensity);

      push();
      translate(x1, y1);
      rotate(vector.heading());
      line(0, 0, resolution * 0.5, 0);
      pop();
    }
  }

  // Add mouse particles for a visual effect
  mouseParticles.push(new MouseParticle(mouseX, mouseY));

  for (let i = mouseParticles.length - 1; i >= 0; i--) {
    mouseParticles[i].update();
    mouseParticles[i].show();
    if (mouseParticles[i].isOffScreen()) {
      mouseParticles.splice(i, 1); // Remove particles that have faded out
    }
  }
}

function mousePressed() {
  // Allow AudioContext to start
  if (getAudioContext().state !== "running") {
    getAudioContext().resume();
  }

  // Toggle play/pause for the song and animation
  if (isPlaying) {
    song.pause();
    noLoop(); // Pause the animation
  } else {
    song.play();
    loop(); // Resume the animation
  }

  isPlaying = !isPlaying; // Toggle the state
}

class MouseParticle {
  constructor(x, y) {
    this.pos = createVector(x, y);
    this.vel = p5.Vector.random2D().mult(2); // Random direction for particles
    this.alpha = 255; // Opacity of the particle
  }

  update() {
    this.pos.add(this.vel);
    this.alpha -= 5; // Gradually fade out the particle
  }

  show() {
    noStroke();
    fill(255, 100, 150, this.alpha); // Soft pink color for particles
    ellipse(this.pos.x, this.pos.y, 10); // Draw particle as a circle
  }

  isOffScreen() {
    return this.alpha <= 0; // Check if the particle is fully faded
  }
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);

  // Recalculate the grid for the Perlin noise field
  cols = floor(width / resolution);
  rows = floor(height / resolution);
  flowField = [];
  for (let i = 0; i < cols * rows; i++) {
    flowField[i] = createVector(0, 0);
  }
}
