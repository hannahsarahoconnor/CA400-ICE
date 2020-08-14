import React, { Component } from 'react';
import CountDown from 'react-native-countdown-component'
import { StyleSheet, Alert, View, Platform, Image,  ImageBackground, Dimensions} from 'react-native';
import StyledButton from '../UIcomponents/StyledButton';
import { withNavigation } from 'react-navigation';
import firebase from '@react-native-firebase/app';
import '@react-native-firebase/auth';
import SOS from '../UIcomponents/SOSbutton'
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { Vibration} from 'react-native'
import {Text, Button,Header } from 'react-native-elements';
import BottomNavBar from '../UIcomponents/BottomNavNew';

const DURATION = 10000;

class SOSmode extends React.Component {
    static navigationOptions = {
        headerShown: true,
        };

    componentDidMount(){
        //Start Vibration Automatically when screen opens
        Vibration.vibrate(DURATION);
    }
    //Cancel button stops vibration and goes back to previous page
    cancelSOS=()=>{
        Vibration.cancel();
        this.props.navigation.goBack();
    }

    render() {
        return (
           <View style={styles.mainContainer}>
           {/* <Header
            backgroundColor="red"
            leftComponent={<Icon name="keyboard-backspace"  onPress={()=>{this.props.navigation.goBack()}} color='#fff' size={23} style={{padding:5}} />}
            centerComponent={{ text: 'SOS', style: { color: '#fff', fontFamily:"Roboto", fontSize:40 } }}
            /> */}
            <View style={styles.contentContainer}>
            <Image source={require('../images/melting.png')} style={{alignContent:"center", alignSelf:"center" ,width: Dimensions.get("window").width, height: Dimensions.get("window").height/2 }}/>
            <Text style={{alignSelf:"center", color:"white", fontWeight:"800", fontFamily:"Roboto"}} h4>SOS mode will activate in... </Text>
             {/* <View style = {styles.bottomView}> */}
              <CountDown size={50} until={10} 
                style={styles.countDown}
                onFinish={() => this.props.navigation.navigate("SOSActivated")}
                digitStyle={{backgroundColor: '#FFF', borderWidth: 5, borderColor: '#0EA8BE'}}
                digitTxtStyle={{color: '#0EA8BE'}}
                timeLabelStyle={{color: 'red', fontWeight: 'bold'}}
                separatorStyle={{color: '#0EA8BE'}}
                timeToShow={['S']}
                justifyContent = "center"
                timeLabels={{s: null}}
                showSeparator
                />
               <Button
                    buttonStyle={{ 
                        borderRadius:20,
                       // borderWidth:1,
                        //marginTop:10,
                        alignSelf:"center",
                        borderColor: "#4277a7",
                        padding: 5,
                      //  height: 30,
                        width: 250,}}
                    onPress={() => this.cancelSOS()}
                    accessibilityLabel="Cancel SOS"
                    titleStyle={ { color: "white",
                    fontSize: 28,
                    fontFamily: 'Roboto',
                    alignSelf: "center",
                    fontWeight: 'bold'}}
                    type="clear"
                    title="Cancel"
                    // linearGradientProps={{
                    //     colors: ["#B6F1FA", '#0EA8BE', "#80e8f6",],
                    // }}
                    />
                 {/* <Button 
                 buttonStyle={{backgroundColor:"#80e8f6"}}
                  onPress={() => this.cancelSOS()}
                  title="CANCEL"

                  style={styles.buttonCancel}
                  //justifyContent = "center"
                  //color="#80e8f6"
                  accessibilityLabel="Cancel SOS" /> */}
            </View>
            </View>
        );
    }
}
const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#E5554C',
        justifyContent: 'center',
        alignItems: 'center',
    },
    buttonCancel:{
       width: Platform.OS === "ios" ? "50%" : 250,
       height:40,
       alignSelf:"center",
       alignContent:"center",
       marginTop: 10,
    },
    bottomView: {
        justifyContent: 'center',
        alignItems: 'center',
        position: 'absolute',
        bottom: 10,
        left: 55,
        
      },
      buttonDecor: {
        fontSize: 20,
       color: 'gray',
      },
      countDown: {
        marginTop: Platform.OS === "ios" ? 15 : 0,
        marginBottom: 15
      },
      contentContainer: {
        flex: 6,
        justifyContent: 'center',
      },
      mainContainer: {
        flex: 1,
        backgroundColor: 'red',
        height: 34
     },
});
export default withNavigation(SOSmode);
  
