import React from 'react';
import {View, StyleSheet} from 'react-native';
import firebase from '@react-native-firebase/app';
import '@react-native-firebase/auth';
import '@react-native-firebase/database';
import { GiftedChat, MessageImage } from 'react-native-gifted-chat';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { Header } from 'react-native-elements';
import { TypingAnimation } from "react-native-typing-animation";
import KeyboardSpacer from 'react-native-keyboard-spacer';
import { ThemeConsumer } from 'styled-components';

// Need to refactor this to work with an app & change database structure
// messages/group/circle_id -> circle_id could be passed through navigation
// Also need to be used as a group chat for a circle ! 
// trigger notifications
// refactor sending an image function from 1-1 chat into this also 

export default class IndividualChatScreen extends React.Component {
  constructor(props) {
      super(props);
      this.state = {
      messages: [],
      other_user_id: this.props.navigation.getParam('other_user_id'),
      other_user_name: this.props.navigation.getParam('other_user_name'),
      user_id: firebase.auth().currentUser.uid,
      first_name: this.props.navigation.getParam('first_name'),
      profile_pic_url: this.props.navigation.getParam('profile_pic_url'),
    };
  }

 sendNotification(message){
  notification = {
    sender_id: this.state.user_id,
    type: "message", 
    title: "ICE",
    msg: `${this.state.first_name} to ${this.state.circle_name}: ${message}.`,
    screen: "MessageListScreen", //to direct the user to when they click on it 
    time: firebase.database.ServerValue.TIMESTAMP
  }
    firebase.database().ref(`notifications/${this.state.other_user_id}`).push(notification)
 }

 send = messages => {
  for (let i = 0; i < messages.length; i++) {
    const { text, user, createdAt } = messages[i];
    console.log("messages[i]",messages[i])
    const message = {
      text,
      createdAt,
      user,
      timestamp: firebase.database.ServerValue.TIMESTAMP
    };

   // console.log("message",message)
    //send notification

    firebase.database().ref(`messages/${this.state.user_id}/${this.state.other_user_id}`).push(message);
    firebase.database().ref(`messages/${this.state.other_user_id}/${this.state.user_id}`).push(message);

    this.sendNotification(message)

  }
};

// need get infront of the function
get user() {
    return {
    name: this.state.first_name,
    _id: this.state.user_id,
    avatar: this.state.profile_pic_url,
    };
  }
  
  //  append = (message) => {
  //    firebase.database().ref(`messages/${this.state.user_id}/${this.state.other_user_id}`).push(message);
  //    firebase.database().ref(`messages/${this.state.other_user_id}/${this.state.user_id}`).push(message);
  //    // send notification
     
  //  }

   componentDidMount() {
    firebase.database().ref('messages/').child(`${this.state.user_id}`).child(`${this.state.other_user_id}`)
    .on('child_added', (value) => {
        console.log("value.val()",value.val())
        this.setState((prevState) => {
            const { createdAt, text, user } = value.val();
            const { key: _id } = value;
            const message = {
                _id,
                createdAt,
                text,
                user,
            };

            console.log("key",_id)
            return {
                messages: [...prevState.messages, message]
            }
        })
    })
  }

    componentWillUnmount() {
     //turn db off
     firebase.database().ref(`messages/${this.state.user_id}/${this.state.other_user_id}`).off();
    }

    render() {
        return (
         <View style={styles.mainContainer}>
          <Header
            backgroundColor='#0EA8BE'
            leftComponent={<Icon name="keyboard-backspace" color='#fff' size={23} style={{padding:5}} onPress={()=>{this.props.navigation.goBack()}}/>}
            centerComponent={{ text: `${this.state.other_user_name}`, style: { color: '#fff', fontSize:25 } }}
            rightComponent={<Icon name="more-vert" color='#fff' size={23} style={{padding:5}}/>}
            />
          <GiftedChat
            messages={this.state.messages}
            onSend={this.send}
            user={this.user}
          />
          {/* <KeyboardSpacer/> */}
          </View>
        );
      }
}

const styles = StyleSheet.create({
  mainContainer: {
     flex: 1,
     backgroundColor: '#F5FCFF',
     height: 34
  },
});
