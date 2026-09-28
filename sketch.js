let pianoSound;
let midi;
let triggered_note = -1;
let triggered_white = false;
let playback_notes = [];
let playback_time_end = [];
let bg;

function removeAt(arr, index){ 
    if(index>arr.length-1 || index<0) return arr;
    for(let i=0; i<arr.length; i++) {
        if(i>=index) {
            arr[i] = arr[i+1];
        }
    }
    arr.pop();
    return arr;  
}

function preload() {
  pianoSound = new PianoSynthesis();
  midi = new Score("./assets/Maple-Leaf-Rag.mid", pianoSound);
}

function setup() {
  bg = loadImage('assets/background.png');
  createCanvas(600, 400);
  angleMode(DEGREES);
}

class Score {
  constructor(path, synthesis) {
    this.obj = null;
    this.synthesis = synthesis;
    this.playing = false;
    loadBytes(path, (file) => {
      this.obj = MidiParser.parse(file.bytes);
      this.tpq = this.obj.timeDivision;
      this.mpqn = 500000;
      this.parse_success = this.parse();
      this.mpt = this.mpqn / this.tpq;
    });
  }

  play() {
    if (this.parse_success) {
      this.start_time = millis()
      this.note_id = 0;
      this.playing = true;
    }
  }

  stop() {
    this.playing = false;
  }

  pause() {
    this.playing = false;
    this.pause_time = millis();
  }

  resume() {
    this.playing = true;
    this.start_time = this.start_time + millis() - this.pause_time
  }

  loop() {
    let current_time = millis();
    for (let i = 0; i < playback_notes.length; i++){
      if (playback_time_end[i] <= current_time) {
        removeAt(playback_notes, i);
        removeAt(playback_time_end, i);
      }
    }
    if (this.playing) {
      let time = current_time - this.start_time;
      while (this.note_id < this.notes.length && this.notes[this.note_id][2] <= time ) {
        this.synthesis.play_full(this.notes[this.note_id][0], this.notes[this.note_id][1], this.notes[this.note_id][3]);
        playback_notes.push(this.notes[this.note_id][0]);
        playback_time_end.push(current_time + this.notes[this.note_id][3]);
        this.note_id = this.note_id + 1;
      }
    }
  }

  parse() {
    let n_tracks = this.obj.track.length;
    let piano_track = -1;
    let first_track_with_notes = -1;
    for (let t = 0; t < n_tracks; t++) {
      let n_events = this.obj.track[t].event.length;
      for (let e = 0; e < n_events; e++) {
        if (first_track_with_notes == -1 && this.obj.track[t].event[e].type == 9) {
          first_track_with_notes = t;
          continue;
        }
        if (this.obj.track[t].event[e].type == 255 && this.obj.track[t].event[e].metaType == 81) {
          this.mpqn = this.obj.track[t].event[e].data;
          this.mpt = this.mpqn / (this.tpq * 1000);
        }
        if (this.obj.track[t].event[e].type == 12 && this.obj.track[t].event[e].data[0] == 0) {
          piano_track = t;
          break;
        }
      }
    }

    if (piano_track > -1) {
      this.build_notes(piano_track);
      return true;
    } else if (first_track_with_notes > -1) {
      this.build_notes(first_track_with_notes);
      return true;
    }
    console.log("No viable tracks.")
    return false;
  }

  build_notes(t) {
    this.notes = [];
    let onsets = {};
    for (let p = 0; p < 128; p++) {
      onsets[p] = null;
    }
    let n_events = this.obj.track[t].event.length;
    let track = this.obj.track[t];
    let pitch;
    let vel;
    let time = 0;
    for (let e = 0; e < n_events; e++) {
      if (track.event[e].type == 8 || track.event[e].type == 9) {
        pitch = track.event[e].data[0];
        vel = track.event[e].data[1];
        time = time + track.event[e].deltaTime * this.mpt;
        if (vel > 0) {
          // if onset
          if (onsets[pitch] == null) {
            // start note playing
            onsets[pitch] = [time, vel]
          } else {
            // if note already playing, end it and start a new
            this.notes.push([pitch, onsets[pitch][1], onsets[pitch][0], time - onsets[pitch][0]])
            onsets[pitch] = [time, vel];
          }
        } else if (vel == 0) {
          // if offset
          if (onsets[pitch] != null) {
            this.notes.push([pitch, onsets[pitch][1], onsets[pitch][0], time - onsets[pitch][0]])
            onsets[pitch] = null;
          }
        }
        
      }
    }
  }
}

