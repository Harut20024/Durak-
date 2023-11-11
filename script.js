let movingCard = null; // Global variable to track the moving card
let playerCards = [];
let botCards = []
let fullDeck = [];
let ImgCalodes;
let turn = "player";

function switchTurn() {
    turn = (turn === "player") ? "bot" : "player";
}

function preload() {
    ImgCalodes = loadImage(`Images/caloda.png`);
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
    createCanvas(900, 800);
    shuffleArray(fullDeck);

    playerCards = [];
    botCards = [];

    for (let i = 0; i < 6; i++) {
        playerCards.push(fullDeck.pop());
        botCards.push(fullDeck.pop());
    }

    // Sorting by suit and then by value
    playerCards.sort((a, b) => {
        if (a.suit === b.suit) {
            return a.value - b.value;
        }
        return a.suit.localeCompare(b.suit);
    });

    botCards.sort((a, b) => {
        if (a.suit === b.suit) {
            return a.value - b.value;
        }
        return a.suit.localeCompare(b.suit);
    });

    dealCards();
}






function draw() {
    background(0, 128, 0);
    displayDeckCount();
    displayTurnIndicator(); // New function to display the current turn
    if (movingCard) {
        let progress = movingCard.progress;
        movingCard.card.x = lerp(movingCard.startX, movingCard.targetX, progress);
        movingCard.card.y = lerp(movingCard.startY, movingCard.targetY, progress);

        // Update the progress
        movingCard.progress += 0.05; // Adjust speed as needed

        // Check if the animation is complete
        if (movingCard.progress >= 1) {
            movingCard = null;
        }
    }
    if (movingCard) {
        movingCard.card.display(); // Display the moving card on top
    }
    for (let card of playerCards) {
        card.display();
    }
    for (let card of botCards) {
        card.display();
    }
}

function displayTurnIndicator() {
    fill(255);
    textSize(24);
    text(`Current Turn: ${turn}`, width / 2, 30);
}


function mousePressed() {
    if (turn !== "player") return;

    for (let card of playerCards) {
        if (card.isMouseOver()) {
            card.startDragging();
            break;
        }
    }
}

function mouseReleased() {
    if (turn !== "player") return;
    let playerCardToBot;

    for (let card of playerCards) {
        if (card.dragging) {
            card.stopDragging();

            if (isInCenter(card)) {
                if (placeCardInCenter(card)) {
                    playerCardToBot = card;
                    switchTurn();
                    break;
                }
            } else {
                card.resetPosition();
            }
        }
    }

    // Call botRespondToAttack only if a card was placed in the center
    if (playerCardToBot) {
        botRespondToAttack(playerCardToBot);
    }
}



function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
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
    return false;
}

function isPositionEmpty(position, tolerance = 10) {
    return !playerCards.some(card => {
        return abs(card.x - position.x) < tolerance && abs(card.y - position.y) < tolerance;
    });
}

function calculateCenterPositions() {
    const positions = [];
    const cardWidth = 105; // Assuming all cards have the same width
    const startX = (width / 2) - (3 * cardWidth) + 50; // Start placing cards from the left of center

    for (let i = 0; i < 6; i++) {
        positions.push({
            x: startX + (i * cardWidth),
            y: (height - cardWidth) / 2 // Adjust the y position as needed
        });
    }
    return positions;
}

function isInCenter(card, tolerance = 400) {
    let centerX = width / 2;
    let centerY = height / 2;
    let cardCenterX = card.x + card.width / 2 + 100;
    let cardCenterY = card.y + card.height / 2 + 100;

    // Check if the card's center is within the tolerance range of the canvas's center
    return abs(cardCenterX - centerX) < tolerance && abs(cardCenterY - centerY) < tolerance;
}

function displayDeckCount() {
    let count = fullDeck.length
    let imgX = 10;
    let imgY = height / 2 - ImgCalodes.height / 2 + 200;

    image(ImgCalodes, imgX, imgY, 120, 120);
    fill(255);
    noStroke();
    textSize(24);
    textAlign(CENTER, CENTER);
    text(count, imgX + 60, imgY + 140);
}


function dealCards() {
    let startX = (width - (playerCards.length * 110)) / 2;
    let startY = height - 150;

    // Position the player's cards at the bottom of the canvas
    for (let i = 0; i < playerCards.length; i++) {
        playerCards[i].x = startX + i * 110;
        playerCards[i].y = startY;
        playerCards[i].startX = playerCards[i].x;
        playerCards[i].startY = playerCards[i].y;
    }

    let botStartX = (width - (botCards.length * 110)) / 2;
    let botStartY = 100; // Adjust as needed for visibility

    // Position the bot's cards at the top of the canvas
    for (let i = 0; i < botCards.length; i++) {
        botCards[i].x = botStartX + i * 110;
        botCards[i].y = botStartY;
        botCards[i].botStartX = botCards[i].x;
        botCards[i].botStartY = botCards[i].y;
    }

}




//bot


function botRespondToAttack(playerCard) {
    // Try to find a card of the same suit with a higher value
    let responseCard = botCards.find(card => card.suit === playerCard.suit && card.value > playerCard.value);

    // // If no card found and player's card is not a trump, try to beat with a trump card
    // if (!responseCard && playerCard.suit !== trumpSuit) {
    //     responseCard = botCards.find(card => card.suit === trumpSuit);
    // }

    if (responseCard) {
        botCards = botCards.filter(card => card !== responseCard);
        playBotCard(responseCard);
    } else {
        // Bot cannot respond, picks up the card (or any other rules specific action)
        // botPickUpCard(playerCard);
    }

    // Switch turn back to the player
    turn = "player";
}

function playBotCard(card) {
    // Set the target position for the card
    let targetX = width / 2;
    let targetY = height / 2;

    // Initialize movingCard with card details and target position
    movingCard = {
        card: card,
        startX: card.x,
        startY: card.y,
        targetX: targetX,
        targetY: targetY,
        progress: 0 // Progress of the animation, from 0 to 1
    };

    card.inPlay = true;

    botCards = botCards.filter(c => c !== card);
}

