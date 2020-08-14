import React, { Component } from 'react';
import {StyleSheet, Text, TouchableOpacity, View, Animated,TouchableWithoutFeedback} from 'react-native';
import { withNavigation } from 'react-navigation';
import { TouchableHighlight } from 'react-native-gesture-handler';
import RNShake from 'react-native-shake';

 export default class SMSbutton extends Component{
    buttonSize =  new Animated.Value(0);
    constructor(props){
        super(props)
        this.handlePressIn = this.handlePressIn.bind(this);
        this.handlePressOut = this.handlePressOut.bind(this);
    }
   
    handlePressIn(){
        Animated.timing(this.buttonSize,{
            toValue: 5,
            duration: 200,
        }).start()
    }
    handlePressOut(){
        Animated.timing(this.buttonSize,{
            toValue: 1,
            
        }),start()
    }
    handlePress() {
        Animated.sequence([
        Animated.timing(this.buttonSize,{
        //go to smaller size when pressed
            toValue:0.2,
            duration: 200,
        }),
        //return to original size
        Animated.timing(this.buttonSize,{
            toValue:1,
        })
    ]).start();
  }
   
    render(){
         //change the size of the button when it is pressed
         const animatedStyle = {
            transform: [{ scale: this.buttonSize}]
          }
          return(
            <View style = {{position: 'absolute', alignItems: "center"}} >
            <Animated.View style={[styles.button, animatedStyle]}>
            <TouchableWithoutFeedback 
            onPress={this.handlePress}>
              <Animated.View >
               <Text style={{color: "#FFF"}}>Send</Text>
              </Animated.View>
  
            </TouchableWithoutFeedback>
            </Animated.View>

            </View>
          )
    }
}
const styles = StyleSheet.create({

    button: {
        borderRadius: 36,
        width: 72,
        height: 72,
        position: "absolute",
        top: -30,
        backgroundColor:'#f00',
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: "#7F58FF",
        shadowRadius: 5,
        shadowOffset: {height: 10},
        shadowOpacity: 0.3,
        borderWidth: 3,
        borderColor: "#FFF"
    },
});

