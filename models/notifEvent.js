

var mongoose = require("mongoose");

var NotifEventSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true,
    index: {
      unique: true
    }
  },

  storename: {
    type: String,
    required: true
  },
  major: {
    type: String,
    required: true
  },
  minor: {
    type: String,
    required: true
  },
  offer: {
    type: String,
    required: true

  },
  category: {
    type: String,
    required: true

  },
  date: {
    type: String,
    required: false
  },
  user: {
    type: String,
    required: false
  }
});

module.exports = mongoose.model("notifevents", NotifEventSchema);
