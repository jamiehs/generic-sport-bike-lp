GenericSportBike =
    selectors:
        bikeBg: '#bike-front-background'
        detailGalleryItems: '#detail-images a'
        detailGalleryModal: '#detail-images-modal'
        detailGalleryModalImage: '#detail-images-modal img'

    supportsWebGL: ()->
        try
            return !! window.WebGLRenderingContext && !! document.createElement( 'canvas' ).getContext( 'experimental-webgl' )
        catch e
            return false
    

    loadBikeBg: ()->
        bikeElement = $(@selectors.bikeBg)
        bikeElement.css 'background-image': "url('" + bikeElement.data('bg-image') + "')"
        
    

    showSampleSectionHeaderInstructions: ()->
        $('#sample-section').find('h2:first em').show()
    

    bindSampleSectionToggles: ()->
        $('#sample-section .controls a').click (event)->
            event.preventDefault()
            clickedLink = $(@)
            switch clickedLink.attr 'class'
                when 'toggle-wireframe'
                    $(@).parents('.model').data('model').toggleWireframe()
                when 'toggle-zoom'
                    $(@).parents('.model').data('model').toggleZoom()


    # This is fired on the window.onload event via jQuery, and
    # is used to load the massive ThreeJS library after the fact.
    deferredLoading: ()->
        @loadBikeBg()

        # If it doesn't support WebGL, then don't even load Three.js
        if @supportsWebGL()
            # Load ThreeJS and the Collada Loader
            $LAB.script('./js/threejs/three.min.js').wait()
            .script('./js/threejs/ColladaLoader.js').wait()
            .script('./js/threejs/orbit_controls.min.js').wait ()=>
                console.log "ThreeJS Fully Loaded"

                window.HandlebarModel = new LoadCollada '#handlebar', './models/handlebar_section.dae'
                window.HandlebarModel.init()

                window.NoseModel = new LoadCollada '#nose', './models/nose_section.dae'
                window.NoseModel.initialRotation = 3.5
                window.NoseModel.cameraDistance = window.NoseModel.maxZoomDistance = 180
                window.NoseModel.minZoomDistance = 85
                window.NoseModel.init()

                window.ChainModel = new LoadCollada '#chain_sprocket', './models/chain_sprocket_section.dae'
                window.ChainModel.initialRotation = 5.4
                window.ChainModel.cameraDistance = window.ChainModel.maxZoomDistance = 25
                window.ChainModel.minZoomDistance = 10
                window.ChainModel.cameraHeight = 4
                window.ChainModel.init()

                @bindSampleSectionToggles()

            $('body').addClass 'webgl'
        else
            $('body').addClass 'no-webgl'
        
    init: ()->
        # Initial setup of stuffs...


class LoadCollada
    constructor: ( @canvasId, @filename )->

    camera: {}
    scene: {}
    renderer: {}
    geometry: {}
    mesh: {}
    mouse: {}
    filename: @filename
    canvasId: @canvasId
    initialRotation: 0
    rotationSpeed: 1.2
    autoRotationSpeed: 0.002
    startRotation: 1.75
    cameraDistance: 75
    cameraHeight: 0
    cameraFOV: 25
    autoRotate: true
    currentlyZoomed: false
    minZoomDistance: 20
    maxZoomDistance: 75
    zoomStepSpeed: 1.07 # Number greater than 1.0
    currentDistance: @cameraDistance

    toggleWireframe: ()->
        processed = Array()
        for object in @dae.children[0].children
            if processed.indexOf( object.material.id ) == -1
                object.material.wireframe = !object.material.wireframe
                processed.push( object.material.id )
            
    toggleZoom: ()->
        if @currentlyZoomed
            @zoomOut()
        else
            @zoomIn()

    zoomIn: ()->
        if @currentDistance > @minZoomDistance
            requestAnimationFrame( @zoomIn.bind(this) )
            @controls.dollyIn( @zoomStepSpeed )
            @currentDistance = @getCameraDistance()
            @controls.update()
        else
            @currentlyZoomed = true

    zoomOut: ()->
        if @currentDistance < @maxZoomDistance
            requestAnimationFrame( @zoomOut.bind(this) )
            @controls.dollyOut( @zoomStepSpeed )
            @currentDistance = @getCameraDistance()
            @controls.update()
        else
            @currentlyZoomed = false

    getCameraDistance: ()->
        a = new THREE.Vector3( @camera.position.x, @camera.position.y, @camera.position.z )
        b = new THREE.Vector3( @controls.target.x, @controls.target.y, @controls.target.z )
        return a.distanceTo(b)
    

    setup: ()->
        @canvas = $(@canvasId)

        @camera = new THREE.PerspectiveCamera( @cameraFOV, 1, 1, 1000 )

        @controls = new THREE.OrbitControls( @camera, @canvas[0] )
        @controls.target.z = 0
        @controls.noZoom = true
        @controls.noPan = true
        @controls.rotateSpeed = @rotationSpeed
        @controls.target.y = @cameraHeight
        @camera.position.y = @cameraHeight

        @camera.position.z = @cameraDistance

        @scene = new THREE.Scene()

        # Add the COLLADA
        @scene.add @dae
        @dae.rotation.y = @initialRotation
        
        @renderer = new THREE.WebGLRenderer({ antialias: true })
        @renderer.setSize(@canvas.width(), parseInt(@canvas.css('padding-top')))

        @canvas[0].appendChild( @renderer.domElement )
        @canvas.find('img').remove()
        @canvas.parents('.model-sample-wrapper').addClass('model-loaded')
        GenericSportBike.showSampleSectionHeaderInstructions()

        $(window).resize ()->
            @camera.updateProjectionMatrix()
            @renderer.setSize(@canvas.width(), parseInt(@canvas.css('padding-top')))

        @canvas.bind 'mouseenter', ()=>
            @autoRotate = false

        @canvas.bind 'mouseleave', ()=>
            @autoRotate = true

        @currentDistance = @getCameraDistance()

        # Attach a reference to this object to a data property.
        $(@canvasId).data 'model', @


    animate: ()->
        requestAnimationFrame(@animate.bind(@))

        if @autoRotate
            dtime = Date.now() - @startTime
            @dae.rotation.y += @autoRotationSpeed

        @renderer.render(@scene, @camera)


    init: ()->
        if $(@canvasId).length && $(@canvasId).is(':visible')
            loader = new THREE.ColladaLoader()
            loader.options.convertUpAxis = true
            loader.options.subdivideFaces = false
            loader.load @filename, colladaReady = ( collada )=>
                @dae = collada.scene
                @dae.scale.x = @dae.scale.y = @dae.scale.z = 1
                @dae.updateMatrix()
                @setup()
                @animate()

            @startTime = Date.now()


$(document).ready ()->
    GenericSportBike.init()

$(window).load ()->
    GenericSportBike.deferredLoading()
