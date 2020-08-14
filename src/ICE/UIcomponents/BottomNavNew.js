import React, { Component } from 'react';
import { View, Image, StyleSheet, TouchableOpacity, Dimensions, TouchableWithoutFeedback, Animated, Text, Alert } from 'react-native';
import { StackNavigator, withNavigation } from 'react-navigation';
import UserProfileScreen from '../screens/UserProfileScreen';
import NotificationFeedScreen from '../screens/NotificationFeedScreen';
import FontAwesomeIcon from 'react-native-vector-icons/FontAwesome';
import Icon from 'react-native-vector-icons/MaterialIcons';


class BottomNavBar extends React.Component {
    render(){
        return (
          
                <View style={{

                    position: 'absolute',
                    backgroundColor: '#0E79BE',
                    border: 2,
                    radius: 3,
                    shadowOpacity: 1.2,
                    shadowRadius: 3,
                    shadowOffset: {

                        height: 3,
                        width: 3
                    },
                    x: 0,
                    y: 0,
                    style: { marginVertical: 5 },
                    bottom: 0,
                    width: Dimensions.get('window').width,
                    height: Dimensions.get('window').height/12,
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    paddingVertical: 10,
                    paddingHorizontal: 25,
                    zIndex:9,


                }}> 
                    
                   
              

                    <View style={{


                        flexDirection: 'column', alignItems: 'center', justifyContent: 'center'
                    }}>
                        <TouchableOpacity onPress={() => this.props.navigation.navigate('HomeScreen')}>
                            {/* <Image

<<<<<<< HEAD
                                style={{ width: 30, height: 30}}
=======
                                style={{ width: Dimensions.get('window').width/15, height:  Dimensions.get('window').width/15 }}
>>>>>>> db02c934952da8d33820e51abce14e12fefd7196

                                source={{ uri: 'http://pluspng.com/img-png/home-icon-png-home-house-icon-image-202-512.png' }}

                                onPress={() => this.props.navigation.navigate('MedicalProfileSetup')}
                            > */}

                            {/* </Image> */}
                            <FontAwesomeIcon name="home" size={Dimensions.get('window').width/15} color={"white"}/>

                        </TouchableOpacity>
                        <Text style={{justifyContent:'center',alignItems:'center', color:"white",fontFamily:"Roboto"}}onPress={() => this.props.navigation.navigate('HomeScreen')}>Home</Text>
                    </View>
                    
                    <View style={{
                        flexDirection: 'column', alignItems: 'center',justifyContent:'center',marginStart: Dimensions.get('window').width/15
                    }}>

                        <TouchableOpacity
                            onPress={() => this.props.navigation.navigate('UserProfileScreen')}
                        >
                            {/* <Image
                                style={{  width:  Dimensions.get('window').width/15, height:  Dimensions.get('window').width/15 }}
                                source={{ uri: 'http://simpleicon.com/wp-content/uploads/user-3-64x64.png' }}
                                onPress={() => this.props.navigation.navigate('UserProfileScreen')}
                            />
                        */}
                        <FontAwesomeIcon name="user" size={Dimensions.get('window').width/15} color={"white"}/>
                        </TouchableOpacity>
                        <Text style={{justifyContent:'center',alignItems:'center',fontFamily:"Roboto", color:"white",}} onPress={() => this.props.navigation.navigate('UserProfileScreen')}>Profile </Text>
                    </View>
                   
                        <View style={{
                             flexDirection: 'column', alignItems: 'center',marginStart: Dimensions.get('window').width/10,
                        }}>

                            <TouchableOpacity
                                onPress={() => { this.props.navigation.navigate('NotificationFeedScreen')}}
                            >
                                {/* <Image
                                    source={{ uri: 'http://simpleicon.com/wp-content/uploads/bell_1.png' }}
                                    onPress={() => { this.props.navigation.navigate('NotificationFeedScreen')}}
                                    style={{ width:  Dimensions.get('window').width/15, height:  Dimensions.get('window').width/15}}
                                    //containerStyle={{ marginBottom: 4 }}
                                /> */}
                                <Icon name="notifications" size={Dimensions.get('window').width/15} color={"white"}/>
                       
                            </TouchableOpacity>
                            <Text style={{fontFamily:"Roboto", color:"white", }}  onPress={() => { this.props.navigation.navigate('NotificationFeedScreen')}}>Notifications </Text>
                        </View>
                        <View style={{
                            flexDirection: 'column', alignItems: 'center',
                          
                        }}>
                            <TouchableOpacity
                                onPress={() => {this.props.navigation.navigate("MessageListener")}}
                            >
                                {/* <Image
                                    source={{ uri: 'https://serfob.s3.amazonaws.com/media/settings-icon-png82e-4c02-9f9a-51398c8713ae.png' }}

                                    style={{width: Dimensions.get('window').width/15, height:  Dimensions.get('window').width/15 }}
                                    // containerStyle={{  }}
                                /> */}
                                  <Icon name="message" size={Dimensions.get('window').width/15} color={"white"}/>
                     
                            </TouchableOpacity>
                            <Text style={{justifyContent:'center',fontFamily:"Roboto", alignItems:'center', color:"white", marginBottom: 1 }} onPress={() => {this.props.navigation.navigate("MessageListener")}}>Chats</Text>
                           
                        </View>

                </View>
              
    
        );
    }
}

    
export default withNavigation(BottomNavBar);