const AFRAME = window.AFRAME;
//const THREE = require("aframe/src/lib/three");

AFRAME.registerComponent("wireframe", {
  dependencies: ["material"],
  init: function() {
    this.el.components.material.material.wireframe = true;
  }
});
