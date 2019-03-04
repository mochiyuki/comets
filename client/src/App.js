import React, { Component } from "react";
import { BrowserRouter, Switch, Route } from "react-router-dom";

import HomeWithSocket from "./components/Home";
import LoginWithSocket from "./components/Login";
import Register from "./components/Register";
import AuthRouteWithSocket from "./components/AuthRoute";

import SocketContext from "./socketContext";
import * as io from "socket.io-client";

const socket = io("localhost:5000");

const SocketApp = props => (
  <SocketContext.Provider value={socket}>
    <App />
  </SocketContext.Provider>
);

class App extends Component {
  render() {
    return (
      <BrowserRouter>
        <Switch>
          <Route path="/login" component={LoginWithSocket} />
          <Route path="/register" component={Register} />
          <AuthRouteWithSocket path="/" component={HomeWithSocket} />
        </Switch>
      </BrowserRouter>
    );
  }
}

export default SocketApp;
