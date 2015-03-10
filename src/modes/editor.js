export default
class EditorMode {

  constructor(canvas) {
    this.canvas = canvas;
    var camera = canvas.camera;

    function getPosition(e) {
      var planeZ = new THREE.Plane(new THREE.Vector3(0, 0, 1), 5 - camera.position.z);
      var rayCaster = getRayCaster(e);
      var pos = rayCaster.ray.intersectPlane(planeZ);
      var mat = new THREE.Matrix4();
      mat.getInverse(canvas.group.matrix);
      pos.applyMatrix4(mat);
      return pos;
    }

    function getRayCaster(e) {
      var mv = new THREE.Vector3(
        (e.clientX / window.innerWidth) * 2 - 1,
        -(e.clientY / window.innerHeight) * 2 + 1,
        0.5);
      var rayCaster = new THREE.Raycaster();
      rayCaster.setFromCamera(mv, camera);

      return rayCaster;
    }

    var downPosition = new THREE.Vector2(),
      upPosition = new THREE.Vector2();

    this.listeners = {};

    this.listeners.mousedown = (e) => {
      e.preventDefault();

      downPosition.set(e.clientX, e.clientY);
    };

    this.listeners.mouseup = (e) => {
      e.preventDefault();
      upPosition.set(e.clientX, e.clientY);

      let caster = getRayCaster(e);
      let intersect = caster.intersectObjects(canvas.group.children);


      if (e.which === 1 && upPosition.distanceTo(downPosition) < 2) {
        if (intersect.length === 0) {
          let position = getPosition(e);
          let atom = new Chem.Atom();

          atom.atomicNumber = 6;
          atom.position = position;

          canvas.addAtom(atom);
        } else {

        }
      }
    }
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

}