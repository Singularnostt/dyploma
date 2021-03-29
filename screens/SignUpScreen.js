import React from 'react';
import { 
    View, 
    Text, 
    TouchableOpacity, 
    TextInput,
    Platform,
    StyleSheet,
    ScrollView,
    StatusBar
} from 'react-native';
import * as Animatable from 'react-native-animatable';
import LinearGradient from 'react-native-linear-gradient';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import Feather from 'react-native-vector-icons/Feather';
import I18n from "../env/i18n";

import { AuthContext } from '../components/context';

const SignUpScreen = ({route,navigation}) => {

    const {choosenLanguage} = route.params;

    const [data, setData] = React.useState({
        username: '',
        password: '',
        confirm_password: '',
        check_textInputChange: false,
        secureTextEntry: true,
        confirm_secureTextEntry: true,
    });

    const { signUp } = React.useContext(AuthContext);

    const textInputChange = (val) => {
        if( val.length !== 0 ) {
            setData({
                ...data,
                username: val,
                check_textInputChange: true
            });
        } else {
            setData({
                ...data,
                username: val,
                check_textInputChange: false
            });
        }
    }

    const handlePasswordChange = (val) => {
        setData({
            ...data,
            password: val
        });
    }

    const handleConfirmPasswordChange = (val) => {
        setData({
            ...data,
            confirm_password: val
        });
    }

    const updateSecureTextEntry = () => {
        setData({
            ...data,
            secureTextEntry: !data.secureTextEntry
        });
    }

    const updateConfirmSecureTextEntry = () => {
        setData({
            ...data,
            confirm_secureTextEntry: !data.confirm_secureTextEntry
        });
    }

    const loginHandle = (userName, password, choosenLanguage) => {

            signUp(userName,password,choosenLanguage);

    }

    return (
      <View style={styles.container}>
          <StatusBar backgroundColor='#20293d' barStyle="light-content"/>
        <View style={styles.header}>
            <Text style={styles.text_header}>{I18n.t("RegisterNow")}</Text>
            <Text style={styles.subtitle}>{I18n.t("SignUpWith")}</Text>
        </View>
        <Animatable.View 
            animation="fadeInUpBig"
            style={styles.footer}
        >
            <ScrollView>
            <Text style={styles.text_footer}>{I18n.t("Username")}</Text>
            <View style={styles.action}>
                <FontAwesome 
                    name="user-o"
                    color="#445273"
                    size={20}
                />
                <TextInput 
                    placeholder="Your Username"
                    placeholderTextColor="#445273"
                    style={styles.textInput}
                    autoCapitalize="none"
                    onChangeText={(val) => textInputChange(val)}
                />
                {data.check_textInputChange ? 
                <Animatable.View
                    animation="bounceIn"
                >
                    <Feather 
                        name="check-circle"
                        color="green"
                        size={20}
                    />
                </Animatable.View>
                : null}
            </View>

            <Text style={[styles.text_footer, {
                marginTop: 35
            }]}>{I18n.t("Password")}</Text>
            <View style={styles.action}>
                <Feather 
                    name="lock"
                    color="#445273"
                    size={20}
                />
                <TextInput 
                    placeholder="Your Password"
                    placeholderTextColor="#445273"
                    secureTextEntry={data.secureTextEntry ? true : false}
                    style={styles.textInput}
                    autoCapitalize="none"
                    onChangeText={(val) => handlePasswordChange(val)}
                />
                <TouchableOpacity
                    onPress={updateSecureTextEntry}
                >
                    {data.secureTextEntry ? 
                    <Feather 
                        name="eye-off"
                        color="#ffffff"
                        size={20}
                    />
                    :
                    <Feather 
                        name="eye"
                        color="#ffffff"
                        size={20}
                    />
                    }
                </TouchableOpacity>
            </View>

            <View style={styles.button}>
                <TouchableOpacity
                    style={styles.signIn}
                    onPress={() => {loginHandle( data.username, data.password, choosenLanguage )}}
                >
                    <Text style={[styles.textSign, {
                        color:'#20293d'
                    }]}
                    >Sign Up</Text>
                </TouchableOpacity>
            </View>

            <View style={styles.signup}>
                    <Text style={[styles.textSignup,{
                       color:'#445273' 
                    }]}>{I18n.t("HaveAccount")}</Text>
                    <TouchableOpacity
                     onPress={() => navigation.navigate('SignInScreen')}
                    >
                    <Text style={[styles.textSignup, {
                        color:'#9cb9ff',
                        marginLeft:3
                    }]}>Login</Text>
                    </TouchableOpacity>
            </View>
            </ScrollView>
        </Animatable.View>
      </View>
    );
};

export default SignUpScreen;

const styles = StyleSheet.create({
    container: {
      flex: 1, 
      backgroundColor: '#20293d',
      paddingHorizontal: 20,
      paddingTop: 20,
    },
    header: {
        flex: 1,
        justifyContent: 'flex-end',
        paddingHorizontal: 20,
        paddingBottom: 20
    },
    footer: {
        flex: Platform.OS === 'ios' ? 3 : 5,
        backgroundColor: '#20293d',
        paddingHorizontal: 20,
        paddingVertical: 30
    },
    text_header: {
        color:'#ffffff',
        fontWeight:'bold',
        fontSize:30,
    },
    subtitle: {
        fontSize: 16,
        color:'#445273',
    },
    text_footer: {
        color: '#ffffff',
        fontSize: 18
    },
    action: {
        flexDirection: 'row',
        marginTop: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#f2f2f2',
        paddingBottom: 5
    },
    textInput: {
        flex: 1,
        marginTop: Platform.OS === 'ios' ? 0 : -12,
        paddingLeft: 10,
        color: '#ffffff',
    },
    button: {
        alignItems: 'center',
        marginTop: 40
    },
    signIn: {
        width: '100%',
        height: 50,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 10,
        backgroundColor: '#ffa64d',
    },
    textSign: {
        fontSize: 18,
        fontWeight: 'bold'
    },
    textPrivate: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginTop: 20
    },
    color_textPrivate: {
        color: '#a8a8a8'
    },
    signup: {
        marginTop:25,
        flexDirection:'row',
        justifyContent:'center'
    },
    textSignup: {
        textAlign:'center'
    }
  });
