export default
class EditorMode {

  constructor(canvas) {
    this.canvas = canvas;

    this._attachListeners();
  }

  up() {
    var canvas = this.canvas,
      renderer = canvas.renderer,
      element = renderer.domElement;

    element.addEventListener('mousedown', this.listeners.mousedown);
    element.addEventListener('mouseup', this.listeners.mouseup);
  }

  down() {
    var canvas = this.canvas,
      renderer = canvas.renderer,
      element = renderer.domElement;

    element.removeEventListener('mousedown', this.listeners.mousedown);
  }

  create() {
    this.up();
  }

  _attachListeners() {
    var downPosition = new THREE.Vector2(),
      movePosition = new THREE.Vector3(),
      upPosition = new THREE.Vector2();

    var atom1, atom2;

    this.listeners = {};

    this.listeners.mousedown = (e) => {
      e.preventDefault();

      downPosition.set(e.clientX, e.clientY);

      let caster = this._getRayCaster(downPosition);
      let intersect = caster.intersectObjects(canvas.group.children);
      let position = this._getPosition(downPosition);

      if (e.which === 1 && position && intersect.length === 0) {
        if (intersect.length === 0) {
          let atom = new Chem.Atom();

          atom.atomicNumber = 6;
          atom.position = position;

          canvas.addAtom(atom);

          atom1 = atom;
        } else if (e.which === 1 && intersect.length) {

        }
      }

    };

    this.listeners.mousemove = function (e) {
      movePosition.set(e.clientX, e.clientY);

      let position = this._getPosition(downPosition);
      if (atom1) {

      }
    };

    this.listeners.mouseup = (e) => {
      e.preventDefault();
      upPosition.set(e.clientX, e.clientY);

      if (e.which === 1 && upPosition.distanceTo(downPosition) > 60) {
        let position = this._getPosition(upPosition);
      }

      atom1 = false;
      atom2 = false;
    }
  }

  _getPosition(point) {
    let rayCaster = this._getRayCaster(point);
    let planeZ = new THREE.Plane(new THREE.Vector3(0, 0, 1), this.canvas.camera.position.z / 4);
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
}