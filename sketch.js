let song;
let amplitude;
let particles = [];

function preload() {
  song = loadSound("Familiar.mp3");
}

function setup() {
  createCanvas(windowWidth, windowHeight); // Fullscreen canvas
  song.play();
  amplitude = new p5.Amplitude();

  // Create an initial swarm of particles across the full screen
  for (let i = 0; i < 300; i++) {
    particles.push(new Particle(random(width), random(height)));
  }
}

function draw() {
  background('#1E2019');

  let level = amplitude.getLevel(); // Get volume level
  let wind = map(level, 0, 0.3, -1, 1); // Create "wind" from volume

  for (let p of particles) {
    // Check if the particle is near the mouse
    let isMouseNearby = dist(mouseX, mouseY, p.pos.x, p.pos.y) < 100;

    if (isMouseNearby) {
      // Interact with the mouse
      p.applyMouseForce();
    } else {
      // Default behavior: respond to sound
      p.applyForce(wind, level);
    }

    p.update();
    p.show();
  }
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight); // Adjust canvas on window resize

  // Ensure particles span the new canvas size
  let additionalParticles = max(0, 300 - particles.length); // Maintain 300 particles
  for (let i = 0; i < additionalParticles; i++) {
    particles.push(new Particle(random(width), random(height)));
  }
}

// Particle class
class Particle {
  constructor(x, y) {
    this.pos = createVector(x, y);
    this.vel = p5.Vector.random2D();
    this.acc = createVector(0, 0);
    this.size = random(4, 8);
  }

  applyForce(wind, level) {
    // Amplified "dancing" effect based on sound
    let soundForce = createVector(
      random(-wind * 5, wind * 5), // Amplify wind effect
      random(-level * 5, level * 5) // Amplify level effect
    );
    this.acc.add(soundForce);
  }

  applyMouseForce() {
    // Particles are attracted to the mouse
    let mouse = createVector(mouseX, mouseY);
    let force = p5.Vector.sub(mouse, this.pos); // Direction toward the mouse
    let distance = force.mag(); // Distance to the mouse
    distance = constrain(distance, 5, 50); // Limit the effect range
    force.setMag(5 / distance); // Strength of the attraction
    this.acc.add(force);
  }

  update() {
    this.vel.add(this.acc);
    this.vel.limit(2); // Limit speed
    this.pos.add(this.vel);
    this.acc.mult(0);

    // Wrap around edges
    if (this.pos.x > width) this.pos.x = 0;
    if (this.pos.x < 0) this.pos.x = width;
    if (this.pos.y > height) this.pos.y = 0;
    if (this.pos.y < 0) this.pos.y = height;
  }

  show() {
    noStroke();
    // Change color based on interaction
    if (dist(mouseX, mouseY, this.pos.x, this.pos.y) < 100) {
      fill('#DD7596'); // Red for interaction
    } else {
      fill('#235789'); // Blue for default
    }

    // Dynamically change size based on amplitude
    let dynamicSize = this.size + amplitude.getLevel() * 50; // Reactive size
    ellipse(this.pos.x, this.pos.y, dynamicSize);
  }
}

function mousePressed() {
  // Allow AudioContext to start
  if (getAudioContext().state !== "running") {
    getAudioContext().resume();
  }

  // Play or pause the music
  if (song && song.isPlaying()) {
    song.pause();
  } else if (song) {
    song.play();
  }
}

