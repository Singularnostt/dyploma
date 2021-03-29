import React, { useState, useEffect } from 'react';
import { 
    View, 
    Text, 
    TouchableOpacity,
    TouchableWithoutFeedback, 
    Dimensions,
    StyleSheet,
    StatusBar,
    Image,
    Modal,
    TextInput
} from 'react-native';
import * as Animatable from 'react-native-animatable';
import LinearGradient from 'react-native-linear-gradient';
import AsyncStorage from '@react-native-community/async-storage';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { useTheme } from '@react-navigation/native';
import I18n from "../env/i18n";

const FirstScreen = ({navigation}) => {
    const { colors } = useTheme();

    let x = 0;
    const [modal,setModal] = useState(false);
    const [url,setUrl] = useState("");

    function debugUrl () {
      x++;
      console.log(x);
      if ( x == 5 ) {
        setModal(true);
      }
    }

    function getUrl () {

      if ( url.length > 2 ) {
        global.apiUrl = url;
        console.log("url - ",global.apiUrl);
        AsyncStorage.setItem(`globalAPIUrl`, global.apiUrl);
      }
      setModal(false);
    }

    

    useEffect(() => {
      AsyncStorage.getItem('globalAPIUrl').then( value => {
        if ( value != null ){
          global.apiUrl = value; 
          console.log(global.apiUrl);
        }
        });
    }, []);

    return (

      <View style={styles.container}>

        <StatusBar backgroundColor='#20293d' barStyle="light-content"/>

        <View style={styles.header}>
          <TouchableWithoutFeedback onPress={()=>{ debugUrl() }}>
            <Image 
              source={require('../assets/ekran_1.png')}
              style={styles.image}
              resizeMode="contain"
            />
          </TouchableWithoutFeedback>
        </View>
        <Animatable.View 
            style={[styles.footer, {
                backgroundColor: "#20293d"
            }]}
            animation="fadeInUpBig"
        >
            <Text style={[styles.title, {
                color: "#ffffff"
            }]}>{I18n.t("ForSchoolKids")}</Text>
            <Text style={styles.text}>{I18n.t("FindOut")}</Text>
            <View style={styles.button}>
            <TouchableOpacity style={styles.signIn} onPress={()=>navigation.navigate('LanguageToLearn')}>
                    <Text style={styles.textSign}>{ I18n.t("GetStarted") }</Text>
                    <MaterialIcons 
                        name="navigate-next"
                        color="#20293d"
                        size={20}
                    />
            </TouchableOpacity>
            </View>

            <View style={styles.signup}>
                    <Text style={[styles.textSignup,{
                       color:'#ccc' 
                    }]}>{I18n.t("HaveAccount")}</Text>
                    <TouchableOpacity
                     onPress={()=>navigation.navigate('SignInScreen')}
                    >
                    <Text style={[styles.textSignup, {
                        color:'#9cb9ff',
                        marginLeft:3
                    }]}>Log in</Text>
                    </TouchableOpacity>
            </View>
        </Animatable.View>
        <Modal
        transparent={false}
        visible={modal}
        >
          <View style={styles.preventionContainer}>
            <View style={styles.preventionBlockContainer}>
            <Text style={[styles.title, { color: "#9cb9ff"}]}>Write url below</Text>
            <Text style={[styles.text, { fontSize: 16, color: "#ffffff", marginTop: 10}]}>Example: http://adf757dc5664.ngrok.io</Text>
            <View style={{flex: 0.65, justifyContent: "center", width: "100%", alignItems: 'center'}}>
                      <TextInput
                        style={{height: 60, maxWidth: '80%', width: "80%", fontSize: 24, borderBottomWidth: 2, borderBottomColor: "#9cb9ff", textAlign: "center", color: "#ffffff"}}
                        placeholder="Type here the url..." 
                        onChangeText={(url) => { setUrl(url); }}
                        defaultValue={url}
                      />
            </View>
            <TouchableOpacity style={[styles.button, { backgroundColor: "#ffa64d", width: "80%", height: 60, justifyContent: "center", borderRadius: 5}]} onPress={() => { getUrl(); }}>
              <Text style={styles.textSign}>Accept</Text>
            </TouchableOpacity>
            <Text style={styles.exitText}
            onPress={() => { setModal(false); }}
            >
              Go back
            </Text>
            </View>
          </View>
        </Modal>
      </View>
    );
};

export default FirstScreen;

const{height} = Dimensions.get('screen');
const height_image = height * 0.5 * 0.8;
const width_image = height_image * 1.1;

const styles = StyleSheet.create({
  container: {
    flex: 1, 
    backgroundColor: '#20293d'
  },
  header: {
    flex:2,
    justifyContent:'center',
    alignItems:'center',
  },
  footer: {
    flex:1,
    alignItems:'center',
    paddingHorizontal:40,
    paddingBottom: 80
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
    alignItems: 'center',
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
},
preventionContainer: {
  backgroundColor: '#20293d',
  justifyContent: "center",
  alignItems: "center",
  width: '100%',
},
preventionBlockContainer:{
  height: 380,
  backgroundColor: '#445273',
  justifyContent: "center",
  alignItems: "center",
  width: '90%',
  margin: 180,
  borderRadius: 10,
},
exitText: {
  color:'#9cb9ff',
  textAlign:'center',
  marginTop: 20,
  textDecorationLine: 'underline'
},
});
