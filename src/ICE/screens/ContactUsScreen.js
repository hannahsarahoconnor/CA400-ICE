import React, { Component } from 'react';
import { ScrollView, Share, StyleSheet, TouchableHighlight, View, Modal, Platform, Alert, Dimensions } from 'react-native';
import { Button, Avatar, ListItem, SearchBar, Text, Header} from 'react-native-elements';
import Icon from 'react-native-vector-icons/MaterialIcons';
import firebase from '@react-native-firebase/app';
import ImagePicker from 'react-native-image-picker';
import '@react-native-firebase/auth';
import '@react-native-firebase/database';
import t from 'tcomb-form-native';
import FontAwesomeIcon from 'react-native-vector-icons/FontAwesome';
import storage from '@react-native-firebase/storage';
import PushNotification from 'react-native-push-notification';
import LinearGradient from 'react-native-linear-gradient';
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

const FireBaseStorage = storage();

const imagePickerOptions = {
    noData: true,
  };

//determine the path name if it is android or ios 
const getFileLocalPath = response => {
  //android is path and ios is uri 
  const { path, uri } = response;
  return Platform.OS === 'android' ? path : uri;
};

const createStorageReferenceToFile = name => {
  var userId = firebase.auth().currentUser.uid;
  return FireBaseStorage.ref(`contact_us/${userId}/${name}`);
};

//get both the path and storage together
const uploadFileToFireBase = (imagePickerResponse,name) => {
  const fileSource = getFileLocalPath(imagePickerResponse);
  const storageRef = createStorageReferenceToFile(name);
  return storageRef.putFile(fileSource);
};

const Form = t.form.Form;
var _ = require('lodash');
const stylesheetMessage = _.cloneDeep(t.form.Form.stylesheet);
const stylesheet= _.cloneDeep(t.form.Form.stylesheet);

const information = t.struct({
  subject: t.maybe(t.String),
  message: t.String,
  //terms: t.Boolean
});

// form styling
stylesheetMessage.textbox.normal.height = 100
stylesheet.formGroup.normal.marginTop = 15

const options = {
    stylesheet: stylesheet,
    fields: {
      message: {
        editable: true,
        error: ' * Please enter a message',
        multiline: true,
        stylesheet: stylesheetMessage,
      },
      subject: {
        editable: true,
      }
    },
  };

export default class ContactUsScreen extends Component {

