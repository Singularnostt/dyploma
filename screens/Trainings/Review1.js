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
} from 'react-native';
import AsyncStorage from '@react-native-community/async-storage';
import LinearGradient from 'react-native-linear-gradient';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import {apiUrl} from '../../env/dev';
import I18n from "../../env/i18n";

const { width } = Dimensions.get("window");

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

let answerArrayForUser = [];
let answerArrayForServer1 = [];
let rightAnswerCounter = 0;

let answerPercent = 0;
let answerCircleColor = '#ffffff';
let answerCircleBackgroundColor = '#ffffff';


const Review1 = ({route, navigation}) => {

    const [index, setIndex] = useState(0);
    const [isLoading, setLoading] = useState(true);
    const [WordsStepper, setWordsStepper] = useState([]);
    const [itemDisable, setItemDisable] = useState(false);
    const [colorIndicator,setColorIndicator]=useState('#9cb9ff');
    const [instractionIsVisible, setInstractionIsVisible] = useState(false);
    const [preventionIsVisible, setPreventionIsVisible] = useState(false);
    const [answerIsVisible, setAnswerIsVisible] = useState(false);
    const [step, setStep] = useState(0);
    const scrollRef = useRef(null);

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

    let x = WordsStepper.length;

    console.log("Rozmiar ------- ", WordsStepper.length);
  
    if (step >= x - 1){
      console.log("step ----- ", step)
      setTimeout(async() => {
        exitModal();
     }, 100);
    }  else {
      setStep(s => s + 1);
      console.log("step ----- ", step)
    }

  };

  useEffect( () => {

    if (WordsStepper.length <= 1) {
      fetch(`${global.apiUrl}/dictionaries/review_1`, {
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

  function sendAnswerContainerToServer ( answerArrayForServer1 ) {

    let json1 = JSON.stringify(answerArrayForServer1);

    fetch(`${global.apiUrl}/submit`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Cookie': 'cookie',
        },
        body: 
          json1
        ,
      });
    
  }

  const renderItem = ({ item }) => {

    return (
      <Item
        item={item}
        onPress={() => {
          setSelectedId(item.id);
          answerColorIndicator(step, item.id);
          const answerContainerForUser = getCorrectAnswerForUser(step, item.id);
          answerArrayForUser.push(answerContainerForUser);

          const answerContainerForServer = getCorrectAnswerForServer(step, item.id);
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
                {WordsStepper.map(({id, word, fakeTranslations}) => (
                  <View style={[styles.title, { backgroundColor: '#445273'}]} key={id}>
                    <Text style={{color: "#20293d", fontSize:14}}> {I18n.t("ChooseTranslation")} </Text>
                    <Text style={styles.mainText}>{word}</Text>
                    <View style={styles.dotContainer}>
                        <Text style={styles.selectedDot}>
                          {step + 1}
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
                </ScrollView>
          )}
          
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
              }}
              >
                {I18n.t("YesLeave")}
              </Text>
              </View>
            </View>
        </Modal>
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
                  sendAnswerContainerToServer ( answerArrayForServer1 );
                  answerArrayForServer1 = [];
                  setAnswerIsVisible(false);
                  answerArrayForUser = [];
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

export default Review1;

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
price: { color: "#20293d", fontSize: 24, fontWeight: '500', marginBottom: 15 }
});