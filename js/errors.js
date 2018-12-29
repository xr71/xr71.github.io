// function to handle error while loading Google Maps
function friendlyMapErr() {
    console.log("inside map error");
	document.querySelector("#handleErrors").innerHTML = "<p class='text-danger'>Looks like there was an error in loading Google Maps  :(  Please try reloading the page.<p>"
}

// function to handle error while loading Foursquare
function friendlyFSErr() {
    console.log("inside foursquare error");
    document.querySelector("#handleErrors").innerHTML = "<p class='text-danger'>Looks like there was an error in requesting FourSquare data for some or all of the marker points :(  Please check and/or update FS credentials and try reloading the page.<p>"
}