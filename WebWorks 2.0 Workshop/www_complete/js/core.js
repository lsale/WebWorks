var core = {
	isBBMConnected: false,
	// Application Constructor
    initialize: function() {
    	console.log('[core.js] - initialize: Creating the event listener');
        this.bindEvents();
    },
    //Create the event listener for the BBM integration
	bindEvents: function(){
		document.addEventListener("onaccesschanged", this.accessChangedCallback);
	},
	//this gets fired every time the application checks the status of the BBM integration
	accessChangedCallback: function(accessible, status){
		switch(status){
		case "unregistered":
			core.registerBBMApp();
		break;
		case "allowed":
			core.isBBMConnected = accessible;
		break;
		case "nodata":
			console.error("[core.js] - accessChangedCallback: No BlackBerry data is available");
		break;
		case "pending":
		break;
		default:
			console.error("[core.js] - accessChangedCallback: an unidentified error has occurred: "+status);
		}
	},
	registerBBMApp: function(){
		// Register with the BBM platform use any random UUID (eg. http://www.famkruithof.net/uuid/uuidgen)
         blackberry.bbm.platform.register({
             uuid: "1a5fb8ce-0727-4b64-9179-f05cd6312125" // Randomly generated UUID. Please generate a new one
         });
	},
	/* STEP 2a: Invoke the camera using the WebWorks APIS
		the callback function contains a series of core function that will be
		declared as we go along as they rely on other functionalities yet to be
		implemented.
	*/
	//Invoke the BlackBerry apis to call the camera card. remember to add the com.blackberry.invoke.card
	//we define the camera as standard CAMERA_MODE_PHOTO so the user won't be able to switch to video
	takePicture: function(){
		var mode = blackberry.invoke.card.CAMERA_MODE_PHOTO;
		blackberry.invoke.card.invokeCamera(mode, function (path) {
				//this is the callback once the user takes the photo we will receive the path to it
            	core.addListItem("New image","this is my new image", path);
            	core.changeActiveCover(path);
            	core.resizePicture(path);
            },
            function (reason) {
                alert("cancelled " + reason);
            },
            function (error) {
                if (error) {
                    alert("invoke error "+ error);
                } else {
                    console.log("invoke success " );
                }
        	}
        );
	},
	/* STEP 2B: MANIPULATE THE DOM BY ADDING AN ITEM IN THE IMAGE LIST
		this will be one of our actions in the invoke callback.
	*/
	//append an item to the image list providing a custom title, description and local image path
	//This is a custom function that can be invoked by providing a title, description and an imagePath
	//It's currently used only in the invoke.card callback
	addListItem: function(title, description, imagePath){
	  // Create the item's DOM in a fragment
	  var item = document.createElement('div');
	  item.setAttribute('data-bb-type','item');
	  item.setAttribute('data-bb-title', title);
	  item.innerHTML = description;
	  item.setAttribute('data-bb-img', 'file://'+imagePath);
	  item.onclick = function() {alert('clicked');};	  
	  // Append to list
	  document.getElementById('listView').appendItem(item);
	},
	/* STEP 2C: CHANGE THE ACTIVE COVER
		This function will be called in the invoke callback
	*/
	//modify the current Window Cover by providing a new image path
	changeActiveCover: function(imagePath){
		blackberry.ui.cover.setContent(blackberry.ui.cover.TYPE_IMAGE, {
            path: 'file://'+imagePath
        });
        blackberry.ui.cover.updateCover();
	},
	/* BBM setDisplayPicture has a 32Kb limit when setting the user's profile picture as such we
	 * need to resize the photo that we have just taken with the camera. We are going to use
	 * canvas and the fileEntry API to create a new temporary file.
	 */
	resizePicture: function(imagePath){
		var localImage;
		var img = new Image();

		img.onload = function() {
			/// set size proportional to image
			var canvas = document.createElement('canvas');
		    canvas.height = canvas.width * (img.height / img.width);

		    /// step 1 - resize to 50%
		    var oc = document.createElement('canvas'),
		        octx = oc.getContext('2d');

		    oc.width = img.width * 0.2;
		    oc.height = img.height * 0.2;
		    octx.drawImage(img, 0, 0, oc.width, oc.height);
		    // save canvas image as data url 
      		//var dataBlob = oc.toBlob();      		
      		core.saveAsCompressedPNG(oc);

		};
		img.src = "file://"+imagePath;
	},
	/* This function has been extracted from the canvasToFilesystem sample availaable on github
	 * https://github.com/blackberry/BB10-WebWorks-Samples/tree/master/canvasToFilesystem
	 * We convert the <canvas> element from the resizePicture function above
	 * to a Blob so it can be saved as a file. This is generally the most complicated part.
     * We are using an external library availabele at https://github.com/eligrey/canvas-toBlob.js
     *
     * Note: The above is a cross-browser implementation of the HTML5 canvas.toBlob standard:
     * http://www.w3.org/TR/2011/WD-html5-20110525/the-canvas-element.html
     */
	saveAsCompressedPNG: function(canvas){
		window.webkitRequestFileSystem(window.TEMPORARY, 5.0 * 1024 * 1024, function (fileSystem) {
            /* We've obtained a valid fileSystem object. */
            fileSystem.root.getFile('image.png', {create: true}, function (fileEntry) {
                /* We've obtained a valid fileEntry object. */
                fileEntry.createWriter( function (fileWriter) {
                    /* We've obtained a valid fileWriter object. */
                    fileWriter.onerror = function (fileError) {
                            console.log('FileWriter Error: ' + fileError);
                    };
                    fileWriter.onwriteend = function () {
                            console.log('Canvas saved! '+ fileEntry.toURL());
                            setBBMPicture(fileEntry.toURL());
                    };
                    canvas.toBlob( function (blob) {
                        fileWriter.write(blob);
                    },'image/png');
                }, function (fileError) {
					console.log('FileEntry Error: ' + fileError);
				});
            },function (fileError) {
            	console.log('DirectoryEntry (fileSystem.root) Error: ' + fileError);
            });
        },function (fileError) {
	        /* Error. */
	        console.log('FileSystem Error: ' + fileError);
        });
	},
	/* STEP 2D: CHANGE YOUR BBM PICTURE
		in order for this to work please ensure that you are testing on a physical device
		or that you have enabled the BBM simulator on the BlackBerry controller for the simulator.
		Also this, relies on the code between line 10 and 34. Make sure you comment it out 
	*/
	//Change the BBMPicture with the provided image
	setBBMPicture: function(imagePath){
		if(core.isBBMConnected){
			blackberry.bbm.platform.self.setDisplayPicture('file://'+imagePath, function (success) {
        			console.log('[core.js] - setBBMPicture: Image substituted '+success);
    			}, function (error) {
        			console.error("[core.js] - setBBMPicture: "+error);
    		});
		}else{
			console.error("[core.js] - setBBMPicture: BBM is not connected")
		}
	}
}