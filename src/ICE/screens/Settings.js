import React, { Component } from 'react';
import { View, StyleSheet, Alert, Modal, TouchableOpacity, Text, KeyboardAvoidingView, Dimensions } from 'react-native';
import BottomNavBar from '../UIcomponents/BottomNavNew';
import  SOS from '../UIcomponents/SOSbutton';
import StyledButton from '../UIcomponents/StyledButton';
import firebase from '@react-native-firebase/app';
import '@react-native-firebase/auth';
import {Header, Divider, Button, Overlay} from 'react-native-elements';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { withNavigation } from 'react-navigation';
import { Akira, Makiko, Hoshi, Jiro } from 'react-native-textinput-effects';
import PasswordTextBox from '../UIcomponents/PasswordHideBox'
import { OverlayAnimated } from 'react-native-maps';
import { Item, Input, Label } from 'native-base';

class Settings extends Component {
    constructor(props) {
        super(props);
        this.state = {isShown: false};
        this.onPress = this.onPress.bind(this);
        this.onPressOTP = this.onPressOTP.bind(this);
        this.onPressDelete = this.onPressDelete.bind(this);
        this.state= {
            isModalVisible: false,
            ModalVisible: false,
            OTPmodal: false,
            OTP: '',
            setIsModalVisible: false,
            changePhoneModal: false,
            newPassword : '',
            oldPassword : '',
            phonenumber: '',
            new_phone: '',
            code: '',
            returnedResult: null,
            numberChanged: false,
            encrypted_password: '',
            passwordCorrect: true,
            passwordChanged : true,
            returnedResult: null,
            user_id: firebase.auth().currentUser.uid
      
        }
    }
    
    togglePasswordModal = () => {
        console.log(this.setState.isModalVisible);
        this.setState({ isModalVisible: !this.state.isModalVisible});
      }
      toggleDeleteModal = () => {
        console.log(this.setState.ModalVisible);
        this.setState({ ModalVisible: !this.state.ModalVisible});
      }
      toggleOTPModal = () => {
        this.setState({ OTPmodal: !this.state.OTPmodal});
      }

      toggleChangePhoneModal = () => {
        this.setState({ changePhoneModal: !this.state.changePhoneModal});
      }

      onPress(){
         
          {this.state.passwordCorrect ? this.CompareNewPassword()  : Alert.alert("Please fill all fields")}
      }
    onPressDelete(){
       
       {this.checkOTP ? this.deleteAccount2()  : Alert.alert("Please fill all fields")}
     
    }
    onPressOTP(){
        {this.state.passwordCorrect ? this.deleteAccount()  : Alert.alert("Please fill all fields")}
      
     }

    deleteAccount(){
      var user_id = firebase.auth().currentUser.uid;
        firebase.database()
        .ref(`users/${user_id}/password`)
        .once('value')
        .then(snapshot => {
        if(this.state.oldPassword === JSON.stringify(snapshot.val())){
          var user = firebase.auth().currentUser;
          var phone_number = firebase.auth().currentUser.phoneNumber;
          firebase.auth().signInWithPhoneNumber(phone_number).then(returnedResult => {
            this.setState({ returnedResult })
            this.setState({ OTPmodal: true })
            this.setState({ ModalVisible: false })
            })
            .catch(error => {
              alert('Firebase ReAuth Error:\n' + error.message)
              console.log(error)
            })
      }
      else{
        Alert.alert("Password incorrect please try again") 
    }
    })
    }

    deleteAccount2(){
      // once pop up showed the OTP text input & the user entered it in - check it
        const { returnedResult, OTP} = this.state;
        if (OTP.length == 6) {
          returnedResult
            .confirm(OTP)
            .then(user => {
              firebase.database().ref(`users/${this.state.user_id}`).remove()
              firebase.auth().currentUser.delete()
              console.log("user deleted")
              this.props.navigation.navigate("WelcomeScreen")
            })
            .catch(error => {
              Alert.alert(error.message)
              console.log(error)
            })
        } else {
          Alert.alert('Error','Please enter the 6 digit OTP code.')}
        }  
    

