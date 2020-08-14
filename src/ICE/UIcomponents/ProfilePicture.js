import React, { Component } from 'react';
import firebase from '@react-native-firebase/app';
import '@react-native-firebase/auth';
import { StyleSheet, Text, View, PixelRatio, TouchableOpacity, Image, } from 'react-native';
import ImagePicker from 'react-native-image-picker';
import storage from '@react-native-firebase/storage';

const FireBaseStorage = storage();

const imagePickerOptions = {
    noData: true,
  };

//determine the path name if it is android or ios 
const getFileLocalPath = response => {
  //android is path and ios is uri 
  const { path, uri } = response;
  return Platform.OS === 'android' ? path : uri;
};

const createStorageReferenceToFile = response => {
  var userId = firebase.auth().currentUser.uid;
  return FireBaseStorage.ref('profile_pictures/'+ userId);
};

//get both the path and storage together
const uploadFileToFireBase = imagePickerResponse => {
  const fileSource = getFileLocalPath(imagePickerResponse);
  const storageRef = createStorageReferenceToFile(imagePickerResponse);
  return storageRef.putFile(fileSource);
};

export default class ProfilePicture extends Component {
  
    state = {
      ImageSource: null,  
    };

    getDownableURL = () => {
      //Add the downloadableURL to users database for easy access later on
      //Make call to firebase storage to get the resulting URL for uploaded picture]
      var user_id = firebase.auth().currentUser.uid;
      FireBaseStorage.ref(`${user_id}`).getDownloadURL().then(function(url) {
        // save URL to database
        firebase.database().ref(`users/${user_id}`).update({
          profile_pic_url: url,
      });
    });
    
    }
  
    selectPhoto() {
      const options = {
        quality: 1.0,
        maxWidth: 500,
        maxHeight: 500,
        storageOptions: {
          skipBackup: true
        }
      };
  
      ImagePicker.showImagePicker(options, (response) => {
        console.log('Response = ', response);
  
        if (response.didCancel) {
          console.log('User cancelled photo picker');
        }
        else if (response.error) {
          console.log('ImagePicker Error: ', response.error);
        }
        else if (response.customButton) {
          console.log('User tapped custom button: ', response.customButton);
        }
        else {
          let source = { uri: response.uri };
          console.log(getFileLocalPath(response));
          
          Promise.resolve(uploadFileToFireBase(response));
          
          this.setState({

            ImageSource: source

          });

          this.getDownableURL();
        }
      });
    }
  
    render() {
      return (
        <View  style={styles.container}>
          <TouchableOpacity onPress={this.selectPhoto.bind(this)}>
            <View style={styles.ImageContainer}>
            { this.state.ImageSource === null ? <Text style={styles.ProfileChange}> + </Text> :
              <Image style={styles.ImageContainer} source={this.state.ImageSource} />
            }
            </View>
          </TouchableOpacity>
        </View>
      );
    }
  }
  
  const styles = StyleSheet.create({
    container: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    ImageContainer: {
        width: 150, 
        height: 150, 
        borderRadius: 150/2,
        borderColor: '#0EA8BE',
        borderWidth: 1 / PixelRatio.get(),
        paddingTop: 0,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#0EA8BE',
    },
    ProfileChange: {
      color: 'white', 
      fontWeight: 'bold',
      justifyContent: 'center',
      alignItems: 'center',
      fontSize : 50
    }
  });
