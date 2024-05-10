const Router = require("express").Router();
const Event = require("../Models/event_schema");

Router.get("/", (req, res) => {
  res.status(200).send({ message: "Sample Method" });
});

Router.get("/nearby", async (req, res) => {
  try {
    console.log(" e");
    const nearestEvents = await Event.find({
      location: {
        $nearSphere: {
          $geometry: {
            type: "Point",
            coordinates: [80.1, 18.59], // GeoJSON format: [longitude, latitude]
          },
          $maxDistance: 10000, // Max distance in meters
        },
      },
    });

    res.status(200).send(nearestEvents);
  } catch (error) {}
});
module.exports = Router;

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

Router.post("/", async (req, res) => {
  res.status(200).send({ e: req });
});
