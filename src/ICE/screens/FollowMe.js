import React, {Component} from 'react';
import { StyleSheet, Alert, View, ScrollView, SafeAreaView, SectionList } from 'react-native';
import {ButtonGroup, Button, Text, Header, Divider, Avatar, ListItem } from 'react-native-elements';
import Icon from 'react-native-vector-icons/MaterialIcons';
import firebase from '@react-native-firebase/app';
import '@react-native-firebase/auth';
import '@react-native-firebase/database';
import PushNotification from 'react-native-push-notification';
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

export default class FollowMe extends Component {
    constructor(props){
        super(props);
        this.state = { 
            data: [],
            other_data: [],
            users: [],
            visible: false,
            userId: "O28vQIssPWbkjpXLu7qKKxfV7B33",//firebase.auth().currentUser.uid,
        }

        this.notif = setupPushNotification(this.onRegister.bind(this), this.onNotif.bind(this), true);
    }

    async componentWillMount(){
      this.notificationListener()
      // check if that user has an active session
      const session_check = await firebase.database().ref(`users/${this.state.userId}/follow_me_session`).once('value');
      if(session_check.val() !== ""){
        // means that theres no current active session running
        this.setState({visible:true})
      }
      //this.setState({active_session:true})
      // get the circles from firebase
      // personal & other circles...
      this.getCircles()
      this.getOtherCircles()
      this.getUsers()
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



    getUsers = () => {
        firebase.database().ref(`users/`).on('value', (dataSnapshot) => {
          if(dataSnapshot.val()){
            var values = dataSnapshot.val();
            var keys = Object.keys(values);
            var vals = Object.values(values);
            for(var i = 0; i < vals.length; i++ ) {
              // add the id to the vals list -- so it can be deleted at later stage
              vals[i]["id"] = keys[i]
            }
          this.setState({users:vals});
          console.log("users:",this.state.users)
          }
      })
    }

    async getCircles() {
          const dataSnapshot = await firebase.database().ref(`circles/${this.state.userId}/personal_circles`).once('value');
          if(dataSnapshot.val()){
            var values = dataSnapshot.val();
            var keys = Object.keys(values);
            let index = 1;
            const data = [
              ];
            for(var i = 0; i < keys.length; i++ ) {
            const circle_name = await firebase.database().ref(`circles/${this.state.userId}/personal_circles/${keys[i]}/name`).once('value');
            const members = await firebase.database().ref(`circles/${this.state.userId}/personal_circles/${keys[i]}/members`).once('value');
            console.log("members key", keys[i])
            console.log("members",members)
            const member_ids = Object.keys(members.val())
            const members_data = [];
            for(var j = 0; j < member_ids.length; j++ ) {
              console.log("member id:", member_ids[j])
              const member_data = await firebase.database().ref(`users/${member_ids[j]}`).once('value');

              var member_data_val = member_data.val();
              member_data_val["id"] = member_ids[j]
              member_data_val["circle"] = circle_name.val().toString()
              convert = Object.values(member_data_val).toString().split()
              //Object.entries(snapshot).map(e => Object.assign(e[1], { key: e[0] })); Object.keys(s.val() || {}) .map(k => s.val()[k]);
              members_data.splice(0,0,JSON.parse(JSON.stringify(member_data_val)))
              //delete if not in follow me mode
              if(member_data_val["mode"]!=="followme" || member_data_val["id"] === this.state.userId){
                  members_data.splice(0,1)
              }

            }
            
             data.splice(0,0,{title: circle_name.val().toString(), data: members_data})
 
             if(data[0]["data"].length === 0){
                data.splice(0,1)
             }
           }
          //  console.log("data 202",data[0]["data"])

           this.setState({data});
          }
       // })
    }

    async getOtherCircles() {
      firebase.database().ref(`circles/${this.state.userId}/other_circles`).on('value', async (dataSnapshot) => {
        if(dataSnapshot.val()){
          var values = dataSnapshot.val();
          var circles_ids = Object.keys(values);
          console.log("circles_ids",circles_ids)
          let index = 1;
          const data = [
            ];
          for(var i = 0; i < circles_ids.length; i++ ) {
              // tranverse down the tree to get child node (owner id)
              const hidden_members = await firebase.database().ref(`circles/${this.state.userId}/other_circles/${circles_ids[i]}/hidden`).once('value');
              if(hidden_members.exists()){
                var hidden_members_list = Object.keys(hidden_members.val())
              }else{
                var hidden_members_list = []
              }
              const owner = await firebase.database().ref(`circles/${this.state.userId}/other_circles/${circles_ids[i]}`).once('value');
              var owner_id = Object.keys(owner.val())[0]
              const owner_first_name = await firebase.database().ref(`users/${owner_id}/first_name`).once('value');
              console.log("owner_first_name",owner_first_name.val())
              var first_name = owner_first_name.val();
              const owner_last_name = await firebase.database().ref(`users/${owner_id}/last_name`).once('value');
              var last_name = owner_last_name.val()
              const circle_name = await firebase.database().ref(`circles/${owner_id}/personal_circles/${circles_ids[i]}/name`).once('value');
              const members = await firebase.database().ref(`circles/${owner_id}/personal_circles/${circles_ids[i]}/members`).once('value');
              const invite_code = await firebase.database().ref(`circles/${owner_id}/personal_circles/${circles_ids[i]}/invite_code`).once('value');
              const member_ids = Object.keys(members.val())
              // add the owner to the members too
              member_ids.splice(0,0,owner_id);
              console.log("member ids",member_ids)
              const members_data = [];


              for(var j = 0; j < member_ids.length; j++ ) {
              console.log("member id:", member_ids[j])



              const member_data = await firebase.database().ref(`users/${member_ids[j]}`).once('value');
              var member_data_val = member_data.val();
              member_data_val["id"] = member_ids[j]
              member_data_val["circle"] = circle_name.val().toString()
              member_data_val["circle_id"] = circles_ids[i]
              member_data_val["circle_owner"] = owner_id
              if(hidden_members_list.includes(member_ids[j])){
                member_data_val["hidden"] = true
              }else{
                member_data_val["hidden"] = false
              }
              convert = Object.values(member_data_val).toString().split()
              if(member_data_val["mode"]==="followme"){
                  member_data_val["status"] = "orange"
              }else if(member_data_val["mode"]==="SOS"){
                  member_data_val["status"] = "red"
              }else if(member_data_val["mode"]==="normal"){
                  member_data_val["status"] = "green"
              }else{
                  // offline
                  member_data_val["status"] = "gray"
              }
              //Object.entries(snapshot).map(e => Object.assign(e[1], { key: e[0] })); Object.keys(s.val() || {}) .map(k => s.val()[k]);
              members_data.splice(0,0,JSON.parse(JSON.stringify(member_data_val)))
              console.log("other_data",members_data)

              if(member_data_val["mode"]!=="followme" || member_data_val["id"] === this.state.userId){
                members_data.splice(0,1)
              }
              //delete if not in follow me mode
              
              }
          //    data.push({key: index++, title: circle_name.val().toString(), id: keys[i], members_ids: Object.keys(members.val()).toString().split(), members_data: members_data})
          //  console.log("new data:",members_data)
              
              //data.splice(0,0,{owner_id: owner_id, title: circle_name.val().toString(), invite_code: circle_name.val().toString(), owner: first_name+" "+last_name, data: members_data, id: circles_ids[i]})
              data.splice(0,0,{title: owner_first_name.val() + " " + owner_last_name.val() + "'s " + circle_name.val().toString(), data: members_data})

              if(data[0]["data"].length === 0){
                  data.splice(0,1)
              }
          }

          this.setState({other_data:data});
          }
          })
  }

    GetSectionListItem = (id, name, session_id, circle, profile_pic_url, latitude, longitude) => {
        //TO DO Go to the session
        console.log("etSectionListItem",id, name, session_id, circle, profile_pic_url)
        this.props.navigation.navigate('FollowMeTrackMap',{ user_name : name, user_id: id, session_id: session_id, circle: circle, profile_pic_url:profile_pic_url, latitude:latitude, longitude:longitude})
      };
      FlatListItemSeparator = () => {
        return (
          //Item Separator
          <View style={{height: 0.5, width: '100%', backgroundColor: '#C8C8C8'}}/>
        );
      };


    render() {


//  LOG  new data: [{"DOB": "16-03-1998", "battery_level": 100, "distanceTravelled": 0, "first_name": "catherine", "gender": "female", "id": "zblYUifzEWf0ZzLHcMN8B6fmndY2", "isBatteryLow": false, "last_checked": 1584392909000, "last_name": "mooney", "latitude": 38.9308267, "longitude": -120.992285, "mode": "followme", "password": "cGFzc3dvcmQxMjM=", "phone_number": "+353862227103", "prevLatLng": {"latitude": 37.42754333333333, "longitude": -122.26883500000001}, "speed": 0}]
        return (
       <View style={styles.mainContainer}>
       <Header
            backgroundColor="#0EA8BE"
            leftComponent={<Icon name="keyboard-backspace" color='#fff' size={23} style={{padding:5}} onPress={()=>{this.props.navigation.goBack()}}/>}
            centerComponent={{ text: 'Follow Me', style: { color: '#fff', fontFamily:"Roboto", fontSize:20 } }}
            rightComponent={<Icon name="more-vert" color='#fff' size={23} style={{padding:5}}/>}
            />
           <View style={styles.contentContainer}>
           <Text style={{alignSelf:"center",marginTop:10, fontFamily:"Roboto"}} h4>Active Sessions</Text>
                <SectionList
                 ItemSeparatorComponent={this.FlatListItemSeparator}
                 sections={this.state.data.concat(this.state.other_data)
                }
                 renderSectionHeader={({ section }) => (
                   <Text style={styles.SectionHeaderStyle}> {section.title} </Text>
                 )}
                 renderItem={({ item }) => (
                   // Single Comes here which will be repeatative for the FlatListItems
                   <Text
                     style={styles.SectionListItemStyle}
                     //Item Separator View
                     onPress={this.GetSectionListItem.bind(this, item.id, item.first_name, item.follow_me_session, item.circle, item.profile_pic_url,item.latitude,item.longitude)}>
                     {item.first_name + " " + item.last_name}
                   </Text>
                 )}
                 keyExtractor={(item, index) => index}
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
                      marginBottom:50,
                      width: 250,}}
                
                  accessibilityLabel= {this.state.visible ? "Click this button to view current session" : "Click this button to start a session"}
                  titleStyle={ { color: "#0EA8BE",
                  fontSize: 20,
                  fontFamily: 'Roboto',
                  alignSelf: "center",
                  }}
                title={this.state.visible ? "View Current Session" : "Start a session"}
                type="outline"
                onPress={() => this.props.navigation.navigate('FollowMeRouteMap')}
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
       height: 34
    },
    SectionHeaderStyle: {
        backgroundColor: "#B6F1FA",
        fontSize: 20,
        padding: 5,
        color: '#0EA8BE',
      },
      SectionListItemStyle: {
        fontSize: 15,
        padding: 15,
        color: '#000',
        //backgroundColor: '#F5F5F5',
      },
    rightHeaderContainer: {
        alignItems: "flex-end",
        flexDirection: "row"
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
});