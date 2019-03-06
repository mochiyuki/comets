import React, { Component } from "react";

import SocketContext from "../socketContext";

import ChatroomWithSocket from "./Chatroom";

import "aframe";
import { Entity, Scene } from "aframe-react";
import "aframe-particle-system-component";

class Home extends Component {
  constructor(props) {
    super(props);

    this.state = {
      wish: "",
      wishes: [],
      chat: false,
      currentWish: ""
    };

    this.sendWish = this.sendWish.bind(this);

    //this.joinRoom = this.joinRoom.bind(this);
    //this.leaveRoom = this.leaveRoom.bind(this);

    this.props.socket.emit("test", "hello from server");

    this.props.socket.on("history", wishes => {
      console.log(wishes);
      this.setState({ wishes });
    });

    /*
    const displayRooms = wishes => {
      //this.setState({ wishes });
      console.log(this.state.wishes);
    };
*/
    this.props.socket.on("updatewishes", data => {
      this.setState({ wishes: [...this.state.wishes.concat(data)] });
    });
    /*
    this.props.socket.on("updatewishes", function(data) {
      console.log(data);
      //var newWish = data.wish.wish;
      //console.log(newWish);
      //console.log(data.posX);
      //addRoom(newWish);
      addRoom(data);
    });

    const addRoom = data => {
      this.setState({ wishes: [...this.state.wishes, data] });
      console.log(this.state.wishes);
      
      this.interval = setInterval(() => {
        this.setState({ wishes: this.state.wishes.slice(1) });
      }, 10000);
      
    };
    */
  }
  /*
  componentDidMount() {
    console.log("test");
    this.props.socket.on("history", wishes => {
      this.setState({ wishes });
      console.log(wishes);
      console.log(this.state.wishes);
    });
  }
*/
  sendWish(e) {
    e.preventDefault();

    document.getElementById("wishForm").style.display = "none";

    let wish = this.state.wish;
    this.props.socket.emit("sendWish", wish);

    this.setState({ wish: "" });
  }
  /*
  joinRoom(e) {
    //console.log(e.target.value);
    let room = e.target.value;
    //console.log(room);
    this.props.socket.emit("joinRoom", room);

    this.setState({
      chat: true
    });
  }

  leaveRoom(e) {
    //console.log(e.target.value);
    let room = e.target.value;
    //console.log("left room" + room);
    this.props.socket.emit("leaveRoom", room);

    this.setState({
      messages: [],
      chat: false
    });
  }
*/
  openModal = () => {
    document.getElementById("wishForm").style.display = "flex";
  };

  closeModal = () => {
    document.getElementById("wishForm").style.display = "none";
  };

  clickRoom = e => {
    //console.log(event.target.getAttribute("value"));
    let room = e.target.getAttribute("value");
    console.log(room);
    //let roomString = JSON.stringify(room);
    //console.log(roomString);
    let pos = e.target.getAttribute("position");
    console.log(pos);
    this.props.socket.emit("joinRoom", room);

    this.setState({
      chat: true,
      currentWish: room
    });
    //document.getElementById("joinButton").style.display = "flex";
  };

  componentWillUnmount() {
    clearInterval(this.interval);
  }

  render() {
    return (
      <React.Fragment>
        {this.state.chat === true ? (
          <div id="popChat">
            <div id="wishName">{this.state.currentWish}</div>
            <button id="leaveButton" onClick={this.leaveRoom}>
              Leave room
            </button>
            <ChatroomWithSocket />
          </div>
        ) : (
          <h4> Join a chatroom by clicking on a star </h4>
        )}
        <div
          style={{
            position: "fixed",
            top: "10%",
            cursor: "pointer",
            zIndex: "100"
          }}
        >
          <h4>{this.state.currentWish}</h4>
          <button id="writeWish" onClick={this.openModal}>
            Write a wish
          </button>
        </div>
        <div id="wishForm">
          <form>
            <textarea
              name="wish"
              placeholder="What's your wish?"
              value={this.state.wish}
              onChange={ev => this.setState({ wish: ev.target.value })}
              rows="10"
            />
            <br />
            <button id="sendButton" onClick={this.sendWish}>
              Send your wish &#9885;
            </button>
          </form>
          <button id="closeButton" onClick={this.closeModal}>
            X
          </button>
        </div>
        <Scene background={{ color: "black" }}>
          <Entity
            particle-system={{
              preset: "dust",
              maxAge: "20",
              particleCount: 100,
              color: "#FF0000, #FFFF00"
            }}
          />
          {this.state.wishes.map((room, key) => {
            return (
              <Entity
                key={key}
                value={room.wish}
                geometry={{
                  primitive: "sphere",
                  radius: 0.1
                }}
                material={{ color: "white", transparent: true, opacity: 0.2 }}
                position={{
                  x: room.posX,
                  y: room.posY,
                  z: -5
                }}
                events={{ click: this.clickRoom }}
                animation__scale={{
                  property: "scale",
                  dir: "alternate",
                  dur: 1000,
                  loop: true,
                  to: "1.1 1.1 1.1"
                }}
              >
                <Entity
                  geometry={{
                    primitive: "sphere",
                    radius: 0.05
                  }}
                  material={{ color: "white" }}
                />
              </Entity>
            );
          })}
          <Entity primitive="a-camera">
            <Entity
              primitive="a-cursor"
              color="#ffd700"
              animation__click={{
                property: "scale",
                startEvents: "click",
                from: "0.1 0.1 0.1",
                to: "1 1 1",
                dur: 150
              }}
            />
          </Entity>
        </Scene>
      </React.Fragment>
    );
  }
}

const HomeWithSocket = props => (
  <SocketContext.Consumer>
    {socket => <Home {...props} socket={socket} />}
  </SocketContext.Consumer>
);

export default HomeWithSocket;
