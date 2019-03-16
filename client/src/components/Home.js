import React, { Component } from "react";
import { Redirect } from "react-router-dom";
import SocketContext from "../socketContext";

import ChatroomWithSocket from "./Chatroom";

import "aframe";
import { Entity, Scene } from "aframe-react";
import "aframe-particle-system-component";
import "aframe-star-system-component";

class Home extends Component {
  constructor(props) {
    super(props);

    this.state = {
      wish: "",
      wishes: [],
      chat: false,
      currentWish: "",
      previousMessages: [],
      userWishesList: [],
      loggedOut: false
    };

    this.props.socket.connect();

    this.props.socket.emit("test", "hello from server");

    this.props.socket.on("history", wishes => {
      console.log(wishes);
      this.setState({ wishes });
    });

    this.props.socket.on("updatewishes", data => {
      this.setState({ wishes: [...this.state.wishes.concat(data)] });
    });

    this.props.socket.on("myNewestWish", data => {
      console.log(data.wish);
      let wishList = document.getElementById("wishList");
      let wishButton = document.createElement("button");
      wishButton.value = data.wish;
      wishButton.setAttribute("id", "userWish");
      wishButton.onclick = () => {
        let room = data.wish;
        this.props.socket.emit("joinRoom", room);

        this.setState({
          chat: true,
          currentWish: room
        });
      };
      wishList.appendChild(wishButton);

      let room = data.wish;
      this.props.socket.emit("joinRoom", room);

      this.setState({
        chat: true,
        currentWish: room
      });
    });

    this.props.socket.on("refresh", data => {
      console.log(data);

      const wishesList = this.state.wishes;
      let removeWish = data;
      let index = wishesList.indexOf(removeWish);
      wishesList.splice(index, 1);
      this.setState({ wishesList });

      console.log(this.state.wishes);
    });

    this.props.socket.on("myWishesList", myWishes => {
      console.log(myWishes);
      this.setState({ userWishesList: myWishes });
      console.log(this.state.userWishesList);
    });

    this.props.socket.on("chatHistory", previousMessages => {
      this.setState({ previousMessages });
      //console.log(this.state.previousMessages);
    });
  }

  sendWish = e => {
    e.preventDefault();

    document.getElementById("wishForm").style.display = "none";

    if (this.state.wish !== "") {
      let wish = this.state.wish;
      this.props.socket.emit("sendWish", wish);

      this.setState({ wish: "" });
    } else {
      alert("please write a wish");
    }
  };

  openModal = () => {
    document.getElementById("wishForm").style.display = "flex";
  };

  closeModal = () => {
    document.getElementById("wishForm").style.display = "none";
  };

  joinRoom = e => {
    let room = e.target.getAttribute("value");
    console.log(room);

    //let pos = e.target.getAttribute("position");
    //console.log(pos);
    this.props.socket.emit("joinRoom", room);

    this.setState({
      chat: true,
      currentWish: room
    });
  };

  leaveRoom = e => {
    let room = e.target.getAttribute("value");
    console.log(room);

    this.props.socket.emit("leaveRoom", room);

    this.setState({
      chat: false
    });
  };

  selectRoom = e => {
    let room = e.target.value;
    console.log(room);

    this.props.socket.emit("joinRoom", room);

    this.setState({
      chat: true,
      currentWish: room
    });
  };

  handleLogout = () => {
    fetch("http://localhost:5000/users/logout", {
      method: "GET",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json"
      },
      credentials: "include"
    })
      .then(res => res.json())
      .then(res => {
        this.setState({ loggedOut: res.loggedOut });
      });
    this.props.socket.disconnect();
  };

  componentWillUnmount() {
    this.props.socket.removeAllListeners();
  }

  render() {
    const { loggedOut } = this.state;

    if (loggedOut === true) {
      return <Redirect to="/login" />;
    }

    return (
      <React.Fragment>
        {this.state.chat === true ? (
          <div id="popChat">
            <div id="wishName">{this.state.currentWish}</div>
            <button
              id="leaveButton"
              value={this.state.currentWish}
              onClick={this.leaveRoom}
            >
              Leave room
            </button>
            <ChatroomWithSocket history={this.state.previousMessages} />
          </div>
        ) : (
          ""
        )}
        <div id="fixedBar">
          <button id="logoutButton" onClick={this.handleLogout}>
            Log out
          </button>
          <button id="writeWish" onClick={this.openModal}>
            Write a wish
          </button>
          <ul id="wishList">
            {this.state.userWishesList.map((wish, key) => {
              return (
                <li key={key}>
                  <button
                    id="userWish"
                    value={wish.wish}
                    onClick={this.selectRoom}
                  />
                </li>
              );
            })}
          </ul>
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
            light={{ type: "directional", color: "white", intensity: 1 }}
            position="-1 1 0"
          />
          <Entity
            particle-system={{
              preset: "dust",
              maxAge: "20",
              particleCount: 100,
              color: "#ffffff, #c0c0c0"
            }}
          />
          <Entity
            star-system={{
              count: 500,
              radius: 500,
              depth: 0
            }}
          />
          <Entity
            primitive="a-octahedron"
            wireframe={true}
            detail={2}
            radius={4}
            position={{ x: 0, y: 0, z: -10.0 }}
            material={{ color: "white", transparent: true, opacity: 0.2 }}
            rotation="0 0 0"
            animation={{
              property: "rotation",
              to: "0 360 0",
              loop: true,
              dur: 60000
            }}
            animation__fadein={{
              property: "material.opacity",
              dur: 5000,
              from: 0,
              to: 0.2
            }}
          >
            <Entity
              primitive="a-box"
              width={1}
              height={1}
              metalness={1}
              rotation={"45 90 180"}
            />
            {this.state.wishes.map((room, key) => {
              return (
                <Entity
                  key={key}
                  value={room.wish}
                  geometry={{
                    primitive: "sphere",
                    radius: 0.2
                  }}
                  material={{
                    color: "white",
                    transparent: true,
                    opacity: 0.2
                  }}
                  position={{
                    x: room.posX,
                    y: room.posY,
                    z: room.posZ
                  }}
                  events={{ click: this.joinRoom }}
                  animation__scale={{
                    property: "scale",
                    dir: "alternate",
                    dur: 1000,
                    loop: true,
                    to: "1.1 1.1 1.1"
                  }}
                  animation__color={{
                    property: "material.opacity",
                    from: 0.2,
                    to: 0,
                    dur: 1000,
                    delay: 300000
                  }}
                >
                  <Entity
                    geometry={{
                      primitive: "sphere",
                      radius: 0.1
                    }}
                    animation__color={{
                      property: "material.opacity",
                      from: 0.2,
                      to: 0,
                      dur: 1000,
                      delay: 300000
                    }}
                  />
                </Entity>
              );
            })}
          </Entity>

          <Entity
            primitive="a-camera"
            position="0 1.6 0"
            animation__focus={{
              property: "position",
              dur: 2000,
              easing: "linear",
              to: "0 1.6 -2"
            }}
          >
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
