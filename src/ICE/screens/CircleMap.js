import React, { Component } from 'react';
import { Alert, ImageBackground, TextInput, Switch, ScrollView, Image, Dimensions, StyleSheet, Text, View, TouchableOpacity, Panresponder } from 'react-native';
import { ButtonGroup, Button } from 'react-native-elements';
import { GooglePlacesAutocomplete } from 'react-native-google-places-autocomplete';
import Geolocation from '@react-native-community/geolocation';
import MapView, { PROVIDER_GOOGLE, UrlTile,AnimatedRegion, OverlayComponent, Animated, Marker, Callout, Polygon, Circle } from 'react-native-maps';
import { Avatar, ListItem,Header, SearchBar} from 'react-native-elements';
import NumericInput from 'react-native-numeric-input'
import { Hoshi, Kaede } from 'react-native-textinput-effects';
import firebase from '@react-native-firebase/app';
import '@react-native-firebase/auth';
import '@react-native-firebase/database';
import Swiper from 'react-native-web-swiper';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { ThemeConsumer, ThemeProvider } from 'styled-components';
const { width } = Dimensions.get('window')
import ViewPager from '@react-native-community/viewpager';
import SideMenu from 'react-native-side-menu';
import { FastField } from 'formik';
import ModalSelector from 'react-native-modal-selector'
import { interpolate } from 'react-native-reanimated';
import { number } from 'prop-types';
import PushNotification from 'react-native-push-notification';
import BottomNavBar from "../UIcomponents/BottomNavNew";
import SOS from "../UIcomponents/SOSbutton";

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

// separate each circle
// Retrieve Circle Member for each circle
// Show each circle member as marker with their picture
// make each marker clickable with that members status

export default class CircleMap extends Component {
    constructor(props){
        super(props);
        this.state = { 
        userId: firebase.auth().currentUser.uid,
        label: '', selectedIndex: '',locationRef:'', 
        region: { latitude : this.props.navigation.getParam('latitude'),
        longitude: this.props.navigation.getParam('longitude'),
          longitudeDelta: 0.02, latitudeDelta: 0.02},
        resulting: [],
        isOpen: false,
        circle_ids: [],
        textInputValue: '',
        data: [],
        users: [],
        other_data: [],
        test: [{ key: 0, section: true, label: 'Fruits' }],
        current_ids_list: [],
        member_keys:[],
        selectedItem: 'About',
        member_ids: [],
        members_list: [],
        currentIndex: 0,
        coords: {latitude: 37.785834,longitude: -122.406417},
        windowWidth:0,
        circle: {
            center: {
            latitude: 0,
            longitude: 0,
            },
            radius: 700,},
            currentLong: 0, radius: 200, currentLat: 0, currentPosition: '', safeZoneName: '', SafeZoneAddress: '', SafeZoneLat: 0, SafeZoneLng: 0}
      
            this.notif = setupPushNotification(this.onRegister.bind(this), this.onNotif.bind(this), true);
    }
   
