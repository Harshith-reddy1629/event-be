const express = require("express");

const Router = express.Router();

const Event = require("../Models/event_schema");

const tokenValidator = require("../tokenValidators");

const event_create = require("../Models/event_create");

const crypto = require("crypto");

const { v4 } = require("uuid");

const { default: mongoose } = require("mongoose");

const Razorpay = require("razorpay");
const bookings = require("../Models/bookings");

require("dotenv").config();

Router.get("/", (req, res) => {
  res.status(200).send({ message: "Sample Method" });
});

// Router.use(express.urlencoded({ extended: false }));

Router.get("/search-by-cords", tokenValidator, async (req, res) => {
  try {
    const { lat, long } = req.query;

    if (!lat || !long) {
      res.status(400).send({ error: "Need Coordinates" });
    } else {
      const nearestEvents = await Event.find({
        location: {
          $nearSphere: {
            $geometry: {
              type: "Point",
              coordinates: [long, lat], //  [longitude, latitude]
            },
            $maxDistance: 10000, // Max distance in meters
          },
        },
      });
      res.status(200).send(nearestEvents);
    }
  } catch (error) {
    res.status(200).send({ error: error.message });
  }
});

module.exports = Router;

// Router.post("/search-by-coords", async (req, res) => {
//   try {
//     const { lat, long } = req.query;

//     res.status(200).send({ lat, long });
//   } catch (error) {
//     res.status(501).send({ error: error.message });
//   }
// });

Router.get("/eventname/:name", tokenValidator, async (req, res) => {
  try {
    const { name } = req.params;

    if (name) {
      const regvalue = new RegExp(name, "i");

      const findEvent = await Event.find({
        title: { $regex: regvalue },
      });
      res.status(200).send(findEvent);
    } else {
      res
        .status(400)
        .send({ error: "please enter value to search event by name" });
    }
  } catch (error) {
    res.status(501).status({ error: error.message });
  }
});

// (async () => {
//   await Event.create({
//     title: "Tech Talk: Building Scalable React Applications",
//     description:
//       "Join us for a talk on best practices for building large-scale React applications with a focus on performance and maintainability.",
//     date: new Date("2024-05-10"), // Date object for May 10th, 2024
//     time: "18:00", // 6:00 PM
//     address: "1 Hacker Way, Menlo Park, CA",
//     location: {
//       type: "Point",
//       coordinates: [-122.188974, 37.422034], // Corrected coordinates as an array of numbers
//     },
//     category: "Tech",
//     organizer: "Silicon Valley Developers",
//   });
// })();

const validateInputs = async (req, res, next) => {
  const {
    title,
    description,
    date,
    time,
    address,
    location,
    category,
    organizer,
  } = req.body;

  const error = {};

  if (
    !title ||
    !description ||
    !date ||
    !time ||
    !address ||
    !location?.coords ||
    !location?.loc ||
    !category ||
    !organizer
  ) {
    if (!title) {
      error.title = "Title name is Mandatory";
    }
    if (!description) {
      error.description = "description is Mandatory";
    }
    if (!date) {
      error.date = "date is Mandatory";
    }
    if (!time) {
      error.time = "time  is Mandatory";
    }
    if (!address) {
      error.address = "address  is Mandatory";
    }
    if (!category) {
      error.category = "category is Mandatory";
    }
    if (!organizer) {
      error.organizer = "organizer name is Mandatory";
    }
    if (!location?.coords) {
      error.location = "Location is needed";
    }

    res.status(400).send(error);
  } else {
    next();
  }
};

const creaetEvent = async (req, res) => {
  try {
    const { _id } = req.user;
    const {
      title,
      description,
      date,
      time,
      address,
      location,
      category,
      organizer,
      amount,
      image,
    } = req.body;
    const d = new Date(date);
    const R = new Date();

    const created = await Event.create({
      title,
      description,
      date: d,
      time,
      address,
      loc: location.loc,
      location: {
        type: "Point",
        coordinates: [location.coords[0], location.coords[1]],
      },
      category,
      organizer,
      price: amount,
      image,
    });

    const EE = await event_create.create({
      user_id: _id,
      event_id: created._id,
    });

    res.status(201).send(created);
  } catch (error) {
    res.status(501).send({ error: error.message });
  }
};

Router.post("/", tokenValidator, validateInputs, creaetEvent);

Router.get("/get-events-created", tokenValidator, async (req, res) => {
  try {
    const { _id } = req.user;

    const Response = await event_create.aggregate([
      {
        $match: { user_id: new mongoose.Types.ObjectId(_id) },
      },
      {
        $lookup: {
          from: "events",
          localField: "event_id",
          foreignField: "_id",
          as: "events_created",
          // pipe     line: [
          //   {
          //     $project: {},
          //   },
          // ],
        },
      },
    ]);

    res.status(200).send(Response);
  } catch (error) {
    res.status(501).send({ error: error.message });
  }
});
Router.get("/get-events-booked", tokenValidator, async (req, res) => {
  try {
    const { _id } = req.user;

    const Response = await bookings.aggregate([
      {
        $match: { user_id: new mongoose.Types.ObjectId(_id) },
      },
      {
        $lookup: {
          from: "events",
          localField: "event_id",
          foreignField: "_id",
          as: "events_booked",
          // pipe     line: [
          //   {
          //     $project: {},
          //   },
          // ],
        },
      },
    ]);

    res.status(200).send(Response);
  } catch (error) {
    res.status(501).send({ error: error.message });
  }
});

const GetOrderDetails = async (req, res, next) => {
  try {
    const { eId } = req.params;

    const event_details = await Event.findOne({ _id: eId });
    if (event_details) {
      req.order = {
        amount: event_details.price * 100,
        currency: "INR",
        receipt: v4(),
        notes: [req.user.name, req.user._id, req.user.email],
      };

      next();
    } else {
      res.status(400).send({ message: "Error" });
    }
  } catch (error) {
    res.status(501).send({ error: error.message });
  }
};

Router.post(
  "/order/:eId",
  tokenValidator,
  GetOrderDetails,
  async (req, res) => {
    try {
      const razorpay = new Razorpay({
        key_id: process.env.RZRPY_KEY_ID,
        key_secret: process.env.RZRPY_SECRET_KEY,
      });

      const opts = req.order;
      const order = await razorpay.orders.create(opts);
      if (!order) {
        return res.status(404).send({ error: "Bad Req" });
      }
      res.status(200).send(order);
    } catch (error) {
      res.status(500).send({ error });
    }
  }
);

Router.post("/order/verify/validate", tokenValidator, async (req, res) => {
  try {
    const {
      razorpay_payment_id,
      razorpay_order_id,
      razorpay_signature,
      eventID,
    } = req.body;
    const sha = crypto.createHmac("sha256", process.env.RZRPY_SECRET_KEY);

    sha.update(`${razorpay_order_id}|${razorpay_payment_id}`);

    const digest = sha.digest("hex");

    if (digest !== razorpay_signature) {
      return res.status(400).send({ error: "Invalid Txn" });
    }

    const booking = await bookings.create({
      user_id: req.user._id,
      event_id: eventID,
      order_id: razorpay_order_id,
      payment_id: razorpay_payment_id,
    });

    if (booking) {
      res.status(200).send({
        message: "SUCCESS",
        OrderId: razorpay_order_id,
        paymentId: razorpay_payment_id,
      });
    } else {
      res.status(400).send({
        error: "Something is wrong",
      });
    }
  } catch (error) {
    res.status(500).send({ error: error.message });
  }
});
