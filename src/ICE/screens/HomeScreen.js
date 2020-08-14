import React, { Component } from "react";
import {
  TextInput,
  Dimensions,
  StyleSheet,
  Alert,
  TouchableWithoutFeedback,
  View,
  Image,
  TouchableOpacity,
  ImageBackground,
  Platform,
  PushNotificationIOS
} from "react-native";
import firebase from "@react-native-firebase/app";
import "@react-native-firebase/auth";
import { withNavigation } from "react-navigation";
import RNShake from "react-native-shake";
import BottomNavBar from "../UIcomponents/BottomNavNew";
import SOS from "../UIcomponents/SOSbutton";
import HomeIcons from "../UIcomponents/HomeIcons";
import NotifService from '../UIcomponents/NotifService';
import PushNotification from "react-native-push-notification";
import { Header, Button, Text } from "react-native-elements";
import Icon from "react-native-vector-icons/MaterialIcons";
import LinearGradient from "react-native-linear-gradient";
import BottomSheet from 'reanimated-bottom-sheet'

export default class HomeScreen extends React.Component {
  constructor() {
    super();
    this.state = {
      visible: false,
      userId: ""
    };
    this.notif = new NotifService(
      this.onRegister.bind(this),
      this.onNotif.bind(this)
    );
  }

  bs = React.createRef()

