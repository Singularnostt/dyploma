import React, { useState, useEffect, useRef, Component } from "react";
import { FlatList, SafeAreaView, StatusBar, TextInput, Dimensions, StyleSheet, Text, Image, View, ScrollView,   Alert,
  Modal,
  TouchableHighlight,
  TouchableOpacity,
  ActivityIndicator,
  Platform,
  ImageBackground
} from "react-native";
import Icon from 'react-native-vector-icons/Ionicons';
import IconMat from 'react-native-vector-icons/MaterialIcons';
import { SearchBar } from 'react-native-elements';
import I18n from "../env/i18n";
import {apiUrl} from '../env/dev';
import Sound from 'react-native-sound';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import LinearGradient from 'react-native-linear-gradient';


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

const PhrasebookScreen = ({route,navigation}) => {

  const [isLoading, setLoading] = useState(true);

  const [modalVisible, setModalVisible] = useState(false);

  const [search, setSearch] = useState('');
  const [filteredDataSource, setFilteredDataSource] = useState(null);
  const [masterDataSource, setMasterDataSource] = useState([]);

  const { categorieUrl, categorieName } = route.params;

  const [translationLangKey, setTranslationLangKey] = useState("polish");

  let langUrlKey = "";

  function playTrack(audio){

    let audioTrack = audio.split('\/').join('/');

    console.log(audioTrack);

    const track = new Sound(`${global.apiUrl}${audioTrack}`, null, (e) => {
      if (e) {
        console.log('error loading track:', e);
      } else {
        track.play();
        console.log("track has been played");
      }
    })
  }
  
  useEffect(() => {
    if (filteredDataSource == null) { 
      fetch(`${global.apiUrl}${categorieUrl}`)
      .then((response) => response.json())
      .then((json) => setFilteredDataSource(json))
      .catch((error) => console.error(error))
      .finally(() => setLoading(false));
    }
  }, []);

  const searchFilterFunction = (text) => {
    if (text) {
      const newData = masterDataSource.filter(function (item) {
        const itemData = item.searchstring
          ? item.searchstring.toUpperCase()
          : ''.toUpperCase();
        const textData = text.toUpperCase();
        return itemData.indexOf(textData) > -1;
      });
      setFilteredDataSource(newData);
      setSearch(text);
    } else {
      setFilteredDataSource(masterDataSource);
      setSearch(text);
    }
  };

  function getProgress (progress) {
    if ( progress == 0 ){
      return (
        <View style={{flexDirection: "row"}}>
          <IconMat name="star-outline" color="#85CEE4" size={24} />
          <IconMat name="star-outline" color="#85CEE4" size={24} />
          <IconMat name="star-outline" color="#85CEE4" size={24} />
          <IconMat name="star-outline" color="#85CEE4" size={24} />
        </View>
      )
    } else if ( progress == 1 ) {
      return (
      <View style={{flexDirection: "row"}}>
        <IconMat name="star-rate" color="#ffa64d" size={24} />
        <IconMat name="star-outline" color="#D8E3E6" size={24} />
        <IconMat name="star-outline" color="#D8E3E6" size={24} />
        <IconMat name="star-outline" color="#D8E3E6" size={24} />
      </View>
      )
    } else if ( progress == 2 ) {
      return (
      <View style={{flexDirection: "row"}}>
        <IconMat name="star-rate" color="#ffa64d" size={24} />
        <IconMat name="star-rate" color="#ffa64d" size={24} />
        <IconMat name="star-outline" color="#D8E3E6" size={24} />
        <IconMat name="star-outline" color="#D8E3E6" size={24} />
      </View>
      )
    } else if ( progress == 3 ) {
      return (
      <View style={{flexDirection: "row"}}>
        <IconMat name="star-rate" color="#ffa64d" size={24} />
        <IconMat name="star-rate" color="#ffa64d" size={24} />
        <IconMat name="star-rate" color="#ffa64d" size={24} />
        <IconMat name="star-outline" color="#D8E3E6" size={24} />
      </View>
      )
    } else if ( progress == 4 ) {
      return (
      <View style={{flexDirection: "row"}}>
        <IconMat name="star-rate" color="#ffa64d" size={24} />
        <IconMat name="star-rate" color="#ffa64d" size={24} />
        <IconMat name="star-rate" color="#ffa64d" size={24} />
        <IconMat name="star-rate" color="#ffa64d" size={24} />
      </View>
      )
    }
  }

  const ItemView = ({ item }) => {
    return (
      <View style={{backgroundColor: '#445273', paddingVertical: 15, paddingHorizontal: 15, flexDirection: "row", maxWidth: "100%", justifyContent: "space-between"}}>
        <View style={{flex: 1}}>
          <View style={styles.itemContainer}>
            <Text style={styles.itemStyle}>{item.word}</Text>
          </View>
          <View style={[styles.itemContainer, {paddingVertical: 5}]}>  
            <Text style={{color: '#D8E3E6', fontSize: 18 }}>{ item.translation }</Text>
          </View>
        </View>
        <View style={{flexDirection: "row"}}>
          <TouchableOpacity onPress={ () => { playTrack(item.audio) }}  style={{marginRight: 15}}>
                  <Icon 
                  name="volume-medium-outline"
                  color="#85CEE4"
                  size={28}
                  />
          </TouchableOpacity>
          {getProgress(item.progress)}
        </View>
      </View>
    );
  };

  const ItemSeparatorView = () => {
    return (
      <View
        style={{
          height: 1,
          width: '100%',
          backgroundColor: '#20293d',
        }}
      />
    );
  };

    return (
      <SafeAreaView style={styles.container}>
        {isLoading ? <ActivityIndicator size="large" color="#b5c2c6"  style={{ flex: 1, justifyContent: 'center'}}/> : (
        <View style={{flex: 1, backgroundColor: "#445273"}}>
          <View style={styles.headerTabBar}>
            <View style={styles.headerTitleBlock}>
              <TouchableOpacity onPress={ () => { navigation.goBack() }}>
              <MaterialIcons 
                        name="navigate-before"
                        color="#ffffff"
                        size={34}
                        />
              </TouchableOpacity>
              <Text style={{ color: "#ffffff", fontWeight: "bold", fontSize: 24 }}>{categorieName}</Text>
              <MaterialIcons 
                        name="navigate-before"
                        color="transparent"
                        size={34}
                        />
            </View>
          </View>
        <FlatList
                  ListHeaderComponent={
                    <View style={{backgroundColor: "#20293d"}}>
                    <View style={{ flexDirection: "row", width: "100%", justifyContent: 'space-around', paddingVertical: 15}}> 
                      <View style={styles.reviewContainer}>
                          { CircularProgress1({
                            percent: filteredDataSource.progress_1,
                            radius: 35,
                            bgRingWidth: 6,
                            progressRingWidth: 6,
                            ringColor: '#9cb9ff',
                            ringBgColor: '#36425e',
                            clockwise: true, 
                            textFontSize: 18,
                            textFontColor: '#9cb9ff',
                            textFontWeight: 'bold',
                            bgColor: 'white',
                            startDegrees: 0,
                          })}
                        <Text style={{fontSize: 20, color: "#ffffff", marginTop: 5}}>Exercise 1</Text>
                      </View>
                      <View style={styles.reviewContainer}>                      
                      { CircularProgress2({
                            percent: filteredDataSource.progress_2,
                            radius: 35,
                            bgRingWidth: 6,
                            progressRingWidth: 6,
                            ringColor: '#9cb9ff',
                            ringBgColor: '#36425e',
                            clockwise: true, 
                            textFontSize: 18,
                            textFontColor: '#9cb9ff',
                            textFontWeight: 'bold',
                            bgColor: 'white',
                            startDegrees: 0,
                          })}
                        <Text style={{fontSize: 20, color: "#ffffff", marginTop: 5}}>Exercise 2</Text>
                      </View>
                      <View style={styles.reviewContainer}>
                      { CircularProgress3({
                            percent: filteredDataSource.progress_3,
                            radius: 35,
                            bgRingWidth: 6,
                            progressRingWidth: 6,
                            ringColor: '#9cb9ff',
                            ringBgColor: '#36425e',
                            clockwise: true, 
                            textFontSize: 18,
                            textFontColor: '#9cb9ff',
                            textFontWeight: 'bold',
                            bgColor: 'white',
                            startDegrees: 0,
                          })}
                          <Text style={{fontSize: 20, color: "#ffffff", marginTop: 5}}>Exercise 3</Text>
                      </View>
                  </View>
                    </View>
                  }
          data={filteredDataSource.objects}
          keyExtractor={(item, index) => index.toString()}
          ItemSeparatorComponent={ItemSeparatorView}
          renderItem={ItemView}
        />
          </View>
        )}
      </SafeAreaView >
    );

};

