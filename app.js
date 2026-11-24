// ===== Talie fiszek =====
const decks = [
  {
    name: "Angielski",
    cards: [
      ["pies", "dog"],
      ["kot", "cat"],
      ["dom", "house"],
      ["jabłko", "apple"],
      ["książka", "book"],
    ],
  },
  {
    name: "Stolice",
    cards: [
      ["Polska", "Warszawa"],
      ["Niemcy", "Berlin"],
      ["Francja", "Paryż"],
      ["Włochy", "Rzym"],
    ],
  },
  {
    name: "Matematyka",
    cards: [
      ["7 × 8", "56"],
      ["√81", "9"],
      ["2^10", "1024"],
    ],
  },
];

// ===== localStorage =====
// Struktura: { "Angielski": { "0": true, "1": false, ... }, ... }
function loadResults() {
  return JSON.parse(localStorage.getItem("fiszki") || "{}");
}

function saveResult(deckName, cardIndex, known) {
  const results = loadResults();
  results[deckName] = results[deckName] || {};
  results[deckName][cardIndex] = known;
  localStorage.setItem("fiszki", JSON.stringify(results));
}

// ===== Elementy =====
const decksEl = document.getElementById("decks");
const studyEl = document.getElementById("study");
const infoEl = document.getElementById("info");
const card = document.getElementById("card");
const front = card.querySelector(".front");
const back = card.querySelector(".back");

let deck = null;
let index = 0;

// ===== Lista talii =====
function showDecks() {
  studyEl.hidden = true;
  decksEl.hidden = false;
  decksEl.innerHTML = "";
  const results = loadResults();

  decks.forEach((d) => {
    const r = results[d.name] || {};
    const known = Object.values(r).filter((v) => v).length;
    const unknown = Object.values(r).filter((v) => !v).length;

    const div = document.createElement("div");
    div.className = "deck";
    div.innerHTML = `<h3>${d.name}</h3>
      <p>${d.cards.length} kart</p>
      <p>✓ ${known} &nbsp; ✗ ${unknown}</p>`;
    div.onclick = () => startDeck(d);
    decksEl.appendChild(div);
  });
}

// ===== Nauka =====
function startDeck(d) {
  deck = d;
  index = 0;
  decksEl.hidden = true;
  studyEl.hidden = false;
  showCard();
}

function showCard() {
  card.classList.remove("flipped", "yes", "no");
  card.style.transform = "";

  if (index >= deck.cards.length) {
    alert("Koniec talii!");
    showDecks();
    return;
  }

  front.textContent = deck.cards[index][0];
  back.textContent = deck.cards[index][1];
  infoEl.textContent = `${deck.name}: ${index + 1} / ${deck.cards.length}`;
}

function answer(known) {
  saveResult(deck.name, index, known);
  index++;
  showCard();
}

// ===== Gesty (mysz + dotyk) =====
let startX = 0;
let dx = 0;
let dragging = false;

card.addEventListener("pointerdown", (e) => {
  dragging = true;
  startX = e.clientX;
  dx = 0;
  card.setPointerCapture(e.pointerId);
});

card.addEventListener("pointermove", (e) => {
  if (!dragging) return;
  dx = e.clientX - startX;
  card.style.transform = `translateX(${dx}px) rotate(${dx / 15}deg)`;
  card.classList.toggle("yes", dx > 50);
  card.classList.toggle("no", dx < -50);
});

card.addEventListener("pointerup", () => {
  dragging = false;
  if (dx > 100) answer(true);        // w prawo = umiem
  else if (dx < -100) answer(false); // w lewo = nie umiem
  else {
    // małe przesunięcie = kliknięcie -> odwróć kartę
    if (Math.abs(dx) < 5) card.classList.toggle("flipped");
    card.style.transform = "";
    card.classList.remove("yes", "no");
  }
});

// ===== Przyciski =====
document.getElementById("btn-yes").onclick = () => answer(true);
document.getElementById("btn-no").onclick = () => answer(false);
document.getElementById("btn-back").onclick = showDecks;

showDecks();
