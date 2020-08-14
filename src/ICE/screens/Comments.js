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
import { TouchableOpacity, ScrollView } from 'react-native-gesture-handler';

export default class Comments extends Component {
    constructor(props){
        super(props)
        this.state = {
            post_id: this.props.navigation.getParam('post_id'),
            user_id: "QuO6SxPNCZbgGiyi4yGTrMktmV53", //firebase.auth().currentUser.uid,
            post_details: [],
            profile_pic_url: '',
            full_name: '',
            comment_id: '',
            text: '',
            comment: '',
            comments: [],
            placeholder: "Write a comment.."
          }
    }
    async fetchData() {
        const profile_pic_url = await firebase.database().ref(`users/${this.state.user_id}/profile_pic_url`).once('value');
        this.setState({profile_pic_url:profile_pic_url.val()});
        const first_name = await firebase.database().ref(`users/${this.state.user_id}/first_name`).once('value');
        const last_name = await firebase.database().ref(`users/${this.state.user_id}/last_name`).once('value');
        var full_name = first_name.val() + " " + last_name.val();
        this.setState({full_name: full_name});
        firebase.database().ref(`SocialMedia/${this.state.post_id}`).on('value', async (dataSnapshot) => {
            if(dataSnapshot.val()){
                var d = dataSnapshot.val();
                this.setState({post_details: d})
            }
        })
        firebase.database().ref(`SocialMedia/${this.state.post_id}/comments`).on('value', async (dataSnapshot) => {
            if(dataSnapshot.val()){
                var d = Object.values(dataSnapshot.val());
                this.setState({comments: d})
            }
        })
       
    }
        
    componentDidMount(){
        
        this.fetchData()
        console.log(this.state.comments)
    }
    postComment(){
        let comment_id = firebase.database().ref(`SocialMediaPosts/`).push().key
        console.log("posting comment")
        const date = new Date();
        const timestamp = date.getTime()
        firebase.database().ref(`SocialMedia/${this.state.post_id}/comments/${comment_id}`).update({
            name: this.state.full_name,
            user_id: this.state.user_id,
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
        this.setState({text: ''})
      

    }
    render() {
        return (
            <ScrollView style={{backgroundColor: '#F5FCFF', flex: 1, flexDirection: 'column'}}>
            <View style={styles.header}>
            <Header
            backgroundColor="#0EA8BE"
            leftComponent={<Icon name="ios-arrow-round-back" color='#fff' size={27} style={{padding:5}} onPress={() => this.props.navigation.goBack()}/>}
            centerComponent={{ text: `${this.state.post_details.name}' Post`, style: { color: '#fff', fontFamily:"Roboto", fontSize:15 } }}
            rightComponent={<Icon name="md-more" color='#fff' size={23} style={{padding:5}}/>}
            />
            </View>
            <View style={styles.feedItem}>
            { this.state.profile_pic_url ? <Image source={{uri:this.state.profile_pic_url}} style={styles.postavatar} />
            : <Image style={styles.postavatar} />}
            <View style={{ flex: 1 }}>
                <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
                    <View>
                        <Text style={styles.name}>{this.state.post_details.name}</Text>
                        <Text style={styles.timestamp}>{moment(this.state.post_details.timestamp).fromNow()}</Text>
                    </View>
                    <Icon name="ios-more" size={24} color="#73788B" />
                </View>
                <Text style={styles.post}>{this.state.post_details.text}</Text>
                { this.state.post_details.image ? <Image source={{uri: this.state.post_details.image}} style={styles.postImage} resizeMode="cover" />
                : <View style={{margin: 20}}></View>}
                
            </View>
            </View>
            <View style={{flex: 1,flexDirection: 'row', justifyContent: 'space-between', backgroundColor: '#fff', alignItems: 'center'}}>
                
                    { this.state.profile_pic_url ? <Image source={{uri:this.state.profile_pic_url}} style={styles.profileShown} />
                    : <Image style={styles.profileShown} />}
              
                <TextInput
                        autoFocus={true}
                        multiline={true}
                        numberOfLines={4}
                        style={{ flex: 1, fontFamily:"Roboto"}}
                        placeholder="Write a comment..."
                        onChangeText={(text) => this.setState({ text: text })}
                    > </TextInput>
                <Icon name="md-send" size={24} color="#0EA8BE" onPress={() => this.postComment()} />
            
            </View>
            <View style={{backgroundColor: '#F5FCFF',}}>
            <View style={{flex: 3, flexDirection: 'column'}}>
                <FlatList
                style={styles.feed}
                //get data from posts on firebase
                data={this.state.comments}
                //put each post into the render post function
                renderItem={({ item }) => (
                <View style={styles.feedItem}>
                    { item.avatar ? <Image source={{uri:item.avatar}} style={styles.postavatar} />
                    : <Image style={styles.postavatar} />}
                    <View style={{ flex: 1 }}>
                    <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
                        <View>
                            <Text style={styles.name}>{item.name}</Text>
                            <Text style={styles.timestamp}>{moment(item.timestamp).fromNow()}</Text>
                        </View>
                    </View>
                    <Text style={styles.post}>{item.text}</Text>
                    
                </View>
            </View>
                 )}
                keyExtractor={item => item.id}
                showsVerticalScrollIndicator={false}
            ></FlatList>
            </View>
            </View>
        
        </ScrollView>
        )
    }
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
        width: 40,
        height: 40,
        borderRadius: 18,
        justifyContent: 'center',
    },
    name: {
        fontSize: 15,
        fontWeight: "500",
        color: "#454D65",
        fontFamily:"Roboto"
    },
    timestamp: {
        fontSize: 11,
        color: "#C4C6CE",
        marginTop: 4,
        fontFamily:"Roboto"
    },
    post: {
        marginTop: 16,
        fontSize: 14,
        color: "#838899",
        fontFamily:"Roboto"
    },
    postImage: {
        width: undefined,
        height: 150,
        borderRadius: 5,
        marginVertical: 16
    },
    profileShown:{
        width: 36,
        height: 36,
        borderRadius: 18,
    },
    postavatar: {
        width: 36,
        height: 36,
        borderRadius: 18,
        marginRight: 16
    },
})