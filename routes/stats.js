var ClickEvent = require("../models/notifEvent");
var mongoose = require("mongoose");
var fs = require("fs");
var dbData = [];



module.exports = {
    getData: function(req, res) {


    },
    //assuming that a store has only one category
    getStoresInformation: function(req, res) {
        var store = req.body.store;
        storeCategoriesNumber(store, function(result) {
            console.log(result[0].categories[0].category);
            ClickEvent.find({
                'category': result[0].categories[0].category
            }).exec(function(err, data) {
                var totalCat = data.length;
                var storeCat = result[0].categories[0].nb;
                ClickEvent.find({
                    'storename': store
                }).exec(function(err, data2) {
                    var storeUsers = data2.length;
                    ClickEvent.find({}).exec(function(err, data3) {
                        ClickEvent.find({
                            'category': result[0].categories[0].category
                        }).distinct('storename').exec(function(err, data4) {

                            var storeUsers = data2.length;
                            var totalUsers = data3.length;

                            var nb_CatStores = data4.length;
                            var resF = [];
                            //percentage of interested users in that category of that store
                            // for total users that are interested in that category
                            resF.push({
                                description: 'Intéressés  parmi ceux qui préfèrent la catégorie ' + result[0].categories[0].category,
                                stats: (storeCat / totalCat * 100).toFixed(2) + ' %',
                                icon: 'person',
                            });
                            resF.push({
                                description: 'Nombre de magasins pour la catégorie \n ' + result[0].categories[0].category,
                                stats: nb_CatStores,
                                icon: 'person',
                            });
                            resF.push({
                                description: 'Nombre des utilisateurs intéressés par ce magasin',
                                stats: storeUsers,
                                icon: 'person',
                            });
                            //percentage of interested users from total users
                            resF.push({
                                description: 'Utilisateurs intéressés par ce magasin',
                                stats: (storeUsers / totalUsers * 100).toFixed(2) + ' %',
                                icon: 'person',
                            });
                            res.json({
                                success: "true",
                                data: resF
                            });
                        });
                    });
                });
            });



        });


    },
    searchStoresPerCategory: function(req, res) {
        var category = req.body.category;
        ClickEvent.find({
            'category': category
        }).sort('-storename').exec(function(err, data) {
            if (!err) {
                var stores = [];
                var storesCategories = [];
                var resF = [];
                categoriesPerStore(data, function(r) {
                    for (var k = 0; k < r.length; k++) {
                        resF.push({
                            description: 'Magasin : ' + r[k][0].store,
                            stats: r[k][0].categories[0].nb + ' intéressés',
                            icon: 'person',
                        });
                        resF.push({
                            description: 'Magasin : ' + r[k][0].store,
                            stats: (r[k][0].categories[0].nb / data.length * 100).toFixed(2) + ' %',
                            icon: 'person',
                        });
                    }
                    console.log(resF);
                    res.json({
                        success: "true",
                        data: resF
                    })

                });

            } else {
                res.json({
                    success: "false"
                });

            }

        });
    },

    searchCategoriesPerStore: function(req, res) {
        var store = req.body.store;
        ClickEvent.find({
            'storename': store
        }).sort('-category').exec(function(err, data) {
            if (!err) {
                var categories = [];
                for (var i = 0; i < data.length; i++) {
                    categories.push(data[i].category);

                }
                var storeCategories = [];
                storeCategories.push({
                    store: store,
                    categories: categories
                });
                var r = sortStoreCategories(storeCategories);

                res.json({
                    success: "true",
                    data: r
                })
            } else {
                res.json({
                    success: "false"
                });

            }

        });
    },

    categoriesAnalytics: function(req, res) {

        fs.readFile("analytics.json", "utf8", function readFileCallback(err, data) {
            if (err) {
                res.json({
                    success: "false",
                    message: "problem fetching data"
                });
            } else {
                data = JSON.parse(data);
                var result = [];
                var totalClicks = 0;
                for (var k = 0; k < data.length; k++) {
                    totalClicks += data[k].total;
                }
                for (var k = 0; k < data.length; k++) {
                    result.push({
                        label: data[k].category,
                        value: data[k].total,
                        percentage: Math.round(100 * data[k].total / totalClicks)
                    });
                }


                res.json({
                    success: "true",
                    data: result,
                });

            }
        });
    },

    categoryPerUser: function(req, res) {
        ClickEvent.find({}).sort('-user').exec(function(err, data) {
            if (!err) {
                var result = [];
                var user = data[0].user;
                var categories = [];
                categories.push(data[0].category);
                for (var i = 1; i < data.length; i++) {
                    if (data[i].user == user) {
                        categories.push(data[i].category);
                    } else {
                        result.push({
                            "user": user,
                            "categories": categories
                        });
                        categories = [];
                        categories.push(data[i].category);
                        user = data[i].user
                    }

                }
                if (data[data.length - 1].user == user)
                    result.push({
                        "user": user,
                        "categories": categories
                    });
                var res1 = sortUserCategories(result);
                var res2 = userMostLikedCategory(res1);

                res.json({
                    success: "true",
                    data: res2
                });

            } else {
                res.json({
                    success: "false",
                    message: "error fetching data"
                });

            }
        });
    },

    storeCategories: function(req, res) {
        ClickEvent.find({}).sort([
            ['storename', '-1'],
            ['category', '-1']
        ]).exec(function(err, data) {
            if (!err) {
                var result = [];
                var store = data[0].storename;
                var categories = [];
                categories.push(data[0].category);
                for (var i = 1; i < data.length; i++) {
                    if (data[i].storename == store) {
                        categories.push(data[i].category);
                    } else {
                        result.push({
                            "store": store,
                            "categories": categories
                        });
                        categories = [];
                        categories.push(data[i].category);
                        store = data[i].storename
                    }

                }
                if (data[data.length - 1].storename == store)
                    result.push({
                        "store": store,
                        "categories": categories
                    });

                var r = sortStoreCategories(result);
                var resLabels = [];
                var resSeries = [];
                var resF = [];
                for (var k = 0; k < r.length; k++) {
                    resLabels.push(r[k].store);
                    resSeries.push(r[k].categories);
                }
                resF.push({
                    labels: resLabels,
                    series: resSeries
                });

                res.json({
                    success: "true",
                    data: resF
                })
            } else {
                res.json({
                    success: "false "
                })

            }

        })
    }
};

