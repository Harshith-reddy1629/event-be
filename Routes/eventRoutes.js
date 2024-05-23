const Router = require("express").Router();
const { errorMonitor } = require("nodemailer/lib/xoauth2");
const Event = require("../Models/event_schema");
const tokenValidator = require("../tokenValidators");

Router.get("/", (req, res) => {
  res.status(200).send({ message: "Sample Method" });
});

Router.get("/search-by-cords", async (req, res) => {
  try {
    const { lat, long } = req.query;

    if (!lat || !long) {
      res.status(400).send({ error: "" });
    } else {
      const nearestEvents = await Event.find({
        location: {
          $nearSphere: {
            $geometry: {
              type: "Point",
              coordinates: [lat, long], //  [longitude, latitude]
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

Router.get("/eventname/:name", async (req, res) => {
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
    !location?.coordinates ||
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
    if (!location?.coordinates) {
      error.location = "Location is needed";
    }

    res.status(400).send(error);
  } else {
    next();
  }
};

const creaetEvent = async (req,res)=>{

try {
  


} catch (error) {
  
}

}

Router.post("/", tokenValidator, validateInputs, async (req, res) => {
  console.log(req.url);
  res.status(200).send({});
});
