// Joining a pre-exisiting Circle
import React, { Component } from 'react';
import { StyleSheet, Text, View, Alert} from 'react-native';
import { ButtonGroup, Button, Header } from 'react-native-elements';
import {Kaede } from 'react-native-textinput-effects';
import Icon from 'react-native-vector-icons/MaterialIcons';
import firebase from '@react-native-firebase/app';
import '@react-native-firebase/auth';
import '@react-native-firebase/database';
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

export default class CircleJoin extends Component {

  constructor(props){
    super(props);
    this.state = {
      code: '',
      user_id: firebase.auth().currentUser.uid,
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
          firebase.database().ref(`medical/${this.state.user_id}`)
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

    componentWillMount(){
      this.notificationListener()
    }

    checkCode = () => {
      const { code } = this.state;
      console.log("Checking the code...", code);

      console.log("id...", this.state.user_id);

      // if a request for this circle has already been sent to the user
      //request_others branch

      firebase.database()
      .ref(`circles/${this.state.user_id}/requests`)
      .orderByChild('inviteCode')
      .equalTo(code)
      .once('value')
      .then(snapshot => {
        if (snapshot.exists()) {
          var values = snapshot.val();
          var child = snapshot.child(Object.keys(values)[0].toString()).val();
          var circle_id = child["circle_id"];
          var owner = child["owner"];

           let circle = {
            id: circle_id,
            owner: owner,
          }

          //TODO: need a notification here?
          Alert.alert("Joined successfully")
          //worked
          other_circle_ref = firebase.database().ref(`circles/${this.state.user_id}/other_circles/`).push(circle);

          // update the status for the user in that circle
          //console.log("member_id",member_id)
          console.log("owner",owner)
          console.log("circle_id", circle_id)

          personal_circle_ref = firebase.database().ref(`circles/${owner}/personal_circles/${circle_id}/pending`);

          // update its status -> incase the user is still in the creating a circle view!

          // current user's phone no

          var currentUserNo = firebase.auth().currentUser.phoneNumber;

          personal_circle_ref
          .orderByChild('phone')
          .equalTo(currentUserNo)
          .once('value')
          .then(snapshot => {
            if (snapshot.exists()) {
              console.log(snapshot)
              var values = snapshot.val();
              var member_id = Object.keys(values)[0].toString();

              console.log("values",values)
              console.log("member_id",member_id)
              console.log("owner",owner)
              console.log("circle_id", circle_id)
              personal_circles_pending_ref = firebase.database().ref(`circles/${owner}/personal_circles/${circle_id}/pending/${member_id}`);

              // updating status  
              personal_circles_pending_ref.update({
                status: 'accepted',
              });

              // move that snapshot to circles members
              personal_circles_members_ref = firebase.database().ref(`circles/${owner}/personal_circles/${circle_id}/members`);
             // TODO - CHANGE THIS TO JUST THE MEMBER ID:TRUE
             personal_circles_members_ref.push(member_id);
        }else{
          console.log("not found.")
        }
       });

          //remove the request for the current user...
         // firebase.database().ref(`circles/${this.state.user_id}/requests/${circle_id}`).remove();
      }else{
        console.log("invite code wasn't found in users request :(")
        // else - find the circle owner if & sent a request to join them. 
        // send to other_user_id/request_personal
        // test this
        
       // var circle_owner = firebase.database().ref(`circles/`).child(`personal_circles/`).child('invite_code').equalTo("458F524C-CC3").once('value')
        //console.log("circle _ owner", circle_owner);

        //ref not working
        firebase.database().ref(`circles/`)
        .child(`join/`)
        .orderByChild("invite_code")
        .equalTo(this.state.code)
        .once('value')
        .then(snapshot => {
          if (snapshot.exists()) {

            var values = snapshot.val();
            var child = snapshot.child(Object.keys(values)[0].toString()).val();
            var owner = child["owner"]
            var circle = child["circle_id"]

            if(child["isJoinable"]){
            // send request to that owner
              firebase.database().ref(`circles/${owner}/personal_circles/requests/${circle}/${this.state.user_id}`).push({
                 timestamp: firebase.database.ServerValue.TIMESTAMP
              })
            // add to your pending others circles requests
             firebase.database().ref(`circles/${this.state.user_id}/other_circles_requests`).push({
               circle_id: circle,
               owner: owner,
            });

            }else{
              //could be max 10 members already...
              //or the user wants to close off all other requests
              Alert.alert("Unable to join this circle")
            }
          
          }else{
            console.log("here", snapshot)
            //invite code doesn't exist
            console.log("didnt find the code!!!!")
            Alert.alert("invite code not recognised")
          }
        });
    }
  });
}

    render() {
      return (
        
        <View style={styles.mainContainer}>
        <Header
            backgroundColor="#0EA8BE"
            leftComponent={<Icon name="keyboard-backspace" color='#fff' size={23} style={{padding:5}} onPress={() => this.props.navigation.goBack()} />}
            centerComponent={{ text: "Join a Circle", style: { color: '#fff', fontFamily:"Roboto", fontSize:22 } }}
            rightComponent={<Icon name="more-vert" color='#fff' size={23} style={{padding:5}}/>}
         />
        <View style={{flex:6, flexDirection:"column"}}>
        <Text style={styles.title} >Enter the unique invite code for the circle you wish to join</Text>
        <Fumi
            label={'Invite Code'}
            iconClass={FontAwesomeIcon}
            iconName={'lock'}
            value={this.state.code}
            iconColor={'#80e8f6'}
            labelStyle={{fontFamily:"Roboto",marginBottom:20}}
            iconSize={20}
            iconWidth={40}
            inputPadding={16}
            onChangeText={code => {
              this.setState({ code })
            }}
            editable={true}
          />
                <Button
                    buttonStyle={{ 
                        borderRadius:20,
                        //borderWidth:1,
                        borderColor: "#0EA8BE",
                        padding: 5,
                        justifyContent:"center",
                        alignSelf:"center",
                        height: 40,
                        marginTop:30,
                        width: 250,}}
                    accessibilityLabel="Click this button to join the corresponding circle"
                    titleStyle={ { color: "#0EA8BE",
                    fontSize: 20,
                    fontFamily: 'Roboto',
                    alignSelf: "center",
                    }}
                    onPress={() => {
                      this.checkCode()
                    }
                    }
                    loading={this.state.clicked}
                    loadingStyle={{height:40}}
                    title="Join"
                    type="outline"
                    // ViewComponent={LinearGradient}
                    // linearGradientProps={{
                    //     colors: ["#B6F1FA", "#80e8f6", '#0EA8BE'],
                    // }}
                    />
        </View>
        </View>
      )
    }
  }
  
  const styles = StyleSheet.create({
      mainContainer: {
        flex: 1,
        backgroundColor: '#F5FCFF',
        //height: 34
     },
      title: {
        fontSize: 17,
        textAlign: 'center',
        margin: 20,
        color: 'black',
        fontFamily:"Roboto"
      },
      contentContainer: {
        flex: 6,
      },
      headerContainer: {
        flex: 1,
        flexDirection: "row",
        justifyContent: "space-between",
        backgroundColor: "#80e8f6",
        alignItems:"center",
        paddingRight: 5
     },
     leftHeaderContainer: {
        alignItems: "flex-start",
        flexDirection: "row"
     },
      
      
  }
  );