    constructor(props){
        super(props);
        this.state = {
            userId: firebase.auth().currentUser.uid,
            user_name: '',
            ImageSource: null,
            contact_key: '',
            response: '',
            value: {},
            url: ''
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
      
                firebase.database().ref(`notifications/${this.state.userId}/${id}`).remove()
        })
     }

    async componentWillMount(){
        // get unique key for this case
        this.notificationListener()
        let contact_key = firebase.database().ref(`contact_us/${this.state.userId}/`).push().key; 
        this.setState({contact_key});
        //get user name
        const user_name = await firebase.database().ref(`users/${this.state.userId}/first_name`).once('value')
        this.setState({user_name:user_name.val()})
    }


    async handleSubmit(){
        // this automatically handles empty fields by showing red.
        const value = this.refs.form.getValue();
        var has_image = false;
        if(value.message !== null){
          // if theres an attached image upload it to storage and the url to db
          if(this.state.ImageSource !== null){
            has_image = true
            console.log(getFileLocalPath(this.state.response));
            Promise.resolve(uploadFileToFireBase(this.state.response,this.state.contact_key));
           //this.getDownableURL();
          }
          // push to database

          firebase.database().ref(`contact_us/${this.state.userId}/${this.state.contact_key}`).update({
            message: value.message,
            subject: value.subject,
            image: has_image,
        });

        Alert.alert(
            "ICE",
            "Your request has been sent. Please check your inbox for a response with the next few days.",
            [
              { text: "OK", onPress: () => this.props.navigation.goBack() }
            ],
            { cancelable: false }
          );
        }

        }

    // async getDownableURL(){
    //     const storageRef = FireBaseStorage.ref(`contact_us/${this.state.userId}/${this.state.contact_key}`)
    //     const url = await storageRef.getDownloadURL();
    //     console.log("url",url)
    //     this.setState({url})
    // }


    uploadPicture() {
        const options = {
          quality: 1.0,
          maxWidth: 500,
          maxHeight: 500,
          storageOptions: {
            skipBackup: true
          }
        };
    
        ImagePicker.showImagePicker(options, (response) => {
          console.log('Response = ', response);
    
          if (response.didCancel) {
            console.log('User cancelled photo picker');
          }
          else if (response.error) {
            console.log('ImagePicker Error: ', response.error);
          }
          else if (response.customButton) {
            console.log('User tapped custom button: ', response.customButton);
          }
          else {
            let source = { uri: response.uri };
            this.setState({
              ImageSource: source,
              response
            });
          }
        });
      }

      onChange(value) {
     
        this.setState({value: value});
       }

      render() {
        return (
          <View style={styles.mainContainer}>
  <Header
                backgroundColor="#0EA8BE"
                leftComponent={<Icon name="keyboard-backspace" color='#fff' size={23} style={{padding:5}} onPress={() => {this.state.edit_mode ? this.setState({edit_mode:false}) : this.props.navigation.goBack()}} />}
                centerComponent={<Text style={{alignSelf:"center",marginTop:10, fontFamily:"Roboto", color:'white', fontSize:20, fontWeight:"300"}}>Contact Form</Text>}
                />
         
        <Text style={{color:"gray", textAlign:"center",marginTop:10 }}>{"Hi " + this.state.user_name + ",\n\n"
        + "We're sorry you're experiencing issues with ICE!\n"+
        "Please fill the form below & our team will get back to you as soon as possible.\n\nThank You. "}</Text>
             <Form
              ref={"form"}
              //style={{height:(Dimensions.get("window").height)/1.2}}
              style={{marginBottom:15}}
              options={options}
              value={this.state.value}
              onChange={(value) => this.setState({value})}
              type={information}/> 
              <Text style={{fontWeight:"500",fontSize:16}}>Attachments</Text>
              
              <Button
                title="Upload Image"
                type="outline"
                onPress={()=>{this.uploadPicture()}}
                titleStyle={{color:"gray"}}
                buttonStyle={{borderColor:"gray",marginTop: 5, borderRadius:3}}
                />
              
              {this.state.ImageSource !== null ? 
              <View style={{flexDirection:"row"}}>
              <Icon name="check-circle" color='green' size={23}/>
              <Text style={{fontSize:15,color:"green"}}>image successfully uploaded</Text> 
              </View>
              : null }
             {/* <TouchableHighlight style={styles.button} onPress={()=>{this.handleSubmit()}} underlayColor='#99d9f4'>
              <Text style={styles.buttonText}>Submit</Text>
            </TouchableHighlight> */}

            <Button
            send
                    buttonStyle={{ 
                        //borderRadius:20,
                        //borderWidth:1,
                       // borderColor: "#4277a7",
                        padding: 5,
                        justifyContent:"center",
                        alignSelf:"center",
                        height: 36,
                        marginTop:10,
                       // height: 70,
                        width: 250,}}
                        onPress={()=>{this.handleSubmit()}}
                    accessibilityLabel="Click this submit an issue to ICE developers"
                    titleStyle={ { color: "#0EA8BE",
                    fontSize: 20,
                    fontFamily: 'Roboto',
                    alignSelf: "center",
                    fontWeight: 'bold'}}
                    title="Submit"
                    //ViewComponent={LinearGradient}
                    type="outline"
                    // linearGradientProps={{
                    //     colors: ["#B6F1FA", "#80e8f6", '#0EA8BE'],
                    // }}
                    />
           <SOS/>
           <BottomNavBar />
        </View>
        )
    }
}

  const styles = StyleSheet.create({
    mainContainer: {
       flex: 1,
       backgroundColor: '#F9F7F6',
       justifyContent: 'flex-start',
       //height: 34
    },
    contentContainer: {
        flex: 1,
        justifyContent: 'flex-start',
        height:Dimensions.get("window").height,
        width: Dimensions.get("window").width
     },
     buttonText: {
        fontSize: 18,
        color: 'white',
        alignSelf: 'center'
      },
      button: {
        width: "60%",
        height: 36,
        backgroundColor: '#48BBEC',
        borderColor: '#48BBEC',
        borderWidth: 1,
        borderRadius: 8,
        marginTop: 10,
        marginBottom: 20,
        alignSelf: 'center',
        justifyContent: 'center'
    
      }

});