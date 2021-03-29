import React, { useState, useEffect, useRef, Component } from "react";
import { FlatList, SafeAreaView, StatusBar, TextInput, Dimensions, StyleSheet, Text, Image, View, ScrollView,   Alert,
  Modal,
  TouchableHighlight,
  TouchableOpacity,
  ActivityIndicator,
  Platform,
  ImageBackground,
} from "react-native";
import Icon from 'react-native-vector-icons/Ionicons';
import { SearchBar } from 'react-native-elements';
import I18n from "../env/i18n";
import {apiUrl} from '../env/dev';
import {languagesList} from '../env/languageIconList';
import AsyncStorage from '@react-native-community/async-storage';
import Sound, { setCategory } from 'react-native-sound';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';

const SettingsScreen = ({navigation}) => {

  const [modalVisible, setModalVisible] = useState(false);

  let langUrlKey = "";

  function selectedIcon (x) {
    if ( I18n.locale == "en") {
      x = 5;
    } else if ( I18n.locale == "pl" ) {
      x = 1;
    } else if ( I18n.locale == "ger" ) {
      x = 3;
    } else if ( I18n.locale == "rus" ) {
      x = 2;
    } else if ( I18n.locale == "ukr" ) {
      x = 6;
    } else if ( I18n.locale == "tur" ) {
      x = 4;
    }
    return x;
  }

  const [selectedId, setSelectedId] = useState(selectedIcon());

  const LangIcon = ({ item, onPress, style }) => (
    <TouchableOpacity onPress={onPress}>
    <View style={[styles.placeholderBackground, style]}>
      <Image source={item.img} style={styles.languageListIcon} />
    </View>
  </TouchableOpacity>
  );
  

    const renderLangIcons = ({ item }) => {

      const borderColor = item.id === selectedId ? "#ffa64d" : "transparent";

      return (
        <LangIcon
          item={item}
          onPress={() => { 
            setSelectedId(item.id);
            AsyncStorage.setItem('languageKey', item.key);
            I18n.locale = item.key;
            setTimeout(async() => {
              setModalVisible(!modalVisible);
            }, 500);
          }}
          style={{ borderColor }}
        />
      );
    };

    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.headerTabBar}>
          <View style={styles.headerTitleBlock}>
            <TouchableOpacity onPress={ () => { navigation.goBack() }}>
            <MaterialIcons 
                      name="navigate-before"
                      color="#ffffff"
                      size={34}
                      />
            </TouchableOpacity>
            <Text style={{ color: "#ffffff", fontWeight: "bold", fontSize: 24 }}>{I18n.t("Settings")}</Text>
            <MaterialIcons 
                      name="navigate-before"
                      color="transparent"
                      size={34}
                      />
          </View>
        </View>
        <View style={{ flexDirection: 'row', padding: 25, borderBottomWidth: 1, borderColor: "#D8E3E6"}}>
          <Text style={{ color: "#ffffff", fontSize: 16}}>{I18n.t("Language")}</Text>
          <TouchableOpacity style={{ flexDirection: 'row', }} onPress={() => { setModalVisible(true) }}>
            <Image 
              source={languagesList[selectedId - 1].img}
              style={styles.imageTop} 
            />
              <Icon 
              name="chevron-down-outline"
              color="#ffffff"
              size={18}
              />
          </TouchableOpacity>
        </View>
            <Modal
            animationType="slide"
            transparent={true}
            visible={modalVisible}
            onRequestClose={() => {setModalVisible(!modalVisible)}}
            >
              <TouchableOpacity onPressOut={() => { setModalVisible(!modalVisible); }} style={ styles.modalSchedule }>
                <View style={ styles.modalScheduleContainer }>
                  <View style={styles.timeScheduleContainer}> 
                  <View style={styles.mainContainer}>
                    <View style={styles.textContainer}>
                      <Text style={styles.title}>{I18n.t("ChooseLanguage")}</Text>
                    </View>
                    <SafeAreaView style={styles.languagesContainer}>
                      <FlatList
                        numColumns={3}
                        data={languagesList}
                        keyExtractor={item => item.id}
                        renderItem={renderLangIcons}
                        extraData={selectedId}
                      />
                      </SafeAreaView>
                    </View>
                  </View>
                  <TouchableOpacity
                    style={styles.modalCancelButton}
                    onPress={() => {
                      setModalVisible(!modalVisible);
                    }}
                  >
                    <Text style={styles.cancelText}>{I18n.t("Cancel")}</Text>
                  </TouchableOpacity>
                </View>
              </TouchableOpacity>
          </Modal>
      </SafeAreaView >
    );
};

export default SettingsScreen;

const{height} = Dimensions.get('screen');
const{width} = Dimensions.get('screen');
const height_image = height * 0.5 * 0.8;
const width_image = height_image * 1.1;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'column',
    backgroundColor: '#445273',
    justifyContent: 'flex-start',
    marginTop: StatusBar.statusBarHeight,
  },
  headerTabBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#20293d',
    width: '100%',
    height: 55,
    paddingHorizontal: 18,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.20,
    shadowRadius: 1.41,
    
    elevation: 3,
  },
  headerTitleBlock: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width:'100%',
    overflow: 'hidden',
  },
  headerTitleText: {
    fontSize: 20,
    color: '#000000',
    fontFamily: "Oyko-Bold",
    marginLeft: 18
  },
  heading:{
    marginTop: 50,
    marginBottom:10,
    marginLeft: 15,
    fontSize: 25
  },
  itemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '90%',
  },
  itemStyle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  imageTop: {
    height: 24,
    width: 24,
    resizeMode: 'contain',
    marginHorizontal: 10,
    borderRadius: 5
  },
  image: {
    height: 50,
    width: 50,
    resizeMode: 'contain'
  },
  modalSchedule: {
    flex: 1,
  },
  modalScheduleContainer: {
    flex: 1,
    paddingTop: '60%',
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
  },
  modalCancelButton: {
    width: '90%',
    height: 65,
    backgroundColor: '#445273',
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: '5%',
    borderRadius: 10,
    marginBottom: 15,
  },
  cancelText: {
    color: '#D8E3E6',
    fontSize: 16,
  },
  timeScheduleContainer: {
    flex:1,
    justifyContent: 'center',
    alignSelf:"center",
    alignItems: 'center',
    flexDirection:"row",
    paddingVertical: 5,
    backgroundColor:"#445273",
    width: '90%',
    marginVertical: 5,
    marginBottom: 15,
    borderRadius: 15
  },
  textContainer:{
    marginBottom: 15,
    justifyContent: 'center',
    alignItems: 'center',
  },
  languagesContainer:{
    width:'100%',
    justifyContent:'center',
    alignItems:'center',
  },
  languageListIcon: {
    width:60,
    height:60,
    resizeMode:'contain',
    borderRadius: 10,
  },
  placeholderBackground: {
    backgroundColor: '#D8E3E6',
    height:70,
    width:70,
    borderRadius:10,
    marginVertical:18,
    marginHorizontal: 18, 
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 10,
    borderColor: 'transparent',
  },
  title: {
    fontSize: 24, 
    fontFamily: "Oyko-Medium",
    color: "#D8E3E6",
  },
});