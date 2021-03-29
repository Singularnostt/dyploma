import React from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
} from 'react-native';

import I18n from "../env/i18n";

import { createMaterialBottomTabNavigator } from '@react-navigation/material-bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import Icon from 'react-native-vector-icons/Ionicons';
import EntypoIcon from 'react-native-vector-icons/Entypo';

import HomeScreen from './HomeScreen';
import FirstTrainingMain from './Trainings/FirstTraining/FirstTrainingMain';

import ReviewMain from './ReviewMainScreen';
import SecondTraining from './Trainings/SecondTraining';

import Review1 from './Trainings/Review1';
import Review2 from './Trainings/Review2';
import Review3 from './Trainings/Review3';

import PhrasebookScreen from './PhrasebookScreen';

const HomeStack = createStackNavigator();
const TrainingStack = createStackNavigator();
const ReviewStack = createStackNavigator();

const Tab = createMaterialBottomTabNavigator();

const MainTabScreen = () => (
    <Tab.Navigator
      initialRouteName="Home"
      activeColor="#ffa64d"
      inactiveColor="#ffffff"
      barStyle={{ backgroundColor: '#20293d' }}
    >
      <Tab.Screen
        name="Home"
        component={HomeStackScreen}
        options={{
          tabBarLabel: `${I18n.t("Home")}`,
          tabBarColor: '#20293d',
          tabBarIcon: ({ color }) => (
            <Icon name="ios-home" color={color} size={26} />
          ),
        }}
      />
      <Tab.Screen
        name="FirstTraining"
        component={TrainingStackScreen}
        options={{
          tabBarLabel: `${I18n.t("Training1")}`,
          tabBarColor: '#20293d',
          tabBarIcon: ({ color }) => (
            <Icon name="barbell" color={color} size={26} />
          ),
        }}
      />
      <Tab.Screen
        name="Review"
        component={ReviewStackScreen}
        options={{
          tabBarLabel: `${I18n.t("Training2")}`,
          tabBarColor: '#20293d', 
          tabBarIcon: ({ color }) => (
            <EntypoIcon name="stopwatch" color={color} size={26} />
          ),
        }}
      />
    </Tab.Navigator>
);

export default MainTabScreen;

const HomeStackScreen = ({navigation}) => (
<HomeStack.Navigator screenOptions={{
        headerStyle: {
        backgroundColor: '#20293d',
        },
        headerTintColor: '#fff',
        headerTitleStyle: {
        fontWeight: 'bold'
        }
    }}>
        <HomeStack.Screen name="Home" component={HomeScreen} options={{ headerShown: false,  }} />        
        <HomeStack.Screen name="Phrasebook" component={PhrasebookScreen} options={{ headerShown: false, }} />
</HomeStack.Navigator>
);

const TrainingStackScreen = ({navigation}) => (
  <TrainingStack.Navigator screenOptions={{
          headerStyle: {
          backgroundColor: '#20293d',
          },
          headerTintColor: '#fff',
          headerTitleStyle: {
          fontWeight: 'bold'
          }
      }}>
          <TrainingStack.Screen name="FirstTraining" component={FirstTrainingMain} options={{ headerShown: false }} />
          
  </TrainingStack.Navigator>
  );

const ReviewStackScreen = ({navigation}) => (
  <ReviewStack.Navigator screenOptions={{
          headerStyle: {
          backgroundColor: '#20293d',
          },
          headerTintColor: '#fff',
          headerTitleStyle: {
          fontWeight: 'bold'
          }
      }}>
          <ReviewStack.Screen name="ReviewMainScreen" component={ReviewMain} options={{ headerShown: false  }} />
          <ReviewStack.Screen name="Review0" component={SecondTraining} options={{ headerShown: false  }} />
          <ReviewStack.Screen name="Review1" component={Review1} options={{ headerShown: false  }} />
          <ReviewStack.Screen name="Review2" component={Review2} options={{ headerShown: false  }} />
          <ReviewStack.Screen name="Review3" component={Review3} options={{ headerShown: false  }} />
          
  </ReviewStack.Navigator>
  );
