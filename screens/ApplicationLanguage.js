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
  Modal
} from 'react-native';
import AsyncStorage from '@react-native-community/async-storage';
import Icon from 'react-native-vector-icons/Ionicons';
import LinearGradient from 'react-native-linear-gradient';
import * as Animatable from 'react-native-animatable';
import I18n from "../env/i18n";
import {languagesList} from '../env/languageIconList';


const ApplicationLanguage = ({navigation}) => {

    const LangIcon = ({ item, onPress, style }) => (
        <View style={ styles.itemContainer }>
            <TouchableOpacity onPress={onPress} style={[styles.placeholderBackground, style]}>
                <Image source={item.img} style={styles.languageListIcon} />
            </TouchableOpacity>
        </View>
      );


      const [selectedId, setSelectedId] = useState(null);

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
                navigation.navigate("FirstScreen");
              }, 1000); 
            }}
            style={{ borderColor }}
          />
        );
      };

    return (
            <View style={styles.container}>

            <StatusBar backgroundColor='#20293d' barStyle="light-content"/>
    
            <View style={styles.header}>
                <Animatable.Image 
                    animation="bounceIn"
                    duraton="1500"
                source={require('../assets/ekran_1.png')}
                style={styles.image}
                resizeMode="contain"
                />
            </View>
            <Animatable.View 
                style={[styles.footer, {
                    backgroundColor: "#20293d"
                }]}
                animation="fadeInUpBig"
            >
                    <View style={styles.headerTextBlock}>
                      <Text style={styles.headerTitle}>Application language</Text>
                    </View>
              <FlatList
                  numColumns={3}
                  data={languagesList}
                  keyExtractor={(item) => item.id}
                  renderItem={renderLangIcons}
                  extraData={selectedId}
              />
            </Animatable.View>
          </View>
    );
};

export default ApplicationLanguage;

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
    height: 65,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    color: '#445273',
    fontSize: 24,
    fontWeight: "bold",
  },
  languageListIcon: {
    width:65,
    height:65,
    resizeMode:'contain',
    borderRadius: 15,
  },
  placeholderBackground: {
    flexDirection: 'row',
    backgroundColor: '#20293d',
    height:73,
    borderRadius:10,
    justifyContent: 'flex-start',
    alignItems: 'center',
    borderWidth: 4,
    borderColor: '#ffffff',
  },
  itemContainer: {
    marginVertical: 15,
    marginHorizontal: 10,
    borderRadius:10,
  },
  langTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#ffffff",
    letterSpacing: 2,
    marginHorizontal: 15,
  },
  header: {
    flex:2,
    justifyContent:'center',
    alignItems:'center',
  },
  footer: {
    alignItems:'center',
    paddingHorizontal:40,
    paddingBottom: 60
  },
  image: {
    height: height_image,
    width: width_image
  },
  title: {
    fontSize: 25,
    fontWeight: 'bold',
    color:'#000',
    textAlign:'center'
  },
  text: {
    color:'#D8E3E6',
    textAlign:'center',
    marginTop: 20,
  },
  button: {
    alignItems: 'flex-end',
    marginTop: 30
  },
  signIn: {
      width: 220,
      height: 55,
      justifyContent: 'center',
      alignItems: 'center',
      borderRadius: 10,
      flexDirection: 'row',
      backgroundColor: '#ffa64d',
  },
  textSign: {
      color: '#20293d',
      fontSize: 18,
      letterSpacing: 1,
      fontWeight: "bold"
  },
  signup: {
    marginTop:25,
    flexDirection:'row',
    justifyContent:'center'
},
textSignup: {
    textAlign:'center',
    color: "#D8E3E6"
}
});
