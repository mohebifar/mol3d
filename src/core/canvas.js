export default
class Canvas {

  constructor() {
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 10000);
    this.camera.position.z = 5;
    this.renderer = new THREE.WebGLRenderer({antialias: true, alpha: true});
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setClearColor(0x000000, 0);

    this.renderer.domElement.addEventListener('contextmenu', (e) => {
      e.preventDefault();
      return false;
    });

    this.group = new THREE.Object3D();
    this.scene.add(this.group);

    this.atoms = [];
    this.bonds = [];

    this._displays = [];
    this._display = null;

    this._modes = [];
    this._mode = null;
  }

  attach(molecule) {
    for (let i in molecule.atoms) {
      let atom = molecule.atoms[i];

      this.addAtom(atom);
    }
  }

  addAtom(atom, drawBonds = true) {
    this.atoms.push(atom);

    atom.on('bond', () => {
      // TODO: draw cylinder dynamically
    });

    atom.on('delete', () => {
      for (let i in this._displays) {
        let _display = this._displays[i];
        _display.removeAtom(atom);
      }

      this.atoms.splice(this.atoms.indexOf(atom), 1);
    });

    this._display.drawAtom(atom);

    if (drawBonds) {
      for (let i in atom.bonds) {
        this.addBond(atom.bonds[i]);
      }
    }
  }

  removeAtom(atom) {
    atom.emit('delete');
  }

  addBond(bond) {
    this.bonds.push(bond);

    bond.on('delete', () => {
      for (let i in this._displays) {
        let _display = this._displays[i];
        _display.removeBond(bond);
      }

      this.bonds.splice(this.bonds.indexOf(bond), 1);
    });


    this._display.drawBond(bond);
  }

  removeBond(bond) {
    bond.emit('delete');
  }

  clear() {
    var atoms = this.atoms.slice(0, this.atoms.length);

    for (let i in atoms) {
      this.removeAtom(atoms[i]);
    }
  }


  setMode(mode) {
    if (this._mode) {
      this._mode.down();
    }

    for (var i in this._modes) {
      let _mode = this._modes[i];

      if (_mode instanceof mode) {
        this._mode = _mode;
        this._mode.up();
        return;
      }
    }

    this._mode = new mode(this);
    this._mode.create();
    this._modes.push(this._mode);
  }

  setDisplay(display) {
    if (this._display) {
      this._display.down();
    }

    for (var i in this._displays) {
      let _display = this._displays[i];

      if (_display instanceof display) {
        this._display = _display;
        this._display.up();
        return;
      }
    }

    this._display = new display(this);
    this._display.init();
    this._displays.push(this._display);
  }

  show() {
    requestAnimationFrame(() => this.show());

    this.renderer.render(this.scene, this.camera);
  }

}