export default
class OrbitMode {

  constructor(canvas) {
    this.canvas = canvas;

    this.orbitControl = new OrbitControls(canvas.camera, canvas.renderer.domElement);
  }

  up() {
    this.orbitControl.up();
  }

  down() {
    this.orbitControl.down();
  }

  create() {
    this.up();
  }

}