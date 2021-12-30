const mongoose = require("mongoose");
const dotenv = require("dotenv");

dotenv.config({ path: "./config.env" });

const app = require("./app");

process.on("uncaughtException", (err) => {
  console.log("uncaughtException");
  console.log(err.name, err.message, err.stack);
  process.exit(1);
});

const DB = process.env.DATABASE.replace(
  "<PASSWORD>",
  process.env.DATABASE_PASSWORD
);

mongoose
  .connect(DB, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
    useUnifiedTopology: true,
  })
  .then(() => console.log("DB Connection successful"));

const port = process.env.PORT || 5000;

const server = app.listen(port, () => {
  console.log(`Server started on port ${port}`);
});

process.on("unhandledRejection", (err) => {
  console.log("unhandledRejection -- shutting down");
  console.log(err.name, err.message);
  server.close(() => {
    process.exit(1);
  });
});
