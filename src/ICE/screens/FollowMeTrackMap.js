import firebase from '@react-native-firebase/app';
import '@react-native-firebase/auth';
import '@react-native-firebase/database';
import PushNotification from 'react-native-push-notification';
import SOS from '../UIcomponents/SOSbutton'

export function setupPushNotification(onRegister, onNotification, popInitialNotification) {
    PushNotification.configure({
      onRegister: onRegister, 
      onNotification: onNotification, 
  
      permissions: {
        alert: true,
        badge: true,
        sound: true
      },
  
      popInitialNotification: popInitialNotification,
  
      requestPermissions: true,
    })
    return PushNotification
  }

import React from "react";
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Platform,
  Image,
  PermissionsAndroid
} from "react-native";
import MapView, {
  Marker,
  AnimatedRegion,
  Polyline,
  PROVIDER_GOOGLE
} from "react-native-maps";

import { Header } from 'react-native-elements';
import Icon from 'react-native-vector-icons/MaterialIcons';

import BackgroundGeolocation from '@mauron85/react-native-background-geolocation';

//TODO: MOVE TO APP.JS
BackgroundGeolocation.configure({
    desiredAccuracy: BackgroundGeolocation.HIGH_ACCURACY,
    stationaryRadius: 50,
    distanceFilter: 50,
    notificationTitle: 'Background tracking',
    notificationText: 'enabled',
    debug: false, //displays toast msg dont show for now
    startOnBoot: false,
    stopOnTerminate: true,
    locationProvider: BackgroundGeolocation.ACTIVITY_PROVIDER,
    interval: 1000,
    fastestInterval: 1000,
    activitiesInterval: 10000,
    stopOnStillActivity: false,
  });


