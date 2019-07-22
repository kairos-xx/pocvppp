var serviceUrl = "https://cloconsultingpocvpp-webapp.azurewebsites.net/data";

function drawBarChart(data) {
    var target;
    var colors = ["#ff931e", "#ff3dff", "#7ac943", "#55c4c4"];
    var labels = [];
    var dataNormal = [];
    var dataMin = [];
    var dataNormalPlus = [];
    $.each(data, function(key, value) {
        $.each(value["buildings"], function(key, value) {
            dataNormalPlus.push(value["tooltipNormal"]);
        });
    });
    $.each(data, function(key, value) {
        target = "bar" + key;
        title = value["hourStart"] + "-" + value["hourFinish"] + "h";
        subtitle = value["subtitle"];
        labels = [];
        dataNormal = [];
        dataMin = [];
        $("#bar" + key + "Subtitle")[0].firstChild.nodeValue = subtitle;
        $.each(value["buildings"], function(key, value) {
            labels.push(value["id"]);
            dataNormal.push(value["normal"]);
            dataMin.push(value["min"]);
        });
        var ctx = document.getElementById(target).getContext('2d');
        ctx.height = 500;
        Chart.defaults.global.defaultFontFamily = 'edp_preonregular';
        window.myBar = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [{
                    backgroundColor: colors,
                    data: dataMin
                }, {
                    backgroundColor: "rgba(41,171,226,0.5)",
                    data: dataNormal
                }]
            },
            defaultFontFamily: 'edp_preonthin',
            defaultFontSize: 16,
            options: {
                title: {
                    display: true,
                    text: "    " + title,
                    fontSize: 20,
                    fontColor: "rgba(255,255,255,0.5)",
                    fontFamily: 'edp_preonthin',
                },
                legend: {
                    display: false
                },
                borderWidth: 0,
                tooltips: {
                    enabled: true,
                    callbacks: {
                        label: function(tooltipItem, data) {
                            var label = data.datasets[tooltipItem.datasetIndex].label
                            if (tooltipItem["datasetIndex"] == 1) {
                                label = data["datasets"][1]["data"][tooltipItem["index"]] + data["datasets"][0]["data"][tooltipItem["index"]] + " non minimized"
                            } else {
                                label = data["datasets"][0]["data"][tooltipItem["index"]] + " minimized"
                            }
                            return label
                        }
                    }
                },
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    xAxes: [{
                        stacked: true,
                        gridLines: {
                            zeroLineColor: '#000',
                            color: "rgba(0, 0, 0, 0)",
                            display: false,
                        },
                        display: false
                    }],
                    yAxes: [{
                        stacked: true,
                        gridLines: {
                            zeroLineColor: 'rgba(255,255,255,0.5)',
                            color: "#ccc",
                        },
                        ticks: {
                            callback: function(value, index, values) {
                                if (index == 0 || index == values.length - 1) {
                                    return value
                                }
                            },
                            max: Math.max.apply(null, dataNormalPlus),
                            fontColor: "#CCC",
                            lineColor: "#f00",
                            padding: 10
                        }
                    }]
                }
            }
        });
    });
};

