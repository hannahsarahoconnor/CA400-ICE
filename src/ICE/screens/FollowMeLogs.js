
import React, { Component } from 'react';
import {  View, StyleSheet, Alert, TouchableWithoutFeedback, Dimensions, ScrollView} from 'react-native';
import {Card,ListItem, Button, Icon,Image,Text, Divider} from 'react-native-elements';
import firebase from '@react-native-firebase/app';
import '@react-native-firebase/auth';
import '@react-native-firebase/database';
import Geocoder from 'react-native-geocoding';
import Animation from 'lottie-react-native';
import storage from '@react-native-firebase/storage';
import MapView, { PROVIDER_GOOGLE, Marker, Callout, Polygon, Circle, AnimatedRegion} from 'react-native-maps';
import anim from '../animations/14451-loading.json';
import { withNavigation } from 'react-navigation';
import moment from 'moment';
import MCIcon from 'react-native-vector-icons/MaterialCommunityIcons';

//TODO: put this into its own file & import instead
const mapstyle = [
    {
      "elementType": "geometry",
      "stylers": [
        {
          "color": "#1d2c4d"
        }
      ]
    },
    {
      "elementType": "labels.text.fill",
      "stylers": [
        {
          "color": "#8ec3b9"
        }
      ]
    },
    {
      "elementType": "labels.text.stroke",
      "stylers": [
        {
          "color": "#1a3646"
        }
      ]
    },
    {
      "featureType": "administrative.country",
      "elementType": "geometry.stroke",
      "stylers": [
        {
          "color": "#4b6878"
        }
      ]
    },
    {
      "featureType": "administrative.land_parcel",
      "elementType": "labels.text.fill",
      "stylers": [
        {
          "color": "#64779e"
        }
      ]
    },
    {
      "featureType": "administrative.province",
      "elementType": "geometry.stroke",
      "stylers": [
        {
          "color": "#4b6878"
        }
      ]
    },
    {
      "featureType": "landscape.man_made",
      "elementType": "geometry.stroke",
      "stylers": [
        {
          "color": "#334e87"
        }
      ]
    },
    {
      "featureType": "landscape.natural",
      "elementType": "geometry",
      "stylers": [
        {
          "color": "#023e58"
        }
      ]
    },
    {
      "featureType": "poi",
      "elementType": "geometry",
      "stylers": [
        {
          "color": "#283d6a"
        }
      ]
    },
    {
      "featureType": "poi",
      "elementType": "labels.text.fill",
      "stylers": [
        {
          "color": "#6f9ba5"
        }
      ]
    },
    {
      "featureType": "poi",
      "elementType": "labels.text.stroke",
      "stylers": [
        {
          "color": "#1d2c4d"
        }
      ]
    },
    {
      "featureType": "poi.park",
      "elementType": "geometry.fill",
      "stylers": [
        {
          "color": "#023e58"
        }
      ]
    },
    {
      "featureType": "poi.park",
      "elementType": "labels.text.fill",
      "stylers": [
        {
          "color": "#3C7680"
        }
      ]
    },
    {
      "featureType": "road",
      "elementType": "geometry",
      "stylers": [
        {
          "color": "#304a7d"
        }
      ]
    },
    {
      "featureType": "road",
      "elementType": "labels.text.fill",
      "stylers": [
        {
          "color": "#98a5be"
        }
      ]
    },
    {
      "featureType": "road",
      "elementType": "labels.text.stroke",
      "stylers": [
        {
          "color": "#1d2c4d"
        }
      ]
    },
    {
      "featureType": "road.highway",
      "elementType": "geometry",
      "stylers": [
        {
          "color": "#2c6675"
        }
      ]
    },
    {
      "featureType": "road.highway",
      "elementType": "geometry.stroke",
      "stylers": [
        {
          "color": "#255763"
        }
      ]
    },
    {
      "featureType": "road.highway",
      "elementType": "labels.text.fill",
      "stylers": [
        {
          "color": "#b0d5ce"
        }
      ]
    },
    {
      "featureType": "road.highway",
      "elementType": "labels.text.stroke",
      "stylers": [
        {
          "color": "#023e58"
        }
      ]
    },
    {
      "featureType": "transit",
      "elementType": "labels.text.fill",
      "stylers": [
        {
          "color": "#98a5be"
        }
      ]
    },
    {
      "featureType": "transit",
      "elementType": "labels.text.stroke",
      "stylers": [
        {
          "color": "#1d2c4d"
        }
      ]
    },
    {
      "featureType": "transit.line",
      "elementType": "geometry.fill",
      "stylers": [
        {
          "color": "#283d6a"
        }
      ]
    },
    {
      "featureType": "transit.station",
      "elementType": "geometry",
      "stylers": [
        {
          "color": "#3a4762"
        }
      ]
    },
    {
      "featureType": "water",
      "elementType": "geometry",
      "stylers": [
        {
          "color": "#0e1626"
        }
      ]
    },
    {
      "featureType": "water",
      "elementType": "labels.text.fill",
      "stylers": [
        {
          "color": "#4e6d70"
        }
      ]
    }
  ]
