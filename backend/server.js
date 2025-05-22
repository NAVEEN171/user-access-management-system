const express = require("express");
const cors = require("cors");
const { AppDataSource } = require("./db/data-source");
const userControllers = require("./controllers/userControllers");
const softwareControllers = require("./controllers/softwareControllers");

const app = express();

app.use(express.json());
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);

app.use("/api/software", softwareControllers);

app.use("/api/auth", userControllers);

app.listen(5000, () => {
  console.log("Server is running on port 5000");
});

AppDataSource.initialize()
  .then(async () => {
    console.log(" Database connection established");
  })
  .catch((err) => {
    console.log(" Failed to connect to database:", err);
  });
