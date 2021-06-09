const express = require("express");
const cors = require("cors");
const { validate, ValidationError, Joi } = require('express-validation');

const app = express();

const PORT = process.env.PORT || 3003;

app.use(express.json());
app.use(cors());

//Use this array as your (in-memory) data store.
const bookings = require("./bookings.json");

const bookingValidation = {
  body: Joi.object({
    roomID: Joi.number().required().min(1),
    title: Joi.string().min(2).required(),
    firstName: Joi.string().required(),
    surName: Joi.string().required(),
    email: Joi.string().email().required(),
    checkInDate: Joi.date().iso().required(),
    checkOutDate: Joi.date().iso().greater(Joi.ref('checkInDate')).required()
  })
}

app.get("/", (request, response) => {
  response.send("Hotel booking server.  Ask for /bookings, etc.");
});

app.post('/bookings', validate(bookingValidation, {}, {}), (req, res) => {
  const { roomID, title, firstName, surName, email, checkInDate, checkOutDate } = req.body;
  const id = Number(bookings.length + 1);

  const newBooking = {
    id,
    roomID,
    title,
    firstName,
    surName,
    email,
    checkInDate,
    checkOutDate
  }
  bookings.push(newBooking);
  res.json(200);
})

app.use(function (err, req, res, next) {
  if (err instanceof ValidationError) {
    return res.status(err.statusCode).json(err)
  }

  return res.status(500).json(err)
})

app.get('/bookings/:id', (req, res) => {
  const bookingById = bookings.filter(booking => booking.id === Number(req.params.id));

  if (bookingById.length > 0) {
    res.status(200).send(...bookingById)
  } else {
    res.status(404).send('The is no booking with that ID');
  }
})


app.delete('/bookings/:id', (req, res) => {
  const bookingToDelete = bookings.find(booking => booking.id === Number(req.params.id));
  if (bookingToDelete) {
    bookings.splice(req.params.id, 1);
    bookings.map((booking, index) => booking.id = index + 1);
    res.status(200).send('Booking Deleted');
  } else {
    res.status(404).send('There is no booking with that ID');
  }
})

app.get('/bookings', (req, res) => {
  res.json(bookings)
});

// TODO add your routes and helper functions here

const listener = app.listen(PORT, function () {
  console.log("Your app is listening on port " + listener.address().port);
});
