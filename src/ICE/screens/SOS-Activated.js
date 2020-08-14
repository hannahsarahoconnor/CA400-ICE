"use strict";
import React, { Component } from 'react';
import CountDown from 'react-native-countdown-component'
import { StyleSheet, Alert, View, ActivityIndicator,TouchableHighlight, TouchableWithoutFeedback, ImageBackground, TextInput, TouchableOpacity, PermissionsAndroid, Dimensions } from 'react-native';
import StyledButton from '../UIcomponents/StyledButton';
import { withNavigation } from 'react-navigation';
import firebase from '@react-native-firebase/app';
import storage from '@react-native-firebase/storage';
import '@react-native-firebase/database';
import '@react-native-firebase/auth';
import SOS from '../UIcomponents/SOSbutton'
import { Vibration} from 'react-native'
import BlinkView from 'react-native-blink-view'
import { string } from 'prop-types';
import Sound from 'react-native-sound';
import {AudioRecorder, AudioUtils} from 'react-native-audio';
import { RNCamera } from 'react-native-camera';
import { Overlay, Text, Divider,Button } from 'react-native-elements';
import {check, PERMISSIONS, RESULTS} from 'react-native-permissions';
//import Recorder from './Recorder';

class SOSActivated extends Component{
    constructor(props) {
        super(props);
        this.state = {
          isHidden: false,
          password: '',
          encrypted_password: '', 
          passwordHidden: true,
          recordingName: '',
          audioPath: '', 
          overlayVisible: false,
          recognized: '',
          finished: false,
          pitch: '',
          recording: false,
          processing: false,
          error: '',
          hasPermission: undefined,
          result: '', time: '',
          userId: firebase.auth().currentUser.uid,
          currentTime: '',
          session_id: '',
          member_ids: [],
          permissionsGranted: false,
          started: '',};
      }

