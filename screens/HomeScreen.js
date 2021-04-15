import React, {useState, useEffect} from 'react';
import {
  FlatList,
  SafeAreaView,
  ActivityIndicator,
  Dimensions,
  StatusBar,
  StyleSheet,
  Text,
  Image,
  View,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import Icon from 'react-native-vector-icons/Ionicons';
import {useTheme} from '@react-navigation/native';
import LinearGradient from 'react-native-linear-gradient';
import AsyncStorage from '@react-native-community/async-storage';
import {useFocusEffect} from '@react-navigation/native';

import {apiUrl} from '../env/dev.js';
import I18n from '../env/i18n';

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
    transform: [{rotateZ: `${rotateBy}deg`}],
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
          {transform: [{rotateZ: `${offsetLayerRotation}deg`}]},
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
    <View
      style={[styles.containerCircle, {width: radius * 2, height: radius * 2}]}>
      <View
        style={[
          styles.baselayer,
          innerRingStyle,
          {borderColor: ringBgColor, borderWidth: bgRingWidth},
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
              transform: [{rotateZ: `${offsetLayerRotation}deg`}],
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
    </View>
  );
};

const initialData = {
  progress_1: 0,
  progress_2: 0,
  progress_3: 0,
  streak: 0,
  objects: [
    {
      id: 101022,
      name: '',
      description: '',
      progress: 0,
      url: 0,
    },
  ],
};

const HomeScreen = ({route, navigation}) => {
  const [isLoading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState(null);
  const [data, setData] = useState(initialData);
  let positionInList = 0;
  const [userName, setUserName] = useState('');

  AsyncStorage.getItem('userName').then((value) => {
    setUserName(value);
  });

  const Item = ({item, onPress}) => (
    <TouchableOpacity onPress={onPress} style={[styles.listItem]}>
      <View style={[styles.numberContainer]}>
        <Text style={styles.numberContainerText}>{++positionInList}</Text>
        {CircularProgress1({
          percent: item.progress,
          radius: 35,
          bgRingWidth: 6,
          progressRingWidth: 6,
          ringColor: '#9cb9ff',
          ringBgColor: '#36425e',
          clockwise: true,
          bgColor: 'white',
          startDegrees: 0,
        })}
      </View>
      <View style={styles.mainTextBlock}>
        <Text style={styles.title}>{item.name}</Text>
        <Text style={styles.description}>{item.description}</Text>
      </View>
      <View style={styles.itemIcon}>
        <MaterialIcons name="navigate-next" color="#ffa64d" size={30} />
      </View>
    </TouchableOpacity>
  );

  const renderItem = ({item, index}) => {
    return (
      <Item
        item={item}
        onPress={() => {
          setSelectedId(item.order);
          const dataUrl = {categorieUrl: item.url, categorieName: item.name};
          if (item.url != 0) {
            navigation.navigate('Phrasebook', dataUrl);
          }
        }}
      />
    );
  };

  useFocusEffect(
    React.useCallback(() => {
      if (global.apiUrl == '' || global.apiUrl == null) {
        AsyncStorage.getItem('globalAPIUrl').then((value) => {
          global.apiUrl = value;
        });
        fetch(`${global.apiUrl}/dictionaries`)
          .then((response) => response.json())
          .then((json) => {
            setData(json);
            console.log(json);
          })
          .catch((error) => console.error(error))
          .finally(() => setLoading(false));
      } else {
        fetch(`${global.apiUrl}/dictionaries`)
          .then((response) => response.json())
          .then((json) => {
            setData(json);
            console.log(json);
          })
          .catch((error) => console.error(error))
          .finally(() => setLoading(false));
      }
    }, []),
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor="#20293d" barStyle="light-content" />
      {isLoading ? (
        <ActivityIndicator
          size="large"
          color="#b5c2c6"
          style={{flex: 1, justifyContent: 'center'}}
        />
      ) : (
        <FlatList
          ListHeaderComponent={
            <View style={styles.headerTextBlock}>
              <View
                style={{
                  flexDirection: 'row',
                  width: '90%',
                  justifyContent: 'space-between',
                }}>
                <Text style={styles.headerTitle}>
                  {I18n.t('HelloThere')}, {userName}!
                </Text>
                <TouchableOpacity
                  style={{padding: 10}}
                  onPress={() => navigation.openDrawer()}>
                  <Icon name="ios-menu" size={25} color="#ffffff" />
                </TouchableOpacity>
              </View>
              <View style={{width: '90%', justifyContent: 'flex-start'}}>
                <Text style={styles.headerSubtitle}>
                  {I18n.t('HelloDescription')}
                </Text>
              </View>
            </View>
          }
          data={data.objects}
          renderItem={renderItem}
          keyExtractor={(item) => item.id.toString()}
          extraData={selectedId}
          style={styles.listContainer}
          ListFooterComponent={() => <View style={styles.overlayBackground} />}
        />
      )}
      <LinearGradient
        colors={['#00000000', '#00000030', '#00000060']}
        style={styles.overlayShadow}
      />
    </SafeAreaView>
  );
};

export default HomeScreen;

const {height} = Dimensions.get('screen');
const {width} = Dimensions.get('screen');
const height_image = height * 0.5 * 0.8;
const width_image = height_image * 1.1;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#20293d',
  },
  headerTextBlock: {
    width: '100%',
    flex: 1,
    flexDirection: 'column',
    alignItems: 'center',
    paddingVertical: 25,
  },
  headerTitle: {
    fontSize: 28,
    color: '#D8E3E6',
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#445273',
    width: '75%',
  },
  listItem: {
    marginVertical: 6,
    marginHorizontal: 25,
    paddingVertical: 15,
    paddingHorizontal: 15,
    borderRadius: 10,
    backgroundColor: '#445273',
    width: '90%',
    flex: 1,
    alignSelf: 'center',
    flexDirection: 'row',
    borderRadius: 5,
  },
  numberContainer: {
    height: 50,
    width: 50,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    marginLeft: 10,
    backgroundColor: '#ffa64d',
  },
  numberContainerText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
    position: 'absolute',
  },
  mainTextBlock: {
    alignItems: 'flex-start',
    flex: 1,
    marginLeft: 20,
  },
  itemIcon: {
    height: 50,
    width: 50,
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffa64d',
    letterSpacing: 2,
  },
  item: {
    padding: 20,
    marginVertical: 8,
    marginHorizontal: 16,
  },
  description: {
    fontSize: 16,
    color: '#D8E3E6',
  },
  overlayBackground: {
    width: width,
    height: 30,
    backgroundColor: '#20293d',
  },
  overlayShadow: {
    position: 'absolute',
    bottom: 0,
    height: 30,
    width: width,
  },
  circlesContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
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