    componentDidMount() {
    // Get circle list
    this.notificationListener()
    this.getCurrentLocation();
    let windowWidth = Dimensions.get('window').width
    this.setState({windowWidth: windowWidth - 20})
    circlesRef = firebase.database().ref(`circles/${this.state.userId}/personal_circles`);
    this.getCircles();
    this.getOtherCircles();
    this.getUsers();
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

  toggle() {
    this.setState({
      isOpen: !this.state.isOpen,
    });
  }
  updateMenuState(isOpen) {
    this.setState({ isOpen });
  }

  onMenuItemSelected = item =>
    this.setState({
      isOpen: false,
      selectedItem: item,
    });

  getUsers = () => {
    firebase.database().ref(`users/`).on('value', (dataSnapshot) => {
      if(dataSnapshot.val()){
        var values = dataSnapshot.val();
        var keys = Object.keys(values);
        var vals = Object.values(values);
        for(var i = 0; i < vals.length; i++ ) {
          // add the id to the vals list -- so it can be deleted at later stage
          vals[i]["id"] = keys[i]
        }
      this.setState({users:vals});
      }
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
            self.setState({currentLat : position.coords.latitude});
            self.setState({currentLong : position.coords.longitude});
            currentRegion = {
            latitude: this.state.currentLat,
            latitudeDelta: 0.1,
            longitudeDelta: 0.1,
            longitude: this.state.currentLong,
            }
            self.setState({region: currentRegion});
      }
    )
    }

    async getCircles() {
      firebase.database().ref(`circles/${this.state.userId}/personal_circles`).on('value', async (dataSnapshot) => {
        if(dataSnapshot.val()){
          var values = dataSnapshot.val();
          var keys = Object.keys(values);
          let index = 1;
          const data = [
            ];
          for(var i = 0; i < keys.length; i++ ) {
          const circle_name = await firebase.database().ref(`circles/${this.state.userId}/personal_circles/${keys[i]}/name`).once('value');
          const members = await firebase.database().ref(`circles/${this.state.userId}/personal_circles/${keys[i]}/members`).once('value');
          const member_ids = Object.keys(members.val())
          const members_data = [];
          for(var j = 0; j < member_ids.length; j++ ) {
            const member_data = await firebase.database().ref(`users/${member_ids[j]}`).once('value');
            var member_data_val = member_data.val();
            member_data_val["id"] = member_ids[j]
            convert = Object.values(member_data_val).toString().split()
            members_data.splice(0,0,JSON.parse(JSON.stringify(member_data_val)))
          }
         data.push({key: index++, label: circle_name.val().toString(), id: keys[i], members_ids: Object.keys(members.val()).toString().split(), users: members_data})
         }
         this.setState({data});
        }
      })
  }
  
  async getOtherCircles() {
    firebase.database().ref(`circles/${this.state.userId}/other_circles`).on('value', async (dataSnapshot) => {
      if(dataSnapshot.val()){
        var values = dataSnapshot.val();
        var circles_ids = Object.keys(values);
        let index = 1;
        const data = [
          ];
        for(var i = 0; i < circles_ids.length; i++ ) {
            // tranverse down the tree to get child node (owner id)
            const owner = await firebase.database().ref(`circles/${this.state.userId}/other_circles/${circles_ids[i]}`).once('value');
            var owner_id = Object.keys(owner.val())[0]
            const circle_name = await firebase.database().ref(`circles/${owner_id}/personal_circles/${circles_ids[i]}/name`).once('value');
            const members = await firebase.database().ref(`circles/${owner_id}/personal_circles/${circles_ids[i]}/members`).once('value');
            const member_ids = Object.keys(members.val())
            // add the owner to the members too
            member_ids.splice(0,0,owner_id);
            const members_data = [];
            for(var j = 0; j < member_ids.length; j++ ) {
            const member_data = await firebase.database().ref(`users/${member_ids[j]}`).once('value');
            var member_data_val = member_data.val();
            member_data_val["id"] = member_ids[j]
            convert = Object.values(member_data_val).toString().split()
            members_data.splice(0,0,JSON.parse(JSON.stringify(member_data_val)))
            }
           this.state.data.push({key: index++, label: circle_name.val().toString(), id: circles_ids[i], members_ids: Object.keys(members.val()).toString().split(), users: members_data})
           }
          }
        })
}


onRegionChange = (region) => {
  this.setState({ region });
  console.log('region change:', region)
}


Menu({ onItemSelected }) {
  return (
    <ScrollView scrollsToTop={false} style={{flex:1}}>
      <View style={styles.avatarContainer}>
        <Text style={styles.name}>Circle Name</Text>
      </View>
      
      { this.state.currentIndex > 0 ? this.state.data.map((circle) => {
        return(
       circle.key === this.state.currentIndex ?
         circle.users.map((member) => {
        return(
          <ListItem
          key={member.id}
          leftAvatar={{ source: { uri: member.profile_pic_url }}}
          rightAvatar={<Icon name="add-location" color='black' size={20} onPress={() => {
            // no updating state...
            user_region = {
              latitude: parseFloat(member.latitude), 
              longitude: parseFloat(member.longitude),
              latitudeDelta: 0.015,
              longitudeDelta: 0.015,
            }

            this.setState({
              region: user_region,

            });
            //programmatically close the drawer to see
            this.setState({isOpen:false})

          }} />}
          title={member.first_name + " " +member.last_name}
          // FOR ios emulator put contact.phoneNumbers[0].number
          subtitle={"Battery: " + member.battery_level.toString()
          +  member.currentSafeZone !== "" ? "\nAt " + member.currentSafeZone : ""
          //if in safezone state here.
        }
          bottomDivider
          onPress={() => {}}
        />
            ) 
            })
            :null
        )
          })
    : null }
    </ScrollView>
  );
}
  swiperRef;
   render() {
    return (
      <View style={styles.mainContainer}>
      <SOS/>
      <BottomNavBar/>
      <SideMenu
          menu={this.Menu(this.onMenuItemSelected)}
          isOpen={this.state.isOpen}
          onChange={isOpen => this.updateMenuState(isOpen)}>
        <Header
            backgroundColor="#0EA8BE"
            leftComponent={ <Icon name="format-list-bulleted" color='#fff' size={23} onPress={() => {this.setState({isOpen:true})}} size={23} style={{ marginLeft:20}}/>}
            centerComponent={       //<View style={{flex:1, justifyContent:'space-around', padding:30}}>
            <ModalSelector
                         data={this.state.data}
                         //style={{alignSelf:'center'}}
                         initValue="Select a Circle"
                         cancelTextStyle={{fontFamily:"Roboto",color:"white"}}
                         optionTextStyle={{fontFamily:"Roboto",color:"white"}}
                         sectionTextStyle={{fontFamily:"Roboto", color:"white"}}
                         selectTextStyle={{fontFamily:"Roboto",color:"white"}}
                         onChange={(option)=>{ 
                           this.setState({currentIndex: option.key, current_circle_name: option.label, current_circle_id: option.id})
                           }} />
                        // </View>
                      }
            rightComponent={<Icon name="more-vert" color='#fff' size={23} style={{padding:5}}/>}
        />
     <View style={styles.contentContainer}>
      <Animated
          style={styles.map}
          provider={PROVIDER_GOOGLE}
          zoomEnabled={true}
          zoomControlEnabled={true}
          showsBuildings={true}
          showsIndoors={true}
          showsUserLocation
          rotateEnabled={true}
          scrollEnabled={true}
          showsCompass={true}
          initialRegion={this.state.region}
          onRegionChange={(region) => { this.setState({region})}}
          //onRegionChange={(region) => { this.setState({region})}}
          >
      {console.log("current users 3:",this.state.data)}
      { this.state.currentIndex > 0 ? this.state.data.map((circle) => {
        console.log("current key", circle.key, this.state.currentIndex)
        return(
       circle.key === this.state.currentIndex ?
         circle.users.map((member) => {
           console.log("mmember:",member)
           return (
            <Marker
            key={member.id}
            //"latitude": 37.785834, "longitude": -122.406417 longitude:
            coordinate={{
              longitude: parseFloat(member.longitude),
              latitude: parseFloat(member.latitude),
            }}
            onPress={
              () => {
                user_region = {
                  latitude: parseFloat(member.latitude),
                  longitude: parseFloat(member.longitude),
                  latitudeDelta: 0.015,
                  longitudeDelta: 0.015,
                }

                this.setState({
                  region: user_region
                })
              }
            }
            title={"Battery: " + member.battery_level.toString()
            +  member.currentSafeZone !== "" ? "\nAt " + member.currentSafeZone : ""
            //if in safezone state here.
          }
            zIndex={4}>
            <View style={{ 
              borderWidth: 5, 
              borderColor: (member.mode !== "normal" ? (member.mode !== "offline" ? 'orange' : 'gray') : 'green'),
              backgroundColor: 'white',
              height: 50, 
              borderRadius: 30,
              width: 50 }}>
              <Image
              style={{width:"100%", height:"100%",borderRadius:30}}
              source={{uri:member.profile_pic_url}}/>
            </View>
          </Marker>
           );
            })
        : null
        ) 
      }): null }
        </Animated>
  </View>
  </SideMenu>
  </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    justifyContent: 'flex-end',
    alignItems: 'center',
    flex: 1
  },
  slide1: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#9DD6EB'
  },
  headerContainer: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    backgroundColor: "#80e8f6",
    alignItems:"center",
    paddingRight: 5
 },
 leftHeaderContainer: {
    alignItems: "flex-start",
    flexDirection: "row"
 },
 mainContainer: {
  flex: 1,
  backgroundColor: '#F5FCFF',
  height: 34
},
contentContainer: {
  flex: 6,
},
  overlay: {
    position: 'absolute',
    top: 50,
    width: "60%",
    height: "10%",
    backgroundColor: 'blue',
  },
  map: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    flex:6
  },
  search_field_container: {
    height: '45%', 
    width: '100%',
    position: 'absolute', 
    top: 10
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
  rightHeaderContainer: {
    alignItems: "flex-end",
    flexDirection: "row"
 },
  textInputContainer: {
    height: '45%', 
    width: '100%',
    position: 'absolute', 
    textAlignVertical: 'top',
    top: 35
  },
  wrapper: {
    // height: '45%', 
    // backgroundColor: 'pink',
  },
  slide: {
    flex: 1,
    height: '45%',
    justifyContent: 'center',
    backgroundColor: 'transparent'
  },
  text: {
    color: '#fff',
    fontSize: 30,
    fontWeight: 'bold'
  },
  image: {
    width,
    flex: 1
  },
  paginationStyle: {
    position: 'absolute',
    bottom: 10,
    right: 10
  },
  paginationText: {
    color: 'white',
    fontSize: 20
  },
  menu: {
    flex: 1,
    width: window.width,
    height: window.height,
    backgroundColor: 'gray',
    padding: 20,
  },
  avatarContainer: {
    marginBottom: 20,
    marginTop: 60,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    flex: 1,
  },
  name: {
    color:'black',
    position: 'absolute',
    left: 70,
    top: 20,
  },
  item: {
    fontSize: 14,
    fontWeight: '300',
    paddingTop: 5,
  },
});