/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow
 */

import { createStackNavigator, createAppContainer } from "react-navigation";
import Login from "./src/components/Login";
import MainChat from "./src/components/MainChat";
// import { Header } from "react-native/Libraries/NewAppScreen";
const AppNavigator = createStackNavigator(
  {
    Login: {
      screen: Login,
      navigationOptions: {
        headerShown: false,
      },
    },
    MainChat: {
      screen: MainChat,
    },
    // PhoneInput: {
    //   screen: PhoneInput
    // },
    // OTPVerfication: {
    //   screen: OTPVerfication
    // }
  },
  {
    initialRouteName: "Login",
  }
);
export default createAppContainer(AppNavigator);
