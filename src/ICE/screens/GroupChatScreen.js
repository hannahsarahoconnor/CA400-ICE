import React from 'react';
import {View, StyleSheet} from 'react-native';
import firebase from '@react-native-firebase/app';
import '@react-native-firebase/auth';
import '@react-native-firebase/database';
import { GiftedChat } from 'react-native-gifted-chat';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { Header } from 'react-native-elements';

// Need to refactor this to work with an app & change database structure
// messages/group/circle_id -> circle_id could be passed through navigation
// Also need to be used as a group chat for a circle ! 
// trigger notifications
// refactor sending an image function from 1-1 chat into this also 

export default class GroupChatScreen extends React.Component {
  constructor(props) {
      super(props);
      this.state = {
      messages: [],
      circle_name: this.props.navigation.getParam('circle_name'),
      circle_id: this.props.navigation.getParam('circle_id'),
      user_id: firebase.auth().currentUser.uid,
      first_name: this.props.navigation.getParam('first_name'),
      profile_pic_url: this.props.navigation.getParam('profile_pic_url'),
      members: [],
    };
  }

 async componentWillMount() {
   // 1st get circle owner in order to access circle members
  
   const circles_owner = await firebase.database().ref(`circles/join/${this.state.circle_id}/owner`).once('value');
   var owner = circles_owner.val().toString()
   console.log(this.state.user_id,this.state.circle_id, owner)
   const members_ids = await firebase.database().ref(`circles/${owner}/personal_circles/${this.state.circle_id}/members/`).once('value');
   console.log("members_ids",Object.keys(members_ids.val()))
   this.setState({members:Object.keys(members_ids.val())})
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
  for(var i = 0; i < this.state.members.length; i++ ) {
    firebase.database().ref(`notifications/${this.state.members[i]}`).push(notification)
  }
 }

 send = messages => {
  for (let i = 0; i < messages.length; i++) {
    const { text, user, createdAt } = messages[i];
    const message = {
      text,
      user,
      createdAt,
      timestamp: firebase.database.ServerValue.TIMESTAMP,
    };
    //send notification
    this.sendNotification(message)

    this.append(message);
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
  
   append = (message) => {
     firebase.database().ref(`messages/${this.state.circle_id}`).push(message);
     // send notification
     
   }

   componentDidMount() {
    this.on(message =>
      this.setState(previousState => ({
        messages: GiftedChat.append(previousState.messages, message),
      }))
    );
  }

    componentWillUnmount() {
     //turn db off
     firebase.database().ref(`messages/${this.state.circle_id}`).off();
    }

   on = (callback) =>
    firebase.database().ref(`messages/${this.state.circle_id}`)
      .on('child_added', snapshot => callback(this.parse(snapshot)));
 
    parse = snapshot => {
    const { timestamp: numberStamp, text, user, createdAt } = snapshot.val();
    const { key: _id } = snapshot;
    const timestamp = new Date(numberStamp);
    const message = {
        _id,
        timestamp,
        text,
        createdAt,
        user,
    };
    return message;
    };

    render() {
        return (
         <View style={styles.mainContainer}>
          <Header
            backgroundColor='#0EA8BE'
            leftComponent={<Icon name="keyboard-backspace" color='#fff' size={23} style={{padding:5}} onPress={()=>{this.props.navigation.goBack()}}/>}
            centerComponent={{ text: `${this.state.circle_name} chat`, style: { color: '#fff',fontSize:25 } }}
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