// The goal with this is to display a card view of follow me data & show a 
class FollowMeLogs extends Component {
    constructor(props){
        super(props);
        this.state = { 
            userId: "O28vQIssPWbkjpXLu7qKKxfV7B33",//this.props.navigation.getParam('user_id'),
            sos:[],
            show_animation: true,
          
        }
    }


    async getFollowMekeys(){
        const keys = await firebase.database().ref(`followMe/${this.state.userId}/active_sessions`).once('value')
        const data = [];
        for(var i = 0; i < Object.keys(keys.val()).length; i++ ) {
            var key = Object.keys(keys.val())[i]
            console.log("key",key)
            const id = await firebase.database().ref(`followMe/${this.state.userId}/active_sessions/${key}/id`).once('value')
            // routeCoordinates is the actual route taken by the user
            const user_route = await firebase.database().ref(`followMe/${this.state.userId}/active_sessions/${key}/routeCoordinates`).once('value')
            //time started -> timestamp
            const time_ended = await firebase.database().ref(`followMe/${this.state.userId}/active_sessions/${key}/time_finished`).once('value')
            const started_lat = await firebase.database().ref(`followMe/${this.state.userId}/active_sessions/${key}/starting_lat`).once('value')
            const started_lng = await firebase.database().ref(`followMe/${this.state.userId}/active_sessions/${key}/starting_lng`).once('value')
            //const finished_lat = await firebase.database().ref(`followMe/${this.state.userId}/active_sessions/${key}/timestamp`).once('value')
           // const finished_lng = await firebase.database().ref(`followMe/${this.state.userId}/active_sessions/${key}/timestamp`).once('value')
            const time_started = await firebase.database().ref(`followMe/${this.state.userId}/active_sessions/${key}/timestamp`).once('value')
            const dest_lat = await firebase.database().ref(`followMe/${this.state.userId}/active_sessions/${key}/destination_lat`).once('value')
            const dest_lng = await firebase.database().ref(`followMe/${this.state.userId}/active_sessions/${key}/destination_lng`).once('value')
            //TODO: make this into its own func
            let resp = await fetch(`https://maps.googleapis.com/maps/api/geocode/json?latlng=${parseFloat(dest_lat.val())},${parseFloat(dest_lng.val())}&key=AIzaSyD3_KMwMzLhzJPYH7ZjGBpYbBCZiphwzFc`)
            let respJson = await resp.json();
            //console.log("respJson",respJson.results[0].formatted_address)
            var address = respJson.results[0].formatted_address
            let resp2 = await fetch(`https://maps.googleapis.com/maps/api/geocode/json?latlng=${parseFloat(started_lat.val())},${parseFloat(started_lng.val())}&key=AIzaSyD3_KMwMzLhzJPYH7ZjGBpYbBCZiphwzFc`)
            let respJson2 = await resp2.json();
            var start_address = respJson2.results[0].formatted_address
            const distance_travelled = await firebase.database().ref(`followMe/${this.state.userId}/active_sessions/${key}/distance_travelled`).once('value')
            const mode = await firebase.database().ref(`followMe/${this.state.userId}/active_sessions/${key}/mode`).once('value')
            const checked = await firebase.database().ref(`followMe/${this.state.userId}/active_sessions/${key}/checked_in`).once('value')
            data.push({key: key, user_route: user_route.val(), time_started: time_started.val(), start_lng: started_lng.val(), start_lat: started_lat.val(), dest_lat: dest_lat.val(),dest_lng:dest_lng.val(), dest_address: address,
            start_address: start_address, mode: mode.val(), distance_travelled: distance_travelled.val(), checked: checked.val(), end_time:time_ended.val()})
        }
        this.setState({sos:data})

    }

