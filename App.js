import React, { useEffect, useState  } from 'react';
import { 
  Provider as PaperProvider, 
  DefaultTheme as PaperDefaultTheme,
  DarkTheme as PaperDarkTheme 
} from 'react-native-paper';
import { View, ActivityIndicator} from 'react-native';
import { 
  NavigationContainer, 
  DefaultTheme as NavigationDefaultTheme,
  DarkTheme as NavigationDarkTheme
} from '@react-navigation/native';
import { createDrawerNavigator } from '@react-navigation/drawer';
import AsyncStorage from '@react-native-community/async-storage';

import { DrawerContent } from './screens/DrawerContent';
import MainTabScreen from './screens/MainTabScreen';
import ProfileScreen from './screens/ProfileScreen';
import SettingsScreen from './screens/SettingsScreen';
import ReviewScreen from './screens/Trainings/SecondTraining';
import { AuthContext } from './components/context';
import RootStackScreen from './screens/RootStackScreen';
import FirstLauncheStackScreen from './screens/FirstLauncheStack';
import {apiUrl} from './env/dev'; 

const Drawer = createDrawerNavigator();

const App = () => {

  const [isLoading, setLoading] = useState(true);
  const [isFirstLaunch, setIsFirstLaunch] = useState(null);
  const [data, setData] = useState([]);

  const [isDarkTheme, setIsDarkTheme] = React.useState(false);

  const initialLoginState = {
    isLoading: true,
    userName: null,
    userToken: null,
    dataSource: null
  }

  const CustomDefaultTheme = {
    ...NavigationDefaultTheme,
    ...PaperDefaultTheme,
    colors: {
      ...NavigationDefaultTheme.colors,
      ...PaperDefaultTheme.colors, 
      background: '#ffffff',
      text: '#333333'
    }
  }
  
  const CustomDarkTheme = {
    ...NavigationDarkTheme,
    ...PaperDarkTheme,
    colors: {
      ...NavigationDarkTheme.colors,
      ...PaperDarkTheme.colors,
      background: '#333333',
      text: '#ffffff'
    }
  }

  const theme = isDarkTheme ? CustomDarkTheme : CustomDefaultTheme;

  const loginReducer = (prevState, action) => {
    switch( action.type ) {
      case 'RETRIEVE_TOKEN': 
        return {
          ...prevState,
          userToken: action.token,
          isLoading: false,
        };
      case 'LOGIN': 
        return {
          ...prevState,
          userName: action.id,
          userToken: action.token,
          isLoading: false,
        };
      case 'LOGOUT': 
        return {
          ...prevState,
          userName: null,
          userToken: null,
          isLoading: false,
        };
      case 'REGISTER': 
        return {
          ...prevState,
          userName: action.id,
          userToken: action.token,
          isLoading: false,
        };
    }
  };

  const [loginState, dispatch] = React.useReducer(loginReducer, initialLoginState);

  const authContext = React.useMemo(() => ({

    signUp: async(userName, password, currentLanguage) => {

          AsyncStorage.setItem(`userName`, userName);

          let userAndPassword = [];
          userAndPassword.push({"userName": userName, "password": password, "currentLanguage": currentLanguage});
          let json = JSON.stringify(userAndPassword);

          console.log("-----------",userAndPassword,"---------------");
          
          const signUpResponse = await fetch(`${global.apiUrl}/register_user`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Cookie': 'cookie'
            },
            body: JSON.stringify({
                userName: userName,
                password: password,
                currentLanguage: currentLanguage
            }),
          });

          console.log("signUpResponse", signUpResponse);
      
          const signInResponse = await fetch(`${global.apiUrl}/api/ezp/v2/user/sessions`, {
            method: 'POST',
            headers: {
              Accept: 'application/vnd.ez.api.Session+json',
                'Content-Type': 'application/vnd.ez.api.SessionInput+json',
                'Cookie': 'cookie',
                'X-CSRF-Token': 'string'
            },
            body: JSON.stringify({
              'SessionInput': {
                login: userName,
                password: password,
              }
            }),
          });

          console.log("signInResponse", signInResponse);
          
          const content = await signInResponse.json();
    
          try {
            await AsyncStorage.setItem(`userToken`, content.Session.User._href);
            await AsyncStorage.setItem(`sessionToken`, content.Session.identifier);
            await AsyncStorage.setItem(`sessionCsrfToken`, content.Session.csrfToken);
          } catch(e) {
            console.log(e);
          }
          let userIdArr = content.Session.User._href.split(`/`);
    
          dispatch({ type: 'REGISTER', id: userIdArr[userIdArr.length-1], token: content.Session.User._href });

    },
    signIn: async(userName, password) => {

      AsyncStorage.setItem(`userName`, userName);
      
      const rawResponse = await fetch(`${global.apiUrl}/api/ezp/v2/user/sessions`, {
        method: 'POST',
        headers: {
          Accept: 'application/vnd.ez.api.Session+json',
            'Content-Type': 'application/vnd.ez.api.SessionInput+json',
            'Cookie': 'cookie',
            'X-CSRF-Token': 'string'
        },
        body: JSON.stringify({
          'SessionInput': {
            login: userName,
            password: password,
          }
        }),
      });
      
      const content = await rawResponse.json();

      try {
        await AsyncStorage.setItem(`userToken`, content.Session.User._href);
        await AsyncStorage.setItem(`sessionToken`, content.Session.identifier);
        await AsyncStorage.setItem(`sessionCsrfToken`, content.Session.csrfToken);
      } catch(e) {
        console.log(e);
      }
      let userIdArr = content.Session.User._href.split(`/`);

      dispatch({ type: 'LOGIN', id: userIdArr[userIdArr.length-1], token: content.Session.User._href });
    }, 
    signOut: async() => {
      let sessionToken = await AsyncStorage.getItem(`sessionToken`);
      let sessionCsrfToken = await AsyncStorage.getItem(`sessionCsrfToken`);

      const rawResponse = await fetch(`${global.apiUrl}/api/ezp/v2/user/sessions/${sessionToken}`, {
        method: 'DELETE',
        headers: {
            'Cookie': sessionToken,
            'X-CSRF-Token': sessionCsrfToken,
        }
      });

      try {
        await AsyncStorage.removeItem(`userName`);
        await AsyncStorage.removeItem(`userToken`);
        await AsyncStorage.removeItem(`sessionToken`);
        await AsyncStorage.removeItem(`sessionCsrfToken`);
      } catch(e) {
        console.log(e);
      }
      dispatch({ type: 'LOGOUT' });
    },
    toggleTheme: () => {
      setIsDarkTheme( isDarkTheme => !isDarkTheme );
    }
  }), []);

  useEffect(() => {

    AsyncStorage.getItem('alreadyLaunched').then( value => {
      if ( value == null ) {
        AsyncStorage.setItem('alreadyLaunched', 'true');
        setIsFirstLaunch(true);
      } else {
        setIsFirstLaunch(false);
      }
    })

    setTimeout(async() => {
      let userToken;
      userToken = null;
      try {
        userToken = await AsyncStorage.getItem('userToken');
      } catch(e) {
        console.log(e);
      }
      dispatch({ type: 'RETRIEVE_TOKEN', token: userToken });
    }, 1000);  

  }, []);

  if( loginState.isLoading ) {
    return(
      <View style={{flex:1,justifyContent:'center',alignItems:'center'}}>
        <ActivityIndicator size="large"/>
      </View>
    );
  }
  return (
    <PaperProvider theme={theme}>
    <AuthContext.Provider value={authContext}>
    <NavigationContainer theme={theme}>
      { loginState.userToken != null ? (
          <Drawer.Navigator drawerContent={props => <DrawerContent {...props} />}>
            <Drawer.Screen name="HomeDrawer" component={MainTabScreen} />
            <Drawer.Screen name="ProfileScreen" component={ProfileScreen} />
            <Drawer.Screen name="SettingsScreen" component={SettingsScreen} />
          </Drawer.Navigator>
        ) 
        :
        isFirstLaunch != true ? <RootStackScreen/> : <FirstLauncheStackScreen />
    }
    </NavigationContainer>
    </AuthContext.Provider>
    </PaperProvider>
  );

}

export default App;
