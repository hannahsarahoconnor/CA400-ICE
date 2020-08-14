import React, {Component} from 'react';
import { StyleSheet, Alert, Share, View, ScrollView, Image, SafeAreaView, Modal, SectionList, Text, Dimensions } from 'react-native';
import {ButtonGroup, Button, Header, Divider, Avatar, ListItem, Overlay, SearchBar} from 'react-native-elements';
import Icon from 'react-native-vector-icons/MaterialIcons';
import firebase from '@react-native-firebase/app';
import '@react-native-firebase/auth';
import '@react-native-firebase/database';
import Contacts from 'react-native-contacts';
import { TextInput } from 'react-native-gesture-handler';
import FontAwesomeIcon from 'react-native-vector-icons/FontAwesome';
import { withNavigation } from 'react-navigation';
import moment from 'moment';
import { add } from 'react-native-reanimated';

class MyCircles extends Component {
    constructor(props){
        super(props);
        this.state = { 
            data: [],
            other_data: [],
            users: [],
            contacts: [],
            contacts_full: [],
            showContacts: false,
            edit_mode: false,
            clicked: false,
            currentUser: {},
            first_name: '',
            profile_pic_url:'',
            saved: false,
            user_id: "O28vQIssPWbkjpXLu7qKKxfV7B33"//firebase.auth().currentUser.uid,
        }
    }

        async componentWillMount(){
    
            // get the circles from firebase
            // personal & other circles...
    
            this.getCircles()
            // this.getUsers()
            // this.getOtherCircles()
    
            const first_name = await firebase.database().ref(`users/${this.state.user_id}/first_name`).once('value');
            const profile_pic_url = await firebase.database().ref(`users/${this.state.user_id}/profile_pic_url`).once('value');
            
            this.setState({first_name:first_name.val()});
            //this.setState({profile_pic_url:profile_pic_url.val()});
        }
    
