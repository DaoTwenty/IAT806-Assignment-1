// piano
let pianoSound;
let midi;
let triggered_note = -1;
let triggered_white = false;
let playback_notes = [];
let playback_time_end = [];
let piano_triggers = [];
let bg;

// ants
let speed = 2;
let x = 300;
let y = 300;
let ants = [];
let ants_indices_to_remove = [];

// obstacles
let circle_obstacles = [
  [43, 257, 72],
  [300, 224, 58],
  [552, 242, 83],
  [502, 342, 40]
]
let rect_obstacles = [
  [73, 26, 456, 144]
]

// moving paw
let moving_paw;

async function setup() {
  bg = await loadImage('assets/background.png');
  pianoSound = new PianoSynthesis();
  await pianoSound.ready;
  midi = await new Score("assets/Maple-Leaf-Rag.mid", pianoSound);
  createCanvas(600, 400);
  angleMode(DEGREES);
  moving_paw = new MovingPaw(-100, 50, -30, 50, 1);
}

function draw() {
  background(bg);

  moving_paw.loop();

  piano_triggers = [];
  piano(100 , 100, 500, 100, 60, 6, 30, piano_triggers);
  stroke("#000000");
  textSize(20);
  midi.loop();
  
  for (let i = 0; i < ants.length; i++) {
    ants[i].loop();
    if (ants[i].done == true) {
      ants_indices_to_remove.push(i);
    }
  }
  for (let j = 0; j < ants_indices_to_remove.length; j++) {
    // remove if done
    ants.splice(ants_indices_to_remove[j], 1)
  }
  ants_indices_to_remove = [];
}

function mousePressed() {
  note();

  for (let i = 0; i < ants.length; i++) {
    ants[i].mousePressed(event);
  }
}

function mouseReleased() {
  if (triggered_note > -1) {
    pianoSound.stop(triggered_note);
  }
  triggered_note = -1;
  triggered_white = false;
}

function keyPressed() {
  if (key === 'p') {
    if (midi.playing) {
      midi.stop()
    } else {
      midi.play()
    }
  }

  if (key == "a") {
    ants.push(new Ant(x, y, speed));
  }
}