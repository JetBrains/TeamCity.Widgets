[![official JetBrains project](http://jb.gg/badges/official.svg)](https://confluence.jetbrains.com/display/ALL/JetBrains+on+GitHub)

TeamCity.Widgets
================

The TeamCity html widgets framework allows custom presentations for data from a TeamCity server. We started the project as an example of custom application that can be made using the TeamCity REST API and static HTML content.
Read more about the project purpose in the [Dashboarding with TeamCity](http://blog.jetbrains.com/teamcity/2015/02/dashboarding-with-teamcity/) blogpost.

To use widgets with your server, you have two options
* download the ready-to-install [TeamCity.WidgetsPlugin plugin](https://github.com/JetBrains/TeamCity.WidgetsPlugin) and add it to your server (you need to re-start server to make the plugin work).
The widgets will be available under the  ``<TeamCity context path>/app/widgets/<widget name>/<page name>``
* or if you are already using our [StaticUIExtension plugin](https://confluence.jetbrains.com/display/TW/StaticUIExtensions), you can [download](https://teamcity.jetbrains.com/viewLog.html?buildTypeId=TeamCityPluginsByJetBrains_Widgets_WidgetsPlugin&buildId=lastPinned) the widgets package and unpack it to ``<your server data directory>/config/_static_ui_extensions/pages/`` folder. In this case you don't need to restart the server.
The widgets become immediately available under the ``<TeamCity context path>/app/static_content/widgets/<widget name>/<page name>``

Widgets
=======

* TeamCity investigations - relates to TeamCity investigations  
    Name: **investigation**  
    Available pages:
    * top_fullScreen.html - shows 'TAKEN' TeamCity investigations grouped by assignee and ages.

   The widget is available under  
    ``<TeamCity context path>/app/widgets/investigation/top_fullScreen.html``  
    If used with StaticUIExtension, the widget is available under  
    ``<TeamCity context path>/app/static_content/widgets/investigations/top_fullScreen.html``  


* TeamCity latest commits 
    Name: **lastChanges**  
    Available pages:
    * last_fullScreen.html - shows latest VCS commits  
    
    The widget is available under  
    ``<TeamCity context path>/app/widgets/lastChanges/last_fullScreen.html``  
    If used with StaticUIExtension, the widget is available under  
    ``<TeamCity context path>/app/static_content/widgets/lastChanges/last_fullScreen.html``

Implementation details:
- the current implementation is based on angular js and d3js
- config.js contains the widget config including the URL to retrieve the investigation details from the server

Lifecycle:
On page load, the local storage will be checked and cached data will be displayed (if found). It helps to avoid delays during loading data via a REST request.
New data will be retrieved every 5 minutes (you can change the value in the widget config) and the view will be updated.

New widget development
======================
To create a new widget, add a folder under the resources directory. Place there all files you want to be accessible as static resources under the
<TeamCity context path>/app/widgets/<new widget>/ path.
To easily handle data update during development, you don't need to add a compiled plugin to your TeamCity data directory. You can use the 'web' module and the provided 'web' run configuration to make your widget available on your local server.
Check the ``JsonResponseWrapper`` class and configure access to the TeamCity server you want to grab data from. You can use the data that comes from real TeamCity under /teamcity path directly on your local server. It helps to avoid all cross-path-related issues during the development stage.
When your widget is ready, package the plugin (use the 'Build artifact - plugin.zip' option) and add it to your real TeamCity installation.

Custom Build Status Page
========================

Pre requisites - install 'bower' to your system
1. Create your 'application folder'
2. Create <your page>.html 
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
3. run ``bower install`` in the current folder
4. run ``bower install`` in the /bower_components/teamcity-widgets/buildsStatus folder  
5. Edit <your page>.html 
  Add link to the main 'web components' support (not necessary for latest browsers, e.g. Chrome > 0.36)
  <script src="bower_components/teamcity-widgets/buildStatus/bower_components/webcomponentsjs/webcomponents.min.js" type="text/javascript"></script>
6. Any html element in your page can be transformed into build status presentation if you place our build-type-status component inside it 
 ``<build-type-status locator="buildType:DotNetDiv_Wave02_Compile_PlatformCore">Platform Core</build-type-status>``
  The background color for enclosing the parent component will be changed every 60 sek depending on the last build status in the set of builds retrived according to the locator specified
  



License:
========
Apache 2.0