        sendNotification(message, recipient){
          notification = {
            sender_id: this.state.user_id,
            title: "ICE",
            msg: message,
            screen: "CircleManager", //to direct the user to when they click on it 
            time: firebase.database.ServerValue.TIMESTAMP
          }
          for(var j = 0; i < this.state.members.length; i++ ) {
            firebase.database().ref(`notifications/${recipient}`).push(notification)
            firebase.database().ref(`notification_feed/${recipient}`).push(notification)
          }
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
    
        addMember(circle_id) {
          this.getContacts();
          this.setState({ showContacts: !this.state.showContacts, circle_id: circle_id });
        }
    
        async getCircles() {
            firebase.database().ref(`circles/${this.state.user_id}/personal_circles`).on('value', async (dataSnapshot) => {
              if(dataSnapshot.val()){
                var values = dataSnapshot.val();
                var keys = Object.keys(values);
                let index = 1;
                const data = [
                  ];
                for(var i = 0; i < keys.length; i++ ) {
                console.log("keys[i]",keys[i])
                const circle_name = await firebase.database().ref(`circles/${this.state.user_id}/personal_circles/${keys[i]}/name`).once('value');
                const invite_code = await firebase.database().ref(`circles/${this.state.user_id}/personal_circles/${keys[i]}/invite_code`).once('value');
                const members = await firebase.database().ref(`circles/${this.state.user_id}/personal_circles/${keys[i]}/members`).once('value');
                const hidden_members = await firebase.database().ref(`circles/${this.state.user_id}/personal_circles/${keys[i]}/hidden`).once('value');
                if(hidden_members.exists()){
                  var hidden_members_list = Object.keys(hidden_members.val())
                }else{
                  var hidden_members_list = []
                }
                console.log("members key", keys[i])
                console.log("members",members.val())
                const member_ids = Object.keys(members.val())
                const members_data = [];
                for(var j = 0; j < member_ids.length; j++ ) {
                  console.log("member id:", member_ids[j])
                  const member_data = await firebase.database().ref(`users/${member_ids[j]}`).once('value');
                  var member_data_val = member_data.val();
                  member_data_val["id"] = member_ids[j]
                  member_data_val["circle_id"] = keys[i]
                  convert = Object.values(member_data_val).toString().split()
                  if(hidden_members_list.includes(member_ids[j])){
                    member_data_val["hidden"] = true
                  }else{
                    member_data_val["hidden"] = false
                  }
    
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
    
                  console.log("member_data_val",member_data_val)
                  //Object.entries(snapshot).map(e => Object.assign(e[1], { key: e[0] })); Object.keys(s.val() || {}) .map(k => s.val()[k]);
                  members_data.splice(0,0,JSON.parse(JSON.stringify(member_data_val)))
                  //delete if not in follow me mode
                  
                }
            //    data.push({key: index++, title: circle_name.val().toString(), id: keys[i], members_ids: Object.keys(members.val()).toString().split(), members_data: members_data})
               //  console.log("new data:",members_data)
                
                 data.splice(0,0,{title: circle_name.val().toString(),code: invite_code.val().toString(),data: members_data, id: keys[i]})
                 if(data[0]["data"].length === 0){
                    data.splice(0,1)
                 }
               }
               console.log("data 202",data[0]["data"])
    
               this.setState({data});
              }
            })
        }
    
        async getOtherCircles() {
            firebase.database().ref(`circles/${this.state.user_id}/other_circles`).on('value', async (dataSnapshot) => {
              if(dataSnapshot.val()){
                var values = dataSnapshot.val();
                var circles_ids = Object.keys(values);
                console.log("circles_ids",circles_ids)
                let index = 1;
                const data = [
                  ];
                for(var i = 0; i < circles_ids.length; i++ ) {
                    // tranverse down the tree to get child node (owner id)
                    const hidden_members = await firebase.database().ref(`circles/${this.state.user_id}/other_circles/${circles_ids[i]}/hidden`).once('value');
                    if(hidden_members.exists()){
                      var hidden_members_list = Object.keys(hidden_members.val())
                    }else{
                      var hidden_members_list = []
                    }
                    const owner = await firebase.database().ref(`circles/${this.state.user_id}/other_circles/${circles_ids[i]}`).once('value');
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
                    //delete if not in follow me mode
                    }
                //    data.push({key: index++, title: circle_name.val().toString(), id: keys[i], members_ids: Object.keys(members.val()).toString().split(), members_data: members_data})
                //  console.log("new data:",members_data)
                    
                    data.splice(0,0,{owner_id: owner_id, title: circle_name.val().toString(), invite_code: circle_name.val().toString(), owner: first_name+" "+last_name, data: members_data, id: circles_ids[i]})
    
                    if(data[0]["data"].length === 0){
                        data.splice(0,1)
                    }
                }
    
                this.setState({other_data:data});
                
                }
                })
        }
    
        shareCode(code) {
          Share.share(
                  {
                      
                    message: code.toString()
                  
                  }).then(result => console.log(result)).catch(errorMsg => console.log(errorMsg));
        }
    
