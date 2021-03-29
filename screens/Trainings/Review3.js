import React, { useState, useEffect, useRef } from 'react';
import { 
    View, 
    Text, 
    TouchableOpacity, 
    Dimensions,
    StyleSheet,
    Modal,
    ScrollView,
    FlatList,
    ActivityIndicator,
    Image,
    TextInput
} from 'react-native';
import AsyncStorage from '@react-native-community/async-storage';
import LinearGradient from 'react-native-linear-gradient';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import {apiUrl} from '../../env/dev';
import Sound from 'react-native-sound';
import Swiper from 'react-native-deck-swiper';
import { Transitioning, Transition, set } from 'react-native-reanimated';
import { useFocusEffect } from '@react-navigation/native';
import I18n from "../../env/i18n";

const { width } = Dimensions.get("window");

const colors = {
  red: '#EC2379',
  blue: '#0070FF',
  gray: '#777777',
  white: '#ffffff',
  black: '#000000'
};
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

const rotateByStyle = (percent, base_degrees, clockwise) => {
  let rotateBy = base_degrees;
  if (clockwise) {
    rotateBy = base_degrees + percent * 3.6;
  } else {
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

  if (!clockwise) {
    rotation += 180;
  }
  let firstProgressLayerStyle;

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

let answerArrayForServer3 = [];
let rightAnswerCounter = 0;

let answerPercent = 0;
let answerCircleColor = '#ffffff';
let answerCircleBackgroundColor = '#ffffff';

let swappedAll = 1;

const Review3 = ({route, navigation}) => {

  const initialData = [
    {"id":381,"exercise":3,"word":"Mi\u0142o mi Ci\u0119 pozna\u0107.","translation":"Nice to meet you.","fakeTranslations":[{"id":83,"name":"Przymiotnik 2"},{"id":60,"name":"Dom"},{"id":380,"name":"Nice to meet you."},{"id":86,"name":"Przymiotnik 5"}],"audio":"312f40f8f084.ngrok.io:80\/content\/download\/378\/audio\/20.wav?inLanguage=eng-GB","swipeFake":"S\u0142owo 6"},
  ];

  const [index, setIndex] = useState(0);
  const swiperRef = useRef(null);

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
     setTimeout(async() => {
      exitModal();
   }, 100);
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
     setTimeout(async() => {
      exitModal();
   }, 100);
   }

 };
 
   const [exercise3_indicator1, setExercise3_indicator1] = useState(`transparent`);
   const [exercise3_indicator2, setExercise3_indicator2] = useState(`transparent`);
   const [exercise3_indicator3, setExercise3_indicator3] = useState(`transparent`);
   const [exercise3_indicator4, setExercise3_indicator4] = useState(`transparent`);
   const [exercise3_indicator5, setExercise3_indicator5] = useState(`transparent`);

  const [exercise3_indicator, setExercise3_indicator] = useState(`transperent`);

    const [isLoading, setLoading] = useState(true);
    const [WordsStepper, setWordsStepper] = useState([]);
    const [instractionIsVisible, setInstractionIsVisible] = useState(false);
    const [preventionIsVisible, setPreventionIsVisible] = useState(false);
    const [answerIsVisible, setAnswerIsVisible] = useState(false);
    const [step, setStep] = useState(0);
    const scrollRef = useRef(null);
    const [text, setText] = useState('');

    const {categorieUrl} = route.params;

    AsyncStorage.getItem('FirstTraining').then( value => {
      if ( value == null ) {
        AsyncStorage.setItem('FirstTraining', 'true');
        setInstractionIsVisible(true);
      } else {
        setInstractionIsVisible(false);
      }
    })

            // default values for props
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
          
            

      const renderSwiperFunc = () => {

        const Card = ({ card, index }) => {
          return (
            <View style={styles.card} key={card.id}>
              <Image 
                source={require('../../assets/placeholder.png')}
                style={styles.cardImage}
              />
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

        if ( WordsStepper.length != 0 ) {
          return (
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
          )
        }
      }

  const exitModal = () => {
    setAnswerIsVisible(true);
    setStep(0);
  };

  const nextStep = () => {

    let x = WordsStepper.length;

    console.log("Rozmiar ------- ", WordsStepper.length);
  
    if (step >= x - 1){
      console.log("step ----- ", step)
      setTimeout(async() => {
        exitModal();
     }, 100);
    } else {
      setStep(s => s + 1);
      console.log("step ----- ", step)
    }

  };

  useEffect( () => {

          if (WordsStepper.length == 0) {
        fetch(`${global.apiUrl}/dictionaries/review_3`, {
          method: 'GET',
          headers: {
              'Cookie': 'cookie',
          }
        }) 
        .then((response) => response.json())
        .then((json) => {
  
          console.log(json);
  
          if (json.length <= 1) {
            navigation.goBack();
          } else {
            setWordsStepper(json);            
          }
  
        })
        .catch((error) => console.error(error))
        .finally(() => setLoading(false));
      }

     if (scrollRef.current != null){
      scrollRef.current.scrollTo({ x: step * width});
    }

      
  }, [step, scrollRef.current]); 

  const [selectedId, setSelectedId] = useState(null);

  function showIconIndicator (numberOfCorrectAnswers) {

    answerPercent = numberOfCorrectAnswers;

    answerPercent = answerPercent * 20;

    if (answerPercent > 70){
      if ( numberOfCorrectAnswers == WordsStepper.length) {
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
      if(WordsStepper1[questionId]["id"] == answerId) {
        rightAnswerCounter ++;
        return {"id": WordsStepper1[questionId]["id"],  "word": WordsStepper1[questionId]["word"], "translation": WordsStepper1[questionId]["translation"], "isCorrect": true, rightAnswerCounter};
      }
      else {
        return {"id": answerId, "word": WordsStepper1[questionId]["word"], "translation": WordsStepper1[questionId]["translation"], "isCorrect": false, rightAnswerCounter};
      }
  }

  function getCorrectAnswerForServer(questionId, answerId) {
    if(WordsStepper1[questionId]["id"] == answerId) {
      return {"id": WordsStepper1[questionId]["id"], "status": "100"};
    }
    else {
      return {"id": WordsStepper1[questionId]["id"], "status": "000"};
    }
  }

  function sendAnswerContainerToServer ( answerArrayForServer3 ) {

    let json3 = JSON.stringify(answerArrayForServer3);    

      fetch(`${global.apiUrl}/submit`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Cookie': 'cookie',
        },
        body: 
          json3
        ,
      });

      setWordsStepper(initialData);
    
  }

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
      <Modal
      transparent={false}
      visible={true}
      >
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
                    { renderSwiperFunc() }
                </ScrollView>
          )}

        <Modal
          transparent={true}
          visible={instractionIsVisible}
          onRequestClose={exitModal}
        >

          <View style={styles.preventionContainer}>
            <View style={styles.preventionBlockContainer}>
            <Text style={styles.text}>Answer and learn new</Text>
            <View style={styles.button}>
                <TouchableOpacity onPress={() => {
                          setPreventionIsVisible(false);}}>
                    <LinearGradient
                        colors={['#3d4b6b', '#20293d']}
                        style={styles.signIn}
                    >
                      <Text style={styles.textSign}>Let`s start</Text>
                    </LinearGradient>
                </TouchableOpacity>
            </View>
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
                navigation.goBack();
                setStep(0);
                setIndex(0);
                answerArrayForServer3 = [];
                rightAnswerCounter = 0;
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
              {I18n.t("YourResultIs")} <Text style={{color: answerCircleColor}}>{rightAnswerCounter}/{WordsStepper.length}</Text>
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
                    {WordsStepper.map(({id, word, translation, isCorrect}) => (
                      <View style={{ flexDirection: "column", justifyContent: 'space-between', alignItems: 'center', width: "100%", paddingHorizontal: 15 }}  key={id}>
                        <Text style={styles.answerWordsText}>{word}</Text>
                        <Text style={styles.answerWordsTranslationText}>{translation}</Text>
                      </View>
                      ))}
                    </View>

                  </ScrollView>}

            <View style={styles.resultButton}>
                <TouchableOpacity style={styles.signIn} onPress={() => {
                  sendAnswerContainerToServer ( answerArrayForServer3 );
                  answerArrayForServer3 = [];
                  setAnswerIsVisible(false);
                  rightAnswerCounter = 0;
                  setStep(0);
                  setIndex(0);
                  navigation.goBack();
                          }}>
                      <Text style={styles.textSign}>{I18n.t("GoToReviewScreen")}</Text>
                </TouchableOpacity>
            </View>
            </View>
          </View>


        </Modal>
      </View>
      </Modal>      
    );
};

export default Review3;

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
/*   borderColor: "#445273",
  borderWidth: 2 */
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
heading: { fontSize: 24, marginBottom: 10, color: colors.gray },
price: { color: "#20293d", fontSize: 24, fontWeight: '500', marginBottom: 15 }
});