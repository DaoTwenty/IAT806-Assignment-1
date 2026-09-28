const n_splat_points = 30;
const base_radius = 10;
const r_min = 0.2;
const r_max = 2.2;
let splat;
let splat_detail = 10;

function setup() {
  createCanvas(100, 100);
  splat = new Splat(50, 50);
}

class Splat {

  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.vertices = []
    let x_vertex;
    let y_vertex;
    let angle;
    let radius;
    for (let i=0; i < n_splat_points; i++) {
      angle = 2 * i * PI / n_splat_points;
      //radius = base_radius * random(0.2, 1,8);
      radius = base_radius * (r_min + (r_max - r_min) * noise(millis() + cos(angle) * splat_detail, millis() + sin(angle) * splat_detail));
      x_vertex = this.x + radius * cos(angle);
      y_vertex = this.y + radius * sin(angle);
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

function mousePressed() {
  splat = new Splat(50, 50);
}

function create_splat() {
  angles = [];
  radius = [];
  for (let i=0; i < n_splat_points; i++) {
    angles.push(2 * i * PI / n_splat_points);
    radius.push(base_radius * random(0.2, 1,8));
  }
}

function draw() {
  background(200);
  noStroke();
  fill("#940707");
  splat.loop();
}