    VerifyUser = () => {
        var user_id = firebase.auth().currentUser.uid;
        firebase.database()
        .ref(`users/${user_id}/password`)
        .once('value')
        .then(snapshot => {
        if(this.state.oldPassword === JSON.stringify(snapshot.val())){
            console.log("password correct")
            var user_id = firebase.auth().currentUser.uid;
            firebase.database()
            .ref(`users/${user_id}/phone_number`)
            .once('value')
            .then(snapshot => {
                console.log("snapshot = " + snapshot.val())
                var phone_number = snapshot.val()
                this.setState({phonenumber: phone_number})
                firebase.auth().signInWithPhoneNumber(snapshot.val())
                .then(returnedResult => {
                this.setState({ returnedResult })
                console.log("signed in")
                this.setState({OTPmodal: true})
                this.setState({ModalVisible: false})
                })
                .catch(error => {
                alert('Firebase Auth Error:\n' + error.message)
                console.log(error)
                })
            })
            

    }
    else{
      Alert.alert("Password incorrect please try again") 
  }
  })
   
    };
      checkOTP = () => {

        // delete user could be embedded in this
        const { returnedResult, OTP} = this.state;
        if (OTP.length == 6) {
          returnedResult
            .confirm(OTP)
            .then(user => {
              Alert.alert("correct")
              var user = firebase.auth().currentUser;
              user.reauthenticateWithPhoneNumber(this.state.phone_number, OTP).then(function() {
            console.log("user authenticated")
          }).catch(function(error) {
            console.log("user not authenticated")
          }); 
            })
            .catch(error => {
              Alert.alert(error.message)
              console.log(error)
            })
        } else {
          Alert.alert('Error','Please enter a 6 digit OTP code.')}
         }  

    encrypt_password = () => {
        var temp = Base64.encode(this.state.newPassword);
        this.setState({ encrypted_password: temp });
    }

    CompareNewPassword(){
      if(this.state.oldPassword !== "" && this.state.newPassword !== "" && this.state.newPassword2 !== ""){
          var user_id = firebase.auth().currentUser.uid;
          firebase.database()
          .ref(`users/${user_id}/password`)
          .once('value')
          .then(snapshot => {
          if(this.state.oldPassword === JSON.stringify(snapshot.val())){
            if(JSON.stringify(Base64.encode(this.state.newPassword)) === this.state.newPassword2){
                this.setState({ isModalVisible: false })
                this.updatePassword()
            }
            else{
                console.log("encrypted_password =" + JSON.stringify(this.state.encrypted_password))
                console.log( "newPassword2 = " + this.state.newPassword2)
                Alert.alert("Passwords do not match please try again")
                
            }
        }
        else{
            Alert.alert("Password incorrect please try again") 
        }
      })
      }
      else{
        Alert.alert("Please enter all fields")
      }
       
    }
    
      updatePassword(){
        var user_id = firebase.auth().currentUser.uid;
        console.log(this.state.newPassword)
        var updatePassword = Base64.encode(this.state.newPassword)
        
        firebase.database().ref(`users/${user_id}`).update({
            password: updatePassword,
        }).then((data)=>{
            //success callback
            console.log('data ' , data)
            Alert.alert("Password updated successfully")
        }).catch((error)=>{
            //error callback
            console.log('error ' , error)
        })
    
      }

      async changePhoneNumber(){
        const snapshot = await firebase.auth().verifyPhoneNumber(this.state.newPhoneNumber).then(returnedResult => {
          this.setState({ returnedResult })
        })
        .catch(error => {
          alert('Firebase Auth Error:\n' + error.message)
          console.log(error)
        })
        this.setState({numberChanged:true})
        console.log(this.state.returnedResult)
      }

