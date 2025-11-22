const socket = io();

// DOM Elements
const team1NameInput = document.getElementById('team1NameInput');
const team1PointsInput = document.getElementById('team1PointsInput');
const team2NameInput = document.getElementById('team2NameInput');
const team2PointsInput = document.getElementById('team2PointsInput');
const timerInput = document.getElementById('timerInput');
const resetTimerBtn = document.getElementById('resetTimer');
const updateTeamsBtn = document.getElementById('updateTeams');
const updateTimerBtn = document.getElementById('updateTimer');

// Current state
let teams = {
    team1: { name: "Team A", points: 0 },
    team2: { name: "Team B", points: 0 },
    timer: 30
};

// Update UI when receiving updates from server
socket.on('update', (newTeams) => {
    teams = newTeams;
    updateUI();
});

function updateUI() {
    team1NameInput.value = teams.team1.name;
    team1PointsInput.value = teams.team1.points;
    team2NameInput.value = teams.team2.name;
    team2PointsInput.value = teams.team2.points;
    timerInput.value = teams.timer;
}

// Event Listeners
updateTeamsBtn.addEventListener('click', () => {
    teams.team1.name = team1NameInput.value;
    teams.team1.points = parseInt(team1PointsInput.value) || 0;
    teams.team2.name = team2NameInput.value;
    teams.team2.points = parseInt(team2PointsInput.value) || 0;
    socket.emit('updateTeams', teams);
});

updateTimerBtn.addEventListener('click', () => {
    const newTime = parseInt(timerInput.value);
    if (newTime >= 0) {
        socket.emit('updateTimer', newTime);
    }
});

resetTimerBtn.addEventListener('click', () => {
    socket.emit('stopTimer');
    socket.emit('updateTimer', 30);
    timerInput.value = 30;
});

// Handle timer completion
socket.on('timerComplete', () => {
    alert('Timer completed!');
});

// Initial UI update
updateUI(); 