      _requestPermissions = async () => {
        console.log("Platform.OS",Platform.OS)
        if (Platform.OS === 'android') { 
          const result = await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.CAMERA)
          this.setState({ permissionsGranted: true });
          return result === PermissionsAndroid.RESULTS.GRANTED || result === true
        }else{
          check(PERMISSIONS.IOS.CAMERA)
          .then((result) => {
            switch (result) {
              case RESULTS.UNAVAILABLE:
                request(PERMISSIONS.IOS.CAMERA).then((result) => {
                  console.log("result",result)
                  if(result.GRANTED){
                    return true
                  }else{
                    return false
                  }
                 });
                console.log(
                  'This feature is not available (on this device / in this context)',
                );
                //return false
              case RESULTS.DENIED:
                console.log(
                  'The permission has not been requested / is denied but requestable',
                );
                if(result.GRANTED){
                  return true
                }else{
                  return false
                }
              case RESULTS.GRANTED:
                console.log('The permission is granted');
                this.setState({ permissionsGranted: true });
                return true
              case RESULTS.BLOCKED:
                console.log('The permission is denied and not requestable anymore');
                if(result.GRANTED){
                  return true
                }else{
                  return false
                }
            }
          })
          .catch((error) => {
            // …
            console.log(error)
          });
          //this.setState({ permissionsGranted: true });
        }
      }

      sendToGroupChats(circle_id){
        var text = `${this.state.user_name} has activated SOS mode.`
        // current user object
        user = {
          name: this.state.user_name,
          id: this.state.user_id,
          avatar: this.state.profile_pic_url,
        }
        const message = {
          text,
          user,
          timestamp: firebase.database.ServerValue.TIMESTAMP,
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
                title: "ICE - SOS",
                msg: `${this.state.user_name} has activated SOS mode.`,
                screen: "ActivityLogsScreen", //to direct the user to when they click on it 
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
              title: "ICE - SOS",
              msg: `${this.state.user_name} has activated SOS mode.`,
              screen: "ActivityLogsScreen", //to direct the user to when they click on it 
              time: firebase.database.ServerValue.TIMESTAMP
            }
            firebase.database().ref(`notifications/${owner_id}`).push(notification)
            firebase.database().ref(`notification_feed/${owner_id}`).push(notification)
            for(var j = 0; i < Object.keys(members_ids.val()).length; i++ ) {
              member_id = Object.keys(members_ids.val())[j]
              notification = {
                sender_id: this.state.userId,
                title: "ICE - SOS",
                msg: `${this.state.user_name} has activated SOS mode.`,
                screen: "ActivityLogsScreen", //to direct the user to when they click on it 
                time: firebase.database.ServerValue.TIMESTAMP
            }
            firebase.database().ref(`notifications/${member_id}`).push(notification)
            firebase.database().ref(`notification_feed/${member_id}`).push(notification)
            }
           }
        }
      }
    
      async componentDidMount() {
       // var userId = firebase.auth().currentUser.uid;
       const user_first_name = await firebase.database().ref(`users/${this.state.userId}/first_name`).once('value');
       const user_last_name = await firebase.database().ref(`users/${this.state.userId}/last_name`).once('value');
       const profile_pic_url = await firebase.database().ref(`users/${this.state.userId}/profile_pic_url`).once('value');
       var user_name = user_first_name.val() + " " + user_last_name.val()
       this.setState({user_name, profile_pic_url:profile_pic_url.val()})

       // update mode

        firebase.database().ref(`users/${this.state.userId}`).update(
          {
            mode: "SOS"
          }
            );

        // get all of that users circles(personal and others) & send an notification.

        this.getCircles()
        this.getOtherCircles()
    
        //create a new key for this SOS session in the database which will correspond to the name in storage...

        let session_id = firebase.database().ref(`SOS/`).child(`${this.state.userId}`).child('sessions').push().key;
        let recordingName = session_id
        this.setState({session_id,recordingName})
        this._requestPermissions()
        
        if(this.state.permissionsGranted){
          if(this.camera){
            this.setState(
              { recording: true, processing: false, preview: false, uri: null, codec: null },
              this.startRecording.bind(this)
            )
          }
        }
  }

  triggerRecording = () => {
    // this.camera.refreshAuthorizationStatus()
    if(this.camera){
      this.setState(
        { recording: true, processing: false, preview: false, uri: null, codec: null },
        this.startRecording.bind(this)
      )
     }
    // }else{
    //   console.log("his.camera.state",this.camera.status)
    //   // {"isAuthorizationChecked": false, "isAuthorized": false, "recordAudioPermissionStatus": "PENDING_AUTHORIZATION"}
    // }
  }


    componentWillUnmount(){
        firebase.database().ref(`users/${this.state.userId}`).update({
            mode: "normal",});
    }
    
    encrypt_password = () => {
      var temp = Base64.encode(this.state.password);
      this.setState({ encrypted_password: temp.toString() });
    }
    
    checkPasswordIsCorrect(){
        // encrypt the password
      this.encrypt_password()
      var user_id = firebase.auth().currentUser.uid;
      // retrieve the password from FB
      firebase.database()
      .ref(`users/${user_id}/password`)
      .once('value')
      .then(snapshot => {
      if(JSON.stringify(this.state.encrypted_password) === JSON.stringify(snapshot)){
        // the inputted password matches
        this.props.navigation.navigate("HomeScreen")
      }
      else{
        console.log("Password Incorrect")
        Alert.alert("Password incorrect please try again")  
      }
      })
    }

    startRecording = () => {
      setTimeout(async () => {
        try{
          const options = {
            maxDuration: 4,
          }

          const { uri, codec = 'mp4' } = await this.camera.recordAsync(options);
          // / Preview
          this.setState({ recording: false, processing: true });
          const type = `video/${codec}`;
          const data = new FormData();
          data.append("video", {
            name: "mobile-video-upload",
            type,
            uri
          });
          this.setState({ processing: false });
          this.uploadVideo(uri);
        } catch (e) {
          // ignore
        }
      }, 50)
    }

    getDownableURL = () => {
      // TODO: the video is too slow to upload in time.
      //Add the downloadableURL to users database for easy access later on
      //Make call to firebase storage to get the resulting URL for SOS video
      firebase.storage().ref(`SOS/${this.state.userId}/${this.state.recordingName}.MP4`).getDownloadURL().then(function(url) {
        // save URL to database
        firebase.database().ref(`SOS/${user_id}/sessions/${this.state.session_id}`).update({
          SOS_video_url: url,
          timestamp: firebase.database.ServerValue.TIMESTAMP,
      });
    });
    }
  
    uploadVideo(uri) {
      var uploadUri = Platform.OS === 'ios' ? uri.replace('file://', '') : uri
      //adding MP4 extension so that file can be downloaded & watched (required for ios)
      Promise.resolve(storage().ref('SOS/').child(`${this.state.userId}`).child(`${this.state.recordingName}.MP4`).putFile(uploadUri))
      //get the downloadable URI & push to database
      }

     checkPasswordIsCorrect(){
        // encrypt the password
      this.encrypt_password();
      // retrieve the password from FB
      firebase.database()
      .ref(`users/${this.state.userId}/password`)
      .once('value')
      .then(snapshot => {
      if(JSON.stringify(this.state.encrypted_password) === JSON.stringify(snapshot)){
        // the inputted password matches
        firebase.database().ref(`SOS/${this.state.userId}/sessions/${this.state.session_id}`).update({
          timestamp: firebase.database.ServerValue.TIMESTAMP,
        });
        this.camera.stopRecording();
        this.setState({overlayVisible:false})
        this.props.navigation.navigate("HomeScreen")
      }
      else{
        console.log("Password Incorrect")
        Alert.alert("Password incorrect please try again")  
      }
      })
    }

    render(){

        return (
          <View style = {styles.container}>

          <Overlay isVisible={this.state.overlayVisible}
          onBackdropPress={()=>{this.setState({overlayVisible:false})}}
                width={"100%"}
                height={Dimensions.get("window").height/3}
                onBackdropPress={() => this.setState({ overlayVisible: false })}>
          <View style={styles.mainContainer}>
          <View style={{flex:6, flexDirection:"column",justifyContent: 'center'}}>
          <Text style={{alignSelf:"center",marginTop:10, color:"black",fontFamily:"Roboto"}} h4>Enter password to exit SOS</Text>
          <Divider style={{ backgroundColor: '#0EA8BE',marginTop:10 }} />
          <TextInput placeholder="Password" 
          style={styles.inputStyle}
          value={this.state.password}
          placeholder={"Enter password here"}
          placeholderTextColor={"white"}
          secureTextEntry={this.state.passwordHidden}
          onChangeText={password => { this.setState({ password })}}/>
          <Button
                  onPress={()=>{this.checkPasswordIsCorrect()}}
                  style={{width:"50%", height:40, alignSelf:"center", alignContent:"center", marginTop:15}}
                  title="DEACTIVATE"
                  type="outline"
                  titleStyle={{color:"#0EA8BE",fontFamily:"Roboto"}}
                  buttonStyle={{borderColor:"#0EA8BE"}}
                  accessibilityLabel="Cancel SOS" />
          </View>
          </View>
          </Overlay>
              {/* <BlinkView blinking={true} delay={200}>
               <Text style={styles.appText}>SOS ACTIVATED</Text>
              </BlinkView> */}
          <View style={styles.container}>
          {/* <View style={styles.watcher}>
          <BlinkView blinking={true} delay={200}>
               <Text style={styles.memberName}>SOS ACTIVATED</Text>
               </BlinkView>
          </View> */}

       { this.state.permissionsGranted ?
          <RNCamera
             ref={ref => {
              this.camera = ref;
            }}
            style={styles.preview}
            type={RNCamera.Constants.Type.back}
            flashMode={RNCamera.Constants.FlashMode.on}
            // onStatusChange={this.onCameraStatusChange}
            // onCameraReady={this.onCameraReady}
            androidCameraPermissionOptions={{
              title: 'Permission to use camera',
              message: 'We need your permission to use your camera',
              buttonPositive: 'Ok',
              buttonNegative: 'Cancel',
            }}
            androidRecordAudioPermissionOptions={{
              title: 'Permission to use audio recording',
              message: 'We need your permission to use your audio',
              buttonPositive: 'Ok',
              buttonNegative: 'Cancel',
            }}
          >
          </RNCamera> :
              <Text style={{fontSize:30,textAlign: 'center'}}>Camera permissions not granted</Text>
          }
        </View>
{/*         
              <BlinkView blinking={true} delay={200}>
               <Text style = {styles.appText}>SOS ACTIVATED</Text>
               </BlinkView>
               {this.state.isHidden ?
            <TextInput placeholder="Password" style={styles.inputStyle} value={this.state.password}  secureTextEntry={this.state.passwordHidden}
            onChangeText={password => { this.setState({ password })}}/>
             : null}
            <StyledButton 
                  onPress={this.onPress}
                  text="DEACTIVATE"
                  justifyContent = "center"
                  color="#80e8f6"
                  accessibilityLabel="Cancel SOS" /> */}
          <View style={styles.SOSbutton} >
            <TouchableWithoutFeedback onPress={()=>this.setState({overlayVisible:true})} >
             <View style={[styles.button, styles.actionBtn]}>
                <Text style = {styles.text} >STOP</Text>
              </View>
            </TouchableWithoutFeedback>      
            </View>
          </View>
        );
    }
  }
  

