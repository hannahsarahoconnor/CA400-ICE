import React, {Component} from 'react';
import {View, StyleSheet, Dimensions, Image, Modal, Text, TouchableOpacity, TouchableHighlight, Alert} from 'react-native';
import firebase from '@react-native-firebase/app';
import '@react-native-firebase/auth';
import '@react-native-firebase/database';
import { GiftedChat } from 'react-native-gifted-chat';
import Icon from 'react-native-vector-icons/MaterialIcons';
import StyledButton  from '../UIcomponents/StyledButton';
import { Header, Button } from 'react-native-elements';
import TimePicker from 'react-native-simple-time-picker'
import { Vibration} from 'react-native'
import { Kaede, Madoka, Hoshi, Jiro } from 'react-native-textinput-effects';
import InCallManager from 'react-native-incall-manager';
import DatePicker from 'react-native-date-picker'
import { ImageBackground } from 'react-native';
import {withNavigation} from 'react-navigation'
import Sound from 'react-native-sound';
import { AudioRecorder, AudioUtils } from 'react-native-audio';
import BackgroundTimer from 'react-native-background-timer';
import moment from "moment";
import storage from '@react-native-firebase/storage';
import SoundPlayer from 'react-native-sound-player';
import PushNotification from 'react-native-push-notification';
import FontAwesomeIcon from 'react-native-vector-icons/FontAwesome';
import { Fumi } from 'react-native-textinput-effects';

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

class FakeCall extends Component{

