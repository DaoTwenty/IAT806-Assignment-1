let splat_frame_lifetime = 180;
const n_splat_points = 30;
const base_radius = 20;
const r_min = 0.2;
const r_max = 1.8;
let splat;
let splat_detail = 10;
let deviation_std = 10;

function randomDirection() {
  return random(0, 360);
}

function randomDeviation(angle) {
  return randomGaussian(angle, deviation_std) % 360;
}

class Splat {

  constructor(x_s, y_s) {
    this.x = x_s;
    this.y = y_s;
    this.vertices = []
    let x_vertex;
    let y_vertex;
    let angle_vertex;
    let radius;
    for (let vertex_idx=0; vertex_idx < n_splat_points; vertex_idx++) {
      angle_vertex = vertex_idx * 360 / n_splat_points;
      radius = base_radius * random(0.2, 1,8);
      //radius = base_radius * (r_min + (r_max - r_min) * noise(millis() + cos(angle_vertex) * splat_detail, millis() + sin(angle_vertex) * splat_detail));
      x_vertex = this.x + radius * cos(angle_vertex);
      y_vertex = this.y + radius * sin(angle_vertex);
      this.vertices.push([x_vertex, y_vertex]);
    }
  }

  loop() {
    beginShape();
    for (let i=0; i < n_splat_points; i++) {
      splineVertex(this.vertices[i][0], this.vertices[i][1]);
    }
    endShape(CLOSE);
  }

}

class Ant {

  constructor(start_x, start_y, speed) {
    this.x = start_x;
    this.y = start_y;
    this.speed = speed;
    this.dir = randomDirection();
    this.killed = false;
    this.splat = null;
    this.kill_frame = -1;
    this.done = false;
    this.alpha = "ff";
  }

  loop() {
    if (this.killed == false) {
      this.dir = randomDeviation(this.dir);
      this.x = this.x + this.speed * cos(this.dir);
      this.y = this.y + this.speed * sin(this.dir);
      // TODO: fix the angle rendering
      this.ant();
      this.validate();
    } else {
      // draw splat
      noStroke();
      // linear decay of alpha
      this.alpha = int(255 * max(1.0 - (frameCount - this.kill_frame) / (splat_frame_lifetime),0.0)).toString(16); 
      if (this.alpha.length == 1) {
        this.alpha = "0" + this.alpha;
      }
      if (this.alpha == "00") {
        this.done = true;
      }
      fill("#b41919" + this.alpha);
      this.splat.loop();
    }
  }

  validate() {
    // Boundaries
    if (this.x >= width || this.x < 0) {
      // reverse x axis of angle
      this.dir = 180 - this.dir;
    }
    if (this.y >= height || this.y < 0) {
      // reverse y axis of angle
      this.dir = -this.dir;
    }

    // obstacle detection
    let obs;
    for (let o=0; o < circle_obstacles.length; o++) {
      obs = circle_obstacles[o];
      if (sqrt((this.x - obs[0])**2 + (this.y - obs[1])**2) < obs[2]/2) {
        // dectected insid circle obstacle, reverse direction
        this.dir = 180 + this.dir;
      }
    }
    
    for (let o=0; o < rect_obstacles.length; o++) {
      obs = rect_obstacles[o];
      if (this.x > obs[0] && this.y > obs[1] && this.x < obs[0] + obs[2] && this.y < obs[1] + obs[3]) {
        // dectected insid circle obstacle, reverse direction
        // detect which of the 4 sides we crossed
        // 0 -> left, 1 -> bottom, 2 -> right, 3 -> top
        let side_min = 0;
        let min_distance = this.x - obs[0];
        if (abs(this.y - obs[1] + obs[3]) < min_distance) {
          side_min = 1;
        }
        if (abs(this.x - obs[0] + obs[2]) < min_distance) {
          side_min = 2;
        }
        if (abs(this.y - obs[1]) < min_distance) {
          side_min = 3;
        }
        if (side_min == 0 || side_min == 2) {
          //crossed through the side, flip x axis of direction
          this.dir = 180 - this.dir;
        }
        if (side_min == 1 || side_min == 3) {
          //crossed through the top or bottom, flip y axis of direction
          this.dir = -this.dir;
        }
      }
    }
    
  }

  ant() {
    push();
    translate(this.x, this.y);
    rotate(90+this.dir);
    //body
    fill("#000000");
    stroke("#000000");
    ellipse(0, 0, 5, 7);
    ellipse(0, 8, 7, 10);
    circle(0, -7, 8);

    // right legs
    line(2, 0, 6, -3);
    line(6, -3, 10, -10);
    line(2, 0, 10, 0);
    line(2, 0, 6, 3);
    line(6, 3, 10, 10);

    // left legs
    line(-2, 0, -6, -3);
    line(-6, -3, -10, 0 - 10);
    line(-2, 0, -10, 0);
    line(-2, 0, -6, 3);
    line(-6, 3, -10, 10);

    //antenna
    line(1, -6, 8, -16);
    line(-1, -6, -8, -16);

    pop();
  }
  
  mousePressed(event) {
    if (this.killed == false && sqrt((this.x - mouseX)**2 + (this.y - mouseY)**2) < 20) {
      this.killed = true;
      this.kill_frame = frameCount;
      this.splat = new Splat(this.x,this.y);
    }
  }

}