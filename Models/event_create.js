const mongoose = require("mongoose");

const event_user = mongoose.Schema(
  {
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "eventUsers",
    },
    event_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "event_user",
    },
  },

  {
    timestamps: true,
  }
);
module.exports = mongoose.model("event_user", event_user);
