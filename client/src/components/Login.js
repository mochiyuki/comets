import React, { Component } from "react";
import { Redirect, Link } from "react-router-dom";

import SocketContext from "../socketContext";

import logo from "./assets/logo.png";

class Login extends Component {
  constructor(props) {
    super(props);

    this.state = {
      username: "",
      password: "",
      redirect: false,
      error: ""
    };
  }

  handleLogin = e => {
    e.preventDefault();
    fetch("http://localhost:5000/users/login", {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json"
      },
      credentials: "include",
      body: JSON.stringify({
        username: this.state.username,
        password: this.state.password
      })
    })
      .then(res => res.json())
      .then(res => {
        if (res.type === "success") {
          this.setState({ redirect: true });
        } else {
          this.setState({ error: res.error.message });
        }
      });
  };

  render() {
    return this.state.redirect === true ? (
      <Redirect to="/" />
    ) : (
      <>
        <div id="login-form">
          <div className="logo">
            <img src={logo} alt="comets logo" />
          </div>
          <input
            type="text"
            name="username"
            placeholder="Username"
            onChange={e => this.setState({ username: e.target.value })}
          />
          <input
            type="password"
            name="password"
            placeholder="Password"
            onChange={e => this.setState({ password: e.target.value })}
          />
          <span>{this.state.error}</span>
          <button type="primary" onClick={this.handleLogin}>
            Login
          </button>
          <button id="redirectRegister">
            <Link to="/register"> Not a member yet? </Link>
          </button>
        </div>
      </>
    );
  }
}

const LoginWithSocket = props => (
  <SocketContext.Consumer>
    {socket => <Login {...props} socket={socket} />}
  </SocketContext.Consumer>
);

export default LoginWithSocket;
