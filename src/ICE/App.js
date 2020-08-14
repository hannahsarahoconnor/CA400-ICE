import React, { Component } from 'react';
import 'react-native-gesture-handler';
import StackNav from './UIcomponents/StackNav';
import DeviceInfo from 'react-native-device-info';
import firebase from '@react-native-firebase/app';
import '@react-native-firebase/auth';
import '@react-native-firebase/database';
import {Alert, Platform} from 'react-native';
import BackgroundTimer from 'react-native-background-timer';
import Geolocation from '@react-native-community/geolocation';
import BackgroundGeolocation from '@mauron85/react-native-background-geolocation';
import Sound from 'react-native-sound';
import GeoFencing from 'react-native-geo-fencing';
import haversine from 'haversine';
// import NotifService from "./UIcomponents/NotifService";
const circleToPolygon = require('circle-to-polygon');
var classifyPoint = require("robust-point-in-polygon")
Sound.setCategory('Playback');
import PushNotification from 'react-native-push-notification';

import {check,request,PERMISSIONS, RESULTS} from 'react-native-permissions';

import Voice, {
  SpeechRecognizedEvent,
  SpeechResultsEvent,
  SpeechErrorEvent,
} from '@react-native-community/voice';

// initialize geolocation
navigator.geolocation = require('@react-native-community/geolocation');

// initialize firebase database
var config = {
    databaseURL: "https://iceapp-47499.firebaseio.com/",
    projectId: "iceapp-47499",
  };
  
if (!firebase.apps.length) {
  firebase.initializeApp(config);
}



export function setupPushNotification(onRegister, onNotification) {
  PushNotification.configure({
    onRegister: onRegister, 
    onNotification: onNotification, 

    permissions: {
      alert: true,
      badge: true,
      sound: true
    },

    popInitialNotification: true,

    requestPermissions: true,

  })
  return PushNotification
}

export default class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      recognized: '',
      pitch: '',
      error: '',
      end: '',
      result: '',
      started: '',
      results: [],
      partialResults: [],
      userId: "",
      latitude: 0,
      longitude: 0,
      routeCoordinates: [],
      distanceTravelled: 0,
      prevLatLng: {},
      msg: '',
      user_name:''
    };

    Voice.onSpeechStart = this.onSpeechStart;
    Voice.onSpeechRecognized = this.onSpeechRecognized;
    Voice.onSpeechEnd = this.onSpeechEnd;
    Voice.onSpeechError = this.onSpeechError;
    Voice.onSpeechResults = this.onSpeechResults;
    Voice.onSpeechPartialResults = this.onSpeechPartialResults;
    Voice.onSpeechVolumeChanged = this.onSpeechVolumeChanged;
  }
  
  // keep track of the users's current location

  // TODO - move this to its own js file as its also used in SafeWordCreate??...

  onSpeechStart = (e: any) => {
    console.log('onSpeechStart: ', e);
    this.setState({
      started: '√',
    });
  };

  onSpeechRecognized = (e: SpeechRecognizedEvent) => {
    console.log('onSpeechRecognized: ', e);
    this.setState({
      recognized: '√',
    });
  };

  onSpeechEnd = (e: any) => {
    console.log('onSpeechEnd: ', e);
    this.setState({
      end: '√',
    });
  };

  onSpeechError = (e: SpeechErrorEvent) => {
    console.log('onSpeechError: ', e);
    this.setState({
      error: JSON.stringify(e.error),
    });
  };

  onSpeechResults = (e: SpeechResultsEvent) => {
    console.log('onSpeechResults: ', e);
    this.setState({
      results: e.value,
    });
  };

  onSpeechPartialResults = (e: SpeechResultsEvent) => {
    console.log('onSpeechPartialResults: ', e);
    this.setState({
      partialResults: e.value,
    });
  };

  onSpeechVolumeChanged = (e: any) => {
    console.log('onSpeechVolumeChanged: ', e);
    this.setState({
      pitch: e.value,
    });
  };

  start = async () => {
    console.log("listener has started")
    this.setState({
      recognized: '',
      pitch: '',
      error: '',
      started: '',
      results: [],
      partialResults: [],
      end: '',
    });
    try {
      // TODO maybe play a noise using react native sound to let user know that recording has started?
      await Voice.start('es_US', {
         "RECOGNIZER_ENGINE": "GOOGLE",
         "EXTRA_PARTIAL_RESULTS": true
      })
    } catch (e) {
      console.error(e);
    }
  };

  stop = async () => {
    this.setState({started: ''})
    try {
      await Voice.stop();
    } catch (e) {
      console.error(e);
    }
  };

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
            title: "ICE",
            msg: this.state.msg,
            screen: "CircleManager", //to direct the user to when they click on it 
            time: firebase.database.ServerValue.TIMESTAMP
        }
        firebase.database().ref(`notifications/${member_id}`).push(notification)
        }
       }
    }
  }

  onNotif(notif) {
    console.log(notif);
  }

  onRegister(token) {
    console.log(token);
    //this.setState({ registerToken: token.token, gcmRegistered: true });
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
        }
       }
    }
  }

