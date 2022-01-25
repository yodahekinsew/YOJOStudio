const getResultsButton = document.getElementById("results-button");
const resultsPage = document.getElementById("results-page");
const cardsPage = document.getElementById("cards-page");
const cards = document.getElementsByClassName("card");

/**
 * Adding CSS for the cards
 * (would be too annoying to do myself)
 */
const numCards = 7;
const cardColors = [
  "red",
  "green",
  "blue",
  "yellow",
  "brown",
  "black",
  "purple",
  "orange",
];
const idleAngleRange = { min: -30, max: 30 };
const hoverAngleRange = { min: -20, max: 20 };
const activeAngleRange = { min: -10, max: 10 };
const idleTranslateXRange = { min: -300, max: 300 };
const activeTranslateXRange = { min: -350, max: 350 };
const idleTranslateYRange = { min: -50, max: 50 };
const hoverTranslateYRange = { min: -75, max: 0 };
const activeTranslateYRange = { min: -115, max: -40 };
const lerpRange = (range, interpolant) => {
  return interpolant * (range.max - range.min) + range.min;
};
const addCSS = (s) =>
  (document.head.appendChild(document.createElement("style")).innerHTML = s);
for (let i = 0; i < numCards; i++) {
  const childIndex = numCards - i;

  const interpolant = i / (numCards - 1);
  const idleAngle = lerpRange(idleAngleRange, interpolant);
  const hoverAngle = lerpRange(hoverAngleRange, interpolant);
  const activeAngle = lerpRange(activeAngleRange, interpolant);
  const idleTranslateX = lerpRange(idleTranslateXRange, interpolant);
  const activeTranslateX = lerpRange(activeTranslateXRange, interpolant);

  const inverseInterpolant = Math.pow(
    Math.abs(i - (numCards - 1) / 2) / ((numCards - 1) / 2),
    2
  );
  const idleTranslateY = lerpRange(idleTranslateYRange, inverseInterpolant);
  const hoverTranslateY = lerpRange(hoverTranslateYRange, inverseInterpolant);
  const activeTranslateY = lerpRange(activeTranslateYRange, inverseInterpolant);
  addCSS(
    `.card:nth-child(${childIndex}) {
        transition-delay: ${0.15 * i}s;
        transform: rotateZ(${5 * Math.random()}deg);
    }`
  );
  addCSS(
    `.show-card.card:nth-child(${childIndex}) {
        transition-delay: 0s;
        transform: translate(${idleTranslateX}px, ${idleTranslateY}px) rotateZ(${idleAngle}deg) rotateY(${
      idleAngle / 2
    }deg);
    }`
  );
  addCSS(
    `.show-card.card:nth-child(${childIndex}):hover {
        transition: transform 0.5s ease;
        transform: translate(${activeTranslateX}px, ${hoverTranslateY}px) rotateZ(${hoverAngle}deg) scale(1.15);
    }`
  );
  addCSS(
    `.show-card.card:nth-child(${childIndex}):active {
        transform: translate(${idleTranslateX}px, ${activeTranslateY}px) rotateZ(${activeAngle}deg) scale(1.25); 
    }`
  );
}

// 0 1 2     3  4 5
// 0 .5 1    0 .5 1
// /(3-1)    -3/(3-1)

// 0 1 2 3     4 5 6
// 0 .3 .6 1   0 .3 .6
// /(4-1)      -4/(4-1)