function sortStoreCategories(data) {
    var result = [];
    for (var i = 0; i < data.length; i++) {
        var interData = [];
        var cat = data[i].categories[0];
        var nb = 1;
        for (var j = 1; j < data[i].categories.length; j++) {
            if (data[i].categories[j] == cat) {
                nb++;
            } else {
                interData.push({
                    "category": cat,
                    "nb": nb
                });
                cat = data[i].categories[j];
                nb = 1;
            }

        }
        if (data[i].categories[data[i].categories.length - 1] == cat)
            interData.push({
                "category": cat,
                "nb": nb
            });
        result.push({
            "categories": interData,
            "store": data[i].store
        });
    }
    return result;
}

var getDbData = function(callback) {
    ClickEvent.find().sort('-category').exec(function(err, data) {
        this.dbData = data;
        //console.log(this.dbData);
        callback(this.dbData);

    });

}

var getByStore = function(store, cat, callback) {
    var result = [];
    for (var i = 0; i < this.dbData.length; i++) {
        if ((this.dbData[i].storename == store) && (this.dbData[i].category == cat))
            result.push(this.dbData[i]);
    }
    callback(result);
}

var categoriesStore = function(data, callback) {
    var stores = [];
    getDbData(function(x) {
        for (var j = 0; j < data.length; j++) {
            var store = data[j].storename;
            getByStore(store, data[j].category, function(res) {
                var categories = [];

                for (var i = 0; i < res.length; i++) {
                    categories.push(res[i].category);

                }
                var storeCategories = [];
                storeCategories.push({
                    store: store,
                    categories: categories
                });
                var r = sortStoreCategories(storeCategories);
                stores.push(r);

            })

        }
        var result = [];
        var uniqEl = stores[0];
        result.push(stores[0]);
        for (var k = 0; k < stores.length; k++) {
            console.log("comparing : ", stores[k].store, " and ", uniqEl.store);
            if (stores[k][0].store != uniqEl[0].store) {
                result.push(stores[k]);
                uniqEl = stores[k];
            }
        }
        callback(result);

    })



}
// je dois externaliser à partir de for car asynchrone et la mettre dans un callback, ainsi
var categoriesPerStore = function(data, callback) {
    categoriesStore(data, function(result) {
        callback(result);

    });


}


function sortUserCategories(data) {
    var result = [];
    for (var i = 0; i < data.length; i++) {
        var interData = [];
        var r = data[i].categories.sort();
        data[i].categories = r;
        var cat = data[i].categories[0];
        var nb = 1;
        for (var j = 1; j < data[i].categories.length; j++) {

            if (data[i].categories[j] == cat) {
                nb++;
            } else {
                interData.push({
                    "name": cat,
                    "nb": nb
                });

                cat = data[i].categories[j];
                nb = 1;
            }

        }

        if (data[i].categories[data[i].categories.length - 1] == cat)
            interData.push({
                "name": cat,
                "nb": nb
            });

        result.push({
            "categories": interData,
            "user": data[i].user
        });
    }
    return result;
}

function userMostLikedCategory(data) {

    for (var i = 0; i < data.length; i++) {
        var max = data[i].categories[0];
        for (var j = 1; j < data[i].categories.length; j++) {
            if (data[i].categories[j].nb > max.nb)
                max = data[i].categories[j];
        }
        data[i].categoryMax = max;


    }



    return data;
}

var storeCategoriesNumber = function(store, callback) {
    ClickEvent.find({
        'storename': store
    }).sort('-category').exec(function(err, data) {
        if (!err) {
            var categories = [];
            for (var i = 0; i < data.length; i++) {
                categories.push(data[i].category);

            }
            var storeCategories = [];
            storeCategories.push({
                store: store,
                categories: categories
            });
            var r = sortStoreCategories(storeCategories);
            console.log(JSON.stringify(r));
            callback(r);
        } else {
            return "error";

        }

    });
}
