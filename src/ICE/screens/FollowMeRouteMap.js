import React, { Component } from 'react';
import { Alert, StyleSheet, Text, View, Image, TouchableOpacity,TouchableWithoutFeedback, Animated, Dimensions } from 'react-native';
import { ButtonGroup, Button, Header, Overlay, Avatar } from 'react-native-elements';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { GooglePlacesAutocomplete } from 'react-native-google-places-autocomplete';
import Geolocation from '@react-native-community/geolocation';
import MapView, { PROVIDER_GOOGLE, Marker, Callout, Polygon, Circle, AnimatedRegion} from 'react-native-maps';
import NumericInput from 'react-native-numeric-input'
import { Hoshi, Kaede } from 'react-native-textinput-effects';
import firebase from '@react-native-firebase/app';
import '@react-native-firebase/auth';
import '@react-native-firebase/database';
import Polyline from '@mapbox/polyline';
import { Toast } from 'native-base';
import { ThemeConsumer } from 'styled-components';
import { send } from 'react-native-sms';
import BottomNavBar from '../UIcomponents/BottomNavNew';
import SOS from '../UIcomponents/SOSbutton'
import haversine from 'haversine';
import NotifService from "../UIcomponents/NotifService";

export default class FollowMeRouteMap extends Component {

  constructor(props){
    super(props);
    this.animateOpacityValue = new Animated.Value(0);
    this.state = { 
     userId: "O28vQIssPWbkjpXLu7qKKxfV7B33",//firebase.auth().currentUser.uid,
     label: '', selectedIndex: null,locationRef:'',
     region: {latitude: 0, longitude: 0, longitudeDelta: 0.025, latitudeDelta: 0.025},
     initialPosition: [],
     coordinate: new AnimatedRegion({
      latitude: 0,
      longitude: 0,
      latitudeDelta: 0,
      longitudeDelta: 0
    }),
     destination: {latitude: 0,longitude: 0,},
     ShowToast: false,
     clicked: false,
     travel_time: 0,
     active_session: false,
     latitude:0,
     longitude:0,
     profile_pic_url: '',
     watchers: [],
     routeCoordinates: [],
     userMovements: [],
     distance_travelled: 0,
     prevLatLng: {},
     visible: false, 
     trackUser: false,
     route_distance: 0,
     hasStarted: false,
     coords: [],
     safeZones: [],
     currentLong: 0, radius: 200, currentLat: 0, currentPosition: '', safeZoneName: '', SafeZoneAddress: '', SafeZoneLat: 0, SafeZoneLng: 0}
   
     this.ToastMessage = '';
     this.notif =  new NotifService(this.onRegister.bind(this), this.onNotif.bind(this));
    }

    onRegister(token) {
      Alert.alert("Registered !", JSON.stringify(token));
      console.log(token);
      //this.setState({ registerToken: token.token, gcmRegistered: true });
    }
  
    onNotif(notification) {
      const {navigate} = this.props.navigation
      console.log(notification);
  
        if(notification.userInteraction){
          if(notification.data.notificationType === "medical" && Platform.OS === "ios"){
            this.notif.cancelLocalNotifications({id:"0"})
            //reschedule it
           // this.notif = setupPushNotification(this.onRegister.bind(this), this.onNotif.bind(this));
            firebase.database().ref(`medical/${this.state.userId}`)
            .on('value', snapshot => {
  
              const { additional, age, allergies, blood_type, conditions, doctor_name, kin, medication, sex } = snapshot.val();
  
              let ios_options = {
                date: new Date(Date.now() + (30000)), // in 30 secs
                repeatType: 'day',
                id: '0',
                ticker: "My Notification Ticker",
                bigText: `Age: ${age}\n--------------\nSex: ${sex}\n--------------\nDoctor: ${doctor_name}\n--------------\nKin: ${kin}\n--------------\nBlood type: ${blood_type}\n--------------\nConditions: ${conditions}\n--------------\nAllergies: ${allergies}\n--------------\nMedication: ${medication}\n--------------\nAdditional: ${additional}`,
                color: "blue",
                alertAction: 'view',
                // data: data,
                visibility: "public",
                title: "Medical Profile",
                message:`Age: ${age}\n--------------\nSex: ${sex}\n--------------\nDoctor: ${doctor_name}\n--------------\nKin: ${kin}\n--------------\nBlood type: ${blood_type}\n--------------\nConditions: ${conditions}\n--------------\nAllergies: ${allergies}\n--------------\nMedication: ${medication}\n--------------\nAdditional: ${additional}`,
                playSound: false,
                foreground: false,
                userInfo: {
                  notificationType: "medical",
                 },
                 data: JSON.stringify({notificationType: "medical"})
              }
            
             this.notif.scheduleNotif(ios_options)
  
            })
        }else{
           navigate(notification.data.screen,{user_id:notification.data.sender_id})
          }
      }
    }
  
  
     notificationListener(){
              // notification checker
              firebase.database().ref(`notifications/${this.state.userId}`)
              .on('child_added', snapshot => {
      
                const { msg, screen, sender_id, time, title } = snapshot.val();
                const { key: id } = snapshot;
      
                console.log("screen",screen.toString())
                let options = {
                  id: id,
                  autoCancel: false,
                  bigText: msg,
                  ongoing: true,
                  priority: "high",
                  visibility: "public",
                  importance: "high",
                  title: title,
                  message: msg,
                  playSound: true,
                  vibrate: true,
                  //tag: `${screen.toString()}`, //for android
                  userInfo: {
                   screen: screen.toString(),
                   sender_id: sender_id.toString(),
                  }, //for ios
                  data: JSON.stringify({screen: screen.toString(), sender: sender_id.toString()})
                }
                //
                this.notif.localNotif(options);
      
                firebase.database().ref(`notifications/${this.state.userId}/${id}`).remove()
        })
     }

