// var express = require('express');
// var app = express();
// app = express(); 
// app.use('/', express.static(__dirname + '/'));
// app.listen(3000, function () {
//   console.log('Example app listening on port 3000!');
// });

//Getting required modules.
const express = require('express');
const app = express();
const path = require('path');
const cors = require('cors')


//Getting firebase details.
var firebase = require("firebase-admin");

var serviceAccount = require("./serviceAccountKey.json");

//Initializing the content.
firebase.initializeApp({
    credential: firebase.credential.cert(serviceAccount),
    databaseURL: "https://univiz.firebaseio.com"
  });

  // Getting database instance.
var database = firebase.database();

//get all locations
//Get API endpoint supplying all the data required.
app.get('/locations', async (request, response) => {
    try {
        let result = []
        //Data is stored in locations array. Hence getting the reference of locations branch.
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
      response.json(result);
  
    } catch(error){
  
      response.status(500).send(error);
  
    }
  
});

app.post('/location', async(request, response) => {
  try {
    let result = []
    const locationsRef = database.ref('locations');
    
    let randomLat = request.latitude + getRandomLocationNumber()
    let randomLng = request.longitude + getRandomLocationNumber()

    locationsRef.push({
      name: 'Random Test Name',
      lat:  randomLat,
      lng:  randomLng
    }).then(
        window.alert('Lat:'+ randomLat + ', Long:' + randomLng)
        ).then(
            window.location.reload()
    )

} catch(error){

  response.status(500).send(error);

}
})

//set index.html as our first page. Endpoint for root page.
app.get('/', function(req, res) {
  //sending index.html for root.
    res.sendFile(path.join(__dirname, 'index.html'));
});

//Endpoint for arjs page.
app.get('/arjs', cors(), function(req, res) {
  //Adding CORS header to avoid blocking.
  res.header("Access-Control-Allow-Origin", "*");
res.sendFile(path.join(__dirname, 'arjs.html'));
});

app.use("/static", express.static('./static/'));

//Creating a listener on port 4000. This will ensure the server is running.
app.listen(process.env.PORT || 4000, function(){
    console.log('Your node js server is running');
});


// Getting the random number and manipulating the data.
const getRandomLocationNumber = function(){
  return Math.floor(Math.random() * (0.009 - 0.001)) + 0.001
}