export default class FollowMeTrackMap extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      user_name: this.props.navigation.getParam('user_name'),
      other_id: this.props.navigation.getParam('user_id'),
      session_id: this.props.navigation.getParam('session_id'),
      circle: this.props.navigation.getParam('circle'),
      pic_url: "https://firebasestorage.googleapis.com/v0/b/iceapp-47499.appspot.com/o/profile_pictures%2FQuO6SxPNCZbgGiyi4yGTrMktmV53?alt=media&token=6c4e23c6-fcd7-4975-9088-c37ec1d95842",//this.props.navigation.getParam('profile_pic_url'),
      //taskKey: "-M4Vp5XT7EKemzLLxaUy",
      user_id: firebase.auth().currentUser.uid,
      latitude: this.props.navigation.getParam('latitude'),
      coords:[],
      watcher_key: '',
      destination: {latitude: 0,longitude: 0,},
      longitude:  this.props.navigation.getParam('longitude'),
      other_user_id: this.props.navigation.getParam('other_user_id'),
      other_user_name: this.props.navigation.getParam('other_user_name'),
      routeCoordinates: [],
      distanceTravelled: 0,
      prevLatLng: {},
      coordinate: new AnimatedRegion({
        latitude: this.props.navigation.getParam('latitude'),
        longitude: this.props.navigation.getParam('longitude'),
        latitudeDelta: 0,
        longitudeDelta: 0
      })
    };
    this.notif = setupPushNotification(this.onRegister.bind(this), this.onNotif.bind(this), true);
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
          firebase.database().ref(`medical/${this.state.user_id}`)
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
          
           this.notif.scheduleLocalNotification(ios_options)

          })
      }else{
         navigate(notification.data.screen,{user_id:notification.data.sender_id})
        }
    }
  }


   notificationListener(){
            // notification checker
            firebase.database().ref(`notifications/${this.state.user_id}`)
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
              this.notif.localNotification(options);
    
              firebase.database().ref(`notifications/${this.state.user_id}/${id}`).remove()
      })
   }

   componentDidMount(){
         // Show that users current location via marker

    
    firebase.database().ref(`users/${this.state.other_user_id}`).on('value', (dataSnapshot) => {
      if(dataSnapshot.val()){
          const data = dataSnapshot.val();
          console.log("data",data["latitude"])
          const { distanceTravelled, prevLatLng, coordinate  } = this.state;
          const latitude = parseFloat(data["latitude"]);
          const longitude = parseFloat(data["longitude"])
          
          // const {latitude, longitude} = dataSnapshot.val()
          
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
       });
   }

  async componentWillMount() {
    this.notificationListener()
    // get current user id & push it to the active watchers
    const first_name = await firebase.database().ref(`users/${this.state.user_id}/first_name`).once('value');
    const last_name = await firebase.database().ref(`users/${this.state.user_id}/last_name`).once('value');
    const profile_pic_url = await firebase.database().ref(`users/${this.state.user_id}/profile_pic_url`).once('value');

    const destination_lat = await firebase.database().ref(`followMe/${this.state.other_id}/active_sessions/${this.state.session_id}/destination_lat`).once('value');
    const destination_lng = await firebase.database().ref(`followMe/${this.state.other_id}/active_sessions/${this.state.session_id}/destination_lng`).once('value');

    const destination = {
      destination_lat,
      destination_lng
    }
    this.setState({destination})
    const watcher_key = firebase.database().ref(`followMe/${this.state.other_id}/active_sessions/${this.state.session_id}/watchers`).push().key;
    this.setState({watcher_key})
    console.log("this.state.circle",this.state.circle)
    firebase.database().ref(`followMe/${this.state.other_id}/active_sessions/${this.state.session_id}/watchers/${watcher_key}`).update({
        id: this.state.user_id,
        name: first_name.val() + " " + last_name.val(),
        profile_pic_url: profile_pic_url.val(),
        circle: this.state.circle, // this could always be more than 1
    })
    // show the route
    const coords = await firebase.database().ref(`followMe/${this.state.other_id}/active_sessions/${this.state.session_id}/coords`).once('value');
    this.setState({coords:coords.val()})
    // show the destination

    // show the users actual movements
    firebase.database().ref(`followMe/${this.state.other_id}/active_sessions/${this.state.session_id}`).on('value', (dataSnapshot) => {
        if(dataSnapshot.val()){
            const data = dataSnapshot.val();
            // JSON.parse(JSON.stringify(data["routeCoordinates"])).map((point) => {
            // })
            // let coords = JSON.parse(JSON.stringify(data["routeCoordinates"])).map((point, index) => {
            //     return  {
            //         latitude : parseFloat(point.latitude),
            //         longitude : parseFloat(point.longitude)
            //     }
            // })
            this.setState({routeCoordinates: data["routeCoordinates"]})
          }
      })
    }

  componentWillUnmount(){
    // user is no longer watching so remove...
    firebase.database().ref(`followMe/${this.state.other_id}/active_sessions/${this.state.session_id}/watchers/${this.state.watcher_key}`).remove();
  }
  
  render() {
    console.log(this.state.user_id,this.state.user_name)
    return (
      <View style={styles.mainContainer}>
        <SOS/>    
      <Header
       backgroundColor="#0EA8BE"
      leftComponent={ <Icon name="keyboard-backspace" color='#fff' size={23} onPress={() => {
        this.props.navigation.goBack()
        firebase.database().ref(`followMe/${this.state.other_id}/active_sessions/${this.state.session_id}/watchers/${this.state.watcher_key}`).remove();
      }} size={23} style={{ marginLeft:20}}/>}
      centerComponent={<Text style={{color:'white', fontFamily:'Roboto', fontSize:20}}>Tracking {this.state.user_name}</Text>}
      rightComponent={<Icon name="more-vert" color='#fff' size={23} style={{padding:5}}/>}
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
          <MapView.Polyline 
            coordinates={this.state.coords}//this.state.coords}
            strokeWidth={4}
            tappable={true}
            strokeColor="black"/>
          <MapView.Polyline 
            coordinates={this.state.routeCoordinates}
            strokeWidth={4}
            tappable={true}
            strokeColor="green"/>
          <Marker.Animated
            ref={marker => {
              this.marker = marker;
            }}
            coordinate={this.state.coordinate}
          >
          <View style={{ 
          borderWidth: 5, 
          borderColor: 'orange',
          backgroundColor: 'white',
          height: 50, 
          borderRadius: 30,
          width: 50 }}>
          <Image
            style={{width:"100%", height:"100%",borderRadius:30}}
            source={{uri:this.state.pic_url}}/>
          </View>
          </Marker.Animated>
        </MapView>
      </View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "flex-end",
    alignItems: "center"
  },
  mainContainer: {
    flex: 1,
    backgroundColor: '#FFF',
    height: 34
 },
  map: {
    ...StyleSheet.absoluteFillObject
  },
  bubble: {
    flex: 1,
    backgroundColor: "rgba(255,255,255,0.7)",
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 20
  },
  latlng: {
    width: 200,
    alignItems: "stretch"
  },
  button: {
    width: 80,
    paddingHorizontal: 12,
    alignItems: "center",
    marginHorizontal: 10
  },
  buttonContainer: {
    flexDirection: "row",
    marginVertical: 20,
    backgroundColor: "transparent"
  },
  contentContainer: {
    flex: 6,
  },
});