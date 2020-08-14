import React, {Component} from 'react';
import {View, StyleSheet, KeyboardAvoidingView , TouchableWithoutFeedback, Animated, Text} from 'react-native';
import firebase from '@react-native-firebase/app';
import '@react-native-firebase/auth';
import '@react-native-firebase/database';
import { GiftedChat } from 'react-native-gifted-chat';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { Header } from 'react-native-elements';
import Geocoder from 'react-native-geocoding';
import Geolocation from '@react-native-community/geolocation';
import SendSMS from 'react-native-sms'
import {Button} from 'react-native-elements';
import { Kaede, Madoka, Hoshi, Jiro } from 'react-native-textinput-effects';
import StyledButton  from '../UIcomponents/StyledButton';
import { ScrollView } from 'react-native-gesture-handler';
import { Dropdown } from 'react-native-material-dropdown'
import FontAwesomeIcon from 'react-native-vector-icons/FontAwesome';
import { Fumi } from 'react-native-textinput-effects';
import PushNotification from 'react-native-push-notification';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';


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

export default class TextFormat extends Component{
    buttonSize = new Animated.Value(1);
    constructor(props){
        super(props)
        this.state = {
            emergency_choice: this.props.navigation.getParam('emergency_choice'),
            region: '', 
            currentLat: '',
            currentLong: '',
            problem: '',
            user_address: '',
            returnedResult: null,
            county: '',
            additionalInfo: '',
            user_id: firebase.auth().currentUser.uid,

          }
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
        
                  firebase.database().ref(`notifications/${userId}/${id}`).remove()
                })
    }
   

    
    async componentDidMount(){


        this.notificationListener()

        await firebase.database().ref(`users/${this.state.user_id}/longitude`).once('value')
        .then(snapshot => {
          console.log("Try to get long & lat")
          console.log(snapshot.val())
            this.setState({currentLong :  parseInt(snapshot.val())})
        });
        await firebase.database().ref(`users/${this.state.user_id}/latitude`).once('value')
        .then(snapshot => {
            this.setState({currentLat : parseInt(snapshot.val())})
        });
        console.log("Long,lat", this.state.currentLong, this.state.currentLat)

        let resp = await fetch(`https://maps.googleapis.com/maps/api/geocode/json?latlng=${this.state.currentLat},${this.state.currentLong}&key=AIzaSyD3_KMwMzLhzJPYH7ZjGBpYbBCZiphwzFc`)
        let respJson = await resp.json();
        console.log("respJson",respJson.results[0].formatted_address)
        var address = respJson.results[0].formatted_address
        this.setState({
          user_address: respJson.results[0].formatted_address
        })
                
        //  Geocoder.init("AIzaSyD3_KMwMzLhzJPYH7ZjGBpYbBCZiphwzFc", {language : "en"});
        //  Geocoder.from(this.state.currentLat, this.state.currentLong)
        // .then(json => {
       
        //     console.log("Address = " + json.results[0].formatted_address)
     
    
        //     this.setState({
        //        user_address: json.results[0].formatted_address
        //     })
        //     })
        //     .catch(error =>
        //         console.warn(error)
        //     );
    }

    sendMessage(){
        var body = this.state.emergency_choice +". " 
        + this.state.problem + ". "
         + this.state.county + ". " 
         + this.state.user_address + ". "
         + this.state.additionalInfo
         + "coordinates : (" + this.state.currentLat + "," + this.state.currentLong + ")";

        SendSMS.send({
            body: body,
            recipients: ['+353862227103'],
            successTypes: ['sent', 'queued'],
            allowAndroidSendWithoutReadPermission: true
        }, (completed, cancelled, error) => {
     
            console.log('SMS Callback: completed: ' + completed + ' cancelled: ' + cancelled + 'error: ' + error);
     
        });

    }
    async getCurrentLocation()  { 
        const currentLong = await firebase.database().ref(`users/${this.state.user_id}/longitude`).once('value');
        const currentLat = await firebase.database().ref(`users/${this.state.user_id}/latitude`).once('value');
        this.setState({currentLat: currentLat, currentLong: currentLong})
      }

      


    
    render() {  
        const animatedStyle = {
            transform: [{ scale: this.buttonSize}]
          } 
        let data = [{
            value: 'Carlow' },{ value: 'Cavan'},{ value: 'Clare'}, {value: 'Cork'}, { value: 'Dublin'},{ value: 'Donegal' },
        { value: 'Galway'}, {value: 'Kildare'},{  value: 'Kilkenny' },  { value: 'Laois'}, {value: 'Leitrim'},
        { value: 'Limerick'},  {value: 'Longford'}, {value: 'Louth'},{  value: 'Mayo' },  { value: 'Meath'}, {value: 'Monaghan'},
        { value: 'Offaly'}, {value: 'Roscommon'},{  value: 'Sligo' },  { value: 'Tipperary'}, {value: 'Waterford'},
        { value: 'Westmeath'}, {value: 'Wexford'},{  value: 'Wicklow' }, 

        ]
        return (
            
         <View style={styles.mainContainer}>
          <Header
            backgroundColor="#0EA8BE"
            leftComponent={<Icon name="keyboard-backspace" color='#fff' size={23} style={{padding:5}} onPress={() => this.props.navigation.goBack()} />}
            centerComponent={{ text: `${this.state.emergency_choice}`, style: { color: '#fff', fontSize:20 } }}
            rightComponent={<Icon name="more-vert" color='#fff' size={23} style={{padding:5}}/>}
            />
            <ScrollView style={styles.contentContainer}>
            
            <View style={[styles.textInput, { backgroundColor: '#F5FCFF', padding: 5 }]}>
                <Text style={{fontSize: 20, fontFamily:"Roboto"}}>What is the problem?</Text>
                <Fumi
                      label={'e.g heart attack'}
                      iconClass={Icon}
                      iconName={'report-problem'}
                      iconColor={'#80e8f6'}
                      iconSize={20}
                      labelStyle={{fontFamily:"Roboto",fontSize:15}}
                      inputStyle={{fontFamily:"Roboto",fontSize:15}}
                      iconWidth={40}
                      //height={(Dimensions.get("window").height/15)}
                    // inputPadding={16}
                        onChangeText={problem  => {
                          this.setState({problem})
                      }
                      }
                      //maxLength={6}
                      style={{marginTop:5}}
                   
                    />
           
            </View>
            {/* information-outline */}
                <View style={[styles.textInput, { backgroundColor: '#F5FCFF', padding: 5 }]}>
                    <Text style={{fontSize: 20, fontFamily:"Roboto"}}>Any additional information?</Text>
                <Fumi
                    label={'e.g nearby landmarks/main roads'}
                    iconClass={MaterialCommunityIcons}
                    iconName={'information-outline'}
                    iconColor={'#80e8f6'}
                    iconSize={20}
                    labelStyle={{fontFamily:"Roboto", fontSize:15}}
                    inputStyle={{fontFamily:"Roboto",fontSize:15}}
                    iconWidth={40}
                    value={this.state.additionalInfo}
                    onChangeText={additionalInfo => {
                    this.setState({ additionalInfo })
                    }}
                    maxLength={50}
                    editable={this.state.returnedResult ? false : true}/>
           
  
                </View>
                
                <View>
                    <View>
                    <Text style={{fontSize: 15, fontFamily:"Roboto", color:"#0EA8BE"}}>Location: {this.state.user_address}</Text>
                  
                    </View>

                    <Fumi
                      label={'Change Address'}
                      iconClass={Icon}
                      iconName={'edit-location'}
                      iconColor={'#80e8f6'}
                      iconSize={20}
                      labelStyle={{fontFamily:"Roboto",fontSize:15}}
                      inputStyle={{fontFamily:"Roboto",fontSize:15}}
                      iconWidth={40}
                      //height={(Dimensions.get("window").height/15)}
                    // inputPadding={16}
                        onChangeText={user_address  => {
                          this.setState({user_address})
                      }
                      }
                      //maxLength={6}
                      style={{marginTop:5}}
                   
                    />
                </View>
                <View>
                <Dropdown 
                label = 'County'
                labelTextStyle={{fontFamily:"Roboto"}}
                style={{fontFamily:"Roboto"}}
                itemTextStyle={{fontFamily:"Roboto"}}
                data = {data} 
                onChangeText={(value)=> {this.setState({
                    county: value
                  });}} />
                
                </View>
                <View style={{flex: 1, paddingBottom: 20, alignItems: 'center', justifyContent: 'flex-end', marginTop: 15}} >
                <Button 
                  buttonStyle={{ 
                    borderRadius:20,
                    //borderWidth:1,
                    borderColor: "#f00",
                    padding: 5,
                    justifyContent:"center",
                    alignSelf:"center",
                    height: 50,
                    marginBottom:10,
                    width: 300,}}
                    type="outline"
                    accessibilityLabel="Click this button to send 112 message"
                    titleStyle={ { color: "#f00",
                    fontSize: 20,
                    fontFamily: 'Roboto',
                    alignSelf: "center",
                }}
                  title="Send" style={{width:"50%",alignSelf:"center"}} onPress={
                    ()=>{
                      this.sendMessage()
                    }}
                    />
                </View>
                

                
           
            </ScrollView>
            </View>
            
        )
}
}
const styles = StyleSheet.create({
    mainContainer: {
        flexGrow: 1,
        flexDirection: 'column',
       backgroundColor: '#F5FCFF',
     
    },
    input: {
        paddingRight: 10,
        lineHeight: 23,
        flex: 2,
        textAlignVertical: 'top'
    },
    contentContainer: {
        flexGrow: 6, 
        alignContent: 'center'
      },
      headerText: {
        fontSize: 40,
        textAlign: 'center',
        margin: 10,
        fontWeight: 'bold',
        color: "#2F6276", 
        paddingTop: 20
        },
        imageText: {
            fontSize: 15,
            textAlign: 'center',
            margin: 10,
            fontWeight: 'bold',
            color: "#2F6276",
            paddingTop: 0, 
       
        },
      ImageIconStyle: {
        borderWidth: 5,
        justifyContent: "center",
        alignSelf: "center",
        borderColor: '#2F6276',
        alignContent: "center",
        borderRadius: 10,
        paddingBottom: 0,
        margin: 5,
        height: 170,
        width:170,
      },
      wrap: {
        flex: 1,
        height: 70,
        margin:30
        },
        button: {
            borderRadius: 36,
            backgroundColor:'#f00',
            justifyContent: 'center',
            alignItems: 'center',
            shadowColor: "#7F58FF",
            shadowRadius: 5,
            shadowOffset: {height: 10},
            shadowOpacity: 0.3,
            borderWidth: 3,
            borderColor: "#FFF"
        },
        
  });
  