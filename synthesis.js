class PianoSynthesis {
  constructor() {
    this.context = new AudioContext();
    this.grand_piano = SplendidGrandPiano(this.context, { decayTime: 0.5 });
    this.ready = this.grand_piano.ready;
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