import React, { Component } from 'react';
import { StyleSheet, FlatList, Image, Text, View, TextInput, TouchableHighlight} from 'react-native';
import { Button, Avatar, ListItem, SearchBar, Header} from 'react-native-elements';
import Icon from 'react-native-vector-icons/Ionicons';
import firebase from '@react-native-firebase/app';
import '@react-native-firebase/auth';
import '@react-native-firebase/database';
import moment from "moment";
import storage from '@react-native-firebase/storage';
import { TouchableOpacity } from 'react-native-gesture-handler';
import BottomNavBar from "../UIcomponents/BottomNavNew";
import SOS from "../UIcomponents/SOSbutton";


export default class SocialMedia extends Component {    
    constructor(props){
    super(props);
    this.state = { 
        profile_pic_url:'',
        user_id: firebase.auth().currentUser.uid,
        text: '',
        id: '',
        image: '',
        likes: 0,
        liked: '',
        full_name: '',
        posts : [],
        post_ids : [],
        likedPosts : [],
        post_distance: 200, //default value if null
        latitude: 0,
        longitude: 0,
        posts_copy: []
        }
    }

    async calculatePostDistance(posts){
      //this.setState({posts: posts}]
      // current user location
      // approximate radius of earth in km is 6373.0   
      const latitude = await firebase.database().ref(`users/${this.state.user_id}/latitude`).once('value');
      const longitude = await firebase.database().ref(`users/${this.state.user_id}/longitude`).once('value');
      const post_distance = await firebase.database().ref(`users/${this.state.user_id}/post_distance`).once('value');
      // copy of posts
      var pi = Math.PI;
      posts.map((post) => {
          console.log(post.id,post.latitude,post.longitude)
         
        lat1 = parseFloat(latitude.val()) * (pi/180) //convert to radians
        lon1 = parseFloat(longitude.val()) * (pi/180);
        lat2 = parseFloat(post.latitude) * (pi/180);
        lon2 = parseFloat(post.longitude) * (pi/180);
        dlon = lon2 - lon1
        dlat = lat2 - lat1
        a = Math.sin(dlat / 2)**2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dlon / 2)**2
        c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
        distance = 6373.0 * c
        if(distance > parseFloat(post_distance.val())){
          // dont show
          var index = this.state.posts_copy.indexOf(post)
          posts.splice(index, 1)
        }
      })

      // SORT BY TIMESTAMP
      posts.sort(function(a,b){
        // Turn your strings into dates, and then subtract them
        // to get a value that is either negative, positive, or zero.
        return new Date(b.timestamp) - new Date(a.timestamp);
       });

