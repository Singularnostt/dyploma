import React, { useState, useEffect } from 'react';
import {
    useTheme,
    Avatar,
    Title,
    Caption,
    Drawer,
    Text,
    TouchableRipple,
    Switch,
    FlatList,
    ActivityIndicator
} from 'react-native-paper';
import { View, StyleSheet } from 'react-native';
import {
    DrawerContentScrollView,
    DrawerItem
} from '@react-navigation/drawer';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import AsyncStorage from '@react-native-community/async-storage';
import { useIsDrawerOpen } from '@react-navigation/drawer';

import {apiUrl} from '../env/dev.js';
import{ AuthContext } from '../components/context';
import I18n from "../env/i18n";

/**
 * Function that calculates rotation of the semicircle for firstProgressLayer
 * ( when percent is less than equal to 50 ) or for the secondProgressLayer
 * when percent is greater than 50.
 **/
const rotateByStyle = (percent, base_degrees, clockwise) => {
    let rotateBy = base_degrees;
    if (clockwise) {
      rotateBy = base_degrees + percent * 3.6;
    } else {
      //anti clockwise progress
      rotateBy = base_degrees - percent * 3.6;
    }
    return {
      transform: [{ rotateZ: `${rotateBy}deg` }],
    };
  };
  
  const renderThirdLayer = (
    percent,
    commonStyles,
    ringColorStyle,
    ringBgColorStyle,
    clockwise,
    bgRingWidth,
    progressRingWidth,
    innerRingStyle,
    startDegrees,
  ) => {
    let rotation = 45 + startDegrees;
    let offsetLayerRotation = -135 + startDegrees;
    if (!clockwise) {
      rotation += 180;
      offsetLayerRotation += 180;
    }
    if (percent > 50) {
      /**
       * Third layer circles default rotation is kept 45 degrees for clockwise rotation, so by default it occupies the right half semicircle.
       * Since first 50 percent is already taken care  by second layer circle, hence we subtract it
       * before passing to the rotateByStyle function
       **/
  
      return (
        <View
          style={[
            styles.secondProgressLayer,
            rotateByStyle(percent - 50, rotation, clockwise),
            commonStyles,
            ringColorStyle,
          ]}
        />
      );
    } else {
      return (
        <View
          style={[
            styles.offsetLayer,
            innerRingStyle,
            ringBgColorStyle,
            { transform: [{ rotateZ: `${offsetLayerRotation}deg` }] },
          ]}
        />
      );
    }
  };
  
  const CircularProgress1 = ({
    percent,
    radius,
    bgRingWidth,
    progressRingWidth,
    ringColor,
    ringBgColor,
    textFontSize,
    textFontWeight,
    textFontColor,
    clockwise,
    bgColor,
    startDegrees,
  }) => {
    const commonStyles = {
      width: radius * 2,
      height: radius * 2,
      borderRadius: radius,
      borderTopWidth: progressRingWidth,
      borderLeftWidth: progressRingWidth,
      borderBottomWidth: progressRingWidth,
      borderRightWidth: progressRingWidth,
    };
  
    /**
     * Calculate radius for base layer and offset layer.
     * If progressRingWidth == bgRingWidth, innerRadius is equal to radius
     **/
    const widthDiff = progressRingWidth - bgRingWidth;
    const innerRadius = radius - progressRingWidth + bgRingWidth + widthDiff / 2;
  
    const innerRingStyle = {
      width: innerRadius * 2,
      height: innerRadius * 2,
      borderRadius: innerRadius,
      borderTopWidth: bgRingWidth,
      borderLeftWidth: bgRingWidth,
      borderBottomWidth: bgRingWidth,
      borderRightWidth: bgRingWidth,
    };
  
    const ringColorStyle = {
      borderRightColor: ringColor,
      borderTopColor: ringColor,
    };
  
    const ringBgColorStyle = {
      borderRightColor: ringBgColor,
      borderTopColor: ringBgColor,
    };
  
    const thickOffsetRingStyle = {
      borderRightColor: bgColor,
      borderTopColor: bgColor,
    };
  
    let rotation = -135 + startDegrees;
    /**
     * If we want our ring progress to be displayed in anti-clockwise direction
     **/
    if (!clockwise) {
      rotation += 180;
    }
    let firstProgressLayerStyle;
    /* when ther ring's border widths are different and percent is less than 50, then we need an offsetLayer
     * before the original offser layer to avoid ring color of the thick portion to be visible in the background.
     */
    let displayThickOffsetLayer = false;
    if (percent > 50) {
      firstProgressLayerStyle = rotateByStyle(50, rotation, clockwise);
    } else {
      firstProgressLayerStyle = rotateByStyle(percent, rotation, clockwise);
      if (progressRingWidth > bgRingWidth) {
        displayThickOffsetLayer = true;
      }
    }
  
    let offsetLayerRotation = -135 + startDegrees;
    if (!clockwise) {
      offsetLayerRotation += 180;
    }
  
    return (
      <View style={[styles.containerCircle, { width: radius * 2, height: radius * 2 }]}>
        <View
          style={[
            styles.baselayer,
            innerRingStyle,
            { borderColor: ringBgColor, borderWidth: bgRingWidth },
          ]}
        />
        <View
          style={[
            styles.firstProgressLayer,
            firstProgressLayerStyle,
            commonStyles,
            ringColorStyle,
            {
              borderTopWidth: progressRingWidth,
              borderRightWidth: progressRingWidth,
            },
          ]}
        />
        {displayThickOffsetLayer && (
          <View
            style={[
              styles.offsetLayer,
              commonStyles,
              thickOffsetRingStyle,
              {
                transform: [{ rotateZ: `${offsetLayerRotation}deg` }],
                borderWidth: progressRingWidth,
              },
            ]}
          />
        )}
        {renderThirdLayer(
          percent,
          commonStyles,
          ringColorStyle,
          ringBgColorStyle,
          clockwise,
          bgRingWidth,
          progressRingWidth,
          innerRingStyle,
          startDegrees,
        )}
        <Text
          style={[
            styles.display,
            {
              fontSize: textFontSize,
              fontWeight: textFontWeight,
              color: textFontColor,
            },
          ]}>
          {percent}%
        </Text>
      </View>
    );
  };

  const CircularProgress2 = ({
    percent,
    radius,
    bgRingWidth,
    progressRingWidth,
    ringColor,
    ringBgColor,
    textFontSize,
    textFontWeight,
    textFontColor,
    clockwise,
    bgColor,
    startDegrees,
  }) => {
    const commonStyles = {
      width: radius * 2,
      height: radius * 2,
      borderRadius: radius,
      borderTopWidth: progressRingWidth,
      borderLeftWidth: progressRingWidth,
      borderBottomWidth: progressRingWidth,
      borderRightWidth: progressRingWidth,
    };
  
    /**
     * Calculate radius for base layer and offset layer.
     * If progressRingWidth == bgRingWidth, innerRadius is equal to radius
     **/
    const widthDiff = progressRingWidth - bgRingWidth;
    const innerRadius = radius - progressRingWidth + bgRingWidth + widthDiff / 2;
  
    const innerRingStyle = {
      width: innerRadius * 2,
      height: innerRadius * 2,
      borderRadius: innerRadius,
      borderTopWidth: bgRingWidth,
      borderLeftWidth: bgRingWidth,
      borderBottomWidth: bgRingWidth,
      borderRightWidth: bgRingWidth,
    };
  
    const ringColorStyle = {
      borderRightColor: ringColor,
      borderTopColor: ringColor,
    };
  
    const ringBgColorStyle = {
      borderRightColor: ringBgColor,
      borderTopColor: ringBgColor,
    };
  
    const thickOffsetRingStyle = {
      borderRightColor: bgColor,
      borderTopColor: bgColor,
    };
  
    let rotation = -135 + startDegrees;
    /**
     * If we want our ring progress to be displayed in anti-clockwise direction
     **/
    if (!clockwise) {
      rotation += 180;
    }
    let firstProgressLayerStyle;
    /* when ther ring's border widths are different and percent is less than 50, then we need an offsetLayer
     * before the original offser layer to avoid ring color of the thick portion to be visible in the background.
     */
    let displayThickOffsetLayer = false;
    if (percent > 50) {
      firstProgressLayerStyle = rotateByStyle(50, rotation, clockwise);
    } else {
      firstProgressLayerStyle = rotateByStyle(percent, rotation, clockwise);
      if (progressRingWidth > bgRingWidth) {
        displayThickOffsetLayer = true;
      }
    }
  
    let offsetLayerRotation = -135 + startDegrees;
    if (!clockwise) {
      offsetLayerRotation += 180;
    }
  
    return (
      <View style={[styles.containerCircle, { width: radius * 2, height: radius * 2 }]}>
        <View
          style={[
            styles.baselayer,
            innerRingStyle,
            { borderColor: ringBgColor, borderWidth: bgRingWidth },
          ]}
        />
        <View
          style={[
            styles.firstProgressLayer,
            firstProgressLayerStyle,
            commonStyles,
            ringColorStyle,
            {
              borderTopWidth: progressRingWidth,
              borderRightWidth: progressRingWidth,
            },
          ]}
        />
        {displayThickOffsetLayer && (
          <View
            style={[
              styles.offsetLayer,
              commonStyles,
              thickOffsetRingStyle,
              {
                transform: [{ rotateZ: `${offsetLayerRotation}deg` }],
                borderWidth: progressRingWidth,
              },
            ]}
          />
        )}
        {renderThirdLayer(
          percent,
          commonStyles,
          ringColorStyle,
          ringBgColorStyle,
          clockwise,
          bgRingWidth,
          progressRingWidth,
          innerRingStyle,
          startDegrees,
        )}
        <Text
          style={[
            styles.display,
            {
              fontSize: textFontSize,
              fontWeight: textFontWeight,
              color: textFontColor,
            },
          ]}>
          {percent}%
        </Text>
      </View>
    );
  };

  const CircularProgress3 = ({
    percent,
    radius,
    bgRingWidth,
    progressRingWidth,
    ringColor,
    ringBgColor,
    textFontSize,
    textFontWeight,
    textFontColor,
    clockwise,
    bgColor,
    startDegrees,
  }) => {
    const commonStyles = {
      width: radius * 2,
      height: radius * 2,
      borderRadius: radius,
      borderTopWidth: progressRingWidth,
      borderLeftWidth: progressRingWidth,
      borderBottomWidth: progressRingWidth,
      borderRightWidth: progressRingWidth,
    };
  
    /**
     * Calculate radius for base layer and offset layer.
     * If progressRingWidth == bgRingWidth, innerRadius is equal to radius
     **/
    const widthDiff = progressRingWidth - bgRingWidth;
    const innerRadius = radius - progressRingWidth + bgRingWidth + widthDiff / 2;
  
    const innerRingStyle = {
      width: innerRadius * 2,
      height: innerRadius * 2,
      borderRadius: innerRadius,
      borderTopWidth: bgRingWidth,
      borderLeftWidth: bgRingWidth,
      borderBottomWidth: bgRingWidth,
      borderRightWidth: bgRingWidth,
    };
  
    const ringColorStyle = {
      borderRightColor: ringColor,
      borderTopColor: ringColor,
    };
  
    const ringBgColorStyle = {
      borderRightColor: ringBgColor,
      borderTopColor: ringBgColor,
    };
  
    const thickOffsetRingStyle = {
      borderRightColor: bgColor,
      borderTopColor: bgColor,
    };
  
    let rotation = -135 + startDegrees;
    /**
     * If we want our ring progress to be displayed in anti-clockwise direction
     **/
    if (!clockwise) {
      rotation += 180;
    }
    let firstProgressLayerStyle;
    /* when ther ring's border widths are different and percent is less than 50, then we need an offsetLayer
     * before the original offser layer to avoid ring color of the thick portion to be visible in the background.
     */
    let displayThickOffsetLayer = false;
    if (percent > 50) {
      firstProgressLayerStyle = rotateByStyle(50, rotation, clockwise);
    } else {
      firstProgressLayerStyle = rotateByStyle(percent, rotation, clockwise);
      if (progressRingWidth > bgRingWidth) {
        displayThickOffsetLayer = true;
      }
    }
  
    let offsetLayerRotation = -135 + startDegrees;
    if (!clockwise) {
      offsetLayerRotation += 180;
    }
  
    return (
      <View style={[styles.containerCircle, { width: radius * 2, height: radius * 2 }]}>
        <View
          style={[
            styles.baselayer,
            innerRingStyle,
            { borderColor: ringBgColor, borderWidth: bgRingWidth },
          ]}
        />
        <View
          style={[
            styles.firstProgressLayer,
            firstProgressLayerStyle,
            commonStyles,
            ringColorStyle,
            {
              borderTopWidth: progressRingWidth,
              borderRightWidth: progressRingWidth,
            },
          ]}
        />
        {displayThickOffsetLayer && (
          <View
            style={[
              styles.offsetLayer,
              commonStyles,
              thickOffsetRingStyle,
              {
                transform: [{ rotateZ: `${offsetLayerRotation}deg` }],
                borderWidth: progressRingWidth,
              },
            ]}
          />
        )}
        {renderThirdLayer(
          percent,
          commonStyles,
          ringColorStyle,
          ringBgColorStyle,
          clockwise,
          bgRingWidth,
          progressRingWidth,
          innerRingStyle,
          startDegrees,
        )}
        <Text
          style={[
            styles.display,
            {
              fontSize: textFontSize,
              fontWeight: textFontWeight,
              color: textFontColor,
            },
          ]}>
          {percent}%
        </Text>
      </View>
    );
  };


