// Shared state
const initialState = {
    team1: { name: "Team A", points: 0 },
    team2: { name: "Team B", points: 0 },
    timer: 30,
    questions: [
        { id: 1, text: "what is TCP/IP ?", number: 1 }
    ]
};

// Timer states
const TIMER_STATES = {
    STOPPED: 'stopped',
    RUNNING: 'running'
};

// Socket event names
const SOCKET_EVENTS = {
    UPDATE: 'update',
    START_TIMER: 'startTimer',
    STOP_TIMER: 'stopTimer',
    UPDATE_TIMER: 'updateTimer',
    UPDATE_TEAMS: 'updateTeams',
    TIMER_COMPLETE: 'timerComplete',
    ADD_QUESTION: 'addQuestion',
    UPDATE_QUESTION: 'updateQuestion',
    REMOVE_QUESTION: 'removeQuestion',
    SET_CURRENT_QUESTION: 'SET_CURRENT_QUESTION'
};

// Format time function
function formatTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return {
        minutes: String(mins).padStart(2, '0'),
        seconds: String(secs).padStart(2, '0')
    };
}

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        initialState,
        TIMER_STATES,
        SOCKET_EVENTS,
        formatTime
    };
}