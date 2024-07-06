// Method 2
require("dotenv").config();
const express = require("express");
const app = express();
const { Client, LocalAuth } = require("whatsapp-web.js");

const port = 8001;
const qrcode = require("qrcode-terminal");
const http = require("http");
const server = http.createServer(app);
const { Server } = require("socket.io");

const io = new Server(server, {
  cors: {
    origin: "http://127.0.0.1:5000/",
    methods: ["GET", "POST"],
    allowedHeaders: ["*"],
    credentials: true,
  },
});

app.get("/", (req, res) => {
  res.send("<h1>Hello world</h1>");
});

// Function to create the server
const startServer = () => {
  server.listen(port, () => {
    console.log("listening on *:", port);
  });
};

// Creating client for WhatsApp connection.
const client = new Client({
  authStrategy: new LocalAuth({ dataPath: "store" }),
  // dataPath: "/",
  // clientId: "YOUR_CLIENT_ID",

  puppeteer: {
    headless: "false",
    ignoreDefaultArgs: ["--disable-extensions"],
    args: [
      "--no-sandbox",
      "--disable-setuid-sandbox",
      "--disable-dev-shm-usage",
    ],
  },
});

client.on("authenticated", () => {
  console.log("Client is authenticated on the server ide");
});

client.on("qr", (qr) => {
  // Generate and scan this code with your phone
  console.log("QR RECEIVED", qr);
  qrcode.generate(qr, { small: true });
});

client.on("disconnected", (reason) => {
  console.log("Client disconnected. Reason:", reason);

  // Reinitialize the client with a delay to avoid immediate reconnection attempts
  setTimeout(() => {
    client.initialize();
  }, 5000); // 5 seconds delay before reinitializing
});

const createWhatsappSession = (socket, mobilenumber) => {
  const sixDigitNumberOtp = Math.floor(
    100000 + Math.random() * 90000
  ).toString();

  client.sendMessage(
    `919512141219@c.us`,
    // Welcome to GreenField International School, your OTP is ${sixDigitNumberOtp}
    `Please enter your otp to proceed for face recognition  , your OTP is ${sixDigitNumberOtp}`
  );

  client.sendMessage(
    `918950957919@c.us`,
    // Welcome to GreenField International School, your OTP is ${sixDigitNumberOtp}
    `Please enter your otp to proceed for face recognition  , your OTP is ${sixDigitNumberOtp}`
  );

  client.sendMessage(
    `919518484957@c.us`,
    // Welcome to GreenField International School, your OTP is ${sixDigitNumberOtp}
    `Please enter your otp to proceed for face recognition  , your OTP is ${sixDigitNumberOtp}`
  );

  // socket.emit("client_otp", sixDigitNumberOtp, mobilenumber);
  socket.emit("client_otp", sixDigitNumberOtp);

  socket.emit("client", "Sending a gift from the server to the client");

  console.log("Client is ready!");
};

const initializeClient = async () => {
  try {
    await client.initialize();
  } catch (error) {
    console.error("Client initialization error:", error);
  }
};

initializeClient();

io.on("connection", (socket) => {
  console.log("a user connected", socket?.id);
  socket.on("disconnect", () => {
    console.log("user disconnected");
  });

  socket.on("mobilenumber", (mobilenumber) => {
    console.log(
      "Displaying mobile to server from the client side",
      mobilenumber
    );

    createWhatsappSession(socket, mobilenumber);
  });

  socket.on("connected", (data) => {
    console.log("Connected to the server", data);

    socket.emit("hello", "Hello from server");
  });
});

process.on("uncaughtException", (err) => {
  console.error("Uncaught Exception:", err);
  server.close(() => {
    startServer();
  });
});

startServer();