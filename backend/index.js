const express = require("express");
const mongoose = require("mongoose");
const cookieParser = require('cookie-parser')
const userRoute = require('./routes/users');
const videoRoute = require('./routes/videos');
const commentsRoute = require('./routes/comments');
const authRoute = require('./routes/auth');
require('dotenv').config();
const app = express();

const port = process.env.port || 7000;
app.use(express.json());
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });

const db = mongoose.connection;
db.on("error", () => console.error("connection error"));
db.once("open", function () {
  console.log("Connected successfully");
});

app.use(cookieParser());
app.use('/api/users', userRoute);
app.use('/api/videos', videoRoute);
app.use('/api/comments', commentsRoute);
app.use('/api/auth', authRoute);

app.use((err, req, res, next) => {
  const status = err.status || 500;
  const message = err.message || "Something went wrong"
  return res.status(status).json({
    success: false,
    status,
    message
  })
})

app.listen(port, () => {
  console.log('server is listening on port: ' + port);
})