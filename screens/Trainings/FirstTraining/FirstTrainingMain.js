import React, { useState, useEffect, useRef } from 'react';
import { 
    View, 
    Text, 
    TouchableOpacity, 
    Dimensions,
    StyleSheet,
    Modal,
    ScrollView,
    SafeAreaView,
    FlatList,
    ActivityIndicator,
    Image,
    TextInput
} from 'react-native';
import AsyncStorage from '@react-native-community/async-storage';
import LinearGradient from 'react-native-linear-gradient';
import * as Animatable from 'react-native-animatable';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import Icon from 'react-native-vector-icons/Ionicons';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import { useTheme } from '@react-navigation/native';
import {apiUrl} from '../../../env/dev';
import Sound from 'react-native-sound';
import Swiper from 'react-native-deck-swiper';
import { Transitioning, Transition, set } from 'react-native-reanimated';
import { useFocusEffect } from '@react-navigation/native';
import I18n from "../../../env/i18n";

const { width } = Dimensions.get("window");

const ANIMATION_DURATION = 200;

const transition = (
  <Transition.Sequence>
    <Transition.Out
      type='slide-bottom'
      durationMs={ANIMATION_DURATION}
      interpolation='easeIn'
    />
    <Transition.Together>
      <Transition.In
        type='fade'
        durationMs={ANIMATION_DURATION}
        delayMs={ANIMATION_DURATION / 2}
      />
      <Transition.In
        type='slide-bottom'
        durationMs={ANIMATION_DURATION}
        delayMs={ANIMATION_DURATION / 2}
        interpolation='easeOut'
      />
    </Transition.Together>
  </Transition.Sequence>
);

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

const initialData = [
  {"id":380,"word":"Mi\u0142o mi Ci\u0119 pozna\u0107.","translation":"Nice to meet you.","fakeTranslations":[{"id":380,"name":"Nice to meet you."},{"id":372,"name":"Goodnight!"},{"id":411,"name":"Where is free WiFi?"},{"id":399,"name":"I do not understand."}],"audio":"c784db4fcd7d.ngrok.io:80\/content\/download\/378\/audio\/20.wav?inLanguage=eng-GB","swipeFake":"See you later!","image":"http:\/\/c784db4fcd7d.ngrok.io\/var\/site\/storage\/images\/_aliases\/large\/9\/9\/2\/3\/3299-3-eng-GB\/download.png"},
];

let answerArrayForUser = [];
let answerArrayForServer1 = [];
let answerArrayForServer2 = [];
let answerArrayForServer3 = [];
let rightAnswerCounter = 0;

let answerPercent = 0;
let answerCircleColor = '#ffffff';
let answerCircleBackgroundColor = '#ffffff';

let swappedAll = 1;

