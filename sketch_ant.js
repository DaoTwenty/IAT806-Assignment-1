let bg;
var speed = 2;
let x = 300;
let y = 300;
let deviation_std = 10;
let ant_killed = false;
let dir;
let circle_obstacles = [
  [43, 257, 72],
  [300, 224, 58],
  [552, 242, 83],
  [502, 342, 40]
]
let rect_obstacles = [
  [73, 26, 456, 144]
]

const n_splat_points = 30;
const base_radius = 20;
const r_min = 0.2;
const r_max = 1.8;
let splat;
let splat_detail = 10;

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

}

function randomDirection() {
  return random(0, 360);
}

function randomDeviation(angle) {
  return randomGaussian(angle, deviation_std) % 360;
}

function setup() {
  bg = loadImage('assets/background.png');
  createCanvas(600, 400);
  angleMode(DEGREES);
  dir = randomDirection();
}
function draw() {
  background(bg);

  //fill("#79767682")
  //rect(73, 26, 456, 144);
  //circle(43, 257, 72);
  //circle(300, 224, 58);
  //circle(552, 242, 83);
  //circle(502, 342, 40);
  if (ant_killed == false) {
    dir = randomDeviation(dir);
    x = x + speed * cos(dir);
    y = y + speed * sin(dir);
    ant(x, y, 0);
    validate();
  } else {
    // draw splat
    noStroke();
    fill("#940707");
    splat.loop();
  }
}

function validate() {
  // Boundaries
  if (x >= width || x < 0) {
    // reverse x axis of angle
    dir = 180 - dir;
  }
  if (y >= height || y < 0) {
    // reverse y axis of angle
    dir = -dir;
  }

  // obstacle detection
  let obs;
  for (let o=0; o < circle_obstacles.length; o++) {
    obs = circle_obstacles[o];
    if (sqrt((x - obs[0])**2 + (y - obs[1])**2) < obs[2]/2) {
      // dectected insid circle obstacle, reverse direction
      dir = 180 + dir;
    }
  }
  
  for (let o=0; o < rect_obstacles.length; o++) {
    obs = rect_obstacles[o];
    if (x > obs[0] && y > obs[1] && x < obs[0] + obs[2] && y < obs[1] + obs[3]) {
      // dectected insid circle obstacle, reverse direction
      // detect which of the 4 sides we crossed
      // 0 -> left, 1 -> bottom, 2 -> right, 3 -> top
      let side_min = 0;
      let min_distance = x - obs[0];
      if (abs(y - obs[1] + obs[3]) < min_distance) {
        side_min = 1;
      }
      if (abs(x - obs[0] + obs[2]) < min_distance) {
        side_min = 2;
      }
      if (abs(y - obs[1]) < min_distance) {
        side_min = 3;
      }
      if (side_min == 0 || side_min == 2) {
        //crossed through the side, flip x axis of direction
        dir = 180 - dir;
      }
      if (side_min == 1 || side_min == 3) {
        //crossed through the top or bottom, flip y axis of direction
        dir = -dir;
      }
    }
  }
  
} 

function mousePressed(event) {
  //check if within 20 radius of ant center
  if (sqrt((x - mouseX)**2 + (y - mouseY)**2) < 20) {
    ant_killed = true;
    splat = new Splat(x,y);
  }
}

function keyPressed(event) {
  if (key == "a") {

  }
}

function ant(x, y, angle) {

  //body
  fill("#000000");
  stroke("#000000");
  rotate(angle);
  ellipse(x, y, 5, 7);
  ellipse(x, y + 8, 7, 10);
  circle(x, y - 7, 8);

  // right legs
  line(x+2, y, x+6, y - 3);
  line(x + 6, y - 3, x+10, y - 10);
  line(x+2, y, x+10, y);
  line(x+2, y, x+6, y + 3);
  line(x + 6, y + 3, x+10, y + 10);

  // left legs
  line(x-2, y, x-6, y - 3);
  line(x - 6, y - 3, x-10, y - 10);
  line(x-2, y, x-10, y);
  line(x-2, y, x-6, y + 3);
  line(x - 6, y + 3, x-10, y + 10);

  //antenna
  line(x + 1, y - 6, x + 8, y - 16);
  line(x - 1, y - 6, x - 8, y - 16);
}
