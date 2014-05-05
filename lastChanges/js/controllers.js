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

angular.module('changesApp.controllers', ['changesApp.services'])
        .controller('ChangesLoaderCtrl', ['$scope', '$log', '$http', '$timeout', '$localStorage', 'ChangesLoader', 'config',
          function ($scope, $log, $http, $timeout, $localStorage, ChangesLoader, config) {
            var schedule = function (delay) {
              $log.debug("schedule. sinceId:" + $scope.sinceId);
              $timeout(function () {
                loadChanges($scope.sinceId);
              }, delay);
              $log.debug("Next update will be performed in " + delay + "ms.");
            };
            var loadChanges = function (sinceId) {
              $log.debug('controller.loadChanges starts... sinceId=' + sinceId);
              var pagePromise;
              if (sinceId == undefined || sinceId == 0) {
                pagePromise = ChangesLoader.loadFirstPage();
              } else {
                pagePromise = ChangesLoader.loadSincePage(sinceId);
              }
              $scope.funReplacer = function(name) {
                $log.log("funReplacer" + name);
                return function(input) {
                  $log.log("funReplacer.input" + input);
                  return name;
                }
              };
              pagePromise.then(
                      function (data) {
                        if ($scope.data === undefined) {
                          $scope.data = [];
                        }
                        if (data === undefined || data.change === undefined) {
                          $log.log("No commits found");
                          return;
                        }
                        var changes = data.change.reverse();
                        changes.forEach(function (change) {
                          var changePromise = ChangesLoader.loadSingleChange(change.id);
                          changePromise.then(
                                  function (loadedChange) {
                                    $log.debug(loadedChange);
                                    var skip = false;
                                    var name = (loadedChange.user !== undefined && loadedChange.user.name !== undefined)
                                            ? loadedChange.user.name
                                            : loadedChange.username;
                                    loadedChange.fullName = improveName(name);
                                    $scope.data.forEach(function (c) {
                                      if (c.comment == loadedChange.comment && c.username == loadedChange.username) {
                                        skip = true;
                                      }
                                    });
                                    if (!skip) {
                                      $scope.data.unshift(loadedChange);
                                      $scope.sinceId = loadedChange.id;
                                      if ($scope.data.length > config.maxCount) {
                                        $scope.data.pop();
                                      }
                                      var ts = Date.now();
                                      saveToLocalStorage($scope.data, loadedChange.id, ts);
                                      $scope.updateDetails = ts;
                                      createUpdateDescription();
                                    }
                                  }
                          );
                        });
                      },
                      function (reason) {
                        $log.error('Failed: ' + reason);
                      }
              );
              schedule(config.reload);
            };

            var createUpdateDescription = function(){
              $scope.updateDescription = "Last updated " + moment($scope.updateDetails).format('MMMM Do') + " @ "
                      + moment($scope.updateDetails).format('HH:mm');
            };

            var improveName = function (name) {
              name = name.replace(".", " ").replace(/\b./g, function (m) {
                return m.toUpperCase();
              });
              if (name.indexOf("<") > -1) {
                name = name.substring(0, name.indexOf("<") - 1);
              }
              if (name.length > 25) {
                name = name.substring(0, 25);
              }
              return name;
            };

            var saveToLocalStorage = function (data, sinceId, ts) {
              $localStorage.lastChanges = {shownChanges: data, sinceId: sinceId, updated: ts};
              $log.debug("--Saved to local storage -");
            };

            var clearCache = function () {
              $log.debug("--Clean local storage -");
              delete $localStorage.lastChanges;
            };

            var storedData = $localStorage.lastChanges;
            $log.debug("--Restored from local storage -");
            $log.debug(storedData);
            if (storedData === undefined) {
              loadChanges();
            } else {
              $scope.data = storedData.shownChanges;
              $scope.sinceId = storedData.sinceId;
              $scope.updateDetails = storedData.updated;
              createUpdateDescription();
              schedule(1000);
            }
          }])
;



