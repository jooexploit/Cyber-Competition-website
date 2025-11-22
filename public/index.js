const socket = io();

// DOM Elements
const currentQuestionEl = document.getElementById('currentQuestion');
const questionNumberEl = document.getElementById('questionNumber');
const questionCounterEl = document.getElementById('questionCounter');
const prevQuestionMainBtn = document.getElementById('prevQuestionMain');
const nextQuestionMainBtn = document.getElementById('nextQuestionMain');

let currentQuestionIndex = 0;
let questions = [];

// Question Navigation
prevQuestionMainBtn.addEventListener('click', () => {
  if (currentQuestionIndex > 0) {
    currentQuestionIndex--;
    updateQuestionDisplay();
  }
});

nextQuestionMainBtn.addEventListener('click', () => {
  if (currentQuestionIndex < questions.length - 1) {
    currentQuestionIndex++;
    updateQuestionDisplay();
  }
});

function updateQuestionDisplay() {
  if (questions.length > 0) {
    const question = questions[currentQuestionIndex];
    
    // Add animation class
    currentQuestionEl.style.animation = 'none';
    currentQuestionEl.offsetHeight; // Trigger reflow
    currentQuestionEl.style.animation = null;
    
    // Update content
    currentQuestionEl.textContent = question.text;
    questionNumberEl.textContent = `Question ${question.number}:`;
    questionCounterEl.textContent = `${currentQuestionIndex + 1}/${questions.length}`;
    
    // Update navigation buttons
    prevQuestionMainBtn.disabled = currentQuestionIndex === 0;
    nextQuestionMainBtn.disabled = currentQuestionIndex >= questions.length - 1;
  }
}

// Handle updates from server
socket.on('update', (data) => {
  if (data.questions) {
    questions = data.questions;
    updateQuestionDisplay();
  }
}); 