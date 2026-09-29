// piano
let pianoSound;
let midi;
let triggered_note = -1;
let triggered_white = false;
let playback_notes = [];
let playback_time_end = [];
let piano_triggers = [];

// pianist
let pianist;

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

// cat video
let video;
let flash_c1;
let flash_c2;
let flash_color;
let video_playing = false;

// game state
let bg;
let game_ready = false;

async function async_setup(callback) {
  bg = await loadImage('assets/background.png');
  pianoSound = new PianoSynthesis();
  await pianoSound.ready;
  midi = await new Score("assets/Maple-Leaf-Rag.mid", pianoSound);
  video = await createVideo("assets/cat_video.mp4");
  pianist = new AngryPianist(3, 90);
  await pianist.setup();
  video.hide();
  video.volume(1);
  video.onended(handleVideoEnd);
  callback()
}

async function setup() {
  createCanvas(600, 400);
  angleMode(DEGREES);
  moving_paw = new MovingPaw(-100, 50, -30, 50, 1);
  flash_c1 = color("#1123ae");
  flash_c2 = color("#d044bd");
  async_setup(() => {
    game_ready = true;
  });
}

function draw() {
  if (!game_ready) {
    draw_loading();
  } else {
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

    if (video_playing) {
      let flash_amt = (sin(frameCount * 10) + 1) / 2;
      let flash_lerp = (sin(frameCount * 3) + 1) / 2;
      let flash_alpha = flash_amt * 255;
      flash_color = lerpColor(flash_c1, flash_c2, flash_lerp);
      let flash_r = red(flash_color);
      let flash_g = green(flash_color);
      let flash_b = blue(flash_color);

      video.loadPixels();
      for (var i = 0; i < video.width; i++) {
        for (let j = 0; j < video.height; j++) {
          let index = (i + j * video.width) * 4;
          // check green value
          if (video.pixels[index + 1] > 170 && video.pixels[index] < 110 && video.pixels[index + 2] < 100) {
            // set alpha to 0
            video.pixels[index + 3] = flash_alpha;
            video.pixels[index] = flash_r;
            video.pixels[index + 1] = flash_g;
            video.pixels[index + 2] = flash_b;
          }
        }
      }
      video.updatePixels();
      image(video, 0, 0, 600, 400);
    }

    pianist.loop();

  }
}

function mousePressed() {
  if (video_playing == false) {
    note();
    // interrupt the pianist
    if (triggered_note > -1 && midi.playing) {
      if (pianist.interrupt(() => {
          midi.resume();
        })) {
        midi.pause();
      }
    } 

    for (let i = 0; i < ants.length; i++) {
      ants[i].mousePressed(event);
    }
  }
}

function mouseClicked(event) {
  if (video_playing == false && moving_paw.is_clicked()) {
    // trigger dancing cat
    video_playing = true;
    video.play();
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

  if (video_playing == true) {
    if (key == "s") {
      video.stop();
      video_playing = false;
    }
  }
}

function handleVideoEnd() {
  video_playing = false;
}