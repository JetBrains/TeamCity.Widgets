TeamCity.Widgets
================

TeamCity html widgets framework allows custom presentations for the data from TeamCity server. We started the project as an example of custom application that can be made using TeamCity REST API and static HTML content.
More about project purpose you can read in [Dashboarding with TeamCity](http://blog.jetbrains.com/teamcity/2015/02/dashboarding-with-teamcity/) blogpost.

To use widgets with your server you have two options
* download ready-to-install [TeamCity.WidgetsPlugin plugin](https://github.com/JetBrains/TeamCity.WidgetsPlugin) and add it to your server (you need to re-start server to make the plugin work).
Widgets will be available under the  ``<TeamCity context path>/app/widgets/<widget name>/<page name>``
* or if you are already using our [StaticUIExtension plugin](https://confluence.jetbrains.com/display/TW/StaticUIExtensions) you can add [download](https://teamcity.jetbrains.com/viewLog.html?buildTypeId=TeamCityPluginsByJetBrains_Widgets_WidgetsPlugin&buildId=lastPinned) widgets package and unpack it to ``<your server data directory>/config/_static_ui_extensions/pages/`` folder. In this case you don't need to restart the server.
Widgets become immediately available under the ``<TeamCity context path>/app/static_content/widgets/<widget name>/<page name>``

Widgets
=======

* TeamCity investigations - relates to TeamCity investigations  
    Name: **investigation**  
    Available pages:
    * top_fullScreen.html - shows 'TAKEN' TeamCity investigations grouped by assignee and ages.

    Widget is available under  
    ``<TeamCity context path>/app/widgets/investigation/top_fullScreen.html``  
    If used with StaticUIExtension widget is available under  
    ``<TeamCity context path>/app/static_content/widgets/investigations/top_fullScreen.html``  


* TeamCity latest commits 
    Name: **lastChanges**  
    Available pages:
    * last_fullScreen.html - shows latest VCS commits  
    
    Widget is available under  
    ``<TeamCity context path>/app/widgets/lastChanges/last_fullScreen.html``  
    If used with StaticUIExtension widget is available under  
    ``<TeamCity context path>/app/static_content/widgets/lastChanges/last_fullScreen.html``

Implementation details:
- current implementation is based on angular js and d3js
- config.js contains widget config including URL to retrieve the investigation details from server

Lifecycle:
On page load local storage will be checked and cached data will be displayed (if found). It helps to avoid delays during loading data via REST request.
New data will be retrieved every 5 minutes (you can change the value in widget config) and view will be updated.

New widget development
======================
To create new widget add a folder under resources directory. Please there all files you want to be accessible as static resources under
<TeamCity context path>/app/widgets/<new widget>/ path.
To handle easily data update during development you don't need to add compiled plugin to your TeamCity data directory. You can use 'web' module and provided 'web' run configuration to make your widget available on your local server.
Check JsonResponseWrapper class and configure access to the TeamCity you want grab data from. You can use the data comes from real TeamCity under /teamcity path directly on your local server. It helps to avoid all cross-path related issue during development stage.
When you widget is ready - package the plugin (use 'Build artifact - plugin.zip' option) and add to your real TeamCity installation.

Custom Build Status Page
========================

Pre requisites - install 'bower' to your system
1. Create your 'application folder'
2. Create <you page>.html 
2. Add bower.json

```javascript
{
    "___comment___": "Run `bower install` from this directory to update components",
    "name": "TeamCity.LocalWidgets",
    "private": true,
    "ignore": [
      "**/.*",
      "node_modules",
      "bower_components",
      "test",
      "tests"
    ],
    "dependencies": {
      "teamcity-widgets": "teamcity-widgets#*"
    }
  }
```
3. run ``bower install`` in current folder
4. run ``bower install`` in /bower_components/teamcity-widgets/buildsStatus folder  
5. Edit <you page>.html 
  Add link to main 'web components' support (not necessary for latest browsers, e.g. Chrome > 0.36)
  <script src="bower_components/teamcity-widgets/buildStatus/bower_components/webcomponentsjs/webcomponents.min.js" type="text/javascript"></script>
6. Any html element in your page can be transformed into build status presentation if you place inside it our build-type-status component
 ``<build-type-status locator="buildType:DotNetDiv_Wave02_Compile_PlatformCore">Platform Core</build-type-status>``
  Background color for enclosing parent component will be changed every 60 sek depending on last build status in the set of build retriving according to locator specified
  



License:
========
Apache 2.0
