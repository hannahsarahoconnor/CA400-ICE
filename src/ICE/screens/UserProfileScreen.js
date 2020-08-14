import React, { Component } from 'react';
import {  View, StyleSheet, Alert, Dimensions, KeyboardAvoidingView, Keyboard, Platform, TouchableWithoutFeedback, TouchableOpacity, Image } from 'react-native';
import ProfilePicture from '../UIcomponents/ProfilePicture';
import BottomNavBar from '../UIcomponents/BottomNavNew';
import  SOS from '../UIcomponents/SOSbutton';
import Icon from 'react-native-vector-icons/MaterialIcons';
import {Header,Avatar, Button, Input, Text,Overlay, Tooltip} from 'react-native-elements';
import ImagePicker from 'react-native-image-picker';
import firebase from '@react-native-firebase/app';
import '@react-native-firebase/auth';
import '@react-native-firebase/database';
import storage from '@react-native-firebase/storage';
import { ScrollView } from 'react-native-gesture-handler';
import BottomSheet from 'reanimated-bottom-sheet'
import PushNotification from 'react-native-push-notification';
import FontAwesomeIcon from 'react-native-vector-icons/FontAwesome';
import { Fumi } from 'react-native-textinput-effects';
import Fontisto from 'react-native-vector-icons/Fontisto';
import LinearGradient from 'react-native-linear-gradient';

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

const createStorageReferenceToFile = response => {
  var userId = firebase.auth().currentUser.uid;
  return FireBaseStorage.ref('profile_pictures/'+ userId);
};

//get both the path and storage together
const uploadFileToFireBase = imagePickerResponse => {
  const fileSource = getFileLocalPath(imagePickerResponse);
  const storageRef = createStorageReferenceToFile(imagePickerResponse);
  return storageRef.putFile(fileSource);
};

export default class UserProfileScreen extends Component {

    constructor(props){
        super(props);
        this.state = { 
            ImageSource: null,
            safeword: '',
            userId: "O28vQIssPWbkjpXLu7qKKxfV7B33", //firebase.auth().currentUser.uid,
            editUserDetails: false,
            returnedResult: null,
            editMedicalInfo: false,
            safeZones: [],
            newPhoneNumber: '',
            visible: false,
            originalPhoneNumber: '',
            phoneNumber: '',
            profile_pic_url: '',
            has_medical: null,
            medicalData:[],
            show_medical: false,
            age: '',
            sex: '',
            allergies: '',
            blood_type: '',
            conditions: '',
            medication: '',
            doctor: '',
            kin: '',
            additional: '',
            show_options: false,
            latitude: 0,
            longitude: 0
        }

        this.notif = setupPushNotification(this.onRegister.bind(this), this.onNotif.bind(this), true);
    }

    bs = React.createRef()