  renderInner = () => (
    <View style={styles.panel}>
     <TouchableOpacity style={styles.panelButton} onPress={()=>{this.props.navigation.navigate("Settings")}}>
        <Text style={styles.panelButtonTitle}>Settings</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.panelButton} onPress={()=>{this.props.navigation.navigate("ContactUsScreen")}}>
        <Text style={styles.panelButtonTitle}>Contact Us</Text>
      </TouchableOpacity>
    </View>
  )  

  componentWillUnmount() {
    RNShake.removeEventListener("ShakeEvent");
  }

  onRegister(token) {
    Alert.alert('Registered !', JSON.stringify(token));
    console.log(token);
    //this.setState({ registerToken: token.token, gcmRegistered: true });
  }

  onNotif(notification) {
    const { navigate } = this.props.navigation;
    console.log(notification);

    if (notification.userInteraction) {
      if (
        notification.data.notificationType === "medical" &&
        Platform.OS === "ios"
      ) {
        this.notif.cancelLocalNotifications({ id: "0" });
        //reschedule it
        // this.notif = setupPushNotification(this.onRegister.bind(this), this.onNotif.bind(this));
        firebase
          .database()
          .ref(`medical/${this.state.userId}`)
          .on("value", snapshot => {
            const {
              additional,
              age,
              allergies,
              blood_type,
              conditions,
              doctor_name,
              kin,
              medication,
              sex
            } = snapshot.val();

            let ios_options = {
              date: new Date(Date.now() + 30000), // in 30 secs
              repeatType: "day",
              id: "0",
              ticker: 'My Notification Ticker',
              bigText: `Age: ${age}\n--------------\nSex: ${sex}\n--------------\nDoctor: ${doctor_name}\n--------------\nKin: ${kin}\n--------------\nBlood type: ${blood_type}\n--------------\nConditions: ${conditions}\n--------------\nAllergies: ${allergies}\n--------------\nMedication: ${medication}\n--------------\nAdditional: ${additional}`,
              color: 'blue',
              alertAction: "view",
              // data: data,
              visibility: 'public',
              title: 'Medical Profile',
              message: `Age: ${age}\n--------------\nSex: ${sex}\n--------------\nDoctor: ${doctor_name}\n--------------\nKin: ${kin}\n--------------\nBlood type: ${blood_type}\n--------------\nConditions: ${conditions}\n--------------\nAllergies: ${allergies}\n--------------\nMedication: ${medication}\n--------------\nAdditional: ${additional}`,
              playSound: false,
              foreground: false,
              userInfo: {
                notificationType: "medical"
              },
              data: JSON.stringify({ notificationType: "medical" }),
            };

            this.notif.scheduleNotif(ios_options);
          });
      } else {
        navigate(notification.data.screen, {
          user_id: notification.data.sender_id
        });
      }
    }
  }

  async componentWillMount() {
    // this.showMedical()

    firebase.database().ref(`users/${this.state.userId}`).on('value', (dataSnapshot) => {
      dataSnapshot = dataSnapshot.val()
      this.setState({latitude:dataSnapshot["latitude"], longitude:dataSnapshot["longitude"]})
    });

    RNShake.addEventListener("ShakeEvent", () => {
      this.props.navigation.navigate("SOSmode");
    });

    // const confirmation = await firebase.auth().signInWithPhoneNumber("+16505556789")
    // confirmation.confirm('123456');
    var userId = firebase.auth().currentUser.uid;
    this.setState({ userId });

    // notification checker
    firebase
      .database()
      .ref(`notifications/${userId}`)
      .on("child_added", snapshot => {
        const { msg, screen, sender_id, time, title } = snapshot.val();
        const { key: id } = snapshot;

        console.log("screen", screen.toString());
        let options = {
          id: id,
          autoCancel: false,
          bigText: msg,
          ongoing: true,
          priority: 'high',
          visibility: 'public',
          importance: 'high',
          title: title,
          message: msg,
          playSound: true,
          vibrate: true,
          //tag: `${screen.toString()}`, //for android
          userInfo: {
            screen: screen.toString(),
            sender_id: sender_id.toString()
          }, //for ios
          data: JSON.stringify({
            screen: screen.toString(),
            sender: sender_id.toString()
          })
        };
        //
        // setTimeout(function(){
        this.notif.localNotif(options);



          //firebase.database().ref(`notifications/${userId}/${id}`).remove()
      });
  }

  //     showMedical() {
  //       this.notif = setupPushNotification(this.onRegister.bind(this), this.onNotif.bind(this));
  //       firebase.database().ref(`medical/O28vQIssPWbkjpXLu7qKKxfV7B33`)
  //       .on('value', snapshot => {

  //       const { additional, age, allergies, blood_type, conditions, doctor_name, kin, medication, sex } = snapshot.val();

  //       if(Platform.OS === 'ios'){
  //         let ios_options = {
  //         date: new Date(Date.now() + (30000)), // in 30 secs
  //         repeatType: 'minute',
  //         ticker: "My Notification Ticker",
  //         id: '0',
  //         message: `MEDICAL PROFILE\n_______________\nAge: ${age}\n--------------\nSex: ${sex}\n--------------\nDoctor: ${doctor_name}\n--------------\nKin: ${kin}\n--------------\nBlood type: ${blood_type}\n--------------\nConditions: ${conditions}\n--------------\nAllergies: ${allergies}\n--------------\nMedication: ${medication}\n--------------\nAdditional: ${additional}`,
  //         color: "blue",
  //         alertAction: 'view',
  //         visibility: "public",
  //         bigText: `MEDICAL PROFILE\n_______________\nAge: ${age}\n--------------\nSex: ${sex}\n--------------\nDoctor: ${doctor_name}\n--------------\nKin: ${kin}\n--------------\nBlood type: ${blood_type}\n--------------\nConditions: ${conditions}\n--------------\nAllergies: ${allergies}\n--------------\nMedication: ${medication}\n--------------\nAdditional: ${additional}`,
  //         title: "ICE",
  //         playSound: false,
  //         foreground: false,
  //         userInfo: {label : "medical"}
  //       };

  //         this.notif.scheduleLocalNotification(ios_options)
  //         console.log('scheduled')
  //       }else{
  //       //utilize android's notification functionality of an ongoing notification
  //       let android_options = {
  //         id: '0',
  //         repeatType: 'minute',
  //         autoCancel: false,
  //         bigText: `MEDICAL PROFILE\n_______________\nAge: ${age}\n--------------\nSex: ${sex}\n--------------\nDoctor: ${doctor_name}\n--------------\nKin: ${kin}\n--------------\nBlood type: ${blood_type}\n--------------\nConditions: ${conditions}\n--------------\nAllergies: ${allergies}\n--------------\nMedication: ${medication}\n--------------\nAdditional: ${additional}`,
  //         ongoing: true,
  //         priority: "high",
  //         visibility: "public",
  //         importance: "high",
  //         title: "ICE",
  //         message: `MEDICAL PROFILE\n_______________\nAge: ${age}\n--------------\nSex: ${sex}\n--------------\nDoctor: ${doctor_name}\n--------------\nKin: ${kin}\n--------------\nBlood type: ${blood_type}\n--------------\nConditions: ${conditions}\n--------------\nAllergies: ${allergies}\n--------------\nMedication: ${medication}\n--------------\nAdditional: ${additional}`,
  //         playSound: false,
  //         vibrate: false,
  //         data: JSON.stringify({label : "medical"})
  //       }
  //       this.notif.localNotification(android_options);

  //    }
  //   })
  //  }

  render() {
    return (

        <View style={styles.main}>
        {/* <Header
                   backgroundColor="#F9F7F6"
                   centerComponent={<Text style={{alignSelf:"center",fontFamily:"Roboto", color:'black', fontSize:35, fontWeight:"300"}}>Home</Text>}
                   rightComponent={<Icon name="more-vert" color='black' size={23} style={{padding:5}} onPress={() => {this.state.edit_mode ? this.setState({edit_mode:false}) : this.props.navigation.goBack()}} />}
                   /> */}
        {/* <LinearGradient colors={["#B6F1FA", "#80e8f6", '#0EA8BE']} style={styles.container}>
               <View style={styles.headerContainer}>
               <View style={styles.leftContainer}>
               <Text style={{fontSize:30, textAlign:"center", fontFamily:"Roboto", color:"white", fontWeight:"800"}} >Home</Text>
                </View>
                <View style={styles.rightHeaderContainer}>
                <Icon name="more-vert" color='#fff' size={23} style={{padding:5}}/>
              </View>
              </View> */}
        <Header
          backgroundColor="#B6F1FA"
          centerComponent={
            <Text
              style={{
                alignSelf: "center",
                color: "white",
                fontFamily: "Roboto",
                fontSize: 40,
                fontWeight: "900"
              }}
            >
              Home
            </Text>
          }
          rightComponent={
            <Icon name="menu" color="#fff" size={23} style={{ padding: 5 }} onPress={() => this.bs.current.snapTo(0)}/>
          }
        />
         <BottomSheet
          ref={this.bs}
          initialSnap={3}
          snapPoints={[5,10,150, 0]}
          renderContent={this.renderInner}
          enabledContentTapInteraction={true}
          enabledGestureInteraction={true}
        />
        <LinearGradient
          colors={["#B6F1FA", "#80e8f6", "#0EA8BE"]}
          style={styles.container}>

          <View style={{ flexDirection: "row", justifyContent: "center" }}>
            <TouchableOpacity
              style={{ flexDirection: "row", marginTop: 15 }}
              onPress={() => this.props.navigation.navigate("FakeCall")}
            >
              <View>
                <Image
                  borderRadius={20}
                  source={require("../images/Call.png")}
                  style={styles.ImageIconStyle}
                />
                <Text
                  style={{
                    textAlign: "center",
                    color: "white",
                    fontWeight: "600",
                    fontFamily: "Roboto",
                    fontSize: 15
                  }}
                >
                  Fake Call
                </Text>
                </View>

            </TouchableOpacity>

            <TouchableOpacity
              style={{
                flexDirection: "row",
                marginTop: 15,
                marginLeft: Dimensions.get("window").width / 15
              }}
              onPress={() => this.props.navigation.navigate("SocialMedia")}
            >
              <View>
                <Image
                  source={require("../images/Network.png")}
                  style={styles.ImageIconStyle}
                />
                <Text
                  style={{
                    textAlign: "center",
                    color: "white",
                    fontWeight: "600",
                    fontFamily: "Roboto",
                    fontSize: 15
                  }}
                >
                  Social Media
                </Text>
              </View>
            </TouchableOpacity>
          </View>

          <View style={{ flexDirection: "row", justifyContent: "center" }}>
            <TouchableOpacity
              style={{ flexDirection: "row", marginTop: 15 }}
              onPress={() => this.props.navigation.navigate("CircleManager")}
            >
              <View>
                <Image
                  source={require("../images/circle_manager.png")}
                  style={styles.ImageIconStyle}
                />
                <Text
                  style={{
                    textAlign: "center",
                    color: "white",
                    fontWeight: "600",
                    fontFamily: "Roboto",
                    fontSize: 15
                  }}
                >
                  Circle Manager
                  </Text>
                  </View>

            </TouchableOpacity>

            <TouchableOpacity
              style={{
                flexDirection: "row",
                marginTop: 15,
                marginLeft: Dimensions.get("window").width / 15
              }}
              onPress={() => this.props.navigation.navigate("CircleMap",{latitude: this.state.latitude, longitude: this.state.longitude})}
            >
              <View>
                <Image
                  source={require("../images/circle_map.png")}
                  style={styles.ImageIconStyle}
                />
                <Text
                  style={{
                    textAlign: "center",
                    color: "white",
                    fontWeight: "600",
                    fontFamily: "Roboto",
                    fontSize: 15
                  }}
                >
                  Circle Map
                    </Text>

                </View>
                </TouchableOpacity>
          </View>
          <View style={{ flexDirection: "row", justifyContent: "center" }}>
            <TouchableOpacity
              style={{ flexDirection: "row", marginTop: 15 }}
              onPress={() => this.props.navigation.navigate("SMS")}
            >
              <View>
                <Image
                  source={require("../images/112.png")}
                  style={styles.ImageIconStyle}
                />
                <Text
                  style={{
                    textAlign: "center",
                    color: "white",
                    fontWeight: "600",
                    fontFamily: "Roboto",
                    fontSize: 15
                  }}
                >
                  112 SMS
                </Text>
               </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={{
                flexDirection: "row",
                marginTop: 15,
                marginLeft: Dimensions.get("window").width / 15
              }}
              onPress={() => this.props.navigation.navigate("FollowMe")}
            >
              <View>
                <Image
                  source={require("../images/follow_me.png")}
                  style={styles.ImageIconStyle}
                />
                <Text
                  style={{
                    textAlign: "center",
                    color: "white",
                    fontWeight: "600",
                    fontFamily: "Roboto",
                    fontSize: 15
                  }}
                >
                  Follow Me
                </Text>
              </View>
            </TouchableOpacity>
          </View>
        </LinearGradient>
        <SOS />
        <BottomNavBar />
      </View>
    );
  }
}
const styles = StyleSheet.create({
  main: {
    flex: 1,
    backgroundColor: "#F9F7F6"
  },
  container: {
    flex: 6,
    // justifyContent: 'center',
    justifyContent: "flex-start",
    // flexDirection:"column",
    backgroundColor: "#F9F7F6"
  },
  headerText: {
    fontSize: 40,
    textAlign: "center",
    margin: 10,
    fontWeight: "bold",
    color: '#2F6276',
    paddingTop: 20,
  },
  ImageIconStyle: {
    padding: 40,
    borderWidth: 2,
    justifyContent: 'center',
    alignSelf: 'center',
    borderColor: "#B6F1FA",
    alignContent: 'center',
    borderRadius: 75,
    margin: 5,
    height: Dimensions.get("window").width / 3,
    width: Dimensions.get("window").width / 3
  },
  SOSbutton: {
    position: "absolute",
    alignSelf: "center",
    backgroundColor: "#EED5FD",
    width: 70,
    height: 70,
    borderRadius: 35,
    bottom: 35,
    zIndex: 10,

      },
  panel: {
        height: 150,
        padding: 20,
        backgroundColor: '#2c2c2fAA',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: 0 },
        shadowRadius: 5,
        shadowOpacity: 0.4,
      },
      panelButton: {
        padding: 13,
        borderRadius: 10,
        backgroundColor: '#292929',
        alignItems: 'center',
        marginVertical: 7,
      },
      panelButtonTitle: {
        fontSize: 17,
        fontWeight: 'bold',
        color: 'white',
      },
  button: {
    width: 60,
    height: 60,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: '#7F58FF',
    shadowOpacity: 0.1,
    shadowOffset: { x: 2, y: 0 },
    shadowRadius: 2,
    borderRadius: 30,
    position: "absolute",
    bottom: 20,
    right: 0,
    top: 5,
    left: 5,
    shadowOpacity: 5.0

      },
  actionBtn: {

        backgroundColor:'#f00',
    textShadowOffset: { width: 5, height: 5 },
    textShadowRadius: 10,
    borderWidth: 2,
    borderColor: "#fff"
  },
  text: { color: "#FFF", justifyContent: "center" },
  headerContainer: {
    // flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: "center",
    paddingRight: 5,
  },
  leftHeaderContainer: {
    alignItems: 'center',
    flexDirection: 'row'
  }
});