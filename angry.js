class AngryPianist {
    constructor(max_interruptions, angry_duration) {
        this.times_interrupted = 0;
        this.max_int = max_interruptions;
        this.dur = angry_duration;
        this.is_angry = false;
        this.angry_start = -1;
    }

    async setup() {
        this.angry_face = await loadImage("assets/angry.png");
        this.angry_face.resize(150,200);
    }

    interrupt(callback) {
        this.times_interrupted++;
        if (this.times_interrupted >= this.max_int) {
            this.callback = callback;
            this.times_interrupted = 0;
            this.is_angry = true;
            this.angry_start = frameCount;
            return true;
        }
        return false;
    }

    loop() {
        // only render if pianist is angry
        if (this.is_angry) {
            push();
            
            // TODO: replace with Angry Head
            translate(300, 200);

            push();
            translate(0, -50);
            imageMode(CENTER);
            image(this.angry_face, 0, 0);
            pop();

            push();
            translate(0, 100);
            textSize(40);
            fill("#f70303");
            stroke("#000000");
            textAlign(CENTER, CENTER);
            text("ARRRGGHH!!!!!!!", 0, 0);
            pop();

            pop();

            if (frameCount - this.angry_start > this.dur) {
                this.is_angry = false
                this.callback();
                this.callback = null;
            }
        }
    }
}