export function DrawerContent(props) {

    const paperTheme = useTheme();
    
    const [isLoading, setLoading] = useState(true);
    const { signOut, toggleTheme } = React.useContext(AuthContext);
    const [ userName, setUserName] = useState("");
    const [ progress1, setProgress1] = useState(0);
    const [ progress2, setProgress2] = useState(0);
    const [ progress3, setProgress3] = useState(0);
    const [ streak, setStreak] = useState(0);
    const [dictionarieUrl, setDictionarieUrl] = useState(null);

    AsyncStorage.getItem('userName').then( value => { setUserName(value); });

      // default values for props
  CircularProgress1.defaultProps = {
    percent: progress1,
    radius: 35,
    bgRingWidth: 7,
    progressRingWidth: 6,
    ringColor: '#9cb9ff',
    ringBgColor: '#36425e',
    textFontSize: 18,
    textFontColor: '#9cb9ff',
    textFontWeight: 'bold',
    clockwise: true, 
    bgColor: 'white',
    startDegrees: 0,
  };

  CircularProgress2.defaultProps = {
    percent: progress2,
    radius: 35,
    bgRingWidth: 7,
    progressRingWidth: 6,
    ringColor: '#ffff6b',
    ringBgColor: '#36425e',
    textFontSize: 18,
    textFontColor: '#ffff6b',
    textFontWeight: 'bold',
    clockwise: true,
    bgColor: 'white',
    startDegrees: 0,
  };

  CircularProgress3.defaultProps = {
    percent: progress3,
    radius: 35,
    bgRingWidth: 7,
    progressRingWidth: 6,
    ringColor: '#5eff87',
    ringBgColor: '#36425e',
    textFontSize: 18,
    textFontColor: '#5eff87',
    textFontWeight: 'bold',
    clockwise: true,
    bgColor: 'white',
    startDegrees: 0,
  };

  const isDrawerOpen = useIsDrawerOpen();

    if (isDrawerOpen == true) {
      fetch(`${global.apiUrl}/dictionaries`) 
      .then((response) => response.json())
      .then((json) => {
        setProgress1(json.progress_1);
        setProgress2(json.progress_2);
        setProgress3(json.progress_3);
        setStreak(json.streak);
      })
      .catch((error) => console.error(error))
      .finally(() => setLoading(false));
    }

    return(
        <View style={{flex:1, backgroundColor: '#445273', justifyContent: "space-between"}}>
            <DrawerContentScrollView {...props}>
                <View style={styles.drawerContent}>
                    <View style={styles.userInfoSection}>
                            <Avatar.Image 
                                style={{borderColor: "#ffa64d", borderWidth: 2}}
                                source={{
                                    uri: 'https://robohash.org/user'
                                }}
                                size={50}
                            />
                            <View style={{marginLeft:15, flexDirection:'column',}}>
                                <Text style={styles.title}>{userName}</Text>
                            </View>
                    </View>
                    <View style={[styles.trainingProgress, {borderBottomWidth: 1, borderBottomColor:'#20293d',}]}>
                        <Text style={{fontSize: 18, fontWeight: "bold", color: "#ffa64d", textAlign: "center", paddingTop: 20, paddingBottom:0}}>Day streak</Text>
                        <Text style={{fontSize: 54, fontWeight: "bold", color: "#ffa64d", textAlign: "center"}}>{streak}</Text>
                    </View>
                    <View style={styles.trainingProgress}>
                        <Text style={{fontSize: 18, color: "#D8E3E6", textAlign: "center", paddingVertical: 15}}>{I18n.t("YourTrainingProgress")}</Text>
                        <View style={styles.circlesContainer}>
                            <CircularProgress1></CircularProgress1>
                            <CircularProgress2></CircularProgress2>
                            <CircularProgress3></CircularProgress3>
                        </View>
                    </View>
                    <Drawer.Section style={styles.drawerSection}>
                        <DrawerItem 
                            icon={({color, size}) => (
                                <Icon 
                                name="cog-outline" 
                                color={"#ffffff"}
                                size={size}
                                />
                            )}
                            label={I18n.t("Settings")}
                            labelStyle={{ color: "#ffffff"}}
                            onPress={() => {props.navigation.navigate('SettingsScreen')}}
                        />
                    </Drawer.Section>
                </View>
            </DrawerContentScrollView>
            <Drawer.Section style={styles.bottomDrawerSection}>
                <DrawerItem 
                    icon={({color, size}) => (
                        <Icon 
                        name="exit-to-app" 
                        color={"#ffffff"}
                        size={size}
                        />
                    )}
                    label={I18n.t("SignOut")}
                    labelStyle={{ color: "#ffffff"}}
                    onPress={() => {signOut()}}
                />
            </Drawer.Section>
        </View>
    );
}

