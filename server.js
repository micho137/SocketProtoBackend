const express = require("express");
const http = require("http");
const socketIO = require("socket.io");
const cors = require("cors");

const { exec } = require("child_process");

const app = express();
const server = http.createServer(app);
const io = socketIO(server, {
  cors: {
    origin: "*",
  },
});

app.use(cors());

const pythonScriptPath = "./scripts/red.py";

function processedText(output) {
  return new Promise((resolve, reject) => {
    exec(
      `python ${pythonScriptPath} "${output}"`,
      { encoding: "latin1" },
      (error, stdout, stderr) => {
        if (error) {
          console.error(`Error al ejecutar el script de Python: ${error}`);
          reject(error);
          return;
        }
        resolve(stdout);
      }
    );
  });
}

io.on("connection", (socket) => {
  console.log("Un cliente se ha conectado");

  socket.on("disconnect", () => {
    console.log("Un cliente se ha desconectado");
  });
  socket.on("TextOutput", async (output) => {
    var textoProcesado = await processedText(output);
    console.log(textoProcesado);
    socket.emit("ProcessedText", textoProcesado);
  });
});

const port = 4001;

server.listen(port, () => {
  console.log(`Servidor Socket.IO en ejecución en el puerto ${port}`);
});
