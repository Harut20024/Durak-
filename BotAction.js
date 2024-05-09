//bot logic
function botRespondToAttack() {
  if (turn !== "bot") return;

  let cardToPlay;

  if (table.length === 0) {
    cardToPlay = selectAnyCard(botCards);
  } else {
    let suitsOnTable = table.map((item) => item.cardIs.suit);
    cardToPlay = selectCardToMatch(botCards, suitsOnTable);
  }

  if (cardToPlay) {
    const centerPosition = calculateCenterPositions()[botAttackCout];
    botAttackCout++;
    playBotCard(cardToPlay, { x: centerPosition.x, y: centerPosition.y - 40 });

    switchTurn(); // Switch turn back to the player
  } else {
    discardCards();
    attack = "player";
  }
}

function selectAnyCard(cards) {
  if (!cards) return null; // Check if cards array is undefined or empty

  let nonTrumpCards = cards.filter((card) => card && card.suit !== trump.suit);
  return selectLowestValueCard(nonTrumpCards);
}

function selectCardToMatch(cards, suitsToMatch) {
  let matchingCards = cards.filter(
    (card) => card && allowedCards.includes(card.value)
  );

  if (matchingCards.length === 0) {
    return null;
  }

  return selectLowestValueCard(matchingCards);
}

function selectLowestValueCard(cards) {
  if (!cards.length) {
    return null;
  }

  let lowestCard = cards[0];

  for (let i = 1; i < cards.length; i++) {
    if (cards[i].value < lowestCard.value) {
      lowestCard = cards[i];
    }
  }

  return lowestCard;
}

function botRespondToDeffend(playerCard) {
  if (botCloseTwoCards) {
    if (table.length >= 2) {
      let firstCardOnTable = table[table.length - 2].cardIs; 
      let secondCardOnTable = table[table.length - 1].cardIs; 

       let responseCard1 = firstCardOnTable
        ? findResponseCard(firstCardOnTable)
        : null;
      let responseCard2 = secondCardOnTable
        ? findResponseCard(secondCardOnTable)
        : null;

      if (responseCard1 && responseCard2) {
         playBotCard(responseCard1, {
          x: firstCardOnTable.x,
          y: firstCardOnTable.y - 40,
        });
        playBotCard(responseCard2, {
          x: secondCardOnTable.x,
          y: secondCardOnTable.y - 40,
        });
      } else {
        allowedCards = [];
        if (firstCardOnTable) botCards.push(firstCardOnTable);
        if (secondCardOnTable) botCards.push(secondCardOnTable);
        botCollectCards = millis();
        botCollectCard = true;
        table.splice(table.length - 2, 2);  
      }
      botCloseTwoCards = false;
    }
    switchTurn();
    attack = "player";
  } else {
    if (!playerCard) return;
    let responseCard = botCards.find(
      (card) =>
        card && card.suit === playerCard.suit && card.value > playerCard.value
    );
    let resentCard = botCards.find((card) => card.value === playerCard.value);

    if (resentCard && table.length === 1 && playerCards.length >= 2) {
      // Bot resents the card
      let resentPosition = calculateCenterPositions()[1];  
      playBotCard(resentCard, { x: resentPosition.x, y: resentPosition.y });

      botAttackCout = 2;
      cardIndex = 0;
      playerClose = true;
      attack = "bot";
      switchTurn();
    } else {
      if (!responseCard && playerCard.suit !== trump.suit) {
        responseCard = botCards.find((card) => card.suit === trump.suit);
      }

      if (responseCard) {
        playBotCard(responseCard, { x: playerCard.x, y: playerCard.y - 40 });
      } else {
        let collectedCards = table.map((item) => item.cardIs);
        botCards.push(...collectedCards);
        table = [];
        allowedCards = [];
        botCollectCards = millis();
        botCollectCard = true;
        cardIndex = 0;
        distributecards();
      }

      turn = "player";
    }
  }
}

let cardMovementGroups = [];
let currentGroupIndex = 0;

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
    progress: 0,
  });

  card.inPlay = true;
  table.push({
    turnOf: "Bot",
    tableCardsCount: BotCardCount,
    cardIs: card,
  });
  allowedCards.push(card.value);
  BotCardCount++;
  botCards = botCards.filter((c) => c !== card);
}
function findResponseCard(targetCard) {
  if (!targetCard) return null;
  let beatingCard = botCards.find(
    (card) =>
      card && card.suit === targetCard.suit && card.value > targetCard.value
  );
  if (beatingCard) return beatingCard;

  if (targetCard.suit !== trump.suit) {
    let trumpCard = botCards.find((card) => card.suit === trump.suit);
    if (trumpCard) return trumpCard;
  }

  return null;
}