    constructor(props) {
        super(props);
        this.state = {isShown: false};
        this.state= {
            incomingCallModal: false,
            callSettingsModal: false,
            callWaiting: false,
            recordMessageModal: false,
            answeredCallModal: false,
            time: new Date(),
            newtime : '',
            recordedMessage: false,
            caller: 'Unknown',
            user_id: "QuO6SxPNCZbgGiyi4yGTrMktmV53",//firebase.auth().currentUser.uid,
            currentTime: 0.0,
            recording: false,
            paused: false,
            stoppedRecording: false,
            finished: false,
            audioPath: '',
            fileP: '',
            hasPermission: undefined,
            recordingName: '',  
            recognized: '',
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
    countdown = () => {
        //check if there was a time set if not activate call straight away
            var time = JSON.stringify(this.state.time)
            var hr = parseInt(time.slice(12, 14)) + 1
            var min = time.slice(15, 17)
            var sec = parseInt(time.slice(18, 20))
            const scheduledTime = moment().set('hour', hr).set("minute", min).set("second", sec)
            //find the difference between the current time and the time set for phonecall
            const diffTime = scheduledTime.diff(moment())
            if(diffTime > 1){
                this.setState({callWaiting : true})
            }
            //set a timer and play phonecall when times up
            this.timeoutId = BackgroundTimer.setTimeout(() => {
              this.setState({callSettingsModal: false})
              this.setState({callWaiting: false})
               {this.props.navigation.navigate("AnswerCall", {caller: this.state.caller})}
            }, diffTime);
      
    }


      TogggleCallSettingsModal = () => {
        this.setState({time: new Date()})
        this.setState({ callSettingsModal: !this.state.callSettingsModal});
      }

      ToggleRecordModal = () => {
        this.setState({recordMessageModal: !this.state.recordMessageModal});
      }

    prepareRecordingPath(audioPath){
        AudioRecorder.prepareRecordingAtPath(audioPath, {
          SampleRate: 22050,
          Channels: 1,
          AudioQuality: "Low",
          AudioEncoding: "aac",
          AudioEncodingBitRate: 32000
        });
      }

      componentDidMount() {
       // this.notificationListener()
        AudioRecorder.requestAuthorization().then((isAuthorised) => {
          this.setState({ hasPermission: isAuthorised });
  
          if (!isAuthorised) return;
            this.recname = (this.state.user_id + '.aac')
            this.setState({recordingName : this.recname})
            this.setState({audioPath: AudioUtils.DocumentDirectoryPath + '/' + this.state.recordingName});

            this.prepareRecordingPath(this.state.audioPath);
            
            AudioRecorder.onProgress = (data) => {
            this.setState({currentTime: Math.floor(data.currentTime)});
          };
  
          AudioRecorder.onFinished = (data) => {
            // Android callback comes in the form of a promise instead.
            if (Platform.OS === 'ios') {
              this._finishRecording(data.status === "OK", data.audioFileURL, data.audioFileSize);
            }
          };
        });
      }
      _renderButton(title, onPress, active) {
        var style = (active) ? styles.activeButtonText : styles.buttonText;
  
        return (
          <TouchableHighlight style={styles.button} onPress={onPress}>
            <Text style={style}>
              {title}
            </Text>
          </TouchableHighlight>
        );
      }
  
      _renderPauseButton(onPress, active) {
        var style = (active) ? styles.activeButtonText : styles.buttonText;
        var title = this.state.paused ? "RESUME" : "PAUSE";
        return (
          <TouchableHighlight style={styles.button} onPress={onPress}>
            <Text style={style}>
              {title}
            </Text>
          </TouchableHighlight>
        );
      }
  
      async _pause() {
        if (!this.state.recording) {
          console.warn('Can\'t pause, not recording!');
          return;
        }
  
        try {
          const filePath = await AudioRecorder.pauseRecording();
          this.setState({paused: true});
        } catch (error) {
          console.error(error);
        }
      }
  
      async _resume() {
        if (!this.state.paused) {
          console.warn('Can\'t resume, not paused!');
          return;
        }
  
        try {
          await AudioRecorder.resumeRecording();
          this.setState({paused: false});
        } catch (error) {
          console.error(error);
        }
      }
  
      async _stop() {
        if (!this.state.recording) {
          console.warn('Can\'t stop, not recording!');
          return;
        }
  
        this.setState({stoppedRecording: true, recording: false, paused: false});
  
        try {
          const filePath = await AudioRecorder.stopRecording();
  
          if (Platform.OS === 'android') {
            this._finishRecording(true, filePath);
          }
          return filePath;
        } catch (error) {
          console.error(error);
        }
      }
  
      async _play() {
        if (this.state.recording) {
          await this._stop();
        }
        setTimeout(() => {
          var sound = new Sound(this.state.audioPath, '', (error) => {
            if (error) {
              console.log('failed to load the sound', error);
            }
          });
  
          setTimeout(() => {
            sound.play((success) => {
              if (success) {
                console.log('successfully finished playing');
              } else {
                console.log('playback failed due to audio decoding errors');
              }
            });
          }, 100);
        }, 100);
      }
  
      async _record() {
        if (this.state.recording) {
          console.warn('Already recording!');
          return;
        }
  
        if (!this.state.hasPermission) {
          console.warn('Can\'t record, no permission granted!');
          return;
        }
  
        if(this.state.stoppedRecording){
          this.prepareRecordingPath(this.state.audioPath);
        }
  
        this.setState({recording: true, paused: false});
  
        try {
          await AudioRecorder.startRecording();
        } catch (error) {
          console.error(error);
        }
      }
  
      _finishRecording(didSucceed, filePath, fileSize) {
        this.setState({fileP : filePath})
        this.setState({ finished: didSucceed });
        console.log(`Finished recording of duration ${this.state.currentTime} seconds at path: ${filePath} and size of ${fileSize || 0} bytes`);
      }

      SaveRecording(){
        if(this.state.currentTime !== 0.0){
          var userId = firebase.auth().currentUser.uid;
          Promise.resolve(storage().ref('FakeCallRecordings/').child(userId).putFile(this.state.audioPath))
          Alert.alert("Recording saved successfuly")
          console.log(this.state.audioPath)
          this.ToggleRecordModal()
        }
        else{
          Alert.alert("No recording recognised please try again")

        }
        
      }
      

    render() {
        return (
         <View style={styles.mainContainer}>
          <Header
            backgroundColor="#0EA8BE"
            leftComponent={<Icon name="keyboard-backspace" color='#fff' size={23} style={{padding:5}} onPress={() => this.props.navigation.goBack()}/>}
            centerComponent={{ text: `Fake Call`, style: { color: '#fff', fontFamily:"Roboto" } }}
            rightComponent={<Icon name="more-vert" color='#fff' size={23} style={{padding:5}}/>}
            />
            
            <View style={styles.contentContainer}>
                <Text style={{fontFamily:"Roboto", textAlign:"center"}}>Get Started by clicking the 'Activate Call' button below. Alternatively, you can also pre-record a message through first clicking on 'Record Message'.</Text>
                <View style={{flexDirection:"column", justifyContent: "space-evenly", alignContent: "center" }}>
                          
                 <Button 
                buttonStyle={{ 
                  borderRadius:20,
                  //borderWidth:1,
                  borderColor: "#0EA8BE",
                  padding: 5,
                  justifyContent:"center",
                  alignSelf:"center",
                  height: 50,
                  marginBottom:10,
                  width: 300,}}
                  type="outline"
                  accessibilityLabel="Click this record message for fake call"
                  titleStyle={ { color: "#0EA8BE",
                  fontSize: 20,
                  fontFamily: 'Roboto',
                  alignSelf: "center",
              }}
                title="Record Message" style={{width:"50%",alignSelf:"center"}} onPress={
                  ()=>{
                    this.ToggleRecordModal()
                  }}
                  />
                    
                  
                    </View>
                    
                    <View style={{flexDirection:"column", justifyContent: "space-evenly", alignContent: "center" }}>
{/*                 
                <StyledButton
                    onPress={() => this.TogggleCallSettingsModal()}
                    color="#f00"
                    accessibilityLabel="Click this button to activate fake call" 
                    text="ActivateCall" /> */}
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
                    accessibilityLabel="Click this button to activate fake call"
                    titleStyle={ { color: "#f00",
                    fontSize: 20,
                    fontFamily: 'Roboto',
                    alignSelf: "center",
                }}
                  title="Activate Call" style={{width:"50%",alignSelf:"center"}} onPress={
                    ()=>{
                      this.TogggleCallSettingsModal()
                    }}
                    />
                    
                </View>
                
                <Modal
                    animationOutTiming={1000}
                    animationType='fade'
                    animationOut={'slideOutUp'}
                    animationIn={'slideOutUp'}
                    visible={this.state.callSettingsModal}
                    >
                    <View style={{flex: 1, backgroundColor: '#F5FCFF'}}>
                    <View style={{justifyContent:"center", flex:6, flexDirection:"column"}}>
                    <Fumi
                      label={'Caller Name'}
                      iconClass={FontAwesomeIcon}
                      iconName={'phone'}
                      iconColor={'#80e8f6'}
                      iconSize={20}
                      labelStyle={{fontFamily:"Roboto"}}
                      inputStyle={{fontFamily:"Roboto"}}
                      iconWidth={30}
                      maxLength={50}
                      // height={(Dimensions.get("window").height/15)}
                    // inputPadding={16}
                      onChangeText={caller => {
                      this.setState({ caller })
                      }}
                      editable={this.state.returnedResult ? false : true}
                      //maxLength={6}
                      style={{marginTop:5}}
                    />
                    <View style={{padding: 30, justifyContent:"center"}}>
                    <Text style={{fontFamily:"Roboto", textAlign:"center"}} >Select time of call</Text>
                    <DatePicker
                    style={{justifyContent:"center", alignSelf:"center"}}
                    date={this.state.time}
                    mode="time"
                    onDateChange={time => {this.setState({time})}}
                    />
                    </View>
                    <View style = {{justifyContent:'flex-end', alignSelf: 'center'}}>
                    <Button 
                    buttonStyle={{ 
                      borderRadius:20,
                      //borderWidth:1,
                      borderColor: "#0EA8BE",
                      padding: 5,
                      justifyContent:"center",
                      alignSelf:"center",
                      height: 50,
                      
                      width: 300,}}
                      type="outline"
                      accessibilityLabel="Click this button to activate fake call"
                      titleStyle={ { color: "#0EA8BE",
                      fontSize: 20,
                      fontFamily: 'Roboto',
                      alignSelf: "center",
                  }}
                    title="Activate Call" style={{width:"50%",alignSelf:"center", marginTop:5}} onPress={
                      ()=>{
                        this.countdown()
                      }}
                    />
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
                      accessibilityLabel="Click this button to cancel fake call setup"
                      titleStyle={ { color: "#f00",
                      fontSize: 20,
                      fontFamily: 'Roboto',
                      alignSelf: "center",
                  }}
                    title="Cancel" style={{width:"50%",alignSelf:"center", marginTop:5}} onPress={
                      ()=>{
                        this.TogggleCallSettingsModal()
                      }}
                    />
                    </View>
                    
                    </View>
                    
                    </View>

                </Modal>
                <Modal
                    animationOutTiming={1000}
                    animationType='fade'
                    animationOut={'slideOutUp'}
                    animationIn={'slideOutUp'}
                    visible={this.state.callWaiting}
                    >
                    <View style={{flex: 1, backgroundColor: '#000000'}}>
                      
                    
                    </View>

                </Modal>
                <Modal
                    animationOutTiming={1000}
                    animationType='fade'
                    animationOut={'slideOutUp'}
                    animationIn={'slideOutUp'}
                    visible={this.state.recordMessageModal}
                    >
                    <View style={{flex: 1, backgroundColor: '#F5FCFF'}}>
                        <View style={styles.Recordcontainer}>
                    
                    <View style={styles.controls}>
                        {this._renderButton("RECORD", () => {this._record()}, this.state.recording )}
                        {this._renderButton("PLAY", () => {this._play()} )}
                        {this._renderButton("STOP", () => {this._stop()} )}
                        {this._renderPauseButton(() => {this.state.paused ? this._resume() : this._pause()})}
                        <Text style={styles.progressText}>{this.state.currentTime}s</Text>
                    </View>
                    </View>
                   
                    
                    <View style = {{justifyContent:'flex-end', alignSelf: 'center'}}>

                    <Button 
                    buttonStyle={{ 
                      borderRadius:20,
                      //borderWidth:1,
                      borderColor: "#0EA8BE",
                      padding: 5,
                      justifyContent:"center",
                      alignSelf:"center",
                      height: 50,
                      marginBottom:10,
                      width: 300,}}
                      type="outline"
                      accessibilityLabel="Click this button to save recording fake call message"
                      titleStyle={ { color: "#0EA8BE",
                      fontSize: 20,
                      fontFamily: 'Roboto',
                      alignSelf: "center",
                  }}
                    title="Save" style={{width:"50%",alignSelf:"center", marginTop:5}} onPress={
                      ()=>{
                        this.SaveRecording()
                      }}
                    />
                    </View>
                    </View>
                    <View style = {{justifyContent:'flex-end', alignSelf: 'center',}}>
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
                      accessibilityLabel="Click this button to cancel recording fake call message"
                      titleStyle={ { color: "#f00",
                      fontSize: 20,
                      fontFamily: 'Roboto',
                      alignSelf: "center",
                  }}
                    title="Cancel" style={{width:"50%",alignSelf:"center"}} onPress={
                      ()=>{
                        this.ToggleRecordModal()
                      }}
                    />
                    </View>
                    
                  

                </Modal>


            </View>
            </View>
            
        )
}
}
const styles = StyleSheet.create({
    mainContainer: {
        flex: 1,
        flexDirection: 'column',
        justifyContent: "center",
        alignItems: 'center',
       backgroundColor: '#F5FCFF',
     
    },
    container: {
        flex: 1,
        backgroundColor: '#fff',
      },
      input: {
        paddingRight: 10,
        lineHeight: 23,
        flex: 2,
        textAlignVertical: 'top'
    },
    contentContainer: {
        flex: 6,
        flexDirection: 'column',
        justifyContent: 'space-evenly',
        alignContent: 'center'
      },
      instructions: {
        fontSize: 40,
        textAlign: 'center',
        margin: 10,
        fontWeight: 'bold',
        color: "#2F6276", 
        paddingTop: 20
        },
      headerText: {
        fontSize: 40,
        textAlign: 'center',
        margin: 10,
        color: "#fff", 
        paddingTop: 20
        },
        subHeader: {
            fontSize: 20,
            textAlign: 'center',
            margin: 5,
            fontFamily:"Roboto",
            color: "#0EA8BE",
            paddingTop: 0, 
       
        },
        imageText: {
            fontSize: 15,
            textAlign: 'center',
            margin: 5,
            color: "#fff",
            paddingTop: 0, 
       
        },

        ImageIconStyle: {
            padding: 40,
            borderWidth: 5,
            justifyContent: "center",
            alignSelf: "center",
            borderColor: '#2F6276',
            alignContent: "center",
            borderRadius: 10,
            margin: 5,
            height: 120,
            width: 120,
          },
          controls: {
            fontFamily: "Roboto",
            justifyContent: 'center',
            alignItems: 'center',
            flex: 1,
          },
          progressText: {
            paddingTop: 40,
            fontSize: 45,
            color: "#fff",
            fontFamily:"Roboto"
          },
          button: {
            padding: 20
          },
          disabledButtonText: {
            color: '#eee'
          },
          buttonText: {
            fontSize: 20,
            color: "#fff",
            fontFamily:"Roboto"
          },
          activeButtonText: {
            fontSize: 20,
            color: "#B81F00"
          },
          Recordcontainer: {
            flex: 1,
            backgroundColor: "#0EA8BE",
          },
      
  });
  export default withNavigation(FakeCall);
  