const unselectedTranslateLeftXRange = { min: -500, max: -250 };
const unselectedTranslateRightXRange = { min: 250, max: 500 };
const unselectedTranslateYRange = { min: -50, max: 50 };
const unselectedAngleRange = { min: -30, max: 30 };
const halfCount = (numCards - 1) / 2;
const halfCountCeil = Math.ceil(halfCount);
for (let i = 0; i < numCards - 1; i++) {
  const childIndex = numCards - 1 - i;
  const unselectedTranslateX = lerpRange(
    i < halfCount
      ? unselectedTranslateLeftXRange
      : unselectedTranslateRightXRange,
    i < halfCount
      ? i / (halfCountCeil - 1)
      : (i - halfCountCeil) / (halfCountCeil - 1)
  );

  const unselectedAngle = lerpRange(unselectedAngleRange, i / (numCards - 2));
  const unselectedTranslateY = lerpRange(
    unselectedTranslateYRange,
    Math.pow(Math.abs(i - (numCards - 2) / 2) / ((numCards - 2) / 2), 2)
  );
  addCSS(
    `.unselected-${childIndex}.show-card.card {
        transition-delay: 0s;
        transform: translate(${unselectedTranslateX}px, ${unselectedTranslateY}px) 
            rotateZ(${unselectedAngle}deg) rotateY(${unselectedAngle / 2}deg);
    }`
  );
}

/**
 * Once the window loads, add functions to the card elements
 */
var currentSelectedCard;
var mapping = {};
window.addEventListener("load", function (event) {
  // Click anywhere outside of the cards to deselect the current card
  cardsPage.onclick = () => {
    if (currentSelectedCard) currentSelectedCard.classList.remove("selected");
    currentSelectedCard = null;
    for (let i = 0; i < cards.length; i++) {
      if (mapping.hasOwnProperty(i))
        cards[i].classList.remove(`unselected-${mapping[i]}`);
    }
  };

  // Add hover and click support for the cards
  for (let i = 0; i < cards.length; i++) {
    cards[i].addEventListener("click", (e) => {
      e.stopPropagation();
      if (currentSelectedCard) currentSelectedCard.classList.remove("selected");
      if (mapping.hasOwnProperty(i))
        cards[i].classList.remove(`unselected-${mapping[i]}`);
      var index = 0;
      for (let j = 0; j < cards.length; j++) {
        if (i != j) {
          cards[j].classList.add(`unselected-${index + 1}`);
          mapping[j] = index + 1;
          index++;
        }
      }
      cards[i].classList.add("selected");
      currentSelectedCard = cards[i];
    });
  }
});

/**
 * Animate the selected card
 */
window.onmousemove = (e) => {
  const mouseX = 2 * (e.clientX / window.innerWidth - 0.5);
  const mouseY = -2 * (e.clientY / window.innerHeight - 0.5);

  // Animate the lighting on the card
  const intensity = Math.sqrt(Math.pow(mouseX, 2) + Math.pow(mouseY, 2)) / 1.5;
  document.documentElement.style.setProperty(
    "--card-lighting",
    `radial-gradient(farthest-corner at 
        ${(e.clientX / window.innerWidth) * 150}px
        ${(e.clientY / window.innerHeight) * 250}px,
        rgba(255, 255, 255, ${0.4 - intensity * 0.4}) 0%, 
        rgba(255, 255, 255, ${0.4 - intensity * 0.4}) 2.5%, 
        rgba(255, 255, 255, ${0.3 - intensity * 0.3}) 7.5%, 
        rgba(255, 255, 255, 0) ${65 - intensity * 65}%)`
  );

  // Animate the rotation on the card
  document.documentElement.style.setProperty(
    "--card-rotation",
    `rotateX(${(e.clientY / window.innerHeight) * 15}deg) 
    rotateY(${-mouseX * 10}deg)`
  );
};

/**
 * Handle showing the cards (when user clicks the 'Get Results' button)
 */
var showingCards = false;
const showCards = () => {
  showingCards = true;
  resultsPage.style.display = "unset";
  // Request an animation frame here so that the cards page
  // has time to display, if it doesn't a transition won't occur
  requestAnimationFrame(() => {
    resultsPage.classList.add("show-results");
    for (let card of cards) card.classList.remove("hide-card");
    setTimeout(() => {
      for (let card of cards) card.classList.add("show-card");
    }, 1000);
  });
};
getResultsButton.onclick = showCards;
