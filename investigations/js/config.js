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

angular.module('investigationsApp.config', [])
        .constant('httpConfig', {
          headers: {
            'Accept': 'application/json'
          }
        })
        .constant('config', {
          baseUrl: "/",
          url: 'guestAuth/app/rest/investigations',
          /*url: '/investigations.json',*/
          /*url: '/guestAuth/app/rest/investigations?locator=state:TAKEN',*/
          locator: "state:TAKEN",
          reload: 1000 * 5 * 60,
          modes: [
            { name: "top",
              title: ["Top TeamCity", "Investigations"],
              description: function (details) {
                return "Showing top " + details.assigneesShown + " assignees (out of " + details.assigneesTotal +
                        ") handling " + Math.round((details.investigationShown / details.investigationsTotal * 100))
                        + "% of all investigations.";
              },
              dataProvider: function (data, n) {
                return data.slice(0, n);
              }
            },
            {name: "random", title: ["Random TeamCity", "Investigations"], description: function (details) {
              return "Showing random " + details.assigneesShown + " assignees (out of " + details.assigneesTotal +
                      ") handling " + Math.round((details.investigationShown / details.investigationsTotal * 100))
                      + "% of all investigations.";
            },
              dataProvider: function (data, n) {
                return data.slice(Math.max(data.length - n, 0), data.length);
              }
            },
            {name: "full", title: ["TeamCity", "Investigations"], description: function () {
              return "";
            },

              dataProvider: function (data, n) {
                return data;
              }
            }
          ],
          description: ""});

