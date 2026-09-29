function draw_loading() {
    background("#ffffff")
    push();
    translate(300, 130);
    push();
    rotate(90 + frameCount * 2);
    noStroke();
    fill("#000000");
    push();
    translate(-20, 0);
    ellipse(0, 0, 50, 100);

    // finger 1
    push();
    translate(0.8 * 83 * sqrt(2)/2, - 0.8 * sqrt(2)/2 * 83, 0);
    rotate(45);
    ellipse(0, 0, 25, 42);
    pop();

    // finger 2
    push();
    translate(0.8 * 83 * sqrt(2 + sqrt(3))/2, - 0.8 * sqrt(2 - sqrt(3))/2 * 83, 0);
    rotate(45 + 15);
    ellipse(0, 0, 25, 42);
    pop();

    // finger 3
    push();
    translate(0.8 * 83 * sqrt(2 + sqrt(3))/2, 0.8 * sqrt(2 - sqrt(3))/2 * 83, 0);
    rotate(-45-15);
    ellipse(0, 0, 25, 42);
    pop();

    // finger 4
    push();
    translate(0.8 * 83 * sqrt(2)/2, 0.8 * sqrt(2)/2 * 83, 0);
    rotate(-45);
    ellipse(0, 0, 25, 42);
    pop();
    pop();
    pop();

    push();
    textAlign(CENTER, CENTER);
    translate(0, 120);
    let number_of_dots = (frameCount / 30 ) % 4;
    textSize(32);
    text("Loading" + ".".repeat(number_of_dots), 0, 0);
    pop();

    pop();


}