const FirstTrainingMain = ({navigation}) => {

  const [index, setIndex] = useState(0);
  const swiperRef = useRef(null);

  const checkWrittenAnswer = (id, word) => {
    
        let answerContainerForServer2 = null;
        let preparedString = text.toUpperCase();
        let preparedOriginalText = word.toUpperCase();

        preparedString = preparedString.replace(/\s+/g, "");
        preparedOriginalText = preparedOriginalText.replace(/\s+/g, "");

        if (preparedOriginalText == preparedString) {
          answerContainerForServer2 = {"id": id, "status": "n1n"};
          setExercise2_indicator('#99ff99');
          rightAnswerCounter ++;
        } else {
          answerContainerForServer2 = {"id": id, "status": "n0n"};
          setExercise2_indicator('#ff5c33');
        }

        setText("");
    
        answerArrayForServer2.push(answerContainerForServer2);        
    
  };

  const onSwipedLeft = () => {

     let answerContainerForServer3 = null;
     let x = WordsStepper.length - 1;

    if (swappedAll <= x ) {
      if (WordsStepper[index]["word"] != WordsStepper[index]["swipeFake"]){
        answerContainerForServer3 = {"id": WordsStepper[index]["id"], "status": "nn1"};

        if ( swappedAll == 1){
          setExercise3_indicator1('#99ff99');
        } else if ( swappedAll == 2 ) {
          setExercise3_indicator2('#99ff99');
        } else if ( swappedAll == 3 ) {
          setExercise3_indicator3('#99ff99');
        } else if ( swappedAll == 4 ) {
          setExercise3_indicator4('#99ff99');
        } else if ( swappedAll == 5 ) {
          setExercise3_indicator5('#99ff99');
        }

        rightAnswerCounter ++;

      } else {
        answerContainerForServer3 = {"id": WordsStepper[index]["id"], "status": "nn0"};
        if ( swappedAll == 1){
          setExercise3_indicator1('#ff5c33');
        } else if ( swappedAll == 2 ) {
          setExercise3_indicator2('#ff5c33');
        } else if ( swappedAll == 3 ) {
          setExercise3_indicator3('#ff5c33');
        } else if ( swappedAll == 4 ) {
          setExercise3_indicator4('#ff5c33');
        } else if ( swappedAll == 5 ) {
          setExercise3_indicator5('#ff5c33');
        }
      }

      answerArrayForServer3.push(answerContainerForServer3);

      setIndex((index + 1) % WordsStepper.length);
      swappedAll++;

    } else {
      if (WordsStepper[index]["word"] != WordsStepper[index]["swipeFake"]){
        answerContainerForServer3 = {"id": WordsStepper[index]["id"], "status": "nn1"};
        if ( swappedAll == 1){
          setExercise3_indicator1('#99ff99');
        } else if ( swappedAll == 2 ) {
          setExercise3_indicator2('#99ff99');
        } else if ( swappedAll == 3 ) {
          setExercise3_indicator3('#99ff99');
        } else if ( swappedAll == 4 ) {
          setExercise3_indicator4('#99ff99');
        } else if ( swappedAll == 5 ) {
          setExercise3_indicator5('#99ff99');
        }
        rightAnswerCounter ++;
      } else {
        answerContainerForServer3 = {"id": WordsStepper[index]["id"], "status": "nn0"};
        if ( swappedAll == 1){
          setExercise3_indicator1('#ff5c33');
        } else if ( swappedAll == 2 ) {
          setExercise3_indicator2('#ff5c33');
        } else if ( swappedAll == 3 ) {
          setExercise3_indicator3('#ff5c33');
        } else if ( swappedAll == 4 ) {
          setExercise3_indicator4('#ff5c33');
        } else if ( swappedAll == 5 ) {
          setExercise3_indicator5('#ff5c33');
        }
      }

      setIndex((index + 1) % WordsStepper.length);
      swappedAll = 1;
      answerArrayForServer3.push(answerContainerForServer3);
      nextStep();
    }

  };

  const onSwipedRight = () => {
    
    let answerContainerForServer3 = null;
    let x = WordsStepper.length - 1;

    if (swappedAll <= x ) {
      if (WordsStepper[index]["word"] == WordsStepper[index]["swipeFake"]){
        answerContainerForServer3 = {"id": WordsStepper[index]["id"], "status": "001"};
        if ( swappedAll == 1){
          setExercise3_indicator1('#99ff99');
        } else if ( swappedAll == 2 ) {
          setExercise3_indicator2('#99ff99');
        } else if ( swappedAll == 3 ) {
          setExercise3_indicator3('#99ff99');
        } else if ( swappedAll == 4 ) {
          setExercise3_indicator4('#99ff99');
        } else if ( swappedAll == 5 ) {
          setExercise3_indicator5('#99ff99');
        }
        rightAnswerCounter ++;
      } else {
        answerContainerForServer3 = {"id": WordsStepper[index]["id"], "status": "000"};
        if ( swappedAll == 1){
          setExercise3_indicator1('#ff5c33');
        } else if ( swappedAll == 2 ) {
          setExercise3_indicator2('#ff5c33');
        } else if ( swappedAll == 3 ) {
          setExercise3_indicator3('#ff5c33');
        } else if ( swappedAll == 4 ) {
          setExercise3_indicator4('#ff5c33');
        } else if ( swappedAll == 5 ) {
          setExercise3_indicator5('#ff5c33');
        }
      }

      answerArrayForServer3.push(answerContainerForServer3);

      setIndex((index + 1) % WordsStepper.length);
      swappedAll++;
    } else {
      if (WordsStepper[index]["word"] == WordsStepper[index]["swipeFake"]){
        answerContainerForServer3 = {"id": WordsStepper[index]["id"], "status": "001"};
        if ( swappedAll == 1){
          setExercise3_indicator1('#99ff99');
        } else if ( swappedAll == 2 ) {
          setExercise3_indicator2('#99ff99');
        } else if ( swappedAll == 3 ) {
          setExercise3_indicator3('#99ff99');
        } else if ( swappedAll == 4 ) {
          setExercise3_indicator4('#99ff99');
        } else if ( swappedAll == 5 ) {
          setExercise3_indicator5('#99ff99');
        }
        rightAnswerCounter ++;
      } else {
        answerContainerForServer3 = {"id": WordsStepper[index]["id"], "status": "000"};
        if ( swappedAll == 1){
          setExercise3_indicator1('#ff5c33');
        } else if ( swappedAll == 2 ) {
          setExercise3_indicator2('#ff5c33');
        } else if ( swappedAll == 3 ) {
          setExercise3_indicator3('#ff5c33');
        } else if ( swappedAll == 4 ) {
          setExercise3_indicator4('#ff5c33');
        } else if ( swappedAll == 5 ) {
          setExercise3_indicator5('#ff5c33');
        }
      }

      setIndex((index + 1) % WordsStepper.length);
      swappedAll = 1;
      answerArrayForServer3.push(answerContainerForServer3);
      nextStep();
    }

  };
  
    const [exercise3_indicator1, setExercise3_indicator1] = useState(`transparent`);
    const [exercise3_indicator2, setExercise3_indicator2] = useState(`transparent`);
    const [exercise3_indicator3, setExercise3_indicator3] = useState(`transparent`);
    const [exercise3_indicator4, setExercise3_indicator4] = useState(`transparent`);
    const [exercise3_indicator5, setExercise3_indicator5] = useState(`transparent`);

    const [exercise2_indicator, setExercise2_indicator] = useState('#9cb9ff');
    const [isLoading, setLoading] = useState(true);
    const [WordsStepper, setWordsStepper] = useState(initialData);
    const [itemDisable, setItemDisable] = useState(false);
    const [colorIndicator,setColorIndicator]=useState('#9cb9ff');
    const [instractionIsVisible, setInstractionIsVisible] = useState(false);
    const [preventionIsVisible, setPreventionIsVisible] = useState(false);
    const [answerIsVisible, setAnswerIsVisible] = useState(false);
    const [step, setStep] = useState(0);
    const scrollRef = useRef(null);
    const [text, setText] = useState('');
    const [dictionarieUrl, setDictionarieUrl] = useState(null);

    AsyncStorage.getItem('choosenCourse').then( value => { setDictionarieUrl(value); });

            CircularProgress1.defaultProps = {
              percent: answerPercent,
              radius: 80,
              bgRingWidth: 10,
              progressRingWidth: 10,
              ringColor: answerCircleColor,
              ringBgColor: answerCircleBackgroundColor,
              textFontSize: 34,
              textFontColor: answerCircleColor,
              textFontWeight: 'bold',
              clockwise: true, 
              bgColor: 'white',
              startDegrees: 0,
            };
            
            const Card = ({ card, index }) => {
              return (
                <View style={styles.card} key={card.id}>
                                <Image 
                                source={require('../../../assets/placeholder.png')}
                                style={styles.cardImage}
                                />
                  {/* <Image source={{ uri: `${card.image}` }} style={styles.cardImage} /> */}
                  <View style={{ paddingBottom: 45, alignItems: 'center', width: '85%', }}>
                    <Text style={[styles.text, styles.price]}>{card.swipeFake}</Text>
                            <TouchableOpacity onPress={()=> { playTrack(card.audio) }}>
                              <MaterialIcons 
                                name="volume-up"
                                color="#85CEE4"
                                size={30}
                              />
                            </TouchableOpacity>
                  </View>
                </View>
              );
            };
            

    const Item = ({ item, onPress, style }) => (
      <TouchableOpacity disabled={itemDisable} onPress={onPress} style={[styles.item, style]}>
        <Text style={styles.title}>{item.name}</Text>
      </TouchableOpacity>
    );

  const exitModal = () => {
    setAnswerIsVisible(true);
    setStep(0);
  };

  const nextStep = () => {

    let x = (WordsStepper.length * 2) + 2;
  
    if (step >= x - 1){
      setTimeout(async() => {
        exitModal();
     }, 100);
    } else if ( step > WordsStepper.length + 1 ){
      setStep(z => z + 1);
    } else {
      setStep(s => s + 1);
    }
  };

  useFocusEffect(
    React.useCallback(() => {

        if (WordsStepper.length <= 1) {
          fetch(`${global.apiUrl}/dictionaries/training`, {
            method: 'GET',
            headers: {
                'Cookie': 'cookie',
            }
          }) 
          .then((response) => response.json())
          .then((json) => {
            if (json.length <= 1) {
              navigation.navigate("Home")
            } else {
              setWordsStepper(json);
              console.log(json);
            }
          })
          .catch((error) => console.error(error))
          .finally(() => {
              setLoading(false)
          });
        }
    }, [])
  );

 
  useEffect( () => {

      AsyncStorage.getItem('FirstTraining').then( value => {
        if ( value == null ) {
          AsyncStorage.setItem('FirstTraining', 'true');
          setInstractionIsVisible(true);
        } else {
          setInstractionIsVisible(false);
        }
      })

     if (scrollRef.current != null){
      scrollRef.current.scrollTo({ x: step * width});
    }

      
  }, [step, scrollRef.current]); 

  const [selectedId, setSelectedId] = useState(null);

  function showIconIndicator (numberOfCorrectAnswers) {

    answerPercent = numberOfCorrectAnswers;

    answerPercent = (answerPercent * 6.66).toFixed(0);;

    if (answerPercent > 70){
      if ( numberOfCorrectAnswers == WordsStepper.length * 3) {
        answerPercent = 100;
      }
      answerCircleBackgroundColor = "#4bab4b";
      answerCircleColor = "#99ff99";
    }
    else if ( answerPercent >= 40 && answerPercent <= 70 ){
      answerCircleBackgroundColor = "#ffda45";
      answerCircleColor = "#ffff6b";
    } else {
      answerCircleBackgroundColor = "#d9360d";
      answerCircleColor = "#ff5c33";
    }
    return (
      <View style={styles.circlesContainer}>
        <CircularProgress1></CircularProgress1>
      </View>
    )
  }

  function getCorrectAnswerForUser(questionId, answerId) {
      if(WordsStepper[questionId]["id"] == answerId) {
        rightAnswerCounter ++;
        return {"id": WordsStepper[questionId]["id"],  "word": WordsStepper[questionId]["word"], "translation": WordsStepper[questionId]["translation"], "isCorrect": true, rightAnswerCounter};
      }
      else {
        return {"id": answerId, "word": WordsStepper[questionId]["word"], "translation": WordsStepper[questionId]["translation"], "isCorrect": false, rightAnswerCounter};
      }
  }

  function getCorrectAnswerForServer(questionId, answerId) {
    if(WordsStepper[questionId]["id"] == answerId) {
      return {"id": WordsStepper[questionId]["id"], "status": "100"};
    }
    else {
      return {"id": WordsStepper[questionId]["id"], "status": "000"};
    }
  }

  function answerColorIndicator(questionId, answerId) {
    if(WordsStepper[questionId]["id"] == answerId) {
      setColorIndicator('#99ff99');
    }
    else {
      setColorIndicator('#ff5c33');
    }
  }

  async function sendAnswerContainerToServer ( answerArrayForServer1, answerArrayForServer2, answerArrayForServer3 ) {

    let json1 = JSON.stringify(answerArrayForServer1);
    let json2 = JSON.stringify(answerArrayForServer2);
    let json3 = JSON.stringify(answerArrayForServer3);
    
    const answerSubmit1 = await fetch(`${global.apiUrl}/submit`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Cookie': 'cookie',
        },
        body: 
          json1
        ,
      });

      const answerSubmit2 = await fetch(`${global.apiUrl}/submit`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Cookie': 'cookie',
        },
        body: 
          json2
        ,
      });

      const answerSubmit3 = await fetch(`${global.apiUrl}/submit`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Cookie': 'cookie',
        },
        body: 
          json3
        ,
      });

      setLoading(true);
      setWordsStepper(initialData);

      setExercise3_indicator1(`transperent`);
      setExercise3_indicator2(`transperent`);
      setExercise3_indicator3(`transperent`);
      setExercise3_indicator4(`transperent`);
      setExercise3_indicator5(`transperent`);    
  }

