let movingCard = null;
let playerCards = [];
let botCards = []
let fullDeck = [];
let ImgCalodes, ImgTrump, clubsImg, diamondsImg, heartImg, spadesImg, resentImg, bgImage;
let turn;
let attack;
let playerClose = false
let trump;
let table = [];
let button, button1
let PlayerCardCount = 0;
let BotCardCount = 0;
let cardIndex = 0
let allowedCards = []
let distribute = true;
let distributeTrump = false;
let tableCardsCount = 0;
let initialTurnSet = false;
let botAttackCout = 0
let showResentImg = false;
let colorChangeForResent = 255
let allow = false
let botCloseTwoCards = false
let firstCardClosed = false; // Tracks if the first resented card has been closed

function preload() {
    ImgCalodes = loadImage(`Images/caloda.png`);
    ImgTrump = loadImage(`Images/trump.png`);
    clubsImg = loadImage(`Images/icons/clubs.png`)
    diamondsImg = loadImage(`Images/icons/diamond.png`)
    heartImg = loadImage(`Images/icons/heart.png`)
    spadesImg = loadImage(`Images/icons/spades.png`)
    resentImg = loadImage(`Images/resend.png`)
    bgImage = loadImage('Images/table.jpg');

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
    createCanvas(1000, 800);
    shuffleArray(fullDeck);
    playerCards = [];
    botCards = [];
    buttoncreate()
    buttoncreateforCollect()
    for (let i = 0; i < 6; i++) {
        playerCards.push(fullDeck.shift());
        botCards.push(fullDeck.shift());
    }

    trump = fullDeck[fullDeck.length - 1];
    dealCards();
    turn = findSmallestTrumpCard();
    attack = turn

}
function checkboxEvent() {
    if (this.checked()) {
        console.log('Checking!');
        // Code to execute when the checkbox is checked
    } else {
        console.log('Unchecking!');
        // Code to execute when the checkbox is unchecked
    }
}
function draw() {
    image(bgImage, 0, 0, width, height);
    displayDeckCount();
    displayTurnIndicator();
    updatePlayerCardPositions();
    showResend();

    // Process each group of moving cards
    if (cardMovementGroups[currentGroupIndex] && cardMovementGroups[currentGroupIndex].length > 0) {
        for (let movement of cardMovementGroups[currentGroupIndex]) {
            let card = movement.card;
            card.x = lerp(movement.startX, movement.targetX, movement.progress);
            card.y = lerp(movement.startY, movement.targetY, movement.progress);
            movement.progress += 0.05;

            if (movement.progress >= 1) {
                card.x = movement.targetX;
                card.y = movement.targetY;
                const index = cardMovementGroups[currentGroupIndex].indexOf(movement);
                cardMovementGroups[currentGroupIndex].splice(index, 1);
            }
            card.display();
        }

        if (cardMovementGroups[currentGroupIndex].length === 0) {
            currentGroupIndex++; // Move to the next group of movements
        }
    }

    if (botCloseTwoCards) {
        botRespondToDeffend();
    }

    if (attack === "bot") {
        botRespondToAttack();
    }

    if (turn === "player" && attack === "player") {
        button.show();
    } else {
        button.hide();
    }

    if (turn === "player" && attack === "bot") {
        button1.show();
    } else {
        button1.hide();
    }

    if (tableCardsCount === 6) {
        discardCards();
        tableCardsCount = 0;
    }

    updateBotCardPositions();
    for (let card of botCards) {
        if (card) card.display();
    }

    for (let item of table) {
        if (item.cardIs && typeof item.cardIs.display === 'function') {
            item.cardIs.display();
        } else {
            console.error("Invalid item in table:", item); // Debugging line
        }
    }

    for (let card of playerCards) {
        card.display();
        handlePlayerCardInteractions(card);
    }

    checkGameEndConditions();
    resend();
}

function handlePlayerCardInteractions(card) {
    if (card.y < 360 && card.y > 240 && card.x < 380 && card.x > 240 && card.dragging === true) {
        colorChangeForResent = 100;
        showResend();
        allow = true;
    } else if (card.dragging === true) {
        colorChangeForResent = 255;
        allow = false;
    }

    if (card.y < 110) {
        fill(255);
        textSize(32);
        drawTextWithBackground("Don't show your cards to the Bot", width / 2, height / 2, 'rgba(255, 255, 255, 0.8)', 'black', 5);
    }
}