        async addNewMember(circle_id, memberName, memberNo) {
    
          // there can only be a total of 10 in a circle - so add up the member # and current pendings
          const pending = await firebase.database().ref(`circles/${this.state.user_id}/personal_circles/${this.state.circle_id}/pending`).once('value');
          const members = await firebase.database().ref(`circles/${this.state.user_id}/personal_circles/${this.state.circle_id}/members`).once('value');
    
          const circle_length = Object.key(pending.val()).length + Object.key(members.val()).length
      
          if(circle_length < 10){
          // get current country based on devices local
          const countryCode = RNLocalize.getCountry();
          //need to make sure that the phone number is in the correct format to work with firebase
          const phoneNumber = parsePhoneNumberFromString(memberNo, countryCode)
          // hardcoding countrycode for testing (emulator is US)
          // const phoneNumber = parsePhoneNumberFromString(memberNo, "IE")
          console.log('no:', phoneNumber.number)
          if (!phoneNumber.isValid()) {
            alert("member" + memberName + " number is not valid!")
          }else{
          // make sure that its not the current
          var currentUserNo = firebase.auth().currentUser.phoneNumber;
          if(currentUserNo.equalTo(phoneNumber.number)){
            alert("Cannot add your own number")
          }else{
          //need to check that they havent already sent a request to that same user!
          firebase.database()
          .ref(`circles/${this.state.user_id}/personal_circles/${this.state.circle_id}/pending`)
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
                var USERID2 = Object.keys(values)[0].toString();
                
                // new member object
                let member = {
                  name: memberName,
                  phone: phoneNumber.number,
                  inviteCode: this.state.inviteCode,
                  status: 'pending',
                  isMember: true,
                  memberID: USERID,
                  memberURL: child["profile_pic_url"],
                  requestSent: false,
                }
      
                let invite_message = {
                  inviteCode: this.state.inviteCode,
                  owner: this.state.user_id,
                  circle_id: this.state.circle_id,
                }
      
                firebase.database().ref(`circles/${USERID2}/request_others`).push(invite_message);
                firebase.database().ref(`circles/${this.state.user_id}/personal_circles/${this.state.circle_id}/pending`).push(member);
                
                alert(`request will be sent to ${memberName}`)
                // Send notification
                this.sendNotification(`${this.state.first_name} has sent you a request to join their circle.`,USERID2)
      
              } else {
                console.log('member is not apart of the app');
                const attachment = {
                  url: 'ICE://join'
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
                    firebase.database().ref(`circles/${this.state.user_id}/personal_circles/${this.state.circle_id}/pending`).push({
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
    
        removeMember(member_name, member_id, circle_id, circle_name){
          // can only remove members from your own circles
          Alert.alert(
            "ICE Circle Manager",
            "Do you wish to remove " + member_name + "?",
            [
              {
                text: "Cancel",
                onPress: () => console.log("Cancel Pressed"),
                style: "cancel"
              },// TO DO SEND NOTIFICATION TO THAT USER!
              { text: "OK", onPress: () => {
                firebase.database.ref(`circles/${this.state.user_id}/personal_circles/${circle_id}/members/${member_id}`).remove()
                this.sendNotification(`${this.state.first_name} has removed you from their circle ${circle_name}.`,member_id)
              }
               }
            ],
            { cancelable: false }
          );
        }
    
        leaveCircle(owner_id, circle_id, circle_name){
           // can only remove members from your own circles
           Alert.alert(
            "ICE Circle Manager",
            "Do you wish to leave " + circle_name + "?",
            [
              {
                text: "Cancel",
                onPress: () => console.log("Cancel Pressed"),
                style: "cancel"
              },
              { text: "OK", onPress: () => {
                firebase.database.ref(`circles/${owner_id}/personal_circles/${circle_id}/members/${this.state.user_id}`).remove() 
                this.sendNotification(`${this.state.first_name} has left your circle ${circle_name}`,owner_id)
              }
              }
            ],
            { cancelable: false }
          );
        }
    
        hideMember(member_id, circle_id,owner=null) {
          // witin this we give users the option to hide or unhide any member from personal or unpersonal circle so that they can't see them ( on map or follow me's etc.)
          // push to db
          // use this function for both personal hence the default attribute
          if(owner === null){
            // means that current user owns the circle 
            firebase.database().ref(`circles/${this.state.user_id}/personal_circles/${circle_id}/hidden/${member_id}`).update({hideMember : true})
            firebase.database().ref(`circles/${member_id}/other_circles/${circle_id}/hiddenFrom/${this.state.user_id}`).update({hideMember : true})
          }else{
            // means that current user doesnt own the circle 
            firebase.database().ref(`circles/${this.state.user_id}/other_circles/${circle_id}/hidden/${member_id}`).update({hideMember : true})
            if(owner.id === member_id){
              firebase.database().ref(`circles/${member_id}/personal_circles/${circle_id}/hiddenFrom/${this.state.user_id}`).update({hideMember : true})
            }else{
              firebase.database().ref(`circles/${member_id}/other_circles/${circle_id}/hiddenFrom/${this.state.user_id}`).update({hideMember : true})
            }
          }
        }
    
        unHideMember(member_id, circle_id,owner=null) {
          // witin this we give users the option to hide or unhide any member from personal or unpersonal circle so that they can't see them ( on map or follow me's etc.)
          // push to db
          // use this function for both personal hence the default attribute
          if(owner === null){
            // means that current user owns the circle 
            firebase.database().ref(`circles/${this.state.user_id}/personal_circles/${circle_id}/hidden/${member_id}/hideMember`).remove()
            firebase.database().ref(`circles/${member_id}/other_circles/${circle_id}/hiddenFrom/${this.state.user_id}/hideMember`).remove()
          }else{
            // means that current user doesnt own the circle 
            firebase.database().ref(`circles/${this.state.user_id}/other_circles/${circle_id}/hidden/${member_id}/hideMember`).remove()
            if(owner.id === member_id){
              firebase.database().ref(`circles/${member_id}/personal_circles/${circle_id}/hiddenFrom/${this.state.user_id}/hideMember`).remove()
            }else{
              firebase.database().ref(`circles/${member_id}/other_circles/${circle_id}/hiddenFrom/${this.state.user_id}/hideMember`).remove()
            }
          }
        }
      
          saveNewCircleName(newName, circle_id){
           console.log("this.state.saved",this.state.saved)
           firebase.database().ref(`circles/${this.state.user_id}/personal_circles/${circle_id}`).update(
              {
                name: newName
              })
          }

         async getAddress(lat,lng){
            console.log(lat,lng)
            let resp = await fetch(`https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=AIzaSyD3_KMwMzLhzJPYH7ZjGBpYbBCZiphwzFc`)
            let respJson = await resp.json();
            //console.log("respJson",respJson.results[0].formatted_address)
            var address = respJson.results[0].formatted_address
            console.log(address)
            return address
          }
    
    
          FlatListItemSeparator = () => {
            return (
              //Item Separator
              <View style={{height: 0.5, width: '100%', backgroundColor: '#C8C8C8'}}/>
            );
          };
    
        render() {
            return (
           <View style={styles.mainContainer}>
            {this.state.edit_mode ? 

             <View style={{marginTop: 10, marginBottom: 10,flexDirection:"row", alignItems:"center", alignContent:"center",justifyContent:"center"}}>
             <Button
                   buttonStyle={{marginLeft:10}}
                   type="outline"
                   icon={
                       <Icon name="check" color='red' size={Dimensions.get('window').width/10} style={{padding:5}} onPress={()=>{this.setState({edit_mode:true})}}/>
                   }
                   title="Done"
                   titleStyle={{fontFamily:"Roboto", color: 'red'}}
                   onPress={()=>{this.setState({edit_mode:false})}}
               />
               </View>
            :
                  <View style={{marginTop: 10, marginBottom: 10,flexDirection:"row", alignItems:"center", alignContent:"center", justifyContent:"center"}}>
                  <Button
                        buttonStyle={{borderColor:"#6B6B6B", borderWidth:1, marginLeft:10, width: Dimensions.get('window').width/3, height: Dimensions.get('window').width/8 }}
                        type="outline"
                        icon={
                            <Icon name="edit" color='#6B6B6B' size={20} style={{padding:5}} onPress={()=>{this.setState({edit_mode:true})}}/>
                        }
                        title="Edit"
                        titleStyle={{fontFamily:"Roboto", color: '#6B6B6B', fontWeight:"900"}}
                        onPress={()=>{this.setState({edit_mode:true})}}
                    />
                 <Button
                  buttonStyle={{borderColor:"#6B6B6B",borderWidth:1,marginLeft:20,width: Dimensions.get('window').width/3, height: Dimensions.get('window').width/8 }}
                 type="outline"
                        icon={
                            <Icon name="add" color='#6B6B6B' size={23} style={{padding:5}}/>
                        }
                        title="Add"
                        titleStyle={{fontFamily:"Roboto", color: '#6B6B6B',fontWeight:"900"}}
                        onPress={() => this.props.navigation.navigate('CircleSetup')}
                    />
                  </View>
            }
           <Modal
             visible={this.state.clicked}
             //style
             //style={{ alignSelf:'baseline'}}
             
             //overlayStyle={{borderColor:'#0EA8BE', borderRadius:2}}
             //windowBackgroundColor="rgba(255, 255, 255, .5)"
             //containerStyle={{borderColor:'#0EA8BE', borderRadius:2}}
            // overlayBackgroundColor="#F9F7F6" //"#B6F1FA"
            // width="80%"
            // borderColor="#B6F1FA"
            // onBackdropPress={() => this.setState({clicked:false})}
            animationType="slide"
            //transparent={true}
            // height="90%"
             >
                <View style={{flex:6, flexDirection:"column",justifyContent: 'center',}}>
                {this.state.currentUser.profile_pic_url ? <Avatar
                         size="xlarge" rounded source={{uri:this.state.currentUser.profile_pic_url}} containerStyle={{alignSelf: 'center'}}/> 
                      : null }
              <Text style={{alignSelf: 'center', marginTop:7, fontFamily:"Roboto", fontSize:20, fontWeight:"800"}}>{this.state.currentUser.first_name + " " + this.state.currentUser.last_name}</Text>
              <View style={{flexDirection:"row", justifyContent:"center"}}>
              <View style={{width:10, height:10,marginTop:6, borderRadius:10, backgroundColor: this.state.currentUser.mode !== "normal" ? this.state.currentUser.mode !== "offline" ? this.state.currentUser.mode !== "SOS" ? "orange" : "red" : 'gray' : 'green'}} />
              <Text style={{alignSelf: 'center', fontFamily:"Roboto",marginTop:3, marginLeft:4}}>{this.state.currentUser.mode}</Text>
              </View>
               <Divider style={{ backgroundColor: '#0EA8BE',marginTop:3, marginBottom:3 }} />
              { this.state.currentUser.currentSafeZone !== (undefined ||  "")
               ? <Text style={{textAlign: 'center', color:"#959595", fontFamily:"Roboto", marginTop:3}}>{this.state.currentUser.currentSafeZone }</Text>
               : <Text style={{textAlign: 'center', color:"#959595", fontFamily:"Roboto", marginTop:3}}>{this.state.currentUser.current_address }</Text> }
               { this.state.currentUser.currentSafeZone !== undefined 
               ? <Text style={{alignSelf: 'center', marginTop:3, color:"#959595",fontFamily:"Roboto"}}>{"Last updated: " + moment(new Date(this.state.currentUser.SafeZoneCheckIn),"HH:MM").fromNow() }</Text>
               : <Text style={{alignSelf: 'center', marginTop:3, color:"#959595", fontFamily:"Roboto"}}>{"Last updated: " +  moment(new Date(this.state.currentUser.last_checked),"HH:MM").fromNow() }</Text> }
              
              <View style={{flexDirection:"row", justifyContent:"center", marginTop:5}}>
                <FontAwesomeIcon name="battery" color='#0EA8BE' size={23} >

                </FontAwesomeIcon>
               <Text style={{alignSelf: 'center', marginTop:3, marginLeft:5}}>{Math.round(this.state.currentUser.battery_level) + "%"}</Text>
               </View>
               <Button
                  title="Message"
                  type="outline"
                  icon={
                    <FontAwesomeIcon name="envelope" color='#0EA8BE' size={23} style={{padding:5}}/>
                  }
                  style={{alignSelf: 'center', marginTop:10, fontFamily:"Roboto"}}
                  titleStyle={{color:"#0EA8BE",fontFamily:"Roboto"}}
                  onPress={()=>{
                    this.setState({clicked:false})
                    this.props.navigation.navigate('IndividualChatScreen',{other_user_id: this.state.currentUser.id, other_user_name: this.state.currentUser.first_name, profile_pic_url: this.state.profile_pic_url, first_name:this.state.first_name})
                  }}
                />
                <Button
                  title="Activity Logs"
                  type="outline"
                  titleStyle={{color:"#0EA8BE",fontFamily:"Roboto"}}
                  icon={
                    <FontAwesomeIcon name="archive" color='#0EA8BE' size={23} style={{padding:5}}/>
                  }
                  style={{alignSelf: 'center', marginTop:10}}
                  onPress={()=>{
                    this.setState({clicked:false})
                    this.props.navigation.navigate('ActivityLogScreen',{user_id: this.state.currentUser.id})
                  }}
                />
                <Button
                 titleStyle={{color:"#0EA8BE",fontFamily:"Roboto"}}
                  title="Close"
                  type="clear"
                  style={{alignSelf: 'center', marginTop:10}}
                  onPress={()=>{
                    this.setState({clicked:false})
                   // this.props.navigation.navigate('ActivityLogScreen',{user_id: this.state.currentUser.id})
                  }}
                />
                 </View>
           </Modal>
        <ScrollView style={styles.contentContainer}>
          <Modal 
              visible={this.state.showContacts}
              animationType='fade'
              style={styles.modalContent}
              >
         <Icon name="clear" color='black' onPress={() => this.addMember()}  size={Dimensions.get('window').width/10} style={styles.clear}/>
         <SearchBar
             placeholder={this.state.searchPlaceholder}
             onChangeText={(text) => this.filterSearch(text)}
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
                  onPress={() => {this.addNewMember(this.state.circle_id, contact.givenName, contact.phoneNumbers[0].number)}}
                />
                );
              }) : null }
            </ScrollView>
          </SafeAreaView>
         
         </Modal>
                    {console.log("check 2:",this.state.data)}
                    <SectionList
                     ItemSeparatorComponent={this.FlatListItemSeparator}
                     sections={this.state.data
                    }
                     renderSectionHeader={({ section }) => (
                       <View>
                       <Divider style={{backgroundColor:"#0E79BE",borderWidth:0.5}}/>
                       <View style={
                         //{flexDirection:'row',backgroundColor: '#CDDC89'}}
                         {flex: 1,
                         flexDirection: "row",
                         justifyContent: "space-between",
                         backgroundColor: "#fff",//"#e0e3f0",
                         alignItems:"center",
                         borderColor:"#0E79BE",
                         borderBottomColor:'#0E79BE',
                         borderTopColor:"#0E79BE",
                         paddingRight: 5}}
                         >
                       <View style={{ alignItems: "flex-start",flexDirection: "row",}}>
                       {this.state.edit_mode ? null :
                       <Icon name="share" color='#0E79BE' size={Dimensions.get('window').width/13} style={{padding:5}} onPress={()=>{this.shareCode(section.code)}}/>
                        }
                       </View>
                       {console.log("section.id",section.id)}
                       {this.state.edit_mode ?  <TextInput style={styles.SectionHeaderStyle} placeholder={section.title} editable={true} onChangeText={newName => {this.saveNewCircleName(newName, section.id)}}></TextInput>
                        : <Text style={styles.SectionHeaderStyle}> {section.title} </Text>
                       }
                       <View style={{alignItems: "flex-end",flexDirection: "row"}}>
                       {this.state.edit_mode ?
                      <Icon name="person-add" color='#0E79BE'  size={Dimensions.get('window').width/13} styles={{marginLeft:10}} onPress={()=>{this.addMember()}}/>
                       : <Icon name="chat" color='#0E79BE'  size={Dimensions.get('window').width/13} styles={{marginLeft:10}}  onPress={()=>{this.props.navigation.navigate('GroupChatScreen', {first_name: this.state.first_name, profile_pic_url:this.state.profile_pic_url,circle_name: "My " + section.title, circle_id: section.id})}}/> }
                      </View>
                       </View>
                       <Divider style={{backgroundColor:"#0E79BE", borderWidth:0.5}}/>
                       </View>
                     )}
                     renderItem={({ item }) => (
                       // Single Comes here which will be repeatative for the FlatListItems
                       <View style={{ flexDirection: "row", padding: 15}}>
                       <View style={{flex: 1,
                            flexDirection: "row",
                            justifyContent: "space-between",
                            alignItems:"center",
                            paddingRight: 5}}>
                      {/* <View style={{ alignItems: "flex-start",flexDirection: "row"}}> */}
                      <View style={styles.leftHeaderContainer}>
                      <View style={{ 
                          borderWidth: 5, 
                          borderColor: item.status,
                          backgroundColor: 'white',
                          height: 50, 
                          borderRadius: 30,
                          width: 50 }}>
                          {item.profile_pic_url ?   <Image
                          style={{width:"100%", height:"100%",borderRadius:30}} source={{uri:item.profile_pic_url}}/> 
                      : <Avatar size="medium" overlayContainerStyle={{backgroundColor: 'white', marginBottom: 15, marginLeft:10, width:20 }} titleStyle={{color:"black"}}  rounded title={item.first_name.slice(0,1)}/> }
                    </View>
                    <Text
                         style={styles.SectionListItemStyle}
                         //Item Separator View
                         onPress={ () => {
                           this.setState({currentUser:item, clicked: true})
                         }} >
                         {item.first_name + " " + item.last_name}
                       </Text>
                    </View>
                       {/* <View style={{width: 10,height: 10, borderRadius: 10/2,backgroundColor: item.status ,margin:5}}>
                       </View> */}
                      
                      {this.state.edit_mode ?
                       <View style={styles.rightHeaderContainer}>
                        {item.hidden ?  <Icon name="visibility" color='black' size={23} style={{padding:5}} onPress={()=>{this.unHideMember(item.id, item.circle_id)}}/>
                      : <Icon name="visibility-off" color='black' size={23} style={{padding:5}} onPress={()=>{this.hideMember(item.id, item.circle_id)}}/> }
                       <Icon name="remove" color='black' size={23} style={{padding:5}} onPress={()=>{this.removeMember(item.first_name, item.id, item.circle_id, item.circle_name)}}/>
                       </View>
                       : null }
                       </View>
                         {/* <View style={{alignItems: "flex-end",flexDirection: "row"}}>
                         <Icon name="chat" color='#CDDC89' size={23} styles={{marginRight:10}}/>
                         </View> */}
                         {/* </View> */}
                       </View>
                     )}
                     keyExtractor={(item, index) => index}
                   />
            </ScrollView>
            </View>
        
            )
        }
    }
    
    const styles = StyleSheet.create({
        mainContainer: {
           flex: 1,
           backgroundColor: '#FBFEFF',
        },
        SectionHeaderStyle: {
            borderBottomColor:"#0E79BE",
            borderTopColor:"#0E79BE",
            backgroundColor:'#fff',
            fontSize: 25,
            padding: 5,
           // color: '#a4add3',
           color: "#0E79BE",
           fontFamily: "Roboto"
          
          },
          SectionListItemStyle: {
            fontSize: 15,
            marginLeft: 15,
            color: 'black',
            fontFamily:"Roboto",
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
            backgroundColor: "#e0e3f0",
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
        clear: {
          marginBottom: 10,
          borderColor: 'black',
          //padding: ( Platform.OS === 'ios' ) ? 50 : 0,
          alignSelf: 'center'
        },
        section: {
          flexDirection: "column",
          alignContent:"center",
          // marginHorizontal: 14,
          marginBottom: 10,
          marginTop: 10,
          paddingBottom: 24,
          borderColor: "#EAEAED",
          borderWidth: 3,
          borderRadius: 1,
         // borderBottomWidth: 1
        },
        title: {
          fontSize: 23,
          textAlign:"center",
          marginVertical: 14
        },
    });


export default withNavigation(MyCircles);
