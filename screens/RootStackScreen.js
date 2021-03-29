import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';

import FirstScreen from './FirstScreen';
import SignInScreen from './SignInScreen';
import SignUpScreen from './SignUpScreen';
import LanguageToLearn from './LanguageToLearn';
import LanguageLevelToLearn from './LanguageLevelToLearn';

const RootStack = createStackNavigator();

const RootStackScreen = ({navigation}) => (
    <RootStack.Navigator headerMode='none'>
        <RootStack.Screen name="FirstScreen" component={FirstScreen}/>
        <RootStack.Screen name="SignInScreen" component={SignInScreen}/>
        <RootStack.Screen name="LanguageToLearn" component={LanguageToLearn}/>
        <RootStack.Screen name="LanguageLevelToLearn" component={LanguageLevelToLearn}/>
        <RootStack.Screen name="SignUpScreen" component={SignUpScreen}/>
    </RootStack.Navigator>
);

export default RootStackScreen;