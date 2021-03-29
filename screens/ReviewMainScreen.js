import React, { useState, useEffect, useCallback, useRef, Component } from "react";
import { FlatList, SafeAreaView, StatusBar, TextInput, Dimensions, StyleSheet, Text, Image, View, ScrollView,   Alert,
  Modal,
  TouchableHighlight,
  TouchableOpacity,
  ActivityIndicator,
  Platform,
  ImageBackground
} from "react-native";
import Icon from 'react-native-vector-icons/Ionicons';
import IconFontAwesome from 'react-native-vector-icons/FontAwesome';
import I18n from "../env/i18n";
import LinearGradient from 'react-native-linear-gradient';
import {apiUrl} from '../env/dev';
import { useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-community/async-storage';

const ReviewMainScreen = ({route,navigation}) => {

  const [isLoading, setLoading] = useState(true);
  const [emptyCheck, setEmptyCheck] = useState(false);
  const [dictionarieUrl, setDictionarieUrl] = useState(null);

  useFocusEffect(
    React.useCallback(() => {
        fetch(`${global.apiUrl}/dictionaries/review_0`, {
          method: 'GET',
          headers: {
              'Cookie': 'cookie',
          }
        }) 
        .then((response) => response.json())
        .then((json) => {
          json.length < 1 ? setEmptyCheck(false) : setEmptyCheck(true)
          })
        .catch((error) => console.error(error))
        .finally(() => setLoading(false));
    }, [])
  );

    return (
      <SafeAreaView style={styles.container}>
      {isLoading ? <ActivityIndicator size="large" color="#b5c2c6"  style={{ flex: 1, justifyContent: 'center'}}/> : (
        <View>
        { emptyCheck == false ? (
         <View style={styles.reviewContainer}>
           <IconFontAwesome
           name="grav"
           color="#445273"
           size={144}
           />
           <Text style={[styles.title, {marginTop: 15, marginBottom: 5}]}>{I18n.t("NiceToMeet")}</Text>
           <Text style={{color: "#445273"}}>{I18n.t("ButAtFirst")}</Text>
           <View style={styles.resultButton}>
              <TouchableOpacity style={[styles.signIn, {marginTop: 15}]} onPress={() => {
                navigation.navigate("FirstTraining");
                setEmptyCheck(false);
                        }}>
                    <Text style={styles.textSign}>{I18n.t("GoToTraining")}</Text>
              </TouchableOpacity>
          </View>
         </View>
         ) : (
        <View>
          <View style={{ flexDirection: "row", width: "100%", justifyContent: 'space-around', paddingVertical: 25}}> 
              <TouchableOpacity onPress={()=> {
                  const dataUrl = {categorieUrl: dictionarieUrl};
                  navigation.navigate('Review1', dataUrl);
                  }} style={styles.reviewContainer}>
                <Icon 
                  name="ios-reader-sharp"
                  color={"#445273"}
                  size={68}
                  />
                <Text style={styles.title}>{I18n.t("Review1")}</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={()=> {
                                  const dataUrl = {categorieUrl: dictionarieUrl};
                                  navigation.navigate('Review2', dataUrl);
               }} style={styles.reviewContainer}>
                <Icon 
                  name="ios-create-sharp"
                  color={"#445273"}
                  size={68}
                  />
                <Text style={styles.title}>{I18n.t("Review2")}</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={()=> {
                                   const dataUrl = {categorieUrl: dictionarieUrl};
                                   navigation.navigate('Review3', dataUrl);
                                    }} style={styles.reviewContainer}>
                <Icon 
                  name="ios-images-sharp"
                  color={"#445273"}
                  size={68}
                  />
                  <Text style={styles.title}>{I18n.t("Review3")}</Text>
              </TouchableOpacity>
          </View>
          <View style={styles.reviewContainer}>
            <TouchableOpacity onPress={()=> {
                                const dataUrl = {categorieUrl: dictionarieUrl};
                                navigation.navigate('Review0', dataUrl);
                                }} style={styles.reviewContainer}>
              <Icon 
                name="ios-help-sharp"
                color={"#445273"}
                size={68}
                />
            </TouchableOpacity>
            <Text style={styles.title}>{I18n.t("ReviewAll")}</Text>
          </View>
        </View>

       )}
        </View>
      )}
       <LinearGradient colors={['#00000000', '#00000030', '#00000060']} style={styles.overlayShadow}></LinearGradient>
       </SafeAreaView >
    );

};

export default ReviewMainScreen;

const{height, width} = Dimensions.get('screen');
const height_image = height * 0.5 * 0.8;
const width_image = height_image * 1.1;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#20293d',
    justifyContent: "center",
    padding: 25
  },
  reviewContainer:{
    alignItems: "center",
    paddingVertical: 25,
  },
  title: {
    fontSize: 22,
    color: "#ffffff"
  },
  overlayBackground: {
    width: width,
    height: 30,
    backgroundColor: '#20293d'
  },
  overlayShadow: {
    position: 'absolute',
    bottom: 0,
    height: 30,
    width: width,
  },
  resultButton: {
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingTop: 15,
  },
  signIn: {
      width: 240,
      height: 65,
      justifyContent: 'center',
      alignItems: 'center',
      borderRadius: 8,
      flexDirection: 'row',
      backgroundColor: "#ffa64d",
  },
  textSign: {
      color: '#20293d',
      fontSize: 18,
      letterSpacing: 1,
      fontWeight: "bold",
  },
});