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

var patterns = [];

angular.module('replacerFilters', []).filter('replacer', function (ChangesLoader) {
  var patternsReload = function () {
    var load = ChangesLoader.loadPatterns();
    load.then(
            function (loadedPatterns) {
              patterns = loadedPatterns;
            }
    )
  };

  if (patterns.length == 0) {
    patternsReload();
  }

  return function (input) {
    var result = input;
    patterns.forEach(function (r) {
      if (r.regexp !== undefined) {
        result = result.replace(new RegExp(r.from, r.regexp), r.to);
      } else {
        result = result.replace(r.from, r.to);
      }
    });
    return result;
  };
});






