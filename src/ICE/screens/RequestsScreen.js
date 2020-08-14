import React, { Component } from 'react';
import { Platform, ScrollView, SectionList, TouchableWithoutFeedback, StyleSheet, View, Dimensions } from 'react-native';
import {ButtonGroup, Button, Text, Header, Divider, Avatar, ListItem, Overlay, SearchBar} from 'react-native-elements';
import Icon from 'react-native-vector-icons/MaterialIcons';
import firebase from '@react-native-firebase/app';
import '@react-native-firebase/database';
import '@react-native-firebase/auth';
import moment from 'moment';

export default class RequestsScreen extends Component {
  constructor(props){
    super(props);
    this.state = { 
        userId: firebase.auth().currentUser.uid,
        search: '',
        selectedIndex: null,
        data: [],
        data_full: [],
        user_name: ''
     }
    }

    async componentDidMount(){
        const user_name = await firebase.database().ref(`users/${this.state.userId}/first_name`).once('value');
        this.setState({user_name:user_name.val()})
        this.getData()
    }

    async getData(){
        firebase.database().ref(`circles/${this.state.userId}/requests`).on('value', async (dataSnapshot) => {
          if(dataSnapshot.val()){
            var values = dataSnapshot.val();
            var keys = Object.keys(values);
            const data = [];
            //looping thro the circle keys 
            for(var i = 0; i < keys.length; i++ ) {
                console.log("keys[i]",keys[i])
                const sender_ids = await firebase.database().ref(`circles/${this.state.userId}/requests/${keys[i]}`).once('value');
                //const time = await firebase.database().ref(`circles/${this.state.userId}/requests/${keys[i]}/${Object.keys(sender_id.val())}/timestamp`).once('value');
                const sender_ids_list = Object.keys(sender_ids.val())
                // loop thro the requests for that circle
                for(var j = 0; j < sender_ids_list.length; j++ ) {
                   console.log("sender_ids[j]",sender_ids_list[j])
                   const time = await firebase.database().ref(`circles/${this.state.userId}/requests/${keys[i]}/${sender_ids_list[j]}/timestamp`).once('value');
                   const user_first_name = await firebase.database().ref(`users/${sender_ids_list[j]}/first_name`).once('value');
                   const user_last_name = await firebase.database().ref(`users/${sender_ids_list[j]}/last_name`).once('value');
                   const user_pic = await firebase.database().ref(`users/${sender_ids_list[j]}/profile_pic_url`).once('value');
                   var user_name = user_first_name.val() + " " + user_last_name.val()
                   const circle_name = await firebase.database().ref(`circles/${this.state.userId}/personal_circles/${keys[i]}/name`).once('value');
                   var msg = `${user_name} has requested to join your circle ${circle_name.val()}.`
                   
                   //console.log("data",data)
                   data.push({circle_id: keys[i],sender_name: user_name, sender_id:sender_ids_list[j], sender_url: user_pic.val(), msg: msg, time: new Date(time.val())})
                }
                this.setState({data, data_full:data})

                
                //console.log("sender_id",Object.keys(sender_id.val()))
                //console.log("time",new Date(time.val()).toDateString())
               // const sender_id = await firebase.database().ref(`notifications/${this.state.userId}/${keys[i]}/sender_id`).once('value');
           }
          }
        })
      }

      filterSearch(text){
        const { data_full } = this.state;
        if(text == ''){
           // when person deletes the text input go back to full list
          this.setState({
            text:text,
            data: this.state.data_full // after filter we are setting users to new array
          });
        }else{
          const newData = this.state.data.filter((item)=>{
            const itemData = item.sender_name.toUpperCase()
            const textData = text.toUpperCase()
            return itemData.indexOf(textData)>-1
          });
    
          this.setState({
            text:text,
            data: newData
          });
      }
    }

    acceptUser(circle_id,user_id){
       // add the new member
      firebase.database().ref(`circles/${this.state.userId}/personal_circles/${circle_id}/members/${user_id}`).set({
         member:true
      });
      console.log("circle_id",circle_id)
      //remove the db ref for that request
      firebase.database().ref(`circles/${this.state.userId}/requests/${circle_id}/${user_id}`).remove()
      // send notification to that user
      notification = {
        sender_id: this.state.userId,
        title: "ICE",
        msg: `${this.state.user_name} has accepted your request to join their circle.`,
        screen: "CircleManager", //to direct the user to when they click on it 
        time: firebase.database.ServerValue.TIMESTAMP
    }
    
    firebase.database().ref(`notifications/${user_id}`).push(notification)
    firebase.database().ref(`notification_feed/${user_id}`).push(notification)
    }

    declineUser(circle_id,user_id){
      //remove the db ref
      // send notification to that user
       // add the new member
     //remove the db ref for that request
     firebase.database().ref(`circles/${this.state.userId}/requests/${circle_id}/${user_id}`).remove()
     // send notification to that user
     notification = {
       sender_id: this.state.userId,
       title: "ICE",
       msg: `${this.state.user_name} has declined your request to join their circle.`,
       screen: "CircleManager", //to direct the user to when they click on it 
       time: firebase.database.ServerValue.TIMESTAMP
   }
   
   firebase.database().ref(`notifications/${user_id}`).push(notification)
   firebase.database().ref(`notification_feed/${user_id}`).push(notification)
    }

    render() {
        const buttons = ['accept','decline']
        const { search } = this.state;
        const { selectedIndex } = this.state
        return (
            <View style={styles.mainContainer}>
            <Header
              backgroundColor="#0EA8BE"
              leftComponent={<Icon name="keyboard-backspace" color='#fff' size={23} style={{padding:5}} onPress={() => {this.props.navigation.goBack()}} />}
              centerComponent={<Text style={{alignSelf:"center",marginTop:10, color:'white',fontSize:20, fontFamily:"Roboto"}}>Requests</Text>}
              rightComponent={<Icon name="more-vert" color='#fff' size={23} style={{padding:5}}/> } />
           <SearchBar lightTheme placeholder="Search" onChangeText={(text) => this.filterSearch(text)} value={this.state.text}/>
           <ScrollView style={styles.contentContainer}>
           <View>
           { this.state.data.map(notification => {
             return (
              <View>
              <View key={notification.key}>
              <View style={{flexDirection:"row", marginTop:5}}>
              <Avatar size="small" rounded source={{ uri: notification.sender_url}}/>
              <Text style={{marginLeft:5,fontSize:12, fontFamily:"Roboto",alignSelf:'flex-end'}}>{notification.msg}</Text>
              </View>
              <Text style={{marginTop:5, alignSelf:'flex-end', fontFamily:"Roboto"}}>{moment(notification.time, "MM-DD-YYYY").fromNow()}</Text>
                 <ButtonGroup
                    onPress={this.updateIndex}
                    selectedIndex={selectedIndex}
                    onPress={selectedIndex => {
                      this.setState({ selectedIndex })}}
                    buttons={buttons}
                    textStyle={{fontFamily:"Roboto"}}
                    containerStyle={{height: 30}}
                    onPress={selectedIndex => {
                      this.setState({ selectedIndex })

                      if(selectedIndex === 0){
                            this.acceptUser(notification.circle_id, notification.sender_id)
                        }else{
                          this.declineUser(notification.circle_id, notification.sender_id)
                        }
                    }}
                    />
              </View>
              </View>
                );
              })
              }
            </View>
            </ScrollView>
           </View>
        )
    }
}

const styles = StyleSheet.create({
    mainContainer: {
       flex: 1,
       backgroundColor: '#F9F7F6',
       height: 34
    },
    contentContainer: {
        flex: 6,
     },
})