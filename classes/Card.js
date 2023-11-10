class Card {
  constructor(suit, value, img, x, y) {
      this.suit = suit;
      this.value = value;
      this.img = img;
      this.x = x;
      this.y = y;
      this.startX = x; // Starting x position
      this.startY = y; // Starting y position
      this.dragging = false;
      this.width = 70; // Width of the card image
      this.height = 100; // Height of the card image
  }

  display() {
      if (this.dragging) {
          this.x = mouseX - this.width / 2;
          this.y = mouseY - this.height / 2;
      }
      image(this.img, this.x, this.y, this.width, this.height);
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