const Word = ({ item }) => (
  <View style={{alignItems:'flex-start', justifyContent:"space-between", flexDirection:"row", paddingHorizontal:15, marginVertical:8}} key={item.id}>
    <View>
      <Text style={{fontSize:24, color:"#ffffff"}}>{item.word}</Text>
      <Text style={{fontSize:18, color:"#20293d"}}>{item.translation}</Text>
    </View>
    <TouchableOpacity onPress={()=> { playTrack(item.audio) }}>
                              <MaterialIcons 
                                name="volume-up"
                                color="#85CEE4"
                                size={30}
                              />
    </TouchableOpacity>
  </View>
);

const renderListOfWords = ({ item }) => {
  return (
    <Word
      item={item}
    />
  );
};

  const renderItem = ({ item }) => {

    return (
      <Item
        item={item}
        onPress={() => {
          setSelectedId(item.id);
          answerColorIndicator(step - 1, item.id);
          const answerContainerForUser = getCorrectAnswerForUser(step - 1, item.id);
          answerArrayForUser.push(answerContainerForUser);

          const answerContainerForServer = getCorrectAnswerForServer(step - 1, item.id);
          answerArrayForServer1.push(answerContainerForServer);

          setItemDisable(true);

          setSelectedId(null);
          setTimeout(async() => {
              nextStep();
              setColorIndicator('#9cb9ff');
              setItemDisable(false);
           }, 100);
          }
        }
        style={{ backgroundColor: colorIndicator }}
      />
    );
  };

  function playTrack ( audio ) {

    let audioTrack = audio.split('\/').join('/');

    const track = new Sound(`${global.apiUrl}${audioTrack}`, null, (e) => {
      if (e) {
        console.log('error loading track:', e);
      } else {
        track.play();
        console.log("track has been played");
      }
    })
  }

    return(
      <View style={styles.container}>
        <View style={styles.exitButtonContainer}>
            <TouchableOpacity onPress={()=> {setSelectedId(null); setAnswerIsVisible(false); setPreventionIsVisible(true);}}>
                    <MaterialIcons 
                      name="close"
                      color="#20293d"
                      size={30}
                    />
            </TouchableOpacity>
        </View>
        {isLoading ? <ActivityIndicator size="large" color="#b5c2c6"  style={{ flex: 1, justifyContent: 'center'}}/> : (
            <ScrollView
              style={styles.scrollContainer } 
              horizontal
              pagingEnabled
              showsHorizontalScrollIndicator={false}
              scrollEnabled={false} 
              ref={scrollRef}
              onMomentumScrollEnd={props => setStep(Math.round(props.nativeEvent.contentOffset.x/width))}
              >
                <View style={{ backgroundColor: '#445273', alignItems:"center"}}>
                  <Text style={{color: "#20293d", fontSize:28, marginBottom:15}}>{I18n.t("WordsToLearn")}</Text>
                  <FlatList
                      data={WordsStepper}
                      renderItem={renderListOfWords}
                      keyExtractor={item => item.id.toString()}
                      initialNumToRender={WordsStepper.length}
                      maxToRenderPerBatch={WordsStepper.length}
                      style={[styles.scrollContainer, {paddingHorizontal: 15, width: width}]}
                      getItemLayout={(data, index) => (
                        {length: width, offset: width * index, index}
                      )} 
                    /> 
                  <View style={[styles.resultButton, {marginBottom:25}]}>
                      <TouchableOpacity style={styles.signIn} onPress={() => { nextStep() }}>
                            <Text style={styles.textSign}>{I18n.t("LetsGo")}</Text>
                      </TouchableOpacity>
                  </View>
                </View>
              {WordsStepper.map(({id, word, fakeTranslations}) => (
                <View style={[styles.title, { backgroundColor: '#445273'}]} key={id}>
                  <Text style={{color: "#20293d", fontSize:14}}>{I18n.t("ChooseTranslation")}</Text>
                  <Text style={styles.mainText}>{word}</Text>
                  <View style={styles.dotContainer}>
                      <Text style={styles.selectedDot}>
                        {step}
                      </Text>
                  </View>
                     <FlatList
                      data={fakeTranslations}
                      renderItem={renderItem}
                      keyExtractor={item => item.id.toString()}
                      extraData={selectedId}
                      initialNumToRender={fakeTranslations.length}
                      maxToRenderPerBatch={fakeTranslations.length}
                      style={[styles.scrollContainer, {paddingHorizontal: 15, width: width}]}
                      getItemLayout={(data, index) => (
                        {length: width, offset: width * index, index}
                      )} 
                    /> 
                  <View>
                  </View>
                </View>
              ))}
              {WordsStepper.map(({id, word, translation}) => (
                <View style={[styles.title, { backgroundColor: `#445273`}]} key={id}>
                  <Text style={{color: "#20293d", fontSize:14}}>{I18n.t("WroteWord")}</Text>
                  <Text style={styles.mainText}>{translation}</Text>
                  <View style={[styles.dotContainer,{backgroundColor: `${exercise2_indicator}`}]}>
                      <Text style={styles.selectedDot}>
                        {(step - WordsStepper.length)}
                      </Text>
                  </View>
                  <View style={{flex: 0.65, justifyContent: "center"}}>
                    <TextInput
                      style={{height: 60, maxWidth: '80%', fontSize: 24, borderBottomWidth: 2, borderBottomColor: "#9cb9ff", textAlign: "center", color: "#ffffff"}}
                      placeholder="Type here the word or phrase..." 
                      onChangeText={(text) => { setText(text); }}
                      defaultValue={text}
                    />
                  </View>
                  <View style={styles.resultButton}>
                    <TouchableOpacity style={styles.signIn} onPress={() => {
                      checkWrittenAnswer(id,word);
                                                    setTimeout(async() => {
                                                      setExercise2_indicator('#9cb9ff');
                                                      nextStep();
                                                  }, 100)
                    }}>
                        <Text style={styles.textSign}>{I18n.t("CheckAnswer")}</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ))}
                <View>
                    <View style={styles.swiperContainer}>
                                              <Swiper
                                              ref={swiperRef}
                                              cards={WordsStepper}
                                              // infinite
                                              cardIndex={index}
                                              renderCard={card => <Card card={card} />}
                                              backgroundColor={'transparent'}
                                              onSwipedLeft={onSwipedLeft}
                                              onSwipedRight={onSwipedRight}
                                              cardVerticalMargin={15}
                                              // stackSize={stackSize}
                                              stackScale={10}
                                              stackSeparation={14}
                                              showSecondCard={false}
                                              animateOverlayLabelsOpacity
                                              animateCardOpacity
                                              disableTopSwipe
                                              disableBottomSwipe
                                              overlayLabels={{
                                                left: {
                                                  style: {
                                                    wrapper: {
                                                      height: 350,
                                                      flexDirection: 'column',
                                                      alignItems: 'flex-end',
                                                      justifyContent: 'flex-start',
                                                      marginTop: 20,
                                                      marginLeft: -20,
                                                      backgroundColor: "#ff5c33"
                                                    }
                                                  }
                                                },
                                                right: {
                                                  style: {
                                                    wrapper: {
                                                      height: 350,
                                                      flexDirection: 'column',
                                                      alignItems: 'flex-start',
                                                      justifyContent: 'flex-start',
                                                      marginTop: 20,
                                                      marginLeft: 20,
                                                      backgroundColor: "#99ff99"
                                                    }
                                                  }
                                                }
                                              }}
                                            />
                    </View>
                    <View style={styles.bottomContainerButtons}>
                    <View style={{height: 35, flexDirection: 'row', justifyContent: 'center', alignItems: "center", marginVertical: 15,}}> 
                        <View style={{ height: 18, width: 18, borderWidth: 2, borderRadius: 5, marginHorizontal: 5, borderColor: "#85CEE4", backgroundColor: exercise3_indicator1 }}></View>
                        <View style={{ height: 18, width: 18, borderWidth: 2, borderRadius: 5, marginHorizontal: 5, borderColor: "#85CEE4", backgroundColor: exercise3_indicator2 }}></View>
                        <View style={{ height: 18, width: 18, borderWidth: 2, borderRadius: 5, marginHorizontal: 5, borderColor: "#85CEE4", backgroundColor: exercise3_indicator3 }}></View>
                        <View style={{ height: 18, width: 18, borderWidth: 2, borderRadius: 5, marginHorizontal: 5, borderColor: "#85CEE4", backgroundColor: exercise3_indicator4 }}></View>
                        <View style={{ height: 18, width: 18, borderWidth: 2, borderRadius: 5, marginHorizontal: 5, borderColor: "#85CEE4", backgroundColor: exercise3_indicator5 }}></View>
                    </View>
                    <View style={{ flexDirection: 'row', justifyContent: "center"}}>
                    <FontAwesome.Button
                          name='thumbs-o-down'
                          size={24}
                          backgroundColor='transparent'
                          underlayColor='transparent'
                          activeOpacity={0.3}
                          color="#ff5c33"
                          // onPress={() => swiperRef.current.swipeLeft()}
                          style={{flexDirection: "column", marginHorizontal: 25}}
                        >
                          <Text style={{ color: "#ff5c33" }}>{I18n.t("SwipeLeft")}</Text>
                        </FontAwesome.Button>
                        
                        <FontAwesome.Button
                          name='thumbs-o-up'
                          size={24}
                          backgroundColor='transparent'
                          underlayColor='transparent'
                          activeOpacity={0.3}
                          color="#99ff99"
                          // onPress={() => swiperRef.current.swipeRight()}
                          style={{flexDirection: "column", marginHorizontal: 25}}
                        > 
                          <Text style={{ color: "#99ff99" }}>{I18n.t("SwipeRight")}</Text>
                        </FontAwesome.Button>
                    </View>
                      </View>
                </View>
              </ScrollView>
        )}

      <Modal
        visible={instractionIsVisible}
        onRequestClose={exitModal}
      >

        <View style={{flex: 1, backgroundColor:"#20293d", justifyContent: "space-between", alignItems:"center", padding:25}}>
          <Text style={{fontSize: 24, color:"#ffffff", textAlign: "center", marginBottom: 25}}>{I18n.t("Do")}<Text style={{color: "#ffa64d"}}>{I18n.t("ThreeExercise")}</Text>{I18n.t("OneByOne")}</Text>
          <View style={{flexDirection: 'column', justifyContent: "center", maxWidth: "100%"}}>
            <View style={{alignItems: "center",margin:5}}>
              <Icon 
                      name="ios-reader-sharp"
                      color={"#445273"}
                      size={44}
              />
              <Text style={[styles.title, {marginTop: 15, marginBottom: 5}]}>{I18n.t("Exercise1")}</Text>
              <Text style={{color: "#445273", textAlign: "left",fontSize:16}}>{I18n.t("ReadAndChoose")}</Text>
            </View>
            <View style={{alignItems: "center",margin:5}}>
              <Icon 
                      name="ios-create-sharp"
                      color={"#445273"}
                      size={44}
              />
              <Text style={[styles.title, {marginTop: 15, marginBottom: 5}]}>{I18n.t("Exercise2")}</Text>
              <Text style={{color: "#445273", textAlign: "left", fontSize:16}}>{I18n.t("WriteTranslation")}</Text>
            </View>
            <View style={{alignItems: "center",margin:5}}>
              <Icon 
                      name="ios-images-sharp"
                      color={"#445273"}
                      size={44}
              />
              <Text style={[styles.title, {marginTop: 15, marginBottom: 5}]}>{I18n.t("Exercise3")}</Text>
              <Text style={{color: "#445273", textAlign: "left", fontSize:16}}>{I18n.t("ChooseSwipping")}</Text>
            </View>
          </View>
          <View style={styles.resultButton}>
              <TouchableOpacity style={[styles.signIn, {marginTop: 15}]} onPress={() => { setInstractionIsVisible(false); }}>
                    <Text style={styles.textSign}>{I18n.t("LetsStart")}</Text>
              </TouchableOpacity>
          </View>
        </View>
      </Modal>
        
        <Modal
        transparent={true}
        visible={preventionIsVisible}
        onRequestClose={exitModal}
        >
          <View style={styles.preventionContainer}>
            <View style={styles.preventionBlockContainer}>
            <Text style={[styles.title, { color: "#9cb9ff"}]}>{I18n.t("AreYouSure")}</Text>
            <Text style={[styles.text, { fontSize: 24, color: "#ffffff", marginTop: 10}]}>{I18n.t("DeleteResult")}</Text>
            <TouchableOpacity style={[styles.button, { backgroundColor: "#ffa64d", width: "80%", height: 60, justifyContent: "center", borderRadius: 5}]} onPress={() => { setPreventionIsVisible(false) }}>
              <Text style={styles.textSign}>{I18n.t("GoBack")}</Text>
            </TouchableOpacity>
            <Text style={styles.exitText}
            onPress={() => {
              setPreventionIsVisible(false);
              navigation.navigate("Home");
              setStep(0);
              setIndex(0);
              setExercise3_indicator1(`transparent`);
              setExercise3_indicator2(`transparent`);
              setExercise3_indicator3(`transparent`);
              setExercise3_indicator4(`transparent`);
              setExercise3_indicator5(`transparent`);
            }}
            >
              {I18n.t("YesLeave")}
            </Text>
            </View>
          </View>
      </Modal>
      <Modal
        visible={answerIsVisible}
        onRequestClose={exitModal}
      >

        <View style={[styles.container, {backgroundColor: "#20293d"}]}>
          <View style={styles.resultContainer}>
            <View style={{flexDirection: "column", }}>
            <Text style={[styles.title]}>
            {I18n.t("YourResultIs")} <Text style={{color: answerCircleColor}}>{rightAnswerCounter}/{WordsStepper.length * 3}</Text>
            </Text>
            <View style={{marginTop: 25}}>
                {showIconIndicator(rightAnswerCounter)}
              </View>
            </View>
              {<ScrollView
                style={styles.answerContainer} 
                vertical
                showsHorizontalScrollIndicator={false}
                >
                  <View style={[styles.answerWordsTextContainer]} >
                  {answerArrayForUser.map(({id, word, translation, isCorrect}) => (
                    <View style={{ flexDirection: "column", justifyContent: 'space-between', alignItems: 'center', width: "100%", paddingHorizontal: 15}}  key={id}>
                      <Text style={styles.answerWordsText}>{word}</Text>
                      <Text style={styles.answerWordsTranslationText}>{translation}</Text>
                    </View>
                    ))}
                  </View>

                </ScrollView>}

          <View style={styles.resultButton}>
              <TouchableOpacity style={styles.signIn} onPress={() => {
                sendAnswerContainerToServer ( answerArrayForServer1, answerArrayForServer2, answerArrayForServer3 );
                answerArrayForServer1 = [];
                answerArrayForServer2 = [];
                answerArrayForServer3 = [];
                setAnswerIsVisible(false);
                answerArrayForUser = [];
                rightAnswerCounter = 0;
                setStep(0);
                setIndex(0);
                navigation.navigate("Home");
                        }}>
                    <Text style={styles.textSign}>{I18n.t("GoToHomeScreen")}</Text>
              </TouchableOpacity>
          </View>
          </View>
        </View>


      </Modal>
    </View>  
    );
};

