/*
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */
var app = {
    media: null,
    platform: null,
    localFolder: null,
    // Application Constructor
    initialize: function() {
        this.bindEvents();
    },
    // Bind Event Listeners
    //
    // Bind any events that are required on startup. Common events are:
    // 'load', 'deviceready', 'offline', and 'online'.
    bindEvents: function() {
        document.addEventListener('deviceready', this.onDeviceReady, false);
        var takePhoto = document.getElementById('takePhoto');
        var openInstagram = document.getElementById('instagram');
        var playButton = document.getElementById('playButton');
        takePhoto.addEventListener('click', app.takePicture);
        openInstagram.addEventListener('click', app.openBrowser);
        playButton.addEventListener('click',app.playMedia);
    },
    // deviceready Event Handler
    //
    // The scope of 'this' is the event. In order to call the 'receivedEvent'
    // function, we must explicity call 'app.receivedEvent(...);'
    onDeviceReady: function() {
        app.platform = app.getDevicePlatform();
        console.log(app.platform);
        app.receivedEvent('deviceready');
        window.addEventListener("batterystatus", app.onBatteryStatus, false);
        
        /* The path for the local resources contained in this bundle will be different
           on each platform. We need to be able to retrieve it using this trick */
        var path = window.location.pathname;
        path = path.substr( 0, path.length - 10 );

        if(app.platform.toLowerCase().indexOf('blackberry') > -1){
            app.localFolder = "../";
        }else{
            //We assume it's either iOS, Android or Kindle FireOS
            app.localFolder = "file://"+path;
        }
        app.media = new Media(app.localFolder+"resources/nyan_cat.mp3", function(){
            console.log("playAudio():Audio Success");
        }, function(){
            console.erro("playAudio():Audio error "+error);
        }, app.getMediaStatus);
        
    },
    // Update DOM on a Received Event
    receivedEvent: function(id) {
        var parentElement = document.getElementById(id);
        var listeningElement = parentElement.querySelector('.listening');
        var receivedElement = parentElement.querySelector('.received');
        var deviceOS = document.getElementById('deviceOS');

        listeningElement.setAttribute('style', 'display:none;');
        receivedElement.setAttribute('style', 'display:block;');
        deviceOS.innerHTML += app.platform;

        console.log('Received Event: ' + id);
    },
    onBatteryStatus: function(info){
        var batteryLevel = document.getElementById('batteryLevel');
        console.log("Battery "+info.level);
        batteryLevel.style.height = info.level+"%";
        app.batteryCharging(info.isPlugged);
    },
    batteryCharging: function(isCharging){
        var batteryLevel = document.querySelector(".batteryLevel");
        if(isCharging){
            batteryLevel.style["-webkit-animation"] = "batteryCharging 5s linear 0s infinite";
            batteryLevel.style["animation"] = "batteryCharging 5s linear 0s infinite";
        }else{
            batteryLevel.style["-webkit-animation"] = "";
            batteryLevel.style["animation"] = "";
        }
    },
    getDevicePlatform: function(){
        return window.device.platform;
    },
    showNotification: function(text){
        navigator.notification.alert(
            text,               // message
            null,
            'Cordova alert',    // title
            'Gotcha'            // buttonName
        );
        navigator.notification.beep(1);
    },
    getMediaStatus: function(status){
        var message;
        switch(status){
            case Media.MEDIA_STARTING:
                message = "Media starting to play";
            break;
            case Media.MEDIA_RUNNING:
                message = "Media is now playing";
            break;
            case Media.MEDIA_PAUSED:
                message = "Media has been paused";
            break;
            case Media.MEDIA_STOPPED:
                message = "Media has stopped";
            break;
            case Media.MEDIA_NONE:
                message = "There is no media to play";
            break;
            default:
                message = "Undefined media error";
            break;
        }
        console.error('[getMediaStatus] - Received status: '+message);
    },
    playMedia: function(){
        var playButton = document.getElementById('playButton');
        var playControl = playButton.querySelector('.playControl');
        var pauseControl = playButton.querySelector('.pauseControl');
        if(playControl.style["display"] == "block"){
            pauseControl.style["display"] = "block";
            playControl.style["display"] = "none";
            app.media.play();
        }else{
            pauseControl.style["display"] = "none";
            playControl.style["display"] = "block";
            app.media.stop();
        }
    },
    openBrowser: function(){
        var ref = window.open('http://instagram.com/cats', '_blank', 'location=yes');
        
        ref.addEventListener('loadstop', function(){
            console.log('Page has been loaded');
        });
        ref.addEventListener('exit', function(){
            console.log('Closed child window');
        })
    },
    takePicture: function(){
        navigator.camera.getPicture(onSuccess, onFail, {destinationType: Camera.DestinationType.FILE_URI });

        function onSuccess(imageURI) {
            app.showNotification('The picture has been saved to '+imageURI);
        }
        function onFail(message) {
            console.log('Failed because: ' + message);
        }
    }
};
