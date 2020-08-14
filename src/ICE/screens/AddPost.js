import React, { Component } from 'react';
import { StyleSheet, FlatList, Image, Text, View, TextInput} from 'react-native';
import { Button, Avatar, ListItem, SearchBar, Header} from 'react-native-elements';
import Icon from 'react-native-vector-icons/Ionicons';
import firebase from '@react-native-firebase/app';
import '@react-native-firebase/auth';
import '@react-native-firebase/database';
import ImagePicker from 'react-native-image-picker';
import moment from "moment";
import storage from '@react-native-firebase/storage';
import { TouchableOpacity } from 'react-native-gesture-handler';

const FireBaseStorage = storage();

const imagePickerOptions = {
  noData: true,
};


const getFileLocalPath = response => {
    //android is path and ios is uri 
    const { path, uri } = response;
    return Platform.OS === 'android' ? path : uri;
  };
  
  const createStorageReferenceToFile = response => {
    firebase.database().ref(`SocialMedia/`).on('value', async (dataSnapshot) => {
        if(dataSnapshot.val()){
            var data = [];
            dataSnapshot.forEach(ss => {
                if(ss.child('id').val() !== null)
                    data.push(parseFloat(ss.child('id').val()));
                    console.log(ss.child('id').val())
            });
            
            var new_id = ((data.sort().pop()) + 1).toString()
        return FireBaseStorage.ref(`SocialMediaPosts/${new_id}/`);
        }
  })
}
  
  //get both the path and storage together
  const uploadFileToFireBase = imagePickerResponse => {
    const fileSource = getFileLocalPath(imagePickerResponse);
    const storageRef = createStorageReferenceToFile(imagePickerResponse);
    return storageRef.putFile(fileSource);
  };

export default class AddPost extends Component {   
    
    constructor(props){
    super(props);
    this.state = { 
        profile_pic_url:'',
        currentUser: {},
        user_id: "QuO6SxPNCZbgGiyi4yGTrMktmV53", //firebase.auth().currentUser.uid,
        text: '',
        id: "",
        ImageSource: null, 
        avatar: '',
        image: '',
        full_name: '',
        latitude: 0,
        longitude: 0,
        }
    }
    async getCurrentUserDetails() {
        const profile_pic_url = await firebase.database().ref(`users/${this.state.user_id}/profile_pic_url`).once('value');
        const latitude = await firebase.database().ref(`users/${this.state.user_id}/latitude`).once('value');
        const longitude = await firebase.database().ref(`users/${this.state.user_id}/longitude`).once('value');
        this.setState({profile_pic_url:profile_pic_url.val(),latitude: latitude.val(),longitude:longitude.val()});
        const first_name = await firebase.database().ref(`users/${this.state.user_id}/first_name`).once('value');
        const last_name = await firebase.database().ref(`users/${this.state.user_id}/last_name`).once('value');
        var full_name = first_name.val() + " " + last_name.val();
        this.setState({full_name: full_name});
    }

