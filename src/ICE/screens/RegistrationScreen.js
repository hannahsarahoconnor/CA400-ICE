import React, { Component } from 'react';
import { Alert, ScrollView, KeyboardAvoidingView, StyleSheet, Image, TouchableOpacity, View, Text, ImageBackground, Dimensions} from 'react-native';
import firebase from '@react-native-firebase/app';
import '@react-native-firebase/auth';
import '@react-native-firebase/database';
import FontAwesomeIcon from 'react-native-vector-icons/FontAwesome';
import { Fumi } from 'react-native-textinput-effects';
import { ButtonGroup, Button, Header } from 'react-native-elements';
import Icon from 'react-native-vector-icons/MaterialIcons';
import  CountryPicker, { getAllCountries, getCallingCode, Country, CountryCode, setCountry, setCountryCode} from 'react-native-country-picker-modal';
import DeviceInfo from 'react-native-device-info';
import DatePicker from 'react-native-datepicker';
import { parsePhoneNumberFromString } from 'libphonenumber-js'
import LinearGradient from 'react-native-linear-gradient';

// TODO - make sure their number matches device locale country
// const countryCode = RNLocalize.getCountry();

export default class RegistrationScreen extends Component {
  constructor(props){
    super(props);
    this.state = { 
      full_name:"", password:'', phoneNumber: '', returnedResult: null, OTP: '',
       userId: '', activityIndicator: false, passwordHidden: true, errors: [], selectedIndex: 2, gender_index: 2 ,
       clicked : false, cca2: '', pickerData: null, selected_county_number: '', number_code: '', selected_county: '', dob: ""
      }
  }
  
  displayPassword = () => {
    // TODO the option to see only appears when there is text entered
    this.setState({ passwordHidden: !this.state.passwordHidden });
  };

  performValidationChecks = () => {
    // check that theres no empty fields
    // check that username is unique
    // password follows a certain pattern
    if(this.validateNoEmptyFields()){ 
      if(this.validatePhoneNumber()){
        if(this.validatePassword()){
          return true;
        }else{
          //this.state.errors.concat(["password"])
          this.setState({errors:["password"]})
          return false
        }
      }else{
        this.setState({errors:["phoneNumber"]})
        //this.state.errors.concat(["phoneNumber"])
        //this.state.errors.push("phoneNumber")
        return false
       }
  }
}

  validatePhoneNumber = () => {
    const countryCode = RNLocalize.getCountry();
    //need to make sure that the phone number is in the correct format to work with firebase
    const phoneNumber = parsePhoneNumberFromString(this.state.phoneNumber, countryCode)
    // hardcoding countrycode for testing (emulator is US)
    // const phoneNumber = parsePhoneNumberFromString(memberNo, "IE")
    console.log('no:', phoneNumber.number)
    if (!phoneNumber.isValid()) {
      return false
    }else{
      this.setState({phoneNumberWithCode:phoneNumber.number})
      return true
    }
  }

  validatePassword = () => {
    var regexp = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/
    return regexp.test(this.state.password);
  }

  validateNoEmptyFields = () => {
    const { full_name, password, phoneNumber} = this.state;
    const errors = [];

    if (!full_name) errors.push('full_name');
    if (!password) errors.push('password');
    if (!phoneNumber) errors.push('phoneNumber');
    this.setState({errors})
    return (!errors.length)
  }