 async getActiveWatchers() {
  // show their avatar at the side of the screen
  // on click - show their name & what circle they're apart of for that user?
  console.log("this.state.userId",this.state.userId)
  console.log("this.state.session_id",this.state.session_id)
  firebase.database().ref(`followMe/${this.state.userId}/active_sessions/${this.state.session_id}/watchers`).on('value', async (dataSnapshot) => {
    if(dataSnapshot.val()){
      var values = dataSnapshot.val();
      var keys = Object.keys(values);
      console.log("values",values)
      console.log("keys",keys)
      let index = 1;
      const data = [
        ];
      for(var i = 0; i < keys.length; i++ ) {
      console.log("current key",keys[i])
      console.log("current session",this.state.session_id)
      console.log("current id",this.state.userId)
       const name = await firebase.database().ref(`followMe/${this.state.userId}/active_sessions/${this.state.session_id}/watchers/${keys[i]}/name`).once('value');
       const id = await firebase.database().ref(`followMe/${this.state.userId}/active_sessions/${this.state.session_id}/watchers/${keys[i]}/id`).once('value');
       const pic_url = await firebase.database().ref(`followMe/${this.state.userId}/active_sessions/${this.state.session_id}/watchers/${keys[i]}/profile_pic_url`).once('value');
       const circle = await firebase.database().ref(`followMe/${this.state.userId}/active_sessions/${this.state.session_id}/watchers/${keys[i]}/circle`).once('value');
       data.push({name: name.val(), id: id.val(), pic_url: pic_url.val(), circle: circle.val()})
      }
      console.log("watchers",data)
      this.setState({watchers:data});
    }
  })
 }

 sendToGroupChats(circle_id){
  //var text = `${this.state.user_name} has activated SOS mode.`
  const { msg } = this.state;
  // current user object
  user = {
    name: this.state.user_name,
    id: this.state.user_id,
    avatar: this.state.profile_pic_url,
  }
  const message = {
    text:msg,
    user,
    timestamp: firebase.database.ServerValue.TIMESTAMP,
    createdAt: new Date()
  };
  
  firebase.database().ref(`messages/${circle_id}`).push(message);
}

async getCircles(){
  const circles_ids = await firebase.database().ref(`circles/${this.state.userId}/personal_circles`).once('value');
  if(circles_ids.exists()){
    for(var i = 0; i < Object.keys(circles_ids.val()).length; i++ ) {
      //console.log(i, Object.keys(circles_ids.val())[i])
      var id = Object.keys(circles_ids.val())[i]
      this.sendToGroupChats(id)
      const members_ids = await firebase.database().ref(`circles/${this.state.userId}/personal_circles/${id}/members`).once('value');
      console.log(i, id, Object.keys(members_ids.val()))
      for(var j = 0; i < Object.keys(members_ids.val()).length; i++ ) {
        member_id = Object.keys(members_ids.val())[j]

        notification = {
          sender_id: this.state.userId,
          title: "ICE - Follow me Session",
          msg: this.state.msg,
          screen: "FollowMeTrackMap", //to direct the user to when they click on it 
          time: firebase.database.ServerValue.TIMESTAMP
      }
      firebase.database().ref(`notifications/${member_id}`).push(notification)
      firebase.database().ref(`notification_feed/${member_id}`).push(notification)
      }
     }
  }
}

async getOtherCircles(){
  const circles_ids = await firebase.database().ref(`circles/${this.state.userId}/other_circles`).once('value');
  if(circles_ids.exists()){
    for(var i = 0; i < Object.keys(circles_ids.val()).length; i++ ) {
      var id = Object.keys(circles_ids.val())[i]
      this.sendToGroupChats(id)
      const owner = await firebase.database().ref(`circles/${this.state.userId}/other_circles/${id}`).once('value');
      var owner_id = Object.keys(owner.val())[0]
      const members_ids = await firebase.database().ref(`circles/${owner_id}/personal_circles/${id}/members`).once('value');
      console.log(i, id, Object.keys(members_ids.val()))
      // send to the owner
      notification = {
        sender_id: this.state.userId,
        title: "ICE - Follow me Session",
        msg: this.state.msg,
        screen: "FollowMeTrackMap", //to direct the user to when they click on it 
        time: firebase.database.ServerValue.TIMESTAMP
      }
      firebase.database().ref(`notifications/${owner_id}`).push(notification)
      firebase.database().ref(`notification_feed/${owner_id}`).push(notification)
      for(var j = 0; i < Object.keys(members_ids.val()).length; i++ ) {
        member_id = Object.keys(members_ids.val())[j]
        notification = {
          sender_id: this.state.userId,
          title: "ICE - Follow me Session",
          msg: this.state.msg,
          screen: "FollowMeTrackMap", //to direct the user to when they click on it 
          time: firebase.database.ServerValue.TIMESTAMP
      }
      firebase.database().ref(`notifications/${member_id}`).push(notification)
      firebase.database().ref(`notification_feed/${member_id}`).push(notification)
      }
     }
  }
}

