import React, { Component } from "react";

import SocketContext from "../socketContext";

class Chatroom extends Component {
  constructor(props) {
    super(props);

    this.state = {
      username: "",
      message: "",
      messages: [],
      liked: false,
      count: null,
      sum: null
    };

    this.sendMessage = ev => {
      ev.preventDefault();
      if (this.state.message !== "") {
        this.props.socket.emit("sendMessage", {
          message: this.state.message
        });
        this.setState({ message: "" });
      } else {
        alert("please write something!");
      }
    };

    this.props.socket.on("receiveMessage", this.addMessage);

    this.props.socket.on("likesHistory", count => {
      console.log(count);

      let testtt = count
        .map(item => item.likes)
        .reduce((prev, next) => prev + next, 0);
      //console.log(testtt);

      this.setState({ sum: testtt });
      console.log(this.state.sum);
    });
  }

  addMessage = data => {
    //console.log(data.user);
    //console.log(data.message['message']+data.user);
    data.message.message = data.user + " : " + data.message["message"];
    this.setState({ messages: [...this.state.messages, data.message] });
    //console.log(this.state.messages);
  };

  handleLike = e => {
    e.preventDefault();
    this.setState({ liked: true, count: this.state.count + 1 });
    this.props.socket.emit("clicked", { count: this.state.count + 1 });
  };

  componentWillUnmount = () => {
    this.props.socket.removeListener("receiveMessage", this.addMessage);
    this.props.socket.removeListener("likesHistory");
  };

  render() {
    return (
      <div className="chat-wrapper">
        <div className="chat">
          <ul>
            {this.props.history.map((message, key) => {
              return (
                <li key={key}>
                  {message.user} : {message.chat.message}
                </li>
              );
            })}

            {this.state.messages.map((message, key) => {
              return <li key={key}>{message.message}</li>;
            })}
          </ul>
        </div>
        <form>
          <input
            type="text"
            placeholder="Type..."
            value={this.state.message}
            onChange={ev => this.setState({ message: ev.target.value })}
          />
          <button id="sendMessage" type="submit" onClick={this.sendMessage}>
            Send
          </button>
          <div id="like-wrapper">
            <button
              type="primary"
              disabled={this.state.liked}
              onClick={this.handleLike}
            >
              Like
            </button>
            <p>{this.state.sum}</p>
          </div>
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