const styles = StyleSheet.create({
    container : {
        // flex: 1,
        // //flexDirection: 'column',
        // backgroundColor: '#E5554C',
        // justifyContent: "center",
        // alignItems: 'center',
        flex: 1,
        width: "100%",
     },
     preview: {
      flex: 1,
      justifyContent: "flex-end",
      alignItems: "center"
    },
    capture: {
      flex: 0,
      backgroundColor: "#fff",
      borderRadius: 5,
      padding: 15,
      paddingHorizontal: 20,
      alignSelf: "center",
      margin: 20
    },
    SOSbutton: {
      position: 'absolute',
      alignSelf: 'center',
      backgroundColor: '#EED5FD',
      width: 70,
      height: 70,
      borderRadius: 35,
      bottom: 35,
      zIndex: 10
    
    },
    contentContainer: {
      flex: 6,
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
    text: {color:"#FFF", justifyContent:'center'},
    app: {
        backgroundColor:"#012642",
        alignItems:"center",
        justifyContent:"center"
    }, bottomView: {
        justifyContent: 'flex-end',
        alignItems: 'center',
        position: 'absolute',
        bottom: 80,
        left: 55,
      },
      topview: {
         justifyContent: 'flex-start',
          alignItems: 'center',
          position: 'absolute',
          width: '100%'
          
        },
      inputStyle: {
        marginTop: 20,
        alignContent:"center",
        alignSelf:"center",
        width: 300,
        height: 40,
        paddingHorizontal: 10,
        borderRadius: 50,
        backgroundColor: '#DCDCDC',
      },
    appText :{
        color:"#fff",
        fontSize:45,
        paddingBottom: 60,
    },
    mainContainer: {
      flex: 1,
      backgroundColor: '#FFF',
      height: 34
   },
   contentContainer: {
    flex: 6,
  },
});
export default withNavigation(SOSActivated)