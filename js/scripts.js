(function() {
  var GenericSportBike, LoadCollada;

  GenericSportBike = {
    selectors: {
      bikeBg: '#bike-front-background',
      detailGalleryItems: '#detail-images a',
      detailGalleryModal: '#detail-images-modal',
      detailGalleryModalImage: '#detail-images-modal img'
    },
    supportsWebGL: function() {
      var e;
      try {
        return !!window.WebGLRenderingContext && !!document.createElement('canvas').getContext('experimental-webgl');
      } catch (_error) {
        e = _error;
        return false;
      }
    },
    loadBikeBg: function() {
      var bikeElement;
      bikeElement = $(this.selectors.bikeBg);
      return bikeElement.css({
        'background-image': "url('" + bikeElement.data('bg-image') + "')"
      });
    },
    showSampleSectionHeaderInstructions: function() {
      return $('#sample-section').find('h2:first em').show();
    },
    bindSampleSectionToggles: function() {
      return $('#sample-section .controls a').click(function(event) {
        var clickedLink;
        event.preventDefault();
        clickedLink = $(this);
        switch (clickedLink.attr('class')) {
          case 'toggle-wireframe':
            return $(this).parents('.model').data('model').toggleWireframe();
          case 'toggle-zoom':
            return $(this).parents('.model').data('model').toggleZoom();
        }
      });
    },
    deferredLoading: function() {
      this.loadBikeBg();
      if (this.supportsWebGL()) {
        $LAB.script('./js/threejs/three.min.js').wait().script('./js/threejs/ColladaLoader.js').wait().script('./js/threejs/orbit_controls.min.js').wait((function(_this) {
          return function() {
            console.log("ThreeJS Fully Loaded");
            window.HandlebarModel = new LoadCollada('#handlebar', './models/handlebar_section.dae');
            window.HandlebarModel.init();
            window.NoseModel = new LoadCollada('#nose', './models/nose_section.dae');
            window.NoseModel.initialRotation = 3.5;
            window.NoseModel.cameraDistance = window.NoseModel.maxZoomDistance = 180;
            window.NoseModel.minZoomDistance = 85;
            window.NoseModel.init();
            window.ChainModel = new LoadCollada('#chain_sprocket', './models/chain_sprocket_section.dae');
            window.ChainModel.initialRotation = 5.4;
            window.ChainModel.cameraDistance = window.ChainModel.maxZoomDistance = 25;
            window.ChainModel.minZoomDistance = 10;
            window.ChainModel.cameraHeight = 4;
            window.ChainModel.init();
            return _this.bindSampleSectionToggles();
          };
        })(this));
        return $('body').addClass('webgl');
      } else {
        return $('body').addClass('no-webgl');
      }
    },
    init: function() {}
  };

  LoadCollada = (function() {
    function LoadCollada(canvasId, filename) {
      this.canvasId = canvasId;
      this.filename = filename;
    }

    LoadCollada.prototype.camera = {};

    LoadCollada.prototype.scene = {};

    LoadCollada.prototype.renderer = {};

    LoadCollada.prototype.geometry = {};

    LoadCollada.prototype.mesh = {};

    LoadCollada.prototype.mouse = {};

    LoadCollada.prototype.filename = LoadCollada.filename;

    LoadCollada.prototype.canvasId = LoadCollada.canvasId;

    LoadCollada.prototype.initialRotation = 0;

    LoadCollada.prototype.rotationSpeed = 1.2;

    LoadCollada.prototype.autoRotationSpeed = 0.002;

    LoadCollada.prototype.startRotation = 1.75;

    LoadCollada.prototype.cameraDistance = 75;

    LoadCollada.prototype.cameraHeight = 0;

    LoadCollada.prototype.cameraFOV = 25;

    LoadCollada.prototype.autoRotate = true;

    LoadCollada.prototype.currentlyZoomed = false;

    LoadCollada.prototype.minZoomDistance = 20;

    LoadCollada.prototype.maxZoomDistance = 75;

    LoadCollada.prototype.zoomStepSpeed = 1.07;

    LoadCollada.prototype.currentDistance = LoadCollada.cameraDistance;

    LoadCollada.prototype.toggleWireframe = function() {
      var object, processed, _i, _len, _ref, _results;
      processed = Array();
      _ref = this.dae.children[0].children;
      _results = [];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        object = _ref[_i];
        if (processed.indexOf(object.material.id) === -1) {
          object.material.wireframe = !object.material.wireframe;
          _results.push(processed.push(object.material.id));
        } else {
          _results.push(void 0);
        }
      }
      return _results;
    };

    LoadCollada.prototype.toggleZoom = function() {
      if (this.currentlyZoomed) {
        return this.zoomOut();
      } else {
        return this.zoomIn();
      }
    };

    LoadCollada.prototype.zoomIn = function() {
      if (this.currentDistance > this.minZoomDistance) {
        requestAnimationFrame(this.zoomIn.bind(this));
        this.controls.dollyIn(this.zoomStepSpeed);
        this.currentDistance = this.getCameraDistance();
        return this.controls.update();
      } else {
        return this.currentlyZoomed = true;
      }
    };

    LoadCollada.prototype.zoomOut = function() {
      if (this.currentDistance < this.maxZoomDistance) {
        requestAnimationFrame(this.zoomOut.bind(this));
        this.controls.dollyOut(this.zoomStepSpeed);
        this.currentDistance = this.getCameraDistance();
        return this.controls.update();
      } else {
        return this.currentlyZoomed = false;
      }
    };

    LoadCollada.prototype.getCameraDistance = function() {
      var a, b;
      a = new THREE.Vector3(this.camera.position.x, this.camera.position.y, this.camera.position.z);
      b = new THREE.Vector3(this.controls.target.x, this.controls.target.y, this.controls.target.z);
      return a.distanceTo(b);
    };

    LoadCollada.prototype.setup = function() {
      this.canvas = $(this.canvasId);
      this.camera = new THREE.PerspectiveCamera(this.cameraFOV, 1, 1, 1000);
      this.controls = new THREE.OrbitControls(this.camera, this.canvas[0]);
      this.controls.target.z = 0;
      this.controls.noZoom = true;
      this.controls.noPan = true;
      this.controls.rotateSpeed = this.rotationSpeed;
      this.controls.target.y = this.cameraHeight;
      this.camera.position.y = this.cameraHeight;
      this.camera.position.z = this.cameraDistance;
      this.scene = new THREE.Scene();
      this.scene.add(this.dae);
      this.dae.rotation.y = this.initialRotation;
      this.renderer = new THREE.WebGLRenderer({
        antialias: true
      });
      this.renderer.setSize(this.canvas.width(), parseInt(this.canvas.css('padding-top')));
      this.canvas[0].appendChild(this.renderer.domElement);
      this.canvas.find('img').remove();
      this.canvas.parents('.model-sample-wrapper').addClass('model-loaded');
      GenericSportBike.showSampleSectionHeaderInstructions();
      $(window).resize(function() {
        this.camera.updateProjectionMatrix();
        return this.renderer.setSize(this.canvas.width(), parseInt(this.canvas.css('padding-top')));
      });
      this.canvas.bind('mouseenter', (function(_this) {
        return function() {
          return _this.autoRotate = false;
        };
      })(this));
      this.canvas.bind('mouseleave', (function(_this) {
        return function() {
          return _this.autoRotate = true;
        };
      })(this));
      this.currentDistance = this.getCameraDistance();
      return $(this.canvasId).data('model', this);
    };

    LoadCollada.prototype.animate = function() {
      var dtime;
      requestAnimationFrame(this.animate.bind(this));
      if (this.autoRotate) {
        dtime = Date.now() - this.startTime;
        this.dae.rotation.y += this.autoRotationSpeed;
      }
      return this.renderer.render(this.scene, this.camera);
    };

    LoadCollada.prototype.init = function() {
      var colladaReady, loader;
      if ($(this.canvasId).length && $(this.canvasId).is(':visible')) {
        loader = new THREE.ColladaLoader();
        loader.options.convertUpAxis = true;
        loader.options.subdivideFaces = false;
        loader.load(this.filename, colladaReady = (function(_this) {
          return function(collada) {
            _this.dae = collada.scene;
            _this.dae.scale.x = _this.dae.scale.y = _this.dae.scale.z = 1;
            _this.dae.updateMatrix();
            _this.setup();
            return _this.animate();
          };
        })(this));
        return this.startTime = Date.now();
      }
    };

    return LoadCollada;

  })();

  $(document).ready(function() {
    return GenericSportBike.init();
  });

  $(window).load(function() {
    return GenericSportBike.deferredLoading();
  });

}).call(this);
