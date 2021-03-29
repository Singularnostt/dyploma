import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';

import FirstScreen from './FirstScreen';
import SignInScreen from './SignInScreen';
import SignUpScreen from './SignUpScreen';
import LanguageToLearn from './LanguageToLearn';
import ApplicationLanguage from './ApplicationLanguage';
import LanguageLevelToLearn from './LanguageLevelToLearn';

const FirstLauncheStack = createStackNavigator();

const FirstLauncheStackScreen = ({navigation}) => (
    <FirstLauncheStack.Navigator headerMode='none'>
        <FirstLauncheStack.Screen name="ApplicationLanguage" component={ApplicationLanguage}/>
        <FirstLauncheStack.Screen name="FirstScreen" component={FirstScreen}/>
        <FirstLauncheStack.Screen name="LanguageToLearn" component={LanguageToLearn}/>
        <FirstLauncheStack.Screen name="LanguageLevelToLearn" component={LanguageLevelToLearn}/>
        <FirstLauncheStack.Screen name="SignUpScreen" component={SignUpScreen}/>
        <FirstLauncheStack.Screen name="SignInScreen" component={SignInScreen}/>
    </FirstLauncheStack.Navigator>
);

export default FirstLauncheStackScreen;