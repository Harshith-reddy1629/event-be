const mongoose = require("mongoose");

const booking_user = mongoose.Schema(
  {
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "eventUsers",
    },
    event_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "event_user",
    },
    payment_id: {
      type: String,
    },
    order_id: {
      type: String,
    },
  },

  {
    timestamps: true,
  }
);
module.exports = mongoose.model("booking_user", booking_user);
