var app = require('./lib/app');
const http = require('http');
var api = require('./lib/api');
var express = require('express');
var path = require('path');
var CronJob = require('cron').CronJob;
var prediction = require('./routes/prediction');




//Set our api routes
app.use("/api", api);

// Catch all other routes and return the index file
// Point static path to dist
app.use(express.static(path.join(__dirname, 'dist')));
app.get('*', function (req, res) {
  console.log(" api working ");
  res.status(201).json("api working !");
});
new CronJob('0 0 * * *', function() {
  prediction.writeDataSet2();
  console.log(" ++1h");

}, null, true, 'America/Los_Angeles');
const port = process.env.PORT || '3000';
app.set('port', port);

/**
 * Create HTTP server.
 */
const server = http.createServer(app);

/**
 * Listen on provided port, on all network interfaces.
 */
server.listen(port, function () {
  console.log("Server running !!");
});
