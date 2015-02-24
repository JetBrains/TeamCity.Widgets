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

angular.module('investigationsApp.controllers', ['investigationsApp.services'])
        .controller('LoaderCtrl', ['$scope', '$log', '$http', '$timeout', '$sessionStorage', 'Loader', 'config', '$location',
          function ($scope, $log, $http, $timeout, $sessionStorage, Loader, config, $location) {

            var schedule = function (delay) {
              $timeout(function () {
                loadInvestigations();
              }, delay);
              $log.debug("Next update will be performed in " + delay + "ms.");
            };
            var processUrlParams = function () {
              var so = $location.search();
              $log.info(so.mode);
              config.currentMode = config.modes[0];
              config.modes.forEach(function (mode) {
                if (mode.name == so.mode) {
                  config.currentMode = mode;
                }
              });
              $log.info("mode set to: " + config.currentMode.name);
              $log.info(so.locator);
              if (so.locator !== undefined) {
                config.locator = so.locator;
              }
              $log.info("locator set to: " + config.locator);
            };

            var loadInvestigations = function () {
              $log.debug('controller.loadInvestigations starts...');
              var promise = Loader.externalLoad();
              promise.then(
                      function (data) {
                        clearCache();
                        $scope.data = data;
                        $scope.updateDetails = Date.now();
                        saveTosessionStorage(data, $scope.updateDetails);
                      },
                      function (reason) {
                        $log.error('Failed: ' + reason);
                      }
              );
              schedule(config.reload);
            };

            var saveTosessionStorage = function (data, ts) {
              $sessionStorage.invWidgetData = {investigations: data, updated: ts};
              $log.debug("--Saved to local storage -" + $sessionStorage.invWidgetData);
            };

            var clearCache = function () {
              $log.debug("--Clean local storage -");
              delete $sessionStorage.invWidgetData;
            };

            var storedData = $sessionStorage.invWidgetData;
            $log.debug("--Restored from local storage -" + storedData);

            processUrlParams();

            if (storedData === undefined) {
              loadInvestigations($http, $timeout);
            } else {
              $scope.data = storedData.investigations;
              $scope.updateDetails = storedData.updated;
              schedule(1000);
            }
          }])
;


