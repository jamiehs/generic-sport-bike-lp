var GenericSportBike = {
    selectors: {
        bikeBg: '#bike-front-background',
        detailGalleryItems: '#detail-images a',
        detailGalleryModal: '#detail-images-modal',
        detailGalleryModalImage: '#detail-images-modal img'
    },

    supportsWebGL: function (){
        try {
            return !! window.WebGLRenderingContext && !! document.createElement( 'canvas' ).getContext( 'experimental-webgl' );
        } catch(e) {
            return false;
        }
    },

    loadBikeBg: function(){
        var bikeElement = $(this.selectors.bikeBg);
        bikeElement.css({
            'background-image': "url('" + bikeElement.data('bg-image') + "')"
        });
    },

    showSampleSectionHeaderInstructions: function(){
        $('#sample-section').find('h2:first em').show();
    },

    bindSampleSectionToggleWireframe: function(){
        $('#sample-section').find('.toggle-wireframe').click(function(event){
            event.preventDefault();
            $(this).parents('.model').data('model').toggleWireframe();
        });
    },

    // This is fired on the window.onload event via jQuery, and
    // is used to load the massive ThreeJS library after the fact.
    deferredLoading: function(){
        var self = this;
        this.loadBikeBg();

        // If it doesn't support WebGL, then don;t even load Three.js
        if( this.supportsWebGL() ){
            // Load ThreeJS and the Collada Loader
            $LAB.script('./js/threejs/three.min.js').wait()
            .script('./js/threejs/ColladaLoader.js').wait()
            .script('./js/threejs/orbit_controls.min.js').wait(function(){
                console.log("ThreeJS Fully Loaded");

                window.HandlebarModel = new LoadCollada('#handlebar', './models/handlebar_section.dae');
                window.HandlebarModel.init();

                window.NoseModel = new LoadCollada('#nose', './models/nose_section.dae');
                window.NoseModel.initialRotation = 3.5;
                window.NoseModel.cameraDistance = 180;
                window.NoseModel.autoRotationSpeed = 0.001;
                window.NoseModel.init();

                window.ChainModel = new LoadCollada('#chain_sprocket', './models/chain_sprocket_section.dae');
                window.ChainModel.initialRotation = 5.4;
                window.ChainModel.cameraDistance = 25;
                window.ChainModel.cameraHeight = 4;
                window.ChainModel.autoRotationSpeed =  0.00065;
                window.ChainModel.init();

                self.bindSampleSectionToggleWireframe();

            });
            $('body').addClass('webgl');
        } else {
            $('body').addClass('no-webgl');
        }
    },

    init: function(){
        // Initial setup of stuffs...
    }
};

function LoadCollada( canvasId, filename ) {
    this.camera = {};
    this.scene = {};
    this.renderer = {};
    this.geometry = {};
    this.mesh = {};
    this.mouse = {};
    this.filename = filename;
    this.canvasId = canvasId;
    this.initialRotation = 0;
    this.rotationSpeed = 1.2;
    this.autoRotationSpeed = 0.00075;
    this.startRotation = 1.75;
    this.cameraDistance = 75;
    this.cameraHeight = 0;
    this.cameraFOV = 25;
    this.autoRotate = true;

    this.toggleWireframe = function(){
        var processed = Array();
        for (var k in this.dae.children[0].children ) {
            var object = this.dae.children[0].children[k];
            if( processed.indexOf( object.material.id ) == -1 ){
                object.material.wireframe = !object.material.wireframe;
                processed.push( object.material.id );
            }
        };
    };

    this.setup = function(){
        var self = this;

        self.canvas = $(self.canvasId);

        self.camera = new THREE.PerspectiveCamera( self.cameraFOV, 1, 1, 1000 );

        self.controls = new THREE.OrbitControls( self.camera, self.canvas[0] );
        self.controls.target.z = 0;
        self.controls.noZoom = true;
        self.controls.noPan = true;
        self.controls.rotateSpeed = self.rotationSpeed;
        self.controls.target.y = self.cameraHeight;
        self.camera.position.y = self.cameraHeight;

        self.camera.position.z = self.cameraDistance;

        self.scene = new THREE.Scene();

        // Add the COLLADA
        self.scene.add( self.dae );
        self.dae.rotation.y = self.initialRotation;
        
        self.renderer = new THREE.WebGLRenderer({ antialias: true });
        self.renderer.setSize( self.canvas.width(), parseInt(self.canvas.css('padding-top')) );

        self.canvas[0].appendChild( self.renderer.domElement );
        self.canvas.find('img').remove();
        self.canvas.parents('.model-sample-wrapper').addClass('model-loaded');
        GenericSportBike.showSampleSectionHeaderInstructions();

        $(window).resize(function(){
            self.camera.updateProjectionMatrix();
            self.renderer.setSize( self.canvas.width(), parseInt(self.canvas.css('padding-top')) );
        });

        self.canvas.bind( 'mouseenter', function(){
            self.autoRotate = false;
        });
        self.canvas.bind( 'mouseleave', function(){
            self.autoRotate = true;
        });

        // Attach a reference to this object to a data property.
        $(self.canvasId).data('model', self);
    };

    this.animate = function() {
        var self = this;
        requestAnimationFrame( this.animate.bind(this) );

        if( self.autoRotate ) {
            var dtime = Date.now() - self.startTime;
            self.dae.rotation.y += self.autoRotationSpeed;
        }

        self.renderer.render( self.scene, self.camera );
    };

    this.init = function(){
        var self = this;
        if( $(self.canvasId).length && $(self.canvasId).is(':visible') ) {
            var loader = new THREE.ColladaLoader();
            loader.options.convertUpAxis = true;
            loader.options.subdivideFaces = false;
            loader.load( self.filename, function colladaReady( collada ) {

                self.dae = collada.scene;

                self.dae.scale.x = self.dae.scale.y = self.dae.scale.z = 1;
                self.dae.updateMatrix();
                
                self.setup();
                self.animate();

            });

            self.startTime = Date.now();
        }
    }
};

$(document).ready(function(){
    GenericSportBike.init();
});

$(window).load(function(){
    GenericSportBike.deferredLoading();
});