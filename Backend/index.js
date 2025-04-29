const express = require("express");

const app = express();

app.use(express.json());

app.get("/", (req, res) => {
  res.send("Welcome to bus route app");
});

const port = 4000;
app.listen(port, () => {
  console.log(`app running on port ${port}`);
});
