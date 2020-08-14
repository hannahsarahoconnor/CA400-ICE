// base functions from react-native-push-notification 
import PushNotification from 'react-native-push-notification';
import {Alert} from 'react-native';

export default class NotifService {

  constructor(onRegister, onNotification,popInitialNotification) {
    this.configure(onRegister, onNotification,popInitialNotification);
  }

  configure(onRegister, onNotification, popInitialNotification="true") {
    PushNotification.configure({
      // (optional) Called when Token is generated (iOS and Android)
      onRegister: onRegister, //this._onRegister.bind(this),

      // (required) Called when a remote or local notification is opened or received
      onNotification: onNotification, //this._onNotification,

      // IOS ONLY (optional): default: all - Permissions to register.
      permissions: {
        alert: true,
        badge: true,
        sound: true
      },

      // Should the initial notification be popped automatically
      // default: true
      popInitialNotification: popInitialNotification,
      /**
        * (optional) default: true
        * - Specified if permissions (ios) and token (android and ios) will requested or not,
        * - if not, you must call PushNotificationsHandler.requestPermissions() later
        */
      requestPermissions: true,
    });
  }

  localNotif(options) {
    PushNotification.localNotification({
      id: options.id,
      data: options.data,
      bigText: options.bigText,
      color: options.color,
      ongoing: options.ongoing,
      vibrate: options.vibrate,
      largeIcon: "icon", 
      smallIcon: "icon",
      userInfo: options.userInfo,
      alertAction: options.alertAction,
      title: options.title,
      message: options.message,
      playSound: options.playSound,
});
  }

  scheduleNotif(options) {
    PushNotification.localNotificationSchedule({
      date: options.date, // in 30 secs
      //repeatType: options.repeatType,
      //repeatTime: options.repeatTime,
      ongoing: options.ongoing || false,
      repeatType: options.repeatType,
      id: options.id,
      visibility: options.visibility,
      ticker: options.ticker,
      bigText: options.bigText,
      color: options.color,
      alertAction: options.alertAction,
      title: options.title,
      message: options.bigText,
      playSound: options.playSound,
      data: options.data,
      //soundName: options.soundName,
  })
}

  checkPermission(cbk) {
    return PushNotification.checkPermissions(cbk);
  }

  cancelNotif() {
    PushNotification.cancelLocalNotifications({id: ''+this.lastId});
  }

  cancelAll() {
    PushNotification.cancelAllLocalNotifications();
  }
}