 async getSafeZones() {
   
  const snapshot = await firebase.database().ref(`safeZones/`).child(`${this.state.userId}`).once('value');
  if(snapshot.val()){
      var values = snapshot.toJSON();
      var keys = Object.keys(values);

      //var json_Value = values["QuO6SxPNCZbgGiyi4yGTrMktmV53"];
     // var keys = Object.keys(values["QuO6SxPNCZbgGiyi4yGTrMktmV53"])

      const data = [
        ];
      for(var i = 0; i < keys.length; i++ ) {
        key = keys[i].toString()
        console.log("user",this.state.userId)
        const SafeZoneLat = await firebase.database().ref(`safeZones/${this.state.userId}/${key}/latitude`).once('value');
        const SafeZoneLng = await firebase.database().ref(`safeZones/${this.state.userId}/${key}/longitude`).once('value');
        const SafeZoneLabel = await firebase.database().ref(`safeZones/${this.state.userId}/${key}/name`).once('value');

        console.log(SafeZoneLabel)

        data.push({ description: SafeZoneLabel.val(), geometry: { location: { lat: parseFloat(SafeZoneLat), lng: parseFloat(SafeZoneLng) } }});
      }

      console.log("data",data)
      this.setState({safeZones:data});
    }
 }

 ShowToastFunction(message, duration=4000)
   {
         this.ToastMessage = message;
 
         this.setState({ ShowToast: true }, () =>
         {
               Animated.timing
               (
                  this.animateOpacityValue,
                  { 
                    toValue: 1,
                    duration: 500
                  }
               ).start(this.HideToastFunction(duration))
         });
   }

 HideToastFunction = (duration) =>
   {
      this.timerID = setTimeout(() =>
      {
            Animated.timing
            (
               this.animateOpacityValue,
               { 
                 toValue: 0,
                 duration: 500
               }
            ).start(() =>
            {
               this.setState({ ShowToast: false });
               clearTimeout(this.timerID);
            })
      }, duration);      
   }

  async getRemainingTime(currentLat,currentLng,destinationLoc,mode){
    console.log("help me",currentLat,currentLng,destinationLoc.lat,destinationLoc.lng,mode)
    try {
    let resp = await fetch(`https://maps.googleapis.com/maps/api/directions/json?origin=${currentLat},${currentLng}&destination=${destinationLoc.lat},${destinationLoc.lng}&key=AIzaSyDlWvAUCKqqsHT4L2SYU_wE8rUCKXtEjvM&mode=${mode}`)
    let respJson = await resp.json();
    console.log("respJson 1",respJson)
    let time = respJson.routes[0].legs[0].duration.value;
    //let time = respJson.routes[0].legs[0].duration.value; // metres
    this.setState({travel_time:time})
    firebase.database().ref(`followMe/${this.state.userId}/active_sessions/${this.state.session_id}`).update({
      time: time
    })
   } catch(error) {
      alert(`${error} + 1`)
      return error
  }
  }

  async getRemainingDistance(currentLat,currentLng,destinationLoc,mode){
      console.log("help me",currentLat,currentLng,destinationLoc.lat,destinationLoc.lng,mode)
      try {
      let resp = await fetch(`https://maps.googleapis.com/maps/api/directions/json?origin=${currentLat},${currentLng}&destination=${destinationLoc.lat},${destinationLoc.lng}&key=AIzaSyDlWvAUCKqqsHT4L2SYU_wE8rUCKXtEjvM&mode=${mode}`)
      let respJson = await resp.json();
      console.log("respJson 1",respJson)
      let distance = respJson.routes[0].legs[0].distance.value; // metres
      return distance
     } catch(error) {
        alert(`${error} + 1`)
        return error
    }
  }

