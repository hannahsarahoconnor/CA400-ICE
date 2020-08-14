import React, { Component } from 'react';
import { ScrollView, Share, StyleSheet, SafeAreaView, PermissionsAndroid, Text, View, Modal, Platform } from 'react-native';
import { Button, Avatar, ListItem, SearchBar, Header} from 'react-native-elements';
import Icon from 'react-native-vector-icons/MaterialIcons';
import firebase from '@react-native-firebase/app';
import '@react-native-firebase/auth';
import '@react-native-firebase/database';
import { Kaede } from 'react-native-textinput-effects';
import UUIDGenerator from 'react-native-uuid-generator';
import Contacts from 'react-native-contacts';
import * as RNLocalize from 'react-native-localize';
import { parsePhoneNumberFromString } from 'libphonenumber-js';
import SendSMS from 'react-native-sms';
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

export default class CircleCreate extends Component {

  constructor(props){
    super(props);
    this.state = {
       showModal : false,
       showContacts: false,
       setModalOpen : false,
       memberName : '',
       memberPhoneNumber : '',
       inviteCode : '',
       pic_urls: [],
       pending: [],
       contacts: [],
       circle_id: '', 
       memberPP: '',
       contacts_full: [], // copy of original - to reset search field
       search: '',
       searchPlaceholder: '',
       userId: "QuO6SxPNCZbgGiyi4yGTrMktmV53",//firebase.auth().currentUser.uid,
       circle_name: '',
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

  async componentDidMount() {
   // this.notificationListener()
    let circle_id = firebase.database().ref(`circles/`).child(`${this.state.userId}`).child('personal_circles').push().key;
    //set id
    this.setState({circle_id});
    // listen to pending & accepted nodes
    pendingRef = firebase.database().ref('circles/'+ `${this.state.userId}` + '/personal_circles/'+ circle_id + '/pending');
    pending_check = await firebase.database().ref('circles/'+ `${this.state.userId}` + '/personal_circles/'+ circle_id + '/pending').once('value');
   
    this.getPending(pendingRef);
    
  }

  componentWillUnmount(){
    firebase.database().ref('circles/'+ `${this.state.userId}` + '/personal_circles/'+ this.state.circle_id + '/pending').off();
  }

  updateSearch = search => {
    setState({ search });
  };

  getContacts = () => {
   if(Platform.OS == 'android'){
    PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
      {
        'title': 'Contacts',
        'message': 'ICE would like to view your contacts.',
        'buttonPositive': 'Accept'
      }
    ).then(() => {
      Contacts.getAll((err, contacts) => {
        if (err === 'denied'){
          // error
        } else {
          // contacts returned in Array
          this.setState({ contacts, contacts_full : contacts });
        }
      })
    })
  }else{
        Contacts.checkPermission((error, res) => {
          if(res == 'authorized'){
            Contacts.getAll((err, contacts) => {
              if (err === 'denied'){
                // error
              } else {
                // contacts returned in Array
                this.setState({ contacts, contacts_full : contacts });
                //console.log(this.state.contacts_full)
                
              }
            })
          }
        })
      }
      Contacts.getCount(count => {
        this.setState({ searchPlaceholder: `Search ${count} contacts` });
      });
  }

  async componentWillMount() {
    var userId = firebase.auth().currentUser.uid;
    const user_first_name = await firebase.database.ref(`users/${userId}/first_name`).once('value');
    const user_last_name = await firebase.database.ref(`users/${userId}/last_name`).once('value');
    var user_name = user_first_name.val() + " " + user_last_name.val()
    this.setState({user_name})
    this.generateInviteCode();
    this.setState({userId})
    // prompt user to allow this circle to be joinable 
    // add invite code information to database - unrequested circles can join based off code ( in the case where owner shares it instead)
    //${this.state.userId}/personal_circles/${this.state.circle_id}
    firebase.database().ref(`circles/join/${this.state.circle_id}`).push({
          isJoinable: true,
          invite_code: this.state.inviteCode,
          owner: this.state.userId,
          name: this.state.circle_name
    });
  }

  getPending = (pendingRef) => {
    pendingRef.on('value', (dataSnapshot) => {
      if(dataSnapshot.val()){
        var values = dataSnapshot.val();
        console.log("values", values);
        var keys = Object.keys(values);
        console.log("keys", keys); // various circle ids
        var vals = Object.values(values);
        console.log("vals", vals.length);
        for(var i = 0; i < vals.length; i++ ) {
          // add the id to the vals list -- so it can be deleted at later stage
          vals[i]["id"] = keys[i]
        }
      this.setState({pending:vals});
      console.log("pending list: ",this.state.pending)
      }
  })
}
  updatePending(items){
    this.setState({pending: items})
  }

  displayContacts = () => {
    this.getContacts();
    this.setState({ showContacts: !this.state.showContacts });
 };

  generateInviteCode = () => {
     //could crop it so its not as lengthy
    UUIDGenerator.getRandomUUID().then((uuid) => {
      this.setState({inviteCode : uuid.slice(0,12)});
      console.log(this.state.inviteCode);
    });
  }

  getMemberProfilePic = (user, user_id) => {
    //but what if it gets removed??.. 
    firebase.database()
      .ref(`circles/${user_id}/pending/`)
      .orderByChild('memberID')
      .equalTo(user)
      .once('value')
      .then(snapshot => {
        if (snapshot.exists()) {
          var values = snapshot.val();
          var key = Object.keys(values)[0].toString();
          //call to firebase storage
          firebase.storage().ref(user).getDownloadURL().then(function(url) {
            // save URL to database
            firebase.database().ref(`circles/${user_id}/pending/${key}`).update({
              memberURL: url,
          });
    });
  }
});
}

 newCircle (){
  if(this.state.circle_name != ""){
    // establish this circle - users can join 
    if(this.state.pending.length > 0){
      firebase.database().ref(`circles/${this.state.userId}/personal_circles/${this.state.circle_id}`).update(
        {
          name: this.state.circle_name,
          isCompleted: true,
          invite_code: this.state.inviteCode
        });

       alert(`circle ${this.state.circle_name} has been successfully created`)

       this.props.navigation.navigate("HomeScreen");

    }else{
      alert("you must have at least one member added in order to create a circle")
    }

  }else{
    alert("please enter a name for this circle")
  }
 }

  addNewMember = (memberName, memberNo) => {
  
    if(this.state.pending.length < 10){
    // get current country based on devices local
    const countryCode = "IE"//RNLocalize.getCountry();
    //need to make sure that the phone number is in the correct format to work with firebase
    const phoneNumber = parsePhoneNumberFromString(memberNo, countryCode)
    // hardcoding countrycode for testing (emulator is US)
    // const phoneNumber = parsePhoneNumberFromString(memberNo, "IE")
    console.log('no:', phoneNumber.number)
    if (!phoneNumber.isValid()) {
      alert("member" + memberName + " number is not valid!")
    }else{
    // make sure that its not the current
    var currentUserNo = "+35377925154"//firebase.auth().currentUser.phoneNumber;
    if(currentUserNo === phoneNumber.number){
      alert("Cannot add your own number")
    }else{
    //need to check that they havent already sent a request to that same user!
    firebase.database()
    .ref(`circles/${this.state.userId}/personal_circles/${this.state.circle_id}/pending`)
    .orderByChild("phone")
    .equalTo(phoneNumber.number)
    .once('value')
    .then(snapshot => {
      if (snapshot.exists()) {
        // can't send request twice
        alert('a request to this user has already been sent.')
      }else{
      firebase.database()
      .ref('/users')
      .orderByChild('phone_number')
      .equalTo(phoneNumber.number)
      .once('value')
      .then(snapshot => {
        if (snapshot.exists()) {
          console.log('member already exists!')
          var values = snapshot.val();
          var child = snapshot.child(Object.keys(values)[0].toString()).val();
          var other_user_id = Object.keys(values)[0].toString();
          // new member object
          let member = {
            name: memberName,
            phone: phoneNumber.number,
            inviteCode: this.state.inviteCode,
            status: 'pending',
            isMember: true,
            memberID: other_user_id,
            memberURL: child["profile_pic_url"],
            requestSent: false,
          }

          let invite_message = {
            inviteCode: this.state.inviteCode,
            owner: this.state.userId,
            circle_id: this.state.circle_id,
          }

          firebase.database().ref(`circles/${other_user_id}/request_others`).push(invite_message);
          firebase.database().ref(`circles/${this.state.userId}/personal_circles/${this.state.circle_id}/pending`).push(member);
          
          alert(`request will be sent to ${memberName}`)
          // Send notification
          notification = {
            sender_id: this.state.userId,
            title: "ICE",
            msg: `${this.state.user_name} has invited you to join their circle.`,
            screen: "RequestsScreen", //to direct the user to when they click on it 
            time: firebase.database.ServerValue.TIMESTAMP
        }
        
        firebase.database().ref(`notifications/${other_user_id}`).push(notification)
        firebase.database().ref(`notification_feed/${other_user_id}`).push(notification)
        } else {
          console.log('member is not apart of the app');
          const attachment = {
            url: 'ICE://join',
            androidType: 'text/plain'
          };
          const msg_body = 'Come join my Circle of Trust on the ICE app!\nSign Up and enter the invite code: \n' + this.state.inviteCode + "\n" + 'http://ICE:/join'
          SendSMS.send({
            body: msg_body,
            recipients: [phoneNumber.number],
            successTypes: ['sent', 'queued'],
            allowAndroidSendWithoutReadPermission: true,
            attachment: attachment,
          }, (completed, cancelled, error) => {
            console.log('SMS Callback: completed: ' + completed + ' cancelled: ' + cancelled + 'error: ' + error);
            if(completed){
              // means that text was sent -- add that user to pending 
              alert('pending request send to' + memberName);
              firebase.database().ref(`circles/${this.state.userId}/pending/`).push({
                name: memberName,
                memberID: null,
                phone: phoneNumber.number,
                requestSent: completed,
                inviteCode: this.state.inviteCode,
                status: 'pending',
                isMember: false,
                memberURL: null,
              });
            }else{
              alert('SMS request was unsuccessfully send to ' + memberName + ' at ' + phoneNumber.number + '!\nNote you can always share this the invite code instead :)' )
            }
          });
        }
      });
      }
    });
  }
}
  }else{
    alert("max 10 members")
  }
  }

  shareCode(code) {
    Share.share(
            {
                
              message: code.toString()
            
            }).then(result => console.log(result)).catch(errorMsg => console.log(errorMsg));
  }

  removeMember = (phone, user_id) => {
    // remove according to the phone number

    // workaround for bug when removing from list of 1.
    if(this.state.pending.length === 1){
      this.setState({pending:[]})
    }
    
    firebase.database()
      .ref(`circles/${this.state.userId}/personal_circles/${this.state.circle_id}/pending`)
      .orderByChild('phone')
      .equalTo(phone)
      .once('value')
      .then(snapshot => {
        if (snapshot.exists()) {
          var values = snapshot.val();
          var key = Object.keys(values)[0].toString();
          //remove according to that key
          var memberRef = firebase.database().ref(`circles/${this.state.userId}/personal_circles/${this.state.circle_id}/pending/${key}`);
          memberRef.remove();
    }

   });
  }

  filterSearch(text){
    const { contacts_full } = this.state;
    if(text == ''){
       // when person deletes the text input go back to full list
      this.setState({
        text:text,
        contacts: this.state.contacts_full // after filter we are setting users to new array
      });
    }else{
      const newData = this.state.contacts.filter((contact)=>{
        const itemData = contact.givenName.toUpperCase()
        const textData = text.toUpperCase()
        return itemData.indexOf(textData)>-1
      });

      this.setState({
        text:text,
        contacts: newData
      });
  }
}

   render() {
      return (
        <View style={styles.mainContainer}>
        <Header
             backgroundColor="#0EA8BE"
            leftComponent={<Icon name="keyboard-backspace" color='#fff' size={23} style={{padding:5}} onPress={() => {this.props.navigation.goBack()}} />}
            centerComponent={<Text style={{alignSelf:"center",marginTop:10, color:'white', fontFamily:"Roboto", fontSize:20}}>Create a Circle</Text>}
            rightComponent={
              <View style={{flexDirection:"row"}}>
               <Icon name="person-add" color='#fff' onPress={() => this.displayContacts()} size={23} style={{padding:5}}/>
               <Icon name="share" color='#fff' size={23} style={{padding:5}}  onPress={()=>{this.shareCode(this.state.inviteCode)}}/>
              </View>
          }
        />
       <View style={styles.contentContainer}>
         <Fumi
            label={'Circle Name'}
            iconClass={FontAwesomeIcon}
            iconName={'group'}
            value={this.state.circle_name}
            iconColor={'#80e8f6'}
            iconSize={20}
            iconWidth={40}
            inputPadding={16}
            onChangeText={circle_name => {
              this.setState({ circle_name })
            }}
            editable={true}
          />
          <SafeAreaView style={{flex: 1}}>
        <View
          style={{
            paddingLeft: 100,
            paddingRight: 100,
            justifyContent: "center",
            alignItems: "center"
          }}
        >
        </View>
        <ScrollView style={{ flex: 1 }}>
        {this.state.pending.length === 0 ? <Text style={{textAlign:"center", marginTop:10, fontFamily:"Roboto"}} > You have no members added, click the add person icon above to add from your contacts! Otherwise, you can always share the code via the above share icon too. </Text> : null}
          {this.state.pending ? this.state.pending.map(member => {
          // delete contact if contact.phoneNumbers is []
            return (
              <ListItem
              key={member["id"]}
              rightAvatar={<Icon name="clear" color='black' size={20} onPress={() => this.removeMember(member["phone"].toString(), this.state.userId)} />}
              //key={contact.recordID}
              //get the id associated with the phone number
              //firebase.auth().currentUser.phoneNumber
              // not showing
              leftAvatar={(member['memberURL'] != null) ? <Avatar
                rounded
                source={{
                  uri: member["memberURL"]
                }}
              /> : <Avatar size="small" rounded title={member.name.slice(0)}/>
            }
              title={member["name"] + " (" + member["phone"] + ")"}
              // FOR ios emulator put contact.phoneNumbers[0].number
              titleStyle={{fontFamily:"Roboto"}}
              subtitle={"pending"}
              subtitleStyle={{fontFamily:"Roboto"}}
              bottomDivider
            />
            );
          }) : null }
        </ScrollView>
      </SafeAreaView>
        <Modal 
          visible={this.state.showContacts}
          animationType='fade'
          style={styles.modalContent}
          >
     <Icon name="clear" color='black' onPress={() => this.displayContacts()} size={20} style={styles.clear}/>
     <SearchBar
         placeholder={this.state.searchPlaceholder}
         onChangeText={(text) => this.filterSearch(text)}
         lightTheme={true}
         value={this.state.text}/>
     <SafeAreaView style={{flex: 1}}>
        <View
          style={{
            paddingLeft: 100,
            paddingRight: 100,
            justifyContent: "center",
            alignItems: "center"
          }}
        >
        </View>
        <ScrollView style={{ flex: 1 }}>
        {console.log(this.state.contacts)}
        {this.state.contacts ? this.state.contacts.map(contact => { 
          // delete contact if contact.phoneNumbers is []
          {console.log(contact.givenName, contact.phoneNumbers)}
            return (
              <ListItem
              key={contact.recordID}
              leftAvatar={{ source: contact.hasThumbnail ? { uri: contact.thumbnailPath } : undefined }}
              title={contact.givenName}
              // FOR ios emulator put contact.phoneNumbers[0].number
              subtitle={contact.phoneNumbers == [] ? null : contact.phoneNumbers[0].number}
              bottomDivider
              onPress={() => {this.addNewMember(contact.givenName, contact.phoneNumbers[0].number)}}
            />
            );
          }) : null }
        </ScrollView>
      </SafeAreaView>
     
     </Modal>
     <Button
        style={styles.bottomView}
        buttonStyle={{
          borderRadius:20,
          //borderWidth:1,
          borderColor: "#0EA8BE",
          padding: 5,
          justifyContent:"center",
          alignSelf:"center",
          height: 50,
          marginBottom:10,
          width: 300,}}
          titleStyle={ { color: "#0EA8BE",
          fontSize: 20,
          fontFamily: 'Roboto',
          alignSelf: "center",
        }}
        onPress={() => this.newCircle()}
        loading={this.state.clicked ? true : false}
        type="outline"
        accessibilityLabel="Click this button to add your new circle of trust" 
        title="Create" />
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
   modal: {
      flex: 1,
      alignItems: 'center',
      backgroundColor: '#f7021a',
      padding: 100
   },
  clear: {
      marginBottom: 10,
      borderColor: 'black',
      padding: ( Platform.OS === 'ios' ) ? 35 : 0,
      alignSelf: 'center'
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
    item: {
      padding: 10,
      fontSize: 18,
      height: 44,
    },
    modalContent :{
      flex: 1,
      top: 30,
      margin: 30
    },
    modalContainer :{
      flex: 1,
      top: 10,
    },
    rightHeaderContainer: {
       alignItems: "flex-end",
       flexDirection: "row"
    },
    contentContainer: {
       flex: 6,
    },
    bottomView: {
      width: '100%',
      height: 150,
      justifyContent: 'center',
      alignItems: 'center',
    }
   });