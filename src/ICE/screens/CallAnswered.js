import React, {Component} from 'react';
import {View, StyleSheet, Image, Modal, Text, TouchableOpacity, TouchableHighlight, Dimensions} from 'react-native';
import firebase from '@react-native-firebase/app';
import '@react-native-firebase/auth';
import '@react-native-firebase/database';
import { Vibration} from 'react-native'
import { ImageBackground } from 'react-native';
import storage from '@react-native-firebase/storage';
import SoundPlayer from 'react-native-sound-player';

export default class CallAnswered extends Component{
    constructor(props) {
        super(props);
        this.state = {isShown: false};
        this.state= {
            caller: this.props.navigation.getParam('caller'),
            recordedMessage: false,
            user_id: "QuO6SxPNCZbgGiyi4yGTrMktmV53",//firebase.auth().currentUser.uid,
            audioPath: '',
            timer: null,
            minutes_Counter: '00',
            seconds_Counter: '00',
        }
    }
    
    componentDidMount(){
        this.counter()
        this.getAudio()
    }
    counter(){
        let timer = setInterval(() => {
 
            var num = (Number(this.state.seconds_Counter) + 1).toString(),
              count = this.state.minutes_Counter;
       
            if (Number(this.state.seconds_Counter) == 59) {
              count = (Number(this.state.minutes_Counter) + 1).toString();
              num = '00';
            }
       
            this.setState({
              minutes_Counter: count.length == 1 ? '0' + count : count,
              seconds_Counter: num.length == 1 ? '0' + num : num
            });
          }, 1000);
          this.setState({ timer });
    }

    async getAudio(){
        const storageRef = storage().ref(`FakeCallRecordings/${this.state.user_id}`)
        const url = await storageRef.getDownloadURL();
        console.log(url)
        this.setState({audioPath: url})
        try {
          // play from url
          SoundPlayer.playUrl(url)
          console.log("playing audio file")
      } catch (e) {
          console.log(`cannot play the sound file`, e)
      }
    }

