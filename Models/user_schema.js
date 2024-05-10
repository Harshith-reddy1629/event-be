const mongoose = require("mongoose");
const { v4 } = require("uuid");

const usersSchema = mongoose.Schema(
  {
    name: {
      type: String,
      trim: true,
      required: [true, "Please add the Name"],
    },
    email: {
      type: String,
      trim: true,
      unique: true,
      required: [true, "Please add the email address"],
    },
    isVerified: {
      default: false,
      type: Boolean,
      required: [true, "Verify your email"],
    },
    verificationId: {
      type: String,
      default: v4,
      unique: true,
      required: true,
    },
    // ver: {
    //   type: String,
    //   default: function () {
    //     return this.verificationId?.slice(0, 11);
    //   },
    //   required: true,
    // },
    username: {
      type: String,
      unique: true,
      trim: true,
      required: [true, "Please add the username"],
    },
    password: {
      type: String,
      trim: true,
      required: [true, "Please add the password"],
    },
    passChangeAllowed: {
      type: Boolean,
      default: false,
    },
  },

  {
    timestamps: true,
  }
);
module.exports = mongoose.model("eventUsers", usersSchema);
