import React, { Component } from "react";
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TextInput,
  TouchableHighlight,
  Image,
  ImageBackground,
} from "react-native";
const user = {
  0: { username: "puru", password: 1111 },
  1: { username: "rajat", password: 1111 },
};
class Login extends Component {
  state = {
    username: "",
    password: "",
  };
  login() {
    if (
      (user[0].username == this.state.username &&
        user[0].password == this.state.password) ||
      (user[1].username == this.state.username &&
        user[1].password == this.state.password)
    ) {
      this.props.navigation.navigate("MainChat", {
        username: this.state.username,
      });
    } else {
      console.log(this.state);
      alert("username or password is incorrect");
    }
  }

  render() {
    return (
      <ImageBackground
        source={require("../../Images/12.jpg")}
        style={{ width: "100%", height: "100%" }}
      >
        <View style={styles.container}>
          <View style={styles.inputContainer}>
            <Image
              style={styles.inputIcon}
              source={require("../../Images/young.png")}
            />
            <TextInput
              style={styles.inputs}
              placeholder="User Name"
              underlineColorAndroid="transparent"
              onChangeText={(username) => this.setState({ username })}
            />
          </View>

          <View style={styles.inputContainer}>
            <Image
              style={styles.inputIcon}
              source={require("../../Images/smart-key.png")}
            />
            <TextInput
              style={styles.inputs}
              placeholder="Password"
              secureTextEntry={true}
              underlineColorAndroid="transparent"
              onChangeText={(password) => this.setState({ password })}
            />
          </View>

          <TouchableHighlight
            style={[styles.buttonContainer, styles.loginButton]}
            onPress={() => this.login()}
          >
            <Text style={styles.loginText}>Login</Text>
          </TouchableHighlight>
        </View>
      </ImageBackground>
    );
  }
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  inputContainer: {
    borderBottomColor: "#F5FCFF",
    backgroundColor: "#FFFFFF",
    borderRadius: 30,
    borderBottomWidth: 1,
    width: 250,
    height: 45,
    marginBottom: 20,
    flexDirection: "row",
    alignItems: "center",
  },
  inputs: {
    height: 45,
    marginLeft: 16,
    borderBottomColor: "#FFFFFF",
    flex: 1,
  },
  inputIcon: {
    width: 30,
    height: 30,
    marginLeft: 15,
    justifyContent: "center",
  },
  buttonContainer: {
    height: 45,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
    width: 250,
    borderRadius: 30,
  },
  loginButton: {
    backgroundColor: "#00b5ec",
  },
  loginText: {
    color: "white",
  },
});
export default Login;