    async componentWillMount(){
        //firebase.auth().signInWithPhoneNumber('+353870628798')
        this.notificationListener()
       
        const has_medical = await firebase.database().ref(`users/${this.state.userId}/medicalProfile`).once('value');
        const first_name = await firebase.database().ref(`users/${this.state.userId}/first_name`).once('value');
        const last_name = await firebase.database().ref(`users/${this.state.userId}/last_name`).once('value');
        var phone_number = "12345"//firebase.auth().currentUser.phoneNumber
        const pic_url = await firebase.database().ref(`users/${this.state.userId}/profile_pic_url`).once('value');
        const safeword = await firebase.database().ref(`users/${this.state.userId}/safe_word`).once('value');
        const latitude = await firebase.database().ref(`users/${this.state.userId}/latitude`).once('value');
        const longitude = await firebase.database().ref(`users/${this.state.userId}/longitude`).once('value');
        if(safeword.exists()){
          this.setState({safeword: safeword.val()})
        }
        const medicalData = await firebase.database().ref(`medical/${this.state.userId}`).once('value');
        this.setState({latitude: latitude.val(),longitude: longitude.val(), medicalData: medicalData.val(),has_medical:has_medical.val(),profile_pic_url:pic_url.val(),first_name:first_name.val(),last_name:last_name.val(),phoneNumber:phone_number, originalPhoneNumber:phone_number})
        this.getSafeZones()
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


    async getSafeZones() {
   
        const snapshot = await firebase.database().ref(`safeZones/`).child(`${this.state.userId}`).once('value');
        if(snapshot.val()){
            var values = snapshot.toJSON();
            var keys = Object.keys(values);
            const data = [
              ];
            for(var i = 0; i < keys.length; i++ ) {
              key = keys[i].toString()
              console.log("user",this.state.userId)
              const SafeZoneLat = await firebase.database().ref(`safeZones/${this.state.userId}/${key}/latitude`).once('value');
              const SafeZoneLng = await firebase.database().ref(`safeZones/${this.state.userId}/${key}/longitude`).once('value');
              const SafeZoneLabel = await firebase.database().ref(`safeZones/${this.state.userId}/${key}/name`).once('value');
              const SafeZoneAddress = await firebase.database().ref(`safeZones/${this.state.userId}/${key}/address`).once('value');
              console.log(SafeZoneLabel)
      
              data.push({ description: SafeZoneLabel.val(), address: SafeZoneAddress.val(),id: key, lat: parseFloat(SafeZoneLat), lng: parseFloat(SafeZoneLng) });
            }
      
            console.log("data",data)
            this.setState({safeZones:data});
          }
       }

    async getDownableURL(){
      const storageRef = storage().ref(`profile_pictures/${this.state.userId}`)
      const url = await storageRef.getDownloadURL();
      console.log(url)
      //this.setState({audioPath: url})
      this.setState({profile_pic_url:url})
      firebase.database().ref(`users/${this.state.userId}`).update({
                profile_pic_url: url,
      });
  }


    async changePhoneNumber() {
        const snapshot = await firebase.auth().verifyPhoneNumber(this.state.newPhoneNumber).then(returnedResult => {
            this.setState({ returnedResult })
          })
          .catch(error => {
            alert('Firebase Auth Error:\n' + error.message)
            console.log(error)
          })

          console.log(this.state.returnedResult)
}

  checkNewcode() {
    const credential = firebase.auth.PhoneAuthProvider.credential(this.state.returnedResult.verificationId, this.state.code);
    firebase.auth().currentUser.updatePhoneNumber(credential)
    alert("number has been changed!")
  }

    async updateUserDetails() {
      if(this.state.newPhoneNumber !== this.state.originalPhoneNumber && this.state.newPhoneNumber !== ""){
        Alert.alert(
            "ICE",
            `Are you sure you want to change your phone number?`,
            [
              {
                text: "NO",
                onPress: () => {
                 console.log("cancel pressed")
                },
                style: "cancel"
              },
              { text: "YES", onPress: () => {
                  //remove from database
                 this.setState({visible:true})
                 this.changePhoneNumber()
              }  }
            ],
            { cancelable: false }
          );
       }
      const first_name = await firebase.database().ref(`users/${this.state.userId}/first_name`).once('value');
      const last_name = await firebase.database().ref(`users/${this.state.userId}/last_name`).once('value');
      if(first_name.val() !== this.state.first_name && this.state.first_name !== ""){
          // means it has been changed - update
          firebase.database().ref(`users/${this.state.userId}`).update({
              first_name: this.state.first_name
          })
      }

      if(last_name.val() !== this.state.last_name && this.state.last_name !== ""){
          // means it has been changed - update
          firebase.database().ref(`users/${this.state.userId}`).update({
            last_name: this.state.last_name
        })
      }
      // push to database
      // editUserDetails to false
      this.setState({editUserDetails:false})
    }


    updateMedicalData() {
      // push to database
      // editMedicalData to false 
      if(this.state.age !== this.state.medicalData.age && this.state.age !== ""){
        firebase.database().ref(`medical/${this.state.userId}`).update({
            age: this.state.age
        })
      }

      if(this.state.allergies !== this.state.medicalData.allergies && this.state.allergies !== ""){
        firebase.database().ref(`medical/${this.state.userId}`).update({
            allergies: this.state.allergies
        })
      }

      if(this.state.sex !== this.state.medicalData.sex && this.state.sex !== ""){
        firebase.database().ref(`medical/${this.state.userId}`).update({
            sex: this.state.sex
        })
      }

      if(this.state.conditions !== this.state.medicalData.conditions && this.state.conditions !== ""){
        firebase.database().ref(`medical/${this.state.userId}`).update({
            conditions: this.state.conditions
        })
      }

      if(this.state.medication !== this.state.medicalData.medication && this.state.medication !== ""){
        firebase.database().ref(`medical/${this.state.userId}`).update({
            medication: this.state.medication
        })
      }

      if(this.state.blood_type  !== this.state.medicalData.blood_type  && this.state.blood_type !== ""){
        firebase.database().ref(`medical/${this.state.userId}`).update({
            blood_type : this.state.blood_type 
        })
      }

      if(this.state.doctor !== this.state.medicalData.doctor_name && this.state.doctor !== ""){
        firebase.database().ref(`medical/${this.state.userId}`).update({
            doctor_name: this.state.doctor
        })
      }

      if(this.state.kin!== this.state.medicalData.kin && this.state.kin !== ""){
        firebase.database().ref(`medical/${this.state.userId}`).update({
            kin: this.state.kin
        })
      }
    }

    removeSafeZone(id,name) {
        Alert.alert(
            "ICE",
            `Are you sure you want to delete the safe zone ${name}?`,
            [
              {
                text: "NO",
                onPress: () => {
                 console.log("cancel pressed")
                },
                style: "cancel"
              },
              { text: "YES", onPress: () => {
                  //remove from database
                  firebase.database().ref(`safeZones/${this.state.userId}/${id}`).remove()
              }  }
            ],
            { cancelable: false }
          );

     }

      changeProfilePic() {
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
            console.log(getFileLocalPath(response));
            
            Promise.resolve(uploadFileToFireBase(response));
            this.getDownableURL();
            this.setState({
  
              ImageSource: source
  
            });
          }
        });
      }

  editUserData = () => {
        // TODO the option to see only appears when there is text entered
        this.setState({ editUserDetails: !this.state.editUserDetails });
   };
   editMedicalData = () => {
    // TODO the option to see only appears when there is text entered
    this.setState({ editMedicalInfo: !this.state.editMedicalInfo });
};

