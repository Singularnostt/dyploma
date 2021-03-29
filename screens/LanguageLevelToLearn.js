import React, { useEffect, useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  FlatList,
  Dimensions,
  TouchableOpacity,
  ImageBackground,
  StatusBar,
  Image,
  Modal,
  ActivityIndicator,
} from 'react-native';
import AsyncStorage from '@react-native-community/async-storage';
import Icon from 'react-native-vector-icons/Ionicons';
import LinearGradient from 'react-native-linear-gradient';
import * as Animatable from 'react-native-animatable';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import I18n from "../env/i18n";
import {languagesList} from '../env/languageIconList';
import {apiUrl} from '../env/dev.js';


const LanguageLevelToLearn = ({route, navigation}) => {

  const {languageId} = route.params;
  const [data,setData] = useState(null);
  const [isLoading,setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState(null);

    const LangIcon = ({ item, onPress, style }) => (
        <View style={ styles.itemContainer }>
            <TouchableOpacity onPress={onPress} style={[styles.placeholderBackground, style]}>
                <Image source={{ uri: `${item.image}` }} style={styles.languageListIcon} />
                <Text style={styles.langTitle}>{item.name}</Text>
            </TouchableOpacity>
        </View>
      );

      

      useEffect(() => {
        fetch(`${global.apiUrl}/languages/${languageId}`)
          .then((response) => response.json())
          .then((data) => {
            setData(data);
          })
          .catch((error) => {
            console.error(error);
          })
          .finally(() => setLoading(false));
    
      }, []);

      const renderLangIcons = ({ item }) => {
    
        const borderColor = item.id === selectedId ? "#ffa64d" : "transparent";
    
        return (
          <LangIcon
            item={item}
            onPress={() => {
              setSelectedId(item.id);
              const languageUrl = { choosenLanguage: item.languageId };
              navigation.navigate("SignUpScreen", languageUrl);
            }}
            style={{ borderColor }}
          />
        );
      };

    return (
      <View style={styles.container}>
        {isLoading ? <ActivityIndicator size="large" color="#b5c2c6"  style={{ flex: 1, justifyContent: 'center'}}/> : ( 
                      <FlatList
                      numColumns={1}
                      data={data}
                      keyExtractor={(item) => item.id.toString()}
                      renderItem={renderLangIcons}
                      extraData={selectedId}
                      ListHeaderComponent={
                        <View style={styles.headerTextBlock}>
                          <TouchableOpacity onPress={ () => { navigation.goBack() }}>
                            <MaterialIcons 
                            name="navigate-before"
                            color="#445273"
                            size={34}
                          />
                          </TouchableOpacity>
                          <Text style={styles.headerTitle}>{I18n.t("ExercisesLanguage")}</Text>
                            <MaterialIcons 
                            name="navigate-before"
                            color="transparent"
                            size={34}
                          />
                        </View>
                      }
                  />
        )}
      </View>
    );
};

export default LanguageLevelToLearn;

const{height} = Dimensions.get('screen');
const{width} = Dimensions.get('screen');
const height_image = height * 0.5 * 0.8;
const width_image = height_image * 1.1;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#20293d',
    justifyContent: 'center',
    marginTop: StatusBar.statusBarHeight,
  },
  headerTextBlock: {
    flexDirection: 'row',
    height: 65,
    width: '100%',
    paddingHorizontal: 25,
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    color: '#445273',
    fontSize: 24,
    fontWeight: "bold",
  },
  languageListIcon: {
    width:45,
    height:45,
    resizeMode:'contain',
    borderRadius: 15,
  },
  placeholderBackground: {
    flexDirection: 'row',
    backgroundColor: '#445273',
    height:80,
    borderRadius:10,
    paddingVertical:15,
    paddingHorizontal: 15, 
    justifyContent: 'flex-start',
    alignItems: 'center',
    borderWidth: 4,
    borderColor: '#ffffff',
  },
  itemContainer: {
    marginVertical: 2,
    marginHorizontal: 25,
    borderRadius:10,
  },
  langTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#ffffff",
    letterSpacing: 2,
    marginHorizontal: 15,
  }
});
