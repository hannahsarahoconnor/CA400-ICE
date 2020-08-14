import React, {Component} from 'react';
import { StyleSheet, View, Dimensions } from 'react-native';
import {Header,ListItem, SearchBar} from 'react-native-elements';
import Icon from 'react-native-vector-icons/MaterialIcons';
import firebase from '@react-native-firebase/app';
import '@react-native-firebase/auth';
import '@react-native-firebase/database';
import moment from 'moment';
import BottomNavBar from "../UIcomponents/BottomNavNew";
import SOS from "../UIcomponents/SOSbutton";

export default class MessageListener extends Component {
    constructor(props){
        super(props);
        this.state = { 
            userId: firebase.auth().currentUser.uid,
            profile_pic_url: '',
            first_name: '',
            data: [],
            data_full: [],
            text:'',
        }
    }

    async componentWillMount(){
        const first_name = await firebase.database().ref(`users/${this.state.userId}/first_name`).once('value')
        const profile_pic_url = await firebase.database().ref(`circles/${this.state.userId}/profile_pic_url`).once('value')
        this.setState({profile_pic_url:profile_pic_url.val(),first_name:first_name.val()})
    }

    async componentDidMount () {
      this.getMessages()
    }

    async getMessages() {
        const data = [];
        const personal_data = await firebase.database().ref(`circles/${this.state.userId}/personal_circles`).once('value')
        const personal_keys = Object.keys(personal_data.val());
        const other_data = await firebase.database().ref(`circles/${this.state.userId}/other_circles`).once('value');
        const other_data_keys = Object.keys(other_data.val());
        const circles = other_data_keys.concat(personal_keys)
        this.setState({circles})
        //TODO: create circle/ child
        const message_data =  await firebase.database().ref(`messages/`).once('value')
        const message_keys = Object.keys(message_data.val())
        for(var i = 0; i < message_keys.length; i++ ) {
          key =  message_keys[i]
          if(circles.includes(key)){
            //means its one of their circles
            //get circle name
            console.log("key",key)
            const circle_name =  await firebase.database().ref(`circles/join/${key}/name`).once('value')
            //most recent msg
            const most_recent_msg = await firebase.database().ref(`messages/${key}`).limitToLast(1).once('value');
            const most_recent_msg_key = Object.keys(most_recent_msg.val())
            const most_recent_msg_text = await firebase.database().ref(`messages/${key}/${most_recent_msg_key[0]}/msg`).once('value')
            const most_recent_msg_time = await firebase.database().ref(`messages/${key}/${most_recent_msg_key[0]}/timestamp`).once('value')
            const most_recent_msg_sender_id = await firebase.database().ref(`messages/${key}/${most_recent_msg_key[0]}/user/_id`).once('value');
            var message = ""

            if(most_recent_msg_sender_id.val() === this.state.userId){
              //checking if its the current user
              var sender_name = 'You: '
            }else{
              console.log("most_recent_msg_sender_id.val()",most_recent_msg_sender_id.val())
              const sender = await firebase.database().ref(`users/${most_recent_msg_sender_id.val()}/first_name`).once('value');
              var sender_name = sender.val() + ": "
            }
            if(most_recent_msg_text.val().length + sender_name.length > 31){
              message = sender_name + most_recent_msg_text.val()
              console.log("message.length",message.length)
              difference = message.length - ((Dimensions.get('window').width)/10)
              message = message.slice(0,message.length - difference - 3 ) + "..."
            }
            else{
              message = sender_name + most_recent_msg_text.val()
            }

            data.push({type: "group",timestamp: most_recent_msg_time.val(),message: message, id: message_keys[i], first_name: circle_name.val(), last_name: "", pic_url:null})
            }

          if(key === this.state.userId){
            console.log("it's a match")
            const ind_message_data =  await firebase.database().ref(`messages/${key}`).once('value')
            const ind_message_keys = Object.keys(ind_message_data.val())
            for(var j = 0; j < ind_message_keys.length; j++ ) {
              const ind_most_recent_msg = await firebase.database().ref(`messages/${this.state.userId}/${ind_message_keys[j]}`).limitToLast(1).once('value');
              const ind_most_recent_msg_key = Object.keys(ind_most_recent_msg.val())
              console.log("ind_most_recent_msg_key",ind_most_recent_msg_key[0])
              const ind_most_recent_msg_text = await firebase.database().ref(`messages/${this.state.userId}/${ind_message_keys[j]}/${ind_most_recent_msg_key[0]}/text`).once('value')
              console.log("ind_most_recent_msg_text",ind_most_recent_msg_text)
               
              const first_name = await firebase.database().ref(`users/${ind_message_keys[j]}/first_name`).once('value');
              const last_name = await firebase.database().ref(`users/${ind_message_keys[j]}/last_name`).once('value');
              const pic_url = await firebase.database().ref(`users/${ind_message_keys[j]}/profile_pic_url`).once('value');
              const ind_most_recent_msg_time = await firebase.database().ref(`messages/${this.state.userId}/${ind_message_keys[j]}/${ind_most_recent_msg_key[0]}/timestamp`).once('value')
              const ind_most_recent_msg_sender_id = await firebase.database().ref(`messages/${this.state.userId}/${ind_message_keys[j]}/${ind_most_recent_msg_key[0]}/user/_id`).once('value');
               console.log("ind_most_recent_msg_sender_id",ind_most_recent_msg_sender_id)
              if(ind_most_recent_msg_sender_id.val() === this.state.userId){
                //checking if its the current user
                var sender_name = 'You: '
              }else{
                const sender = await firebase.database().ref(`users/${ind_most_recent_msg_sender_id.val()}/first_name`).once('value');
                var sender_name = sender.val() + ": "
              }
              
              // check the length of the message
              var message = ""
              console.log("width",Dimensions.get('window').width)
              if(ind_most_recent_msg_text.val().length + sender_name.length > 31){
                message = sender_name + ind_most_recent_msg_text.val()
                console.log("message.length",message.length)
                difference = message.length - ((Dimensions.get('window').width)/10)
                message = message.slice(0,message.length - difference - 3 ) + "..."
              }
              else{
                message = sender_name +ind_most_recent_msg_text.val()
              }
              data.push({type: "individual", other_user_name:first_name.val(), timestamp: ind_most_recent_msg_time.val(),message: message, id: ind_message_keys[j], first_name: first_name.val(), last_name: last_name.val(), pic_url:pic_url.val()})
              console.log("data",data)
            }
          }
        }

       this.setState({data,data_full:data})

      }


