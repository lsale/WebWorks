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
 'use strict';
var app = {
    // constants: fill in with your KEY and SECRET available at http://www.faceplusplus.com/
    API_URL: 'http://api.us.faceplusplus.com/',
    API_KEY: '7024eaff4703338be0900e60ea9e0de5',
    API_SECRET: 'os6eRGDImKzTIKJNp9cEFGD3dl9ohSju',

    // error messages
    messages: {
        URL_ERROR:   'Invalid URL',
        LOAD_ERROR:  'Failed to Load',
        LOADING:     'Loading...',
        NO_FACE:     'No face detected',
        NO_CAMERA:   'No camera available'
    },

    // Application Constructor
    initialize: function() {
        console.log('initialize app');
        // vendor prefix
        window.URL = window.URL || window.webkitURL;
        navigator.getUserMedia  = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.msGetUserMedia;
        this.bindEvents();
    },
    // Bind Event Listeners
    //
    // Bind any events that are required on startup. Common events are:
    // 'load', 'deviceready', 'offline', and 'online'.
    bindEvents: function() {
        console.log('Binding events')
        document.addEventListener('deviceready', this.onDeviceReady, false);
    },
    // deviceready Event Handler
    //
    // The scope of 'this' is the event. In order to call the 'receivedEvent'
    // function, we must explicity call 'app.receivedEvent(...);'
    onDeviceReady: function() {
        console.log('The APIs are ready');
        app.makeDetector();
    },
    parseResponse: function(json){
        var results = document.getElementById('results');
        results.style.display = "block";
        var button = document.createElement('button');
        button.innerHTML = "Close";
        button.onclick = function(){
            results.style.display = "none";
        };
        var info = {
            age: json.face[0].attribute.age.value,
            race: json.face[0].attribute.race.value,
            gender: json.face[0].attribute.race.value
        };
        var accuracy = {
            race: json.face[0].attribute.age.confidence,
            gender: json.face[0].attribute.gender.confidence
        };
        var smiling = (json.face[0].attribute.smiling.value > 50) ? true : false;
        results.innerHTML = "Hello "+((info.gender === "Male" && accuracy.gender > 50) ? " Handsome" : " Gorgeous")+"!<br>";
        results.innerHTML += "You look "+info.age+" today<br>";
        results.innerHTML += ((smiling) ? "Keep smiling!" : "Smile! Life is good")+"<br>";
        results.appendChild(button);
    },
    makeDetector: function(){
        var canvas = document.getElementById('canvas');
        var ctx = canvas.getContext('2d');

        var width = canvas.width,
            height = canvas.height;

        var currentImg = new Image();

        function clearCanvas() {
            ctx.fillStyle = '#EEE';
            ctx.fillRect(0, 0, width, height);
        }
        /**
         * Start face detection.
         *
         * src <string>: image url or dataURI
         * dataURI <boolean>: whether src is a dataURI
         */
        function detect(src, dataURI) {
        
            clearCanvas();

            currentImg.onload = function() {
                var scale = Math.min(width / currentImg.width, height / currentImg.height, 1.0);
                var imageInfo = {
                    width: currentImg.width * scale,
                    height: currentImg.height * scale,
                    offsetX: (width - currentImg.width * scale) / 2,
                    offsetY: (height - currentImg.height * scale) / 2
                };
                ctx.drawImage(
                    currentImg,
                    imageInfo.offsetX,
                    imageInfo.offsetY,
                    imageInfo.width,
                    imageInfo.height
                );

                app.faceppDetect({
                    img: currentImg.src,
                    type: (dataURI ? 'dataURI' : 'url'),
                    success: function(faces) {
                        //Decide what to do with the response from the server
                        app.parseResponse(faces);
                    },
                    error: function() {
                        clearCanvas();
                    }
                });
            };
            currentImg.onerror = function() {
                clearCanvas();
                console.error(app.messages.URL_ERROR);
            };
            currentImg.src = src;
        }

        // ==================== INPUT ======================

        // Webcam Input
        if (navigator.getUserMedia) {
            var webcam = document.getElementById('webcam');
            if (webcam) {
                webcam.addEventListener('click', function() {
                    clearCanvas();
                    document.getElementById('camera-modal').style.display = "block";
                    navigator.getUserMedia({
                            video: true,
                            audio: false
                        },
                        function(localMediaStream) {
                            var video = document.getElementById('camera-video');
                            var cameraModal = document.getElementById('camera-modal');

                            var modalClose = function() {
                                video.style.display = "none";
                                localMediaStream.stop();
                                cameraModal.style.display = "none";
                                cameraModal.removeEventListener('click');
                            };
                            cameraModal.addEventListener('click', modalClose);

                            video.src = window.URL.createObjectURL(localMediaStream);
                            video.addEventListener('onerror', function() {
                                localMediaStream.stop();
                                modalClose();
                            });

                            var capture = document.getElementById('capture');
                            capture.style.display = "block";
                            video.style.display = "block";
                            capture.removeEventListener('click');
                            video.removeEventListener('click');
                            var modalOpen = function(){
                                var scale = Math.min(width / video.videoWidth, height / video.videoHeight, 1);
                                // draw video on to canvas
                                var tmpCanvas = document.createElement('canvas');
                                tmpCanvas.height = video.videoHeight * scale;
                                tmpCanvas.width = video.videoWidth * scale;
                                tmpCanvas.getContext('2d').drawImage(video, 0, 0, video.videoWidth * scale, video.videoHeight * scale);

                                detect(tmpCanvas.toDataURL('image/jpeg'), true);
                                modalClose();
                                return false;
                            }
                            capture.addEventListener('click', modalOpen);
                            video.addEventListener('click', modalOpen);
                        },
                        function() {
                            document.getElementById('camera-modal').style.display = "none";
                            console.error(app.messages.NO_CAMERA);
                        }
                    );
                    return false;
                });
            }
        } else {
            console.log('No')
        }
        // initialize to first image in photlist
        clearCanvas();
    },


    // =========== utility functions ===========

    /**
     * Reference: http://stackoverflow.com/questions/4998908/convert-data-uri-to-file-then-append-to-formdata
     */
    dataURItoBlob: function(dataURI) {
        var binary = atob(dataURI.split(',')[1]);
        var array = [];
        for(var i = 0; i < binary.length; i++) {
            array.push(binary.charCodeAt(i));
        }
        return new Blob([new Uint8Array(array)], { type: 'image/jpeg' });
    },

    /**
     * options:
     *     {
     *         img:     <string>   URL or Data-URI,
     *         type:    <string>   'url' or 'dataURI',
     *         success: <function> success callback,
     *         error:   <function> error callback
     *     }
     */
    faceppDetect: function(options) {
        //Check if CORS is supported by the browser
        if ('withCredentials' in new XMLHttpRequest()) {
            var xhr = new XMLHttpRequest();
            xhr.timeout = 10 * 1000;
            xhr.onreadystatechange = function() {
                if (xhr.readyState === 4) {
                    if (xhr.status === 200) {
                        options.success(JSON.parse(xhr.responseText));
                    } else {
                        options.error();
                    }
                }
            };

            if (options.type === 'url') {
                xhr.open('GET', app.API_URL + 'detection/detect?api_key=' + app.API_KEY + '&api_secret=' + app.API_SECRET + '&url=' + encodeURIComponent(options.img), true);
                xhr.send();
            } else if (options.type === 'dataURI') {
                xhr.open('POST', app.API_URL + 'detection/detect?api_key=' + app.API_KEY + '&api_secret=' + app.API_SECRET, true);
                var fd = new FormData();
                fd.append('img', app.dataURItoBlob(options.img));
                xhr.send(fd);
            } else {
                options.error();
            }
        } else { // fallback to jsonp
            if (options.type === 'url') {
                  var getJSON = function(options) {
                  var xhr = new XMLHttpRequest();
                  xhr.open("POST", app.API_URL + 'detection/detect', true);
                  xhr.onreadystatechange = function() {
                    var status;
                    var data;
                    // http://xhr.spec.whatwg.org/#dom-xmlhttprequest-readystate
                    if (xhr.readyState == 4) { // `DONE`
                      status = xhr.status;
                      if (status == 200) {
                        data = JSON.parse(xhr.responseText);
                        options.success;
                      } else {
                        options.error;
                      }
                    }
                  };
                  xhr.send("api_key="+app.API_KEY+"&api_secret="+app.API_SECRET+"&url="+options.img);
                };

                getJSON(options);
            } else {
                options.error();
            }
        }
    }
};
