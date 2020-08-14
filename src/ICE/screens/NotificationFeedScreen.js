import React, { Component } from 'react';
import { Platform, ScrollView, SectionList, TouchableWithoutFeedback, StyleSheet, View } from 'react-native';
import {ButtonGroup, Button, Text, Header, Divider, Avatar, ListItem, Overlay, SearchBar, Badge} from 'react-native-elements';
import Icon from 'react-native-vector-icons/MaterialIcons';
import firebase from '@react-native-firebase/app';
import '@react-native-firebase/database';
import '@react-native-firebase/auth';
import moment from 'moment';
import BottomNavBar from "../UIcomponents/BottomNavNew";
import SOS from "../UIcomponents/SOSbutton";

export default class NotificationFeedScreen extends Component {
  constructor(props){
    super(props);
    this.state = { 
        today_data: [],
        week_data: [],
        month_data: [],
        earlier_data: [],
        requests:0,
        member_ids: [], //tmp
        userId: firebase.auth().currentUser.uid,
        user_name: '',
     }
    }

    async getRequestNumber(){
      // show the number of requests that the user has to check..
      const requests = await firebase.database().ref(`circles/${this.state.userId}/requests`).once('value');
      if(requests.val() !== (undefined || null)){
        // loop thro the requests
        var number_requests = 0;
        var keys = Object.keys(requests.val())
        for(var i = 0; i < keys.length; i++ ){
          const circle_requests = await firebase.database().ref(`circles/${this.state.userId}/requests/${keys}`).once('value');
          number_requests += Object.keys(circle_requests.val()).length
        }
        this.setState({requests:number_requests})
      }
     // console.log("length",Object.keys(requests.val()).length)
    }

    async getData(){

      firebase.database().ref(`notification_feed/${this.state.userId}`).on('value', async (dataSnapshot) => {
        if(dataSnapshot.val()){
          var values = dataSnapshot.val();
          var keys = Object.keys(values);
          const today_data = [];
          const week_data = [];
          const month_data = [];
          const earlier_data = [];
          let week_index = 1;
          let month_index = 1;
          let earlier_index = 1;
          let today_index = 1;

          for(var i = 0; i < keys.length; i++ ) {
          const time = await firebase.database().ref(`notification_feed/${this.state.userId}/${keys[i]}/time`).once('value');
          const sender_id = await firebase.database().ref(`notification_feed/${this.state.userId}/${keys[i]}/sender_id`).once('value');
          const msg = await firebase.database().ref(`notification_feed/${this.state.userId}/${keys[i]}/msg`).once('value');
          //const user_name = await firebase.database().ref(`users/${sender_id.val()}/first_name`).once('value');
          console.log("sender_id",sender_id)
          const user_pic = await firebase.database().ref(`users/${sender_id.val()}/profile_pic_url`).once('value');

          //check to see if time is today
          // else if its this week but not this day
          // else if its this month

          //https://stackoverflow.com/questions/6117814/get-week-of-year-in-javascript-like-in-php
          Date.prototype.getWeek = function(){
            var d = new Date(Date.UTC(this.getFullYear(), this.getMonth(), this.getDate()));
            var dayNum = d.getUTCDay() || 7;
            d.setUTCDate(d.getUTCDate() + 4 - dayNum);
            var yearStart = new Date(Date.UTC(d.getUTCFullYear(),0,1));
            return Math.ceil((((d - yearStart) / 86400000) + 1)/7)
          };

          //Tue Mar 31 2020
          if(new Date(time.val()).toDateString() === new Date().toDateString()){
            today_data.push({index:today_index++, key: keys[i], sender_id: sender_id.val(), sender_url: user_pic.val(), time: time.val(), msg: msg.val()})
          }
          //this week -- week should start on a monday
          // make sure its not the same day
          else if(new Date(time.val()).getWeek() === new Date().getWeek() && new Date(time.val()).getDay() !== new Date().getDay()){
            console.log("same week !")
            week_data.push({index: week_index++, label: msg.val(), key: keys[i], sender_id: sender_id.val(), time: time.val(), sender_url: user_pic.val(), msg: msg.val()})
            //console.log("this.state.week_data",this.state.week_data)
          }else if(new Date(time.val()).getMonth() === new Date().getMonth() && new Date(time.val()).getFullYear() === new Date().getFullYear()){
            console.log("same month")
           // console.log(new Date(time.val()).format('W'),new Date().format('W'))
            month_data.push({index:month_index++,key: keys[i], time: time.val(), sender_id: sender_id.val(), sender_url: user_pic.val(), msg: msg.val()})
          }else{
            console.log("earlier")
            earlier_data.push({index:earlier_index++, key: keys[i], time: time.val(), sender_id: sender_id.val(), sender_url: user_pic.val(), msg: msg.val()})
          }
         }
         // order each by timestamp
        today_data.sort(function(a,b){
          // Turn your strings into dates, and then subtract them
          // to get a value that is either negative, positive, or zero.
          return new Date(b.time) - new Date(a.time);
         });
         
        week_data.sort(function(a,b){
          // Turn your strings into dates, and then subtract them
          // to get a value that is either negative, positive, or zero.
          return new Date(b.time) - new Date(a.time);
         });

         month_data.sort(function(a,b){
          // Turn your strings into dates, and then subtract them
          // to get a value that is either negative, positive, or zero.
          return new Date(b.time) - new Date(a.time);
        });

        earlier_data.sort(function(a,b){
          // Turn your strings into dates, and then subtract them
          // to get a value that is either negative, positive, or zero.
          return new Date(b.time) - new Date(a.time);
        });

        this.setState({week_data,month_data,earlier_data,today_data})
        }
      })

    }

