import React, { Component } from "react";
import { Redirect } from "react-router-dom";

class Register extends Component {
  constructor(props) {
    super(props);

    this.state = {
      email: "",
      username: "",
      password: "",
      passwordver: "",
      redirect: false,
      error: ""
    };
    this.handleRegister = this.handleRegister.bind(this);
  }

  handleRegister(e) {
    e.preventDefault();
    fetch("http://localhost:5000/users/register", {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json"
      },
      credentials: "include",
      body: JSON.stringify({
        email: this.state.email,
        username: this.state.username,
        password: this.state.password,
        passwordver: this.state.passwordver
      })
    })
      .then(res => res.json())
      .then(res => {
        if (res.success === true) {
          //console.log("success");
          this.setState({ redirect: true });
        } else {
          //console.log("failed");
          this.setState({ error: res.error });
        }
      });
  }

  render() {
    return this.state.redirect === true ? (
      <Redirect to="/login" />
    ) : (
      <>
        <input
          type="email"
          name="email"
          placeholder="Email"
          onChange={e => this.setState({ email: e.target.value })}
        />
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
        <input
          type="password"
          name="passwordver"
          placeholder="Password confirmation"
          onChange={e => this.setState({ passwordver: e.target.value })}
        />

        <button type="primary" onClick={this.handleRegister}>
          Register
        </button>

        <p>{this.state.error}</p>
      </>
    );
  }
}

export default Register;