  async getDirections(startLocLat,startLocLng,destinationLoc,mode) {

    console.log("startLoc",startLocLat,startLocLng)
    console.log("destinationLoc",destinationLoc.lat,destinationLoc.lng)
    //https://maps.googleapis.com/maps/api/directions/json?origin=53.36267203303405,-6.516304127633568&destination=53.3860938,-6.256368600000001&key=AIzaSyDlWvAUCKqqsHT4L2SYU_wE8rUCKXtEjvM&mode=driving
    try {
        let resp = await fetch(`https://maps.googleapis.com/maps/api/directions/json?origin=${startLocLat},${startLocLng}&destination=${destinationLoc.lat},${destinationLoc.lng}&key=AIzaSyDlWvAUCKqqsHT4L2SYU_wE8rUCKXtEjvM&mode=${mode}`)
        let respJson = await resp.json();
        console.log("respJson 1",respJson)
        let time = respJson.routes[0].legs[0].duration.value;
        let distance = respJson.routes[0].legs[0].distance.value; // metres
        let points = Polyline.decode(respJson.routes[0].overview_polyline.points);
        let coords = points.map((point, index) => {
            return  {
                latitude : point[0],
                longitude : point[1]
            }
        })
        firebase.database().ref(`followMe/${this.state.userId}/active_sessions/${this.state.session_id}`).update({
          coords: coords,
          prevLatLng: {latitude:startLocLat,longitude:startLocLng}, //initalize
          routeCoordinates: {0:{latitude:startLocLat,longitude:startLocLng}}, //initalize
          destination_lat:destinationLoc.lat,
          destination_lng:destinationLoc.lng,
          time: time,
          timestamp: firebase.database.ServerValue.TIMESTAMP,
          distance: distance,
        })
        this.setState({coords: coords})
        this.setState({travel_time: time})
        this.setState({route_distance: distance})
        return coords
    } catch(error) {
        alert(error)
        return error
    }
}

async startSession () {
  // cant have empty values...
  if(this.state.destination === "" || this.state.selectedIndex === null){
    alert('Please enter all fields')
    this.setState({clicked:false})
  }

  else{
    // get mode
    var mode = '';

    if(this.state.selectedIndex === 0){
      mode = 'walking';
    }

    if(this.state.selectedIndex === 1){
      mode = 'driving';
    }

    if(this.state.selectedIndex === 2){
      mode = 'transit';
    }

    // start tracking the user to determine their starting point
    this.setState({trackUser:true})

    // get id for this session...only when clicked start!
    // also save the time started & route for later user... 
    // set this in users/ to be the current follow me session - can only have one at a time
    let session_id = firebase.database().ref(`followMe/`).child(`${this.state.userId}`).child('active_sessions').push().key;
    firebase.database().ref(`users/${this.state.userId}`).update({
      follow_me_session: session_id,
      mode: "followme"
    })
    
    this.setState({session_id})

    const {prevLatLng, destination, routeCoordinates,coordinate,latitude,longitude} = this.state;

    // show route to the user
    this.getDirections(this.state.latitude,this.state.longitude,this.state.destination,mode)

    const newCoordinates ={
      latitude,
      longitude
    }
    const lat = destination.lat
    const lng  = destination.lng
    const destinationCoords ={
      lat,
      lng,
    }
    console.log("destinationCoords",destinationCoords)
    console.log("newCoordinates",newCoordinates)
    console.log("distance from start to end 2:",haversine(newCoordinates, destinationCoords))
  
    // push the starting point & dest & mode & travel time & km if possible ( we can then see how much out of the )
    
    firebase.database().ref(`followMe/${this.state.userId}/active_sessions/${session_id}`).update({
        id: session_id,
        mode: mode,
        starting_lat: latitude,
        starting_lng: longitude,
        distance_travelled: 0,
        timer: 0,
        checked_in: false,
    })

    const newCoordinate = {
      latitude,
      longitude
    }

    // last thing you do - to then show the route & disable the overlap...
    this.setState({visible:false})
    
    // set up a timer from starting time to starting time + est time.
    // call this once..

    // notify circle members
    this.setState({msg:`${this.state.user_name} has started a Follow me Session.`})
    this.getCircles()
    this.getOtherCircles()
 }
}

ShowAlertWithDelay=(time)=>{
  // make sure the distance has changed - if not 0 start countdown
    
    const {latitude, longitude, destination} = this.state;
   
    const currentLatLng = {
      latitude,
      longitude
    }
   
    setTimeout(function(){
      // First check is the user close (current & dst) within  < 500 m?
      //haversine(prevLatLng, newLatLng)
      //Loop??

      Alert.alert(
        "ICE Follow Me Session",
        "You haven't reach your destination yet based on estimated time, are you OK?",
        [
          {
            text: "NO",
            onPress: () => {
             // notify circle members
            this.setState({msg:`${this.state.user_name} requires help on their journey. Click to see their current location.`})
            this.getCircles()
            this.getOtherCircles()
            },
            style: "cancel"
          },// TODO: DECIDED ON WHETHER TO TRIGGER SOS ?? Loop to ask again?
          { text: "YES", onPress: () => console.log("OK Pressed")  }
        ],
        { cancelable: false }
      );
 
    }, time*1000);
 
 
}

// when user presses start..

async componentWillMount() {


  this.notificationListener()

  // check that the user doesnt already have an active follow me session running!

  const profile_pic_url = await firebase.database().ref(`users/${this.state.userId}/profile_pic_url`).once('value');
  this.setState({profile_pic_url: profile_pic_url.val()})

  const user_first_name = await firebase.database().ref(`users/${this.state.userId}/first_name`).once('value');
  const user_last_name = await firebase.database().ref(`users/${this.state.userId}/last_name`).once('value');
  var user_name = user_first_name.val() + " " + user_last_name.val()
  this.setState({user_name})

  firebase.database().ref(`users/${this.state.userId}`).on('value', (dataSnapshot) => {
    if(dataSnapshot.val()){
        const data = dataSnapshot.val();
        const latitude = parseFloat(data["latitude"]);
        const longitude = parseFloat(data["longitude"])
        const {coordinate} = this.state;
       
        this.setState({
          latitude,
          longitude,
        });

        const newCoordinate = {
          latitude,
          longitude
        };

        if (Platform.OS === "android") {
          if (this.marker) {
              this.marker._component.animateMarkerToCoordinate(
                newCoordinate,500);
              }
          } else {
             coordinate.timing(newCoordinate).start();
          }
        }
    })

  const session_check = await firebase.database().ref(`users/${this.state.userId}/follow_me_session`).once('value');
  console.log("ession_check",session_check)
  if(session_check.val() === ""){
    // means that theres no current active session running
    this.setState({visible:true})
    //this.setState({active_session:true})
  }else{
    this.setState({session_id:session_check.val()})
    const coords = await firebase.database().ref(`followMe/${this.state.userId}/active_sessions/${this.state.session_id}/coords`).once('value');
    //const time = await firebase.database().ref(`followMe/${this.state.userId}/active_sessions/${this.state.session_id}/time`).once('value');
    const mode = await firebase.database().ref(`followMe/${this.state.userId}/active_sessions/${this.state.session_id}/mode`).once('value');
    const dstlat = await firebase.database().ref(`followMe/${this.state.userId}/active_sessions/${this.state.session_id}/destination_lat`).once('value');
    const dstlng = await firebase.database().ref(`followMe/${this.state.userId}/active_sessions/${this.state.session_id}/destination_lng`).once('value');
    this.setState({coords: coords.val(), mode: mode.val()})

    var lat = parseFloat(dstlat.val())
    var lng = parseFloat(dstlng.val())

    destination = {
      lat,
      lng
    }

    this.setState({destination})

    this.getRemainingTime(this.state.latitude, this.state.longitude, destination, mode.val());


  //   if(this.getRemainingDistance(this.state.latitude, this.state.longitude, destination, mode.val()) >= 50){
  //     // ask user do they want to stop?
  //     //TODO: notification
  //     Alert.alert(
  //       "ICE Follow Me Session",
  //       "You have reach your destination, are you ready to check_in?",
  //       [
  //         {
  //           text: "NO",
  //           onPress: () => {
  //             this.setState({msg:`${this.state.user_name} has reached their destination but hasn't checked in as OK.`})
  //             this.getCircles()
  //             this.getOtherCircles()
  //           },
  //           style: "cancel"
  //         },// TODO: check in for user
  //         { text: "YES", onPress: () => console.log("OK Pressed")  }
  //       ],
  //       { cancelable: false }
  //     );
  //   }
  //  }

   // check that the current lat/lng is close to dst
    }
    firebase.database().ref(`users/${this.state.userId}`).on('value', async snapshot => {
      snapshot = snapshot.val()
      console.log("snapshot[",snapshot)
      let resp = await fetch(`https://maps.googleapis.com/maps/api/directions/json?origin=${snapshot["latitude"]},${snapshot["longitude"]}&destination=${this.state.destination.lat},${this.state.destination.lng}&key=AIzaSyDlWvAUCKqqsHT4L2SYU_wE8rUCKXtEjvM&mode=${this.state.mode}`)
      let respJson = await resp.json();
      console.log("respJson 1",respJson)
      let distance = respJson.routes[0].legs[0].distance.value; // metres
      console.log("distance left",distance)
      if(distance < 100){
        Alert.alert(
          "ICE Follow Me Session",
          "You have reach your destination, are you ready to check_in?",
          [
            {
              text: "NO",
              onPress: () => {
                this.setState({msg:`${this.state.user_name} has reached their destination but hasn't checked in as OK.`})
                this.getCircles()
                this.getOtherCircles()
              },
              style: "cancel"
            },// TODO: check in for user
            { text: "YES", onPress: () => console.log("OK Pressed")  }
          ],
          { cancelable: false }
        );
      }
    })
   // console.log(this.state.latitude,this.state.longitude,this.state.destination,this.state.mode)

    this.getActiveWatchers()

    firebase.database().ref(`followMe/${this.state.userId}/active_sessions/${this.state.session_id}`).on('value', (dataSnapshot) => {
      if(dataSnapshot.val()){
          const data = dataSnapshot.val();
          this.setState({userMovements: data["routeCoordinates"]})
          //console.log("userMovements2",this.state.userMovements)
        }
      })

    //console.log("destination,currentLatLng",destination,currentLatLng)

      this.getSafeZones();

      const timer = await firebase.database().ref(`followMe/${this.state.userId}/active_sessions/${this.state.session_id}/timer`).once('value');
      const time = await firebase.database().ref(`followMe/${this.state.userId}/active_sessions/${this.state.session_id}/time`).once('value');
      const distance_travelled = await firebase.database().ref(`followMe/${this.state.userId}/active_sessions/${this.state.session_id}/distance_travelled`).once('value');
      const mode = await firebase.database().ref(`followMe/${this.state.userId}/active_sessions/${this.state.session_id}/mode`).once('value');
      //get remainding time from the current location - user could have left and reentered the activity

      if( parseInt(distance_travelled.val()) > 0 && parseInt(timer.val()) === 0)
      {
        this.ShowAlertWithDelay(time);
        firebase.database().ref(`followMe/${this.state.userId}/active_sessions/${this.state.session_id}`).update({
          timer: 1,
        })
      }
  // else - the timer has already been trigger or user hasnt moved
  }

