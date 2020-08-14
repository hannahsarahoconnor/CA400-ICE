// Within this we need to determine the auth state of the user to know whether to go to main menu or to registration
// aka Loading Screen
import React, { Component } from 'react';
import { StyleSheet, View, Image, Dimensions } from 'react-native';
import firebase from '@react-native-firebase/app';
import '@react-native-firebase/auth';
import LinearGradient from 'react-native-linear-gradient';

export default class SplashScreen extends Component {
  componentDidMount() {
    setTimeout(() => {
      firebase.auth().onAuthStateChanged(user => {
        //if yes go to HomeScreen if no go to Welcome Screen
        this.props.navigation.navigate(user ? 'HomeScreen' : 'WelcomeScreen');
      });
    }, 1800);
  }

  render() {
    return (
      <LinearGradient colors={["#B6F1FA", "#80e8f6", "#0EA8BE"]}
      style={styles.logoContainer}>
        <Image
          style={styles.logo}
          source={require('../images/transparent_logo.png')}
          width={Dimensions.get('screen').width}
          height={Dimensions.get('screen').width / 1.2}
        />
      </LinearGradient>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'green'
  },
  logoContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    //backgroundColor:"#F9F7F6"
  },
  logo: {
    width: '100%',
    height: '100%'
  }
});