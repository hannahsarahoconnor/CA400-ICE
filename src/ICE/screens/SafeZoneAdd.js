import React, { Component } from 'react';
import { Alert, StyleSheet, Text, View, TouchableOpacity, Dimensions } from 'react-native';
import { ButtonGroup, Button, Header, Slider, Overlay } from 'react-native-elements';
import Icon from 'react-native-vector-icons/MaterialIcons';
//import RNGooglePlaces from 'react-native-google-places';
import { GooglePlacesAutocomplete } from 'react-native-google-places-autocomplete';
import Geolocation from '@react-native-community/geolocation';
import MapView, { PROVIDER_GOOGLE,Animated, Marker, Callout, Polygon, Circle, AnimatedRegion } from 'react-native-maps';
import NumericInput from 'react-native-numeric-input'
import { Hoshi, Kaede } from 'react-native-textinput-effects';
import firebase from '@react-native-firebase/app';
import '@react-native-firebase/auth';
import '@react-native-firebase/database';
import { add } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import t from 'tcomb-form-native';
import PushNotification from 'react-native-push-notification';

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

const Form = t.form.Form;
var _ = require('lodash');
const stylesheet= _.cloneDeep(t.form.Form.stylesheet);

const information = t.struct({
  Name: t.String,
  //terms: t.Boolean
});

// form styling
// stylesheetMessage.textbox.normal.height = 100
stylesheet.formGroup.normal.marginTop = 20
stylesheet.formGroup.normal.fontFamily = "Roboto"
stylesheet.formGroup.error.fontFamily = "Roboto"

const options = {
  stylesheet: stylesheet,
  fields: {
    Name: {
      editable: true,
      error: ' * Please enter a name',
      stylesheet: stylesheet,
    },
  },
};
// navigator.geolocation = require('@react-native-community/geolocation');
//import MapViewDirections from 'react-native-maps-directions';
//import Geocoder from 'react-native-geocoding';

// TODO
// Show current position on map when starting & show image on marker(from profile pic)
// When user selects an addr for SZ move camera to there 
// Draw Circle around building if not building - rad of 50m - modifable? ( drag bar )
// or make circle movable
// add label for SZ name
// screen at bottom asking if correct?
const latitudeDelta = 0.02
const longitudeDelta = 0.02

export default class SafeZoneAdd extends Component {
  
  constructor(props){
    super(props);
    //this.onRegionChange = this.onRegionChange.bind(this);
    this.state = { 
      isVisible: false,
      value: {},
      regionSet: false,
      userId: firebase.auth().currentUser.uid,
       label: '', selectedIndex: '',locationRef:'', region: { latitude : this.props.navigation.getParam('latitude'),
   longitude: this.props.navigation.getParam('longitude'),
    longitudeDelta: 0.02, latitudeDelta: 0.02},
   current_location: [{ description: "Current Location", geometry: { location: { lat: this.props.navigation.getParam('latitude'), lng: this.props.navigation.getParam('longitude') } }}], 
  //  coordinate:  new AnimatedRegion({
  //   latitude: this.props.navigation.getParam('latitude'),
  //   longitude: this.props.navigation.getParam('longitude'),
  //   latitudeDelta: 0.02,
  //   longitudeDelta: 0.02
  // }),
  // {latitude: this.props.navigation.getParam('latitude'),longitude: this.props.navigation.getParam('longitude')},
  coordinate: new AnimatedRegion({
    latitude: 0,
    longitude: 0
  }),
  circle: {
    center: {
      latitude: this.props.navigation.getParam('latitude'),
      longitude:  this.props.navigation.getParam('longitude'),
    },
    radius: 0,},
    safeZones: [],
    latitude: this.props.navigation.getParam('latitude'),
    longitude: this.props.navigation.getParam('longitude'),
    marker: {
      latitude: 0,
      longitude: 0,
    },
    formatted_address: '',
    route: this.props.navigation.getParam('route'),
    currentLong: 0, radius: 200, currentLat: 0, currentPosition: '', safeZoneName: '', SafeZoneAddress: '', SafeZoneLat: 0, SafeZoneLng: 0}
    this.map = React.createRef();
    this.notif = setupPushNotification(this.onRegister.bind(this), this.onNotif.bind(this), true);
  }

