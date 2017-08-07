const express = require('express');
const router = express.Router();
var prediction = require('../routes/prediction');
var stats = require('../routes/stats');



/* GET api listing. */
router.get('/', function (req, res) {
  res.send('api works');
});

router.use(function (req, res, next) {
  // do logging

  res.header('Access-Control-Allow-Origin', '*');
  // Request methods you wish to allow
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');

  // Request headers you wish to allow
  res.setHeader('Access-Control-Allow-Headers', 'Access-Control-Allow-Headers', 'Content-Type, Authorization, Content-Length, X-Requested-With');

  // Set to true if you need the website to include cookies in the requests sent
  // to the API (e.g. in case you use sessions)
  res.setHeader('Access-Control-Allow-Credentials', true);
  // console.log(req);
  console.log('###### Request Triggered ######');

  console.log('From :' + req.url);
  if (req.body !== null) {
    console.log('With a body content :' + JSON.stringify(req.body));
  }
  console.log('###############################');
  console.log('');

  next(); // make sure we go to the next routes and don't stop here
});


router.route("/prediction/dataset")
  .get(prediction.writeDataSet);
router.route("/predict")
  .post(prediction.predictionByDate);
router.route("/stats/categories")
  .get(stats.categoriesAnalytics);
router.route("/stats/userCategories")
  .get(stats.categoryPerUser);
router.route("/stats/data")
  .get(stats.getData);
router.route("/stats/storeCategories")
  .get(stats.storeCategories);
router.route("/stats/storesInformation")
  .post(stats.getStoresInformation);
router.route("/stats/storesPerCategory")
  .post(stats.searchStoresPerCategory);


module.exports = router;