export default PhrasebookScreen;

const{height} = Dimensions.get('screen');
const{width} = Dimensions.get('screen');
const height_image = height * 0.5 * 0.8;
const width_image = height_image * 1.1;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    height: height,
    flexDirection: 'column',
    backgroundColor: '#D8E3E6',
    justifyContent: 'space-between',
  },
  heading:{
    marginTop: 50,
    marginBottom:10,
    marginLeft: 15,
    fontSize: 25
  },
  itemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  itemStyle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: "#ffffff"
  },
  imageTop: {
    height: 28,
    width: 28,
    resizeMode: 'contain'
  },
  image: {
    height: 50,
    width: 50,
    resizeMode: 'contain'
  },
  modalSchedule: {
    flex: 1,
  },
  modalScheduleContainer: {
    flex: 1,
    paddingTop: '60%',
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
  },
  modalCancelButton: {
    width: '90%',
    height: 65,
    backgroundColor: '#ffffff',
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: '5%',
    borderRadius: 15,
    marginBottom: 15,
  },
  cancelText: {
    color: '#000000',
    fontSize: 16,
  },
  timeScheduleContainer: {
    flex:1,
    justifyContent: 'center',
    alignSelf:"center",
    alignItems: 'center',
    flexDirection:"row",
    paddingVertical: 5,
    backgroundColor:"#FFFFFF",
    width: '90%',
    marginVertical: 5,
    marginBottom: 15,
    borderRadius: 15
  },
  textContainer:{
    marginBottom: 15,
    justifyContent: 'center',
    alignItems: 'center',
  },
  languagesContainer:{
    width:'100%',
    justifyContent:'center',
    alignItems:'center',
  },
  languageListIcon: {
    width:65,
    height:65,
    resizeMode:'contain',
    borderRadius: 25,
  },
  placeholderBackground: {
    backgroundColor: '#D8E3E6',
    height:65,
    width:65,
    borderRadius:10,
    marginVertical:18,
    marginHorizontal: 18, 
  },
  title: {
    fontSize: 24, 
    fontFamily: "Oyko-Medium",
  },
  reviewContainer:{
    alignItems: "center",
    paddingVertical: 15,
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
headerTabBar: {
  flexDirection: 'row',
  justifyContent: 'space-between',
  backgroundColor: '#20293d',
  width: '100%',
  height: 55,
  paddingHorizontal: 18,
  shadowColor: "#000",
  shadowOffset: {
    width: 0,
    height: 2,
  },
  shadowOpacity: 0.20,
  shadowRadius: 1.41,
  
  elevation: 3,
},
headerTitleBlock: {
  flexDirection: 'row',
  justifyContent: 'space-between',
  alignItems: 'center',
  width:'100%',
  overflow: 'hidden',
},
headerTitleText: {
  fontSize: 20,
  color: '#000000',
  fontFamily: "Oyko-Bold",
  marginLeft: 18
},
overlayBackground: {
  width: width,
  height: 30,
  backgroundColor: '#445273'
},
overlayShadow: {
  position: 'absolute',
  bottom: 0,
  height: 30,
  width: width,
},
});