class PianoSynthesis {
  constructor() {
    this.context = new AudioContext();
    this.grand_piano = SplendidGrandPiano(this.context, { decayTime: 0.5 });
    this.playing_notes = {}
    for (let i = 0; i < 128; i++) {
      this.playing_notes[i] = null
    }
  }

  play(note, vel) {
    if (this.playing_notes[note]) {
      this.stop(note);
    }
    this.playing_notes[note] = this.grand_piano.start({ note: note, velocity: vel });
  }

  play_full(note, vel, dur) {
    if (this.playing_notes[note]) {
      this.stop(note);
    }
    this.playing_notes[note] = this.grand_piano.start({ note: note, velocity: vel, duration: dur});
  }

  stop(note) {
    if (this.playing_notes[note]) {
      this.playing_notes[note]();
      this.playing_notes[note] = null;
    }
  }
}

function octave(x_s, y_s, x_e, y_e, h, f_note, triggers) {
  let l_x = x_e - x_s;
  let l_y = y_e - y_s;
  let l = sqrt(l_x**2 + l_y**2);
  let w_pitch = [0,2,4,5,7,9,11];
  let current_pitch;
  for (let w = 0; w < 7; w++) {
    fill("#ffffff");
    current_pitch = f_note + w_pitch[w];
    if (triggered_note == current_pitch || playback_notes.includes(current_pitch)) {
      fill("#a6a6a6");
    }
    stroke("#000000");
    rect(x_s + l_x * w/7, y_s + l_y * w/7, l/7, h);
    triggers.push([
      x_s + l_x * w/7,
      y_s + l_y * w/7,
      x_s + l_x * w/7 + l/7,
      y_s + l_y * w/7 + h,
      current_pitch,
      true
    ]);
  }
  let blacks = [0.7, 1.7, 3.7, 4.7, 5.7];
  let b_pitch = [1,3,6,8,10];
  let w_b = 0.6 * l/7;
  for (let b = 0; b < 5; b++) {
    fill("#000000");
    stroke("#000000");
    current_pitch = f_note + b_pitch[b];
    if (triggered_note == current_pitch || playback_notes.includes(current_pitch)) {
      fill("#a6a6a6");
      stroke("#a6a6a6");
    }
    rect(x_s + l_x * blacks[b]/7, y_s + l_y * blacks[b]/7, w_b, h * 0.6);
    triggers.push([
      x_s + l_x * blacks[b]/7,
      y_s + l_y * blacks[b]/7,
      x_s + w_b + l_x * blacks[b]/7,
      y_s + l_y * blacks[b]/7 + h * 0.6,
      current_pitch,
      false
    ]);
  }
}

function piano(x_s, y_s, x_e, y_e, h, o, f_note, triggers) {
  let l_x = x_e - x_s;
  let l_y = y_e - y_s;
  for (let n_o = 0; n_o < o; n_o++) {
    let x_os = x_s + n_o/o * l_x;
    let y_os = y_s + n_o/o * l_y;
    let x_oe = x_os + l_x/o;
    let y_oe = y_os + l_y/o;
    octave(x_os, y_os, x_oe, y_oe, h, f_note + n_o * 12, triggers);
  }
}

let piano_triggers = [];

function draw() {
  background(bg);
  piano_triggers = [];
  piano(100 , 100, 500, 100, 60, 6, 30, piano_triggers);
  stroke("#000000");
  textSize(20);
  midi.loop();
  ant(50, 50, 0)
}

function mousePressed() {
  note();
}

function mouseReleased() {
  if (triggered_note > -1) {
    pianoSound.stop(triggered_note);
  }
  triggered_note = -1;
  triggered_white = false;
}

function note() {
  for (let t = 0; t < piano_triggers.length; t++) {
    let x_s = piano_triggers[t][0];
    let y_s = piano_triggers[t][1];
    let x_e = piano_triggers[t][2];
    let y_e = piano_triggers[t][3];
    if (mouseX <= x_e && mouseX >= x_s && mouseY <= y_e && mouseY >= y_s) {
      if (triggered_note == -1 || triggered_white == true) {
        triggered_note = piano_triggers[t][4];
        triggered_white =  piano_triggers[t][5];
        if (triggered_white == false) {
          break;
        }
      }
    }
  }
  if (triggered_note > -1) {
    pianoSound.play(triggered_note, 100);
  }
}

function keyPressed() {
  if (key === 'p') {
    if (midi.playing) {
      midi.stop()
    } else {
      midi.play()
    }
  }
}

function ant(x, y, angle) {
  rotate(angle);
  ellipse(x, y, 5, 10);
  ellipse(x, y - 20, 10, 20);
  ellipse(x, y + 20, 10, 10);
}
