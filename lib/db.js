/**
 * Created by Vyndee on 28/02/2017.
 */
var mongoose = require('mongoose');
var mongoUrl = process.env.MONGO_URL || 'mongodb://helaChikhaoui:12345678@ds127492.mlab.com:27492/users_notifs_data';

module.exports = function (app) {
  mongoose.connect(mongoUrl, {
    mongoose: {
      safe: true
    }
  }, function (err) {
    if (err) {
      return console.log('Mongoose - connection error:', err);
    }
  });

  // mongoose.set('debug', true);

  return mongoose;
};
