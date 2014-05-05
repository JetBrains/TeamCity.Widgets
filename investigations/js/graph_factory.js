/*
 * Copyright 2000-2014 JetBrains s.r.o.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

'use strict';

angular.module('investigationsApp.graphs', [])
        .factory("Graph", ['$rootScope', '$log', function ($rootScope, $log) {

          var Graph = function (mode) {
            this.mode = mode;
            $log.info("Graph mode: " + mode.name);
            this.title = mode.title;
            this.dateRanges = this.createDateRanges();
            this.color = d3.scale.ordinal()
                    .range([ "#ff0000", "#bf1b21", "#940a0e", "#5c0002", "#450003", "#35090b"]);
          };

          Graph.prototype.addCanvas = function (replace) {
            if (replace) {
              d3.select("svg")
                      .remove();
            }
            this.details = {assigneesTotal: 0, investigationsTotal: 0, assigneesShown: 0, investigationShown: 0};
            this.height = window.innerHeight - 10;
            this.width = window.innerWidth - 10;
            this.canvas = d3.select("body")
                    .append('svg')
                    //fix width/height issue firefox (http://youtrack.jetbrains.com/issue/LTV-51)
                    .attr("style","width: " + this.width + "px; height: " + this.height + "px;")
                    .attr("class", "canvas").attr("id", "mainCanvas");

            this.canvas.height = this.height;
            this.canvas.width = this.width;
            this.leftBarWidth = this.width / 5 + 100;
            this.bottomPanelHeight = 35;
            this.top = 0;
            this.maxSlice = this.height / 40;
            this.slices = Math.round(this.maxSlice) - 5;
            this.lineHeight = (this.height - this.top) / this.maxSlice;
            this.titleLineHeight = 32;
          };


          Graph.prototype.draw = function () {
            var self = this;
            var invest = this.canvas.selectAll(".state")
                    .data(this.data)
                    .enter().append("g")
                    .attr("class", "g");

            invest.selectAll("rect")
                    .data(function (d) {
                      return d.ranges
                    })
                    .enter()
                    .append('rect')
                    .attr("class", "bar")
                    .attr('height', (this.lineHeight - this.lineHeight / 4))
                    .attr('width', function (d) {
                      return self.xScale(d.x1) - self.xScale(d.x0);
                    })
                    .attr('x', function (d) {
                      return self.xScale(d.x0);
                    })
                    .attr('y', function (d) {
                      return self.yScale(d.y0) - self.lineHeight / 2 - 5;
                    })
                    .style("fill", function (d, i) {
                      return self.color(i);
                    });


            invest.selectAll("text")
                    .data(function (d) {
                      return d.ranges;
                    })
                    .enter()
                    .append('text')
                    .attr("text-anchor", "end")
                    .attr({'x': function () {
                      return self.leftBarWidth - 5;
                    }, 'y': function (d) {
                      return  self.yScale(d.y0);
                    }})
                    .text(function (d, i) {
                      if (i == 0) {
                        return d.total;
                      } else {
                        return "";
                      }
                    })
                    .attr("class", "numbers");
          };

          Graph.prototype.addBottomPanel = function () {
            var description;
            if (this.details.assigneesShown == 0) {
              description = "No investigations found."
            } else {
              var updateDate = "Last updated " + moment(this.details.updateDetails).format('MMMM Do') + " @ "
                      + moment(this.details.updateDetails).format('HH:mm');
              description = "Showing top " + this.details.assigneesShown + " assignees (out of " + this.details.assigneesTotal +
                      ") handling " + Math.round((this.details.investigationShown / this.details.investigationsTotal * 100))
                      + "% of all investigations. " + updateDate;
            }

            this.canvas.append("text")
                    .attr("x", 10)
                    .attr("y", this.height - 10)
                    .attr("text-anchor", "start")
                    .attr("class", "description")
                    .text(description);
          };

          Graph.prototype.addLegend = function () {
            var self = this;
            var legendBarHeight = 300;
            var legendBarWidth = 270;
            var xp = 20;
            var yp = 20;
            var margin = 40;

            var x = this.width - legendBarWidth - margin;
            var y = this.height - legendBarHeight - margin;

            var legendPlate = this.canvas.append("g")
                    .attr("transform", "translate(" + x + "," + y + ")");

            legendPlate.append("rect")
                    .attr("x", 0)
                    .attr("y", 0)
                    .attr('width', legendBarWidth)
                    .attr('height', legendBarHeight)
                    .attr('class', 'legendBar');

            var title = legendPlate.append("text")
                    .attr("text-anchor", "start")
                    .attr("class", "title")
                    .attr("transform", "translate(" + xp + "," + 2 * yp + ")");
            var ti = 0;
            this.title.forEach(function (item) {
              title.append("tspan").text(item).attr("x", 0).attr("y", ti += (+self.titleLineHeight));
            });
            var lh = 30;
            var lhp = 5;

            var legend = legendPlate.selectAll(".legendPlate")
                    .data(this.color.domain().slice())
                    .enter().append("g")
                    .attr("class", "legendPlate")
                    .attr("transform", function (d, i) {
                      return "translate(" + (xp) + "," + (1.5 * yp + 3 * self.titleLineHeight + i * lh) + ")";
                    });

            legend.append("rect")
                    .attr("x", 0)
                    .attr("y", 0)
                    .attr("width", lh)
                    .attr("height", lh)
                    .style("fill", this.color);

            legend.append("text")
                    .attr("x", lh + lhp)
                    .attr("y", lh - lhp)
                    .attr("text-anchor", "start")
                    .attr("class", "legendText")
                    .text(function (d, i) {
                      return self.dateRanges[i].key;
                    });

          };

          Graph.prototype.addAxisAndGrid = function () {

            var self = this;
            var xMax = Math.ceil(Math.max(d3.max(this.data.map(function (d) {
              return d.items.length
            })), 20) / 10) * 10;

            this.xTicks = Math.ceil(Math.min(xMax / 10, 10));

            this.xScale = d3.scale.linear()
                    .domain([0, xMax])
                    .range([this.leftBarWidth, this.width - 20]);


            this.yScale = d3.scale.ordinal()
                    .domain(this.data.map(function (d) {
                      return d.name;
                    }))
                    .rangeRoundBands([this.top, this.height], 1);

            var xAxis = d3.svg.axis()
                    .orient('bottom')
                    .scale(this.xScale)
                    .ticks(this.xTicks)
                    .tickSize(3, 3)
                    .tickPadding(3)
                    .tickFormat(function (d, i) {
                      if (i == 0) {
                        return "";
                      } else {
                        return d;
                      }
                    });


            var yAxis = d3.svg.axis()
                    .orient('right')
                    .scale(this.yScale);

            this.canvas.append('g')
                    .attr("transform", "translate(" + (0) + "," + (-this.lineHeight / 4) + ")")
                    .attr('id', 'yAxis')
                    .call(yAxis)
                    .selectAll("#yAxis text")
                    .call(this.wrap);

            this.canvas.append('g')
                    .attr("transform", "translate(" + 0 + "," + (0) + " )")
                    .attr('id', 'xAxis')
                    .call(xAxis);

            var y1 = 20;
            var y2 = this.height - this.bottomPanelHeight;
            var x = function (d) {
              return self.xScale(d)
            };
            var c = {x1: x, x2: x, y1: y1, y2: y2};
            this.canvas.selectAll(".vl1").data(self.xScale.ticks(this.xTicks)).enter()
                    .append("line")
                    .attr("class", "vl1")
                    .attr(c);

            this.canvas.selectAll(".vl2").data(self.xScale.ticks(2 * this.xTicks)).enter()
                    .append("line")
                    .attr("class", "vl2")
                    .attr(c);

          };

          Graph.prototype.wrap = function (text) {
            text.each(function () {
              var text = d3.select(this),
                      word,
                      words = text.text().trim().split(/\s+/).reverse(),
                      tspan = text.text(null).append("tspan");
              if (words.length == 1) {
                text.append("tspan").text(words);
              } else {
                word = words.pop();
                text.append("tspan").text(word);
                while (word = words.pop()) {
                  text.append("tspan").text(" " + word).attr("class", "lastName");
                }
              }
            });
          };

          Graph.prototype.sliceData = function (data) {
            if (this.mode.name == 'random') {
              return data.slice(25, 25 + this.slices);
            } else {
              return data.slice(0, this.slices);
            }
          };

          Graph.prototype.prepareData = function (data, updateDetails) {
            var self = this;

            this.details.updateDetails = updateDetails;

            this.details.assigneesTotal = data.length;

            data.forEach(function (group) {
              self.details.investigationsTotal += group.items.length;
            });

            data.sort(function (a, b) {
              return b.items.length - a.items.length;
            });

            data = this.sliceData(data);

            data.sort(function (a, b) {
              return self.sortByName(a.name, b.name);
            });


            data.forEach(function (group) {
              $log.debug(group.name);
              self.details.assigneesShown++;
              var dr = self.dateRanges.slice(0);
              var userInvest = [];
              self.dateRanges.map(function () {
                userInvest.push(0)
              });
              group.items.forEach(function (item) {
                var investDate = moment(item.assignment.timestamp, "YYYYMMDDTHHmmssZ");
                $log.debug("Invest date: " + investDate.format("DD-MM-YYYY"));
                for (var i = 0; i < dr.length; i++) {
                  var value = dr[i].value;
                  $log.debug("Checked with: " + value.format("DD-MM-YYYY"));
                  if (value.isBefore(investDate)) {
                    userInvest[i]++;
                    self.details.investigationShown++;
                    $log.debug("Range: " + i);
                    break;
                  }
                }
              });
              $log.debug('userInvest: ' + userInvest);
              $log.debug('y0=' + group.name);
              var x0 = 0;
              group.ranges = userInvest.map(function (current) {
                return {current: current, total: group.items.length, x0: x0, x1: x0 += +current, y0: group.name, height: 8}
              });
              $log.debug(group.ranges);
            });
            this.data = data;
          };


          Graph.prototype.sortByName = function (name1, name2) {
            var w1 = this.splitNames(name1);
            var w2 = this.splitNames(name2);
            if (w1[0] < w2[0]) {
              return -1;
            }
            if (w1[0] > w2[0]) {
              return 1;
            }
            if (w1[1] < w2[1]) {
              return -1;
            }
            if (w1[1] > w2[1]) {
              return 1;
            }
            return 0;
          };

          Graph.prototype.splitNames = function (name) {
            var w = name.trim().split(/\s+/).reverse();
            if (w.length == 1) {
              w.push("");
            }
            return w;
          };

          Graph.prototype.createDateRanges = function () {
            var today = moment(0, "HH");
            var last7days = moment(0, "HH").add('d', -7);
            var lastMonth = moment(0, "HH").add('M', -1);
            var thisYear = moment({month: 0, day: 1, hour: 0});
            var lastYear = moment({month: 0, day: 1, hour: 0}).add('years', -1);
            var before = moment({month: 0, day: 1, hour: 0}).add('years', -10);

            return [
              {key: 'Today', value: today},
              {key: 'Last Week', value: last7days},
              {key: 'Last Month', value: lastMonth},
              {key: 'This Year', value: thisYear},
              {key: 'Last Year', value: lastYear},
              {key: 'Ante Christum', value: before}
            ];
          };


          return Graph;
        }])
;


