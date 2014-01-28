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
    // Application Constructor
    initialize: function() {
        console.log('initialize app');
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
        makeDetector();
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
    }
};
