import React, { Component } from 'react';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { Button, Header } from 'react-native-elements';
import {
  StyleSheet,
  Permissions,
  Text,
  View,
  Image,
  Alert,
  TouchableHighlight,
} from 'react-native';

import Voice, {
  SpeechRecognizedEvent,
  SpeechResultsEvent,
  SpeechErrorEvent,
} from '@react-native-community/voice';

import firebase from '@react-native-firebase/app';
import '@react-native-firebase/auth';
import '@react-native-firebase/database';
import PushNotification from 'react-native-push-notification';

import {request, PERMISSIONS} from 'react-native-permissions';

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

export default class SafeWordCreate extends Component {
  constructor(props) {
    super(props);
    Voice.onSpeechStart = this.onSpeechStart;
    Voice.onSpeechRecognized = this.onSpeechRecognized;
    Voice.onSpeechEnd = this.onSpeechEnd;
    Voice.onSpeechError = this.onSpeechError;
    Voice.onSpeechResults = this.onSpeechResults;
    Voice.onSpeechPartialResults = this.onSpeechPartialResults;
    Voice.onSpeechVolumeChanged = this.onSpeechVolumeChanged;
    this.state = { 
      recognized: '',
      pitch: '',
      error: '',
      user_id: firebase.auth().currentUser.uid,
      end: '',
      result: '',
      route: this.props.navigation.getParam('route'),
      started: "",
      results: [],
      partialResults: [],
    }
    this.notif = setupPushNotification(this.onRegister.bind(this), this.onNotif.bind(this), true);
  }


