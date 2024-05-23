const mongoose = require("mongoose");

const eventSchema = mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String },
  date: { type: Date, required: true },
  time: { type: String, required: true },
  location: {
    type: {
      type: String,
      enum: ["Point"],
      required: true,
    },
    coordinates: {
      type: [Number],
      required: true,
      validate: {
        validator: function (v) {
          return Array.isArray(v) && v.length === 2;
        },
        message:
          "Coordinates array must contain exactly two elements: [longitude, latitude]",
      },
    },
  },
  address: { type: String, required: true },
  category: { type: String, required: true },
  organizer: { type: String, required: true },
  price: {
    type: Number,
    required: true,
    default: 0,
  },
  // Likes:{  }
});

eventSchema.index({ location: "2dsphere" });

const Event = mongoose.model("Event", eventSchema);

module.exports = Event;