function drawCircleChart(data) {
    $.each(data, function(key, value) {
        var dwidth = $("#" + value["target"]).width();
        var dheight = $("#" + value["target"]).height();
        bonsai.run($("#" + value["target"])[0], {
            width: dwidth - 10,
            height: dheight - 10,
            chartData: value,
            code: function() {
                var arc;
                var width = stage.options.width;
                var height = stage.options.height;
                var min = Math.min(width, height);
                var max = Math.max(width, height);

                function degrees_to_radians(degrees) {
                    var pi = Math.PI;
                    return degrees * (pi / 180);
                };
                var object = stage.options.chartData;

                function drawExteriorArc(properties, propertiesTitle) {
                    var attr = {
                        strokeWidth: properties["strokeWidth"],
                        strokeColor: properties["strokeColor"]
                    };
                    var openAngle = properties["openAngle"];
                    var angleStart = openAngle - 90;
                    var angleEnd = 180 + angleStart;
                    var angleStartRad = degrees_to_radians(angleStart);
                    var angleEndRad = degrees_to_radians(angleEnd);
                    var margin = properties["strokeWidth"];
                    var x;
                    var y;
                    var arc;
                    if (width < height) {
                        x = min / 2;
                        y = max / 2;
                    } else {
                        x = max / 2;
                        y = min / 2;
                    };
                    y += max / 20
                    var size = min / 2 - margin;
                    arc = new Arc(x, y, size, angleStartRad, angleEndRad, 1).attr(attr);
                    stage.addChild(arc);
                    properties["x"] = x;
                    properties["y"] = y;
                    properties["size"] = size;
                    return properties;
                };

                function drawMinMaxLine(properties, exteriorArcProperties) {
                    var attr = {
                        strokeWidth: properties["strokeWidth"],
                        strokeColor: properties["strokeColor"]
                    };
                    var startPercent = properties["startPercent"];
                    var endPercent = properties["endPercent"];
                    var openAngle = exteriorArcProperties["openAngle"];
                    var angleStart = openAngle - 90;
                    var totalAngle = 360 - openAngle * 2;
                    var angleNormal = 360 - (1 - startPercent) * totalAngle - angleStart;
                    var angleMinimized = (1 - endPercent) * totalAngle + angleStart;
                    var angleNormalRad = degrees_to_radians(angleNormal);
                    var angleMinimizedRad = degrees_to_radians(angleMinimized);
                    x = exteriorArcProperties["x"];
                    y = exteriorArcProperties["y"];
                    size = exteriorArcProperties["size"];
                    var arc = new Arc(x, y, size, angleMinimizedRad, angleNormalRad, 1).attr(attr);
                    properties["angleMinimizedRad"] = angleMinimizedRad;
                    properties["angleNormalRad"] = angleNormalRad;
                    stage.addChild(arc);
                    return properties;
                };



                function drawMinMaxHands(properties, exteriorArcProperties, minmaxArcProperties) {
                    var size;
                    var x = exteriorArcProperties["x"];
                    var y = exteriorArcProperties["y"];
                    var attrMin = {
                        strokeWidth: properties["min"]["strokeWidth"],
                        strokeColor: properties["min"]["strokeColor"]
                    };
                    var angleNormalRad = minmaxArcProperties["angleNormalRad"];
                    size = exteriorArcProperties["size"] * properties["min"]["length"];

                    var xNormal = Math.cos(angleNormalRad) * size;
                    var yNormal = Math.sin(angleNormalRad) * size;
                    var pathNormal = new Path()
                        .moveTo(x, y)
                        .lineTo(xNormal + x, yNormal + y)
                        .closePath()
                        .attr(attrMin);
                    stage.addChild(pathNormal);
                    var attrMax = {
                        strokeWidth: properties["max"]["strokeWidth"],
                        strokeColor: properties["max"]["strokeColor"]
                    };
                    var angleMinimizedRad = minmaxArcProperties["angleMinimizedRad"];
                    size = exteriorArcProperties["size"] * properties["max"]["length"];
                    var xMinimized = Math.cos(angleMinimizedRad) * size;
                    var yMinimized = Math.sin(angleMinimizedRad - Math.PI) * size;
                    var pathMinimized = new Path()
                        .moveTo(x, y)
                        .lineTo(xMinimized + x, yMinimized + y)
                        .closePath()
                        .attr(attrMax);
                    stage.addChild(pathMinimized);
                };



                function drawMinmaxPie(properties, exteriorArcProperties, minmaxArcProperties) {
                    var size = exteriorArcProperties["size"];
                    var attr = {
                        strokeWidth: size - minmaxArcProperties["strokeWidth"],
                        strokeColor: properties["backgroundColor"]
                    };
                    var angleNormalRad = minmaxArcProperties["angleNormalRad"];
                    var angleMinimizedRad = minmaxArcProperties["angleMinimizedRad"];
                    var x = exteriorArcProperties["x"];
                    var y = exteriorArcProperties["y"];
                    var arc = new Arc(x, y, size / 2, angleMinimizedRad, angleNormalRad, 1).attr(attr);
                    stage.addChild(arc);
                };



                function drawCenterCircle(properties, exteriorArcProperties) {
                    var x = exteriorArcProperties["x"];
                    var y = exteriorArcProperties["y"];
                    var radius = exteriorArcProperties["size"] * properties["size"];
                    var circle = new Circle(x, y, radius).fill(properties["backgroundColor"]);
                    stage.addChild(circle);
                    properties["diameter"] = radius * 2;
                    return properties;
                };


                function drawTicks(properties, centerProperties, exteriorArcProperties) {
                    var size;
                    var span;
                    var percent;
                    var openAngle;
                    var angleStart;
                    var totalAngle;
                    var angle;
                    var angleRad;
                    var xTickOut;
                    var yTickOut;
                    var xTickIn;
                    var yTickIn;
                    var pathBig;
                    var pathSmall;
                    var xTickOutFirst;
                    var yTickOutFirst;
                    var x = exteriorArcProperties["x"];
                    var y = exteriorArcProperties["y"];
                    var big = properties["big"]
                    var small = properties["small"]
                    var attrBig = {
                        strokeWidth: big["strokeWidth"],
                        strokeColor: big["strokeColor"]
                    };
                    size = exteriorArcProperties["size"] * (1 - big["length"]);
                    span = big["span"];
                    for (var i = 0; i < big["percent"].length; i++) {
                        percent = big["percent"][i];
                        openAngle = exteriorArcProperties["openAngle"];
                        angleStart = openAngle - 90;
                        totalAngle = 360 - openAngle * 2;
                        angle = 360 - (1 - percent) * totalAngle - angleStart;
                        angleRad = degrees_to_radians(angle);
                        xTickOut = Math.cos(angleRad) * size;
                        yTickOut = Math.sin(angleRad) * size;
                        xTickIn = Math.cos(angleRad) * (exteriorArcProperties["size"] - (span * size));
                        yTickIn = Math.sin(angleRad) * (exteriorArcProperties["size"] - (span * size));

                        if (i == 0) {
                            xTickOutFirst = xTickOut;
                            yTickOutFirst = yTickOut;
                        };
                        pathBig = new Path()
                            .moveTo(xTickIn + x, yTickIn + y)
                            .lineTo(xTickOut + x, yTickOut + y)
                            .closePath()
                            .attr(attrBig);
                        stage.addChild(pathBig);
                    }
                    var xTickOutLast = xTickOut;
                    var yTickOutLast = yTickOut;
                    var attrSmall = {
                        strokeWidth: small["strokeWidth"],
                        strokeColor: small["strokeColor"]
                    };
                    size = exteriorArcProperties["size"] * (1 - small["length"]);
                    span = small["span"];
                    for (var i = 0; i < small["percent"].length; i++) {
                        percent = small["percent"][i];
                        openAngle = exteriorArcProperties["openAngle"];
                        angleStart = openAngle - 90;
                        totalAngle = 360 - openAngle * 2;
                        angle = 360 - (1 - percent) * totalAngle - angleStart;
                        angleRad = degrees_to_radians(angle);
                        xTickOut = Math.cos(angleRad) * size;
                        yTickOut = Math.sin(angleRad) * size;
                        xTickIn = Math.cos(angleRad) * (exteriorArcProperties["size"] - (span * size));
                        yTickIn = Math.sin(angleRad) * (exteriorArcProperties["size"] - (span * size));
                        pathSmall = new Path()
                            .moveTo(xTickIn + x, yTickIn + y)
                            .lineTo(xTickOut + x, yTickOut + y)
                            .closePath()
                            .attr(attrSmall);
                        stage.addChild(pathSmall);
                    };
                    yText = y + centerProperties["diameter"];
                    var min = properties["min"];
                    span = min["span"];
                    textMin = new Text(min["text"]).attr({
                        x: xTickOutFirst + x + span,
                        y: yText + min["fontSize"] / 2,
                        textAlign: "left",
                        fontSize: min["fontSize"],
                        textFillColor: min["textFillColor"],
                        fontFamily: properties["fontFamily"]
                    });
                    stage.addChild(textMin);
                    var max = properties["max"];
                    span = max["span"];
                    textMin = new Text(max["text"]).attr({
                        x: xTickOutLast + x - span,
                        y: yText + max["fontSize"] / 2,
                        textAlign: "right",
                        fontSize: max["fontSize"],
                        textFillColor: max["textFillColor"],
                        fontFamily: properties["fontFamily"]
                    });
                    stage.addChild(textMin);
                };

                function drawCenterText(properties, exteriorArcProperties) {
                    var x = exteriorArcProperties["x"];
                    var y = exteriorArcProperties["y"];
                    var radius = exteriorArcProperties["size"] * properties["size"];
                    var value = properties["value"];
                    var valueFontSize = value["fontSize"]
                    var centerText = new Text(value["text"]).attr({
                        x: x,
                        y: y + value["fontSize"] / 2 + value["span"],
                        textAlign: "center",
                        fontSize: exteriorArcProperties["size"] / 3,
                        textFillColor: value["textFillColor"],
                        fontFamily: value["fontFamily"]
                    });
                    stage.addChild(centerText);
                    var unit = properties["unit"];
                    var centerText = new Text(unit["text"]).attr({
                        x: x,
                        y: y + value["fontSize"] / 2 + value["span"] + exteriorArcProperties["size"] / 3,
                        textAlign: "center",
                        fontSize: exteriorArcProperties["size"] / 5,
                        textFillColor: unit["textFillColor"],
                        fontFamily: unit["fontFamily"]
                    });
                    stage.addChild(centerText);
                };


                function drawTitle(properties) {
                    if (width < height) {
                        x = min / 2;
                        y = max / 2;
                    } else {
                        x = max / 2;
                        y = min / 2;
                    };
                    var size = max / 10;
                    var titleText = new Text(properties["text"]).attr({
                        x: x,
                        y: 0,
                        textAlign: "center",
                        fontSize: size,
                        textFillColor: properties["textFillColor"],
                        fontFamily: properties["fontFamily"]
                    });
                    stage.addChild(titleText);
                };
                drawTitle(object["title"]);
                object["exteriorArc"] = drawExteriorArc(object["exteriorArc"], object["title"]);
                object["minmaxArc"] = drawMinMaxLine(object["minmaxArc"], object["exteriorArc"]);
                drawMinmaxPie(object["minmaxPie"], object["exteriorArc"], object["minmaxArc"]);
                drawMinMaxHands(object["minmaxHands"], object["exteriorArc"], object["minmaxArc"]);
                object["centerCircle"] = drawCenterCircle(object["centerCircle"], object["exteriorArc"]);
                drawTicks(object["ticks"], object["centerCircle"], object["exteriorArc"]);
                drawCenterText(object["centerText"], object["exteriorArc"]);

            }
        });
    });
};


