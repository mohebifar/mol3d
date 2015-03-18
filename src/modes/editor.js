export default
class EditorMode {

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

    let atom1, atom2;

    let fixed = false;

    this.listeners = {};

    this.listeners.mousedown = (e) => {
      e.preventDefault();

      downPosition.set(e.clientX, e.clientY);

      let caster = this._getRayCaster(downPosition);
      let intersect = caster.intersectObjects(canvas.group.children);
      let position = this._getPosition(downPosition);

      if (e.which === 1 && position && intersect.length === 0) {
        let atom = new Chem.Atom();

        atom.atomicNumber = canvas.getData('element');
        atom.position = position;
        canvas.addAtom(atom);

        atom1 = atom;
      } else if (position && intersect.length > 0) {
        let model = this._getNearest(intersect);

        if (model instanceof Chem.Atom) {
          if (e.which === 1) {
            atom1 = model;
          } else if (e.which === 3) {
            canvas.removeAtom(model);
          }
        } else if (model instanceof  Chem.Bond) {
          if (e.which === 1) {
            if (model.order !== 3) {
              model.order++;
            } else {
              model.order = 1;
            }
            canvas.update();
          } else if (e.which === 3) {
            canvas.removeBond(model);
          }
        }
      }

    };

    this.listeners.mousemove = (e) => {
      let prevPosition = movePosition.clone();
      movePosition.set(e.clientX, e.clientY);

      let delta = prevPosition.distanceTo(movePosition);

      let caster = this._getRayCaster(movePosition);
      let position = this._getPosition(movePosition);

      if (e.which === 1 && atom1 && movePosition.distanceTo(downPosition) > 60) {

        let intersect = caster.intersectObjects(canvas.group.children);

        intersect = intersect.filter(function (item) {
          return item.object && item.object.type === 'atom' && item.object.model !== atom2;
        });

        let model = this._getNearest(intersect);

        if (!fixed) {
          if (model) {
            if (atom2) {
              canvas.removeAtom(atom2);
            }

            atom2 = model;
            fixed = true;

            if (!atom1.isConnected(atom2)) {
              let bond = new Chem.Bond(atom1, atom2);
              canvas.addBond(bond);
            }
          } else {
            if (!atom2) {
              atom2 = new Chem.Atom();
              atom2.atomicNumber = canvas.getData('element');
              atom2.position = position;
              new Chem.Bond(atom1, atom2);

              canvas.addAtom(atom2);
            }

            atom2.position = position;
            canvas.update();
          }
        }

      }
    };

    this.listeners.mouseup = (e) => {
      e.preventDefault();
      upPosition.set(e.clientX, e.clientY);

      if (e.which === 1 && upPosition.distanceTo(downPosition) < 2 && atom1) {
        atom1.atomicNumber = canvas.getData('element');
        this.canvas.update();
      }

      atom1 = false;
      atom2 = false;
      fixed = false;
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