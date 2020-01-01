var currentLocation; //Storing the users current location.


  const loadPlaces = function (coords) {
    
    const method = 'api';

    const PLACES = [
        {
            name: "Your place name",
            location: {
                lat: 0, 
                lng: 0, 
            }
        },
    ];

    if (method === 'api') {
        return loadPlaceFromAPIs(coords);
    }

    return PLACES;
};


// getting places from REST APIs
async function loadPlaceFromAPIs(position) {
    let result = []
    //set loadMode to 'server' to use service call
    let loadMode ='server'
    if(loadMode ==='serverless'){
        const locationsRef = database.ref('locations');
        const locations = await locationsRef.once('value');
        locations.forEach(function(snapshot) {
            result.push({
                name:snapshot.val().name,
                desciption:snapshot.val().description?snapshot.val().description:'Empty Description',
                location: {
                    lat:snapshot.val().lat,
                    lng:snapshot.val().lng,
                }
            });
        })
    } else if (loadMode ==='server'){
        //Using the locations in app.js to get all the locations.
        result = await fetch('/locations').then(
           
            res => res.json()
        )
    }
    return result
};

//This method will be called in load for the first time when the website loads.
window.onload = () => {
    //Getting a-scene tags on the page.
    const scene = document.querySelector('a-scene');

    // first get current user location
    return navigator.geolocation.getCurrentPosition(function (position) {

        currentLocation = position.coords
        // then use it to load from remote APIs some places nearby
        loadPlaces(position.coords)
            .then((places) => { //Then callback for loading the places.
                //Iterating over places array received.
                places.forEach((place) => {
                    //Get the latitude and longitude
                    const latitude = place.location.lat;
                    const longitude = place.location.lng;

                    // Creating the A-link element that will have the augmented reality content.
                    // add place name
                    const text = document.createElement('a-link');
                    //Setting attributes
                    text.setAttribute('gps-entity-place', `latitude: ${latitude}; longitude: ${longitude};`);
                    text.setAttribute('title', place.name+': '+place.desciption);
                    text.setAttribute('scale', '10 10 10');

                    text.addEventListener('loaded', () => {
                        window.dispatchEvent(new CustomEvent('gps-entity-place-loaded'))
                    });
                    //Appending the element to html content with marker.
                    scene.appendChild(text);

                    // add place description
                    const description = document.createElement('p');
                    description.setAttribute('value',place.name)
                    scene.appendChild(description); //Adding the Paragraph tag for the marker based on name from firebase.
                    // description.style.marginTop = "";
                });
            })
    },
        (err) => console.error('Error in retrieving position', err),  //Error logging.
        {
            //Setting parameters.
            enableHighAccuracy: true,
            maximumAge: 0,
            timeout: 27000,
        }
    );
};
