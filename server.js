const express = require("express");
const http = require("http");
const socketIo = require("socket.io");
const path = require("path");
const { initialState, SOCKET_EVENTS } = require("./public/app.js");
const os = require("os");

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

let teams = { ...initialState };
let currentQuestionIndex = 0;

let isTimerRunning = false;
let countdownInterval = null;

// Serve static files from the public directory
app.use(express.static(path.join(__dirname, "public")));
app.use(express.static(path.join(__dirname, "public")));

// Serve index.html for the root route
app.get("/", (req, res) => {
  const publicPath = path.join(__dirname, "public", "index.html");
  const testRePath = path.join(__dirname, "public", "index.html");

  if (require("fs").existsSync(publicPath)) {
    res.sendFile(publicPath);
  } else {
    res.sendFile(testRePath);
  }
});

// Serve admin.html for /admin route
app.get("/admin", (req, res) => {
  const publicPath = path.join(__dirname, "public", "admin.html");
  const testRePath = path.join(__dirname, "public", "admin.html");

  if (require("fs").existsSync(publicPath)) {
    res.sendFile(publicPath);
  } else {
    res.sendFile(testRePath);
  }
});

io.on("connection", (socket) => {
  console.log("A user connected");

  // Send initial state to new connections
  socket.emit(SOCKET_EVENTS.UPDATE, teams);

  // Handle team updates
  socket.on(SOCKET_EVENTS.UPDATE_TEAMS, (data) => {
    teams = data;
    io.emit(SOCKET_EVENTS.UPDATE, teams);
    console.log("Teams updated:", teams);
  });

  // Timer controls
  socket.on(SOCKET_EVENTS.START_TIMER, () => {
    if (!isTimerRunning && teams.timer > 0) {
      isTimerRunning = true;
      countdownInterval = setInterval(() => {
        if (teams.timer > 0) {
          teams.timer--;
          io.emit(SOCKET_EVENTS.UPDATE, teams);
        } else {
          clearInterval(countdownInterval);
          isTimerRunning = false;
          io.emit(SOCKET_EVENTS.TIMER_COMPLETE);
        }
      }, 1000);
    }
  });

  socket.on(SOCKET_EVENTS.STOP_TIMER, () => {
    if (isTimerRunning) {
      clearInterval(countdownInterval);
      isTimerRunning = false;
      io.emit(SOCKET_EVENTS.UPDATE, teams);
    }
  });

  socket.on(SOCKET_EVENTS.UPDATE_TIMER, (seconds) => {
    clearInterval(countdownInterval);
    isTimerRunning = false;
    teams.timer = seconds;
    io.emit(SOCKET_EVENTS.UPDATE, teams);
  });

  // Question Management
  socket.on(SOCKET_EVENTS.ADD_QUESTION, (question) => {
    teams.questions = teams.questions || [];
    if (!question.text || !question.number) {
      return;
    }
    teams.questions.push(question);
    teams.questions.sort((a, b) => a.number - b.number);
    teams.currentQuestionIndex = teams.questions.length - 1;
    io.emit(SOCKET_EVENTS.UPDATE, teams);
    console.log("Question added:", question);
  });

  socket.on(SOCKET_EVENTS.UPDATE_QUESTION, (updatedQuestion) => {
    if (!updatedQuestion.text || !updatedQuestion.number) {
      return;
    }
    teams.questions = teams.questions.map((q) =>
      q.id === updatedQuestion.id ? updatedQuestion : q
    );
    teams.questions.sort((a, b) => a.number - b.number);
    io.emit(SOCKET_EVENTS.UPDATE, teams);
    console.log("Question updated:", updatedQuestion);
  });

  socket.on(SOCKET_EVENTS.REMOVE_QUESTION, (questionId) => {
    teams.questions = teams.questions.filter((q) => q.id !== questionId);
    io.emit(SOCKET_EVENTS.UPDATE, teams);
    console.log("Question removed:", questionId);
  });

  socket.on("SET_CURRENT_QUESTION", (index) => {
    currentQuestionIndex = index;
    teams.currentQuestionIndex = currentQuestionIndex;
    if (teams.questions && teams.questions.length > 0) {
      currentQuestionIndex = Math.min(
        Math.max(0, currentQuestionIndex),
        teams.questions.length - 1
      );
      teams.currentQuestionIndex = currentQuestionIndex;
    }
    io.emit(SOCKET_EVENTS.UPDATE, teams);
    console.log("Current question index:", currentQuestionIndex);
  });

  socket.on("disconnect", () => {
    console.log("A user disconnected");
  });
});

server.listen(3000, "0.0.0.0", () => {
  const networkInterfaces = os.networkInterfaces();
  let ipAddress = "";

  // Loop through network interfaces to find the first non-internal IPv4 address for Wi-Fi
  for (const interface in networkInterfaces) {
    if (interface.toLowerCase() === "wi-fi") {
      // Check for Wi-Fi interface
      for (const address of networkInterfaces[interface]) {
        if (address.family === "IPv4" && !address.internal) {
          ipAddress = address.address;
          break;
        }
      }
    }
    if (ipAddress) break; // Exit the loop if an IP address is found
  }
  console.log("Server running on http://0.0.0.0:3000");
  if (ipAddress) {
    console.log(`Server running on http://${ipAddress}:3000`);
  } else {
    console.log("No valid IP address found for Wi-Fi interface.");
  }
});
