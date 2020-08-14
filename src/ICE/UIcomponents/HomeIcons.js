import React, { Component } from 'react';
import { TextInput, StyleSheet, Alert, View, Image, TouchableOpacity, ImageBackground, Button, Text } from 'react-native';
import firebase from '@react-native-firebase/app';
import '@react-native-firebase/auth';

import BottomNavBar from '../UIcomponents/BottomNavNew';
import SOS from '../UIcomponents/SOSbutton'

class HomeIcons extends React.Component {

    render() {
        return (
            <View style={{flex: 1, flexDirection:"column"}}>
            <View style={{flex: 1, flexDirection:"row"}}>
                
                    <Text style = {styles.headerText}> TEST  </Text> 
        
                    <Text style = {styles.headerText}> TEST </Text>
           
            </View>
            <View style={{flex: 1, flexDirection:"row"}}>
                
            <Text style = {styles.headerText}> TEST  </Text> 

            <Text style = {styles.headerText}> TEST </Text>
   
            </View>
            </View>
                
                
           
           

           
        );
    }
}
const styles = StyleSheet.create({
    container: {
        flex: 1,
        flexDirection: 'column',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: '#EED5FD'
    },
    headerText: {
    fontSize: 40,
    textAlign: 'center',
    margin: 10,
    fontWeight: 'bold',
    color: "#2F6276", 
    paddingTop: 20
    },

});
export default HomeIcons;
  