    componentDidMount(){
        //get current username and profile picture
        this.getCurrentUserDetails()
        //  firebase.database().ref(`SocialMedia/`).on('value', async (dataSnapshot) => {
        //     if(dataSnapshot.val()){
        //         var data = [];
        //         dataSnapshot.forEach(ss => {
        //             if(ss.child('id').val() !== null)
        //                 data.push(parseFloat(ss.child('id').val()));
        //                 console.log(ss.child('id').val())
        //         });
                
        //         console.log("data = " + data)
                
        //     }
           
            
        // })
        let id = firebase.database().ref(`SocialMediaPosts/`).push().key
        console.log(id)
        this.setState({id: id})
    }
    async newPost(){
        const date = new Date();
        const timestamp = date.getTime()
        if(this.state.ImageSource !== null){
          
          const storageRef = storage().ref(`SocialMediaPosts/${this.state.id}`)
          const url = await storageRef.getDownloadURL()
          firebase.database().ref(`SocialMedia/${this.state.id}`).update({
            id: this.state.id,
            name: this.state.full_name,
            text: this.state.text,
            timestamp: timestamp,
            avatar: this.state.profile_pic_url,
            image: url,
            latitude: this.state.latitude,
            longitude: this.state.longitude
           
        }).then((data)=>{
            //success callback
            console.log('data ' , data)
        }).catch((error)=>{
            //error callback
            console.log('error ' , error)
        })
        }
        else{
          firebase.database().ref(`SocialMedia/${this.state.id}`).update({
            id: this.state.id,
            name: this.state.full_name,
            text: this.state.text,
            timestamp: timestamp,
            avatar: this.state.profile_pic_url,
        }).then((data)=>{
            //success callback
            console.log('data ' , data)
        }).catch((error)=>{
            //error callback
            console.log('error ' , error)
        })

        }
        this.props.navigation.goBack()
    
}
async getDownableURL(){
    //Add the downloadableURL to users database for easy access later on
    //Make call to firebase storage to get the resulting URL for uploaded picture]
    var user_id = firebase.auth().currentUser.uid;
    const storageRef = storage().ref(`SocialMediaPosts/${this.state.id}`)
    const url = await storageRef.getDownloadURL()
    
    this.setState({image: url})
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
        const { path, uri } = response;
        var file_source = Platform.OS === 'android' ? path : uri;
        const storageRef = storage().ref(`SocialMediaPosts/${this.state.id}`)
          
        Promise.resolve(storageRef.putFile(file_source));
       
        this.setState({

          ImageSource: source

        });
      }
    });
  }


    render() {
        return (
          
            <View style={{flex:1, flexDirection: 'column',backgroundColor: '#F5FCFF'}}>
            <View style={styles.header}>
            <Header
            backgroundColor="#0EA8BE"
            leftComponent={<Icon name="ios-arrow-round-back" color='#fff' size={27} style={{padding:5}} onPress={() => this.props.navigation.goBack()}/>}
            centerComponent={{ text: `New Post`, style: { color: '#fff', fontSize:20, fontFamily:"Roboto" } }}
            rightComponent={<Icon name="md-more" color='#fff' size={23} style={{padding:5}}/>}
            />
            </View>
            <View style={{flex: 1, paddingTop: 20, flexDirection: 'row', alignItems: 'center'}}>
                <TouchableOpacity onPress={() => this.props.navigation.navigate("UserProfileScreen")}>
            
                {this.state.profile_pic_url ? <Avatar style={styles.avatar}
                     size="xlarge" rounded source={{uri:this.state.profile_pic_url}} /> 
                  : null }
                  </TouchableOpacity>
                    <View style={{paddingLeft: 20}}>
                  <Text style={styles.username}>{this.state.full_name}</Text>
                  </View>
                  </View>
            <View style={{flex: 6, justifyContent: 'flex-start'}}>
                 
            
            <TextInput
                        autoFocus={true}
                        multiline={true}
                        numberOfLines={20}
                        style={{ flex: 1, fontFamily:"Roboto" }}
                        placeholder="Whats on your mind?"
                        onChangeText={text => this.setState({ text })}
                        value={this.state.text}
                    ></TextInput>
            </View>
            <View style={{justifyContent: "space-between", flexDirection: 'row'}}>
                <View style = {{justifyContent: 'space-evenly' }}>
                    <TouchableOpacity onPress={this.selectPhoto.bind(this)}>
                    { this.state.ImageSource === null ? <Icon name="md-images"  color="#0EA8BE" size={50} style={{padding:5}}/>  :
                    
                    <Image source={this.state.ImageSource } style={{width: 80, height: 80, padding:5}} ></Image>
                 
                    }
                    </TouchableOpacity>

                </View>
                <View style = {{justifyContent: 'space-evenly', marginEnd: 30}}>
                    <TouchableOpacity onPress={() => this.newPost()}>
                    <Text style={styles.username}>Post</Text>
                    </TouchableOpacity>
                </View>
            
            

            </View>
           

          
        
        </View>

    )}
}
const styles = StyleSheet.create({
    mainContainer: {
        flex: 1,
        flexDirection: 'column',
        justifyContent: "center",
        alignItems: 'center',
       backgroundColor: '#F5FCFF',
     
    },
    contentContainer: {
        flex: 6,
        flexDirection: 'column',
        justifyContent: 'space-evenly',
        alignContent: 'center',
        backgroundColor: '#F5FCFF'
      },
      feed: {
        marginHorizontal: 16,
        backgroundColor: '#F5FCFF'
    },
    feedItem: {
        backgroundColor: "#FFF",
        borderRadius: 5,
        padding: 8,
        flexDirection: "row",
        marginVertical: 8
    },
    avatar: {
        width: 60,
        height: 60,
        borderRadius: 18,
        justifyContent: 'center',
    },
    name: {
        fontSize: 15,
        fontWeight: "500",
        color: "#454D65"
    },
    username: {
        fontFamily:"Roboto",
        fontSize: 15,
        fontWeight: 'bold',
        color: '#2F6276'
    },
    timestamp: {
        fontSize: 11,
        color: "#C4C6CE",
        marginTop: 4
    },
    post: {
        marginTop: 16,
        fontSize: 14,
        color: "#838899"
    },
    postImage: {
        width: undefined,
        height: 150,
        borderRadius: 5,
        marginVertical: 16
    }
})
