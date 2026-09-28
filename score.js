
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

class Score {
  constructor(path, synthesis) {
    this.obj = null;
    this.synthesis = synthesis;
    this.playing = false;
    loadBytes(path, (bytes) => {
      this.obj = MidiParser.parse(bytes);
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