function drawTotalSaving(value) {
    $("#potencial-saving-value")[0].firstChild.nodeValue = Math.round(value * 100) / 100;
}

function checkProperties() {
    var timeframe
    if ($("#timeframe").prop('checked')) {
        timeframe = "24hours";
    } else {
        timeframe = "48hours";
    };
    return {
        "timeFrame": timeframe,
        "states": {
            "globalState": $("#globalswitch").prop('checked'),
            "buildingStates": {
                "b01": $("#b01s").prop('checked'),
                "b02": $("#b02s").prop('checked'),
                "b03": $("#b03s").prop('checked'),
                "b04": $("#b04s").prop('checked')
            }
        }
    };
};

function changeToggle(states) {
    $("#globalswitch").prop('checked', states["globalState"]);
    $.each(states["buildingStates"], function(key, value) {
        $("#" + key + "s").prop('checked', value);
    });
};

function convertDict(dict) {
    var barData = [];
    var circleData = [];
    var letters = ["a", "b", "c", "d"];

    $.each(dict["buildings"][0]["timeIntervals"], function(key, value) {
        barData.push({ "hourStart": value["hourStart"], "hourFinish": value["hourFinish"], "buildings": [], "subtitle": 0 });
    });
    $.each(dict["buildings"], function(key, value) {
        $.each(value["timeIntervals"], function(key2, value2) {
            $.each(barData, function(key3, value3) {
                if (value2["hourStart"] == value3["hourStart"] && value2["hourFinish"] == value3["hourFinish"]) {
                    barData[key3]["buildings"].push({ "id": value["name"], "min": value2["minimized"], "normal": value2["nonMinimized"] - value2["minimized"], "tooltipNormal": value2["nonMinimized"] });
                    barData[key3]["subtitle"] += Math.round(value2["power"] * 100) / 100;
                };
            });
            var circleDataTemplate = {
                "target": value["id"] + letters[key2],
                "exteriorArc": {
                    "strokeWidth": 2,
                    "strokeColor": "rgb(255,255,255)",
                    "openAngle": 70
                },
                "minmaxArc": {
                    "strokeWidth": 4,
                    "strokeColor": "rgb(41,171,226)",
                    "startPercent": value2["minimizedPerc"],
                    "endPercent": value2["nonMinimizedPerc"]
                },
                "minmaxHands": {
                    "min": {
                        "strokeWidth": 1.5,
                        "strokeColor": "rgb(41,171,226)",
                        "length": 0.8
                    },
                    "max": {
                        "strokeWidth": 1.5,
                        "strokeColor": "rgb(255,255,255)",
                        "length": 0.8
                    }
                },
                "centerCircle": {
                    "size": 0.08,
                    "backgroundColor": "rgb(255,255,255)"
                },
                "minmaxPie": {
                    "backgroundColor": "rgba(41,171,226,0.4)"
                },
                "ticks": {
                    "big": {
                        "percent": [0, 0.25, 0.5, 0.75, 1],
                        "length": 0.1,
                        "span": 0,
                        "strokeWidth": 1,
                        "strokeColor": "rgb(255,255,255)"
                    },
                    "small": {
                        "percent": [0.12, 0.37, 0.62, 0.87],
                        "length": 0.15,
                        "span": 0.1,
                        "strokeWidth": 1.5,
                        "strokeColor": "rgb(255,255,255)"
                    },
                    "min": {
                        "text": Math.round(value["minEnergy"]),
                        "fontSize": 7,
                        "fontFamily": "edp_preonthin",
                        "textFillColor": "rgb(255,255,255)",
                        "span": 7
                    },
                    "max": {
                        "text": Math.round(value["maxEnergy"]),
                        "fontSize": 7,
                        "fontFamily": "edp_preonthin",
                        "textFillColor": "rgb(255,255,255)",
                        "span": 7
                    }
                },
                "centerText": {
                    "value": {
                        "text": Math.round(value2["power"] * 100) / 100,
                        "fontSize": 16,
                        "fontFamily": "edp_preonregular",
                        "textFillColor": "rgb(41,171,226)",
                        "span": 8
                    },
                    "unit": {
                        "text": "kW",
                        "fontSize": 10,
                        "fontFamily": "edp_preonregular",
                        "textFillColor": "rgb(41,171,226)",
                        "span": 12
                    }
                },
                "title": {
                    "text": value2["hourStart"] + "-" + value2["hourFinish"] + "h",
                    "fontSize": 16,
                    "fontFamily": "edp_preonthin",
                    "textFillColor": "rgb(122,122,122)",
                    "span": 0
                }
            };
            circleData.push(circleDataTemplate);
        });
    });
    changeToggle(dict["states"]);
    drawTotalSaving(dict["potentialTotalSaving"])
    drawBarChart(barData);
    drawCircleChart(circleData);
}

