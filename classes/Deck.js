class Deck {
    constructor(images, suit) {
      this.cards = [];
      this.initializeDeck(images, suit);
    }
  
    initializeDeck(images, suit) {
      const values = ['A','6', '7', '8', '9', '10', 'J', 'Q', 'K'];
      for (let i = 0; i < values.length; i++) {
        this.cards.push(new Card(suit, values[i], images[i]));
      }
    }
  
    drawRandomCard() {
      const randomIndex = Math.floor(Math.random() * this.cards.length);
      return this.cards[randomIndex];
    }
  }