  handleNewUser = () => {
    const { phoneNumber } = this.state;
    // Request to send OTP
    if (this.performValidationChecks()) {
      //var phoneNumberWithCode = '+' + this.state.number_code + this.state.phoneNumber;
      //this.setState({phoneNumber : phoneNumberWithCode})
      const countryCode = RNLocalize.getCountry();
      //need to make sure that the phone number is in the correct format to work with firebase
      const phoneNumber = parsePhoneNumberFromString(this.state.phoneNumber, countryCode)
      firebase.auth().signInWithPhoneNumber(phoneNumber.number)
        .then(returnedResult => {
          console.log("returnedResult",returnedResult)
          this.setState({ returnedResult })
        })
        .catch(error => {
          Alert.alert('ICE Registration','An error has occurred please try again later.')
          console.log(error)
        })
    }else{
      this.setState({ clicked:false })
    }
}

render() {
 const { selectedIndex, errors } = this.state;
 const hasErrors = key => errors.includes(key);
 const buttons = ['Male', 'Female', 'Other'];
 console.log("hasErrors",hasErrors)
 return (

  <View style={styles.mainContainer}>
  <Header
     backgroundColor="#F9F7F6"
     style={{height:20}}
     leftComponent={
     <Icon name="keyboard-backspace" accessible={true} accessibilityLabel={"Back Button"} accessibilityTraits={"button"} accessibilityComponentType={"button"} accessibilityHint={"Press this button to go back to the Welcome Page"} color='black' size={23} style={{padding:5}} onPress={() => {this.props.navigation.goBack()}
    } />}
     />
   <View style={styles.contentContainer}>
     <Image source={require('../images/name_art.png')} style={{ width:Dimensions.get('window').width, height:"25%", alignSelf:"center"}}/>
     {/* <Image source={require('../images/transparent_logo.png')} style={{ width:"34%", height:"15.2%", alignSelf:"center", alignItems:"center", justifyContent:"center"}}></Image> */}
     <Text style={{fontFamily:"Roboto", textAlign:"center", marginTop:5}}>Personal Safety Application</Text>
     <Text style={{fontFamily:"Roboto", textAlign:"center", marginTop:5}}>Sign up to get Started.</Text>
     
     <Fumi
              label={'Phone Number'}
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
              onChangeText={phoneNumber => {
                this.setState({ phoneNumber })
              }}
              //maxLength={6}
              value={this.state.phoneNumber}
              style={{marginTop:20}}
            />
       {this.state.errors.includes("phoneNumber") ? 
          <Text style={{
            //height:30,
            padding:5,
            //textAlign: 'right',
            alignSelf: 'stretch',
            fontSize: 15,
            color: 'red',
            fontFamily:"Roboto"
          }}>* Enter a valid phone number.</Text>
          : null
          }
      <Fumi
              label={'Full Name'}
              iconClass={FontAwesomeIcon}
              iconName={'user'}
              iconColor={'#80e8f6'}
              iconSize={15}
              height={(Dimensions.get("window").height/15)}
              //keyboardType='phone-pad'
              iconWidth={30}
              inputStyle={{fontFamily:"Roboto", fontSize:15}}
              inputPadding={16}
              labelStyle={{fontFamily:"Roboto",marginBottom:20}}
              onChangeText={full_name => {
                this.setState({ full_name })
              }}
              value={this.state.full_name}
              style={{
                marginTop: this.state.errors.includes("full_name") ? 0 : 8
              }}
            />
      {this.state.errors.includes("full_name") ? 
          <Text style={{
            //height:30,
            padding:5,
            //textAlign: 'right',
            alignSelf: 'stretch',
            fontSize: 15,
            color: 'red',
            fontFamily:"Roboto"
          }}>* Enter a name.</Text>
          : null
          }
       <Fumi
              label={'Password'}
              iconClass={FontAwesomeIcon}
              iconName={'lock'}
              labelStyle={{fontFamily:"Roboto",marginBottom:20}}
              iconColor={'#80e8f6'}
              iconSize={15}
              inputStyle={{fontFamily:"Roboto", fontSize:15}}
              height={(Dimensions.get("window").height/15)}
              iconWidth={30}
              
              secureTextEntry={this.state.passwordHidden}
              inputPadding={16}
              onChangeText={password => {
                this.setState({ password })
              }}
              value={this.state.password}
              style={{
                marginTop: this.state.errors.includes("password") ? 0 : 8
              }}
          />
          {console.log("this.state.errors",this.state.errors)}
          {this.state.errors.includes("password") ? 
          <Text style={{
            //height:30,
            padding:5,
            //textAlign: 'right',
            alignSelf: 'stretch',
            fontSize: 15,
            color: 'red',
            fontFamily:"Roboto"
          }}>{"* Password must be minimum 8 characters."}</Text>
          : 
          <TouchableOpacity onPress={this.displayPassword}>
          <Text style={styles.passwordTitle}>
              {this.state.passwordHidden ? 'Show' : 'Hide'}
          </Text>
          </TouchableOpacity>
          }
                <Button
                    buttonStyle={styles.signUpButton}
                    accessible={true}
                    accessibilityLabel="Sign up button"
                    accessibilityHint="Click this button to register to ICE"
                    titleStyle={styles.buttonTitle}
                    onPress={() => {
                      this.setState({clicked:true})
                      this.handleNewUser()
                    }
                    }
                    loading={this.state.clicked}
                    loadingStyle={{height:40}}
                    title="Sign Up"
                    type="outline"
                    />
          {/* </View> */}
   </View>
   {this.state.returnedResult ? this.props.navigation.navigate('VerifyUserScreen', {full_name : this.state.full_name, _password : this.state.password, phone_number : this.state.phoneNumber, returned_result : this.state.returnedResult}) : null}
   </View>
 )
}
}

const styles = StyleSheet.create({

  mainContainer:{
    flex:1,
    backgroundColor: '#F9F7F6',
  },
  contentContainer:{
    flex: 6,
  },
  container: {
    flex: 1,
    backgroundColor: '#F9F7F6',
    flexDirection: 'column'
  },
  empty: {
    color: 'red',
  },
  nonempty: {
    color: 'grey',
  },
  textInput: {
    paddingVertical: 16,
  },
  bottomView: {
    width: '100%',
    height: 230,
    justifyContent: 'center',
    alignItems: 'center',
  },
  passwordTitle: {
    //height:30,
    padding:5,
    textAlign: 'right',
    alignSelf: 'stretch',
    fontSize: 12,
    color: '#0EA8BE',
    fontFamily:"Roboto"
  },
  wrap: {
  flex: 1,
  height: 70,
  margin:30
  },
  signUpButton: {
    borderRadius:20,
    borderColor: "#0EA8BE",
    padding: 5,
    justifyContent:"center",
    alignSelf:"center",
    height: 40,
    marginBottom:50,
    width: 250,
  },
  label: {
    flex: 1,},
  buttonTitle:{
    color: "#0EA8BE",
    fontSize: 20,
    fontFamily: 'Roboto',
    alignSelf: "center",
  }
})