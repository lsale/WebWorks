# FacePlusPlus for cordova

** NOTE **
In orderd to use this sample request an API key and modify the index.js file in the project

This is a WIP for a face detection project
The following features and frameworks are used within this app:
- Cordova camera
- XMLHttpRequest

I haven't used any platform specific UI framework to keep the application portable.
I'm using the APIs available at [FacePlusPlus](http://www.faceplusplus.com/) but you will need to create a free account (40k recognitions included). The algorithm will return an approximate age, gender, race and the probability the person in the photo is smiling.
I'm capturing the image through the getUserMedia API.
The original version of this sample is available at [FacePlusPlus Github page](https://github.com/FacePlusPlus/detect-demo) but I've stripped it out of jQuery and other extra functionalities.

A JavaScript SDK is also available at [FacePlusPlus JS SDK](https://github.com/FacePlusPlus/facepp-javascript-sdk)

**Tested With**

* BlackBerry Z10, Q10 and Z30 (10.2.1.1925)
* BlackBerry 10 WebWorks SDK (2.0.0.54)

**Other resources**

1. [FacePlusPlus JS SDK](https://github.com/FacePlusPlus/facepp-javascript-sdk)
2. [Detection APIs](http://www.faceplusplus.com/detection_detect/) 