// trigger medical profile notification
  showMedical() {
      this.notif = setupPushNotification(this.onRegister.bind(this), this.onNotif.bind(this));
      firebase.database().ref(`medical/${this.state.userId}`)
      .on('value', snapshot => {

      const { additional, age, allergies, blood_type, conditions, doctor_name, kin, medication, sex } = snapshot.val();

      if(Platform.OS === 'ios'){   
        let ios_options = {
        date: new Date(Date.now() + (30000)), // in 30 secs
        repeatType: 'minute',
        ticker: "My Notification Ticker",
        id: '0',
        message: `MEDICAL PROFILE\n_______________\nAge: ${age}\n--------------\nSex: ${sex}\n--------------\nDoctor: ${doctor_name}\n--------------\nKin: ${kin}\n--------------\nBlood type: ${blood_type}\n--------------\nConditions: ${conditions}\n--------------\nAllergies: ${allergies}\n--------------\nMedication: ${medication}\n--------------\nAdditional: ${additional}`,
        color: "blue",
        alertAction: 'view',
        visibility: "public",
        bigText: `MEDICAL PROFILE\n_______________\nAge: ${age}\n--------------\nSex: ${sex}\n--------------\nDoctor: ${doctor_name}\n--------------\nKin: ${kin}\n--------------\nBlood type: ${blood_type}\n--------------\nConditions: ${conditions}\n--------------\nAllergies: ${allergies}\n--------------\nMedication: ${medication}\n--------------\nAdditional: ${additional}`,
        title: "ICE",
        playSound: false,
        foreground: false,
        userInfo: {label : "medical"}
      };

        this.notif.scheduleLocalNotification(ios_options)
        console.log('scheduled')
      }else{
      //utilize android's notification functionality of an ongoing notification
      let android_options = {
        id: '0',
        repeatType: 'minute',
        autoCancel: false,
        bigText: `MEDICAL PROFILE\n_______________\nAge: ${age}\n--------------\nSex: ${sex}\n--------------\nDoctor: ${doctor_name}\n--------------\nKin: ${kin}\n--------------\nBlood type: ${blood_type}\n--------------\nConditions: ${conditions}\n--------------\nAllergies: ${allergies}\n--------------\nMedication: ${medication}\n--------------\nAdditional: ${additional}`,
        ongoing: true,
        priority: "high",
        visibility: "public",
        importance: "high",
        title: "ICE",
        message: `MEDICAL PROFILE\n_______________\nAge: ${age}\n--------------\nSex: ${sex}\n--------------\nDoctor: ${doctor_name}\n--------------\nKin: ${kin}\n--------------\nBlood type: ${blood_type}\n--------------\nConditions: ${conditions}\n--------------\nAllergies: ${allergies}\n--------------\nMedication: ${medication}\n--------------\nAdditional: ${additional}`,
        playSound: false,
        vibrate: false,
        data: JSON.stringify({label : "medical"})
      }
      this.notif.localNotification(android_options);
   }
  })
 }

