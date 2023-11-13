class Card {
    constructor(suit, value, img, x, y) {
        this.suit = suit;
        this.value = value;
        this.img = img;
        this.x = x;
        this.y = y;
        this.startX = x;
        this.startY = y;
        this.dragging = false;
        this.width = 100;
        this.height = 130;
        this.ImgBack = loadImage(`Images/back.png`);
    }

    display() {
        if (this.dragging) {
            this.x = mouseX - this.width / 2;
            this.y = mouseY - this.height / 2;
        }
        if (this.y < 110) image(this.ImgBack, this.x - 24, this.y, this.width + 80, this.height + 30)
        else image(this.img, this.x, this.y, this.width, this.height);


    }

    isMouseOver() {
        return mouseX > this.x && mouseX < this.x + this.width &&
            mouseY > this.y && mouseY < this.y + this.height;
    }

    startDragging() {
        this.dragging = true;
    }

    stopDragging() {
        this.dragging = false;
    }

    resetPosition() {
        this.x = this.startX;
        this.y = this.startY;
    }
}