const styles = StyleSheet.create({
    drawerContent: {
      flex: 1,
    },
    userInfoSection: {
      flexDirection: "row",
      alignItems: 'center',
      paddingLeft: 20,
      borderBottomColor: "#20293d",
      borderBottomWidth: 1,
      paddingVertical: 25,
    },
    title: {
      fontSize: 16,
      fontWeight: 'bold',
      color: "#ffa64d",
      marginBottom: 5,
    },
    caption: {
      fontSize: 14,
      lineHeight: 14,
      color: "#ffffff",
    },
    row: {
      marginTop: 20,
      flexDirection: 'row',
      alignItems: 'center',
    },
    section: {
      flexDirection: 'row',
      alignItems: 'center',
      marginRight: 15,
    },
    paragraph: {
      fontWeight: 'bold',
      marginRight: 3,
    },
    drawerSection: {
      marginTop: 15,
      borderColor: '#20293d',
      borderTopWidth: 1,
      borderBottomWidth: 1,
    },
    bottomDrawerSection: {
        marginBottom: 15,
        borderColor: '#20293d',
        borderTopWidth: 1,
        borderBottomWidth: 1,
    },
    preference: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      paddingVertical: 12,
      paddingHorizontal: 16,
    },
    trainingProgress: {
        flexDirection: "column",
        justifyContent: "center",
        paddingBottom: 15,
    },
    circlesContainer: {
        flexDirection: "row",
        justifyContent: "space-around",
    },
    containerCircle: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    baselayer: {
        position: 'absolute',
    },
    firstProgressLayer: {
        position: 'absolute',
        borderLeftColor: 'transparent',
        borderBottomColor: 'transparent',
    },
    secondProgressLayer: {
        position: 'absolute',
        borderLeftColor: 'transparent',
        borderBottomColor: 'transparent',
    },
    offsetLayer: {
        position: 'absolute',
        borderLeftColor: 'transparent',
        borderBottomColor: 'transparent',
    },
    display: {
        position: 'absolute',
    },
  });
