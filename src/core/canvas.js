export default
class Canvas {

  constructor() {
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 10000);
    this.camera.position.z = 5;
    this.renderer = new THREE.WebGLRenderer({antialias: true, alpha: true});
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setClearColor(0x000000, 0);
    this.currentMode = null;

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

    this.data = {};

    this.setData('element', 6);
  }

  /**
   * Inject some data
   *
   * @method setData
   * @param key
   * @param value
   * @returns {*}
   */
  setData(key, value) {
    this.data[key] = value;
    return this;
  }

  /**
   * Get injected data
   *
   * @method getData
   * @param key
   * @returns {*}
   */
  getData(key) {
    return this.data[key];
  }

  /**
   * Checks if data with given key exists
   *
   * @method hasData
   * @param key
   * @returns {boolean}
   */
  hasData(key) {
    return typeof this.data[key] !== 'undefined';
  }

  getMolecule() {
    var molecule = new Chem.Molecule();

    for (let i in this.atoms) {
      molecule.addAtom(this.atoms[i]);
    }

    for (let i in this.bonds) {
      molecule.addBond(this.bonds[i]);
    }

    return molecule;
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

  update() {
    for (let atom of this.atoms) {
      for(let display of this._displays) {
        display.drawAtom(atom);
      }
    }

    for (let bond of this.bonds) {
      for(let display of this._displays) {
        display.drawBond(bond);
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
    var bonds = this.bonds.slice(0, this.bonds.length);

    for (let atom of atoms) {
      this.removeAtom(atom);
    }

    for (let bond of bonds) {
      this.removeBond(bond);
    }
  }


  setMode(mode) {
    if (this._mode) {
      this._mode.down();
    }

    this.currentMode = mode;

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
    this.renderer.render(this.scene, this.camera);

    requestAnimationFrame(() => this.show());
  }

}