async componentDidMount() {
   var userId = firebase.auth().currentUser.uid;
   //this.setState({userId})
   console.log("userId",userId)
   
   //this.showMedical()

   //const user_name = await firebase.database().ref(`users/${this.state.userId}/first_name`).once('value');
   //this.setState({user_name:user_name.val()})
    // Uncommenting this for now - dont want too many query to databases!!
    // gets the user current location ( also runs in background mode )
    BackgroundGeolocation.on('location', async (location) => {
      // handle your locations here
      // to perform long running operation on iOS
      // you need to create background tas

      BackgroundGeolocation.startTask(async (taskKey) => {
        //check to see if they're in a safezone
        this.getSafeZones()
        console.log('current location 2:', location)
        // check the mode for follow me !
        const latitude = location.latitude;
        const longitude = location.longitude;
        userid = firebase.auth().currentUser.uid

        firebase.database().ref(`users/${userid}/`).update({
            latitude: location.latitude,
            longitude: location.longitude,
            //last_checked: location.time,
            //speed: location.speed,
            // routeCoordinates: routeCoordinates,
            // distanceTravelled: distanceTravelled,
            // prevLatLng: this.state.prevLatLng,
        })

        let resp = await fetch(`https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=AIzaSyD3_KMwMzLhzJPYH7ZjGBpYbBCZiphwzFc`)
        let respJson = await resp.json();
        //console.log("respJson",respJson.results[0].formatted_address)
        var address = respJson.results[0].formatted_address
        firebase.database().ref(`users/${userid}/`).update({
          current_address: address,
        })

        
        //TODO: also do this if in SOS mode
        const session_check = await firebase.database().ref(`users/${userid}/follow_me_session`).once('value');
        console.log("session_check",session_check)
        if(session_check.val() !== ""){
          var session_id = session_check.val()

            // recieve the routeCoordinates & prevLatLng so far (as this is done in background there wont be any states?)
            const prevLatLng_data = await firebase.database().ref(`followMe/${userid}/active_sessions/${session_id}/prevLatLng`).once('value');
            const routeCoordinates_data = await firebase.database().ref(`followMe/${userid}/active_sessions/${session_id}/routeCoordinates`).once('value');
            const distance_data = await firebase.database().ref(`followMe/${userid}/active_sessions/${session_id}/distance_travelled`).once('value');
            console.log("routeCoordinates_data",routeCoordinates_data)
            
            var routeCoordinates = routeCoordinates_data.val()

            prevLatLng = prevLatLng_data.val()

            console.log("prevLatLng",prevLatLng,prevLatLng.latitude)

            const newCoordinate = {
            latitude,
            longitude
          }

            if(newCoordinate.latitude !== prevLatLng.latitude && newCoordinate.longitude !== prevLatLng.longitude && prevLatLng != {}){
            // update database with actual route taken
                const new_distance = haversine(prevLatLng, newCoordinate) || 0
                const updated_distance = parseInt(distance_data.val()) + new_distance
        
            //if user goes off screen... get their route in background...
            firebase.database().ref(`followMe/${userid}/active_sessions/${session_id}`).update({
              routeCoordinates: routeCoordinates.concat([newCoordinate]),
              prevLatLng: newCoordinate,
              distance_travelled: updated_distance,
            })
          }
       }
        // execute long running task
        // eg. ajax post location
        // IMPORTANT: task has to be ended by endTask
        BackgroundGeolocation.endTask(taskKey);
      });
    });

    BackgroundGeolocation.on('error', (error) => {
      console.log('[ERROR] BackgroundGeolocation error:', error);
    });

    BackgroundGeolocation.on('start', () => {
      console.log('[INFO] BackgroundGeolocation service has been started');
    });

    BackgroundGeolocation.on('stop', () => {
      console.log('[INFO] BackgroundGeolocation service has been stopped');
    });

    BackgroundGeolocation.on('background', () => {
      console.log('[INFO] App is in background');
      // //trigger medical notification
      this.showMedical();
    });

    BackgroundGeolocation.on('foreground', () => {
      console.log('[INFO] App is in foreground');
      //PushNotification.cancelLocalNotifications({ id: '0'})
    });

    BackgroundGeolocation.on('abort_requested', () => {
      console.log('[INFO] Server responded with 285 Updates Not Required');
    });

    BackgroundGeolocation.on('http_authorization', () => {
      console.log('[INFO] App needs to authorize the http requests');
    });

    BackgroundGeolocation.checkStatus(status => {
      console.log('[INFO] BackgroundGeolocation service is running', status.isRunning);
      console.log('[INFO] BackgroundGeolocation services enabled', status.locationServicesEnabled);
      console.log('[INFO] BackgroundGeolocation auth status: ' + status.authorization);
      if(!status.isRunning){
        BackgroundGeolocation.start();
      }
    });

    BackgroundGeolocation.start();
  }

  getSafeZones(){
    // convert SZ to a polygon
    // check this against the user's current location.
    // maybe show on map in different colours/titles with who they owned by or keep invisible??
    // determining if a user is in a safe zone & set that as their status
    // add the checkIn time too 
    // when changed move it to past locations for the activity log basis
    firebase.auth().onAuthStateChanged(async user => {
      if (user) {
        // get from firebase
        // first check the current user location against their current safe zone to make sure theyre still in it.
        //else retrieve all their safezones & check

        const currentSafeZoneLat = await firebase.database().ref(`users/${user.uid}/currentSafeZoneLat`).once('value');
        const currentSafeZoneLng = await firebase.database().ref(`users/${user.uid}/currentSafeZoneLat`).once('value');
        const currentSafeZoneRadius = await firebase.database().ref(`users/${user.uid}/currentSafeZoneRadius`).once('value');
        const currentLat = await firebase.database().ref(`users/${user.uid}/latitude`).once('value');
        const currentLng = await firebase.database().ref(`users/${user.uid}/longitude`).once('value');
        
        if(currentSafeZoneRadius.val() > 0){
          let CurrentSZPolygon = circleToPolygon([parseFloat(currentSafeZoneLng.val()),parseFloat(currentSafeZoneLat.val())],parseInt(currentSafeZoneRadius.val()))
          const currentPtInCurrentSZ = classifyPoint(CurrentSZPolygon,[parseFloat(currentLng.val()), parseFloat(currentLat.val())])
          // 1 means outside 
          if(currentPtInCurrentSZ === 1){
              // reset safezone variables

              firebase.database().ref(`users/${user.uid}`).update({
                currentSafeZone: "",
                SafeZoneCheckIn: Date.now(),
                currentSafeZoneLat: 0,
                currentSafeZoneLng: 0,
                currentSafeZoneRadius: 0,
              })

          }

         }else{
              
              // check if in another safe zone or has gone back into the one before...

              // firebase.database().ref(`safeZones/${user.uid}`).on('value', async (dataSnapshot) => {
              //   if(dataSnapshot.val()){
              firebase.database().ref(`safeZones/${user.uid}`).on('value', async (dataSnapshot) => {
                  if(dataSnapshot.val()){
                  var values = dataSnapshot.val();
                  var keys = Object.keys(values);
                  var vals = Object.values(values);
                  for(var i = 0; i < vals.length; i++ ) {
                    // add the id to the vals list -- so it can be deleted at later stage
                    vals[i]["id"] = keys[i]
                    const coordinates = [parseFloat(vals[i]["longitude"]), parseFloat(vals[i]["latitude"])];
                    const radius = vals[i]["radius"];
                    const name = vals[i]["name"]
                    //converting to polygon
                    let polygon = circleToPolygon(coordinates,radius)
                    vals[i]["polygon"] = polygon
                    // seeing if user location 2D point is within that polygon
                    const pointInPolygon = classifyPoint(polygon.coordinates[0],[parseFloat(currentLng), parseFloat(currentLat)])
                    // 0 means on the edge 
                    // -1 means inside
                    const currentSafeZone = await firebase.database().ref(`users/${user.uid}/currentSafeZone`).once('value');
                    if(pointInPolygon === 0 || pointInPolygon === -1){
                      // user is within safe zone - update within the database
                      // check to see if within 
                      if(currentSafeZone !== name){
                        // user is already in that safezone otherwise
                        firebase.database().ref(`user/${user.uid}`).update({
                            currentSafeZone: name,
                            SafeZoneCheckIn: Date.now(),
                            currentSafeZoneLat:parseFloat(coordinates[1]),
                            currentSafeZoneLng:parseFloat(coordinates[0]),
                            currentSafeZoneRadius: radius,
                        })
                        // send notification
                        this.setState({msg: `${this.state.user_name} has arrived at their Safe Zone ${name}`})
                        this.getCircles()
                        this.getOtherCircles()
                      }
                      // dont update if already in that safe zone - keep the status the same. ( dont want to affect the original time )
                      
                    }
                    
              }
              }
          })
      }
     }
    })
  }


  async UNSAFE_componentWillMount(){
  check(PERMISSIONS.IOS.LOCATION_ALWAYS)
  .then((result) => {
    switch (result) {
      case RESULTS.UNAVAILABLE:
        request(PERMISSIONS.IOS.LOCATION_ALWAYS).then((result) => {
          console.log("result",result)
         });    
        console.log(
          'This feature is not available (on this device / in this context)',
        );
        break;
      case RESULTS.DENIED:
        // request again
        request(PERMISSIONS.IOS.LOCATION_ALWAYS).then((result) => {
          console.log("result",result)
         });
        console.log(
          'The permission has not been requested / is denied but requestable',
        );
        break;
      case RESULTS.GRANTED:
        console.log('The permission is granted');
        break;
      case RESULTS.BLOCKED:  
        console.log('The permission is denied and not requestable anymore');
        break;
        }
    })
    .catch((error) => {
      // …
    });

      // check(PERMISSIONS.IOS.LOCATION_ALWAYS)
      // .then((result) => {
      //   switch (result) {
      //     case RESULTS.UNAVAILABLE:
      //       console.log(
      //         'This feature is not available (on this device / in this context)',
      //       );
      //       break;
      //     case RESULTS.DENIED:
      //       console.log(
      //         'The permission has not been requested / is denied but requestable',
      //       );
      //       break;
      //     case RESULTS.GRANTED:
      //       console.log('The permission is granted');
      //       break;
      //     case RESULTS.BLOCKED:
      //       console.log('The permission is denied and not requestable anymore');
      //       break;
      //   }
      // })
      // .catch((error) => {
      //   // …
      // });

   //get user id
   //because this is within App.js - first need to check if user is member
   let user = await firebase.auth().currentUser;
    if (user) {
    const check_mode = await firebase.database().ref(`users/${user.uid}/mode`).once('value');
    if(check_mode.val() !== ("SOS" || "SafeWordCreate")){
        this.start()
      }
    }
  //  BackgroundTimer.runBackgroundTimer(async() => { 
  //   //get user id
  //   //because this is within App.js - first need to check if user is member
  //   let user = await firebase.auth().currentUser;
  //   if (user) {
  //   //check if USER in SOS mode first!
  //     firebase.database().ref(`users/${user.uid}/mode`)
  //     .once('value')
  //     .then(snapshot => {
  //       if (snapshot.exists()) {
  //         console.log("mode:", snapshot)
  //         if(snapshot === "SOS"){
  //           // dont want to use speech recognization - we want to record the user instead.
  //           this.stop()
  //         }else{
            
  //           firebase.database().ref(`users/${user.uid}/safe_word`)
  //           .once('value')
  //           .then(snapshot => {
  //           if (snapshot.exists()) {
  //             console.log("safe_word", snapshot)
  //             console.log(this.state.partialResults)
  //             this.state.partialResults.map((result, index) => {
  //               if(result === snapshot){
  //                 console.log("SOS triggered!")
  //                 // TO DO - replace this with the SOS mode activitation.
  //                 this.props.navigation.navigate('SOSmode')
  //                 // stop listening until SOS mode is disabled.
  //                 this.stop()
  //               }else{
  //                 // retrigger the process!
  //                 this.stop()
  //                 // this.start()
  //               }
  //               });
  //               }else{
  //                 // dont listen!
  //                 console.log("no safe word")
  //               }
  //     });
  //         }
  //       }
  //     });
  //       let batteryLevel = await DeviceInfo.getBatteryLevel();
  //       batteryLevel = batteryLevel*100
  //       console.log("batteryLevel",batteryLevel)
  //       firebase.database().ref(`users/${user.uid}`).update({
  //         battery_level : batteryLevel
  //       })
  //       if (batteryLevel <= 20){
  //         // means that the battery is classed as low.
  //         // set isBatteryLow to true
  //         // because we can't use remote notifications - TODO add a listener for this db ref later on
  //         // BUT don't resend the notification if battery stays low...
  //         firebase.database().ref(`users/${user.uid}`).update({
  //           isBatteryLow : true
  //         })
  //          // send notification
  //          this.setState({msg: `${this.state.user_name} has low battery.`})
  //          this.getCircles()
  //          this.getOtherCircles()
  //       }else{
  //         //unset -- considering if the device is been charged, etc.
  //         firebase.database().ref(`users/${user.uid}`).update({
  //           isBatteryLow : false
  //         })
  //       }
          
  //   }
  //   // dont run task - as not a user
  //     }, 
  //     50000);
  }

  render() {
      const prefix = 'ICE://';
      return (
        <StackNav uriPrefix={prefix}/>
      )
    }
}