displayOptions = () => {
  this.setState({ show_options: !this.state.show_options });
};


renderInner = () => (
  <View style={styles.panel}>
    <TouchableOpacity style={styles.panelButton} onPress={()=>{this.props.navigation.navigate("ContactUsScreen")}}>
      <Text style={styles.panelButtonTitle}>Contact Us</Text>
    </TouchableOpacity>
  </View>
)

    
  
  render() {
    return (
      <View style={styles.mainContainer}>
      <Header
         backgroundColor="#0EA8BE"
         leftComponent={<Icon name="keyboard-backspace" color='#fff' size={23} style={{padding:5}} onPress={() => {this.props.navigation.goBack()}} />}
         centerComponent={<Text style={{alignSelf:"center",marginTop:10, color:'white',fontSize:20}}>Profile</Text>}
         rightComponent={<Icon name="more-vert" color='#fff' size={23} style={{padding:5}} onPress={() => this.bs.current.snapTo(0)} /> }/>
      <BottomSheet
          ref={this.bs}
          initialSnap={3}
          snapPoints={[5,10,150, 0]}
          renderContent={this.renderInner}
          enabledContentTapInteraction={true}
          enabledGestureInteraction={true}
        />

      <Overlay
        isVisible={this.state.show_medical}
         height={Dimensions.get("window").height}
         width={Dimensions.get("window").width}
                >
       <View style={styles.contentContainer}>

        <Header
          backgroundColor="#F9F7F6"
          style={{height:20}}
          leftComponent={ <Icon name="keyboard-backspace" color='black' size={23} style={{padding:5}} onPress={() => {this.setState({show_medical:false})}} />
          }
          centerComponent={<Text style={{fontFamily:"Roboto", fontSize:20, textAlign:"center", marginTop:5}}>Medical Profile</Text>}
          rightComponent={<Icon name="edit" color='black' size={23} style={{padding:5}} onPress={() => {this.props.navigation.goBack()}} />}
          />
      <KeyboardAvoidingView
            behavior={Platform.Os == "ios" ? "padding" : "height"}
            style={{flex:1}}
          >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <ScrollView>
        <Fumi
              label={'Sex'}
              iconClass={FontAwesomeIcon}
              iconName={'venus-mars'}
              iconColor={'#80e8f6'}
              iconSize={15}
              labelStyle={{fontFamily:"Roboto",marginBottom:20}}
              inputStyle={{fontFamily:"Roboto", fontSize:15}}
              iconWidth={30}
              height={(Dimensions.get("window").height/15)}
              style={{marginTop:5}}
              disabled={this.state.editMedicalInfo} value={!this.state.editMedicalInfo  ? this.state.medicalData.sex : null} onChangeText={sex => {
                this.setState({sex})}}

            />
      <Fumi
              label={'Date of birth'}
              iconClass={FontAwesomeIcon}
              iconName={'calendar-o'}
              iconColor={'#80e8f6'}
              iconSize={15}
              labelStyle={{fontFamily:"Roboto",marginBottom:20}}
              inputStyle={{fontFamily:"Roboto", fontSize:15}}
              iconWidth={30}
              height={(Dimensions.get("window").height/15)}
              disabled={this.state.editMedicalInfo} value={!this.state.editMedicalInfo  ? this.state.medicalData.dob : null} onChangeText={dob => {
                this.setState({dob})}}
              style={{marginTop:5}}
            />
      <Fumi
              label={'Doctor/Caretaker'}
              iconClass={FontAwesomeIcon}
              iconName={'user-md'}
              iconColor={'#80e8f6'}
              iconSize={15}
              multiline
              labelStyle={{fontFamily:"Roboto",marginBottom:20}}
              inputStyle={{fontFamily:"Roboto", fontSize:15}}
              iconWidth={30}
              height={(Dimensions.get("window").height/15)}
              disabled={this.state.editMedicalInfo} value={!this.state.editMedicalInfo ? this.state.medicalData.doctor_name : null} onChangeText={doctor => {
                this.setState({doctor})}}

              style={{marginTop:5}}
            />
      <Fumi
              label={'Next of kin'}
              iconClass={FontAwesomeIcon}
              iconName={'phone'}
              iconColor={'#80e8f6'}
              iconSize={15}
              labelStyle={{fontFamily:"Roboto",marginBottom:20}}
              inputStyle={{fontFamily:"Roboto", fontSize:15}}
              keyboardType='phone-pad'
              iconWidth={30}
              height={(Dimensions.get("window").height/15)}
            // inputPadding={16}
              disabled={this.state.editMedicalInfo} value={!this.state.editMedicalInfo  ? this.state.medicalData.kin : null} onChangeText={kin => {
              this.setState({kin})}}
              style={{marginTop:5}}
            />
        <Fumi
              label={'Blood type'}
              iconClass={Fontisto}
              iconName={'blood-drop'}
              iconColor={'#80e8f6'}
              iconSize={15}
              labelStyle={{fontFamily:"Roboto",marginBottom:20}}
              inputStyle={{fontFamily:"Roboto", fontSize:15}}
              iconWidth={30}
              height={(Dimensions.get("window").height/15)}
            // inputPadding={16}
              disabled={this.state.editMedicalInfo} value={!this.state.editMedicalInfo  ? this.state.medicalData.blood_type : null} onChangeText={blood_type => {
              this.setState({blood_type})}}
              style={{marginTop:5}}
            />
      <Fumi
              label={'Medication List'}
              iconClass={Fontisto}
              iconName={'pills'}
              iconColor={'#80e8f6'}
              iconSize={15}
              labelStyle={{fontFamily:"Roboto",marginBottom:20}}
              inputStyle={{fontFamily:"Roboto", fontSize:15}}
              iconWidth={30}
              height={(Dimensions.get("window").height/15)}
            // inputPadding={16}
              multiline={true} disabled={this.state.editMedicalInfo} value={!this.state.editMedicalInfo  ? this.state.medicalData.medication : null} onChangeText={medication => {
              this.setState({medication})}}

              style={{marginTop:5}}
            />
      <Fumi
              label={'Conditions'}
              iconClass={FontAwesomeIcon}
              iconName={'medkit'}
              iconColor={'#80e8f6'}
              iconSize={15}
              labelStyle={{fontFamily:"Roboto",marginBottom:20}}
              inputStyle={{fontFamily:"Roboto", fontSize:15}}
            // keyboardType='phone-pad'
              iconWidth={30}
              height={(Dimensions.get("window").height/15)}
              // inputPadding={16}
              multiline={true} disabled={this.state.editMedicalInfo} value={!this.state.editMedicalInfo  ? this.state.medicalData.conditions : null} onChangeText={conditions => {
              this.setState({conditions})}}
              style={{marginTop:5}}
            />
          {/* <View style={styles.bottomView}> */}
                {/* <Button
                    buttonStyle={{ 
                        borderWidth:1,
                        borderColor: "#0EA8BE",
                        marginTop:20,
                        justifyContent:"center",
                        alignSelf:"center",
                        borderRadius:20,
                        // marginBottom:50,
                        width: 250,}}
                    onPress={() => this.props.navigation.navigate('RegistrationScreen')}
                    accessibilityLabel="Click this button to register to ICE"
                    titleStyle={ { color: "#0EA8BE",
                    fontSize: 20,
                    fontFamily: 'Roboto',
                    alignSelf: "center",
                    }}
                    onPress={() => {
                      this.setState({clicked:true})
                      this.handleNewUser()
                    }
                    }
                    loading={this.state.clicked}
                    loadingStyle={{height:40}}
                    title="Save"
                    type="outline"
                    
                    titleStyle={{color:"#0EA8BE"}}
                  
                    /> */}
          {/* </View> */}
          </ScrollView>
        </TouchableWithoutFeedback>
        </KeyboardAvoidingView>
        </View>
        </Overlay>
      {/* <View>
            <Input
            labelStyle={{fontFamily:"Roboto"}} inputStyle={{fontFamily:"Roboto"}}
            label='Age' disabled={this.state.editMedicalInfo} value={!this.state.editMedicalInfo ? this.state.medicalData.age : null} onChangeText={age => {
                this.setState({age})}}/>
            <Input
            labelStyle={{fontFamily:"Roboto"}} inputStyle={{fontFamily:"Roboto"}}
            label='Sex' disabled={this.state.editMedicalInfo} value={!this.state.editMedicalInfo  ? this.state.medicalData.sex : null} onChangeText={sex => {
                this.setState({sex})}}/>
            <Input
            labelStyle={{fontFamily:"Roboto"}} inputStyle={{fontFamily:"Roboto"}}
            label='Allergies' multiline={true} disabled={this.state.editMedicalInfo} value={!this.state.editMedicalInfo ? this.state.medicalData.allergies : null} onChangeText={allergies => {
                this.setState({allergies})}}/>
            <Input
            labelStyle={{fontFamily:"Roboto"}} inputStyle={{fontFamily:"Roboto"}}
            label='Blood Type' disabled={this.state.editMedicalInfo} value={!this.state.editMedicalInfo  ? this.state.medicalData.blood_type : null} onChangeText={blood_type => {
                this.setState({blood_type})}}/>
            <Input
            labelStyle={{fontFamily:"Roboto"}} inputStyle={{fontFamily:"Roboto"}}
            label='Conditions' disabled={this.state.editMedicalInfo} value={!this.state.editMedicalInfo ? this.state.medicalData.doctor_name : null} onChangeText={conditions => {
                this.setState({conditions})}}/>
            <Input
            labelStyle={{fontFamily:"Roboto"}} inputStyle={{fontFamily:"Roboto"}}
            label='Medications' multiline={true} disabled={this.state.editMedicalInfo} value={!this.state.editMedicalInfo  ? this.state.medicalData.medication : null} onChangeText={medication => {
                this.setState({medication})}}/>
            <Input
            labelStyle={{fontFamily:"Roboto"}} inputStyle={{fontFamily:"Roboto"}}
            label='Doctor' disabled={this.state.editMedicalInfo} value={!this.state.editMedicalInfo ? this.state.medicalData.doctor_name : null} onChangeText={doctor => {
                this.setState({doctor})}}/>
            <Input
            labelStyle={{fontFamily:"Roboto"}} inputStyle={{fontFamily:"Roboto"}}
            label='Next of Kin' disabled={this.state.editMedicalInfo} value={!this.state.editMedicalInfo  ? this.state.medicalData.kin : null} onChangeText={kin => {
                this.setState({kin})}}/>
      </View> */}
      <Overlay isVisible={this.state.show_options}
      width={"50%"}
      overlayStyle={{alignSelf:"flex-end", position:"absolute", top:0, marginTop:Platform.OS === "ios" ? 35 : 0}}
      height={"30%"}>
         <Icon name="clear" color='black' onPress={() => this.displayOptions()} size={20} style={styles.clear}/>
      </Overlay>
      <Overlay isVisible={this.state.visible}
      width={"100%"}
      height={"50%"}>
      <View style={styles.mainContainer}>
      <View style={styles.contentContainer}>
      <Text style={{marginTop: 40, alignSelf:"center"}} h4>Change your Phone Number</Text>
      <Input
       label='Enter Code' value={this.state.code}
       onChangeText={code => {
         this.setState({ code})
       }} 
       disabled={false} >
       </Input>
      <Button title="Change" loading={this.state.clicked} style={{width:"50%",alignSelf:"center"}} onPress={
        ()=>{
          this.setState({visible:false})
          this.checkNewcode()
        }}
        />
      <Button
        title="Cancel"
        onPress={()=>{
          this.setState({visible:false})
          this.props.navigation.goBack()
        }}
        type="clear"
      />
      {/* </View> */}
      </View>
      </View>
      {/* </View> */}
    </Overlay>
      <ScrollView>
      <LinearGradient colors={["#B6F1FA", "#80e8f6", '#0EA8BE']} style={styles.linearGradient}>
      <Avatar
        containerStyle={{alignSelf:"center", marginTop: 20, marginBottom:20}}
        size="xlarge"
        rounded
        onEditPress={()=>{this.changeProfilePic()}}
        source={ this.state.ImageSource !== null ? this.state.ImageSource
          : {uri: this.state.profile_pic_url }
        }
        showEditButton
        />
        </LinearGradient>
      <View style={
           {
             //height:"5%",
           flexDirection: "row",
           justifyContent: "space-between",
           backgroundColor: "#B6F1FA",
           alignItems:"center",
          
           }}>

       <Text style={styles.SectionHeaderStyle}>User Details</Text>
       <View style={{alignItems: "flex-end",flexDirection: "row"}}>
       <Icon name="edit" color="#0EA8BE" size={23} styles={{marginLeft:10}} onPress={()=>{this.editUserData()}}/>
       </View>
       </View>
       <Input
       label='First Name' style={{fontFamily:"Roboto"}}
       labelStyle={{fontFamily:"Roboto"}} inputStyle={{fontFamily:"Roboto"}}
       placeholder={this.state.first_name} value={!this.state.editUserDetails ? this.state.first_name : null} disabled={!this.state.editUserDetails} onChangeText={first_name => {
        this.setState({first_name})}} />
       <Input
       labelStyle={{fontFamily:"Roboto"}} inputStyle={{fontFamily:"Roboto"}}
       label='Last Name' placeholder={this.state.last_name} value={!this.state.editUserDetails ? this.state.last_name : null} disabled={!this.state.editUserDetails} onChangeText={last_name => {
        this.setState({last_name})}}/>
        {/* Put user details here */}
      <View style={
        {
        flexDirection: "row",
        justifyContent: "space-between",
        backgroundColor: "#B6F1FA",
        alignItems:"center",
        paddingRight: 5}}>
      <Text style={styles.SectionHeaderStyle}>Safe Word</Text>
      <View style={{alignItems: "flex-end",flexDirection: "row"}}>
      {this.state.safeword !== "" ?
      <Icon name="edit" color='#0EA8BE' size={23} styles={{marginLeft:10}} onPress={()=>{this.props.navigation.navigate('SafeWordCreate',{route: "UserProfileScreen"})}}/>
      : null }
      </View>
      </View>
      {this.state.safeword !== "" ?
       <Input
       label='Current' value={this.state.safeword} disabled={true}/>
       :  <Button
       title="Create Safe Word"
       type="outline"
       onPress={()=>{this.props.navigation.navigate('SafeWordCreate',{route: "UserProfileScreen"})}}
       titleStyle={{color:"#EED5FD"}}
       buttonStyle={{marginTop: 10,borderColor:"#EED5FD",borderRadius:3}}
 />
    }
      { this.state.has_medical ?
         <View>
         <Button
            title="View Medical Profile"
            type="outline"
            onPress={()=>this.setState({show_medical:true})}
            titleStyle={{color:"#0EA8BE", fontFamily: "Roboto"}}
            buttonStyle={{marginTop: 20, borderColor:"#0EA8BE",borderRadius:20}}
            />
            </View>
       :   
       <View>
        {this.state.editUserDetails ?
        <Button
            title="Save"
            type="outline"
            onPress={()=>{this.updateUserDetails()}}
            titleStyle={{color:"#0EA8BE"}}
            buttonStyle={{marginTop: 10,borderColor:"#0EA8BE",borderRadius:3}}
      /> : null }
       <Button
            title="Create Medical Profile"
            type="outline"
            onPress={()=>{this.props.navigation.navigate('MedicalProfileSetup',{route: "UserProfileScreen"})}}
            titleStyle={{color:"#0EA8BE", fontFamily: "Roboto"}}
            buttonStyle={{marginTop: 20,borderColor:"#0EA8BE",borderRadius:20}}
        />
        </View>
       }
       {/* Put Medical Data here */}
       {/* Plus have a toogle for opt to show in lock screen */}
       </ScrollView>
        <SOS/>
        <BottomNavBar/>
      </View>
      
      
    );
  }
}
const styles = StyleSheet.create({
    mainContainer: {
        flex: 1,
        backgroundColor: '#F9F7F6',
        //height: 34
     },
     contentContainer: {
        flex: 1,
        marginBottom: Dimensions.get('window').height/12
        //height: Dimensions.get("window").height - Dimensions.get('window').height/12 // size of the bottom bar
     },
     SectionHeaderStyle: {
        backgroundColor: '#B6F1FA',
        fontSize: 20,
        padding: 5,
        color: "#0EA8BE",
        fontFamily: "Roboto"
      },
      panel: {
        height: 150,
        padding: 20,
        backgroundColor: '#2c2c2fAA',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: 0 },
        shadowRadius: 5,
        shadowOpacity: 0.4,
      },
      panelButton: {
        padding: 13,
        borderRadius: 10,
        backgroundColor: '#292929',
        alignItems: 'center',
        marginVertical: 7,
      },
      panelButtonTitle: {
        fontSize: 17,
        fontWeight: 'bold',
        color: 'white',
      },
});