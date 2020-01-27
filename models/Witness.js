const mongoose = require("mongoose");
const Schema = mongoose.Schema;

// create Witness Schema
const WitnessSchema = new Schema({
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  date: {
    type: Date,
    default: Date.now
  }
});

mongoose.model("witnesses", WitnessSchema);
