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

    // This is fired on the window.onload event via jQuery, and
    // is used to load the massive ThreeJS library after the fact.
    deferredLoading: function(){
        this.loadBikeBg();

        // If it doesn't support WebGL, then don;t even load Three.js
        if( this.supportsWebGL() ){
            // Load ThreeJS and the Collada Loader
            $LAB.script('./js/threejs/three.min.js').wait()
            .script('./js/threejs/ColladaLoader.js').wait(function(){
                console.log("ThreeJS Fully Loaded");
                HandlebarModel.init();
                ChainAndSprocket.init();
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

var HandlebarModel = {
    camera: {},
    scene: {},
    renderer: {},
    geometry: {},
    material: {},
    mesh: {},
    mouse: {},
    initialRotation: 20,

    toggleWireframe: function(){
        var processed = Array();
        for (var k in this.dae.children ) {
            var object = this.dae.children[k];

            if( processed.indexOf( object.material.id ) == -1 ){
                object.material.wireframe = !object.material.wireframe;
                processed.push( object.material.id );
            }
        };
    },

    setup: function(){
        var self = this;

        self.canvas = $('#handlebar');

        self.camera = new THREE.PerspectiveCamera( 50, 1, 1, 1000 );
        self.camera.position.z = 20;
        self.camera.position.y = 15;
        self.camera.rotation.x = -0.7;

        self.scene = new THREE.Scene();

        self.material = new THREE.MeshBasicMaterial( { color: 0x00ff00, wireframe: false } );

        // Add the COLLADA
        self.scene.add( self.dae );
        self.dae.rotation.y = self.initialRotation;

        //self.scene.add( new THREE.AmbientLight( 0xcccccc ) );

        pointLight = new THREE.PointLight( 0x666666, 2 );
        pointLight.position = {
            x: -500,
            y: 200,
            z: 0
        }
        self.scene.add( pointLight );
        
        pointLight2 = new THREE.PointLight( 0x666666, 2 );
        pointLight2.position = {
            x: 500,
            y: 500,
            z: 100
        }
        self.scene.add( pointLight2 );

        self.renderer = new THREE.WebGLRenderer();
        self.renderer.setSize( self.canvas.width(), parseInt(self.canvas.css('padding-top')) );

        self.canvas[0].appendChild( self.renderer.domElement );
        self.canvas.find('img').remove();
    },

    animate: function() {
        var self = this;
        requestAnimationFrame( this.animate.bind(this) );
        var dtime = Date.now() - self.startTime;
        self.dae.rotation.y += 0.006*Math.sin(dtime/3600);
        self.dae.rotation.z += 0.001;
        self.renderer.render( self.scene, self.camera );
    },

    init: function(){
        if( $('#handlebar').length && $('#handlebar').is(':visible') ) {
            var self = this;
            var loader = new THREE.ColladaLoader();
            loader.options.convertUpAxis = true;
            loader.options.subdivideFaces = false;
            loader.load( './models/handlebar_section.dae', function colladaReady( collada ) {

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


var ChainAndSprocket = {
    camera: {},
    scene: {},
    renderer: {},
    geometry: {},
    material: {},
    mesh: {},
    initialRotation: 20,

    setup: function(){
        var self = this;

        self.canvas = $('#chain_sprocket');

        self.camera = new THREE.PerspectiveCamera( 50, 1, 1, 1000 );
        self.camera.position.z = 7;
        self.camera.position.y = 10;
        self.camera.rotation.x = -0.7;

        self.scene = new THREE.Scene();

        //self.geometry = new THREE.CubeGeometry( 200, 200, 200 );
        self.material = new THREE.MeshBasicMaterial( { color: 0x00ff00, wireframe: false } );

        // self.mesh = new THREE.Mesh( self.geometry, self.material );
        // self.scene.add( self.mesh );

        // Add the COLLADA
        self.scene.add( self.dae );
        self.dae.rotation.y = self.initialRotation;

        //self.scene.add( new THREE.AmbientLight( 0xcccccc ) );

        pointLight = new THREE.PointLight( 0x666666, 2 );
        pointLight.position = {
            x: -500,
            y: 200,
            z: 0
        }
        self.scene.add( pointLight );
        
        pointLight2 = new THREE.PointLight( 0x666666, 2 );
        pointLight2.position = {
            x: 500,
            y: 200,
            z: 400
        }
        self.scene.add( pointLight2 );


        //self.renderer = new THREE.CanvasRenderer();
        self.renderer = new THREE.WebGLRenderer();
        self.renderer.setSize( self.canvas.width(), parseInt(self.canvas.css('padding-top')) );

        self.canvas[0].appendChild( self.renderer.domElement );
        self.canvas.find('img').remove();
    },

    animate: function() {
        var self = this;

        // note: three.js includes requestAnimationFrame shim
        requestAnimationFrame( this.animate.bind(this) );
        //self.mesh.rotation.y += 0.01;
        //self.mesh.rotation.y += 0.02;

        var dtime = Date.now() - self.startTime;

        self.dae.rotation.y += 0.003*Math.sin(dtime/6400);
        //self.dae.rotation.x += 0.0005;

        self.renderer.render( self.scene, self.camera );
    },

    init: function(){
        if( $('#chain_sprocket').length && $('#chain_sprocket').is(':visible') ) {
            var self = this;
            var loader = new THREE.ColladaLoader();
            loader.options.convertUpAxis = true;
            loader.load( './models/chain_sprocket_section.dae', function colladaReady( collada ) {

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