    componentDidMount(){
      this.getRequestNumber()
      //collect notifications & then sort depending on their date which array they'll fall into...
      this.getData()
      // each notification has its own keys & sender id - so need to get the data which corresponds to that

      // need to sort each sections arrays to ensure its shown from newest to oldest..
      
      //this.setState({today_data});
      //today_data.sort(function(a,b){return a.time - b.time});
      //console.log("sorted\n", today_data)

      // this.state.data.sort(function(a,b){
      //   // Turn your strings into dates, and then subtract them
      //   // to get a value that is either negative, positive, or zero.
      //   return new Date(b.date) - new Date(a.date);
      // });
      // this.state.data.sortBy(function(o){ return o.date });

    }

    render() {
      return (
        <View style={styles.mainContainer}>
        <Header
             backgroundColor="#0EA8BE"
             leftComponent={<Icon name="keyboard-backspace" color='#fff' size={23} style={{padding:5}} onPress={() => {this.props.navigation.goBack()}} />}
             centerComponent={<Text style={{alignSelf:"center",marginTop:10, color:'white',fontFamily:"Roboto",fontSize:20}}>Notification Feed</Text>}
             rightComponent={
               <Icon name="more-vert" color='#fff' size={23} style={{padding:5}}/> 
           }
             />
             {/* Make this touchable */}
            <TouchableWithoutFeedback
            onPress={()=>{this.props.navigation.navigate('RequestsScreen')}}>
            <View>
            <View style={{flexDirection:'row'}}>
            {/* if notifications exist show a circle & then the no of requests beside it */}
            <Text style={{marginTop:10, fontSize:22, fontFamily:"Roboto"}}>Requests</Text>
            <Badge badgeStyle={{backgroundColor:"#0EA8BE"}} value={this.state.requests}/>
            {/* <View style={{flexDirection:'row', alignItems:'flex-end'}}> */}
            {/* <View style={styles.circle}/>
            <Text style={{marginTop:10}}>{this.state.requests}</Text> */}
            {/* </View> */}
            </View>
            <Divider style={{ backgroundColor: 'gray',marginTop:10 }} />
            </View>
            </TouchableWithoutFeedback>
            <ScrollView style={styles.contentContainer}>

            {this.state.today_data.length === 0 && this.state.month_data.length === 0 && 
            this.state.week_data.length === 0 && this.state.earlier_data.length === 0 ?
            <Text style={{textAlign:"center",fontFamily:"Roboto", fontSize:22, marginTop:30}} >You have no notifications to show.</Text>
            :
            
            null}

            { this.state.today_data.length > 0 ?
            <View>
            <Text style={{marginTop:10,fontFamily:"Roboto", marginBottom:10, fontSize:22,}} h4>Today</Text>
            { this.state.today_data.map(notification => {
             return (
              <View key={notification.key} style={styles.watcher}>
              <View style={{flexDirection:"row", marginTop:5}}>
              <Avatar size="small" rounded source={{ uri: notification.sender_url}}/>
              <Text style={{marginTop:10, marginLeft:5}}>{notification.msg}</Text>
              </View>
              <Text style={{marginTop:5, alignSelf:'flex-end'}}>{moment(new Date(notification.time), "HH:MM").fromNow()}</Text>
              </View>
                );
              })
              }
              <Divider style={{ backgroundColor: 'gray', marginTop:10}} />
              </View>
            : null }

            { this.state.week_data.length > 0 ?
            <View>
            <Text style={{marginTop:10,fontFamily:"Roboto", marginBottom:10, fontSize:22,}}>This Week</Text>
            { this.state.week_data.map(notification => {
             return (
              <View key={notification.key} style={styles.watcher}>
              <View style={{flexDirection:"row", marginTop:5}}>
              <Avatar size="small" rounded source={{ uri: notification.sender_url}}/>
              <Text style={{marginTop:10, marginLeft:5, fontFamily:"Roboto"}}>{notification.msg}</Text>
              </View>
              <Text style={{marginTop:5, alignSelf:'flex-end',fontFamily:"Roboto"}}>{moment(new Date(notification.time), "MM-DD-YYYY").fromNow()}</Text>
              </View>
                );
              })
              }
              <Divider style={{ backgroundColor: 'gray', marginTop:10}} />
              </View>
            : null }
            { this.state.month_data.length > 0 ?
            <View>
          
            <Text style={{marginTop:10, marginBottom:10, fontSize:22, fontFamily:"Roboto", color:"black"}}>This Month</Text>
            
            { this.state.month_data.map(notification => {
             return (
              <View key={notification.key} style={styles.watcher}>
              <View style={{flexDirection:"row", marginTop:5}}>
              <Avatar size="small" rounded source={{ uri: notification.sender_url}}/>
              <Text style={{marginTop:10, marginLeft:5,fontFamily:"Roboto"}}>{notification.msg}</Text>
              </View>
              <Text style={{marginTop:5, fontFamily:"Roboto", alignSelf:'flex-end'}}>{moment(new Date(notification.time), "MM-DD-YYYY").fromNow()}</Text>
              </View>
                );
              })
              }
              <Divider style={{ backgroundColor: 'gray', marginTop:10}} />
              </View>
            : null }
            
            { this.state.earlier_data.length > 0 ?
            <View>
            <Text style={{marginTop:10,fontFamily:"Roboto", marginBottom:10, fontSize:22,}} h4>Earlier</Text>
            
            { this.state.earlier_data.map(notification => {
             return (
              <View key={notification.key} style={styles.watcher}>
              <View style={{flexDirection:"row", marginTop:5}}>
              <Avatar size="small" rounded source={{ uri: notification.sender_url}}/>
              <Text style={{marginTop:10, marginLeft:5,fontFamily:"Roboto"}}>{notification.msg}</Text>
              </View>
              <Text style={{marginTop:5, alignSelf:'flex-end',fontFamily:"Roboto"}}>{moment(new Date(notification.time), "MM-DD-YYYY").fromNow()}</Text>
              <Divider style={{ backgroundColor: 'gray', marginTop:10}} />
              </View>
                );
              })
              }
              </View>
            : null }
         </ScrollView>
         <SOS />
         <BottomNavBar />
         </View>
      );
    }
  }

  const styles = StyleSheet.create({
    mainContainer: {
       flex: 1,
       backgroundColor: '#F9F7F6',
       height: 34
    },
    SectionHeaderStyle: {
        backgroundColor: '#CDDC89',
        fontSize: 20,
        padding: 5,
        color: '#fff',
      },
      SectionListItemStyle: {
        fontSize: 15,
        marginLeft: 15,
        color: '#000',
        marginTop: 15,
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
     modalContent :{
      flex: 1,
      top: 30,
      margin: 30
    },
    circle: {
      width: 10,
      height: 10,
      borderRadius: 10/2,
      backgroundColor: 'blue'
  },
    clear: {
      marginBottom: 10,
      borderColor: 'black',
      padding: ( Platform.OS === 'ios' ) ? 50 : 0,
      alignSelf: 'center'
    },
});