      verifyPhoneNumberChange(){
        const credential = firebase.auth.PhoneAuthProvider.credential(this.state.returnedResult.verificationId, this.state.code);
        firebase.auth().currentUser.updatePhoneNumber(credential)
        Alert.alert("ICE","Your new number has been updated.")
    
      }

  
  render() {
    return (
    <View style={styles.container}>
        <Header
         backgroundColor="#0EA8BE"
         leftComponent={<Icon name="keyboard-backspace" color='#fff' size={23} style={{padding:5}} onPress={() => {this.props.navigation.goBack()}} />}
         centerComponent={<Text style={{alignSelf:"center",marginTop:10, color:'white', fontFamily:"Roboto", fontSize:20}}>Settings</Text>}
         rightComponent={<Icon name="more-vert" color='#fff' size={23} style={{padding:5}}/> }/>
        <View style ={{flex: 2, flexDirection: 'column', }}>
        <Text style = {styles.settingsHeaders}>Account</Text>
        
        <Button
          buttonStyle={{alignSelf:"flex-start"}}
                    onPress={this.togglePasswordModal}
                    title='Change Password'
                    titleStyle={{textAlign:"left", fontFamily:"Roboto", color:"gray"}}
                    type="clear"
                />
      
        <Overlay
          //animationOutTiming={1000}
          //animationType='fade'
          windowBackgroundColor="rgba(255, 255, 255, .5)"
          //transparent={true}
          //animationOut={'slideOutUp'}
          // animationIn={'slideOutUp'}
          width={Dimensions.get('window').width}
          height={Dimensions.get('window').height/3}
          onBackdropPress={() => this.setState({ isModalVisible: false })}
          isVisible={this.state.isModalVisible}
          overlayBackgroundColor="#E6E6FA"
          >
            <View style={{flex:1, justifyContent:'center', alignContent:'center',backgroundColor:"#E6E6FA"}}>
              <TouchableOpacity onPress={() => {  this.setState({ isModalVisible: false })}}>
                <View style={{alignContent: 'center', backgroundColor: '#E6E6FA'}}>
                  <View style={{padding:  10}}>
                  <PasswordTextBox icon="lock" label="Old Password" onChange={(v) => this.setState({oldPassword: JSON.stringify(Base64.encode(v))})} />
                  </View>
                  <View style={{padding:  10}}>
                <PasswordTextBox icon="lock" label="New Password" onChange={(v) => this.setState({newPassword: v})} />
                </View>
                <View style={{padding:  10}}>
                <PasswordTextBox icon="lock" label="Confirm New Password" onChange={(v) => this.setState({newPassword2: JSON.stringify(Base64.encode(v))})} />
                </View>
                <View  style={{padding: 20}}>
                <Button
                    onPress={this.onPress}
                    title='Save Password'
                    buttonStyle={{borderColor:"#0EA8BE"}}
                    titleStyle={{color:"#0EA8BE", fontFamily:"Roboto"}}
                    type="outline"
                />
              
                </View>
               
               
                </View>
            </TouchableOpacity>
            </View>   
        </Overlay>

        <View style={{paddingTop: 20}}>
        {/* TODO: */}
        {/* <Input
        label='Phone Number' placeholder={this.state.phoneNumber} value={!this.state.editUserDetails ? this.state.originalPhoneNumber : this.state.newPhoneNumber} disabled={!this.state.editUserDetails} onChangeText={newPhoneNumber => {
          this.setState({newPhoneNumber})
          }
          } 
        /> */}
        <Button
                    onPress={this.toggleChangePhoneModal}
                    title='Change Phone Number'
                    buttonStyle={{alignSelf:"flex-start"}}
                    titleStyle={{textAlign:"left", fontFamily:"Roboto", color:"gray"}}
                    type="clear"
                />
                <Overlay
                    windowBackgroundColor="rgba(255, 255, 255, .5)"
                    width={Dimensions.get('window').width}
                    height={Dimensions.get('window').height/3}
                    overlayBackgroundColor="#E6E6FA"
                    onBackdropPress={() => this.setState({ changePhoneModal: false })}
                    isVisible={this.state.changePhoneModal}
                    >
                    
                    <TouchableOpacity onPress={() => {  this.setState({ changePhoneModal: false })}} style={{flex:1, justifyContent:'center', alignContent:'center',}}>
                        <View style={{alignContent: 'center', backgroundColor: '#E6E6FA'}}>
                        <View style={{paddingTop:  50, paddingBottom: 30}}>
                            {this.state.numberChanged ?
                            <PasswordTextBox icon="lock" label="Enter code" onChangeText={(code) => {this.setState({code})}} />
                             :
                             <View>
                             <Item floatingLabel>
                             <Icon size={23} name="call" color="black"/>
                             <Label style={{fontFamily:"Roboto"}} >New phone number</Label>
                             <Input style={{fontFamily:"Roboto"}} onChangeText={(new_phone) => {this.setState({new_phone})}} />
                             </Item>
                             </View>
                             //<PasswordTextBox icon="phone" label="Enter new number" onChangeText={(number)=>{this.setState({new_phone: number})}} />
                            }
                             </View>
                        <View style = {{padding: 20}}>
                        {this.state.numberChanged ?
                        <Button
                            onPress={() => {this.verifyPhoneNumberChange()}}
                            titleStyle={{color:"#0EA8BE",fontFamily:"Roboto"}}
                            title='Verify Code'
                            type="outline"
                            buttonStyle={{borderColor:"#0EA8BE"}}
                        />
                        : 
                        <Button
                            onPress={() => {this.changePhoneNumber()}}
                            titleStyle={{color:"#0EA8BE",fontFamily:"Roboto"}}
                            title='Change Number'
                            type="outline"
                            buttonStyle={{borderColor:"#0EA8BE"}}
                        />
                        }
                        <Text >Note: Once you change your number will be sent a code to verify in order for your account to be updated.</Text>
                        </View>
                    
               
                </View>
            </TouchableOpacity>
                 
        </Overlay>
        </View>
        
        <View style={{paddingTop: 20}}>
        {/* TODO: */}
        {/* <Input
        label='Phone Number' placeholder={this.state.phoneNumber} value={!this.state.editUserDetails ? this.state.originalPhoneNumber : this.state.newPhoneNumber} disabled={!this.state.editUserDetails} onChangeText={newPhoneNumber => {
          this.setState({newPhoneNumber})
          }
          } 
        /> */}
        <Button
                    onPress={this.toggleDeleteModal}
                    title='Delete Account'
                    buttonStyle={{alignSelf:"flex-start"}}
                    titleStyle={{textAlign:"left", fontFamily:"Roboto", color:"gray"}}
                    type="clear"
                />
                <Overlay
                    windowBackgroundColor="rgba(255, 255, 255, .5)"
                    width={Dimensions.get('window').width}
                    height={Dimensions.get('window').height/3}
                    overlayBackgroundColor="#E6E6FA"
                    isVisible={this.state.ModalVisible}
                    onBackdropPress={() => this.setState({ ModalVisible: false })}
                    >
                    
                    <TouchableOpacity onPress={() => {  this.setState({ ModalVisible: false })}} style={{flex:1, justifyContent:'center', alignContent:'center',}}>
                        <View style={{alignContent: 'center', backgroundColor: '#E6E6FA'}}>
                        <View style={{paddingTop:  50, paddingBottom: 30}}>
                            <PasswordTextBox icon="lock" label="Enter password" onChange={(v) => this.setState({oldPassword: JSON.stringify(Base64.encode(v))})} />
                        </View>
                        <View style = {{padding: 20}}>
                        <Button
                            onPress={() => {this.deleteAccount()}}
                            title='Delete Account'
                            titleStyle={{fontFamily:"Roboto",color:"#0EA8BE"}}
                            buttonStyle={{borderColor:"#0EA8BE"}}
                            type="outline"
                        />
                        <Text >Note: Once you delete your account it cannot be undone</Text>
                        </View>
                    
               
                </View>
            </TouchableOpacity>
                 
        </Overlay>
        <Overlay
          windowBackgroundColor="rgba(255, 255, 255, .5)"
          width={Dimensions.get('window').width}
          height={Dimensions.get('window').height/3}
          overlayBackgroundColor="#E6E6FA"
          onBackdropPress={() => this.setState({ OTPmodal: false })}
          isVisible={this.state.OTPmodal}
          >
            <KeyboardAvoidingView style={styles.container} behavior="padding">
                <View style={[styles.textInput, { backgroundColor: '#F9F7F6' }]}>
                    <Hoshi
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
                        maxLength={6} />
                </View>
                <View style={styles.bottomView}>

                <Button
                    onPress={this.onPressDelete}
                    titleStyle={{color:"#0EA8BE",fontFamily:"Roboto"}}
                    title="Delete Account"
                    type="outline"
                    buttonStyle={{borderColor:"#0EA8BE"}}
                    accessibilityLabel="Click this button to Delete Account" 
                        />
                </View>
            </KeyboardAvoidingView>

        </Overlay>

      
        </View>

        {/* <View style={
           {height:"5%",
           flexDirection: "row",
           justifyContent: "space-between",
           backgroundColor: "#EED5FD",
           alignItems:"center",
           paddingRight: 5}}>
       <Text style={styles.SectionHeaderStyle}>Safe Word</Text>
       <View style={{alignItems: "flex-end",flexDirection: "row"}}>
       {this.state.safeword !== "" ?
       <Icon name="edit" color='#fff' size={23} styles={{marginLeft:10}} onPress={()=>{this.props.navigation.navigate('SafeWordCreate',{route: "UserProfileScreen"})}}/>
       : null }
       </View>
       </View>
       {/* If "" then show create button 
       show alert before showing safe word create screen*/}
       {/* {this.state.safeword !== "" ?
       <Input
       label='Current' value={this.state.safeword} disabled={true}/>
       :  <Button
       title="Create Safe Word"
       type="outline"
       onPress={()=>{this.props.navigation.navigate('SafeWordCreate',{route: "UserProfileScreen"})}}
       titleStyle={{color:"#EED5FD"}}
       buttonStyle={{marginTop: 10,borderColor:"#EED5FD",borderRadius:3}}
 />
    } */}
       {/* will be saved in safeword create... */}
       {/* <View style={
           {height:"5%",
           flexDirection: "row",
           justifyContent: "space-between",
           backgroundColor: "#EED5FD",
           alignItems:"center",
           paddingRight: 5}}>
       <Text style={styles.SectionHeaderStyle}>Safe Zones</Text>
       <View style={{alignItems: "flex-end",flexDirection: "row"}}>
       <Icon name="add" color='#fff' size={23} styles={{marginLeft:10}} onPress={()=>{this.props.navigation.navigate('SafeZoneAdd', {route: "UserProfileScreen",latitude:this.state.latitude,longitude:this.state.longitude})}}/>
       </View>
       </View>
       {/* Safe Zone Data */}
       {/* {this.state.safeZones.length > 0 ?
        this.state.safeZones.map((safezone) => {
            return(
                <Input label={safezone.description} rightIcon={<Icon name="clear" color='grey' onPress={()=>{this.removeSafeZone(safezone.id, safezone.description)}} size={23} style={{padding:5}}/>} value={safezone.address} multiline={true} disabled={true}/>
            )
        })
        :  <Button
        title="Create a Safe Zone"
        type="outline"
        onPress={()=>{this.props.navigation.navigate('SafeZoneAdd', {route: "UserProfileScreen"})}}
        titleStyle={{color:"#EED5FD"}}
        buttonStyle={{marginTop: 10,marginBottom:200,borderColor:"#EED5FD",borderRadius:3}}
    /> }
       <Button
            title="View Activity Logs"
            type="outline"
            onPress={()=>{this.props.navigation.navigate('ActivityLogScreen',{user_id:this.state.userId})}}
            titleStyle={{color:"#EED5FD"}}
            buttonStyle={{marginTop: 10,marginBottom:200,borderColor:"#EED5FD",borderRadius:3}}
      />
        */}
        
        <Divider style={{backgroundColor:"gray", marginTop: 10, marginBottom: 10}}/>    
        <Text style = {styles.settingsHeaders}>User Information</Text>

        <Button
                    onPress={() => {this.props.navigation.navigate('ActivityLogScreen',{user_id:this.state.user_id})}}
                    title='View Activity Logs'
                    buttonStyle={{alignSelf:"flex-start"}}
                    titleStyle={{textAlign:"left", fontFamily:"Roboto", color:"gray"}}
                    type="clear"
                />
      
        <Overlay
          windowBackgroundColor="rgba(255, 255, 255, .5)"
          width={"100%"}
          height={Dimensions.get('window').height/2.5}
          overlayBackgroundColor="#E6E6FA"
          onBackdropPress={() => this.setState({ isModalVisible: false })}
          isVisible={this.state.isModalVisible}
          >
              <TouchableOpacity onPress={() => {  this.setState({ isModalVisible: false })}} style={{flex:1, justifyContent:'center', alignContent:'center'}}>
                <View style={{alignContent: 'center'}}>
                  <View style={{padding:  10}}>
                  <PasswordTextBox icon="lock" label="Old Password" onChange={(v) => this.setState({oldPassword: JSON.stringify(Base64.encode(v))})} />
                  </View>
                  <View style={{padding:  10}}>
                <PasswordTextBox icon="lock" label="New Password" onChange={(v) => this.setState({newPassword: v})} />
                </View>
                <View style={{padding:  10}}>
                <PasswordTextBox icon="lock" label="Confirm New Password" onChange={(v) => this.setState({newPassword2: JSON.stringify(Base64.encode(v))})} />
                </View>
                <View  style={{padding: 20}}>
                <Button
                    onPress={this.onPress}
                    title='Save Password'
                />
                </View>
               
               
                </View>
            </TouchableOpacity>
                 
        </Overlay>

        <View style={{paddingTop: 20}}>

        <Button
                    onPress={()=>{this.props.navigation.navigate('SafeZoneManager')}}
                    title='View Safe Zones'
                    buttonStyle={{alignSelf:"flex-start"}}
                    titleStyle={{textAlign:"left", fontFamily:"Roboto", color:"gray"}}
                    type="clear"
                />
      
        <Overlay
          windowBackgroundColor="rgba(255, 255, 255, .5)"
          width={Dimensions.get('window').width}
          height={Dimensions.get('window').height/3}
          overlayBackgroundColor="#E6E6FA"
          onBackdropPress={() => this.setState({ isModalVisible: false })}
          isVisible={this.state.isModalVisible}
          >
              <TouchableOpacity onPress={() => {  this.setState({ isModalVisible: false })}} style={{flex:1, justifyContent:'center', alignContent:'center',}}>
                <View style={{alignContent: 'center', backgroundColor: '#E6E6FA'}}>
                  <View style={{padding:  10}}>
                  <PasswordTextBox icon="lock" label="Old Password" onChange={(v) => this.setState({oldPassword: JSON.stringify(Base64.encode(v))})} />
                  </View>
                  <View style={{padding:  10}}>
                <PasswordTextBox icon="lock" label="New Password" onChange={(v) => this.setState({newPassword: v})} />
                </View>
                <View style={{padding:  10}}>
                <PasswordTextBox icon="lock" label="Confirm New Password" onChange={(v) => this.setState({newPassword2: JSON.stringify(Base64.encode(v))})} />
                </View>
                <View  style={{padding: 20}}>
                <Button
                    onPress={this.onPress}
                    title='Save Password'
                />
              
                </View>
               
               
                </View>
            </TouchableOpacity>
                 
        </Overlay>

        </View>
        
                </View>
                <SOS/> 
                <BottomNavBar/>
      </View>
      
      
    );
  }
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'column',
    backgroundColor: '#F9F7F6',
},
Modal: {
    flex:1,
    justifyContent: 'center',
    alignContent: 'center',
      backgroundColor: '#E6E6FA',

 
},
settingsHeaders: {
    fontSize: 20,
    margin: 10,
    fontFamily:"Roboto",
    fontWeight: 'bold',
    color: "black", 
    paddingTop: 10

}, 
headerText: {
    fontSize: 40,
    textAlign: 'center',
    margin: 10,
    fontWeight: 'bold',
    color: "#2F6276", 
    paddingTop: 20
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

});
export default withNavigation(Settings);
