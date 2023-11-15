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
    if (!playerCard) return; // Ensure playerCard is not undefined

    let responseCard = botCards.find(card => card && card.suit === playerCard.suit && card.value > playerCard.value);
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


function playBotCard(card, targetPosition) {
    movingCard = {
        card: card,
        startX: card.x || 0, // Use 0 as default if undefined
        startY: card.y || 0, // Use 0 as default if undefined
        targetX: targetPosition.x || 0, // Use 0 as default if undefined
        targetY: targetPosition.y || 0, // Use 0 as default if undefined
        progress: 0
    };



    card.inPlay = true;
    table.push({
        turnOf: "Bot",
        tableCardsCount: BotCardCount,
        cardIs: card
    })
    allowedCards.push(card.value)
    BotCardCount++
    botCards = botCards.filter(c => c !== card);
}