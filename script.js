let fullDeck = [];

function preload() {
    const suitsImages = {
        'Clubs': [],
        'Diamonds': [],
        'Hearts': [],
        'Spades': []
    };
    for (let i = 1; i <= 9; i++) {
        suitsImages['Clubs'].push(loadImage(`Images/Clubs/${i}.png`));
        suitsImages['Diamonds'].push(loadImage(`Images/Diamonds/${i}.png`));
        suitsImages['Hearts'].push(loadImage(`Images/Hearts/${i}.png`));
        suitsImages['Spades'].push(loadImage(`Images/Spades/${i}.png`));
    }

    for (let suit in suitsImages) {
        let suitImages = suitsImages[suit];
        let deck = new Deck(suitImages, suit);
        fullDeck.push(...deck.cards);
    }
}

function setup() {
    createCanvas(800, 700);
}

function draw() {
    background(0, 128, 0);
    let displayedCards = [];
    for (let i = 0; i < 6; i++) {
        let card;
        do {
            card = fullDeck[Math.floor(Math.random() * fullDeck.length)];
        } while (displayedCards.includes(card)); 
        displayedCards.push(card);
        card.display(100 + i * 100, 550); 
    }
    noLoop(); 
}