      filterSearch(text){
        if(text == ''){
           // when person deletes the text input go back to full list
          this.setState({
            text:text,
            data: this.state.data_full // after filter we are setting users to new array
          });
        }else{
          const newData = this.state.data.filter((item)=>{
            const itemData = item.first_name.toUpperCase()
            const textData = text.toUpperCase()
            return itemData.indexOf(textData)>-1
          });
    
          this.setState({
            text:text,
            data: newData
          });
      }
    }


    render() {
       console.log("2",this.state.data)
        return (
       <View style={styles.mainContainer}>
       <Header
            backgroundColor='#0EA8BE'
            leftComponent={<Icon name="keyboard-backspace" color='#fff' size={23} style={{padding:5}} onPress={()=>{this.props.navigation.goBack()}}/>}
            centerComponent={{ text: 'Chats', style: { color: '#fff', fontSize:25 } }}
            rightComponent={<Icon name="more-vert" color='#fff' size={23} style={{padding:5}}/>}
            />
           <SearchBar lightTheme placeholder="Search" onChangeText={(text) => this.filterSearch(text)} value={this.state.text}/>
           <View style={styles.contentContainer}>
             {this.state.data.map((message) => {
               return (
                  <View>
                  <ListItem
                    key={message.id}
                    leftAvatar={ message.pic_url ? { source: { uri: message.pic_url } } : { title: message.first_name[0] }}
                    title={message.first_name}
                    subtitle={message.message + "\n" + moment(new Date(message.timestamp), "HH:MM").fromNow()}
                    bottomDivider
                    onPress={() => {message.type === "group" ? this.props.navigation.navigate('GroupChatScreen',{circle_id:message.id, circle_name:message.first_name,first_name:this.state.first_name,profile_pic_url:this.state.profile_pic_url})
                    : this.props.navigation.navigate('IndividualChatScreen',{other_user_id:message.id, other_user_name: message.other_user_name, first_name:this.state.first_name,profile_pic_url:this.state.profile_pic_url,})}}
                />
                  </View>
               )
             })}
        </View>
        <SOS />
        <BottomNavBar />
        </View>
        )
    }
}

const styles = StyleSheet.create({
     contentContainer: {
        flex: 6,
     },
     mainContainer: {
       flex:1,
       backgroundColor: '#F9F7F6'
     }
});
