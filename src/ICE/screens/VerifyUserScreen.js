import React, { Component } from 'react';
import { StyleSheet, Text, View, Image, SafeAreaView, Alert, TouchableOpacity, KeyboardAvoidingView} from 'react-native';
import firebase from '@react-native-firebase/app';
import '@react-native-firebase/auth';
import '@react-native-firebase/database';
import StyledButton from '../UIcomponents/StyledButton';
import FontAwesomeIcon from 'react-native-vector-icons/FontAwesome';
import { Fumi } from 'react-native-textinput-effects';
import { Base64 } from 'js-base64';
import { Button } from 'react-native-elements';
import LinearGradient from 'react-native-linear-gradient';

export default class VerifyUserScreen extends Component {
   
  // get the OTP from user in this state.

  state = { OTP: '', userId: '', returnedResult: this.props.navigation.getParam('returned_result'), firstName: this.props.navigation.getParam('first_name'),
   lastName: this.props.navigation.getParam('last_name'), password: this.props.navigation.getParam('_password'), phoneNumber: this.props.navigation.getParam('phone_number'),
   gender_index: this.props.navigation.getParam('gender_index'), encrypted_password: '', decrypted_password:'', gender: '', date: this.props.navigation.getParam('dob')}

  encrypt_password = () => {
    var temp = Base64.encode(this.state.password);
    this.setState({ encrypted_password: temp });
  }
 
  decrypt_password = () => {
    var temp2 = Base64.decode(this.state.encrypted_password);
    this.setState({ decrypted_password: temp2 });
  }

  get_gender = () => {
    const { gender_index } = this.state;
    if(gender_index == 0){
      this.setState({ gender: 'male' });
    }

    if( gender_index == 1){
       this.setState({ gender: 'female' });
    }

    if( gender_index == 2){
      this.setState({ gender: 'other' });
    }
  }

  storeUserData = () => {
    this.encrypt_password();
    this.decrypt_password();
    this.get_gender();
    const { firstName, lastName, phoneNumber, userId, encrypted_password, decrypted_password, gender, date} = this.state;
    firebase.database().ref(`users/${userId}`).set({
        first_name: firstName,
        last_name: lastName,
        password: encrypted_password,
        phone_number: phoneNumber,
        gender: gender,
        DOB: date,
        safe_word: "",
        follow_me_session: "",
        mode: "normal",
        medicalProfile:false,
        profile_pic_url: ""
    }).then((data)=>{
        //register the user with 112
        this.register112();
        console.log('data ' , data)
    }).catch((error)=>{
        //error callback
        console.log('error ' , error)
    })

    this.props.navigation.navigate('HomeScreen');
}

register112 = () => {
  SendSMS.send({
    body: "register",
    recipients: [+353870628798], // TODO: change this to 112 at end
    successTypes: ['sent', 'queued'],
    allowAndroidSendWithoutReadPermission: true,
  }, (completed, cancelled, error) => {
    console.log('SMS Callback: completed: ' + completed + ' cancelled: ' + cancelled + 'error: ' + error);
    if(completed){
      firebase.database().ref(`users/${userId}`).set({
         registered112: true,
      })
    }
  })
}

checkOTP = () => {
    const { returnedResult, OTP} = this.state;
    if (OTP.length == 6) {
      returnedResult
        .confirm(OTP)
        .then(user => {
          this.setState({ userId: user.uid })
          Alert.alert('Success','You are now a member of ICE!')
          // Register 112
          // Save To db
          this.storeUserData();
          // Move onto user set up!
          this.props.navigation.navigate('CircleSetup');

        })
        .catch(error => {
          Alert.alert("ICE Registration Error",error.message)
          console.log(error)
        })
    } else {
      Alert.alert('ICE Registration Error','Please enter a 6 digit OTP code.',
      [
        {text: 'OK', onPress: () => console.log('OK pressed')},],)
    }
  }

  render() {
      return (
        <KeyboardAvoidingView style={styles.container} behavior="padding">
          <View style={[styles.textInput, { backgroundColor: '#F9F7F6' }]}>
          <Fumi
              label={'Verfication Code'}
              iconClass={FontAwesomeIcon}
              iconName={'lock'}
              iconColor={'#80e8f6'}
              iconSize={20}
              keyboardType='phone-pad'
              iconWidth={40}
              inputPadding={16}
              onChangeText={OTP => {
                this.setState({ OTP })
              }}
              maxLength={6}
              value={this.state.OTP}
            />
          {/* <Hoshi
            label={'Verfication Code'}
            borderColor={'#80e8f6'}
            borderHeight={3}
            inputPadding={16}
            backgroundColor={'#F9F7F6'}
            keyboardType='phone-pad'
            value={this.state.OTP}
            onChangeText={OTP => {
              this.setState({ OTP })
            }}
            maxLength={6} /> */}
        </View>
        <View style={styles.bottomView}>
        <Button
          buttonStyle={{ 
                        borderRadius:20,
                        borderWidth:1,
                        borderColor: "#0EA8BE",
                        padding: 5,
                        //height: 70,
                        width: 300,}}
                    onPress={() =>  this.checkOTP()}
                    accessibilityLabel="Click this button to get One Time Passcode to verify phone number"
                    titleStyle={ { color: "#0EA8BE",
                    fontSize: 35,
                    fontFamily: 'Roboto',
                    alignSelf: "center",
                    }}
                    type="outline"
                    title="Verify Code"
                    // ViewComponent={LinearGradient}
                    // linearGradientProps={{
                    //     colors: ["#B6F1FA", "#80e8f6", '#0EA8BE'],
                    // }}
                    />
            <Button
                  buttonStyle={styles.buttonDecor}
                  onPress={() => this.props.navigation.navigate('WelcomeScreen')}
                  title="Cancel"
                  type="clear"
                  titleStyle={{color:"#0EA8BE", fontFamily:"Roboto"}}
                >
                </Button>
      </View>
        </KeyboardAvoidingView>

      )
}
}
  
  const styles = StyleSheet.create({
      container: {
        flex: 1,
        justifyContent: 'center',
        backgroundColor: '#F9F7F6',
      },
      title: {
        fontSize: 20,
        textAlign: 'center',
        margin: 10,
        color: 'black',
      },
      bottomView: {
        width: '100%',
        height: 150,
        justifyContent: 'center',
        alignItems: 'center',
      },
      textInput: {
        paddingVertical: 16,
      },
  }
  );