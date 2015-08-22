export default
class RepositionMode {

  constructor(canvas) {
    this.canvas = canvas;

    this._attachListeners();
  }

  up() {
    let canvas = this.canvas,
      renderer = canvas.renderer,
      element = renderer.domElement;

    element.addEventListener('mousedown', this.listeners.mousedown);
    element.addEventListener('mousemove', this.listeners.mousemove);
    element.addEventListener('mouseup', this.listeners.mouseup);
  }

  down() {
    let canvas = this.canvas,
      renderer = canvas.renderer,
      element = renderer.domElement;

    element.removeEventListener('mousedown', this.listeners.mousedown);
  }

  create() {
    this.up();
  }

  _attachListeners() {
    let downPosition = new THREE.Vector2(),
      movePosition = new THREE.Vector2(),
      upPosition = new THREE.Vector2(),
      canvas = this.canvas;

    let atom;


    this.listeners = {};

    this.listeners.mousedown = (e) => {
      e.preventDefault();

      downPosition.set(e.clientX, e.clientY);

      let caster = this._getRayCaster(downPosition);
      let intersect = caster.intersectObjects(canvas.group.children);
      let position = this._getPosition(downPosition);

      if (e.which === 1 && position && intersect.length > 0) {
        let model = this._getNearest(intersect);

        if (model instanceof Chem.Atom) {
          atom = model;
        }
      }

    };

    this.listeners.mousemove = (e) => {
      movePosition.set(e.clientX, e.clientY);

      let position = this._getPosition(movePosition);

      if (e.which === 1 && atom) {
        atom.position = position;
        canvas.update();
      }
    };

    this.listeners.mouseup = (e) => {
      e.preventDefault();
      upPosition.set(e.clientX, e.clientY);

      atom = false;
    }
  }

  _getPosition(point) {
    let rayCaster = this._getRayCaster(point);
    let canvas = this.canvas;
    let planeZ = new THREE.Plane(rayCaster.ray.direction, -2);
    let position = rayCaster.ray.intersectPlane(planeZ);

    if (position) {
      let mat = new THREE.Matrix4();
      mat.getInverse(canvas.group.matrix);
      position.applyMatrix4(mat);
      return position;
    } else {
      return null;
    }
  }

  _getRayCaster(point) {
    let element = this.canvas.renderer.domElement;

    let point3d = new THREE.Vector3(
      (point.x / element.offsetWidth) * 2 - 1,
      -(point.y / element.offsetHeight) * 2 + 1,
      0.5);

    let rayCaster = new THREE.Raycaster();
    rayCaster.setFromCamera(point3d, this.canvas.camera);

    return rayCaster;
  }

  _getNearest(objects) {
    let distance = 0, result = null;

    for (let object of objects) {
      if (!result || object.distance < distance) {
        distance = object.distance;
        result = object.object.model;
      }
    }

    return result;
  }
}