// get the keys from database
import React, { Component } from 'react';
import {  View, StyleSheet, Alert, TouchableWithoutFeedback, Dimensions} from 'react-native';
import {Card,ListItem, Button, Icon,Image,Text, Divider} from 'react-native-elements';
import { withNavigation } from 'react-navigation';
import firebase from '@react-native-firebase/app';
import '@react-native-firebase/auth';
import '@react-native-firebase/database';
import storage from '@react-native-firebase/storage';
import Video from 'react-native-video';
import Share from 'react-native-share';

class SOSLogs extends Component {
    constructor(props){
        super(props);
        this.state = { 
            userId: this.props.navigation.getParam('user_id'),
            sos:[],
        }
    }

    async getSOSkeys(){
        console.log("userId",this.state.userId)
        const keys = await firebase.database().ref(`SOS/${this.state.userId}/sessions`).once('value')
        const data = [];
        for(var i = 0; i < Object.keys(keys.val()).length; i++ ) {

            var key = Object.keys(keys.val())[i]
            console.log("key",key)
            const id = await firebase.database().ref(`SOS/${this.state.userId}/sessions/${key}`).once('value')
            const timestamp = await firebase.database().ref(`SOS/${this.state.userId}/sessions/${key}/timestamp`).once('value')
            const storageRef = storage().ref(`SOS/${this.state.userId}/${key}.MP4`)
            const file = await storageRef.getMetadata();
            console.log("file\n",file)
            const url = await storageRef.getDownloadURL();
            console.log("url",url)
            data.push({key: key, url: url, time: timestamp.val()})
        }
        this.setState({sos:data})

    }

    shareVideo(url){
       const shareOptions = {
        url: url,
        type: 'video/mp4',
        filename: 'sos_video',
       }

      Share.open(shareOptions).then((res) => { console.log(res) })
      .catch((err) => { err && console.log(err); })
      }

    componentWillMount(){
      this.getSOSkeys();
    }

    render() {
        return (
        <View style={styles.mainContainer}>
           {this.state.sos.map((video) => {
            return (
                <View>
                <Text style={{marginBottom: 10,fontSize:30, fontFamily:"Roboto", textAlign:"center"}}>
                {new Date(video.time).toDateString()}
                </Text>
                <Text style={{color:'gray', textAlign:"center"}}>{new Date(video.time).toLocaleTimeString()}</Text>
                <Video source={{uri: video.url}}
                ref={(ref) => {
                    this.player = ref
                }}                                     
                onBuffer={this.onBuffer}            
                onError={this.videoError}   
                paused={true}
                controls={true}
                style={styles.backgroundVideo} />
                <Button
                    //icon={<Icon name='play-arrow' color='#ffffff' />}
                    buttonStyle={{ alignSelf:"center", marginTop:10, borderRadius: 0, backgroundColor:"#B6F1FA", marginLeft: 0, marginRight: 0, marginBottom: 0, width:"60%"}}
                    title="Share"
                    titleStyle={{fontFamily:"Roboto", color:"#0EA8BE"}}
                    //type="outline"
                    onPress={()=> {this.shareVideo(video.url)
                    }}
                    />
                <Divider  style={{ backgroundColor: 'gray', marginBottom: 10, marginTop:10 }} />
                </View>
            )
           })}
        </View>
        )
    
    }
}

export default withNavigation(SOSLogs);

var styles = StyleSheet.create({
    backgroundVideo: {
      position: 'absolute',
      top: 0,
      left: 0,
      bottom: 0,
      right: 0,
    },
    backgroundVideo: {
        height: "60%",
        width: "100%"
      },
    mainContainer: {
        flex: 1,
    }
  });