function checkGameEndConditions() {
    if (fullDeck.length === 0) {
        if (playerCards.length === 0) {
            drawTextWithBackground('Player Win!!!', width / 2, height / 2, 'rgba(144, 238, 144, 0.8)', 'white', 5);
            setTimeout(() => window.location.reload(), 2000);
        }
        else if (botCards.length === 0) {
            drawTextWithBackground('Bot Win!!!', width / 2, height / 2, 'rgba(144, 238, 144, 0.8)', 'white', 5);
            setTimeout(() => window.location.reload(), 2000);
        }
    }
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
function isValidResponse(playerCard, tableCard) {
    // Check if the player card can beat the table card
    return (playerCard.suit === tableCard.suit && playerCard.value > tableCard.value) ||
        (playerCard.suit === trump.suit && (tableCard.suit !== trump.suit || (tableCard.suit === trump.suit && playerCard.value > tableCard.value)));
}

function mouseReleased() {
    if (turn !== "player") return;

    // Rest of the code remains unchanged...

    if (playerClose) {
        // Ensure the player is closing the correct card
        let firstCardOnTable = table[table.length - 2].cardIs;
        let secondCardOnTable = table[table.length - 1].cardIs;

        // Respond to the first card
        if (!firstCardClosed && isValidResponse(card, firstCardOnTable)) {
            // Logic for closing the first card
            // ...
        } else if (firstCardClosed && isValidResponse(card, secondCardOnTable)) {
            // Logic for closing the second card
            // ...
        }
    } else {
        // Logic for normal gameplay
        // ...
    }
    // Rest of the code remains unchanged...
}

function mouseReleased() {
    if (turn !== "player") return;
    let playerCardToBot;


    for (let card of playerCards) {

        if (card.dragging) {
            card.stopDragging();

            if (isInCenter(card) && placeCardInCenter(card)) {

                let botCard = null;
                if (table.length > 0) {
                    botCard = table[table.length - 1].cardIs;
                }
                if (playerClose) {
                    card.y += 40
                    let firstCardOnTable = table[0].cardIs;
                    let secondCardOnTable = table[1].cardIs;

                    // Respond to the first card
                    if (!firstCardClosed && isValidResponse(card, firstCardOnTable)) {
                        table.push({
                            turnOf: "Player",
                            tableCardsCount: PlayerCardCount,
                            cardIs: card
                        });
                        playerCards = playerCards.filter(c => c !== card);
                        updateCardCounts();
                        firstCardClosed = true; // Mark the first card as closed
                    }
                    // Respond to the second card only after the first card has been closed
                    else if (firstCardClosed && isValidResponse(card, secondCardOnTable)) {
                        table.push({
                            turnOf: "Player",
                            tableCardsCount: PlayerCardCount,
                            cardIs: card
                        });
                        playerCards = playerCards.filter(c => c !== card);
                        updateCardCounts();
                        firstCardClosed = false;
                        playerClose = false;
                        attack = "bot";
                        switchTurn();
                    }
                }
                else if (attack === "bot" && botCard && card.value === botCard.value && allow) {
                    table = []
                    card.x = card.x + 110
                    botCard.y = botCard.y + 40
                    table.push({
                        turnOf: "Player",
                        tableCardsCount: PlayerCardCount,
                        cardIs: card
                    });
                    table.push({
                        turnOf: "Bot",
                        tableCardsCount: BotCardCount,
                        cardIs: botCard
                    });
                    // Adjust card counts and remove cards from player's hand
                    PlayerCardCount++;
                    BotCardCount++;
                    playerCards = playerCards.filter(c => c !== card);
                    botCloseTwoCards = true;

                    // Force bot to respond again
                    cardIndex = table.length
                    botAttackCout = 0;
                    attack = "player";
                    switchTurn()
                    break;
                }
                else if (attack === "bot") {
                    if ((card.suit === botCard.suit && card.value > botCard.value) || card.suit === trump.suit) {
                        if (botCard.suit === trump.suit && card.value < botCard.value) break
                        else {
                            table.push({
                                turnOf: "Player",
                                tableCardsCount: PlayerCardCount,
                                cardIs: card
                            });
                            cardIndex++
                            tableCardsCount++;
                            PlayerCardCount++;
                            playerCardToBot = card;
                            playerCards = playerCards.filter(c => c !== card);
                            switchTurn();
                            allowedCards.push(card.value);
                            break;
                        }
                    }
                }
                else if (allowedCards.length === 0 && attack === "player") {
                    table.push({
                        turnOf: "Player",
                        tableCardsCount: PlayerCardCount,
                        cardIs: card
                    })
                    cardIndex++
                    PlayerCardCount++
                    tableCardsCount++
                    playerCardToBot = card;
                    playerCards = playerCards.filter(c => c !== card);
                    switchTurn();
                    allowedCards.push(card.value)
                    break;
                }
                else {
                    if (allowedCards.includes(card.value)) {
                        table.push({
                            turnOf: "Player",
                            tableCardsCount: PlayerCardCount,
                            cardIs: card
                        })
                        cardIndex++
                        tableCardsCount++
                        PlayerCardCount++
                        playerCardToBot = card;
                        playerCards = playerCards.filter(c => c !== card);
                        switchTurn();
                        allowedCards.push(card.value)
                        break;
                    }
                }
            }
        } else {
            card.resetPosition();
        }
    }


    if (playerCardToBot && attack === "player") {
        botRespondToDeffend(playerCardToBot);
    }

}





function updateCardCounts() {
    // Update the card count and other relevant variables
    PlayerCardCount++;
    cardIndex++;
    tableCardsCount++;
}
function drawTextWithBackground(txt, x, y, backgroundColor, borderColor, borderThickness) {
    textSize(32); // Set text size
    let txtWidth = textWidth(txt); // Corrected variable name
    let textHeight = textSize() + 50;
    let padding = 10;

    // Draw the background rectangle
    fill(backgroundColor); // Set background color
    stroke(borderColor); // Set border color
    strokeWeight(borderThickness); // Set border thickness
    rectMode(CENTER);
    rect(x, y, txtWidth + padding * 2, textHeight + padding, 10);

    // Draw the text
    fill(0); // Set text color (black)
    noStroke(); // No border for the text
    textAlign(CENTER, CENTER);
    text(txt, x, y);
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

    if (pos) {
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

    if (fullDeck.length > 1) {
        push();
        translate(imgX + 100, imgY + 90);
        rotate(radians(230));
        image(trump.img, -20, 0, 90, 90);
        pop();
    } else if (fullDeck.length === 1) {
        image(trump.img, imgX + 20, imgY - 20, 80, 110);
    }
    else {
        trump.suit === 'Spades' ? image(spadesImg, imgX + 20, imgY - 20, 80, 80) :
            trump.suit === 'Clubs' ? image(clubsImg, imgX + 20, imgY - 20, 80, 80) :
                trump.suit === 'Diamonds' ? image(diamondsImg, imgX + 20, imgY - 20, 80, 80) :
                    image(heartImg, imgX + 20, imgY - 20, 80, 80)
        60
    }
    if (distributeTrump) {
        image(ImgTrump, width / 1.15, height / 2, 150, 180);
        image(ImgTrump, width / 1.15, height / 2.2, 150, 180)
        image(ImgTrump, width / 1.2, height / 2.2, 150, 180)
        image(ImgTrump, width / 1.15, height / 2.5, 150, 180)

    }
    if (fullDeck.length > 1) image(ImgCalodes, imgX, imgY, 140, 140);

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

function sortCards(a, b) {
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

function buttoncreate() {
    button = createButton("Discard");
    button.position(width / 1.12, height / 1.4);
    button.mousePressed(() => {
        if (table.length !== 0) discardCards()
    });
    button.style("font-family", "Bodoni");
    button.size(140, 70);
    button.style('background-color', '#2F574B');
    button.style('text-decoration', 'none');
    button.style('border-radius', '10px');
    button.hide();
}
function buttoncreateforCollect() {
    button1 = createButton("Collect");
    button1.position(width / 1.12, height / 1.4);
    button1.mousePressed(() => {
        if (table.length !== 0) {
            let collectedCards = table.map(item => item.cardIs);
            playerCards.push(...collectedCards);
            table = [];
            allowedCards = []
            cardIndex = 0
            distributecards()
            turn = "bot"
            botAttackCout = 0
        }
    });
    button1.style("font-family", "Bodoni");
    button1.size(140, 70);
    button1.style('background-color', '#2F574B');
    button1.style('text-decoration', 'none');
    button1.style('border-radius', '10px');
    button1.hide();
}

function switchTurn() {
    turn = (turn === "player") ? "bot" : "player";
}

function findSmallestTrumpCard() {
    let trumpCardsBot = botCards.filter(card => card.suit === trump.suit);
    let trumpCardsPlayer = playerCards.filter(card => card.suit === trump.suit);

    if (trumpCardsBot.length === 0 && trumpCardsPlayer.length > 0) {
        return "player";
    } else if (trumpCardsPlayer.length === 0 && trumpCardsBot.length > 0) {
        return "bot";
    }

    // If both players have trump cards, find the smallest one
    let smallestTrumpCardBot = trumpCardsBot.reduce((smallest, current) => {
        return (smallest.value < current.value) ? smallest : current;
    }, { value: Infinity });

    let smallestTrumpCardPlayer = trumpCardsPlayer.reduce((smallest, current) => {
        return (smallest.value < current.value) ? smallest : current;
    }, { value: Infinity });

    // Compare the smallest trump cards of both players
    if (smallestTrumpCardBot.value > smallestTrumpCardPlayer.value) {
        return "player";
    } else {
        return "bot";
    }
}

function distributecards() {
    if (distribute) {
        if (playerCards.length < 6) {
            let count = 6 - playerCards.length
            for (let i = 0; i < count; i++) {
                playerCards.push(fullDeck.shift());
                if (fullDeck.length <= 0) {
                    distribute = false
                    break
                }
            }
        }
        if (botCards.length < 6) {
            let count = 6 - botCards.length
            for (let i = 0; i < count; i++) {
                botCards.push(fullDeck.shift());
                if (fullDeck.length <= 0) {
                    distribute = false
                    break
                }
            }
        }
    }
}

function discardCards() {

    table = [];
    allowedCards = [];
    cardIndex = 0;
    tableCardsCount = 0;
    botAttackCout = 0;
    distributeTrump = true
    distributecards()
    updatePlayerCardPositions();
    updateBotCardPositions();

    switchTurn();
    attack = "bot"
    redraw();
}

function updatePlayerCardPositions() {
    const startY = height - 150;
    let cardWidth = 110;
    let cardSpacing = 5; // Spacing between cards
    let maxCardWidth = (width - cardSpacing * (playerCards.length - 1)) / playerCards.length - 10;
    cardWidth = Math.min(cardWidth, maxCardWidth);

    let totalWidth = playerCards.length * cardWidth + cardSpacing * (playerCards.length - 1);
    let startX = (width - totalWidth) / 2;

    for (let i = 0; i < playerCards.length; i++) {
        playerCards[i].x = startX + i * (cardWidth + cardSpacing);
        playerCards[i].y = startY;
    }

    playerCards.sort(sortCards);
}

function updateBotCardPositions() {
    let startX;
    const startY = 100;
    let cardWidth = 110;
    let endX = width - 25;

    if (botCards.length <= 6) {
        startX = (width - (botCards.length * cardWidth)) / 2;
    } else {
        let totalWidth = botCards.length * cardWidth;
        if (totalWidth > endX) {
            cardWidth = (endX - 20) / botCards.length;
            startX = 10;
        } else {
            let ness = (width - (6 * cardWidth)) / 2;
            startX = ness;
        }
    }

    for (let i = 0; i < botCards.length; i++) {
        if (botCards[i]) { // Check if the card is not undefined
            botCards[i].x = startX + i * cardWidth;
            botCards[i].y = startY;
        }
    }
    botCards.sort(sortCards);
}


function displayTurnIndicator() {
    fill(255);
    textSize(24);
    text(`Current Turn: ${turn}`, width / 2, 30);
}




function showResend() {
    if (table.length === 1 && !showResentImg) {
        setTimeout(() => {
            showResentImg = true;
        }, 350);
    } else if (table.length !== 1) {
        showResentImg = false;
    }

    if (showResentImg) {
        const centerPositions = calculateCenterPositions();
        let pos = centerPositions[1];

        // Set the border style
        stroke(colorChangeForResent); // White border
        strokeWeight(4); // Border thickness
        fill(0, 0); // Transparent fill for the rectangle

        // Draw the rounded rectangle
        rect(pos.x + 20, pos.y - 40, 100, 130, 10);
        image(resentImg, pos.x + 45, pos.y - 15, 50, 50);
    }
}
function resend() {
    fill(255);
    stroke(0);
    strokeWeight(1);
    rectMode(CORNER);
}



