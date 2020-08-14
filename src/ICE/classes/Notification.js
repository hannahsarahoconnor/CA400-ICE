
import NotifService from "../UIcomponents/NotifService";
import firebase from '@react-native-firebase/app';
import '@react-native-firebase/auth';
import '@react-native-firebase/database';

export default class Notification {

    create(user_id, other_user_id, title, msg, screen=""){
      notification = {
          sender_id: user_id,
          title: title,
          msg: msg,
          screen: screen, //to direct the user to when they click on it 
          time: firebase.database.ServerValue.TIMESTAMP
      }
      firebase.database().ref(`notifications/${other_user_id}`).push(notification)
    }
}

