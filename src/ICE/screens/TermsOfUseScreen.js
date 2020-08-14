// default empty screen code

import React, { Component } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import firebase from '@react-native-firebase/app';
import '@react-native-firebase/auth';

export default class TermsOfUseScreen extends Component {

  static navigationOptions = {
        title: 'Terms Of Use',
        headerStyle: { backgroundColor: '#4277a7' },
        headerTitleStyle: { color: 'white' },
        leftButtonStyle: { color:'white' },
      }
    
  render() {
    return (
      <View style={styles.container}>
      <Text style={styles.welcome}>Terms Of Use</Text>
      </View>
    )
  }
}

const styles = StyleSheet.create({
    container: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: 'green',
    },
    title: {
      fontSize: 20,
      textAlign: 'center',
      margin: 10,
      color: 'black',
    },
    
    
}
);