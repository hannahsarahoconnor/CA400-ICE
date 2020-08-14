import React, { Component } from 'react';
import { View, StyleSheet, Alert, Modal, TouchableOpacity, Text, KeyboardAvoidingView, Dimensions } from 'react-native';
import BottomNavBar from '../UIcomponents/BottomNavNew';
import  SOS from '../UIcomponents/SOSbutton';
import StyledButton from '../UIcomponents/StyledButton';
import firebase from '@react-native-firebase/app';
import '@react-native-firebase/auth';
import {Header, Divider, Button, Overlay, Input} from 'react-native-elements';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { withNavigation } from 'react-navigation';
import { Akira, Makiko, Hoshi, Jiro } from 'react-native-textinput-effects';
import PasswordTextBox from '../UIcomponents/PasswordHideBox'
import { OverlayAnimated } from 'react-native-maps';
import Animation from 'lottie-react-native';
import anim from '../animations/14451-loading.json';

export default class SafeZoneManager extends Component {
    constructor(props) {
        super(props);
        this.state= {
            safeZones: [],
            show_animation: true,
            userId: firebase.auth().currentUser.uid
        }
    }

    componentDidMount(){
        this.animation.play();
        setTimeout(() => {
          this.setState({show_animation:false})
        }, 5*1000);
    }

    async componentWillMount(){

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

    render() {
        console.log(this.state.safeZones)
        return (
        this.state.show_animation ?
            <View style={styles.animationContainer}>
            <Animation
                  ref={animation => {
                    this.animation = animation;
                  }}
                  style={{
                    width: 500,
                    height: 500,
                    marginBottom:70
                  }}
                  loop={true}
                  source={anim}
                />
                </View>
              :
        <View style={styles.container}>
            <Header
             backgroundColor="#0EA8BE"
             leftComponent={<Icon name="keyboard-backspace" color='#fff' size={23} style={{padding:5}} onPress={() => {this.props.navigation.goBack()}} />}
             centerComponent={<Text style={{alignSelf:"center",marginTop:10, color:'white', fontFamily:"Roboto", fontSize:20}}>Your Safe Zones</Text>}
             rightComponent={<Icon name="more-vert" color='#fff' size={23} style={{padding:5}}/> }/>
        <View style={{flex:6}}>
            {this.state.safeZones.length > 0 ?
            this.state.safeZones.map((safezone) => {
                return(
                    <Input labelStyle={{fontFamily:"Roboto"}} label={safezone.description} rightIcon={<Icon name="clear" color='grey' onPress={()=>{this.removeSafeZone(safezone.id, safezone.description)}} size={23} style={{padding:5}}/>} value={safezone.address} multiline={true} disabled={true}/>
                )
            })
            :  
            <View style={{flex:6, flexDirection:"column",justifyContent: 'center'}}>
                <Text style={{fontFamily:"Roboto",fontSize:17, textAlign:"center"}}>You currently have no registered safe zones. Click the button below to get started.</Text>
            <Button
            title="Create a Safe Zone"
            type="outline"
            onPress={()=>{this.props.navigation.navigate('SafeZoneAdd', {route: "UserProfileScreen"})}}
            titleStyle={{color:"#0EA8BE"}}
            buttonStyle={{marginTop: 20,borderColor:"#0EA8BE",borderRadius:3, width:"60%", alignSelf:"center"}}
        /> 
         </View>
        
        }
         <Button
            title="Add"
            type="outline"
            onPress={()=>{this.props.navigation.navigate('SafeZoneAdd', {route: "UserProfileScreen"})}}
            titleStyle={{color:"#0EA8BE"}}
            buttonStyle={{marginTop: 20 ,borderColor:"#0EA8BE",borderRadius:3, width:"60%", alignSelf:"center"}}
        /> 
        </View>
       
        </View>
    )
             
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
  animationContainer:{
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
 }

})