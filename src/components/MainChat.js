import PubNubReact from "pubnub-react";
import React, { Component } from "react";
import { StyleSheet, Image, Button, Text, View } from "react-native";
import { GiftedChat, Bubble } from "react-native-gifted-chat";
import _ from "lodash";
import config from "./config";
import ImagePicker from "react-native-image-picker";
const RoomName = "Chat-1";
export default class MainChat extends Component {
  constructor(props) {
    super(props);
    this.state = {
      messages: [],
      onlineUsers: [],
      onlineUsersCount: 0,
    };
    this.pubnub = new PubNubReact({
      publishKey: config.pubnub_publishKey,
      subscribeKey: config.pubnub_subscribeKey,
      uuid: this.props.navigation.getParam("username"),

      presenceTimeout: 60,
    });
    this.pubnub.init(this);
  }

  static navigationOptions = ({ navigation }) => {
    return {
      headerTitle:
        navigation.getParam("onlineUsersCount", "No") + " member online",
      headerLeft: null,
      headerRight: (
        <Button
          onPress={() => {
            navigation.state.params.leaveChat();
          }}
          title="Logout"
          color="red"
        />
      ),
    };
  };
  componentDidMount() {
    console.log("Didmount");
    this.pubnub.history(
      { channel: RoomName, reverse: true, count: 50 },
      (status, res) => {
        console.log("res>", res);
        let newmessage = [];
        res.messages &&
          res.messages.forEach(function (element, index) {
            newmessage[index] = element.entry[0];
          });
        this.setState((previousState) => ({
          messages: GiftedChat.append(previousState.messages, newmessage),
        }));
      }
    );
    this.PresenceStatus();
  }

  componentWillMount() {
    console.log("Willmount");
    this.props.navigation.setParams({
      onlineUsersCount: this.state.onlineUsersCount,
      leaveChat: this.leaveChat.bind(this),
    });

    this.pubnub.subscribe({
      channels: [RoomName],
      withPresence: true,
    });

    this.pubnub.getMessage(RoomName, (m) => {
      this.setState((previousState) => ({
        messages: GiftedChat.append(previousState.messages, m["message"]),
      }));
    });
  }
  onSend(messages = []) {
    console.log("messages", messages);
    this.pubnub.publish({
      message: messages,
      channel: RoomName,
    });
  }

  PresenceStatus = () => {
    console.log("presnce status");
    this.pubnub.getPresence(RoomName, (presence) => {
      if (presence.action === "join") {
        console.log("users onilne", this.state.onlineUsers);
        let users = this.state.onlineUsers;

        users.push({
          state: presence.state,
          uuid: presence.uuid,
          mydata: "abc",
        });
        console.log("join room");
        this.setState({
          onlineUsers: users,
          onlineUsersCount: this.state.onlineUsersCount + 1,
        });

        this.props.navigation.setParams({
          onlineUsersCount: this.state.onlineUsersCount,
        });
      }

      if (presence.action === "leave" || presence.action === "timeout") {
        console.log("leave or timreout");
        let leftUsers = this.state.onlineUsers.filter(
          (users) => users.uuid !== presence.uuid
        );

        this.setState({
          onlineUsers: leftUsers,
        });
        console.log("leave room");
        const length = this.state.onlineUsers.length;
        this.setState({
          onlineUsersCount: length,
        });
        this.props.navigation.setParams({
          onlineUsersCount: this.state.onlineUsersCount,
        });
      }

      if (presence.action === "interval") {
        console.log("interval");
        if (presence.join || presence.leave || presence.timeout) {
          let onlineUsers = this.state.onlineUsers;
          let onlineUsersCount = this.state.onlineUsersCount;

          if (presence.join) {
            console.log("join room at state");
            presence.join.map(
              (user) =>
                user !== this.uuid &&
                onlineUsers.push({
                  state: presence.state,
                  uuid: user,
                })
            );
            console.log("presence.join.length>>>>>>>", presence.join.length);
            onlineUsersCount += presence.join.length;
          }

          if (presence.leave) {
            presence.leave.map((leftUser) =>
              onlineUsers.splice(onlineUsers.indexOf(leftUser), 1)
            );
            onlineUsersCount -= presence.leave.length;
            console.log("leave room at state");
          }

          if (presence.timeout) {
            presence.timeout.map((timeoutUser) =>
              onlineUsers.splice(onlineUsers.indexOf(timeoutUser), 1)
            );
            onlineUsersCount -= presence.timeout.length;
          }

          this.setState({
            onlineUsers,
            onlineUsersCount,
          });
          this.props.navigation.setParams({
            onlineUsersCount: this.state.onlineUsersCount,
          });
        }
      }
    });
  };

