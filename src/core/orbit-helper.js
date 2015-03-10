export default
class OrbitHelper {

  constructor(canvas) {
    this.canvas = canvas;

    this.quaternion = new LiThree.Math.Quaternion();
    this.matrix = null;

    this.origin = new LiThree.Math.Vector3();
    this.speed = 1;

    canvas.renderer.camera.position.z = -10;

    this._getMatrix();
  }

  rotate(dx, dy) {
    dx *= this.speed;
    dy *= this.speed;

    var
      r = Math.sqrt(dx * dx + dy * dy),
      dq = new LiThree.Math.Quaternion(1, 0, 0, 0),
      cq = this.quaternion,
      rs = Math.sin(r * Math.PI) / r;

    if(r < 0.000001) {
      return;
    }

    dq.x = Math.cos(r * Math.PI);
    dq.y = 0;
    dq.z = rs * dx;
    dq.w = -rs * dy;

    this.quaternion = new LiThree.Math.Quaternion(1, 0, 0, 0);
    this.quaternion.multiply(dq);
    this.quaternion.multiply(cq);

    this._getMatrix();
  }

  distance(delta) {
    var canvas = this.canvas,
      camera = canvas.renderer.camera;

    delta *= this.speed / 50;

    if (canvas.getData('tween')) {
      var z = camera.position.z + delta;
      new TWEEN.Tween(camera.position)
        .to({z: z}, 200)
        .easing(TWEEN.Easing.Cubic.Out)
        .start();
    } else {
      camera.position.z += delta / 2;
    }
  }

  _getMatrix() {
    this.matrix = LiThree.Math.Matrix4.fromRotationTranslationScaleOrigin(this.quaternion, this.origin, new LiThree.Math.Vector3(1, 1, 1), this.origin);
    return this.matrix;
  }

}