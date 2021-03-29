import React from 'react';
import { 
    View, 
    Text, 
    TouchableOpacity, 
    TextInput,
    Platform,
    StyleSheet ,
    StatusBar,
} from 'react-native';
import * as Animatable from 'react-native-animatable';
import LinearGradient from 'react-native-linear-gradient';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import Feather from 'react-native-vector-icons/Feather';
import { useTheme } from 'react-native-paper';
import I18n from "../env/i18n";

import { AuthContext } from '../components/context';

const SignInScreen = ({navigation}) => {

    const [data, setData] = React.useState({
        username: '',
        password: '',
        check_textInputChange: false,
        secureTextEntry: true,
        isValidUser: true,
        isValidPassword: true,
    });

    const { colors } = useTheme();

    const { signIn } = React.useContext(AuthContext);

    const textInputChange = (val) => {
        if( val.trim().length >= 4 ) {
            setData({
                ...data,
                username: val,
                check_textInputChange: true,
                isValidUser: true
            });
        } else {
            setData({
                ...data,
                username: val,
                check_textInputChange: false,
                isValidUser: false
            });
        }
    }

    const handlePasswordChange = (val) => {
        if( val.trim().length >= 8 ) {
            setData({
                ...data,
                password: val,
                isValidPassword: true
            });
        } else {
            setData({
                ...data,
                password: val,
                isValidPassword: false
            });
        }
    }

    const updateSecureTextEntry = () => {
        setData({
            ...data,
            secureTextEntry: !data.secureTextEntry
        });
    }

    const handleValidUser = (val) => {
        if( val.trim().length >= 4 ) {
            setData({
                ...data,
                isValidUser: true
            });
        } else {
            setData({
                ...data,
                isValidUser: false
            });
        }
    }

    const loginHandle = (userName, password) => {

        signIn(userName,password);

    }

    return (
      <View style={styles.container}>
        <StatusBar backgroundColor='#20293d' barStyle="light-content"/>
        <View style={styles.header}>
            <Text style={styles.text_header}>{I18n.t("Welcome")}</Text>
            <Text style={styles.subtitle}>{I18n.t("LoginWith")}</Text>
        </View>
        <Animatable.View 
            animation="fadeInUpBig"
            style={[styles.footer, {
                backgroundColor: "#20293d"
            }]}
        >
            <Text style={[styles.text_footer, {
                color: "#ffffff"
            }]}>{I18n.t("Username")}</Text>
            <View style={styles.action}>
                <FontAwesome 
                    name="user-o"
                    color="#445273"
                    size={20}
                />
                <TextInput 
                    placeholder="Your Username"
                    placeholderTextColor="#445273"
                    style={[styles.textInput, {
                        color: "#ffffff"
                    }]}
                    autoCapitalize="none"
                    onChangeText={(val) => textInputChange(val)}
                    onEndEditing={(e)=>handleValidUser(e.nativeEvent.text)}
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
            { data.isValidUser ? null : 
            <Animatable.View animation="fadeInLeft" duration={500}>
            <Text style={styles.errorMsg}>Username must be 4 characters long.</Text>
            </Animatable.View>
            }
            

            <Text style={[styles.text_footer, {
                color: "#ffffff",
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
                    style={[styles.textInput, {
                        color: "#ffffff"
                    }]}
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
            { data.isValidPassword ? null : 
            <Animatable.View animation="fadeInLeft" duration={500}>
            <Text style={styles.errorMsg}>Password must be 8 characters long.</Text>
            </Animatable.View>
            }
            

            <TouchableOpacity>
                <Text style={{color: '#9cb9ff', marginTop:15}}>{I18n.t("ForgotPassword")}</Text>
            </TouchableOpacity>
            <View style={styles.button}>
                <TouchableOpacity
                    style={styles.signIn}
                    onPress={() => {loginHandle( data.username, data.password )}}
                >
                    <Text style={[styles.textSign, {
                        color: '#20293d',
                    }]}>Log In</Text>
                </TouchableOpacity>
            </View>

            <View style={styles.signup}>
                    <Text style={[styles.textSignup,{
                       color:'#445273' 
                    }]}>{I18n.t("DontHaveAccount")}</Text>
                    <TouchableOpacity
                     onPress={() => navigation.navigate('LanguageToLearn')}
                    >
                    <Text style={[styles.textSignup, {
                        color:'#9cb9ff',
                        marginLeft:3
                    }]}>Sign Up</Text>
                    </TouchableOpacity>
            </View>
            
        </Animatable.View>
      </View>
    );
};

export default SignInScreen;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#20293d',
        justifyContent:'center',
        paddingHorizontal:30,
        paddingVertical: 40,
    },
    header: {
        flex: 1,
        justifyContent: 'flex-end',
        paddingHorizontal: 20,
        paddingBottom: 50
    },
    footer: {
        backgroundColor: '#fff',
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
        color: '#05375a',
        fontSize: 18
    },
    action: {
        flexDirection: 'row',
        marginTop: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#f2f2f2',
        paddingBottom: 5
    },
    actionError: {
        flexDirection: 'row',
        marginTop: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#FF0000',
        paddingBottom: 5
    },
    textInput: {
        flex: 1,
        marginTop: Platform.OS === 'ios' ? 0 : -12,
        paddingLeft: 10,
        color: '#05375a',
    },
    errorMsg: {
        color: '#FF0000',
        fontSize: 14,
    },
    button: {
        alignItems: 'center',
        marginTop: 60
    },
    signIn: {
        width: '100%',
        height: 55,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 10,
        backgroundColor: '#ffa64d',
    },
    textSign: {
        fontSize: 18,
        fontWeight: 'bold',
        letterSpacing: 1,
    },
    signup: {
        marginTop:20,
        flexDirection:'row',
        justifyContent:'center'
    },
    textSignup: {
        textAlign:'center'
    }
  });
