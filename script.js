let movingCard = null; // Global variable to track the moving card
let playerCards = [];
let botCards = []
let fullDeck = [];
let ImgCalodes;
let turn = "player";
let trump;
let table = [];
let PlayerCardCount = 0;
let BotCardCount = 0;
let cardIndex = 0


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
        playerCards.push(fullDeck.shift());
        botCards.push(fullDeck.shift());
    }

    // Access the last card to set it as the trump
    trump = fullDeck[fullDeck.length - 1];

    function sortCards(a, b) {
        // Check if either card is a trump
        if (a.suit === trump.suit && b.suit !== trump.suit) {
            return 1; // a is a trump, so it comes first
        } else if (b.suit === trump.suit && a.suit !== trump.suit) {
            return -1; // b is a trump, so it comes first
        } else if (a.suit === b.suit) {
            return a.value - b.value; // Same suit, sort by value
        } else {
            return a.suit.localeCompare(b.suit); // Different suits, sort alphabetically
        }
    }

    // Apply the sorting
    playerCards.sort(sortCards);
    botCards.sort(sortCards);
    dealCards();
}

function updatePlayerCardPositions() {
    let startX, startY;
    if (playerCards.length <= 6) {
        // If 6 or fewer cards, spread them out more
        startX = (width - (playerCards.length * 110)) / 2; // Centered horizontally
        startY = height - 150; // Positioned towards the bottom of the canvas
    } else {
        // If more than 6 cards, position them closer together
        let necessarySpace = (width - (6 * 110)) / 2; // Space needed for 6 cards
        startX = necessarySpace;
        startY = height - 150;
    }

    for (let i = 0; i < playerCards.length; i++) {
        if (playerCards.length <= 6) {
            playerCards[i].x = startX + i * 110; // More space between cards
        } else {
            playerCards[i].x = startX + i * 50; // Less space between cards
        }
        playerCards[i].y = startY;
    }
}


function updateBotCardPositions() {
    let startX, startY;
    if (botCards.length <= 6) {

        startX = (width - (botCards.length * 110)) / 2;
        startY = 100;
    }
    else {
        let ness = (width - (6 * 110)) / 2
        startX = ness
        startY = 100;

    }
    for (let i = 0; i < botCards.length; i++) {
        if (botCards.length <= 6) {
            botCards[i].x = startX + i * 110;
        }
        else botCards[i].x = startX + i * 50;
        botCards[i].y = startY;
    }
}


function draw() {
    background(0, 128, 0);
    displayDeckCount();
    displayTurnIndicator();
    if (movingCard) {
        // Update the card's position
        let progress = movingCard.progress;
        movingCard.card.x = lerp(movingCard.startX, movingCard.targetX, progress);
        movingCard.card.y = lerp(movingCard.startY, movingCard.targetY, progress);

        // Increment the progress
        movingCard.progress += 0.05;

        // Check if the movement is complete
        if (movingCard.progress >= 1) {
            // Place the card at the final position
            movingCard.card.x = movingCard.targetX;
            movingCard.card.y = movingCard.targetY;
            movingCard = null; // Stop moving the card
        }
    }
    if (movingCard) {
        movingCard.card.display();
    }
    updatePlayerCardPositions()
    for (let card of playerCards) {
        card.display();
    }
    updateBotCardPositions()
    for (let card of botCards) {
        card.display();
    }
    for (let item of table) {
        if (item.cardIs && item.cardIs.display) {
            item.cardIs.display();
        }
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
                    table.push({
                        turnOf: "Player",
                        turnCount: PlayerCardCount,
                        cardIs: card
                    })
                    PlayerCardCount++
                    playerCardToBot = card;
                    playerCards = playerCards.filter(c => c !== card);
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
    console.log(table);

}



function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}


function placeCardInCenter(droppedCard) {
    const centerPositions = calculateCenterPositions();

    // Find the appropriate position
    let pos = centerPositions[cardIndex];
    cardIndex++

    if (pos) {
        // Position the dropped card in the center
        droppedCard.x = pos.x;
        droppedCard.y = pos.y;
        return true;
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
    const cardWidth = 105;
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
    let count = fullDeck.length;
    let imgX = 10;
    let imgY = height / 2 - ImgCalodes.height / 2 + 200;

    push();
    translate(imgX + 100, imgY + 90);
    rotate(radians(220));
    image(trump.img, 0, 0, 80, 80);

    pop();
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




//bot logic


function botRespondToAttack(playerCard) {
    let responseCard = botCards.find(card => card.suit === playerCard.suit && card.value > playerCard.value);

    // If no card found and player's card is not a trump, try to beat with a trump card
    if (!responseCard && playerCard.suit === trump.suit) {
        responseCard = botCards.find(card => card.suit === trump.suit && card.value > playerCard.value);
    } else if (!responseCard && playerCard.suit !== trump.suit) {
        responseCard = botCards.find(card => card.suit === trump.suit);
    }

    if (responseCard) {
        // Play the bot's card at the position of the player's card
        playBotCard(responseCard, { x: playerCard.x, y: playerCard.y - 40 });
    } else {
        // Collect all cards from the table if there is no response
        let collectedCards = table.map(item => item.cardIs);
        botCards.push(...collectedCards);
        table = [];
    }

    // Switch turn back to the player
    turn = "player";
}


function playBotCard(card, targetPosition) {
    // Initialize movingCard with card details and target position
    movingCard = {
        card: card,
        startX: card.x,
        startY: card.y,
        targetX: targetPosition.x,
        targetY: targetPosition.y,
        progress: 0 // Progress of the animation, from 0 to 1
    };

    card.inPlay = true;
    table.push({
        turnOf: "Bot",
        turnCount: BotCardCount,
        cardIs: card
    })
    BotCardCount++
    botCards = botCards.filter(c => c !== card);
}



