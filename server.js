const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const dotenv = require("dotenv");
const morgan = require("morgan");
const fs = require("fs");
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


/*let map = jsonToMap(fs.readFileSync("./lists/Theya.json", "utf-8"));
map[Symbol.iterator] = function* () {
  yield* [...this.entries()].sort((a, b) => b[1] - a[1]);
};

for (let [key, value] of map) {
  // get data sorted
  console.log(key + " " + value);
}

console.log([...map]);*/

function mapToJson(map) {
  return JSON.stringify([...map]);
}
function jsonToMap(jsonStr) {
  if (jsonStr.length == 0) return new Map();

  return new Map(JSON.parse(jsonStr));
}

io.on("connection", function (socket) {
  socket.on("PONG", function () {
    const d = new Date().getTime();
    socket.join("PING");
    io.to("PING").emit("PONG!", d);
    socket.leave("PING");
  });

  socket.on("INIT", function (data) {
    const x = new Map();
    data.list.forEach((e) => {
      x.set(e.media.title.romaji, { pts: 0, times:0 });
    });
    fs.writeFileSync("./lists/" + data.of + ".json", mapToJson(x));
  });

  socket.on("CHOOSE", function (data) {
    let x = jsonToMap(fs.readFileSync("./lists/" + data.by + ".json", "utf-8"));
    console.log("Choisis: " + data.choisis);
    console.log("Contre: " + data.refus);
    x.get(data.choisis).pts++
    x.get(data.choisis).times++
    x.get(data.refus).times++
    fs.writeFileSync("./lists/" + data.by + ".json", mapToJson(x));
    io.to(socket.id).emit("OK");
  });
});