   componentDidMount() {
    this.notificationListener()
    this.getCurrentLocation()
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
          
           this.notif.scheduleLocalNotification(ios_options)

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
              this.notif.localNotification(options);
    
              firebase.database().ref(`notifications/${this.state.userId}/${id}`).remove()
      })
   }

  getCurrentLocation = () => {
    //the current location will show the region on the map
    let self = this; 
    navigator.geolocation.getCurrentPosition(
      (position) => {
        console.log(position);
            // error when it comes to setting state with this.
            self.setState({initialPosition : position.coords});
            self.setState({latitude : position.coords.latitude});
            self.setState({longitude : position.coords.longitude});
            currentRegion = {
            latitude: this.state.latitude,
            latitudeDelta: 0.02,
            longitudeDelta: 0.02,
            longitude: this.state.longitude,
            }
            self.setState({region: currentRegion});
            let key = "AIzaSyD3_KMwMzLhzJPYH7ZjGBpYbBCZiphwzFc"
                fetch('https://maps.googleapis.com/maps/api/geocode/json?address=' + this.state.latitude + ',' + this.state.longitude + '&key=' + key)
                .then((response) => response.json())
                .then((responseJson) => {
                    const data = [{ description: "Current Location", formatted_address:responseJson.results[0].formatted_address, geometry: { location: { lat: position.coords.latitude, lng: position.coords.longitude } }}];
                    this.setState({current_location:data})
                  //  this.setState({formatted_address:responseJson.results[0].formatted_address})
                  //  data["formatted_address"] = JSON.stringify(responseJson.results[0].formatted_address)
                })
                // var address = this.getGeocodedAddress(data.geometry.location.lat,data.geometry.location.lng)
                // data["formatted_address"] = address
                // console.log("data.formatted_address", this.state.formatted_address)
      }
    )
    }

    onPressSave(){
      this.setState({isVisible:true})
    }
  
    async handleSubmit(){
      // this automatically handles empty fields by showing red.
      const { SafeZoneAddress,SafeZoneLat,SafeZoneLng,radius } = this.state;
      const value = this.refs.form.getValue();
      if(value.Name != null){
        
        firebase.database().ref(`safeZones/${this.state.userId}`).push({
          name: value.Name,
          address: SafeZoneAddress,
          latitude: SafeZoneLat,
          longitude: SafeZoneLng,
          radius: radius
        }).then((data)=>{
            //success callback
            console.log('data ' , data)
         }).catch((error)=>{
          //error callback
          console.log('error ' , error)
      })
      // alert("Safe Zone" + label + "has been sucessfully added!")
          this.setState({isVisible:false})
          if(this.state.route === "UserProfileScreen"){
            this.props.navigation.navigate('SafeZoneSetup')
          }else{
          this.props.navigation.navigate('SafeZoneSetup')
          }
      }
    }

  
    onPressCancel(){
      this.setState({SafeZoneAddress : ''})
    }

    onChange(value) {
     
      this.setState({value: value});
     }

   setRegion = (region) => {
    if(this.regionSet && Platform.OS === 'ios'){
      this.map.current.animateToRegion(region, 0.1);
      }else{
        this.setState({ region });
      }
  }

    onDragEnd=(e) => {
      this.setState({ marker: e.nativeEvent.coordinate });
    }

    getNewAdress(coordinates){
      // e.nativeEvent.coordinate
      let key = "AIzaSyD3_KMwMzLhzJPYH7ZjGBpYbBCZiphwzFc"
      fetch('https://maps.googleapis.com/maps/api/geocode/json?address=' + coordinates.latitude + ',' + coordinates.longitude + '&key=' + key)
      .then((response) => response.json())
      .then((responseJson) => {
          this.setState({SafeZoneAddress:responseJson.results[0].formatted_address})
        //  this.setState({formatted_address:responseJson.results[0].formatted_address})
        //  data["formatted_address"] = JSON.stringify(responseJson.results[0].formatted_address)
      })
     }


   render() {
    const { selectedIndex, SafeZoneAddress, circle, radius } = this.state;
    const buttons = ['Save', 'Cancel'];
    return (
  <View style={styles.mainContainer}>
  <Header
      backgroundColor="#0EA8BE"
      leftComponent={<Icon name="keyboard-backspace" color='#fff' size={23} style={{padding:5}} onPress={() => {this.props.navigation.goBack()}} />}
      centerComponent={<Text style={{alignSelf:"center",marginTop:10, color:'white', fontFamily:"Roboto",fontSize:20}}>Create Safe Zone</Text>}
      rightComponent={<Icon name="more-vert" color='#fff' size={23} style={{padding:5}}/> }/>
   <Overlay isVisible={this.state.isVisible}
      width={"100%"}
      height={Dimensions.get('window').height/2}>
      <View style={styles.mainContainer}>
      <View style={{flex:6,flexDirection:"column",justifyContent: 'center'}}>
      <Text style={{marginTop: 40, alignSelf:"center", fontSize:20, fontFamily:"Roboto"}}>Enter a name for this zone:</Text>
      <Form
              ref={"form"}
              style={{marginTop:30}}
              options={options}
              value={this.state.value}
              onChange={()=>{this.onChange}}
              type={information}/>
      <Button
                    buttonStyle={{ 
                        borderRadius:20,
                        //borderWidth:1,
                        borderColor: "#0EA8BE",
                        padding: 5,
                        justifyContent:"center",
                        alignSelf:"center",
                        height: 40,
                        marginBottom:50,
                        width: 250,}}
                    onPress={() =>this.handleSubmit()}
                    accessibilityLabel="Click this button to create your safe zone"
                    titleStyle={ { color: "#0EA8BE",
                    fontSize: 20,
                    fontFamily: 'Roboto',
                    alignSelf: "center",
                    }}
                    onPress={() => {
                      this.handleSubmit()
                    }
                    }
                    loading={this.state.clicked}
                    loadingStyle={{height:40}}
                    title="Submit"
                    type="outline"
                    />
      </View>
      </View>
      </Overlay>
   <SafeAreaView style={styles.contentContainer}>
       <Animated
          ref={map => { this.map = map }}
          style={styles.map}
          provider={PROVIDER_GOOGLE}
          zoomEnabled={true}
          zoomControlEnabled={true}
          showsBuildings={true}
          showsIndoors={true}
          showsUserLocation
          followUserLocation
          rotateEnabled={true}
          scrollEnabled={true}
          showsCompass={true}
          onMapReady={() => {
            this.setState({ regionSet: true });
          }}
          // initialRegion={this.state.region}
          region={this.state.region}
         // onRegionChangeComplete={region =>  this.setRegion(region)}
          //region={this.state.region}
          //onRegionChange={(region) => { this.setState({region})}}
          //onRegionChange={(region) => { this.setState({region})}}
          >
   {SafeZoneAddress ?
          <MapView.Marker
          style={{position:"absolute"}}
          ref={marker => { this.marker = marker }}
          key={(circle.center.longitude + circle.center.latitude).toString()}
           // style={styles.fixedCircle}
             //key={(circle.center.longitude + circle.center.latitude + radius).toString()}
          coordinate={circle.center}
          draggable={true}
          onDragEnd={(e) => {
            this.getNewAdress(e.nativeEvent.coordinate)
            this.setState({circle: {center: e.nativeEvent.coordinate}, 
            currentRegion:{latitude: e.nativeEvent.coordinate.latitude, longitude : e.nativeEvent.coordinate.longitude, longitudeDelta: longitudeDelta, latitudeDelta: latitudeDelta}})}}
            //  radius={radius}
             // strokeColor='transparent'
              > 
               </MapView.Marker>
               : null }
          {SafeZoneAddress ?     
          <MapView.Circle
            //style={styles.fixedCircle}
            key={(circle.center.longitude + circle.center.latitude + radius).toString()}
                center={circle.center}
                radius={radius}
                strokeColor='transparent'
                />
                : null }
    </Animated>

    {}
    
    {SafeZoneAddress ?
    <View style={styles.buttonContainer}>
     {/* <View style={{ flex: 1, alignItems: 'stretch', justifyContent: 'center' }}> */}
    <Slider
      maximumValue={200}
      minimumValue={1}
      thumbTintColor="#0EA8BE"
      style={{backgroundColor:"white", width:"90%", alignSelf:"center"}}
      value={this.state.radius}
      onValueChange={radius => this.setState({ radius })}
    />
      <Text style={{color:"black", textAlign:"center", fontFamily:"Roboto"}}>Radius: {this.state.radius}km</Text>
       {/* <Button title="Save" buttonStyle={{width:"30%",alignSelf:"center"}} onPress={()=>{this.setState({isVisible:true})}}/>
       <Button title="Cancel" buttonStyle={{width:"30%",alignSelf:"center", marginTop:10}} onPress={()=>{this.onPressCancel()}}/> */}
       <ButtonGroup
            textStyle={{fontFamily:"Roboto"}}
            selectedIndex={selectedIndex}
            onPress={selectedIndex => {

              if(selectedIndex === 0){
                this.setState({isVisible:true})
              }else{
                this.onPressCancel()
              }
            }}
            buttons={buttons}
            containerStyle={{width: 260}, {alignSelf:true}, {alignContent: true}, {alignItems:'center'}}
       />

     
     </View>

         :
          <View style={styles.search_field_container}>
         <GooglePlacesAutocomplete
            ref={(instance) => { this.locationRef = instance }}
            placeholder='Enter Safe Zone Address'
            minLength={5} 
            autoFocus={false}
            keyboardAppearance={'light'}
            returnKeyType={'search'} 
            listViewDisplayed={'false'}
            fetchDetails={true}          
            onPress={(data, details=null) => {
              var data = details;
              console.log("adding...",data);
              //accomodate for the selected predefined location

              this.setState(
                  {
                    SafeZoneAddress: data.formatted_address, // selected address
                    SafeZoneLat: data.geometry.location.lat,//  selected coordinates latitude
                    SafeZoneLng: data.geometry.location.lng, //  selected coordinates longitute
        
                  }
                );
              
             //console.log("Address:",this.state.SafeZoneAddress); ///to console address
             //console.log("Coordinates",this.state.SafeZoneLat,this.state.SafeZoneLng); /// to console coordinates
             // update current position - on region change?
             SafeZoneRegion ={
              latitude: data.geometry.location.lat,
              longitude: data.geometry.location.lng,
              latitudeDelta: 0.025,
              longitudeDelta: 0.025,}
            SafeZoneCircle ={
              center: {
                latitude: data.geometry.location.lat,
                longitude: data.geometry.location.lng,
              },
              radius: 200,
            }
             this.setState({region: SafeZoneRegion });
             this.setState({circle: SafeZoneCircle });
             
             console.log('region update:', this.state.region);
             console.log('circle update:', this.state.circle);
            }
            }
            currentLocation={false} // Will add a 'Current location' button at the top of the predefined places list
            predefinedPlaces={this.state.current_location}
            //currentLocationLabel="Current location"
            query={{
              key: 'AIzaSyD3_KMwMzLhzJPYH7ZjGBpYbBCZiphwzFc',
              language: 'en', 
            }}
            styles={{
              container:{
                padding: 30,
              },
              textInputContainer: {
                width: '100%',
                backgroundColor: '#FFF'
              },
              listView: {
                backgroundColor: '#FFF'
              }
            }}
            debounce={200} 
          />
        </View> }
     </SafeAreaView>
     </View>
    )
  }
}

const styles = StyleSheet.create({
  container: {
    justifyContent: 'flex-end',
    alignItems: 'center',
    flex: 1
  },
  fixedCircle:{
    position: 'absolute',
  },
  bottomButton: {
   // width: 60
    marginTop: Dimensions.get('window').height - 250
  },
  mainContainer: {
    flex: 1,
    backgroundColor: '#F5FCFF',
    height: 34
  },
  contentContainer: {
    flex: 6,
  },
  map: {
    //position:'relative',
   // width: Dimensions.get('window').width,
   // height: Dimensions.get('window').height
    ...StyleSheet.absoluteFillObject,
    // zIndex: -1
  },
  search_field_container: {
    height: '45%', 
    width: Dimensions.get('screen').width,
    //position: 'absolute', 
    top:5
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
    marginTop: Dimensions.get('window').height - 250
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
  }
});
