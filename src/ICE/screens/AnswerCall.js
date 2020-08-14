import React, {Component} from 'react';
import {View, StyleSheet, Image, Modal, Text, TouchableOpacity, TouchableHighlight, Dimensions} from 'react-native';
import firebase from '@react-native-firebase/app';
import '@react-native-firebase/auth';
import '@react-native-firebase/database';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { Vibration} from 'react-native'
import { ImageBackground } from 'react-native';

export default class AnswerCall extends Component{
    constructor(props) {
        super(props);
        this.state = {isShown: false};
        this.state= {
            caller: this.props.navigation.getParam('caller'),
            recordedMessage: false,
            pattern: [1000, 2000, 1000, 2000],
            user_id: "QuO6SxPNCZbgGiyi4yGTrMktmV53",
            audioPath: '',
        }
    }
    componentDidMount(){
        Vibration.vibrate(this.state.pattern);
    }
    componentWillUnmount(){
        Vibration.cancel();
    }
    render() {
        return (
            <View style={styles.mainContainer}>
                <ImageBackground source={require('../images/PhoneCall.png')} style={{width: '100%', height: '100%'}}>
                        <View style={{flex: 2,alignContent: 'center', alignItems: 'center', }}>
                        <Text style = {styles.headerText}>{this.state.caller}</Text>
                        </View>
                        <View style={{flex: 1, flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 30}}>
                        <View style={{
                                    alignItems:'center',
                                    justifyContent:'center',
                                    borderWidth:1,
                                    borderRadius:50,
                                    borderColor: 'transparent',
                                    width:100,
                                    height:100,
                                    }} >
                            <Icon name="alarm" color="#fff" style = {{
                                    alignItems: 'center',
                                    color: "#fff",
                                    fontSize: 40}}></Icon>
                                    <Text style={styles.imageText} >Remind Me</Text>
                            
                        </View>
                        <View style={{
                                    alignItems:'center',
                                    justifyContent:'center',
                                    borderWidth:1,
                                    borderRadius:50,
                                    borderColor: 'transparent',
                                    width:100,
                                    height:100,
                                    }} >
                            <Icon name="message" color="#fff" style = {{
                                    alignItems: 'center',
                                    color: "#fff",
                                    fontSize: 35}}></Icon>
                                    <Text style={{
                                        fontSize: 15,
                                        textAlign: 'center',
                                        margin: 3,
                                        color: "#fff",
                                        paddingTop: 0,
                                    }}>Message</Text>
                            
                        </View>
                        </View>
                        <View style={{flex: 1, flexDirection: 'row', alignContent: 'center', justifyContent: 'space-between', paddingHorizontal: 30}}>
                            <TouchableOpacity onPress={() => this.props.navigation.navigate("HomeScreen")}>
                                <View style={{
                                    borderWidth:1,
                                    borderColor:'rgba(0,0,0,0.2)',
                                    alignItems:'center',
                                    justifyContent:'center',
                                    width:Dimensions.get("window").width/4,
                                    height:Dimensions.get("window").width/4,
                                    backgroundColor:'#FB3C33',
                                    borderRadius:50,
                                    }}>
                            <Image source={require('../images/redphone.png')} />
                            </View>
                            <View>
                            <Text style={styles.imageText} >Decline</Text>
                            </View>
                            </TouchableOpacity>
                            <TouchableOpacity onPress={() => this.props.navigation.navigate("CallAnswered", {caller: this.state.caller})}>
                                <View style={{
                                    borderWidth:1,
                                    borderColor:'rgba(0,0,0,0.2)',
                                    alignItems:'center',
                                    justifyContent:'center',
                                    width:Dimensions.get("window").width/4,
                                    height:Dimensions.get("window").width/4,
                                    backgroundColor:'#4CD963',
                                    borderRadius:50,
                                    }}>
                            <Image source={require('../images/greenphone.png')} />
                            </View>
                            <Text style={styles.imageText}> Accept </Text>
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
      
  });
  
                    