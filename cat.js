class Paw {
    constructor() {

    }

    loop(x, y) {
        noStroke();
        fill("#cd661d");
        rect(x, y, 80, 20);
        // paw
        circle(x + 80, y + 20/2, 20);
        circle(x + 80 + 20/2 * sqrt(2)/2, y + 20/2 - sqrt(2)/2 * 20/2, 10);
        circle(x + 80 + 20/2 * sqrt(2 + sqrt(3))/2, y + 20/2 - sqrt(2 - sqrt(3))/2 * 20/2, 10);
        circle(x + 80 + 20/2 * sqrt(2 + sqrt(3))/2, y + 20/2 + sqrt(2 - sqrt(3))/2 * 20/2, 10);
        circle(x + 80 + 20/2 * sqrt(2)/2, y + 20/2 + sqrt(2)/2 * 20/2, 10);
        fill("#e4adba");

        push();
        translate(x + 80 + 0.8 * 20/2 * sqrt(2)/2, y + 20/2 - 0.8 * sqrt(2)/2 * 20/2, 0);
        rotate(45);
        ellipse(0, 0, 3, 5);
        pop();

        push();
        translate(x + 80 + 0.8 * 20/2 * sqrt(2 + sqrt(3))/2, y + 20/2 - 0.8 * sqrt(2 - sqrt(3))/2 * 20/2, 0);
        rotate(45+15);
        ellipse(0, 0, 3, 5);
        pop();

        push();
        translate(x + 80 + 0.8 * 20/2 * sqrt(2 + sqrt(3))/2, y + 20/2 + 0.8 * sqrt(2 - sqrt(3))/2 * 20/2, 0);
        rotate(-45-15);
        ellipse(0, 0, 3, 5);
        pop();

        push();
        translate(x + 80 + 0.8 * 20/2 * sqrt(2)/2, y + 20/2 + 0.8 * sqrt(2)/2 * 20/2, 0);
        rotate(-45);
        ellipse(0, 0, 3, 5);
        pop();

        ellipse(x + 80, y + 20/2, 6, 12);

        fill("#8b4514");
        triangle(x + 65, y, x + 72, y, x + 72, y + 0.7 * 20);

        triangle(x + 58, y + 20, x + 65, y + 20, x + 65, y + 20 - 0.7 * 20);

        triangle(x + 51, y, x + 58, y, x + 58, y + 0.7 * 20);

        triangle(x + 44, y + 20, x + 51, y + 20, x + 51, y + 20 - 0.7 * 20);

        triangle(x + 37, y, x + 44, y, x + 44, y + 0.7 * 20);

        triangle(x + 30, y + 20, x + 37, y + 20, x + 37, y + 20 - 0.7 * 20);
    }
}

class MovingPaw {
    constructor(x_s, y_s, x_e, y_e, omega) {
        this.x_s = x_s;
        this.y_s = y_s;
        this.x_e = x_e;
        this.y_e = y_e;
        this.omega = omega;
        this.paw = new Paw();
        this.x_pos = x_s;
        this.y_pos = y_s;
    }

    loop() {
        this.x_pos = this.x_s + (this.x_e - this.x_s) * sin(frameCount * this.omega);
        this.y_pos = this.y_s + (this.y_e - this.y_s) * sin(frameCount * this.omega);
        this.paw.loop(this.x_pos, this.y_pos);
    }
}