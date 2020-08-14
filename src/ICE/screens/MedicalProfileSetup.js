import React, { Component } from 'react';
import { Modal, ScrollView, Platform, TextInput, Alert,Dimensions, StyleSheet, Text, View, KeyboardAvoidingView,
TouchableWithoutFeedback, Keyboard } from 'react-native';
import { CheckBox } from 'react-native-elements';
import NotifService from "../UIcomponents/NotifService";
import Icon from 'react-native-vector-icons/MaterialIcons';
import firebase from '@react-native-firebase/app';
import '@react-native-firebase/auth';
import '@react-native-firebase/database';
import { ButtonGroup, Button, Header } from 'react-native-elements';
import FontAwesomeIcon from 'react-native-vector-icons/FontAwesome';
import { Fumi } from 'react-native-textinput-effects';

import Fontisto from 'react-native-vector-icons/Fontisto';

export default class MedicalProfileSetup extends Component {
    constructor(props) {
        super(props);
        this.state = {
            isModalVisible: false,
            setIsModalVisible: false,
            showInLockScreen: false,
            age: '',
            sex: '',
            doctor_name: '',
            kin: '',
            blood_type: '',
            conditions: '', // maybe make this a list?
            allergies: '',
            medication: '',
            additional: '',
            userId: firebase.auth().currentUser.uid,
            route:  this.props.navigation.getParam('route')
        };
      
        this.notif = new NotifService(this.onRegister.bind(this), this.onNotif.bind(this));
        // this.notif.cancelAll()
    }

    // push notification config

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
            this.notif.cancelNotif({id:"0"})
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
            