  leaveChat = () => {
    this.pubnub.unsubscribe({ channels: [RoomName] });
    return this.props.navigation.navigate("Login");
  };
  componentWillUnmount() {
    this.leaveChat();
  }

  messageIdGenerator = () => {
    return Math.round(Math.random() * 1000000);
  };

  handleAddPicture = () => {
    const { user } = this.props;
    const options = {
      title: "Select Profile Pic",
      mediaType: "photo",
      takePhotoButtonTitle: "Take a Photo",
      maxWidth: 256,
      maxHeight: 256,
      allowsEditing: true,
      noData: true,
    };
    ImagePicker.launchImageLibrary(options, (response) => {
      console.log("Response = ", response);
      // this.setState({image:response.path})
      const { uri } = response;
      const extensionIndex = uri.lastIndexOf(".");
      const extension = uri.slice(extensionIndex + 1);
      const allowedExtensions = ["jpg", "jpeg", "png"];
      const correspondingMime = ["image/jpeg", "image/jpeg", "image/png"];
      const file = {
        uri,
        name: `${this.messageIdGenerator()}.${extension}`,
        type: correspondingMime[allowedExtensions.indexOf(extension)],
      };
      this.setState({ image: file });
      let username = this.props.navigation.getParam("username");
      const message = {};
      message._id = this.messageIdGenerator();
      message.createdAt = Date.now();
      message.user = {
        _id: username,
        name: username,
        avatar: "https://robohash.org/" + username,
      };
      message.messageType = "image";
      message.image = uri;

      this.pubnub.publish({
        message: [message],
        channel: RoomName,
      });
    });
  };

  render() {
    console.log("render");
    let username = this.props.navigation.getParam("username");
    return (
      <View style={{ flex: 1 }}>
        <Button
          onPress={this.handleAddPicture}
          title="Add Picture"
          color="red"
        />

        <View style={styles.online_user_wrapper}>
          {this.state.onlineUsers.map((item, index) => {
            return (
              <View key={item.uuid} style={styles.avatar_wrapper}>
                {console.log("itemssss", this.state.image)}
                <Image
                  key={item.uuid}
                  style={styles.online_user_avatar}
                  source={{
                    uri: "https://robohash.org/" + item.uuid,
                  }}
                />
                <Text style={{ fontSize: 20, color: "red" }}>{item.uuid}</Text>
              </View>
            );
          })}
        </View>
        <GiftedChat
          messages={this.state.messages}
          onSend={(messages) => {
            this.onSend(messages);
          }}
          alwaysShowSend
          onPressAvatar={this.handleAvatarPress}
          messageIdGenerator={this.messageIdGenerator}
          user={{
            _id: username,
            name: username,
            avatar: "https://robohash.org/" + username,
          }}
        />
      </View>
    );
  }
}

const styles = StyleSheet.create({
  online_user_avatar: {
    width: 50,
    height: 50,
    borderRadius: 20,
    margin: 10,
  },
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F5FCFF",
  },

  online_user_wrapper: {
    height: "8%",
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "flex-end",
  },
  avatar_wrapper: {},
});