  componentWillUnmount() {
    Voice.destroy().then(Voice.removeAllListeners);
    firebase.database().ref(`users/${this.state.user_id}`).update({
      mode: 'normal'
    })
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

  // The following functions are required by the library...

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
    //Alert.alert('ICE - Safe Word Create', 'Safe Word is not being recorded')
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
      await Voice.start('es_US', {
         "RECOGNIZER_ENGINE": "GOOGLE",
         "EXTRA_PARTIAL_RESULTS": true
      })
    } catch (e) {
      console.error(e);
    }
  };

  stop = async () => {
    this.setState({started: '', partialResults: []})
    try {
      await Voice.stop();
    } catch (e) {
      console.error(e);
    }
  };

  async componentDidMount() {

  firebase.database().ref(`users/${this.state.user_id}`).update({
      mode: 'SafeWordCreate'
   })

  this.notificationListener()
	// const { status } = await Permissions.askAsync(
	// 	Permissions.RECORD_AUDIO
  //   );
	// if (status !== "granted") {
  //   //skip this page ....
  //   Alert.alert("ICE - Safe Word Create","Ungranted access to phones microphone\nTo change this please enable it within phones settings.")
  //   this.props.navigation.navigate("HomeScreen")
  // }
}

 pressedNo = () => {
  // reset the state
  this.setState({
    recognized: '',
    pitch: '',
    error: '',
    started: '',
    results: [],
    partialResults: [],
    end: '',
  });
 }

 pressedYes = () => {
   // Safe Word is correct - push to database
   this.state.partialResults.map((result, index) => {
     console.log("chosen safe word:",result)
     if(result !== ""){
      firebase.database().ref(`users/${this.state.user_id}`).update({
        safe_word: result,
      });
        if(this.state.route !== "UserProfileScreen"){
          this.props.navigation.navigate('ProfileSetupScreen')
        }else{
          this.props.navigation.navigate('UserProfileScreen')
        }

      }else{
        Alert.alert('ICE - Safe Word Create', 'You cannot choose a blank message.')
      }
   });

   alert('Safe word succesfully created!')
   // move to next screen
   if(this.state.route === "UserProfileScreen"){
    this.props.navigation.navigate('UserProfileScreen')
   }else{
     this.props.navigation.navigate('HomeScreen')
   }

 }

  render() {
    return (
      <View style={styles.mainContainer}>
      <Header
         backgroundColor="#0EA8BE"
         leftComponent={<Icon name="keyboard-backspace" color='#fff' size={23} style={{padding:5}} onPress={() => {this.props.navigation.goBack()}} />}
         centerComponent={<Text style={{alignSelf:"center",marginTop:10, color:'white', fontFamily:"Roboto", fontSize:20}}>Create a Safe Word</Text>}
         rightComponent={<Icon name="more-vert" color='#fff' size={23} style={{padding:5}}/> }/>
         <Text style={{textAlign:"center", marginTop:20, fontFamily:"Roboto", fontSize:17}}>Create a safe word for your account to trigger SOS mode in times of need. Press the record button to get started!</Text>
       <View style={styles.contentContainer}>
      {this.state.started !== "" ? 
        <Text style={styles.instructions}>
               Recording...
        </Text>
        
      : <Text style={styles.instructions}>
          Press the button and start speaking.
        </Text>
  }
        <TouchableHighlight onPress={this.state.started !== "" ? this.stop : this.start}>
        <Image style={styles.button} source={this.state.started ? require('../images/stop.png') : require('../images/microphone.png')} />
        </TouchableHighlight>
         {this.state.partialResults.length > 0  && this.state.started !== ''?
            <Text style={styles.stat}>
              Did you say
              "{this.state.partialResults[0]}"?
            </Text>
        : null }
        {this.state.partialResults.length > 0  && this.state.started !== '' ?
        <View style={{ flexDirection:"row", marginTop: 50 }}>
        <View>
        <Button icon={<Icon name="check" size={15} color="#0EA8BE"/>}
         title="Yes" 
         titleStyle={{fontFamily:"Roboto", color:"#0EA8BE"}}
         type="outline"
         buttonStyle={{borderColor:"#0EA8BE"}}
         onPress={() => this.pressedYes()}></Button>
        </View>
        <View>
        <Button title="No" backgroundColor="#80e8f6" icon={<Icon name="clear" size={15} color="#0EA8BE"/>}
        onPress={() => this.pressedNo()} style={{marginLeft: 25}}
        titleStyle={{fontFamily:"Roboto", color:"#0EA8BE"}}
        type="outline"
        buttonStyle={{borderColor:"#0EA8BE"}}
        ></Button>
        </View>
        </View>
        :null}
        {this.state.route !== "UserProfileScreen" ?
        <Button onPress={() => {this.props.navigation.navigate('ProfileSetupScreen')}}
        title="Skip" titleStyle={{color:"#0EA8BE", fontFamily:"Roboto"}}
        style={styles.bottomView} type="clear">
        </Button>
        : 
        null
        }
      </View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  button: {
    marginTop: 20,
    width: 50,
    height: 50,
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F9F7F6',
  },
  instructions: {
    fontFamily:"Roboto",
    fontSize: 17,
    textAlign: 'center',
    color: '#333333',
    marginBottom: 5,
  },
  stat: {
    fontFamily:"Roboto",
    textAlign: 'center',
    color: '#B0171F',
    marginTop: 20,
  },
  mainContainer: {
    flex: 1,
    backgroundColor: '#F9F7F6',
    height: 34
 },
modal: {
   flex: 1,
   alignItems: 'center',
   backgroundColor: '#f7021a',
   padding: 100
},
clear: {
   marginBottom: 10,
   borderColor: 'black',
   padding: ( Platform.OS === 'ios' ) ? 50 : 0,
   alignSelf: 'center'
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
 rightHeaderContainer: {
    alignItems: "flex-end",
    flexDirection: "row"
 },
 contentContainer: {
  flex: 6,
  justifyContent: 'center',
  alignItems: 'center',
  backgroundColor: '#F9F7F6',
 },
 bottomView: {
   width: '100%',
   height: 150,
   marginTop: 30,
   justifyContent: 'center',
   alignItems: 'center',
 }
});