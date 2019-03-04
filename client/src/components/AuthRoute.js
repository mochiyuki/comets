import { Redirect, Route } from "react-router-dom";
import React, { Component } from "react";

import SocketContext from "../socketContext";

class AuthRoute extends Component {
  constructor(props) {
    super(props);

    this.state = {
      isLogged: null
    };
  }

  componentDidMount() {
    fetch("http://localhost:5000/users/check-login", {
      method: "GET",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json"
      },
      credentials: "include"
    })
      .then(res => res.json())
      .then(res => {
        this.setState({ isLogged: res.logged });
      });
  }

  render() {
    const Component = this.props.component;
    const Props = { ...this.props };
    delete Props.component;

    return (
      <Route
        {...Props}
        render={routeProps =>
          this.state.isLogged === null ? (
            <p>Loading</p>
          ) : this.state.isLogged === true ? (
            <Component {...routeProps} />
          ) : (
            <Redirect to="/login" />
          )
        }
      />
    );
  }
}

const AuthRouteWithSocket = props => (
  <SocketContext.Consumer>
    {socket => <AuthRoute {...props} socket={socket} />}
  </SocketContext.Consumer>
);

export default AuthRouteWithSocket;
