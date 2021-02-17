const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const dotenv = require("dotenv");
const morgan = require("morgan");
dotenv.config();
const app = express();

app.use(morgan("tiny"));
app.use(helmet());
app.use(cors());

const PORT = process.env.PORT || 1336;

const server = app.listen(PORT, function () {
  console.log("server running on port " + PORT);
});

const io = require("socket.io")(server, {
  cors: {
    origin: "*",
  },
});

io.on("connection", function (socket) {
  socket.on("PONG", function () {
    const d = new Date().getTime()
    socket.join("PING");
    io.to("PING").emit("PONG!", d);
    socket.leave("PING");
  });
});
