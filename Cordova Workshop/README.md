# Cordova Workshop

This is the source code for the Cordova workshop (slides available on request).

The following features are used within this app:
- org.apache.cordova.battery-status
- org.apache.cordova.camera
- org.apache.cordova.device
- org.apache.cordova.dialogs
- org.apache.cordova.inappbrowser
- org.apache.cordova.media

**Tested With**

* Amazon Kindle FireOS (3.0)
* BlackBerry Z10, Q10 and Z30 (10.2.1.2102)
* Nexus 7 (Android 4.4 KitKat)
* Samsung Galaxy S3 (Android 4.3)
* iOS (iPhone 5) - Media lib is not working. TODO: implement an if/else with the audio element
* Firefox OS 1.2 - NOTE:

org.apache.cordova.battery-status rewrites the battery object in the navigator but FirefoxOS implements battery events in a native way. I had to hack the plugins/firefoxos.json and platforms/firefoxos/www/cordova_plugins.js to remove battery-status; also I removed the battery-status directory from platforms/firefoxos/www/plugins
* [BlackBerry 10 WebWorks SDK (2.0.0.71)](https://developer.blackberry.com/html5/download/)
* [PhoneGap powered by Cordova 3.4.0-0.1.3](http://docs.phonegap.com/en/3.4.0/guide_cli_index.md.html#The%20Command-Line%20Interface)