    render() {
        return (
            <View style={styles.mainContainer}>
                    {console.log(this.state.caller)}
                    <ImageBackground source={require('../images/PhoneCall.png')} style={{width: '100%', height: '100%'}}>
                        <View style={{flex: 1, flexDirection: 'column', alignContent: 'center', alignItems: 'center', }}>
                        <Text style = {styles.headerText}>{this.state.caller}</Text>
                        <View style = {{flexDirection: 'row'}} >
                        <Text style = {styles.counter}>{this.state.minutes_Counter} : {this.state.seconds_Counter}</Text>
                        </View>
                        </View>
                        <View style={{flex: 3, flexDirection: 'column', justifyContent: 'center'}}>
                        <View style={{flexDirection: 'row', alignContent: 'center', justifyContent: 'space-evenly',  padding: 30}}>
                            <TouchableOpacity>
                                <View style={{
                                    borderWidth:1,
                                    borderColor:'rgba(0,0,0,0.2)',
                                    alignItems:'center',
                                    justifyContent:'center',
                                    width:Dimensions.get("window").width/4,
                                    height:Dimensions.get("window").width/4,
                                    backgroundColor:'#005747',
                                    borderRadius:50,
                                    }}>
                            <Image source={require('../images/mute.png')} />
                            </View>
                            <View>
                            <Text style={styles.imageText} >mute</Text>
                            </View>
                            </TouchableOpacity>
                            <TouchableOpacity >
                                <View style={{
                                    borderWidth:1,
                                    borderColor:'rgba(0,0,0,0.2)',
                                    alignItems:'center',
                                    justifyContent:'center',
                                    width:Dimensions.get("window").width/4,
                                    height:Dimensions.get("window").width/4,
                                    backgroundColor:'#025249',
                                    borderRadius:50,
                                    }}>
                            <Image source={require('../images/keypad.png')} />
                            </View>
                            <Text style={styles.imageText}> keypad </Text>
                            </TouchableOpacity>
                            <TouchableOpacity >
                                <View style={{
                                    borderWidth:1,
                                    borderColor:'rgba(0,0,0,0.2)',
                                    alignItems:'center',
                                    justifyContent:'center',
                                    width:Dimensions.get("window").width/4,
                                    height:Dimensions.get("window").width/4,
                                    backgroundColor:'#03564C',
                                    borderRadius:50,
                                    }}>
                            <Image source={require('../images/speaker.png')} />
                            </View>
                            <Text style={styles.imageText}> speaker </Text>
                            </TouchableOpacity>
                        </View>
                        <View style={{flexDirection: 'row', alignContent: 'center', justifyContent: 'space-evenly', paddingHorizontal: 30}}>
                            <TouchableOpacity>
                                <View style={{
                                    borderWidth:1,
                                    borderColor:'rgba(0,0,0,0.2)',
                                    alignItems:'center',
                                    justifyContent:'center',
                                    // marginRight:7,
                                    width:Dimensions.get("window").width/4,
                                    height:Dimensions.get("window").width/4,
                                    backgroundColor:'#2A513E',
                                    borderRadius:50,
                                    }}>
                            <Image source={require('../images/addcall.png')} />
                            </View>
                            <View>
                            <Text style={styles.imageText} >add call</Text>
                            </View>
                            </TouchableOpacity>
                            <TouchableOpacity >
                                <View style={{
                                    borderWidth:1,
                                    borderColor:'rgba(0,0,0,0.2)',
                                    alignItems:'center',
                                    justifyContent:'center',
                                    width:Dimensions.get("window").width/4,
                                    height:Dimensions.get("window").width/4,
                                    backgroundColor:'#004C41',
                                    borderRadius:50,
                                    }}>
                            <Image source={require('../images/facetime.png')} />
                            </View>
                            <Text style={{
                                fontSize: 15,
                                textAlign: 'center',
                                margin: 5,
                                color: "#0E5A4E",
                                paddingTop: 0, }}> FaceTime </Text>
                            </TouchableOpacity>
                            <TouchableOpacity >
                                <View style={{
                                    borderWidth:1,
                                    borderColor:'rgba(0,0,0,0.2)',
                                    alignItems:'center',
                                    justifyContent:'center',
                                    width:Dimensions.get("window").width/4,
                                    height:Dimensions.get("window").width/4,
                                    backgroundColor:'#00544F',
                                    borderRadius:50,
                                    }}>
                            <Image source={require('../images/contacts.png')} />
                            </View>
                            <Text style={styles.imageText}> contacts </Text>
                            </TouchableOpacity>
                        </View>
                        </View>
                        <View style={{flex: 1.5, justifyContent: 'center', alignSelf: 'center'}}>
                        <TouchableOpacity onPress={() => this.props.navigation.navigate("HomeScreen")}>
                                <View style={{
                                    borderWidth:1,
                                    borderColor:'rgba(0,0,0,0.2)',
                                    alignItems:'center',
                                    justifyContent:'center',
                                    width:Dimensions.get("window").width/4,
                                    height:Dimensions.get("window").width/4,
                                    // marginRight:7,
                                    backgroundColor:'#FB3C33',
                                    borderRadius:50,
                                    }}>
                            <Image source={require('../images/redphone.png')} />
                            </View>
                            </TouchableOpacity>
                        </View>
                        
                    
                    </ImageBackground>
                 

            
                
            </View>
    )}
}
const styles = StyleSheet.create({
    mainContainer: {
        flex: 1,
        flexDirection: 'column',
        justifyContent: "center",
        alignItems: 'center',
       backgroundColor: '#F5FCFF',
     
    },
    container: {
        flex: 1,
        backgroundColor: '#fff',
      },
      headerText: {
        fontSize: 40,
        textAlign: 'center',
        margin: 10,
        color: "#fff", 
        paddingTop: 20
        },
        imageText: {
            fontSize: 15,
            textAlign: 'center',
            margin: 5,
            color: "#fff",
            paddingTop: 0, 
       
        },
          button: {
            padding: 20
          },
          disabledButtonText: {
            color: '#eee'
          },
          buttonText: {
            fontSize: 20,
            color: "#fff"
          },
          activeButtonText: {
            fontSize: 20,
            color: "#B81F00"
          },    
          counter:{
            fontSize: 20,
            textAlign: 'center',
            color: "#fff", 
          }
      
  });
  
                    