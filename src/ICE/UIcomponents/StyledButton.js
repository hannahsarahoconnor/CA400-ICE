 
import React from 'react';
import { StyleSheet, Text, Alert, View, Image, TouchableOpacity, ImageBackground, Button } from 'react-native';

const styledButton = props => {
    const content = (
        <View style={[styles.button, {backgroundColor: props.color}]}>
        <Text style={styles.text}>{props.text}</Text>
        </View>
    )

   return <TouchableOpacity onPress={props.onPress}>{content}</TouchableOpacity>
}

const styles = StyleSheet.create({
    button: {
        borderRadius:20,
        borderWidth:2,
        padding: 5,
        width: 300,
        borderColor: "#4277a7"
      },
    text: {
        color: "white",
        fontSize: 35,
        alignSelf: "center",
        fontWeight: 'bold'
    }
});

export default styledButton;

