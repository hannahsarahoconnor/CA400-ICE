//can always then add more
import React, { Component } from 'react';
import { StyleSheet, SectionList, Image, Text, View, TextInput,
    ScrollView,
    TouchableOpacity,
    Dimensions,
    SafeAreaView,
    Switch} from 'react-native';
import { Button, Avatar, ListItem, SearchBar, Header, Slider} from 'react-native-elements';
import Icon from 'react-native-vector-icons/MaterialIcons';
import firebase from '@react-native-firebase/app';
import '@react-native-firebase/auth';
import '@react-native-firebase/database';

const { width, height } = Dimensions.get("screen");

export default class PostSettings extends Component {    
    constructor(props){
    super(props);
    this.state = { 
        user_id:  firebase.auth().currentUser.uid,
        distance: 200, //default value
      }

    }

    async componentWillMount(){
        // get the defined distance
        const post_distance = await firebase.database().ref(`users/${this.state.user_id}/post_distance`).once('value');
        if(post_distance.exists()){
            this.setState({distance:post_distance.val()})
        }
    }

    updateDistance(distance){
        firebase.database().ref(`users/${this.state.user_id}/`).update({
            post_distance: distance,
        })
    }
        
    render() {
        return (
            <View style={styles.mainContainer}>
              <Header
                backgroundColor="#0EA8BE"
                leftComponent={
                <Icon name="keyboard-backspace" color='white' size={23} onPress={() => {this.props.navigation.goBack()}} size={23} style={{ marginLeft:20}}/>}
                centerComponent={<Text style={{fontSize:20, fontFamily:"Roboto",color:"white"}}>Post Settings</Text>}
                rightComponent={null}
                />
             <SafeAreaView style={styles.container}>
            <View style={styles.section}>
            <View>
              <Text style={styles.title}>Post Distance:</Text>
            </View>
            <View style={styles.group}>
                {/* //#EED5FD */}
            <Slider
                maximumValue={1500}
                minimumValue={0.1}  
                thumbTintColor="#0EA8BE"            
                value={this.state.distance}
               //trackStyle={{backgroundColor:"pink"}}
                onValueChange={distance => {
                this.setState({distance})
                this.updateDistance(distance)}
                }
                />
            </View>
            <Text style={{fontFamily:"Roboto"}}>Distance: {this.state.distance} km</Text>
            </View>
            </SafeAreaView>
            </View>
        )

    }
}

const styles = StyleSheet.create({
    mainContainer: {
        flex: 1,
        backgroundColor: '#F5FCFF',
        //height: 34
     },
    container: {
        flex: 1,
        backgroundColor: "#fff"
      },
      header: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        height: height * 0.1,
        width: width,
        paddingHorizontal: 14
      },
    section: {
        flexDirection: "column",
        marginHorizontal: 14,
        marginBottom: 14,
        paddingBottom: 24,
        borderBottomColor: "#EAEAED",
        borderBottomWidth: 1
      },
      title: {
        fontSize: 18,
        marginVertical: 14,
        fontFamily:"Roboto"
      },
      group: {
       // flexDirection: "row",
        borderRadius: 14,
        borderWidth: 1,
        borderColor: "#B6F1FA",
        //justifyContent: "space-between"
      },
})


