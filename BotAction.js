
//bot logic
function botRespondToAttack() {
    if (turn !== "bot") return; // Ensure it's the bot's turn to attack

    let cardToPlay;

    // On the first turn of the round, the bot can play any card
    if (table.length === 0) {
        cardToPlay = selectAnyCard(botCards);
    } else {
        // Otherwise, play a card that matches the suits on the table or is in the allowed cards
        let suitsOnTable = table.map(item => item.cardIs.suit);
        cardToPlay = selectCardToMatch(botCards, suitsOnTable);
    }


    if (cardToPlay) {
        // Play the selected card
        const centerPosition = calculateCenterPositions()[botAttackCout];
        botAttackCout++;
        playBotCard(cardToPlay, { x: centerPosition.x, y: centerPosition.y - 40 });

        switchTurn(); // Switch turn back to the player
    }
    else {
        discardCards()
        attack = "player"
    }
}

function selectAnyCard(cards) {
    if (!cards) return null; // Check if cards array is undefined or empty

    let nonTrumpCards = cards.filter(card => card && card.suit !== trump.suit);
    return selectLowestValueCard(nonTrumpCards);
}




function selectCardToMatch(cards, suitsToMatch) {
    // Filter cards to find those that match the suits on the table or are in the allowed cards
    let matchingCards = cards.filter(card => allowedCards.includes(card.value));

    // If no matching cards, the bot cannot play a card
    if (matchingCards.length === 0) {
        return null;
    }

    // Select a card with the lowest value from the matching cards
    return selectLowestValueCard(matchingCards);
}


function selectLowestValueCard(cards) {
    // If there are no cards, return null
    if (!cards.length) {
        return null;
    }

    // Start with the first card as the lowest
    let lowestCard = cards[0];

    // Go through the rest of the cards to find the lowest value card
    for (let i = 1; i < cards.length; i++) {
        if (cards[i].value < lowestCard.value) {
            lowestCard = cards[i];
        }
    }

    // Return the card with the lowest value
    return lowestCard;
}





function botRespondToDeffend(playerCard) {
    if (botCloseTwoCards) {
        if (table.length >= 2) {
            let firstCardOnTable = table[table.length - 2].cardIs; // Second last card on the table
            let secondCardOnTable = table[table.length - 1].cardIs; // Last card on the table

            // Find response cards in the bot's hand
            let responseCard1 = findResponseCard(firstCardOnTable);
            let responseCard2 = findResponseCard(secondCardOnTable);
            if (responseCard1 && responseCard2) {
                // Bot plays both response cards
                playBotCard(responseCard1, { x: firstCardOnTable.x, y: firstCardOnTable.y - 40 });
                playBotCard(responseCard2, { x: secondCardOnTable.x, y: secondCardOnTable.y - 40 });
            } else {
                allowedCards = []
                botCards.push(firstCardOnTable, secondCardOnTable);
                table.splice(table.length - 2, 2); // Remove the last two cards from the table
            }
            botCloseTwoCards = false;
        }
        switchTurn();
        attack = "player";
    }
    else {
        if (!playerCard) return; // Ensure playerCard is not undefined

        let responseCard = botCards.find(card => card && card.suit === playerCard.suit && card.value > playerCard.value);
        let resentCard = botCards.find(card => card.value === playerCard.value)
        if (resentCard && table.length === 1 && playerCards.length >= 2) {
            // Bot resents the card
            let resentPosition = calculateCenterPositions()[1]; // Assuming this is the correct position
            playBotCard(resentCard, { x: resentPosition.x, y: resentPosition.y });

            // Set flags for the player to respond to two cards
            botAttackCout = 2
            cardIndex = 0;
            playerClose = true;
            attack = "bot";
            switchTurn();
        }
        else {
            // If no card found and player's card is not a trump, try to beat with a trump card
            if (!responseCard && playerCard.suit === trump.suit) {
                responseCard = botCards.find(card => card.suit === trump.suit && card.value > playerCard.value);
            } else if (!responseCard && playerCard.suit !== trump.suit) {
                responseCard = botCards.find(card => card.suit === trump.suit);
            }

            if (responseCard) {
                playBotCard(responseCard, { x: playerCard.x, y: playerCard.y - 40 });
            } else {
                let collectedCards = table.map(item => item.cardIs);
                botCards.push(...collectedCards);
                table = [];
                allowedCards = []
                cardIndex = 0
                distributecards()
            }

            // Switch turn back to the player
            turn = "player";
        }
    }
}


let cardMovementGroups = [];
let currentGroupIndex = 0;

// Modified playBotCard function to use queue
function playBotCard(card, targetPosition) {
    if (!cardMovementGroups[currentGroupIndex]) {
        cardMovementGroups[currentGroupIndex] = [];
    }
    cardMovementGroups[currentGroupIndex].push({
        card: card,
        startX: card.x || 0,
        startY: card.y || 0,
        targetX: targetPosition.x || 0,
        targetY: targetPosition.y || 0,
        progress: 0
    });

    card.inPlay = true;
    table.push({
        turnOf: "Bot",
        tableCardsCount: BotCardCount,
        cardIs: card
    });
    allowedCards.push(card.value);
    BotCardCount++;
    botCards = botCards.filter(c => c !== card);
}
function findResponseCard(targetCard) {
    return botCards.find(card => card && card.suit === targetCard.suit && card.value > targetCard.value) ||
        botCards.find(card => card.suit === trump.suit && (targetCard.suit !== trump.suit || card.value > targetCard.value));
}