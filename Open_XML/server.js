const express = require("express");
const port = 3000;
const app = express();
const path = require("path");
const database = require("./config/db");
const homeRouter = require("./routes/home.route");

// Connect database
database();

// Set engine
app.set("view engine", "ejs");
app.set(express.static(path.join(__dirname, "views")));

//Routes
app.use("/", homeRouter);

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`);
});