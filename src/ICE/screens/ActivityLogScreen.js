// here show a tabbed view of SOS 
//past in the user_id - want the user to be able to see their own but also other circle members
import { TabView, SceneMap, TabBar } from 'react-native-tab-view';
import React, { Component } from 'react';
import {  View, StyleSheet, Alert, TouchableWithoutFeedback, Dimensions, Platform} from 'react-native';
import {Header,Avatar, Button, Input,Overlay, Text} from 'react-native-elements';
import Icon from 'react-native-vector-icons/MaterialIcons';
import SOSLogs from '../screens/SOSLogs'
import FollowMeLogs from '../screens/FollowMeLogs'
import PushNotification from 'react-native-push-notification';
import firebase from '@react-native-firebase/app';
import '@react-native-firebase/auth';
import '@react-native-firebase/database';
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

  const renderTabBar = props => (
    <TabBar
      {...props}
      indicatorStyle={{ backgroundColor: 'white' }}
      labelStyle={{fontFamily:"Roboto",fontSize:17}}
      style={{ backgroundColor: "#0EA8BE", fontFamily:"Roboto" }} //#4db8ff
    />
  );

export default class ActivityLogScreen extends Component {

    constructor(props){
        super(props);
        this.state = { 
            index: 0,
            routes: [{ key: 'first', title: 'SOS Logs' }, { key: 'second', title: 'Follow Me Logs' }],
            userId: this.props.navigation.getParam('user_id'),
            first_name: ''
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
    // this.notificationListener()
     const first_name =  await firebase.database().ref(`users/${this.state.userId}/first_name`).once('value');
     this.setState({first_name:first_name.val()})
    }

    render() {
        const { index, routes } = this.state;
        return (
         <View style={styles.mainContainter}>
         <Header
         backgroundColor="#0EA8BE"
         leftComponent={<Icon name="keyboard-backspace" color='#fff' size={23} style={{padding:5}} onPress={() => {this.props.navigation.goBack()}} />}
         centerComponent={<Text style={{alignSelf:"center",marginTop:10, color:'white'}}>{this.state.first_name + "'s activity logs"}</Text>}
         rightComponent={<Icon name="more-vert" color='#fff' size={23} style={{padding:5}}/> }/>
            <TabView
                renderTabBar={renderTabBar}
                navigationState={{ index, routes }}
                renderScene={ SceneMap({
                    first: () => <SOSLogs userId={this.props.navigation.getParam('user_id')} />,
                    second: () => <FollowMeLogs userId={this.props.navigation.getParam('user_id')} />,
                  })}
                onIndexChange={(index)=>{this.setState({index})}}
                initialLayout={{width: Dimensions.get('window').width, height:  Dimensions.get('window').height}}
          />
        <SOS />
        <BottomNavBar />
          </View>
        )
    }
}

const styles = StyleSheet.create({
    mainContainter: {
    //backgroundColor: 'blue',
    flex: 1,
    //marginTop: Platform.OS === 'ios' ? 20 : 0
    },
    scene: {
      flex: 1,
    },
  });

