import React, { Component } from "react";

import SocketContext from "../socketContext";

class Chatroom extends Component {
  constructor(props) {
    super(props);

    this.state = {
      username: "",
      message: "",
      messages: []
    };

    this.sendMessage = ev => {
      ev.preventDefault();
      this.props.socket.emit("sendMessage", {
        message: this.state.message
      });
      this.setState({ message: "" });
    };

    this.props.socket.on("receiveMessage", this.addMessage);
  }

  addMessage = data => {
    //console.log(data.user);
    //console.log(data.message['message']+data.user);
    data.message.message = data.user + " : " + data.message["message"];
    this.setState({ messages: [...this.state.messages, data.message] });
    //console.log(this.state.messages);
  };

  componentWillUnmount = () => {
    this.props.socket.removeListener("receiveMessage", this.addMessage);
  };

  render() {
    return (
      <div className="chat">
        <ul>
          {this.state.messages.map((message, key) => {
            return <li key={key}>{message.message}</li>;
          })}
        </ul>
        <br />
        <form>
          <input
            type="text"
            placeholder="Type..."
            value={this.state.message}
            onChange={ev => this.setState({ message: ev.target.value })}
          />
          <br />
          <button id="sendMessage" type="submit" onClick={this.sendMessage}>
            Send
          </button>
        </form>
      </div>
    );
  }
}

const ChatroomWithSocket = props => (
  <SocketContext.Consumer>
    {socket => <Chatroom {...props} socket={socket} />}
  </SocketContext.Consumer>
);

export default ChatroomWithSocket;
