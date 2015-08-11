var _InnokinDisrupterViewer = function () {

    var debug_mode = false;
    var scene, camera, renderer, particleGroup, emitter, clock, raycaster, cameraLight, orbitcntrl, disrupter_buttons = [], disrupter_groups = {}, current_pick_set, current_choice = {disrupter: null, innocell: null, coil: null}, disrupter, loadingOverlay, warningBox;
    var vapingSound = null;
    var prev_picked = null;
    var reached_step4 = debug_mode;
    var remainingToLoad = 0;
    var totalToLoad = 0;

    var loadingMessageTexts = [
        'Innokin Disrupter 50W & InnokinCell', 'Choose Your Combo !', 'Please wait a moment. Thank you!', 'Loading...'
    ];

    var loadingMessageText = "Loading: Innokin Distrupter 50W & InnokinCell - Choose Your Combo ! Please wait a moment. Thank you!";

    var resource_base = './disruptor_glview/resources/';
    var sounds = {
        slide_in: {src: ['sounds/disrupter_lock.mp3', 'sounds/disrupter_lock.ogg'], obj: null},
        slide_out: {src: ['sounds/disrupter_unlock.mp3', 'sounds/disrupter_unlock.ogg'], obj: null},
    };
    var urls = [resource_base + "texture/envmap3.png", resource_base + "texture/envmap3.png",
        resource_base + "texture/envmap.png", resource_base + "texture/envmap2.png",
        resource_base + "texture/envmap3.png", resource_base + "texture/envmap3.png"];
    var urls_cr = [resource_base + "texture/envmap.png", resource_base + "texture/envmap.png",
        resource_base + "texture/envmap.png", resource_base + "texture/envmap.png",
        resource_base + "texture/envmap.png", resource_base + "texture/envmap.png"];
    var textureCube = THREE.ImageUtils.loadTextureCube(urls);
    textureCube.minFilter = THREE.LinearFilter;
    var textureCubeCrome = THREE.ImageUtils.loadTextureCube(urls_cr);
    textureCubeCrome.minFilter = THREE.LinearFilter;
    var current_step = 1;
    var from_step = 1;

    var config = {
        width: 830,
        height: 500,
        container: null
    };
    var step_buttons = [];
    var step4_tool_buttons = [];
    var completed_buttons = [];
    var materials = {
        blue_battery: {color: 0x005BBB, shininess: 30, specular: 0x0093EF, metal: true, side: THREE.DoubleSide},
        whiteblue_battery: {color: 0x72DCD4, shininess: 30, specular: 0x91D7DD, metal: true, side: THREE.DoubleSide},
        aquamarine_battery: {color: 0x72DCD4, shininess: 30, specular: 0x91D7DD, metal: true, side: THREE.DoubleSide},
        red_battery: {color: 0xC9153A, shininess: 30, specular: 0xEA4670, metal: true, side: THREE.DoubleSide},
        pink_battery: {color: 0xd71f85, shininess: 30, specular: 0xFA58BB, metal: true, side: THREE.DoubleSide},
        purple_battery: {color: 0xAC47B2, shininess: 30, specular: 0xC860CE, metal: true, side: THREE.DoubleSide},
        green_battery: {color: 0x009B3A, shininess: 30, specular: 0x4BC293, metal: true, side: THREE.DoubleSide},
        black_battery: {color: 0x111111, shininess: 30, specular: 0x3A393F, metal: true, side: THREE.DoubleSide},
        golden_material: {color: 0x746455, shininess: 30, specular: 0xE2D5C6, metal: true, side: THREE.DoubleSide},
        silver_material: {color: 0xB3B9C3, shininess: 30, specular: 0xDEDBE6, metal: true, side: THREE.DoubleSide},
        black_material: {color: 0x111111, shininess: 30, specular: 0x3A393F, metal: true, side: THREE.DoubleSide},
        grey_metal: {color: 0xCCCCCC, shininess: 50, specular: 0xBBBBBB, metal: true, side: THREE.DoubleSide},
        crome_metal: {color: 0xcccccc, shininess: 100, specular: 0xffffff, metal: true, side: THREE.DoubleSide, envMap: textureCubeCrome, combine: THREE.MultiplyOperation, reflectivity: 100},
        screws: {color: 0xCCCCCC, shininess: 50, specular: 0xAACCDD, metal: true, side: THREE.DoubleSide},
        connectors: {color: 0x9F8F53, shininess: 50, specular: 0xEAE0D7, metal: true, side: THREE.DoubleSide},
        texts: {color: 0x666666, shininess: 50, specular: 0xEAE0D7, metal: true, side: THREE.DoubleSide},
        logotexts: {color: 0xffffff},
        black_plastic: {color: 0x111111, shininess: 10, specular: 0xEAE0D7, metal: false, side: THREE.DoubleSide},
        coil: {color: 0xCCCCCC, shininess: 50, specular: 0xAACCDD, metal: true, side: THREE.DoubleSide},
        coil_glass: {color: 0xffffff, shininess: 10, specular: 0xDDDDDD, transparent: true, opacity: 0.2, side: THREE.DoubleSide, depthWrite: false},
        screen_transparent: {color: 0x009900, shininess: 10, specular: 0xFF00FF, transparent: true, opacity: 0.3, side: THREE.DoubleSide},
        defaultScreenBackground: {color: 0x33300F, shininess: 50, specular: 0x22A0C0, metal: true, side: THREE.DoubleSide},
        plastic_transparent: {color: 0xffffff, specular: 0xffffff, envMap: textureCube, combine: THREE.MultiplyOperation, transparent: true, opacity: 0.40, reflectivity: 30, shininess: 80},
        plastic_powled: {color: 0xffffff, specular: 0xffffff, envMap: textureCube, combine: THREE.MultiplyOperation, transparent: true, opacity: 0.90, reflectivity: 5, shininess: 40},
        plastic_black: {color: 0x111111, shininess: 50, specular: 0xffffff, side: THREE.DoubleSide},
        battery_bottom_text: {color: 0x222222, shininess: 1, specular: 0x333333, metal: true, side: THREE.DoubleSide},
    };
    var disrupter_matreials = [materials.silver_material, materials.golden_material, materials.black_material];
    var innocell_matreials = [materials.black_battery, materials.blue_battery, materials.pink_battery, materials.red_battery, materials.green_battery, materials.purple_battery, materials.whiteblue_battery];
    var toLoad = {
        disrupter:
                [
                    {model: 'obj/disrupter_shell_magnet.obj', type: 'obj', name: '', material: materials.grey_metal},
                    {model: 'obj/disrupter_shell_magnet2.obj', type: 'obj', name: '', material: materials.grey_metal},
                    {model: 'obj/upper_shell_lid.obj', type: 'obj', name: '', material: materials.grey_metal},
                    {model: 'obj/upper_shell_lid_coil_socket.obj', type: 'obj', name: '', material: materials.connectors},
                    {model: 'obj/disrupter_bottom.obj', type: 'obj', name: '', material: materials.grey_metal},
                    {model: 'obj/connector_1.obj', type: 'obj', name: '', material: materials.silver_material},
                    {model: 'obj/connector_2.obj', type: 'obj', name: '', material: materials.connectors},
                    {model: 'obj/disrupter_screws.obj', type: 'obj', name: '', material: materials.screws},
                    {model: 'obj/disrupter_bottom_screws.obj', type: 'obj', name: '', material: materials.screws},
                    {model: 'obj/disrupter_ce_text.obj', type: 'obj', name: '', material: materials.texts},
                    {model: 'obj/lcd_glass.obj', type: 'obj', name: '', material: materials.screen_transparent},
                    {model: 'obj/power_button_led_ring.obj', type: 'obj', name: 'power_led', material: materials.plastic_black},
                    {model: 'obj/disrupter_shell.obj', type: 'obj', name: 'mod_shell', material: disrupter_matreials[0]},
                    {model: 'obj/power_button.obj', type: 'obj', name: 'startbutton', material: materials.silver_material},
                    {model: 'obj/up_button.obj', type: 'obj', name: 'up_button', material: materials.silver_material},
                    {model: 'obj/down_button.obj', type: 'obj', name: 'down_button', material: materials.silver_material},
                    {model: 'obj/olcd.dae', type: 'collada', name: 'olcd', material: materials.defaultScreenBackground},
                    {model: 'obj/screen_frame.obj', type: 'obj', name: 'olcd_frame', material: materials.silver_material}
                ],
        innocell:
                [
                    {model: 'obj/battery.obj', type: 'obj', name: '', material: materials.black_battery},
                    {model: 'obj/battery_2.obj', type: 'obj', name: '', material: materials.black_battery},
                    {model: 'obj/battery_usb.obj', type: 'obj', name: '', material: materials.grey_metal},
                    {model: 'obj/battery_upper_lid.obj', type: 'obj', name: '', material: materials.grey_metal},
                    {model: 'obj/battery_bottom.obj', type: 'obj', name: '', material: materials.grey_metal},
                    {model: 'obj/innocell_text.obj', type: 'obj', name: '', material: materials.logotexts},
                    {model: 'obj/battery_srews.obj', type: 'obj', name: '', material: materials.screws},
                    {model: 'obj/battery_lid_screws.obj', type: 'obj', name: '', material: materials.screws},
                    {model: 'obj/battery_bottom_screws.obj', type: 'obj', name: '', material: materials.screws},
                    {model: 'obj/battery_bottom_text.obj', type: 'obj', name: '', material: materials.battery_bottom_text},
                    {model: 'obj/battery_shell.obj', type: 'obj', name: 'battery_shell', material: innocell_matreials[0]}
                ],
        isub_coil02ohm:
                [
                    //{model:'obj/coil.obj',type:'obj', name : '', material :  materials.grey_metal}, //original coil
                    //{model:'obj/coil_glass.obj',type:'obj', name : 'coil_glass', material : materials.coil_glass} //original coil glass
                    {model: 'obj/coil2.obj', type: 'obj', name: '', material: materials.crome_metal}, //centered coil
                    {model: 'obj/coil2_glass.obj', type: 'obj', name: 'coil_glass', material: materials.coil_glass}, //centered coil glass
                    {model: 'obj/logo_sipca.obj', type: 'obj', name: 'coil_logo', material: materials.plastic_black} //centered coil glass

                ],
        tabletop: [
            {model: 'obj/carousel_top.obj', type: 'obj', name: 'carousel', material: materials.plastic_transparent},
            {model: 'obj/carousel_bottom.obj', type: 'obj', name: 'carousel', material: materials.black_material},
        ]
    }


    var mouse = new THREE.Vector3();
    var coil_ohms = ['0.5', '2.0'];
    var steps = {
        1: {title: 'Choose Your Disrupter!', choose: 'disrupter', clones: []},
        2: {title: 'Choose Your InnokinCell!', choose: 'innocell', clones: []},
        3: {title: 'Choose your iSub Coil', choose: 'isub_coil', clones: [], instructions: {ohms: {'0.5': '0.5Ω : Big Clouds', '2.0': '2.0Ω Intense Flavors'}}},
        4: {title: 'VAPE!', icon: 'setp4-logo'}
    }

    var olcd = null;
    var UI = {
        title: undefined,
        wrapper: undefined
    };

    ///////////////////////////////////////////////////////////////////////////
    var device_variables = {
        ohmz: 5,
        volt: 0,
        watt: 160,
        battery: 1000,
    }
    var device_status = "OFF";
    var device_state = 'watt';
    var startButtonCounter = 0;
    var startButtonCounter2 = 0;
    //SMOKE PART

    var is_zoomed_to_oled = false;
    var vaping_sound = null;
    var vapingSoundVolume = 10;
    var playSmoke = null;
    var removeSmoke = null;
    var smoking = false;
    var ammount_of_ms_to_press = 100;
    var resetTimeout = null;
    var fifteen_sec_timer = null;
    var configuration_complete = false;
    var configuration_complete_timer = null;
    var bypassed_device_start = false;
    var redirectUrlAfterCompleted = "http://www.innokin.com";
    var removeWarningTimeout = null;
    var warningBoxesHaveTimeout = false;
    var removeWarningTimeoutAmmount = 3000;
//END SMOKE PART
    ///////////////////////////////////////////////////////////////////////////
    window.requestAnimationFrame = (function ()
    {
        return window.requestAnimationFrame ||
                window.mozRequestAnimationFrame ||
                window.webkitRequestAnimationFrame ||
                window.oRequestAnimationFrame ||
                window.msRequestAnimationFrame ||
                function (callback) {
                    return window.setTimeout(function () {
                        callback(new Date());
                    }, 1000 / 60);
                };
    })();
    window.cancelAnimationFrame = window.cancelAnimationFrame || window.mozCancelAnimationFrame || window.webkitCancelAnimationFrame || function (requestId) {
        clearTimeout(requestId);
    };
    var animations = {
        popout_object: function (obj, target_y) {
            new TWEEN.Tween(obj.position).to({
                y: target_y
            }, 50).start();
        },
        coil_fadein: function () {
            disrupter_groups['isub_coil02ohm'].rotation.set(0, 0, 0);
            disrupter_groups['isub_coil02ohm'].position.set(0, 0, 0);
            disrupter_groups['isub_coil02ohm'].traverse(
                    function (child) {
                        if (child instanceof THREE.Mesh) {
                            new TWEEN.Tween(child.material).to({
                                opacity: child.parent.name == 'coil_glass' ? materials.coil_glass.opacity : 1
                            }, 300).start();
                        }
                    }
            );
        },
        coil_fadeout: function () {
            disrupter_groups['isub_coil02ohm'].rotation.set(0, 0, 0);
            disrupter_groups['isub_coil02ohm'].position.set(0, 0, 0);
            disrupter_groups['isub_coil02ohm'].traverse(
                    function (child) {
                        if (child instanceof THREE.Mesh) {
                            child.material.transparent = true;
                            new TWEEN.Tween(child.material).to({
                                opacity: 0
                            }, 300).start();
                        }
                    }
            );
        },
        explode_disrupter: function () {
            resetDisrupterTransforms();
            disrupter_groups['innocell'].position.x = -30;
            new TWEEN.Tween(disrupter_groups['innocell'].position).to({
                x: 0
            }, 300).start();
            new TWEEN.Tween(disrupter_groups['isub_coil02ohm'].position).to({
                y: 30
            }, 300).start();
        },
        implode_disrupter: function () {
            resetDisrupterTransforms();
            disrupter_groups['isub_coil02ohm'].position.y = 30;
            new TWEEN.Tween(disrupter_groups['innocell'].position).to({
                x: -30
            }, 300).start();
            new TWEEN.Tween(disrupter_groups['isub_coil02ohm'].position).to({
                y: 0
            }, 300).start();
        },
        change_battery: function () {
            resetDisrupterTransforms();
            disrupter_groups['innocell'].position.x = -30;
            var cellout = new TWEEN.Tween(disrupter_groups['innocell'].position).to({
                y: 400
            }, 500);
            var cellin = new TWEEN.Tween(disrupter_groups['innocell'].position).to({
                y: 0
            }, 500);
            cellout.chain(cellin);
            cellout.start();
        },
        zoom_to_oled_new: function () {

            var groupTween = new TWEEN.Tween(disrupter.rotation).to({
                z: -Math.PI / 2,
                x: Math.PI / 2,
            }, 800).start();
            new TWEEN.Tween(disrupter.position).to({
                x: -60,
                z: -10,
                y: 30
            }, 800).start();
            new TWEEN.Tween(camera.position).to({x: -13.676161925598056, y: 63.9452391807378, z: 87.23723124674612}, 900).start();
            new TWEEN.Tween(camera.rotation).to({x: -0.22118710812447032, y: -0.015007889761138695, z: -0.003374627986400691}, 900).start();
            var ctw = new TWEEN.Tween(orbitcntrl.center).to({x: -11.891589041561836, y: 37.85999917667022, z: -28.76614107973018}, 900);
            ctw.onComplete(function () {
                orbitcntrl.update();
            });
            ctw.start();
            is_zoomed_to_oled = true;
        },
        zoom_to_fullview: function () {
            var camera_mode_boti = false;
            var zoomAmountModifier = 1.3;

            var groupTween = new TWEEN.Tween(disrupter.rotation).to({
                z: 0,
                x: 0,
                y: 0
            }, 800).start();
            new TWEEN.Tween(disrupter.position).to({
                x: 0,
                z: 0,
                y: 0

            }, 800).start();
            if (camera_mode_boti) {
                //animate camera
                new TWEEN.Tween(camera.position).to({
                    x: -144.20119763765334 * zoomAmountModifier,
                    y: 111.2972966087502 * zoomAmountModifier,
                    z: 121.55749190834881 * zoomAmountModifier
                }, 900).start();


                new TWEEN.Tween(camera.rotation).to({
                    x: -0.2854704053759189,
                    y: -0.8427679017865717,
                    z: -0.2156764559473396
                }, 900).start();
                var ctw = new TWEEN.Tween(orbitcntrl.center).to({
                    x: 11.859650548162842 * zoomAmountModifier,
                    y: 72.12312221743433 * zoomAmountModifier,
                    z: -11.921155841890096 * zoomAmountModifier
                }, 900);
            } else {
                //Camera Moved Up
                new TWEEN.Tween(camera.position).to({
                    x: -162.89341428011286,
                    y: 77.50758564332119,
                    z: 106.12346383427874
                }, 900).start();
                new TWEEN.Tween(camera.rotation).to({
                    x: -0.17451959700297856,
                    y: -0.8632528487934686,
                    z: -0.13319779834142856
                }, 900).start();
                var ctw = new TWEEN.Tween(orbitcntrl.center).to({
                    x: -3.0760860807863835,
                    y: 53.77403961387587,
                    z: -28.486663090380713
                }, 900);
//                T…E.Vector3 {x: -162.89341428011286, y: 77.50758564332119, z: 106.12346383427874}
//                 T…E.Euler {_x: -0.17451959700297856, _y: -0.8632528487934686, _z: -0.13319779834142856, _order: "XYZ"}
//                  T…E.Vector3 {x: -3.0760860807863835, y: 53.77403961387587, z: -28.486663090380713}
//                   T…E.Vector3 {x: -3.0760860807863835, y: 53.77403961387587, z: -28.486663090380713}
            }




            ctw.onComplete(function () {
                orbitcntrl.update();
            });
            ctw.start();
            is_zoomed_to_oled = false;
        },
        step: {
            1: {
                'in': function (cb) {

                    var delay = 800 / steps[1].clones.length;
                    var last = steps[1].clones.length - 1;
                    for (var ci = 0; ci < steps[1].clones.length; ci++) {
                        steps[1].clones[ci].position.y = 400;
                        steps[1].clones[ci].rotation.y = 0;
                        new TWEEN.Tween(steps[1].clones[ci].rotation).to({y: Math.PI / 4}, delay).delay(ci * delay).start();
                        var tw = new TWEEN.Tween(steps[1].clones[ci].position).to({y: 0}, delay).delay(ci * delay);
                        if ((typeof (cb) == 'function') && last == ci) {
                            tw.onComplete(cb);
                        }
                        tw.start();
                    }

                    //animate camera
                    new TWEEN.Tween(camera.position).to({
                        x: 7.4252,
                        y: 84.2356,
                        z: 163.364
                    }, 800).start();
                    new TWEEN.Tween(camera.rotation).to({
                        x: -0.1473,
                        y: 0.04493,
                        z: 0.00666
                    }, 800).start();
                    var ctw = new TWEEN.Tween(orbitcntrl.center).to({
                        x: 0,
                        y: 60,
                        z: 0
                    }, 800);
                    ctw.onComplete(function () {
                        orbitcntrl.update();
                    });
                    ctw.start();
                },
                'out': function (cb) {
                    var delay = 1000 / steps[1].clones.length;
                    var last = steps[1].clones.length - 1;
                    var skip = steps[1].clones.indexOf(current_choice['disrupter']);
                    var clones = steps[1].clones.slice(0);
                    var dmul = 0;
                    if (skip > -1) {
                        new TWEEN.Tween(steps[1].clones[skip].rotation).to({y: 0}, delay).start();
                        new TWEEN.Tween(steps[1].clones[skip].position).to({y: 400}, delay).start();
                        clones.splice(skip, 1);
                        dmul = 1;
                    }
                    while (clones.length) {
                        var cln = clones.shift();
                        new TWEEN.Tween(cln.rotation).to({y: 0}, delay).delay(dmul * delay).start();
                        var tw = new TWEEN.Tween(cln.position).to({y: 400}, delay).delay(dmul * delay);
                        dmul++;
                        if ((typeof (cb) == 'function') && !clones.length) {
                            tw.onComplete(cb);
                        }
                        tw.start();
                    }
                }
            },
            2: {
                'in': function (cb) {
                    var cameraPositionZoom = 0.8;
                    var duration = 1500;
                    var tw = new TWEEN.Tween(disrupter_groups['tabletop'].rotation).to({
                        y: disrupter_groups['tabletop'].rotation.y - (2 * Math.PI)
                    }, duration);
                    if (typeof (cb) == 'function') {
                        tw.onComplete(cb);
                    }
                    tw.start();
                    var delay = duration / steps[2].clones.length;
                    for (var ci = 0; ci < steps[2].clones.length; ci++) {
                        steps[2].clones[ci].position.y = 300;
                        new TWEEN.Tween(steps[2].clones[ci].position).to({
                            y: 21
                        }, delay).delay(ci * delay).start();
                    }
                    //animate camera
                    new TWEEN.Tween(camera.position).to({
                        x: 2.13455 * cameraPositionZoom,
                        y: 178.7043 * cameraPositionZoom,
                        z: 281.966 * cameraPositionZoom
                    }, duration).start();
                    new TWEEN.Tween(camera.rotation).to({
                        x: -0.39847,
                        y: 0.006977,
                        z: 0.00293723
                    }, duration).start();
                    var ctw = new TWEEN.Tween(orbitcntrl.center).to({
                        x: 0 * cameraPositionZoom,
                        y: 60 * cameraPositionZoom,
                        z: 0 * cameraPositionZoom
                    }, duration);
                    ctw.onComplete(function () {
                        orbitcntrl.update();
                    });
                    ctw.start();
                },
                'out': function (cb) {
                    var duration = 1500;
                    var tw = new TWEEN.Tween(disrupter_groups['tabletop'].rotation).to({
                        y: disrupter_groups['tabletop'].rotation.y + (2 * Math.PI)
                    }, duration);
                    if (typeof (cb) == 'function') {
                        tw.onComplete(cb);
                    }
                    tw.start();
                    var delay = duration / steps[2].clones.length;
                    var cnt = steps[2].clones.length;
                    var start = steps[2].clones.indexOf(current_choice['innocell']);
                    start = (start != -1) ? start : (steps[2].clones.length - 1)
                    for (var ci = start, ci2 = 0; ci >= 0; ci--, ci2++) {
                        steps[2].clones[ci].position.y = 21;
                        new TWEEN.Tween(steps[2].clones[ci].position).to({
                            y: 300
                        }, delay).delay(ci2 * delay).start();
                    }
                    for (var ci = steps[2].clones.length - 1; ci > start; ci--, ci2++) {
                        steps[2].clones[ci].position.y = 21;
                        new TWEEN.Tween(steps[2].clones[ci].position).to({
                            y: 300
                        }, delay).delay(ci2 * delay).start();
                    }
                }
            },
            3: {
                'in': function (cb) {
                    var delay = 800 / steps[1].clones.length;
                    var last = steps[3].clones.length - 1;
                    for (var ci = 0; ci < steps[3].clones.length; ci++) {
                        steps[3].clones[ci].position.y = 300;
                        var tw = new TWEEN.Tween(steps[3].clones[ci].position).to({y: 0}, delay).delay(ci * delay);
                        if ((typeof (cb) == 'function') && last == ci) {
                            tw.onComplete(cb);
                        }
                        tw.start();
                    }

                    //animate camera
                    new TWEEN.Tween(camera.position).to({
                        x: 7.44418,
                        y: 161.250269,
                        z: 147.11240281
                    }, 400).start();
                    new TWEEN.Tween(camera.rotation).to({
                        x: -0.225372,
                        y: -0.005534,
                        z: -0.00127
                    }, 400).start();
                    var ctw = new TWEEN.Tween(orbitcntrl.center).to({
                        x: 8.4538,
                        y: 120.4814,
                        z: -30.71046
                    }, 400);
                    ctw.onComplete(function () {
                        orbitcntrl.update();
                    });
                    ctw.start();
                },
                'out': function (cb) {
                    var delay = 800 / steps[3].clones.length;
                    var skip = steps[3].clones.indexOf(current_choice['coil']);
                    var clones = steps[3].clones.slice(0);
                    var dmul = 0;
                    if (skip > -1) {
                        new TWEEN.Tween(clones[skip].position).to({y: 300}, delay).start();
                        clones.splice(skip, 1);
                        dmul = 1;
                    }

                    while (clones.length) {
                        var cln = clones.shift();
                        var tw = new TWEEN.Tween(cln.position).to({y: 300}, delay).delay(dmul * delay);
                        dmul++;
                        if ((typeof (cb) == 'function') && !clones.length) {
                            tw.onComplete(cb);
                        }
                        tw.start();
                    }
                }
            },
            4: {
                'in': function (cb) {
                    resetDisrupterTransforms();
                    disrupter.rotation.set(0, 0, 0);
                    disrupter.position.set(0, 0, 0);
                    disrupter_groups['disrupter'].position.x = -400;
                    var modTween = new TWEEN.Tween(disrupter_groups['disrupter'].position).to({
                        x: 0
                    }, 300);
                    disrupter_groups['isub_coil02ohm'].position.y = 250;
                    var subtween = new TWEEN.Tween(disrupter_groups['isub_coil02ohm'].position).to({
                        y: 0
                    }, 300);
                    disrupter_groups['innocell'].position.x = -30;
                    disrupter_groups['innocell'].position.y = 400;
                    var cell_stg1 = new TWEEN.Tween(disrupter_groups['innocell'].position).to({
                        y: 100
                    }, 300);
                    cell_stg1.onComplete(function () {
                        try {
                            sounds.slide_in.obj.play();
                        } catch (e) {
                        }
                    });
                    var tw = new TWEEN.Tween(disrupter_groups['innocell'].position).to({
                        y: 0
                    }, 100);
                    tw.onComplete(
                            function () {
                                animations.zoom_to_oled_new();
                            }
                    );
                    modTween.chain(subtween);
                    cell_stg1.chain(tw);
                    subtween.chain(cell_stg1);
                    modTween.start();
                    //animate camera stage 1
                    new TWEEN.Tween(camera.position).to({
                        x: -133.1346,
                        y: 108.2085,
                        z: 207.3575
                    }, 900).start();
                    new TWEEN.Tween(camera.rotation).to({
                        x: -0.13705,
                        y: -0.58042,
                        z: -0.0755
                    }, 900).start();
                    var ctw = new TWEEN.Tween(orbitcntrl.center).to({
                        x: 21.723,
                        y: 75.946,
                        z: -26.5752
                    }, 900);
                    ctw.onComplete(function () {
                        orbitcntrl.update();
                    });
                    ctw.start();
                },
                'out': function (cb) {
                    resetDisrupterTransforms();
                    /////////////////////////////
                    var groupTween = new TWEEN.Tween(disrupter.rotation).to({
                        z: 0,
                        x: 0,
                        y: 0
                    }, 800);
                    new TWEEN.Tween(disrupter.position).to({
                        x: 0,
                        z: 0,
                        y: 0

                    }, 800).start();
                    groupTween.onComplete(function () {
                        try {
                            sounds.slide_out.obj.play();
                        } catch (e) {
                        }
                        var modTween = new TWEEN.Tween(disrupter_groups['disrupter'].position).to({
                            x: -400
                        }, 300);
                        var subtween = new TWEEN.Tween(disrupter_groups['isub_coil02ohm'].position).to({
                            y: 250
                        }, 300);
                        var tw = new TWEEN.Tween(disrupter_groups['innocell'].position).to({
                            x: -30,
                            y: 400
                        }, 300);
                        tw.chain(subtween);
                        subtween.chain(modTween);
                        if (typeof (cb) == 'function') {
                            modTween.onComplete(cb)
                        }
                        try {
                            sounds.slide_out.obj.play();
                        } catch (e) {
                        }
                        tw.start();
                    });
                    groupTween.start()
                    //animate camera 
                    new TWEEN.Tween(camera.position).to({
                        x: -133.1346,
                        y: 108.2085,
                        z: 207.3575
                    }, 600).start();
                    new TWEEN.Tween(camera.rotation).to({
                        x: -0.13705,
                        y: -0.58042,
                        z: -0.0755
                    }, 600).start();
                    var ctw = new TWEEN.Tween(orbitcntrl.center).to({
                        x: 21.723,
                        y: 75.946,
                        z: -26.5752
                    }, 600);
                    ctw.onComplete(function () {
                        orbitcntrl.update();
                    });
                    ctw.start();
                }
            }
        }
    };
    /* private functions */
    function getMousePos(evt) {
        var rect = renderer.domElement.getBoundingClientRect();
        if (evt.type == 'touchend')
            return mouse; //return the last mouse coordinate;
        if (evt.touches) {
            mouse.x = 2 * ((evt.touches[0].clientX - rect.left) / renderer.domElement.width) - 1;
            mouse.y = 1 - 2 * ((evt.touches[0].clientY - rect.top) / renderer.domElement.height);
        } else {
            mouse.x = 2 * ((evt.clientX - rect.left) / renderer.domElement.width) - 1;
            mouse.y = 1 - 2 * ((evt.clientY - rect.top) / renderer.domElement.height);
        }
        return mouse;
    }

    function _handleStepChange(evt) {
        if (reached_step4) {
            var data = parseInt(evt.target.getAttribute("data-step"));
            if (!isNaN(data)) {
                if (data != current_step) {
                    setStep(data);
                }
            }
        }
        if (evt.preventDefault) {
            evt.preventDefault();
        }
        return false;
    }

    function _handleStepTools(evt) {
        var action = evt.target.getAttribute("data-action");
        switch (action) {
            case 'zoom-full':
                zoomFullView();
                break;
            case 'zoom-oled':
                zoomOled();
                break;
            case 'completed':
                completedButtonAction();
                break;
            case 'change-mod-color':
                var idx = parseInt(evt.target.getAttribute("data-coloridx"), 10);
                if (!isNaN(idx)) {
                    var shell = steps[1]['clones'][idx].getObjectByName('mod_shell');
                    var material;
                    shell.traverse(function (child) {
                        if (child instanceof THREE.Mesh) {
                            material = child.material;
                        }
                    });
                    shell = disrupter_groups['disrupter'].getObjectByName('mod_shell');
                    shell.traverse(function (child) {
                        if (child instanceof THREE.Mesh) {
                            child.material = material;
                        }
                    });
                    current_choice['disrupter'] = steps[1]['clones'][idx];
                }
                break;
            case 'change-cell-color':
                var idx = parseInt(evt.target.getAttribute("data-coloridx"), 10);
                if (!isNaN(idx)) {
                    var shell = steps[2]['clones'][idx].getObjectByName('battery_shell');
                    var material;
                    shell.traverse(function (child) {
                        if (child instanceof THREE.Mesh) {
                            material = child.material;
                        }
                    });
                    shell = disrupter_groups['innocell'].getObjectByName('battery_shell');
                    shell.traverse(function (child) {
                        if (child instanceof THREE.Mesh) {
                            child.material = material;
                        }
                    });
                    current_choice['innocell'] = steps[2]['clones'][idx];
                }
                break;
        }
        if (evt.preventDefault) {
            evt.preventDefault();
        }
        return false;
    }

    function _handleEvents(evt) {
        switch (evt.type) {
            case 'mousedown':
            case 'touchstart':
            case 'pointerdown':
                getMousePos(evt);
                var picked = pick();
                var pop_y = 15;
                if (picked) {
                    while (!(picked.parent instanceof THREE.Group)) {
                        picked = picked.parent;
                    }

//                    var next_step = reached_step4 ? 4 : (current_step + 1);
                    var next_step = current_step + 1;
                    switch (current_step) {
                        case 1:
                            if (picked.name == 'disrupter') {
                                if (picked.position.y == pop_y) {
                                    current_choice.disrupter = picked;
                                    var pmaterial;
                                    var pshell = picked.getObjectByName('mod_shell');
                                    pshell.traverse(function (child) {
                                        if (child instanceof THREE.Mesh) {
                                            pmaterial = child.material;
                                        }
                                    });
                                    disrupter_groups['disrupter'].getObjectByName('mod_shell').traverse(function (child) {
                                        if (child instanceof THREE.Mesh) {
                                            child.material = pmaterial;
                                        }
                                    });
                                    setStep(next_step);
                                } else {
                                    if (prev_picked && prev_picked.name == 'disrupter') {
                                        animations.popout_object(prev_picked, 0);
                                    }
                                    animations.popout_object(picked, pop_y);
                                    prev_picked = picked;
                                }
                            }
                            break;
                        case 2:
                            if (picked.name == 'innocell') {
                                if (picked.position.y == (pop_y + 21)) {
                                    current_choice['innocell'] = picked;
                                    var pmaterial;
                                    var pshell = picked.getObjectByName('battery_shell');
                                    pshell.traverse(function (child) {
                                        if (child instanceof THREE.Mesh) {
                                            pmaterial = child.material;
                                        }
                                    });
                                    disrupter_groups['innocell'].getObjectByName('battery_shell').traverse(function (child) {
                                        if (child instanceof THREE.Mesh) {
                                            child.material = pmaterial;
                                        }
                                    });
                                    setStep(next_step);
                                } else {
                                    if (prev_picked && prev_picked.name == 'innocell') {
                                        animations.popout_object(prev_picked, 21);
                                    }
                                    animations.popout_object(picked, pop_y + 21);
                                    prev_picked = picked;
                                }
                            }
                            break;
                        case 3:
                            if (picked.name == 'isub_coil02ohm') {
                                if (picked.position.y == pop_y) {
                                    current_choice['coil'] = picked;
                                    //Set Device Variables to Specified Ohmage Chosen
                                    device_variables.ohmz = picked.userData.ohms * 10;
                                    //If device is on ,refresh the screen @ this moment
                                    if (device_status === "ON") {
                                        refreshDisruptorInformations();
                                        showWarningBox();
                                    }
                                    reached_step4 = true;
                                    setStep(next_step);
                                } else {
                                    if (prev_picked && prev_picked.name == 'isub_coil02ohm') {
                                        animations.popout_object(prev_picked, 0);
                                    }
                                    animations.popout_object(picked, pop_y);
                                    prev_picked = picked;
                                }
                            }
                            break;
                        case 4:
                            switch (picked.name) {
                                case 'startbutton':

//                                    console.log("BIGBUTTONPRESS");
                                    if (device_status == 'OFF') {
                                        startButtonClick();
                                    } else {
                                        startButtonClickedDeviceStarted();
                                    }
                                    break;
                                case 'up_button':
//                                    console.log("UPBUTTON");
                                    minusButtonClick();
                                    break;
                                case 'down_button':
//                                    console.log("DOWNBUTTON");
                                    plusButtonClick();

                                    break;
                            }
                            break;
                    }
                }
                break;
            case 'mouseup':
            case 'touchend':
            case 'pointerup':
                resetButtonPositions();
                break;
            default:
        }
        return false;
    }

    function pick() {
        if (disrupter_buttons.length) {
            raycaster.setFromCamera(mouse, camera);
            var intersects = raycaster.intersectObjects(current_pick_set, true);
            if (intersects.length) {
                return intersects[0]['object'];
            }
        }
        return false;
    }

    function animate() {
        requestAnimationFrame(animate);
        render(clock.getDelta());
        TWEEN.update();
    }

    function render(dt) {
        //orbitcntrl.update();
        cameraLight.position.x = camera.position.x;
        cameraLight.position.y = camera.position.y;
        cameraLight.position.z = camera.position.z;
        TWEEN.update();
        if (particleGroup) {
            particleGroup.tick(dt);
        }
        renderer.render(scene, camera);
    }

    function applyUConfig(uconfig) {
        if (!uconfig) {
            config.container = config.container ? config.container : document.body;
            return false;
        }
        uconfig.width = parseInt(uconfig.width);
        uconfig.height = parseInt(uconfig.height);
        config.width = isNaN(uconfig.width) ? config.width : uconfig.width;
        config.height = isNaN(uconfig.height) ? config.height : uconfig.height;
        if (uconfig.containerId) {
            var container = document.getElementById(uconfig.containerId);
            if (container) {
                config.container = container;
            }
        } else {
            config.container = config.container ? config.container : document.body;
        }
    }

    function LoadDisruptorObjects() {
        for (var group in toLoad) {
            disrupter_groups[group] = new THREE.Group();
            disrupter_groups[group]['name'] = group;
            disrupter_groups[group]['visible'] = false;
            scene.add(disrupter_groups[group]);
            remainingToLoad += toLoad[group].length;
            totalToLoad += toLoad[group].length;
            while (toLoad[group].length) {
                var part = toLoad[group].shift()
                loadDisruptorPart(part, group);
            }
        }
    }

    function loadDisruptorPart(part, group) {
        var loaderClass;
        switch (part['type']) {
            case 'collada':
                loaderClass = THREE.ColladaLoader;
                break;
            case 'obj':
                loaderClass = THREE.OBJLoader;
                break;
        }
        var loader = new loaderClass();
        if (part['type'] == 'collada') {
            loader.options.convertUpAxis = true;
        }
        loader.load(resource_base + part['model'], function (imported) {
            var imp_obj = imported.scene ? imported.scene : imported;
            disrupter_groups[group].add(imp_obj);
            remainingToLoad -= 1;
            //set the material
            if (part.material) {
                var material = new THREE.MeshPhongMaterial(part.material);
                imp_obj.traverse(function (child) {
                    if (child instanceof THREE.Mesh) {
                        child.material = material;
                        /*child.castShadow = true;
                         child.receiveShadow = false;*/
                    }
                });
            }
            if (part.name === 'olcd') {
                var material = new THREE.MeshPhongMaterial(part.material);
                imp_obj.traverse(function (child) {

                    if (child instanceof THREE.Mesh) {
                        child.material = material;
//                        var box = new THREE.Box3().setFromObject(child);
//                        var bsz = box.size();
//                        olcd = new InnokinLCD(512, 176, scene);
//                        child.material.map = olcd.texture();
//                        child.material.blending = THREE.MultiplyBlending;
//                        olcd.update();
                    }
                });
            }

            if (['startbutton', 'up_button', 'down_button'].indexOf(part.name) > -1) {
                disrupter_buttons.push(imp_obj.children[0]);
            }

            if (part.name) {
                imp_obj.name = part.name;
            }
            updateLoading();
            if (!remainingToLoad) {
                //disrupter_groups['innocell'].position.x = -15;
                //disrupter_groups['disrupter'].position.x = 15;
                //disrupter_groups['isub_coil02ohm'].position.x = 15;
                onLoadComplete()
            }
        });
    }

    function showLoading() {
        loadingOverlay = document.getElementById('WebglLoadingOverlay');
        if (!loadingOverlay) {
            loadingOverlay = document.createElement('div');
            loadingOverlay.className = 'loading-overlay';
            loadingOverlay.id = 'WebglLoadingOverlay';

            var progress = document.createElement('div');
            progress.className = 'progress-bar';
            var indicator = document.createElement('div');
            indicator.className = 'progress-indicator';
            indicator.id = 'progress-indicator';
            indicator.style.width = '0';
            progress.appendChild(indicator);
            loadingOverlay.appendChild(progress);
            var messageDiv = document.createElement('div');
            messageDiv.className = 'loading-message-div';
            messageDiv.id = 'loading-message-div';

            loadingOverlay.appendChild(messageDiv);
            UI.wrapper.appendChild(loadingOverlay);

            for (i = 0; i < loadingMessageTexts.length; i++) {
                var messageParagraph = document.createElement('span');
                messageParagraph.className = 'loading-message-text';
                messageParagraph.id = 'message-text-span-' + i;
                messageParagraph.textContent = loadingMessageTexts[i];
                messageDiv.appendChild(messageParagraph);
            }
        }
    }

    function removeWarningBox() {
        var warning_box_exists = document.getElementById('warningbox-button');
        if (warning_box_exists) {
            UI.wrapper.removeChild(warning_box_exists);
        }
    }

    function showWarningBox() {

        if (warningBoxesHaveTimeout) {
            clearTimeout(removeWarningTimeout);
        }

        var colour = null;
        var text = null;
        var red = "#FF0000";
        var green = "#00FF00";
        var blue = "#0000FF";
        var yellow = "#FFFF00";
        var lowText = "Too Low";
        var optimalText = "Optimal";
        var hotText = "Too Hot";
        switch (device_variables.ohmz) {
            case 5:
                if (device_variables.watt <= 180) {
                    colour = yellow;
                    text = lowText;
                } else if (device_variables.watt <= 350) {
                    colour = green;
                    text = optimalText;
                } else {
                    colour = red;
                    text = hotText;
                }
                break;
            case 20:
                if (device_variables.watt <= 80) {
                    colour = yellow;
                    text = lowText;
                } else if (device_variables.watt <= 150) {
                    colour = green;
                    text = optimalText;
                } else {
                    colour = red;
                    text = hotText;
                }
                break;
        }
        var warning_box_exists = document.getElementById('warningbox-button');
        if (!warning_box_exists) {
            var warningbox_btn = document.createElement('span');
            warningbox_btn.className = 'warningbox-button';
            warningbox_btn.id = 'warningbox-button';
            warningbox_btn.innerHTML = text;
            warningbox_btn.style.backgroundColor = colour;
            UI.wrapper.appendChild(warningbox_btn);
            if (warningBoxesHaveTimeout) {
                removeWarningTimeout = setTimeout(function () {
                    removeWarningBox();
                }, removeWarningTimeoutAmmount);
            }

        } else {
            warning_box_exists.style.backgroundColor = colour;
            warning_box_exists.innerHTML = text;
            if (warningBoxesHaveTimeout) {
                removeWarningTimeout = setTimeout(function () {
                    removeWarningBox();
                }, removeWarningTimeoutAmmount);
            }
        }
    }


    function hideLoading() {
        loadingOverlay = document.getElementById('WebglLoadingOverlay');
        if (loadingOverlay) {
            loadingOverlay.parentNode.removeChild(loadingOverlay);
        }
    }

    function updateLoading() {
        var indicator = document.getElementById('progress-indicator');
        var prgress = 1 - (remainingToLoad / totalToLoad);
        if (indicator) {
            indicator.style.width = (prgress * 100) + '%';
        } else {
            console.log(prgress * 100);
        }

    }

    function buildUI() {
        if (renderer) {
            UI.wrapper = document.createElement('div');
            UI.wrapper.className = 'disrupter-view-wrapper';
            renderer.domElement.className = 'disrupter-view-canvas';
            renderer.domElement.parentNode.appendChild(UI.wrapper);
            UI.wrapper.appendChild(renderer.domElement);
            UI.wrapper.style.width = renderer.domElement.width + 'px';
            //UI.wrapper.style.height = renderer.domElement.height+'px';
            UI.title = document.createElement('h4');
            UI.title.className = 'step-title';
            UI.title.id = 'WebGlViewerTitle';
            UI.title.innerHTML = steps[current_step]['title'];
            UI.wrapper.appendChild(UI.title);
            var sbh = document.createElement('span');
            sbh.className = 'step-button-holder';
            UI.wrapper.appendChild(sbh);
            var sbhi = document.createElement('span');
            sbhi.className = 'inner-holder';
            sbh.appendChild(sbhi);
            var evenst = ['mousedown', 'pointerdown', 'touchstart'];
            for (var i = 1; i <= 4; i++) {
                var btn = document.createElement('span');
                btn.className = 'step-button';
                btn.setAttribute('data-step', i);
                btn.innerHTML = steps[i]['icon'] ? '&nbsp;' : '<span class="step-no">' + i + '.</span> ' + steps[i]['title'];
                btn.className += steps[i]['icon'] ? ' ' + steps[i]['icon'] : '';
                sbhi.appendChild(btn);
                step_buttons.push(btn);
                for (var ei = 0; ei < evenst.length; ei++) {
                    btn.addEventListener(evenst[ei], _handleStepChange);
                }
            }

            //add step 4 tools buttons
            var step4_tools = ['zoom-full', 'zoom-oled'];
            for (var ti = 0; ti < step4_tools.length; ti++) {
                var tool_btn = document.createElement('span');
                tool_btn.className = 'step4-tool-button ' + step4_tools[ti];
                tool_btn.setAttribute('data-action', step4_tools[ti]);
                tool_btn.innerHTML = '&nbsp;';
                UI.wrapper.appendChild(tool_btn);
                for (var ei = 0; ei < evenst.length; ei++) {
                    tool_btn.addEventListener(evenst[ei], _handleStepTools);
                }
                step4_tool_buttons.push(tool_btn);
            }

            //ADD THE COMPLETE BUTTON TO THE PAGE AT STEP 4
            var step4_complete_btn = document.createElement('span');
            step4_complete_btn.className = 'completed-button';
            step4_complete_btn.id = 'completed-button';
            step4_complete_btn.setAttribute('data-action', 'completed');
            step4_complete_btn.innerHTML = '&nbsp;';
            UI.wrapper.appendChild(step4_complete_btn);
            for (var ei = 0; ei < evenst.length; ei++) {
                step4_complete_btn.addEventListener(evenst[ei], _handleStepTools);
            }
            completed_buttons.push(step4_complete_btn);


            //add color swatches
            var csw_mod = document.createElement('span');
            csw_mod.className = 'viewer-color-swatches';
            csw_mod.id = 'InnokinModSwatches';
            var csw_mod_ttl = document.createElement('span');
            csw_mod_ttl.className = 'part-title';
            csw_mod_ttl.innerHTML = 'Disrupter:';
            csw_mod.style.right = '30px';
            csw_mod.appendChild(csw_mod_ttl);
            for (var mcli = 0; mcli < disrupter_matreials.length; mcli++) {
                var swtch = document.createElement('span');
                swtch.className = 'color-swatch';
                swtch.style.backgroundColor = '#' + (0x1000000 | disrupter_matreials[mcli]['color']).toString(16).substring(1);
                swtch.setAttribute('data-action', 'change-mod-color');
                swtch.setAttribute('data-coloridx', mcli);
                swtch.innerHTML = '&nbsp;';
                csw_mod.appendChild(swtch);
                for (var ei = 0; ei < evenst.length; ei++) {
                    swtch.addEventListener(evenst[ei], _handleStepTools);
                }
            }
            step4_tool_buttons.push(csw_mod);
            UI.wrapper.appendChild(csw_mod);
            var csw_mod = document.createElement('span');
            csw_mod.className = 'viewer-color-swatches';
            csw_mod.id = 'InnokinCellSwatches';
            var csw_mod_ttl = document.createElement('span');
            csw_mod_ttl.className = 'part-title';
            csw_mod_ttl.innerHTML = 'InnokinCell:';
            csw_mod.style.left = '30px';
            csw_mod.appendChild(csw_mod_ttl);
            for (var mcli = 0; mcli < innocell_matreials.length; mcli++) {
                var swtch = document.createElement('span');
                swtch.className = 'color-swatch';
                swtch.style.backgroundColor = '#' + (0x1000000 | innocell_matreials[mcli]['color']).toString(16).substring(1);
                swtch.setAttribute('data-action', 'change-cell-color');
                swtch.setAttribute('data-coloridx', mcli);
                swtch.innerHTML = '&nbsp;';
                csw_mod.appendChild(swtch);
                for (var ei = 0; ei < evenst.length; ei++) {
                    swtch.addEventListener(evenst[ei], _handleStepTools);
                }
            }
            UI.wrapper.appendChild(csw_mod);
            step4_tool_buttons.push(csw_mod);
            showLoading();
        }
    }

    function resetDisrupterTransforms() {
        disrupter_groups['isub_coil02ohm'].rotation.set(0, 0, 0);
        disrupter_groups['isub_coil02ohm'].position.set(-22.5, 0, -3.5);
        disrupter_groups['disrupter'].rotation.set(0, 0, 0);
        disrupter_groups['disrupter'].position.set(0, 0, 0);
        disrupter_groups['innocell'].rotation.set(0, 0, 0);
        disrupter_groups['innocell'].position.set(-29.95, 0, 0);
    }

    function hideAllGroups() {
        for (var grp in disrupter_groups) {
            disrupter_groups[grp].visible = false;
        }
        for (var stp in steps) {
            if (steps[stp].clones) {
                for (var ci = 0; ci < steps[stp].clones.length; ci++) {
                    steps[stp].clones[ci].visible = false;
                }
            }
        }
    }

    function cloneDisrupterForStep1() {
        if (!steps[1]['clones'].length) {
            disrupter_groups['step1'] = new THREE.Group();
            disrupter_groups['step1']['name'] = 'step1';
            scene.add(disrupter_groups['step1']);
            var dx = 0;
            for (var di = 0; di < disrupter_matreials.length; di++) {
                var dclone = disrupter_groups['disrupter'].clone();
                disrupter_groups['step1'].add(dclone);
                var dir = (di % 2) ? 1 : -1;
                dx += di * 60 * dir;
                dclone.position.set(dx + 15, 0, 0);
                dclone.rotation.set(0, Math.PI / 4, 0);
                var shell = dclone.getObjectByName('mod_shell');
                if (shell) {
                    var mi = di % disrupter_matreials.length;
                    var material = new THREE.MeshPhongMaterial(disrupter_matreials[mi]);
                    shell.traverse(function (child) {
                        if (child instanceof THREE.Mesh) {
                            child.material = material;
                        }
                    });
                }
                dclone.visible = false;
                steps[1]['clones'].push(dclone);
            }
            current_choice['disrupter'] = steps[1]['clones'][0];
        }
    }

    function cloneBatteryForStep2() {
        if (!steps[2]['clones'].length) {
            var wholeradians = Math.PI / 4;
            var positions = [
                [32.5, 21, 4],
                [26, 21, -21],
                [4, 21, -32],
                [-20, 21, -25],
                [-32, 21, -4],
                [-25, 21, 20],
                [-4, 21, 32],
                [20.5, 21, 26]
            ];
            for (var di = 0; di < 8; di++) {
                var dclone = disrupter_groups['innocell'].clone();
                disrupter_groups['tabletop'].add(dclone);
                dclone.rotation.y = wholeradians * di;
                dclone.position.set(positions[di][0], positions[di][1], positions[di][2]);
                var shell = dclone.getObjectByName('battery_shell');
                if (shell) {
                    var mi = di % innocell_matreials.length;
                    var material = new THREE.MeshPhongMaterial(innocell_matreials[mi]);
                    shell.traverse(function (child) {
                        if (child instanceof THREE.Mesh) {
                            child.material = material;
                        }
                    });
                }
                dclone.visible = false;
                steps[2]['clones'].push(dclone);
            }
            current_choice['innocell'] = steps[2]['clones'][0];
        }
    }

    function createCoilOhmLabelStep3(text) {
        var textGeo = new THREE.TextGeometry(text, {
            size: 10,
            height: 2,
            curveSegments: 4,
            font: "droid sans",
            weight: 'normal',
            style: 'normal',
            bevelThickness: 1,
            bevelSize: 1,
            bevelEnabled: false,
            material: 0,
            extrudeMaterial: 1

        });
        textGeo.computeBoundingBox();
        material = new THREE.MeshPhongMaterial({color: 0xB3B9C3, shininess: 30, specular: 0xDEDBE6, metal: true, shading: THREE.FlatShading});
        var centerOffset = -0.5 * (textGeo.boundingBox.max.x - textGeo.boundingBox.min.x);
        var textMesh1 = new THREE.Mesh(textGeo, material);
        textMesh1.position.x = centerOffset;
        textMesh1.position.y = 60;
        textMesh1.position.z = 0;
        textMesh1.rotation.x = 0;
        textMesh1.rotation.y = 0;
        group = new THREE.Group();
        group.add(textMesh1);
        return group;
    }

    function cloneCoilForStep3() {
        if (!steps[3]['clones'].length) {
            disrupter_groups['step3'] = new THREE.Group();
            disrupter_groups['step3']['name'] = 'step3';
            scene.add(disrupter_groups['step3']);
            var dx = 0;
            for (var di = 0; di < coil_ohms.length; di++) {
                var dclone = disrupter_groups['isub_coil02ohm'].clone();
                disrupter_groups['step3'].add(dclone);
                var dir = (di % 2) ? 1 : -1;
                dclone.userData['ohms'] = coil_ohms[di];
                dx += di * 100 * dir;
                var cx = dclone.position.x;
                dclone.position.set(cx + dx - 25, 0, 0);
                dclone.rotation.set(0, 0, 0);
                //add ohm label
                var ohms = createCoilOhmLabelStep3(coil_ohms[di] + ' \u03A9');
                dclone.add(ohms);
                dclone.visible = false;
                steps[3]['clones'].push(dclone);
            }
            current_choice['coil'] = steps[3]['clones'][0];
        }
    }

    function setStepCameraPositions() {
        if (!debug_mode) {
            orbitcntrl.enabled = true;
            orbitcntrl.minAzimuthAngle = -Infinity;
            orbitcntrl.maxAzimuthAngle = Infinity;
            orbitcntrl.minPolarAngle = Math.PI / 3;
            orbitcntrl.maxPolarAngle = Math.PI / 2;
            switch (current_step) {
                case 1:
                    orbitcntrl.minAzimuthAngle = -Math.PI / 10;
                    orbitcntrl.maxAzimuthAngle = Math.PI / 10;
                    break;
                case 2:
//                    orbitcntrl.minPolarAngle = 0.9;
//                    orbitcntrl.maxPolarAngle = 0.9;
//                    orbitcntrl.minPolarAngle = 1.1;
//                    orbitcntrl.maxPolarAngle = 1.1;
//                    camera.position.x = camera.position.x * 1.5;
//                    camera.position.y = camera.position.y * 1.5;
//                    camera.position.z = camera.position.z * 1.5;
                    orbitcntrl.minPolarAngle = 1.25;
                    orbitcntrl.maxPolarAngle = 1.25;
                    orbitcntrl.update();
                    break
                case 3:
                    orbitcntrl.minAzimuthAngle = -Math.PI / 20;
                    orbitcntrl.maxAzimuthAngle = Math.PI / 20;
                    camera.position.set(2.13455, 178.7043, 281.966);
                    camera.rotation.set(-0.39847, 0.006977, 0.00293723);
                    orbitcntrl.center.set(0, 60, 0);
                    orbitcntrl.update();
                    break;
                case 4:
                    camera.position.set(7.4252, 84.2356, 163.364);
                    camera.rotation.set(-0.1473, 0.04493, 0.00666);
                    orbitcntrl.center.set(0, 60, 0);
                    orbitcntrl.maxPolarAngle = Math.PI;
                    orbitcntrl.minPolarAngle = 0;
                    orbitcntrl.update();
                    orbitcntrl.enabled = false;
            }
        } else {
            orbitcntrl.minPolarAngle = 0;
            orbitcntrl.maxPolarAngle = Math.PI;
            orbitcntrl.noPan = false;
        }
    }

    function switchViewStep(newstep) {
        from_step = current_step;
        newstep = parseInt(newstep);
        newstep = isNaN(newstep) || (newstep > 4) ? current_step : newstep;
        if (current_step != newstep) {

            current_step = newstep;
            hideAllGroups();
            setStepCameraPositions();
            switch (current_step) {
                case 1:
                    disrupter_groups['step1'].visible = true;
                    for (var ci = 0; ci < steps[current_step].clones.length; ci++) {
                        steps[current_step].clones[ci].visible = true;
                    }
                    current_pick_set = steps[current_step].clones;
                    break;
                case 2:
                    disrupter_groups['tabletop'].visible = true;
                    for (var ci = 0; ci < steps[current_step].clones.length; ci++) {
                        steps[current_step].clones[ci].visible = true;
                    }
                    current_pick_set = disrupter_groups['tabletop'].children;
                    break
                case 3:
                    disrupter_groups['step3'].visible = true;
                    for (var ci = 0; ci < steps[current_step].clones.length; ci++) {
                        steps[current_step].clones[ci].visible = true;
                    }
                    current_pick_set = steps[current_step].clones;
                    break;
                case 4:
                    disrupter_groups['innocell'].position.y = 0;
                    disrupter_groups['isub_coil02ohm'].position.y = 0;
                    disrupter_groups['disrupter'].position.y = 0;
                    disrupter_groups['innocell'].visible = true;
                    disrupter_groups['disrupter'].visible = true;
                    disrupter_groups['isub_coil02ohm'].visible = true;
                    current_pick_set = disrupter_buttons;
                    InnokinDisrupterViewer.displayStartInformation();
            }
            for (var sbi = 0; sbi < step_buttons.length; sbi++) {
                step_buttons[sbi].className = step_buttons[sbi].className.replace(/active/g, ' ').replace(/\s+/, ' ');
            }
            step_buttons[current_step - 1].className += ' active';
            document.getElementById('WebGlViewerTitle').innerHTML = steps[current_step]['title'];
            for (var sbi = 0; sbi < step4_tool_buttons.length; sbi++) {
                step4_tool_buttons[sbi].style.display = (current_step == 4) ? 'block' : 'none';
            }
        }
    }

    function onLoadComplete() {
        resetDisrupterTransforms();
        scene.remove(disrupter_groups['disrupter'], disrupter_groups['innocell'], disrupter_groups['isub_coil02ohm']);
        disrupter = new THREE.Group();
        disrupter.add(disrupter_groups['disrupter']);
        disrupter.add(disrupter_groups['innocell']);
        disrupter.add(disrupter_groups['isub_coil02ohm']);
        scene.add(disrupter);
        hideAllGroups();
        cloneDisrupterForStep1();
        cloneBatteryForStep2();
        cloneCoilForStep3();
        disrupter_groups['tabletop'].position.set(0, -21, 0);
        //disrupter_groups['tabletop'].rotation.y = Math.PI / 2;
        hideLoading();
        var tmp = current_step;
        current_step = 0;
        switchViewStep(tmp);
        animations.step[current_step]['in']();

        console.clear();
    }


    function addHelpers() {
        if (debug_mode) {
            orbitcntrl.minPolarAngle = 0;
            orbitcntrl.maxPolarAngle = Math.PI;
            orbitcntrl.noPan = false;
            camera.far = 1000;
            scene.traverse(function (child) {
                if (child instanceof THREE.DirectionalLight) {
                    scene.add(new THREE.DirectionalLightHelper(child, 20));
                }
            })
            var gridHelper = new THREE.GridHelper(300, 10);
            scene.add(gridHelper);
            var axisHelper = new THREE.AxisHelper(20);
            scene.add(axisHelper);
        }
    }

    function setStep(newstep) {
        TWEEN.removeAll();
        if (animations.step[current_step]) {
            animations.step[current_step]['out'](function () {
                switchViewStep(newstep);
                animations.step[current_step]['in']();
            });
        } else {
            switchViewStep(newstep);
        }
        if(newstep != 4){
            removeWarningBox();
        }
        console.clear();
    }

    function zoomOled() {
        if (current_step == 4) {
            TWEEN.removeAll();
            camera.position.set(7.4252, 84.2356, 163.364);
            camera.rotation.set(-0.1473, 0.04493, 0.00666);
            orbitcntrl.center.set(0, 60, 0);
            resetDisrupterTransforms();
            animations.zoom_to_oled_new();
            orbitcntrl.enabled = debug_mode ? true : false;
        }

    }
    function zoomFullView() {
        if (current_step == 4) {
            TWEEN.removeAll();
            resetDisrupterTransforms();
            animations.zoom_to_fullview();
            orbitcntrl.enabled = true;
            orbitcntrl.minAzimuthAngle = -Infinity;
            orbitcntrl.maxAzimuthAngle = Infinity;
            orbitcntrl.minPolarAngle = 0;
            orbitcntrl.maxPolarAngle = Math.PI;
        }
    }
    /* public test functions */
    this.getCamera = function () {
        console.log(camera.position, camera.rotation, orbitcntrl.center, orbitcntrl.target);
    };
    this.getRenderer = function () {
        return renderer;
    }

    this.getScene = function () {
        return scene;
    }
    this.zoom_oled = function () {
        zoomOled();
    };
    this.zoom_full = function () {
        zoomFullView();
    };
    /* public functions */
    this.Init = function (uconfig) {
        if (scene)
            return false;
        clock = new THREE.Clock();
        applyUConfig(uconfig);
        scene = new THREE.Scene();
        camera = new THREE.PerspectiveCamera(50, config.width / config.height, 1, 800);
        camera.position.z = 300;
        camera.position.y = 60;
        renderer = new THREE.WebGLRenderer({antialias: true, alpha: true});
        renderer.setSize(config.width, config.height);
        renderer.autoClear = false;
        renderer.gammaInput = true;
        renderer.gammaOutput = true;
        renderer.shadowMapEnabled = true;
        //renderer.sortObjects = false;
        config.container.appendChild(renderer.domElement);
        orbitcntrl = new THREE.OrbitControls(camera, renderer.domElement);
        orbitcntrl.noPan = true;
        orbitcntrl.noKeys = true;
        orbitcntrl.minDistance = 100;
        orbitcntrl.maxDistance = 500;
        orbitcntrl.maxPolarAngle = Math.PI / 2;
        orbitcntrl.minPolarAngle = Math.PI / 3;
        orbitcntrl.panUp(60);
        orbitcntrl.update();
        preloadFontForScreen();

        var listener = new THREE.AudioListener();
        camera.add(listener);
        vapingSound = new THREE.Audio(listener);
        vapingSound.panner.coneOuterGain = 1;
        vapingSound.load(resource_base + 'sounds/vaping.ogg');
        vapingSound.setRefDistance(1);
        vapingSound.setVolume(0);
        vapingSound.autoplay = true;
        vapingSound.updateMatrixWorld(0, 0, 0);



        //add the lights
        var lightIntensity = 0.15;
        var coord_mul = 2;
        var lightColor = 0xffffff;
        var light1 = new THREE.DirectionalLight(lightColor, lightIntensity);
        light1.position.set(300 * coord_mul, 300 * coord_mul, 0 * coord_mul);
        light1.name = 'StaticLight1';
        //light1.castShadow  = true;
        scene.add(light1);
        var light2 = new THREE.DirectionalLight(lightColor, lightIntensity);
        light2.position.set(0 * coord_mul, 300 * coord_mul, 300 * coord_mul);
        light2.name = 'StaticLight2';
        scene.add(light2);
        var light3 = new THREE.DirectionalLight(lightColor, lightIntensity);
        light3.position.set(0 * coord_mul, -300 * coord_mul, 300 * coord_mul);
        light3.name = 'StaticLight3';
        scene.add(light3);
        var light4 = new THREE.DirectionalLight(lightColor, lightIntensity);
        light4.position.set(-300 * coord_mul, 300 * coord_mul, 0 * coord_mul);
        light4.name = 'StaticLight4';
        scene.add(light4);
        var light5 = new THREE.DirectionalLight(lightColor, lightIntensity);
        light5.position.set(0 * coord_mul, -300 * coord_mul, -300 * coord_mul);
        light5.name = 'StaticLight5';
        scene.add(light5);
        /*var light = new THREE.AmbientLight( 0x404040 ); 
         scene.add( light );*/

        cameraLight = new THREE.PointLight(0xffffff, 0.10); //,500);
        cameraLight.position.x = camera.position.x;
        cameraLight.position.y = camera.position.y;
        cameraLight.position.z = camera.position.z;
        scene.add(cameraLight);
        addHelpers();
        //add sounds
        try {
            for (var a_tag in sounds) {
                sounds[a_tag]['obj'] = document.createElement('audio');
                for (var si = 0; si < sounds[a_tag]['src'].length; si++) {
                    var ssrc = document.createElement('source');
                    var atype = sounds[a_tag]['src'][si].split('.')
                    atype = atype[atype.length - 1];
                    ssrc.type = 'audio/' + atype;
                    ssrc.src = resource_base + sounds[a_tag]['src'][si];
                    sounds[a_tag]['obj'].appendChild(ssrc);
                }
                sounds[a_tag]['obj'].load();
            }
        } catch (e) {
        }

        buildUI();
        LoadDisruptorObjects();
        animate();
//        render();
        raycaster = new THREE.Raycaster();
        var evenst = ['mousedown', 'mouseup', 'mousemove', 'pointerdown', 'pointerup', 'pointermove', 'touchstart', 'touchend', 'touchmove'];
        for (var ei = 0; ei < evenst.length; ei++) {
            renderer.domElement.addEventListener(evenst[ei], _handleEvents);
        }
        return true;
    };
    this.step = function (newstep) {
        console.log(newstep);
        setStep(newstep)
    };

    function startSmoking(wattage) {

        //Uncomment to restrict smoking when zoomed to oled @ scen4
//        if (!is_zoomed_to_oled) {

        filter = scene.getObjectByName('isub_coil02ohm');
        complete_device_group = filter.parent;
        if (!smoking) {
            particleGroup = new SPE.Group({
                texture: THREE.ImageUtils.loadTexture(resource_base + "texture/smokeparticle.png"),
                maxAge: 5,
                hasPerspective: true,
                colorize: true,
            });
            emitter = new SPE.Emitter({
//                position: new THREE.Vector3(-22, 152, -3),
                position: new THREE.Vector3(-22, 152, -4),
                positionSpread: new THREE.Vector3(0, 0, 0),
                acceleration: new THREE.Vector3(0, 10, 00),
                accelerationSpread: new THREE.Vector3(0, 0, 0),
                velocity: new THREE.Vector3(0, 0, 0),
                velocitySpread: new THREE.Vector3(10, 0, 10),
//                velocitySpread: new THREE.Vector3(0, 0, 0),
                colorStart: new THREE.Color(0xFFFFFF),
                colorEnd: new THREE.Color(0xFFFFFF),
                sizeStart: 5,
                sizeEnd: 150,
                particleCount: wattage * 3 / 10,
            });
            particleGroup.addEmitter(emitter);

            vapingSound.setVolume(vapingSoundVolume);
            vapingSound.play();

            //FILTER SHOULD ADD THE PARTICLEGROUP EMITTER TO FOLLOW THE FILTER !!!
            complete_device_group.add(particleGroup.mesh);
            smoking = true;

            calculateVoltageInformation();

            refreshDisruptorInformations();
            reset15secTimeout();
            configuration_complete_timer = setTimeout(function () {
                showConfigurationComplete();
            }, 10000);
        }
//        }
    }
    function stopSmoking() {
        if (smoking) {
            filter = scene.getObjectByName('isub_coil02ohm');
            complete_device_group = filter.parent;
            complete_device_group.remove(particleGroup.mesh);
            smoking = false;
            resetVoltageInformation();
            refreshDisruptorInformations();
        }
    }

//=============================================================================
//PBC SCREEN LOGIC

    generalStartScreen = function () {
//        console.log(scene);
        var small_screen_already_exists = scene.getObjectByName('smallScreen');
        if (!small_screen_already_exists) {
            screenDynamicTexture = new THREEx.DynamicTexture(400, 200);
            screenDynamicTexture.texture.anisotropy = renderer.getMaxAnisotropy();
            planeGeometry1 = new THREE.PlaneBufferGeometry(45, 20, 30, 30);
            planeMaterial = new THREE.MeshBasicMaterial({map: screenDynamicTexture.texture});
            ScreenPlane = new THREE.Mesh(planeGeometry1, planeMaterial);
            ScreenPlane.name = 'smallScreen';
            groupMecanism = scene.getObjectByName('disrupter');
            if (groupMecanism) {
//                console.log("THERE IS A GRUPMECANISM");
                groupMecanism.add(ScreenPlane);
            }
            ScreenPlane.position.x = -32.8; // DEPTH BIGGER IS INSIDE
            ScreenPlane.position.x = -32.8; // DEPTH BIGGER IS INSIDE
            ScreenPlane.position.z = -3.5; // LEFT RIGHT (smaller is LEFT
            ScreenPlane.position.y = 26.5; // TOP BOTTOM
            ScreenPlane.rotation.z = Math.PI / 2;
            ScreenPlane.rotation.y = -Math.PI / 2;
            screenDynamicTexture.texture.needsUpdate = true;
            screenDynamicTexture.clear('#667788');
            ScreenPlane.scale.x = 0.5;
            ScreenPlane.scale.y = 0.5;
            ScreenPlane.scale.z = 0.5;
        }
    }

    delayStopScreen = function (time) {
        var small_screen_already_exists = scene.getObjectByName('smallScreen');
        if (small_screen_already_exists) {
            setTimeout(function () {
                groupMecanism = scene.getObjectByName('disrupter');
                groupMecanism.remove(ScreenPlane);
            }, time);
        }
    }

    instantStopScreen = function () {
        var small_screen_already_exists = scene.getObjectByName('smallScreen');
        if (small_screen_already_exists) {
            setTimeout(function () {
                groupMecanism = scene.getObjectByName('disrupter');
                groupMecanism.remove(ScreenPlane);
            }, 0);
        }
    }

    this.startDisruptorWithLogo = function () {
        generalStartScreen();
        screenDynamicTexture.drawText('\uE001', 25, 130, '#FDFDFD', (0.6 * 190) + "px DisrupterLCDFont");
        screenDynamicTexture.drawText('innokin', 170, 90, '#FDFDFD', (0.2 * 190) + "px DisrupterLCDFont");
        screenDynamicTexture.drawText('technology', 145, 130, '#FDFDFD', (0.2 * 190) + "px DisrupterLCDFont");
        setTimeout(function () {
            screenDynamicTexture.clear('#667788');
            displayDisruptor();
        }, 1500);
    }

    displayDisruptor = function () {
        generalStartScreen();
        drawAllFourOnTexture(screenDynamicTexture, 'watt');
    }

    this.displayStartInformation = function () {
        generalStartScreen();
        screenDynamicTexture.drawText('OFF', 150, 90, '#FDFDFD', (0.2 * 256) + "px DisrupterLCDFont");
        screenDynamicTexture.drawText('click 3x on', 45, 145, '#FDFDFD', (0.2 * 256) + "px DisrupterLCDFont");
//        delayStopScreen(1000);
    }

    function drawAllFourOnTexture(screenDynamicTexture, mode) {
        fineTuneVariablesDisplay(mode);
        switch (mode) {
            case "watt":
                screenDynamicTexture.drawText(ohmz_ammount_display + '\u03A9', 11, 90, '#FDFDFD', (0.2 * 256) + "px DisrupterLCDFont");
                //Draw Volts
                screenDynamicTexture.drawText(volt_ammount_display + 'v', 11, 150, '#FDFDFD', (0.2 * 256) + "px DisrupterLCDFont");
                // Draw WATTAGE AMMOUNT INFORMATION
                screenDynamicTexture.drawText(watt_ammount_display, 155, 130, '#FDFDFD', (0.3 * 256) + "px DisrupterLCDFont");
                // Draw WATTAGE LOGO Information
                screenDynamicTexture.drawText('w', 285, 130, '#FDFDFD', (0.3 * 256) + "px DisrupterLCDFont");
                //Draw Battery
                screenDynamicTexture.drawText('\uE000', 345, 120, '#FFFFFF', (0.3 * 256) + "px DisrupterLCDFont");
                break;
            case "volt":
                screenDynamicTexture.drawText(ohmz_ammount_display + '\u03A9', 10, 90, '#FDFDFD', (0.2 * 256) + "px DisrupterLCDFont");
                //Draw Volts
                screenDynamicTexture.drawText(watt_ammount_display + 'w', 12, 150, '#FDFDFD', (0.2 * 256) + "px DisrupterLCDFont");
                // Draw WATTAGE AMMOUNT INFORMATION
                screenDynamicTexture.drawText(volt_ammount_display, 150, 130, '#FDFDFD', (0.3 * 256) + "px DisrupterLCDFont");
                // Draw WATTAGE LOGO Information
                screenDynamicTexture.drawText('v', 289, 130, '#FDFDFD', (0.3 * 256) + "px DisrupterLCDFont");
                //Draw Battery
                screenDynamicTexture.drawText('\uE000', 345, 120, '#FFFFFF', (0.3 * 256) + "px DisrupterLCDFont");
                break;
        }

    }

    function fineTuneVariablesDisplay(mode) {
        var voltz = (device_variables.volt / 10).toString();
        var wattz = (device_variables.watt / 10).toString();
        var ohmz = (device_variables.ohmz / 10).toString();
//        console.log("VOLTZ " + device_variables.volt);
//        console.log("DisplayV : " + voltz);
        substringOfVolt = voltz.substring(0, 4);
        volt_ammount_display = substringOfVolt;
        watt_ammount_display = wattz;
        ohmz_ammount_display = ohmz;
        ///////////////////////////////////////////////////////
        //For The VOLT PART
        ///////////////////////////////////////////////////////
        if (device_variables.volt % 10 == 0) {
            volt_ammount_display += '.00';
        } else if (device_variables.volt % 10 == 5) {
            volt_ammount_display += '0';
        }
//        volt_ammount_display = volt_ammount_display + '0';
        ///////////////////////////////////////////////////////
        // For the WATT PART
        ///////////////////////////////////////////////////////
        if (device_variables.watt % 10 == 5) {
            watt_ammount_display = wattz;
        } else {
            watt_ammount_display = wattz + '.0';
        }
        if (device_variables.watt < 100) {
            watt_ammount_display = ' ' + watt_ammount_display;
        }
        ///////////////////////////////////////////////////////
        // For the OHMZ PART
        ///////////////////////////////////////////////////////
        if (device_variables.ohmz % 10 == 0) {
            ohmz_ammount_display += '.00';
        } else {
            ohmz_ammount_display += '0';
        }
    }


    function startButtonClick() {
        var startButton = scene.getObjectByName('startbutton');
        var twoClicksDifference = 0;
        var threeClicksDifference = 0;
        startButton.position.x += 0.5;
        startButtonCounter += 1;
        startButtonCounter2 += 1;
        if (device_status === "OFF") {
            startButtonPushStart = clock.elapsedTime;
            startButtonPushed = true;
            if (startButtonCounter % 3 == 1) {
                clearTimeout();
                startClick1 = clock.elapsedTime;
                timer_running = true;
                setTimeout(function () {
                    if (timer_running) {
                        InnokinDisrupterViewer.displayStartInformation();
                    }
                }, 400);
            }
            if (startButtonCounter % 3 == 2) {
                clearTimeout();
                startClick2 = clock.elapsedTime;
                twoClicksDifference = startClick2 - startClick1;
                timer_running = false;
            }
            if (startButtonCounter % 3 == 0) {
                clearTimeout();
                startClick3 = clock.elapsedTime;
                threeClicksDifference = startClick3 - startClick1;
                timer_running = false;
                InnokinDisrupterViewer.startDisruptorWithLogo();
                device_status = "ON";
            }
        }
        setTimeout(function () {
            timer_running = true;
            startButtonCounter = 0;
        }, 600);
        if (device_status === "ON") {
            startSmoking(device_variables.watt);

        }
    }

    function startButtonClickedDeviceStarted() {

        var startButton = scene.getObjectByName('startbutton');
        startButton.position.x += 0.5;

        if (!smoking) {
            playSmoke = setTimeout(function () {
                startSmoking(device_variables.watt);
            }, ammount_of_ms_to_press);
        } else {
            removeSmoke = setTimeout(function () {
                complete_device_group = scene.getObjectByName('disrupter').parent;
                complete_device_group.remove(particleGroup.mesh);
                smoking = false;
            }, ammount_of_ms_to_press);
        }
    }


    function plusButtonClick() {
        var buttonSmall1 = scene.getObjectByName('down_button');
        buttonSmall1.position.x += 0.3;
        if (device_status === "ON") {
            switch (device_state) {
                case 'volt':
                    if (device_variables.volt < 74.1) {
                        device_variables.volt += 1;
                    } else {
                        device_variables.volt = 30;
                    }
                    device_variables.volt.toFixed(2);
                    refreshDisruptorInformations();
                    showWarningBox();
                    break;
                case 'watt':
                    if (device_variables.watt < 496) {
                        device_variables.watt += 5;
                    } else {
                        device_variables.watt = 60;
                    }
                    refreshDisruptorInformations();
                    showWarningBox();
                    break;
            }
        }
    }

    function minusButtonClick() {
        var buttonSmall2 = scene.getObjectByName('up_button');
        buttonSmall2.position.x += 0.3;
        if (device_status === "ON") {
            switch (device_state) {
                case 'volt':
                    if (device_variables.volt > 31) {
                        device_variables.volt -= 1;
                    } else {
                        device_variables.volt = 75;
                    }
                    refreshDisruptorInformations();
                    showWarningBox();
                    break;
                case 'watt':
                    if (device_variables.watt > 64) {
                        device_variables.watt -= 5;
                    } else {
                        device_variables.watt = 500;
                    }
                    refreshDisruptorInformations();
                    showWarningBox();
                    break;
            }
        }
    }

    function resetButtonPositions() {
        var startButton = scene.getObjectByName('startbutton');
        var buttonSmall1 = scene.getObjectByName('up_button');
        var buttonSmall2 = scene.getObjectByName('down_button');
        startButton.position.x = 0;
        buttonSmall1.position.x = 0;
        buttonSmall2.position.x = 0;
        startButtonPushed = false;
        clearTimeout(playSmoke);
        clearTimeout(removeSmoke);
        stopSmoking();
        vapingSound.stop();


    }

    function calculateVoltageInformation() {

        var voltage = 0;
        //FORMULA USED IS :    W = V * V / R
        switch (device_variables.ohmz) {
            case 20:
                if (device_variables.watt < 285) {
                    voltage = device_variables.watt * device_variables.ohmz;
                    device_variables.volt = Math.sqrt(voltage) - 0.5;
                } else {
                    device_variables.volt = 75;

                }
                break;

            case 5:
                if (device_variables.watt > 350) {

                }
                voltage = device_variables.watt * device_variables.ohmz;
                device_variables.volt = Math.sqrt(voltage);
                break;
        }
    }

    function resetVoltageInformation() {
        device_variables.volt = 0;
    }

    function refreshDisruptorInformations() {
        var existingSmallScreen = scene.getObjectByName('smallScreen');
        var newScreenDynamicTexture = new THREEx.DynamicTexture(400, 200);
        newScreenDynamicTexture.name = 'screenDynamicTexture';
        newScreenDynamicTexture.texture.needsUpdate = true;
        newScreenDynamicTexture.clear('#667788');
        drawAllFourOnTexture(newScreenDynamicTexture, device_state);
        var newPlaneMaterial = new THREE.MeshBasicMaterial({
            map: newScreenDynamicTexture.texture
        });
        existingSmallScreen.material = newPlaneMaterial;
    }

    function preloadFontForScreen() {
        //Temporarely create a screen with texture to load the font the first time. Auto-Remove after 2 seconds
        tempDynamicTexture = new THREEx.DynamicTexture(10, 10);
        tempGeometry = new THREE.PlaneBufferGeometry(45, 20, 30, 30);
        tempMaterial = new THREE.MeshBasicMaterial({map: tempDynamicTexture.texture});
        tempPlane = new THREE.Mesh(tempGeometry, tempMaterial);
        tempPlane.name = 'tempScreenFarAway';
        tempPlane.position.z = 5000;
        tempPlane.position.x = 5000;
        tempPlane.position.y = 5000;
        scene.add(tempPlane);
        tempDynamicTexture.drawTextCooked(
                {
                    text: 'SomeRandoMText',
                    align: 'center',
                    lineHeight: 0.3,
                    fillStyle: '#FDFDFD',
                    font: "" + (0.2 * 190) + "px DisrupterLCDFont",
                    family: "DisrupterLCDFont"
                }
        );
        setTimeout(function () {
            scene.remove(tempPlane);
        }, 2000);
    }

    function reset15secTimeout() {
        clearTimeout(fifteen_sec_timer);
        fifteen_sec_timer = setTimeout(function () {
            stopSmoking();
        }, 15000);
    }

    function showConfigurationComplete() {
        if (bypassed_device_start) {
            if (!configuration_complete) {
//                console.log("CONFIG COMPLETE");
                configuration_complete = true;
                var completeButton = document.getElementById('completed-button');
                completeButton.style.display = 'block';
                completeButton.style.zIndex = 10;
            }
        } else {
            bypassed_device_start = true;
        }
    }

    function completedButtonAction() {
//        window.location = redirectUrlAfterCompleted;      //REDIRECT
        window.open(redirectUrlAfterCompleted, "_blank");   //OPEN IN NEW TAB
    }

};
var InnokinDisrupterViewer = new _InnokinDisrupterViewer;