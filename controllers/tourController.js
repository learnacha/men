const fs = require('fs');

const tours = JSON.parse(
  fs.readFileSync(`${__dirname}/../dev-data/data/tours-simple.json`)
);

const checkID = (req, res, next, val) => {
  const {
    params: { id = -1 },
  } = req;
  const tour = tours.find((tour) => tour.id === +val);

  if (!tour) {
    return res.status(404).json({
      status: 'fail',
      message: 'Invalid ID',
    });
  }

  next();
};

const validateCreateTourRequest = (req, res, next) => {
  const {
    body: { name, price },
  } = req;

  const failedRes = {
    status: 'fail',
    message: 'Invalid ID',
  };

  if (!name || !price) return res.status(404).json(failedRes);

  next();
};

const createTour = (req, res) => {
  const newId = tours[tours.length - 1].id + 1;
  const newTour = Object.assign({ id: newId }, req.body);

  tours.push(newTour);
  fs.writeFile(
    `${__dirname}/dev-data/data/tours-simple.json`,
    JSON.stringify(tours),
    (err) => {
      res.status(201).json({
        status: 'success',
        data: {
          tour: newTour,
        },
      });
    }
  );
};

const getTour = (req, res) => {
  const {
    params: { id = -1 },
  } = req;
  const tour = tours.find((tour) => tour.id === +id);

  res.status(200).json({
    status: 'success',
    data: {
      tour,
    },
  });
};

const updateTour = (req, res) => {
  const {
    params: { id = -1 },
  } = req;
  const tour = tours.find((tour) => tour.id === +id);

  res.status(200).json({
    status: 'success',
    data: {
      tour,
    },
  });
};

const deleteTour = (req, res) => {
  res.status(204).json({
    data: null,
  });
};

const getAllTours = (req, res) => {
  res.status(200).json({
    status: 'success',
    results: tours.length,
    data: {
      tours,
    },
  });
};

module.exports = {
  createTour,
  getTour,
  updateTour,
  deleteTour,
  getAllTours,
  checkID,
  validateCreateTourRequest,
};
