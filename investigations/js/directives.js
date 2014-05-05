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

angular.module('investigationsApp.directives', ['angularMoment', 'investigationsApp.graphs','investigationsApp.config'])
        .directive('ngAllInvestigations', ['$log', 'Graph', 'config', function ($log, Graph, config) {
          return {
            restrict: 'A',
            link: function (scope, iElement, iAttrs) {
              var gr;
              scope.$watch("data", function (newVal) {
                if (newVal) {
                  if (gr == undefined) {
                    gr = new Graph(config.currentMode);
                  }
                  gr.addCanvas(gr != undefined);
                  gr.prepareData(scope.data, scope.updateDetails);
                  gr.addAxisAndGrid();
                  gr.draw();
                  gr.addLegend();
                  gr.addBottomPanel();
                }
              });

            }
          }
        }]);