    componentDidMount(){
        this.getFollowMekeys()
        this.animation.play();
        setTimeout(() => {
          this.setState({show_animation:false})
        }, 20*1000);
    }

    render() {
        return (
      this.state.show_animation ?
      <View style={styles.animationContainer}>
      <Animation
            ref={animation => {
              this.animation = animation;
            }}
            style={{
              width: 500,
              height: 500,
              marginBottom:70
            }}
            loop={true}
            source={anim}
          />
          </View>
        : <ScrollView style={styles.mainContainer}>
           {this.state.sos.map((sessions) => {
            return (
                <View style={styles.itemContainer}>
                <Text style={{fontSize:20, fontFamily:"Roboto", textAlign:"center"}}>
                Session to: "{sessions.dest_address}"
                </Text>
                <MapView
                    customMapStyle={mapstyle}
                    key={sessions.id}
                    style={{width:"100%",height:Dimensions.get('window').height/4}}
                    provider={PROVIDER_GOOGLE}
                    region={
                        {
                            latitude: sessions.start_lat,
                            longitude: sessions.start_lng,
                            latitudeDelta: 0.0050,
                            longitudeDelta: 0.0050
                        }
                    }
                    >
                    <Marker.Animated
                    title="Starting"
                    coordinate={{latitude: sessions.start_lat, 
                    longitude: sessions.start_lng}}>
                    </Marker.Animated>
                    <Marker.Animated
                    title="Destination"
                    coordinate={{latitude: sessions.dest_lat, 
                    longitude: sessions.dest_lng}}>
                    </Marker.Animated>
                  <MapView.Polyline 
                    coordinates={sessions.user_route}//this.state.coords}
                    strokeWidth={4}
                    tappable={true}
                    strokeColor="red"/>
                </MapView>
                <View>
                <View style={{flexDirection:"row"}}>
                <MCIcon name="map-marker-outline" size={25} color={"gray"}/>
                <Text style={{fontFamily:"Roboto"}}>
                   { sessions.start_address }
                </Text>
                </View>
                <View style={{flexDirection:"row"}}>
                <MCIcon name="map-clock-outline" size={25} color={"gray"}/>
                <Text style={{fontFamily:"Roboto"}}> 
                   {new Date(sessions.time_started).toLocaleTimeString() + " - " + new Date(sessions.end_time).toLocaleTimeString()}
                </Text>
                </View>
                <View style={{flexDirection:"row"}}>
                <MCIcon name="map-marker-distance" size={25} color={"gray"}/>
                <Text style={{fontFamily:"Roboto"}}> 
                   {sessions.distance_travelled + "m"}
                </Text>
                </View>
                <View style={{flexDirection:"row"}}>
                <MCIcon name="map-marker-check" size={25} color={"gray"}/>
                <Text style={{fontFamily:"Roboto"}}> 
                   {sessions.checked ? "Checked In: Yes" : "Checked In: No"}
                </Text>
                </View>
                <View style={{flexDirection:"row"}}>
                <Icon size={25} color={"gray"} name={sessions.mode === "walking" ? "directions-walk" : ( sessions.mode === "driving" ? "directions-car" : " directions-transit") } size={25}/>
                <Text style={{fontFamily:"Roboto"}}>
                  {"Mode: " + sessions.mode}
                </Text>
                </View>
                <View style={{alignSelf:"flex-end"}}>
                <Text style={{alignContent:"flex-end", fontFamily:"Roboto", color:"gray"}}>
                  {moment(new Date(sessions.end_time), "HH:MM").fromNow()}
                </Text>
                </View>
                <Divider style={{ backgroundColor: '#0EA8BE', marginBottom:10, marginTop: 10 }} />
             </View>
             </View>
            )}
           )
          }
           </ScrollView>
        
        )
    
    }
}

export default withNavigation(FollowMeLogs);

const styles = StyleSheet.create({
    mainContainer: {
       flex: 1,
    },
    contentContainer: {
        flex: 6,
     },
     itemContainer:{
        flex: 1
     },
     animationContainer:{
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
     }
    });