      this.setState({posts})
}


    async getCurrentUserDetails() {
        const profile_pic_url = await firebase.database().ref(`users/${this.state.user_id}/profile_pic_url`).once('value');
        this.setState({profile_pic_url:profile_pic_url.val()});
        const first_name = await firebase.database().ref(`users/${this.state.user_id}/first_name`).once('value');
        const last_name = await firebase.database().ref(`users/${this.state.user_id}/last_name`).once('value');
        var full_name = first_name.val() + " " + last_name.val();
        this.setState({full_name:full_name});
        
    }
    async get_liked_posts(){
        const posts = await firebase.database().ref(`users/${this.state.user_id}/liked_posts`).once(`value`)
        var post_ids = Object.keys(posts.val())
        if (post_ids === null){
            this.setState({post_ids: []})
        }
        else{
            this.setState({post_ids: post_ids})
        } 
     }

    LikePost = post_id =>{
        //firebase.database().ref(`SocialMedia/${post.id}`).update
        firebase.database().ref(`users/${this.state.user_id}/liked_posts/${post_id}`).push({
            time: firebase.database.ServerValue.TIMESTAMP
        })
        this.get_liked_posts()

        firebase.database().ref(`SocialMedia/${post_id}/likedBy/${this.state.user_id}`).update({
            full_name: this.state.full_name,
            avatar: this.state.profile_pic_url
        }).then((data)=>{
            //success callback
            console.log('data ' , data)
        }).catch((error)=>{
            //error callback
            console.log('error ' , error)
        })

        firebase.database()
        .ref(`SocialMedia/${post_id}/likes`)
        .once('value')
        .then(snapshot => {
            if(snapshot.exists()){
                var likes = snapshot.val() + 1    
                firebase.database().ref(`SocialMedia/${post_id}`).update({
                    likes: likes
                }).then((data)=>{
                    //success callback
                    console.log('data ' , data)
                }).catch((error)=>{
                    //error callback
                    console.log('error ' , error)
                })

                
            }
            else{
                
                firebase.database().ref(`SocialMedia/${post_id}`).update({
                    likes:  1
                }).then((data)=>{
                    //success callback
                    console.log('data ' , data)
                }).catch((error)=>{
                    //error callback
                    console.log('error ' , error)
                })

            }
            })
    }

    UnlikePost = post_id =>{
        console.log(post_id)
        firebase.database().ref(`SocialMedia/${post_id}/likedBy/${this.state.user_id}`).remove()
        firebase.database().ref(`users/${this.state.user_id}/liked_posts/${post_id}`).remove()
        this.get_liked_posts()

        firebase.database()
        .ref(`SocialMedia/${post_id}/likes`)
        .once('value')
        .then(snapshot => {
            if(snapshot.exists()){
                var likes = snapshot.val() - 1    
                firebase.database().ref(`SocialMedia/${post_id}`).update({
                    likes: likes
                }).then((data)=>{
                    //success callback
                    console.log('data ' , data)
                }).catch((error)=>{
                    //error callback
                    console.log('error ' , error)
                })  
            }
            })
        
    }

    componentDidMount(){
        //get current username and profile picture
        this.getCurrentUserDetails()
        this.get_liked_posts()
        firebase.database().ref(`SocialMedia/`).on('value', async (dataSnapshot) => {
            if(dataSnapshot.val()){
                var data = []
                if (dataSnapshot.val() !== null){
                    data.push(Object.values(dataSnapshot.val()))
                }
                console.log("data = ", data)
                var d = dataSnapshot.val();
                var what = Object.keys(d);
                console.log(what)
                var posts = Object.values(dataSnapshot.val());
                console.log(posts)
                this.setState({posts_copy:posts})
                this.calculatePostDistance(posts)
            }
        })
        
    }


    renderHeader = () => {
        return(
            
            <View style={{flexDirection: 'row', backgroundColor: '#fff', alignItems: 'center',marginTop:10}}>
                <View style={{paddingRight: 10}}>
                <TouchableOpacity onPress={() => this.props.navigation.navigate("UserProfileScreen")}>
            
                {this.state.profile_pic_url ? <Avatar style={styles.avatar}
                     size="xlarge" rounded source={{uri:this.state.profile_pic_url}} /> 
                  : null }
                  </TouchableOpacity>
                  </View>
              
            <TouchableOpacity onPress={() => this.props.navigation.navigate("AddPost") }>
                <Text></Text>
                <Text> </Text>
                <Text
                    multiline={true}
                    numberOfLines={4}
                    style={{ flex: 1, fontFamily:"Roboto" }}
                > Whats on your mind?</Text>
                <Text> </Text>
                <Text></Text>
            </TouchableOpacity>

            </View>
        
            

        )
    }
    //<Image source={{uri:post.avatar}} style={styles.postavatar} />
    renderPost = post => {
       
        var likedPosts = this.state.post_ids;
        
         
        return (
            <View style={styles.feedItem}>
                
                { post.avatar ? <Image source={{uri:post.avatar}} style={styles.postavatar} />
                : <Image style={styles.postavatar} />}
                <View style={{ flex: 1 }}>
                    <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
                        <View>
                            <Text style={styles.name}>{post.name}</Text>
                            <Text style={styles.timestamp}>{moment(post.timestamp).fromNow()}</Text>
                        </View>

                        <Icon name="ios-more" size={24} color="#73788B" />
                    </View>
                    <Text style={styles.post}>{post.text}</Text>
                    { post.image ? <Image source={{uri: post.image}} style={styles.postImage} resizeMode="cover" />
                    : <View style={{margin: 20}}></View>}
                    <View style={{ flexDirection: "row" }}>
                       
                        {post.likes ? <Text> {post.likes} </Text>
                        : null}
                        { likedPosts.includes(post.id) ? <Icon name="ios-heart" size={24} color="red" style={{ marginRight: 16 }} onPress={() => this.UnlikePost(post.id)} />
                        : <Icon name="ios-heart-empty" size={24} color="#73788B" style={{ marginRight: 16 }}  onPress={() => this.LikePost(post.id)}/>}
                        
                        <Icon name="ios-chatboxes" size={24} color="#73788B" />
                        {/* <Modal>

                        </Modal> */}
                    </View>
                </View>
            </View>
        );
    };
    
    render() {
        return (
          
            <View style={{backgroundColor: '#F9F7F6'}}>
            <View style={styles.header}>
            <Header
            backgroundColor="#0EA8BE"
            leftComponent={<Icon name="ios-arrow-round-back" color='white' size={27} style={{padding:5}} onPress={() => this.props.navigation.goBack()}/>}
            centerComponent={{ text: `News Feed`, style: { color: 'white', fontSize:18 } }}
            rightComponent={
            <TouchableHighlight onPress={()=>{this.props.navigation.navigate('PostSettings')}}>
            <Image style={{height:20, width:20, marginBottom:5, marginRight: 7}} source={require('../images/settings.png')}/>
            </TouchableHighlight>
            }
            />
            </View>

            <View style={{backgroundColor: '#F9F7F6',}}>
            <FlatList
                ListHeaderComponent={this.renderHeader()}
                style={styles.feed}
                //get data from posts on firebase
                data={this.state.posts}
                //put each post into the render post function
                renderItem={({ item }) => (
                <View style={styles.feedItem}>
                { item.avatar ? <Image source={{uri:item.avatar}} style={styles.postavatar} />
                : <Image style={styles.postavatar} />}
                <View style={{ flex: 1,}}>
                    <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
                        <View>
                            <Text style={styles.name}>{item.name}</Text>
                            <Text style={styles.timestamp}>{moment(item.timestamp).fromNow()}</Text>
                        </View>
                        <Icon name="ios-more" size={24} color="#73788B" />
                    </View>
                    <Text style={styles.post}>{item.text}</Text>
                    { item.image ? <Image source={{uri: item.image}} style={styles.postImage} resizeMode="cover" />
                    : <View style={{margin: 20}}></View>}
                    <View style={{ flexDirection: "row" }}>
                        {item.likes ? <Text> {item.likes} </Text>
                        : null}
                        { this.state.post_ids.includes(item.id) ? <Icon name="ios-heart" size={24} color="red" style={{ marginRight: 16 }} onPress={() => this.UnlikePost(item.id)} />
                        : <Icon name="ios-heart-empty" size={24} color="#73788B" style={{ marginRight: 16 }}  onPress={() => this.LikePost(item.id)}/>}
                        <Icon name="ios-chatboxes" size={24} color="#73788B"  onPress={() => this.props.navigation.navigate("Comments", {post_id : item.id})}/>
                        
                    </View>
                </View>
            </View>
                 )}
                keyExtractor={item => item.id}
                showsVerticalScrollIndicator={false}
            ></FlatList>
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
       backgroundColor: '#F9F7F6',
     
    },
    contentContainer: {
        flex: 6,
        flexDirection: 'column',
        justifyContent: 'space-evenly',
        alignContent: 'center',
        backgroundColor: '#F9F7F6'
      },
      feed: {
        marginHorizontal: 16,
        backgroundColor: '#F9F7F6',
        marginBottom:150 
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
        fontFamily:"Roboto",
        color: "#454D65"
    },
    timestamp: {
        fontSize: 11,
        color: "#C4C6CE",
        fontFamily:"Roboto",
        marginTop: 4
    },
    post: {
        marginTop: 16,
        fontSize: 14,
        fontFamily:"Roboto",
        color: "#838899"
    },
    postImage: {
        width: undefined,
        height: 150,
        borderRadius: 5,
        marginVertical: 16
    },
    postavatar: {
        width: 36,
        height: 36,
        borderRadius: 18,
        marginRight: 16
    },
})
