class Card {
    constructor(suit, value, img) {
      this.suit = suit;
      this.value = value;
      this.img = img;
    }
  
    display(x, y) {
      image(this.img, x, y, 70, 100);
    }
  }