  onRegionChange = (region) => {
    this.setState({ region });
    console.log('region', region)
  }

  finish_session(){
    //restore user mode to "normal"
    //restore follow_me_session to ""
    //TODO: notify users that you finished
    firebase.database().ref(`users/${this.state.userId}`).update({
      follow_me_session: "",
      mode: "normal"
    })
    //make note that this session was marked as finished 
    //get the current location that they finished on 
    firebase.database().ref(`followMe/${this.state.userId}/active_sessions/${this.state.session_id}`).update({
      checked_in: true,
      time_finished: firebase.database.ServerValue.TIMESTAMP,
      finish_lat: this.state.latitude,
      finish_lng: this.state.longitude,
    })

    this.setState({msg:`${this.state.user_name} has checked in as OK.`})
    this.getCircles()
    this.getOtherCircles()
  }

  async check_in(){
    // see have they reached their destination...
    // first see have they even moved 
    const distance_travelled = await firebase.database().ref(`followMe/${this.state.userId}/active_sessions/${this.state.session_id}/distance_travelled`).once('value');
    const mode = await firebase.database().ref(`followMe/${this.state.userId}/active_sessions/${this.state.session_id}/mode`).once('value');
    if(parseFloat(distance_travelled.val()) > 0){
     if(this.getRemainingDistance(this.state.latitude, this.state.longitude, this.state.destination, mode.val()) >= 100){
       // distance is less than 100m - allow them to finish
     }else{
       //TODO: Send notification to network that user finished early
       // Ask if ok
       Alert.alert(
        "ICE Follow Me Session",
        "You haven't reach your destination, are you OK?",
        [
          {
            // TODO: DECIDED ON WHETHER TO TRIGGER SOS ?? Loop to ask again?
            text: "NO",
            onPress: () => console.log("Cancel Pressed"),
            style: "cancel"
          },
          { text: "YES", onPress: () => this.finish_session()}
        ],
        { cancelable: false }
      );
     }
    }else{
     Alert.alert( "ICE Follow Me Session","You haven't moved from your starting position yet.",[
      {
        // TODO: DECIDED ON WHETHER TO TRIGGER SOS ?? Loop to ask again?
        text: "OK",
        onPress: () => console.log("Okay Pressed"),
      },
      ]
     );
    }

    // add routeCoordinates to DB to show the users' actual route.
  }

