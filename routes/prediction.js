var ClickEvent = require("../models/notifEvent");
var mongoose = require("mongoose");
var fs = require("fs");


module.exports = {
    writeDataSet2: function() {


        var clickEvents;
        ClickEvent.find({}).sort('-category').exec(function(err, b) {
            if (!err) {
                clickEvents = b;
                var data = [];
                var category = clickEvents[0].category;
                var events = [];
                events.push({
                    clickEvent: clickEvents[0]
                });
                for (var i = 1; i < clickEvents.length; i++) {
                    if (clickEvents[i].category == category)
                        events.push({
                            clickEvent: clickEvents[i]
                        });
                    else {
                        data.push({
                            category,
                            events
                        });
                        events = [];
                        events.push({
                            clickEvent: clickEvents[i]
                        });
                        category = clickEvents[i].category;

                    }

                }
                if (clickEvents[clickEvents.length - 1].category == category)
                    data.push({
                        category,
                        events
                    });


                fs.writeFile("dataset.json", JSON.stringify(data), "utf8", function(res) {
                    updateDataSet();

                });

            }
        });


        function updateDataSet() {
            fs.readFile("analytics.json", "utf8", function readFileCallback(err, data) {
                if (!err) {
                    fs.readFile("dataset.json", "utf8", function readFileCallback(err, data) {
                        if (err) {
                            res.status(500).send({
                                success: false,
                                message: "Not existing Data "
                            });
                        } else {
                            data = JSON.parse(data);
                            var result = [];
                            var data_dates = [];
                            for (var k = 0; k < data.length; k++) {
                                for (var j = 0; j < data[k].events.length; j++)
                                    data_dates.push(new Date(data[k].events[j].clickEvent.date));
                                data[k].dates = data_dates;
                                data_dates = [];
                            }
                            for (var k = 0; k < data.length; k++) {
                                var i = 0;
                                var dates = [];
                                var total = 0;
                                while (i < data[k].dates.length) {
                                    var date = data[k].dates[i].toString();
                                    var s = 1;
                                    i++;
                                    console.log("data " + i + "=>", data[k].dates[i]);

                                    while (i < data[k].dates.length && date.localeCompare((data[k].dates[i])) == 0) {
                                        s++;
                                        i++;
                                    }
                                    total += s;
                                    dates.push({
                                        date: date,
                                        clicks: s
                                    });
                                }
                                result.push({
                                    category: data[k].category,
                                    dates: dates,
                                    total: total
                                });
                            }

                            fs.writeFile("analytics.json", JSON.stringify(result), "utf8", function(res) {
                                console.log("success update dataset");
                            });
                            finalResult = result;

                        }
                    })
                } else {
                    console.log("Error updating dataset ");

                }
            });
        }

    },

    writeDataSet: function(req, res) {


        var clickEvents;
        ClickEvent.find({}).sort('-category').exec(function(err, b) {
            if (!err) {
                clickEvents = b;
                var data = [];
                var category = clickEvents[0].category;
                var events = [];
                events.push({
                    clickEvent: clickEvents[0]
                });
                for (var i = 1; i < clickEvents.length; i++) {
                    if (clickEvents[i].category == category)
                        events.push({
                            clickEvent: clickEvents[i]
                        });
                    else {
                        data.push({
                            category,
                            events
                        });
                        events = [];
                        events.push({
                            clickEvent: clickEvents[i]
                        });
                        category = clickEvents[i].category;

                    }

                }
                if (clickEvents[clickEvents.length - 1].category == category)
                    data.push({
                        category,
                        events
                    });


                fs.writeFile("dataset.json", JSON.stringify(data), "utf8", function(res) {
                    updateDataSet();

                });

                res.json({
                    success: data
                });
            }
        });


        function updateDataSet() {
            fs.readFile("analytics.json", "utf8", function readFileCallback(err, data) {
                if (!err) {
                    fs.readFile("dataset.json", "utf8", function readFileCallback(err, data) {
                        if (err) {
                            res.status(500).send({
                                success: false,
                                message: "Not existing Data "
                            });
                        } else {
                            data = JSON.parse(data);
                            var result = [];
                            var data_dates = [];
                            for (var k = 0; k < data.length; k++) {
                                for (var j = 0; j < data[k].events.length; j++)
                                    data_dates.push(new Date(data[k].events[j].clickEvent.date));
                                data[k].dates = data_dates;
                                data_dates = [];
                            }
                            for (var k = 0; k < data.length; k++) {
                                var i = 0;
                                var dates = [];
                                var total = 0;
                                while (i < data[k].dates.length) {
                                    var date = data[k].dates[i].toString();
                                    var s = 1;
                                    i++;
                                    console.log("data " + i + "=>", data[k].dates[i]);

                                    while (i < data[k].dates.length && date.localeCompare((data[k].dates[i])) == 0) {
                                        s++;
                                        i++;
                                    }
                                    total += s;
                                    dates.push({
                                        date: date,
                                        clicks: s
                                    });
                                }
                                result.push({
                                    category: data[k].category,
                                    dates: dates,
                                    total: total
                                });
                            }

                            fs.writeFile("analytics.json", JSON.stringify(result), "utf8", function(res) {
                                console.log("success update dataset");
                            });
                            finalResult = result;

                        }
                    })
                } else {
                    console.log("Error updating dataset ");

                }
            });
        }

    },


    predictionByDate: function(req, res) {
        var datePredicted = convertStringToDate(req.body.date);
        console.log('daate', req.body);
        //var datePredicted = req.body.date;
        var finalResult;
        fs.readFile("analytics.json", "utf8", function readFileCallback(err, data) {
            if (!err) {
                finalResult = data;
                finalResult = predictionAlgo(JSON.parse(data), req.body.date);
                res.json({
                    "success": "true",
                    "data": finalResult
                });
            }
        });


        function predictionAlgo(data, datePredicted) {

            var finalResult = [];
            for (var i = 0; i < data.length; i++) {

                var lastDate = convertDate(data[i].dates[data[i].dates.length - 1].date);
                var diff = dateDiff(lastDate, datePredicted);
                var length = data[i].dates.length;
                var total = data[i].total;
                var moy = 0;
                for (j = 0; j < diff.day; j++) {
                    moy = total / length;
                    total += moy;
                    length += 1;
                }
                console.log(data[i].category, " moy ", moy);
                var length = 0;
                var total = 0;
                //second Moy : jours de la semaine
                var moyDay = 0;
                for (j = 0; j < data[i].dates.length; j++) {
                    var date = convertDate(data[i].dates[j].date);
                    if (new Date(data[i].dates[j].date).getDay() == (new Date(datePredicted)).getDay()) {
                        length++;
                        total += data[i].dates[j].clicks;
                    }

                }
                if (length != 0)
                    moyDay = total / length;
                else
                    moyDay = 0;
                resMoy = Math.round((moyDay + moy) / 2);
                console.log("moy", moy, "moyDay", moyDay, "resMoy ", resMoy);

                finalResult.push({
                    category: data[i].category,
                    predicted: resMoy
                });
            }
            console.log("**************************** \n ********************");

            return finalResult;
        }

        function dateDiff(date1, date2) {
            var diff = {} // Initialisation du retour
            var tmp = new Date(date2) - new Date(date1);

            tmp = Math.floor(tmp / 1000); // Nombre de secondes entre les 2 dates
            diff.sec = tmp % 60; // Extraction du nombre de secondes

            tmp = Math.floor((tmp - diff.sec) / 60); // Nombre de minutes (partie entière)
            diff.min = tmp % 60; // Extraction du nombre de minutes

            tmp = Math.floor((tmp - diff.min) / 60); // Nombre d'heures (entières)
            diff.hour = tmp % 24; // Extraction du nombre d'heures

            tmp = Math.floor((tmp - diff.hour) / 24); // Nombre de jours restants
            diff.day = tmp;

            console.log(diff);

            return diff;
        }
    }

};

function convertDate(date) {
    var parts = date.split(" ");
    return new Date((new Date(date)).getFullYear(), (new Date(date)).getMonth(), parts[2]);
};

function convertStringToDate(date) {
    var parts = date.split("/");
    return new Date(parts[2], parts[1] - 1, parts[0]);
};

function convertString(date) {
    return date.getDate() + "/" + (date.getMonth() + 1) + "/" + date.getFullYear();
}
