const express = require("express");
const cors = require("cors");
const path = require("path");
const mongoConnection = require("./mongoConnection");
const Router = require("./Routes/eventRoutes");
const userRouter = require("./Routes/userRoutes");
require("dotenv").config();
const app = express();
const PORT = process.env.PORT || 8004;

app.use(express.json());
app.use(cors());

mongoConnection();
const initializeServer = () => {
  try {
    app.listen(PORT, () =>
      console.log(`Server Running at http://localhost:${PORT}/`)
    );
  } catch (error) {
    console.log(`Error: ${error.message}`);
    process.exit(1);
  }
};

initializeServer();

app.get("/", async (req, res) => {
  res.status(404).sendFile(path.join(__dirname, "notFound.html"));
});

app.use("/events", Router);

app.use("/user", userRouter);

app.all("*", (req, res) => {
  res.status(404).sendFile(path.join(__dirname, "notFound.html"));
});
