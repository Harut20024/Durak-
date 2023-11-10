let displayedCards = [];
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
    shuffleArray(fullDeck);

    // Set up the displayed cards
    displayedCards = fullDeck.slice(0, 6);
    let startX = (width - (displayedCards.length * 110)) / 2;
    let startY = height - 150;

    // Position the displayed cards at the bottom of the canvas
    for (let i = 0; i < displayedCards.length; i++) {
        displayedCards[i].x = startX + i * 110;
        displayedCards[i].y = startY;
        displayedCards[i].startX = displayedCards[i].x; // Set the starting position for reset
        displayedCards[i].startY = displayedCards[i].y;
    }
}

function draw() {
    background(0, 128, 0);
    for (let card of displayedCards) {
        card.display();
    }
}

function mousePressed() {
    for (let card of displayedCards) {
        if (card.isMouseOver()) {
            card.startDragging();
            break;
        }
    }
}

function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}


function mouseReleased() {
    for (let card of displayedCards) {
        if (card.dragging) {
            card.stopDragging();

            if (isInCenter(card)) {
                // Attempt to place the card in the center, if successful, don't reset the position
                if (placeCardInCenter(card)) {
                    return;
                }
            }
            // If the card wasn't placed in the center, reset its position
            card.resetPosition();
        }
    }
}

function placeCardInCenter(droppedCard) {
    const centerPositions = calculateCenterPositions();

    // Find the first available position in the center
    for (let pos of centerPositions) {
        if (isPositionEmpty(pos)) {
            // Position the dropped card in the center
            droppedCard.x = pos.x;
            droppedCard.y = pos.y;
            return true;
        }
    }
    // If no available position, the card can't be placed
    return false;
}

function isPositionEmpty(position, tolerance = 10) {
    return !displayedCards.some(card => {
        return abs(card.x - position.x) < tolerance && abs(card.y - position.y) < tolerance;
    });
}

function calculateCenterPositions() {
    // Calculate the positions for up to 6 cards in the center
    const positions = [];
    const cardWidth = 70; // Assuming all cards have the same width
    const startX = (width / 2) - (3 * cardWidth); // Start placing cards from the left of center

    for (let i = 0; i < 6; i++) {
        positions.push({
            x: startX + (i * cardWidth),
            y: (height - cardWidth) / 2 // Adjust the y position as needed
        });
    }
    return positions;
}

function isInCenter(card, tolerance = 100) {
    let centerX = width / 2;
    let centerY = height / 2;
    let cardCenterX = card.x + card.width / 2;
    let cardCenterY = card.y + card.height / 2;

    // Check if the card's center is within the tolerance range of the canvas's center
    return abs(cardCenterX - centerX) < tolerance && abs(cardCenterY - centerY) < tolerance;
}


