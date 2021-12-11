const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config({ path: './config.env' });

const app = require('./app');

const DB = process.env.DATABASE.replace(
  '<PASSWORD>',
  process.env.DATABASE_PASSWORD
);

mongoose
  .connect(DB, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
    useUnifiedTopology: true,
  })
  .then(() => console.log('DB Connection successful'))
  .catch((err) => console.log(err));

const port = process.env.PORT || 5000;

// const testTour = new Tour({
//   name: 'The Park Camper',
//   price: 997,
// });

// testTour
//   .save()
//   .then((doc) => {
//     console.log('inserted document', doc);
//   })
//   .catch((err) => {
//     console.log('error while inserting doc 🔥  ', err);
//   });

app.listen(port, () => {
  console.log(`Server started on port ${port}`);
});
