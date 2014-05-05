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

angular.module('changesApp.services', ['changesApp.config'])
        .service("ChangesLoader", ['$rootScope', '$log', '$http', '$q', 'config', function ($rootScope, $log, $http, $q, config) {
          var service = {
            /**
             *
             * @returns
             * {
             *   "count" : 100,
             *   "href" : "/guestAuth/app/rest/changes",
             *   "nextHref" : "/guestAuth/app/rest/changes?locator=count:100,start:100",
             *   "change" : [... collection of changes, ordered by timestamp desc]
             *   }
             *
             */
            loadFirstPage: function () {
              return this.load(config.baseUrl + config.pageUrl);
            },
            /**
             *
             * @returns
             * {
             *   "count" : 100,
             *   "href" : "/guestAuth/app/rest/changes",
             *   "change" : [... collection of changes, ordered by timestamp desc]
             *   }
             *
             */
            loadSincePage: function (sinceId) {
              return this.load(config.baseUrl + config.sinceUrl + sinceId);
            },
            /**
             *
             * @returns
             * {
             *    "id" : 3181145,
             *    "username" : "user1",
             *     "comment" : "Add annotations to the builtin known Nullable/NotNull annotations (IDEA-123102)\n",
             *     "user" : {
             *       "username" :   "user1",
             *       "name" : "First Last",
             *     }
             *   }
             */
            loadSingleChange: function (changeId) {
              $log.debug("loadSingleChange.changeId:" + changeId);
              return this.load(config.baseUrl + config.changeUrl + changeId);
            },
            loadPatterns: function () {
              $log.debug("load fun patterns");
              return this.load(config.funPatternsUrl);
            },
            load: function (url) {
              $log.debug('start loading from ' + url);
              var deferred = $q.defer();
              $http.get(url).
                      success(function (data, status, headers, config) {
                        if (data === undefined) {
                          $log.info("No changes found.");
                          deferred.resolve({});
                        } else {
                          deferred.resolve(data);
                        }
                      }).error(function (data, status, headers, config) {
                        $log.error("An error occurred during loading changes from url: " + url + ". Status: " + status);
                        deferred.reject(data);
                      });
              return deferred.promise;
            }
          };

          return service;
        }
        ]);


