
//SOS button for home screen 
import React, { Component } from 'react';
import {StyleSheet, Text, Dimensions, View, Animated,TouchableWithoutFeedback} from 'react-native';
import { withNavigation } from 'react-navigation';
import { TouchableHighlight } from 'react-native-gesture-handler';
import RNShake from 'react-native-shake';


class SOS extends React.Component {
  componentWillMount() {
    RNShake.addEventListener('ShakeEvent', () => {
      this.props.navigation.navigate('SOSmode')
    });
  }
 
  componentWillUnmount() {
    RNShake.removeEventListener('ShakeEvent');
  }

  render(){
  return(
    <View style={styles.SOSbutton} >
    <TouchableWithoutFeedback onPress={() => this.props.navigation.navigate('SOSmode')} >
            <View style={[styles.button, styles.actionBtn]}>
              <Text style = {styles.text} >SOS </Text>
            </View>
        </TouchableWithoutFeedback>      
     </View>
   
  )
  }
}
const styles = StyleSheet.create({
SOSbutton: {
  position: 'absolute',
  alignSelf: 'center',
  //backgroundColor: '#F9F7F6',
  width: 70,
  height: 70,
  borderRadius: 35,
  bottom: 35,
  zIndex: 10

},
button: {
  width: 70,
  height: 70,
  alignItems: 'center',
  justifyContent: 'center',
  shadowColor: "#7F58FF",
  shadowOpacity: 0.1,
  shadowOffset: { x: 2, y: 0 },
  shadowRadius: 2,
  borderRadius: 35,
  position: 'absolute',
  bottom: 20,
  right: 0,
  top: 5,
  left: 5,
  shadowOpacity: 5.0,

},
actionBtn: {

  backgroundColor:'#f00',
  textShadowOffset: { width: 5, height: 5 },
  textShadowRadius: 10,
  borderWidth: 2,
  borderColor: '#fff'
},
text: {color:"#FFF", justifyContent:'center',fontSize: 20, fontWeight:"900", fontFamily:"Roboto"}
});


export default withNavigation(SOS)

// export default class SOS extends Component {
//   buttonSize = new Animated.Value(0)
//   constructor(props) {
//     super(props);
//     this.handlePressIn = this.handlePressIn.bind(this);
//     this.handlePressOut = this.handlePressOut.bind(this);
//   }
 
//   //initial button press handler animated 
//   handlePress() {
//     Animated.sequence([
//       Animated.timing(this. buttonSize,{
//         //go to smaller size when pressed
//         toValue:0.2,
//         duration: 200,
//       }),
//       //return to original size
//       Animated.timing(this. buttonSize,{
//         toValue:1,
//       })
//     ]).start();
//   }
 
//   render() {
//       //change the size of the button when it is pressed
//     const animatedStyle = {
//       transform: [{ scale: this.buttonSize}]
//     }
//     return (
//       <View style = {{position: 'absolute', alignItems: "center"}} >
//         <Animated.View style={[styles.button, animatedStyle]}>
//         <TouchableHighlight onPress={this.handlePress}>
//           <Animated.View >
//            <Text style={styles.text}>SOS</Text>
//           </Animated.View>
          
//         </TouchableHighlight>
//         </Animated.View>
  
//       </View>
//     );
//   }
// }

// const styles = StyleSheet.create({
  
//   button: {
//         borderRadius: 36,
//         width: 72,
//         height: 72,
//         position: "absolute",
//         top: -30,
//         backgroundColor:'#f00',
//         justifyContent: 'center',
//         alignItems: 'center',
//         shadowColor: "#7F58FF",
//         shadowRadius: 5,
//         shadowOffset: {height: 10},
//         shadowOpacity: 0.3,
//         borderWidth: 3,
//         borderColor: "#FFF"
//   },
//   text: {
//     color: "#FFF"
//   },
//   image:{
    
//       justifyContent: 'center',
//     alignItems: 'center',
//       width: '100%', 
//       height: '100%',
//   }
// });