             this.notif.scheduleNotif(ios_options)
  
            })
        }else{
          navigate(notification.data.screen,{user_id:notification.data.sender_id})
        }
    }
  }

    handlePerm(perms) {
      Alert.alert("Permissions", JSON.stringify(perms));
    }

    // to handle modal visibility state
    toggleModal = () => {
      console.log(this.setState.isModalVisible);
      this.setState({ isModalVisible: !this.state.isModalVisible});
    }

    pushToDatabase = () => {

      let medical_data = {
        age: this.state.age,
        sex: this.state.sex,
        doctor_name: this.state.doctor_name,
        kin: this.state.kin,
        blood_type: this.state.blood_type,
        conditions: this.state.conditions,
        medication: this.state.medication,
      }

      firebase.database().ref(`medical/${this.state.userId}`).set(medical_data).then(this.showMedical());

      firebase.database().ref(`users/${this.state.userId}`).update({
        medicalProfile:true,
      });

      if(this.state.route === "UserProfileScreen"){
        this.props.navigation.navigate("UserProfileScreen")
      }else{
        this.props.navigation.navigate("HomeScreen")
      }
    }

    
      showMedical() {
          //check platform type
          if(Platform.OS === 'ios'){
            //on going notification isn't possible with ios. WORKAROUND -> schedule a repeated notification.

            const {
              age,
              sex,
              doctor_name,
              kin,
              blood_type,
              conditions, // maybe make this a list?
              medication,

            } = this.state;
            
            let ios_options = {
              date: new Date(Date.now() + (30000)), // in 30 secs
              repeatType: 'day',
              id: '0',
              ticker: "My Notification Ticker",
              bigText: `Age: ${age}\n--------------\nSex: ${sex}\n--------------\nDoctor: ${doctor_name}\n--------------\nKin: ${kin}\n--------------\nBlood type: ${blood_type}\n--------------\nConditions: ${conditions}\n--------------\nMedication: ${medication}`,
              color: "blue",
              alertAction: 'view',
              // data: data,
              visibility: "public",
              title: "Medical Profile",
              message:`Age: ${age}\n--------------\nSex: ${sex}\n--------------\nDoctor: ${doctor_name}\n--------------\nKin: ${kin}\n--------------\nBlood type: ${blood_type}\n--------------\nConditions: ${conditions}\n--------------\nMedication: ${medication}`,
              playSound: false,
              foreground: false,
              userInfo: {
                notificationType: "medical",
               },
               data: JSON.stringify({notificationType: "medical"})
            }
  
            this.notif.scheduleNotif(ios_options) 
          }else{
            //utilize android's notification functionality of an ongoing notification
            let android_options = {
              id: '0',
              repeatType: 'minute',
              ticker: "My Notification Ticker",
              autoCancel: false,
              bigText:`Age: ${age}\n--------------\nSex: ${sex}\n--------------\nDoctor: ${doctor_name}\n--------------\nKin: ${kin}\n--------------\nBlood type: ${blood_type}\n--------------\nConditions: ${conditions}\n--------------\nMedication: ${medication}`,
              ongoing: true,
              priority: "high",
              visibility: "public",
              importance: "high",
              title: "Medical Profile",
              message: `Age: ${age}\n--------------\nSex: ${sex}\n--------------\nDoctor: ${doctor_name}\n--------------\nKin: ${kin}\n--------------\nBlood type: ${blood_type}\n--------------\nConditions: ${conditions}\n--------------\nMedication: ${medication}`,
              playSound: false,
              vibrate: false,
            }
            this.notif.localNotif(android_options);
          }
      }

    render() {
      let { height_size } = Dimensions.get('window');
      return (

        <View style={styles.mainContainer}>

        <Header
          backgroundColor="#F9F7F6"
          style={{height:20}}
          leftComponent={ this.state.route === "UserProfileScreen" ? <Icon name="keyboard-backspace" color='black' size={23} style={{padding:5}} onPress={() => {this.props.navigation.goBack()}} /> : null
          }
          centerComponent={<Text style={{fontFamily:"Roboto", fontSize:20, textAlign:"center", marginTop:5}}>Medical Profile</Text>}
          />
          <Text style={{fontFamily:"Roboto", textAlign:"center", fontSize:12, marginTop:5}}>Set up to show your medical data within lock screen.</Text>
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
              onChangeText={sex => {
                this.setState({ sex })
              }}
              style={{marginTop:5}}
              value={this.state.sex}
            />
       <Fumi
              label={'Date of birth'}
              iconClass={FontAwesomeIcon}
              iconName={'calendar-o'}
              iconColor={'#80e8f6'}
              iconSize={15}
              labelStyle={{fontFamily:"Roboto",marginBottom:20}}
              inputStyle={{fontFamily:"Roboto", fontSize:15}}
              keyboardType='number-pad'
              iconWidth={30}
              height={(Dimensions.get("window").height/15)}
              onChangeText={age => {
                this.setState({ age })
              }}
              value={this.state.age}
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
              onChangeText={doctor_name => {
                this.setState({ doctor_name })
              }}
              value={this.state.doctor_name}
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
              onChangeText={kin => {
                this.setState({ kin })
              }}
              value={this.state.kin}
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
              onChangeText={blood_type => {
                this.setState({ blood_type })
              }}
              //maxLength={6}
              value={this.state.blood_type}
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
              multiline
              iconWidth={30}
              height={(Dimensions.get("window").height/15)}
              onChangeText={medication => {
                this.setState({ medication })
              }}
              value={this.state.medication}
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
               multiline
              iconWidth={30}
              height={(Dimensions.get("window").height/15)}
             // inputPadding={16}
              onChangeText={conditions => {
                this.setState({ conditions })
              }}
              //maxLength={6}
              value={this.state.conditions}
              style={{marginTop:5}}
            />
          {/* <View style={styles.bottomView}> */}
                <Button
                    buttonStyle={{ 
                        borderWidth:1,
                        borderColor: "#0EA8BE",
                        marginTop:20,
                        justifyContent:"center",
                        alignSelf:"center",
                        borderRadius:20,
                        // marginBottom:50,
                        width: 250,}}
                    accessibilityLabel="Click this button create your medical profile"
                    titleStyle={ { color: "#0EA8BE",
                    fontSize: 20,
                    fontFamily: 'Roboto',
                    alignSelf: "center",
                    }}
                    onPress={() => {
                      this.setState({clicked:true})
                      this.pushToDatabase()
                    }
                    }
                    loading={this.state.clicked}
                    loadingStyle={{height:40}}
                    title="Save"
                    type="outline"
                    
                    titleStyle={{color:"#0EA8BE"}}
                    // ViewComponent={LinearGradient}
                    // linearGradientProps={{
                    //     colors: ["#B6F1FA", "#80e8f6", '#0EA8BE'],
                    // }}
                    />
          {/* </View> */}
      { this.state.route !== "UserProfileScreen" ?
        <Button
          type="clear"
          buttonStyle={{marginTop:20}}
          titleStyle={{color:"#0EA8BE"}}
          onPress={() => this.props.navigation.navigate('HomeScreen')}
          title='Skip'/>
          : null }
          </ScrollView>
        </TouchableWithoutFeedback>
        </KeyboardAvoidingView>
        </View>
      )
    }
  }
  
  const styles = StyleSheet.create({
    container: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: '#EED5FD',
  },
  mainContainer:{
    flex: 1,
    backgroundColor: '#F9F7F6',
  },
  contentContainer:{
     flex: 6,
  },
      title: {
        fontSize: 20,
        textAlign: 'center',
        margin: 10,
        color: 'black',
      },
      inputContainer: {
        alignItems: 'center',
        justifyContent: 'center',
      },
      inputStyle: {
        marginTop: ( Platform.OS === 'ios' ) ? 20 : 10,
        width:( Platform.OS === 'ios' ) ? 300 : 250,
        height: ( Platform.OS === 'ios' ) ? 40 : 35,
        paddingHorizontal: 10,
        borderRadius: 50,
        backgroundColor: '#DCDCDC',
      },
     medicalContainer: {
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#E6E6FA',
     },
     outerMedicalContainer:{
      backgroundColor: '#E6E6FA',
      alignItems: 'center',
      justifyContent: 'center',
     },
     clear: {
      marginBottom: ( Platform.OS === 'ios' ) ? 10 : 5,
      borderColor: 'black',
      padding: ( Platform.OS === 'ios' ) ? 50 : 5,
      alignSelf: 'center'
    },

  }
  );