  render() {
  const buttons = ['Walking', 'Driving', 'Transit'];
  const { selectedIndex } = this.state;
  return (
 <View style={styles.mainContainer}>
  <SOS/>        
  <BottomNavBar/>
  {this.state.visible ?
      <Overlay isVisible={this.state.visible}
      width={"100%"}
      height={Dimensions.get('window').height/1.3}>
      <View style={styles.mainContainer}>
      <View style={styles.contentContainer}>
      <Text style={{alignSelf:"center", fontFamily:"Roboto", color:"#0EA8BE"}}>Mode:</Text>
      <ButtonGroup
      selectedIndex={selectedIndex}
      onPress={selectedIndex => {
        this.setState({ selectedIndex })}}
      buttons={buttons}
      selectedButtonStyle={{color:"#0EA8BE"}}
      containerStyle={{height: 40, marginTop:15}}/>
       <Text style={{marginTop: 10, fontFamily:"Roboto", alignSelf:"center", color:"#0EA8BE"}}>Destination:</Text>
       <GooglePlacesAutocomplete
          ref={(instance) => { this.locationRef = instance }}
          placeholder="Enter your destination's address"
          minLength={4} 
          autoFocus={false}
          keyboardAppearance={'light'}
          returnKeyType={'search'} 
          listViewDisplayed="auto"
          fetchDetails={true}          
          onPress={(data, details=null) => {
            var data = details;
            this.setState({destination:data.geometry.location})
          }
          }
          currentLocation={false} // Will add a 'Current location' button at the top of the predefined places list
          query={{
            key: 'AIzaSyD3_KMwMzLhzJPYH7ZjGBpYbBCZiphwzFc',
            language: 'en', 
            components: 'country:ie'
          }}
          styles={{
            container:{
              //padding: 30,
              marginTop:15
            },
            textInputContainer: {
              width: '100%',
              backgroundColor: '#FFF',
              fontFamily:"Roboto"
            },
            listView: {
              backgroundColor: '#FFF'
            },
            description: {
              fontFamily:"Roboto"
            },
            predefinedPlacesDescription: {
              fontFamily:"Roboto"
            }
          }}
          debounce={200} 
          predefinedPlaces={this.state.safeZones}
        />
      <Button 
       buttonStyle={{ 
        borderRadius:20,
        //borderWidth:1,
        borderColor: "#0EA8BE",
        padding: 5,
        justifyContent:"center",
        alignSelf:"center",
        height: 40,
        marginBottom:10,
        width: 250,}}
        type="outline"
        accessibilityLabel="Click this button to start a follow me session"
        titleStyle={ { color: "#0EA8BE",
        fontSize: 20,
        fontFamily: 'Roboto',
        alignSelf: "center",
    }}
      title="Start Session" loading={this.state.clicked} style={{width:"50%",alignSelf:"center"}} onPress={
        ()=>{
          this.setState({clicked:true})
          this.startSession()}
        }/>
      <Button
          titleStyle={ { color: "#0EA8BE",
          fontSize: 20,
          fontFamily: 'Roboto',
          alignSelf: "center",
      }}
        title="Cancel"
        onPress={()=>{
          this.setState({visible:false})
          this.props.navigation.goBack()
        }}
        type="clear"
      />
      {/* </View> */}
      </View>
      </View>
      {/* </View> */}
    </Overlay>
    : null }
   <Header
      backgroundColor="#0EA8BE"
      leftComponent={ <Icon name="keyboard-backspace" color='#fff' size={30} onPress={() => {this.props.navigation.goBack()}} style={{ marginLeft:20}}/>}
      centerComponent={this.state.visible ? <Text style={{color:"#0EA8BE", fontFamily:"Roboto"}}>Start a Session</Text> : 
      <TouchableOpacity style={styles.CheckInButton} onPress={()=>{this.check_in()}}><Text style={{color:"#0EA8BE", fontFamily:"Roboto", fontSize:19, fontWeight:"800", marginTop: 5}}>Check In</Text></TouchableOpacity> }
      rightComponent={<Icon name="more-vert" color='#fff' size={30} style={{padding:5}}/>}
        />
    <View style={styles.contentContainer}>
    <MapView
         ref={map => {
            this.map = map;
          }}
          style={styles.map}
          provider={PROVIDER_GOOGLE}
          showUserLocation
          followUserLocation
          loadingEnabled
          region={
            {
                latitude: this.state.latitude,
                longitude: this.state.longitude,
                latitudeDelta: 0.010,
                longitudeDelta: 0.010
              }
          }
        >
    <Marker.Animated
                  ref={marker => {
                    this.marker = marker;
                  }}
    coordinate={this.state.coordinate}>
    <View style={{ 
      borderWidth: 5, 
      borderColor: 'orange',
      backgroundColor: 'white',
      height: 50, 
      borderRadius: 30,
      width: 50 }}>
      <Image
        style={{width:"100%", height:"100%",borderRadius:30}}
        source={{uri:this.state.profile_pic_url}}/>
      </View>
    </Marker.Animated>
    {console.log("coords",this.state.coords)}
    <MapView.Polyline 
            coordinates={this.state.coords}//this.state.coords}
            strokeWidth={4}
            tappable={true}
            onPress={()=>{
              this.setState({ ShowToast: true }, () =>
              {
                    Animated.timing
                    (
                       this.animateOpacityValue,
                       { 
                         toValue: 1,
                         duration: 500
                       }
                    ).start(this.HideToastFunction(4000))
              });
            }
              
             }
            strokeColor="black"/>
          <MapView.Polyline 
            coordinates={this.state.userMovements}//this.state.coords}
            strokeWidth={4}
            tappable={true}
            strokeColor="green"/>
     {this.state.ShowToast && this.state.travel_time != ''?
  <TouchableOpacity style={[styles.bubble, styles.bottomButton]}>
  <Text style={styles.bottomBarContent}>
      {parseInt(this.state.travel_time)} mins
  </Text>
  </TouchableOpacity>
    : null }
  <View style={styles.watchers}>
     { this.state.watchers.map(watcher => {
      return (
        <View key={watcher.id} style={styles.watcher}>
          <View style={styles.avatar}>
          <Avatar size="small" rounded source={{ uri: watcher.pic_url}}/>
          </View>
          <Text style={styles.memberName}>{watcher.name}</Text>
        </View>
      );
    })
  }
  </View>
  </MapView>
   </View>
   </View>
  )
}
}

  const styles = StyleSheet.create({
    container: {
      //flexDirection: "column",
      justifyContent: 'flex-end',
      alignItems: 'center',
      flex: 1
    },
    CheckInButton:{
      alignItems: 'center',
      backgroundColor: '#B6F1FA',
      marginTop: 5,
      width:"60%",
      height:"85%",
      borderRadius: 10,
      //marginTop:16
    },
    bottomButton: {
      width: 60,
      paddingHorizontal: 12,
      alignItems: 'center',
      marginHorizontal: 10,
    },
    SOSbutton: {
      position: 'absolute',
      alignSelf: 'center',
      backgroundColor: 'red',
      width: 70,
      height: 70,
      borderRadius: 35,
      bottom: 35,
      zIndex: 10
    },
    button: {
      width: 60,
      height: 60,
      alignItems: 'center',
      justifyContent: 'center',
      shadowColor: "#7F58FF",
      shadowOpacity: 0.1,
      shadowOffset: { x: 2, y: 0 },
      shadowRadius: 2,
      borderRadius: 30,
      position: 'absolute',
      bottom: 20,
      right: 0,
      top: 5,
      left: 5,
      shadowOpacity: 5.0, 
    },
    actionBtn: {
      backgroundColor:'#f00',
      textShadowOffset: { width: 5, height: 5 },
      textShadowRadius: 10,
      borderWidth: 2,
      borderColor: '#fff'
    },
    text: { color:"#FFF", fontSize:11, marginTop:25, marginRight:25,
  },    
    bottomView: {
      width: '100%',
      height: 75,
      marginBottom: 10,
      justifyContent: 'center',
      alignItems: 'center',
    },
    contentContainer: {
      flex: 6,
    },
    bubble: {
      backgroundColor: 'rgba(255,255,255,0.7)',
      paddingHorizontal: 18,
      paddingVertical: 12,
      borderRadius: 20,
    },
    buttonContainer: {
      flexDirection: 'column',
      marginVertical: 20,
      backgroundColor: 'transparent',
    },
    map: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
    },
    search_field_container: {
      height: '45%', 
      width: '100%',
      position: 'absolute', 
      marginTop: 100,
    },
    input_container: {
      alignSelf: 'center',
      backgroundColor: '#FFF',
      opacity: 0.80,
      marginBottom: 25
    },
    bubble: {
      backgroundColor: 'rgba(255,255,255,0.7)',
      paddingHorizontal: 18,
      paddingVertical: 12,
      borderRadius: 20,
    },
    buttonContainer: {
      flexDirection: 'column',
      marginVertical: 20,
      backgroundColor: 'transparent',
    },
    ammountButton: { fontSize: 20, fontWeight: 'bold' },
    button: {
      width: 80,
      paddingHorizontal: 12,
      alignItems: 'center',
      marginHorizontal: 10,
    },
    textInputContainer: {
      height: '45%', 
      width: '100%',
      position: 'absolute', 
      textAlignVertical: 'top',
      top: 35
    },
    ToastMainContainer :{
    
      flex:1,
      justifyContent: 'center',
      alignItems: 'center',
      marginTop: (Platform.OS == 'ios') ? 20 : 0,
      margin:10
      },
       
      animatedToastView:
      {
         marginHorizontal: 30,
         paddingHorizontal: 25,
         paddingVertical: 10,
         borderRadius: 25,
         zIndex: 9999,
         position: 'absolute',
         justifyContent: 'center'
      },
       
      ToastBoxInsideText:
      {
         fontSize: 15,
         alignSelf: 'stretch',
         textAlign: 'center'
      },
      mainContainer: {
        flex: 1,
        backgroundColor: '#FFF',
        height: 34
     },
     watchers :{
      flexDirection: 'column',
      justifyContent: 'flex-start',
      alignItems: 'flex-start',
      width: '100%',
      paddingHorizontal: 10,
     },
     watcher: {
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: 'rgba(255,255,255,1)',
      borderRadius: 20,
      height: 30,
      marginTop: 10,
     },
     memberName: {
      marginHorizontal: 5,
    },
    avatar: {
      height: 30,
      width: 30,
      borderRadius: 15,
    }
  });