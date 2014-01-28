
    'use strict';
    // constants: fill in with your KEY and SECRET available at http://www.faceplusplus.com/
    var API_URL = '';
    var API_KEY = '';
    var API_SECRET = '';

    // error messages
    var messages = {
        URL_ERROR:   'Invalid URL',
        LOAD_ERROR:  'Failed to Load',
        LOADING:     'Loading...',
        NO_FACE:     'No face detected',
        NO_CAMERA:   'No camera available'
    };

    // vendor prefix
    window.URL = window.URL || window.webkitURL;
    navigator.getUserMedia  = navigator.getUserMedia || navigator.webkitGetUserMedia ||
                              navigator.mozGetUserMedia || navigator.msGetUserMedia;


    function makeDetector() {
        var canvas = document.getElementById('canvas');
        var ctx = canvas.getContext('2d');

        var width = canvas.width,
            height = canvas.height;

        var currentImg = new Image();
        var totalImageCount = 0;

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

                faceppDetect({
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
                console.error(messages.URL_ERROR);
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
                            console.error(messages.NO_CAMERA);
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
    }


    // =========== utility functions ===========

    /**
     * Reference: http://stackoverflow.com/questions/4998908/convert-data-uri-to-file-then-append-to-formdata
     */
    function dataURItoBlob(dataURI) {
        var binary = atob(dataURI.split(',')[1]);
        var array = [];
        for(var i = 0; i < binary.length; i++) {
            array.push(binary.charCodeAt(i));
        }
        return new Blob([new Uint8Array(array)], { type: 'image/jpeg' });
    }

    /**
     * options:
     *     {
     *         img:     <string>   URL or Data-URI,
     *         type:    <string>   'url' or 'dataURI',
     *         success: <function> success callback,
     *         error:   <function> error callback
     *     }
     */
    function faceppDetect(options) {
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
                xhr.open('GET', API_URL + 'detection/detect?api_key=' + API_KEY + '&api_secret=' + API_SECRET + '&url=' + encodeURIComponent(options.img), true);
                xhr.send();
            } else if (options.type === 'dataURI') {
                xhr.open('POST', API_URL + 'detection/detect?api_key=' + API_KEY + '&api_secret=' + API_SECRET, true);
                var fd = new FormData();
                fd.append('img', dataURItoBlob(options.img));
                xhr.send(fd);
            } else {
                options.error();
            }
        } else { // fallback to jsonp
            if (options.type === 'url') {
                  var getJSON = function(options) {
                  var xhr = new XMLHttpRequest();
                  xhr.open("POST", API_URL + 'detection/detect', true);
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
                  xhr.send("api_key="+API_KEY+"&api_secret="+API_SECRET+"&url="+options.img);
                };

                getJSON(options);
            } else {
                options.error();
            }
        }
    }