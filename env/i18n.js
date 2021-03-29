import I18n from "i18n-js";
import * as RNLocalize from "react-native-localize";
import AsyncStorage from '@react-native-community/async-storage';

import en from "./translations/en";
import pl from "./translations/pl";
import ger from "./translations/ger";
import ukr from "./translations/ukr";
import rus from "./translations/rus";
import tur from "./translations/tur";

AsyncStorage.getItem('languageKey').then( value => {
  I18n.locale = value;
})


I18n.fallbacks = true;
I18n.translations = {
  en,
  pl,
  ger,
  ukr,
  rus,
  tur,

};

export default I18n;