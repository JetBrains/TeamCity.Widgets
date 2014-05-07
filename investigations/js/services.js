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

angular.module('investigationsApp.services', ['investigationsApp.config'])
        .service("Loader", ['$rootScope', '$log', '$http', '$q', 'config',
          function ($rootScope, $log, $http, $q, config) {
          var service = {
            externalLoad: function (theScope) {
              $log.debug('making external load...');
              var deferred = $q.defer();
              var url = config.baseUrl + config.url + "?locator=" + config.locator;
              $log.debug("External load from:" + url);
              $http.get(url).
                      success(function (data, status, headers, config) {
                        if (data === undefined || data.count === undefined || data.investigation === undefined) {
                          $log.info("No investigations found.");
                          deferred.resolve([]);
                        } else {
                          $log.debug('Loaded investigations: ' + data.count);
                          var groups = groupedByUser(data.investigation);
                          $log.debug("Created groups: " + groups.length);
                          deferred.resolve(groups);
                        }
                      }).error(function (data, status, headers, config) {
                        $log.error("An error occurred during loading investigations from url: " + url + ". Status: " + status);
                        deferred.reject(data);
                      });
              return deferred.promise;
            }
          };

          var freshInvestigations = function (data) {
            var filtered = [];
            var today = moment(0, "HH");
            angular.forEach(data, function (investigation) {
              if (moment(investigation.assignment.timestamp, "YYYYMMDDTHHmmssZ").isAfter(today)) {
                filtered.push(investigation);
              }
            });
            return filtered;
          };
          var groupedByUser = function (data) {
            // each entry {key: userId, user: user, value:  items: array of investigations}
            var indexes = [];
            var groups = [];
            if (data === undefined || data.length === undefined) {
              return [];
            }
            $log.debug('Start grouping. Data length: ' + data.length);
            angular.forEach(data, function (investigation) {
              var archivedProject = (investigation.scope.project !== undefined && investigation.scope.project.archived === true);
              if (!archivedProject) {
                var userId = investigation.assignee.id;
                var index = indexes.indexOf(userId);
                var group;
                if (index == -1) {
                  indexes.push(userId);
                  var name = investigation.assignee.name;
                  $log.debug("name = " + name);
                  if (name === undefined) {
                    name = investigation.assignee.username;
                  }
                  name = name.replace(".", " ").replace(/\b./g, function (m) {
                    return m.toUpperCase();
                  });
                  group = {key: userId, name: name,
                    user: investigation.assignee, items: []};
                  groups.push(group);
                  $log.debug('new user was added: ' + group.name)
                } else {
                  group = groups[index];
                }
                group.items.push(investigation)
              }
            });
            $log.debug('Done.Groups: ' + groups.length);
            return groups;
          };
          return service;
        }
        ]);


