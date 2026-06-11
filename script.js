// Player State
let state = {
    discipline: 10,
    strength: 10,
    spirit: 10,
    age: 7,
    currentScenario: 0
};

const mentor = {
    name: "Lycurgus the Lawgiver",
    dialogues: {
        0: "Remember, young Spartan: We do not use walls of stone. Our men are our walls.",
        1: "In Athens, they talk. In Sparta, we act. Our women are free because they are the mothers of warriors.",
        2: "Hunger and cold are your best teachers. They make you sharp, like a bronze spear.",
        3: "Leonidas is a true son of Hercules. Listen well to him.",
        4: "The final step. Do not fail your mess-mates. A Spartan who eats alone is no Spartan at all."
    }
};

const scenarios = [
    {
        id: 0,
        text: "You are 7 years old. Your father, a proud Spartan citizen, hands you over to the State. You are now a member of the Agoge. Your first meal is the infamous 'Black Broth' (melas zomos) made of boiled pigs' legs, blood, salt, and vinegar. An Athenian visitor looks at it with disgust. What do you do?",
        choices: [
            {
                text: "Eat it all without a word. It is the fuel of warriors.",
                effect: { discipline: 5, strength: 2 },
                next: 1
            },
            {
                text: "Complain about the taste. Why can't we have Athenian honey cakes?",
                effect: { discipline: -5, spirit: -2 },
                next: 1
            },
            {
                text: "Share your portion with a smaller boy. We are a phalanx, we stand together.",
                effect: { spirit: 5, discipline: 2 },
                next: 1
            }
        ]
    },
    {
        id: 1,
        text: "A mentor, an Eiren, tells you about the laws of Lycurgus. He mentions that unlike in weak Athens, Spartan women are trained in athletics and can own land. 'They must be strong to bear strong sons,' he says. How do you respond?",
        choices: [
            {
                text: "Agree that Spartan women are superior and more free than Athenian ones.",
                effect: { spirit: 5, discipline: 3 },
                next: 2
            },
            {
                text: "Question why women need to be strong if men do the fighting.",
                effect: { discipline: -2, spirit: -2 },
                next: 2
            }
        ]
    },
    {
        id: 2,
        text: "You are now 12. Training intensifies. You are given only one cloak (himation) for the entire year and must sleep on reeds you pulled from the Eurotas river with your bare hands. It is freezing. What is your mindset?",
        choices: [
            {
                text: "Endure the cold. Luxury is for the soft Athenians.",
                effect: { strength: 10, discipline: 5 },
                next: 3
            },
            {
                text: "Steal an extra cloak from the kitchens. Lycurgus said stealing is okay, as long as you don't get caught.",
                effect: { discipline: 5, strength: 5 },
                next: 3
            }
        ]
    },
    {
        id: 3,
        text: "King Leonidas himself visits the training grounds. He watches you spar. He reminds you that a Spartan's greatest glory is to never retreat. 'Come back with your shield, or on it,' he says. He asks if you are ready for the Krypteia.",
        choices: [
            {
                text: "I am ready to serve the state in the shadows.",
                effect: { spirit: 10, strength: 5 },
                next: 4
            },
            {
                text: "I prefer the open battlefield, my King.",
                effect: { discipline: 5, strength: 5 },
                next: 4
            }
        ]
    },
    {
        id: 4,
        text: "The final test. You have survived the Agoge. You are 20 years old and must be elected to a 'syssitia' (mess hall). To be a full citizen (Homoios), you must be accepted. The Athenian ambassadors watch from afar, mocking our 'simple' ways.",
        choices: [
            {
                text: "Present your strength and discipline as your contribution.",
                effect: { discipline: 10, strength: 10 },
                next: 'end'
            }
        ]
    }
];

// UI Elements
const disciplineEl = document.getElementById('discipline');
const strengthEl = document.getElementById('strength');
const spiritEl = document.getElementById('spirit');
const textDisplay = document.getElementById('text-display');
const choicesContainer = document.getElementById('choices-container');
const mentorBox = document.getElementById('mentor-box');
const mentorNameEl = document.getElementById('mentor-name');
const mentorTextEl = document.getElementById('mentor-text');

function updateUI() {
    disciplineEl.innerText = state.discipline;
    strengthEl.innerText = state.strength;
    spiritEl.innerText = state.spirit;
}

function showScenario(scenarioIndex) {
    const scenario = scenarios[scenarioIndex];
    if (!scenario) return;

    // Show mentor dialogue
    if (mentor.dialogues[scenarioIndex]) {
        mentorBox.style.display = 'block';
        mentorNameEl.innerText = mentor.name;
        mentorTextEl.innerText = `"${mentor.dialogues[scenarioIndex]}"`;
    } else {
        mentorBox.style.display = 'none';
    }

    textDisplay.innerText = scenario.text;
    choicesContainer.innerHTML = '';

    scenario.choices.forEach(choice => {
        const button = document.createElement('button');
        button.innerText = choice.text;
        button.classList.add('choice-btn');
        button.onclick = () => selectChoice(choice);
        choicesContainer.appendChild(button);
    });
}

function selectChoice(choice) {
    // Apply effects
    if (choice.effect) {
        state.discipline += choice.effect.discipline || 0;
        state.strength += choice.effect.strength || 0;
        state.spirit += choice.effect.spirit || 0;
    }

    updateUI();

    if (choice.next === 'end') {
        showEndScreen();
    } else {
        state.currentScenario = choice.next;
        showScenario(state.currentScenario);
    }
}

function showEndScreen() {
    mentorBox.style.display = 'none';
    choicesContainer.innerHTML = '';
    let rank = "";
    let description = "";

    if (state.discipline > 30 && state.strength > 30) {
        rank = "Spartan Equal (Homoios)";
        description = "You have fully mastered the Agoge. You are the wall of Sparta. Athens trembles at your name.";
    } else if (state.discipline > 15) {
        rank = "Spartan Soldier";
        description = "You have passed, but you have much to learn. You will serve in the phalanx with honor.";
    } else {
        rank = "Hypomeion (Inferior)";
        description = "You failed to meet the rigorous standards of Lycurgus. You are not a full citizen. Perhaps Athens has a place for someone of your... flexibility.";
    }

    textDisplay.innerHTML = `<strong>Final Rank: ${rank}</strong><br><br>${description}<br><br>Final Stats:<br>Discipline: ${state.discipline}<br>Strength: ${state.strength}<br>Spirit: ${state.spirit}`;

    const restartBtn = document.createElement('button');
    restartBtn.innerText = "Restart Agoge";
    restartBtn.classList.add('choice-btn');
    restartBtn.onclick = () => location.reload();
    choicesContainer.appendChild(restartBtn);
}

// Start Game
updateUI();
showScenario(0);
