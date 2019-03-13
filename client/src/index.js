import React from "react";
import ReactDOM from "react-dom";
import "./index.css";
import SocketApp from "./App";
import * as serviceWorker from "./serviceWorker";

ReactDOM.render(<SocketApp />, document.getElementById("root"));

serviceWorker.unregister();
