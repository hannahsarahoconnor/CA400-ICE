import React, { Component } from "react";
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Image,
  Text,
  Dimensions
} from "react-native";
import firebase from "@react-native-firebase/app";
import "@react-native-firebase/auth";
import "@react-native-firebase/database";
import { GiftedChat } from "react-native-gifted-chat";
import Icon from "react-native-vector-icons/MaterialIcons";
import { Header } from "react-native-elements";
import { TypingAnimation } from 'react-native-typing-animation';
import KeyboardSpacer from "react-native-keyboard-spacer";
import { ThemeConsumer } from "styled-components";
import BottomNavBar from "../UIcomponents/BottomNavNew";
import SOS from "../UIcomponents/SOSbutton";

export default class SMS extends Component {
  render() {
    return (
      <View style={styles.mainContainer}>
        <Header
          backgroundColor="#0EA8BE"
          leftComponent={
            <Icon
              name="keyboard-backspace"
              color="#fff"
              size={23}
              style={{ padding: 5 }}
              onPress={() => this.props.navigation.goBack()}
            />
          }
          centerComponent={{
            text: `112 SMS`,
            style: { color: "#fff", fontFamily: "Roboto", fontSize: 20 }
          }}
          rightComponent={
            <Icon
              name="more-vert"
              color="#fff"
              size={23}
              style={{ padding: 5 }}
            />
          }
        />
        <View style={styles.contentContainer}>
          {/* <View style={{flexDirection:"row", justifyContent: "flex-start", alignContent: "center" }}> */}
          <Text style={styles.headerText}> Select a Service</Text>

          <View
           style={{
              flexDirection: "row",
              justifyContent: "center",
              alignContent: "center"
            }}
          >
            <TouchableOpacity
              style={{ marginRight: 4, marginTop: 8 }}
              onPress={() =>
                this.props.navigation.navigate("TextFormat", {
                  emergency_choice: "An Garda Síochána"
                })
              }
            >
              <Image
                source={require("../images/Gaurds.png")}
                style={{
                  borderWidth: 5,
                  justifyContent: 'center',
                  alignSelf: 'center',
                  borderColor: "#B6F1FA",
                  alignContent: 'center',
                  borderRadius: 10,
                  paddingBottom: 0,
                  marginLeft: 20,
                  height: Dimensions.get("window").width / 2.5,
                  width: Dimensions.get("window").width / 2.5
                }}
              />
              <Text style={styles.imageText}>An Garda Síochána</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={{ marginLeft: 7, marginTop: 8 }}
              onPress={() =>
                this.props.navigation.navigate("TextFormat", {
                  emergency_choice: "Ambulance"
                })
              }
            >
              <Image
                source={require("../images/Ambulance.png")}
                style={{
                  borderWidth: 5,
                  justifyContent: 'center',
                  alignSelf: 'center',
                  borderColor: "#B6F1FA",
                  alignContent: 'center',
                  borderRadius: 10,
                  paddingBottom: 0,
                  marginRight: 30,
                  height: Dimensions.get("window").width / 2.5,
                  width: Dimensions.get("window").width / 2.5
                }}
              />
              <Text style={styles.imageText}>Ambulance</Text>
            </TouchableOpacity>
            </View>
          <View
           style={{
              flexDirection: "row",
              justifyContent: "center",
              alignContent: "center"
            }}
          >
            <TouchableOpacity
              style={{ marginRight: 7, marginTop: 8 }}
              onPress={() =>
                this.props.navigation.navigate("TextFormat", {
                  emergency_choice: "Coastguard"
                })
              }
            >
              <Image
                source={require("../images/CoastGaurd.png")}
                style={{
                  borderWidth: 5,
                  justifyContent: 'center',
                  alignSelf: 'center',
                  borderColor: "#B6F1FA",
                  alignContent: 'center',
                  borderRadius: 10,
                  paddingBottom: 0,
                  //margin: 5,
                  height: Dimensions.get("window").width / 2.5,
                  width: Dimensions.get("window").width / 2.5
                }}
              />
              <Text style={styles.imageText}>Coastguard</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={{ marginLeft: 4, marginTop: 8 }}
              onPress={() =>
                this.props.navigation.navigate("TextFormat", {
                  emergency_choice: "Fire Brigade"
                })
              }
            >
              <Image
                source={require("../images/Firebrigade.png")}
                style={styles.ImageIconStyle}
              />
              <Text style={styles.imageText}>Fire Brigade</Text>
            </TouchableOpacity>
            </View>
            </View>
            <SOS />
        <BottomNavBar />
      </View>
   )
  }
}
const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    flexDirection: "column",
    justifyContent: 'center',
    alignItems: "center",
    backgroundColor: "#F5FCFF"
  },
  contentContainer: {
    flex: 6,
    flexDirection: "column",
    justifyContent: "flex-start",
    alignSelf: "center"
  },
  headerText: {
    fontSize: 30,
    textAlign: "center",
    margin: 10,
    fontFamily: 'Roboto',
    fontWeight: "bold",
    color: "#0EA8BE",
    paddingTop: 20,
  },
  imageText: {
    fontSize: 15,
    textAlign: "center",
    margin: 10,
    fontFamily: 'Roboto',
    fontWeight: "bold",
    color: '#0EA8BE',
    paddingTop: 0
  },
  ImageIconStyle: {
    borderWidth: 5,
    justifyContent: 'center',
    alignSelf: 'center',
    borderColor: "#B6F1FA",
    alignContent: 'center',
    borderRadius: 10,
    paddingBottom: 0,
    //margin: 5,
    height: Dimensions.get("window").width / 2.5,
    width: Dimensions.get("window").width / 2.5
  }
});