function callServiceStart(globalProperties) {
    var settings = {
        "async": true,
        "crossDomain": true,
        "url": serviceUrl,
        "method": "POST",
        "headers": {
            "Content-Type": "application/json",
            "cache-control": "no-cache",
        },
        "processData": false,
        "data": JSON.stringify(globalProperties)
    }
    $.ajax(settings).done(function(response) {
        response = JSON.parse(response);
        convertDict(response);
        $(".loader").delay(2000).fadeOut("slow");
        $("#overlayer").delay(2000).fadeOut("slow");
        $("input[type='checkbox']").change(function() {
            globalProperties = checkProperties();
            callService(globalProperties);
        });
    });
};

function callService(globalProperties) {
    var settings = {
        "async": true,
        "crossDomain": true,
        "url": serviceUrl,
        "method": "POST",
        "headers": {
            "Content-Type": "application/json",
            "cache-control": "no-cache",
        },
        "processData": false,
        "data": JSON.stringify(globalProperties)
    };
    $.ajax(settings).done(function(response) {
        var currentUrl = window.location.href;
        var parsedUrl = $.url(currentUrl);
        window.location.href = currentUrl.replace("?" + parsedUrl.attr('query'), "") + "?time=" + globalProperties["timeFrame"];
    });
};

$(document).ready(function() {
    var currentUrl = window.location.href;
    var parsedUrl = $.url(currentUrl);
    var params = parsedUrl.param();
    var timeframe;
    window.resizeBy(1600, 1200);

    if ($.isEmptyObject(params)) {
        window.location.href = currentUrl + "?time=24hours";
    } else {
        timeframe = params["time"];
    }
    if (timeframe == "24hours") {
        $("#timeframe").prop('checked', true);
    } else {
        $("#timeframe").prop('checked', false);
    }
    var globalProperties = { "timeFrame": checkProperties()["timeFrame"] };
    callServiceStart(globalProperties);
    $(".body").height("55%");
});