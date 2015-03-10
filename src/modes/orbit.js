export default
class OrbitMode {

  constructor(canvas) {
    this.canvas = canvas;

    this.listeners = {};

    var lastPosition = [0, 0];

    this.listeners.mousemove = (e) => {

      e.preventDefault();
      let deltaX = e.clientX - lastPosition[0],
        deltaY = e.clientY - lastPosition[1];

      if (e.which && e.which === 1) {
/*
        var
          r = Math.sqrt(deltaX * deltaX + deltaY * deltaY),
          cq = canvas.group.quaternion.clone(),
          rs = Math.sin(r * Math.PI) / r,
          dq = new THREE.Quaternion(
            Math.cos(r * Math.PI), 0, rs * deltaX / 120, -rs * deltaY / 120);

        if (r < 0.000001) {
          return;
        }

        var q = new THREE.Quaternion(1, 0, 0, 0);
        q.multiplyQuaternions(dq, cq);
        canvas.group.setRotationFromQuaternion(dq);*/

        canvas.group.rotation.y += deltaX / 120;
        canvas.group.rotation.x += deltaY / 120;
      } else if (e.which && e.which === 3) {
        canvas.group.position.x += deltaX / 100;
        canvas.group.position.y -= deltaY / 100;
      }

      lastPosition[0] = e.clientX;
      lastPosition[1] = e.clientY;
    };

    this.listeners.mousedown = (e) => {
      lastPosition[0] = e.clientX;
      lastPosition[1] = e.clientY;
    };

    this.listeners.mousewheel = (e) => {
      canvas.camera.position.z -= e.wheelDelta / 240;
    };
  }

  up() {
    var canvas = this.canvas,
      renderer = canvas.renderer,
      element = renderer.domElement;

    element.addEventListener('mousedown', this.listeners.mousedown);
    element.addEventListener('mousemove', this.listeners.mousemove);
    element.addEventListener('mousewheel', this.listeners.mousewheel);

    //new THREE.OrbitControls(canvas.group, canvas.renderer.domElement);

  }

  down() {
    var canvas = this.canvas,
      renderer = canvas.renderer,
      element = renderer.domElement;

    element.removeEventListener('mousedown', this.listeners.mousedown);
    element.removeEventListener('mousemove', this.listeners.mousemove);
    element.removeEventListener('mousewheel', this.listeners.mousewheel);
  }

  create() {
    this.up();
  }

}