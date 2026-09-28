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