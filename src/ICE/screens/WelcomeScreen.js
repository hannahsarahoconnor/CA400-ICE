 
//colour palette  https://www.colorcodehex.com/0ea8be/

import React from 'react';
import { StyleSheet, Alert, View, Image, TouchableOpacity, ImageBackground, Text, Dimensions } from 'react-native';
import StyledButton from '../UIcomponents/StyledButton';
import { createAppContainer } from 'react-navigation';
import { createStackNavigator } from 'react-navigation-stack';
import { Button, Header} from 'react-native-elements';
import Icon from 'react-native-vector-icons/MaterialIcons';
import LinearGradient from 'react-native-linear-gradient';


export default class WelcomeScreen extends React.Component {

    static navigationOptions = {
        headerShown: false,
        };

    goToTerms = () => {
        // navigate to terms of use page.
        this.props.navigation.navigate('TermsOfUseScreen');
    }

    render() {
        
        return (
            //<ImageBackground source={require('../images/welcome_pic.png')} style={{width: '100%', height: '100%'}}>
            <View style={{flex:1, backgroundColor:'#F9F7F6'}}>
             <Header
                backgroundColor="#F9F7F6"
                leftComponent={<Icon name="keyboard-backspace" color='#F9F7F6' size={23} style={{padding:5}} onPress={() => {this.props.navigation.goBack()}} />}
                centerComponent={<Text style={{alignSelf:"center", color:'#F9F7F6', fontSize:25, fontFamily:"Roboto"}}></Text>}
                rightComponent={<Icon name="more-vert" color='#F9F7F6' size={23} style={{padding:5}}/> }/>
              {/* <Image source={require('../images/name_art.png')} style={{ width:Dimensions.get('window').width, height:"23%",marginRight:5, alignSelf:"center",}}/> */}
              <View style={{flex:6, flexDirection:"column"}}>
              <Image source={require('../images/name_art.png')} style={{ marginLeft:8, width:Dimensions.get('window').width, height:"25%", alignSelf:"center"}}/>
              <Image source={require('../images/transparent_logo.png')} style={{ width:(Dimensions.get('window').width)/1.65, height:"26.55%", alignSelf:"center", alignItems:"center", justifyContent:"center"}}></Image>
              <Text style={{fontFamily:"Roboto", textAlign:"center"}}></Text>
              <Text style={{fontFamily:"Roboto", textAlign:"center", color:"#4277a7", marginBotton:20,fontSize:20}}>Personal Safety Application</Text>
              <View style={styles.bottomView}>
                <Button
                    buttonStyle={{ 
                        borderRadius:20,
                       // borderWidth:1,
                        borderColor: "#4277a7",
                        padding: 5,
                       // height: 70,
                        width: 300,}}
                    onPress={() => this.props.navigation.navigate('RegistrationScreen')}
                    accessibilityLabel="Click this button to register to ICE"
                    titleStyle={ { color: "white",
                    fontSize: 35,
                    fontFamily: 'Roboto',
                    alignSelf: "center",
                    fontWeight: 'bold'}}

                    title="Sign Up"
                    ViewComponent={LinearGradient}
                    linearGradientProps={{
                        colors: ["#B6F1FA", "#80e8f6", '#0EA8BE'],
                    }}
                    />
                <Button
                  buttonStyle={{alignContent:"center"}}
                  onPress={() => this.goToTerms()}
                  title="Terms of use"
                  type="clear"
                  titleStyle={{color:"#4277a7", fontFamily:"Roboto"}}
                >
                Terms of Use
                </Button>
                </View>
               </View>
        </View>
        );
    }   
}

const styles = StyleSheet.create({
    bottomView: {
       width: '100%',
       height: 300,
        justifyContent: 'center',
        alignItems: 'center',
        position: 'absolute',
        bottom: 0, 
      },
    buttonDecor: {
      fontSize: 20,
      color: 'gray'
    }
});