export default FirstTrainingMain;

const{height} = Dimensions.get('screen');
const height_image = height * 0.5 * 0.6;
const width_image = height_image * 1.1;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#445273',
    justifyContent: "center",
    alignItems: "center",
    width: width
  },
  preventionContainer: {
    flex: 1, 
    backgroundColor: 'rgba(52, 52, 52, 0.8)',
    justifyContent: "center",
    alignItems: "center",
    width: '100%',
  },
  preventionBlockContainer:{
    flex: 1, 
    backgroundColor: '#445273',
    justifyContent: "center",
    alignItems: "center",
    width: '90%',
    margin: 180,
    borderRadius: 10,
  },
  resultContainer: {
    flex: 1, 
    backgroundColor: '#20293d',
    justifyContent: "center",
    alignItems: "center",
    marginVertical: 25,
    width: width
  },
  answerContainer: {
    flex: 1, 
    marginTop: 25,
    marginHorizontal: 25,
    width: width,
  },
  exitButtonContainer: {
    height: 60,
    justifyContent: "center",
    alignItems: "flex-end",
    paddingRight: 15,
    width: '100%'
  },
  scrollContainer: {
    flex: 1,
    backgroundColor: "#445273",
  },
  answerIndicatorContainer: {
    flex: 2,
    backgroundColor: 'rgba(52, 52, 52, 0.8)',
    height: '100%',
    width: '100%'
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color:'#ffffff',
    textAlign:'center',
    justifyContent: 'center',
    alignSelf: 'center',
    alignItems: "center",
  },
  counterTitle: {
    fontSize: 40,
    fontWeight: 'bold',
    color:'#20293d',
    textAlign:'center',
    justifyContent: 'center',
    alignSelf: 'center',
    alignItems: "center"
  },
  image: {
    height: height_image,
    width: width_image
  },
  text: {
    color:'#a8a8a8',
    textAlign:'center',
    marginTop: 10,
  },
  exitText: {
    color:'#9cb9ff',
    textAlign:'center',
    marginTop: 20,
    textDecorationLine: 'underline'
  },
  titleContainer: {
    justifyContent: 'center',
    textAlign: 'center',
  },
  mainText: {
    width: width,
    fontSize: 28,
    fontWeight: 'bold',
    textAlign:'center',
    justifyContent: 'center',
    alignSelf: 'center',
    alignItems: "center",
    padding: 15,
    color: '#ffffff'
  },
  answerWordsTextContainer:{
    backgroundColor: '#20293d',
    flexDirection: "column",
    justifyContent: "center",
    alignItems: 'flex-start',
    width: width,
    paddingHorizontal: 25,
  },
  answerWordsText: {
    fontSize: 18,
    textAlign:'left',
    justifyContent: 'center',
    alignSelf: 'flex-start',
    alignItems: "flex-start",
    paddingVertical: 5,
    color: '#ffffff'
  },
  answerWordsTranslationText: {
    fontSize: 16,
    textAlign:'left',
    justifyContent: 'center',
    alignSelf: 'flex-start',
    alignItems: "flex-start",
    color: '#445273'
  },
  item: {
    justifyContent: 'center',
    alignItems: 'center',
    maxWidth: '100%',
    width: width,
    padding: 15,
    marginVertical: 5,
    borderRadius: 8,
  },
  button: {
    alignItems: 'center',
    marginTop: 30
  },
  resultButton: {
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingTop: 15,
  },
  signIn: {
      width: 240,
      height: 65,
      justifyContent: 'center',
      alignItems: 'center',
      borderRadius: 8,
      flexDirection: 'row',
      backgroundColor: "#ffa64d",
  },
  textSign: {
      color: '#20293d',
      fontSize: 18,
      letterSpacing: 1,
      fontWeight: "bold",
  },
  dotContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#9cb9ff',
    width: '10%',
    marginBottom: 15,
    borderRadius: 5,
  },
  selectedDot:{
    fontSize: 18,
    fontWeight: "bold",
    color: '#ffffff'
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1f65ff',
    height: 80
  },
  buttonContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  hidden: {
    width: 0,
    height: 0,
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
swiperContainer: {
  flex: 0.8,
  width: width
},
bottomContainer: {
  flex: 0.4,
  justifyContent: 'space-evenly',
},
bottomContainerMeta: { alignContent: 'flex-end', alignItems: 'center', },
bottomContainerButtons: {
  flex: 0.2,
  flexDirection: 'column',
  justifyContent: 'center',
  marginBottom: 25,
},
cardImage: {
  width: 280,
  flex: 1,
  resizeMode: 'contain',
},
card: {
  flex: 0.6,
  borderRadius: 8,
  shadowColor: "#20293d",
  shadowOffset: {
    width: 0,
    height: 2,
  },
  shadowOpacity: 0.15,
  shadowRadius: 3.84,
  justifyContent: 'center',
  alignItems: 'center',
  backgroundColor: "#ffffff",
},
text: {
  textAlign: 'center',
  fontSize: 50,
  backgroundColor: 'transparent'
},
done: {
  textAlign: 'center',
  fontSize: 30,
  color: "#ffffff",
  backgroundColor: 'transparent'
},
price: { color: "#20293d", fontSize: 24, fontWeight: '500', marginBottom: 15 },
  resultButton: {
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingTop: 15,
  },
  signIn: {
      width: 240,
      height: 65,
      justifyContent: 'center',
      alignItems: 'center',
      borderRadius: 8,
      flexDirection: 'row',
      backgroundColor: "#ffa64d",
  },
  textSign: {
      color: '#20293d',
      fontSize: 18,
      letterSpacing: 1,
      fontWeight: "bold",
  },
});