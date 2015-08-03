var _InnokinDisrupterViewer = function(){
	
	var scene,camera,renderer, raycaster, cameraLight, orbitcntrl, disrupter_buttons = [],disrupter_groups = {}, current_pick_set, current_choice= {disrupter : null, innocell: null, coil : null}, disrupter, loadingOverlay;
	
	var debug_mode = true;
	var remainingToLoad = 0;
	var totalToLoad = 0;
	var resource_base = './disruptor_glview/resources/';
	
	var urls = [ resource_base + "texture/envmap3.png",  resource_base + "texture/envmap3.png",
				 resource_base + "texture/envmap.png",  resource_base + "texture/envmap2.png",
				 resource_base + "texture/envmap3.png",  resource_base + "texture/envmap3.png" ];

	var textureCube = THREE.ImageUtils.loadTextureCube( urls);
	textureCube.minFilter = THREE.LinearFilter;

	var current_step = 1;
	var from_step = 1;
	var config = {
		width : 830, 
		height : 500,
		container : null
	};
	var step_buttons = [];
	
	var materials = {
        blue_battery: {color: 0x005BBB, shininess: 30, specular: 0x0093EF, metal: true, side: THREE.DoubleSide},
        whiteblue_battery: {color: 0x72DCD4, shininess: 30, specular: 0x91D7DD, metal: true, side: THREE.DoubleSide},
        aquamarine_battery: {color: 0x72DCD4, shininess: 30, specular: 0x91D7DD, metal: true, side: THREE.DoubleSide},
        red_battery: {color: 0xC9153A, shininess: 30, specular: 0xEA4670, metal: true, side: THREE.DoubleSide},
        pink_battery: {color: 0xd71f85, shininess: 30, specular: 0xFA58BB, metal: true, side: THREE.DoubleSide},
        purple_battery: {color: 0xAC47B2, shininess: 30, specular: 0xC860CE, metal: true, side: THREE.DoubleSide},
        green_battery: {color: 0x009B3A, shininess: 30, specular: 0x4BC293, metal: true, side: THREE.DoubleSide},
		black_battery: {color: 0x000000, shininess: 30, specular: 0x3A393F, metal: true, side: THREE.DoubleSide},
        
        golden_material: {color: 0xBFB4A6, shininess: 30, specular: 0xDCD1C4, metal: true, side: THREE.DoubleSide},
		silver_material: {color: 0xB3B9C3, shininess: 30, specular: 0xDEDBE6, metal: true, side: THREE.DoubleSide},
        black_material: {color: 0x000000, shininess: 30, specular: 0x3A393F, metal: true, side: THREE.DoubleSide},
        
        grey_metal: {color: 0xCCCCCC, shininess: 50, specular: 0xBBBBBB, metal: true, side: THREE.DoubleSide},
        screws: {color: 0xCCCCCC, shininess: 50, specular: 0xAACCDD, metal: true, side: THREE.DoubleSide},
        connectors: {color: 0x9F8F53, shininess: 50, specular: 0xEAE0D7, metal: true, side: THREE.DoubleSide},
        texts: {color: 0x666666, shininess: 50, specular: 0xEAE0D7, metal: true, side: THREE.DoubleSide},
        logotexts: {color: 0xffffff},
        black_plastic: {color: 0x000000, shininess: 10, specular: 0xEAE0D7, metal: false, side: THREE.DoubleSide},
        coil: {color: 0xCCCCCC, shininess: 50, specular: 0xAACCDD, metal: true, side: THREE.DoubleSide},
        coil_glass: {color: 0xffffff, shininess: 10, specular: 0xDDDDDD, transparent: true, opacity: 0.2, side: THREE.DoubleSide, depthWrite : false},
        screen_transparent: {color: 0x009900, shininess: 10, specular: 0xFF00FF, transparent: true, opacity: 0.3, side: THREE.DoubleSide},
        plastic_transparent: {color: 0xffffff,specular:0xffffff, envMap: textureCube, combine: THREE.MultiplyOperation, transparent: true, opacity: 0.40, reflectivity : 30, shininess: 80},
        plastic_powled: {color: 0xffffff,specular:0xffffff, envMap: textureCube, combine: THREE.MultiplyOperation, transparent: true, opacity: 0.90, reflectivity : 5, shininess: 40},
        plastic_black: {color: 0x000000, shininess: 50, specular: 0xffffff, side: THREE.DoubleSide},
	};
	
	var disrupter_matreials = [materials.silver_material, materials.golden_material, materials.black_material];
	var innocell_matreials = [materials.black_battery, materials.blue_battery, materials.pink_battery, materials.red_battery, materials.green_battery, materials.purple_battery, materials.whiteblue_battery];
	
	var toLoad = {
		disrupter : 
			[
			{model:'obj/disrupter_shell_magnet.obj',type:'obj', name : '', material : materials.grey_metal},
			{model:'obj/disrupter_shell_magnet2.obj',type:'obj', name : '', material : materials.grey_metal},
			{model:'obj/upper_shell_lid.obj',type:'obj', name : '', material : materials.grey_metal},
			{model:'obj/upper_shell_lid_coil_socket.obj',type:'obj', name : '',  material : materials.connectors},
			{model:'obj/disrupter_bottom.obj',type:'obj', name : '', material : materials.grey_metal},
			{model:'obj/connector_1.obj',type:'obj', name : '', material : materials.silver_material},
			{model:'obj/connector_2.obj',type:'obj', name : '', material : materials.connectors},
			{model:'obj/disrupter_screws.obj',type:'obj', name : '', material : materials.screws},
			{model:'obj/disrupter_bottom_screws.obj',type:'obj', name : '', material : materials.screws},
			{model:'obj/disrupter_ce_text.obj',type:'obj', name : '', material : materials.texts},
			{model:'obj/lcd_glass.obj',type:'obj', name : '', material : materials.screen_transparent},
			{model:'obj/power_button_led_ring.obj',type:'obj', name : 'power_led', material : materials.plastic_powled},
			{model:'obj/disrupter_shell.obj',type:'obj', name : 'mod_shell', material : disrupter_matreials[0]},
			{model:'obj/power_button.obj',type:'obj', name : 'startbutton', material : materials.silver_material},
			{model:'obj/up_button.obj',type:'obj', name : 'up_button', material : materials.silver_material},
			{model:'obj/down_button.obj',type:'obj', name : 'down_button', material : materials.silver_material},
			{model:'obj/olcd.dae',type:'collada', name : 'olcd', material : {color : 0xffffff}},
			{model:'obj/screen_frame.obj',type:'obj', name : 'olcd_frame', material : materials.silver_material}
			],
		innocell : 
			[
			{model:'obj/battery.obj',type:'obj', name : '', material : materials.black_battery},
			{model:'obj/battery_2.obj',type:'obj', name : '', material : materials.black_battery},
			{model:'obj/battery_usb.obj',type:'obj', name : '', material : materials.grey_metal},
			{model:'obj/battery_upper_lid.obj',type:'obj', name : '', material : materials.grey_metal},
			{model:'obj/battery_bottom.obj',type:'obj', name : '', material : materials.grey_metal},
			{model:'obj/innocell_text.obj',type:'obj', name : '', material : materials.logotexts},
			{model:'obj/battery_srews.obj',type:'obj', name : '', material : materials.screws},
			{model:'obj/battery_lid_screws.obj',type:'obj', name : '', material : materials.screws},
			{model:'obj/battery_bottom_screws.obj',type:'obj', name : '', material : materials.screws},
			{model:'obj/battery_bottom_text.obj',type:'obj', name : '', material : materials.texts},
			{model:'obj/battery_shell.obj',type:'obj', name : 'battery_shell', material :innocell_matreials[0]}
			],
		isub_coil02ohm : 
			[
			{model:'obj/coil02.obj',type:'obj', name : '', material :  materials.grey_metal},
			{model:'obj/coil02_glass.obj',type:'obj', name : 'coil_glass', material : materials.coil_glass}
			],
		tabletop : [
			//{model:'obj/carousel.obj',type:'obj', name : 'carousel', material : materials.plastic_transparent}
			{model:'obj/carousel_top.obj',type:'obj', name : 'carousel', material : materials.plastic_transparent},
			{model:'obj/carousel_bottom.obj',type:'obj', name : 'carousel', material : materials.black_material},
			]
	}
	
	
	var mouse = new THREE.Vector3();
	var coil_ohms = ['0.5', '2.0'];
	var steps = {
		1 : {title : 'Choose Your Disrupter!', choose : 'disrupter', clones : []},
		2 : {title : 'Choose Your InnokinCell!', choose : 'innocell', clones : []},
		3 : {title : 'Choose your iSub Coil', choose: 'isub_coil', clones : [], instructions : {ohms : {'0.5' : '0.5Ω : Big Clouds',  '2.0':'2.0Ω Intense Flavors'}}},
		4 : {title : 'VAPE!', icon : 'setp4-logo'}
	}
	
	var olcd = null;
	
	var UI = {
		title : undefined,
		wrapper : undefined
	};
	
	window.requestAnimationFrame = (function()
	{
	  return window.requestAnimationFrame ||  
			 window.mozRequestAnimationFrame ||
	  		 window.webkitRequestAnimationFrame ||
			 window.oRequestAnimationFrame ||
			 window.msRequestAnimationFrame ||
			function(callback) { return window.setTimeout(function(){
				callback(new Date());
			}, 1000 / 60); };
	})();
			  
	window.cancelAnimationFrame = window.cancelAnimationFrame || window.mozCancelAnimationFrame || window.webkitCancelAnimationFrame || function(requestId){clearTimeout(requestId);};
	
	var animations = {
		coil_flyin : function(){
			disrupter_groups['isub_coil02ohm'].position.set(0,200,0);
			new TWEEN.Tween(disrupter_groups['isub_coil02ohm'].position).to({
					y : 0
				},1500).start();
			
		},
		coil_flyout : function(){
			disrupter_groups['isub_coil02ohm'].position.set(0,0,0);
			
			new TWEEN.Tween(disrupter_groups['isub_coil02ohm'].position).to({
					y : 200
				},1500).start();
		},
		coil_fadein : function(){
			disrupter_groups['isub_coil02ohm'].rotation.set(0,0,0);
			disrupter_groups['isub_coil02ohm'].position.set(0,0,0);
			
			disrupter_groups['isub_coil02ohm'].traverse(
				function(child){
					if(child instanceof THREE.Mesh){
						new TWEEN.Tween(child.material).to({
							opacity : child.parent.name == 'coil_glass'? materials.coil_glass.opacity : 1
						},300).start();
					}
				}
			);
		},
		coil_fadeout : function(){
			disrupter_groups['isub_coil02ohm'].rotation.set(0,0,0);
			disrupter_groups['isub_coil02ohm'].position.set(0,0,0);
			disrupter_groups['isub_coil02ohm'].traverse(
				function(child){
					if(child instanceof THREE.Mesh){
						child.material.transparent = true;
						new TWEEN.Tween(child.material).to({
							opacity : 0
						},300).start();
					}
				}
			);
		},
		innocell_flyin : function(){
			resetDisrupterTransforms();
			disrupter_groups['innocell'].position.x = -30;
			disrupter_groups['innocell'].position.y = 400;
			new TWEEN.Tween(disrupter_groups['innocell'].position).to({
					y : 0
				},1000).start();
		},
		innocell_flyout : function(){
			resetDisrupterTransforms();
			disrupter_groups['innocell'].position.x = -30;
			new TWEEN.Tween(disrupter_groups['innocell'].position).to({
					y : 400
				},1000).start();
		},
		tabletop_rotate : function(left){
			if(typeof (left) !== 'boolean') left = true;
			var dir = left? 1 : -1;
			if(disrupter_groups['tabletop']){
				new TWEEN.Tween(disrupter_groups['tabletop'].rotation).to({
					y : disrupter_groups['tabletop'].rotation.y + (Math.PI / 4 * dir)
				},500).easing(TWEEN.Easing.Circular.InOut).start();
			}
		},
		
		explode_disrupter : function(){
			resetDisrupterTransforms();
			disrupter_groups['innocell'].position.x = -30;
			new TWEEN.Tween(disrupter_groups['innocell'].position).to({
					x : 0
				},300).start();
			new TWEEN.Tween(disrupter_groups['isub_coil02ohm'].position).to({
					y : 30
				},300).start();
		},
		implode_disrupter : function(){
			resetDisrupterTransforms();
			disrupter_groups['isub_coil02ohm'].position.y = 30;
			
			new TWEEN.Tween(disrupter_groups['innocell'].position).to({
					x : -30
				},300).start();
			new TWEEN.Tween(disrupter_groups['isub_coil02ohm'].position).to({
					y : 0
				},300).start();
			
		},
		change_battery : function(){
			resetDisrupterTransforms();
			disrupter_groups['innocell'].position.x = -30;
			
			var cellout = new TWEEN.Tween(disrupter_groups['innocell'].position).to({
					y : 400
				},500);
			var cellin = new TWEEN.Tween(disrupter_groups['innocell'].position).to({
					y : 0
				},500);
			cellout.chain(cellin);
			cellout.start();
		},
		step : {
			1 : {
				'in' :	function(cb){
					
					var delay = 800 / steps[1].clones.length;
					var last = steps[1].clones.length - 1;
					for(var ci = 0; ci < steps[1].clones.length; ci++){
						steps[1].clones[ci].position.y = 300;
						steps[1].clones[ci].rotation.y = 0;
						new TWEEN.Tween(steps[1].clones[ci].rotation).to({y : Math.PI / 4},delay).delay(ci * delay).start();
						var tw = new TWEEN.Tween(steps[1].clones[ci].position).to({y : 0},delay).delay(ci * delay);

						if((typeof(cb) == 'function') && last == ci){
							tw.onComplete(cb);
						}
						tw.start();
					}
				},		
				'out' :	 function(cb){
					var delay = 1000 / steps[1].clones.length;
					var last = steps[1].clones.length - 1;
					for(var ci = 0; ci < steps[1].clones.length; ci++){
						new TWEEN.Tween(steps[1].clones[ci].rotation).to({y :0},delay).delay(ci * delay).start();
						var tw = new TWEEN.Tween(steps[1].clones[ci].position).to({y : 300},delay).delay(ci * delay);

						if((typeof(cb) == 'function') && last == ci){
							tw.onComplete(cb);
						}
						tw.start();
					}
				}		
			},
			11 : {
				'in' :	function(cb){
					var ctw = new TWEEN.Tween(camera.position).to({
						x : -2,
						z : 231,
						y : 191

					},1000);
					ctw.onComplete(function(){orbitcntrl.update();});
					ctw.start();
					new TWEEN.Tween(camera.rotation).to({
						x : -0.5169,
						z : -0.007,
						y : -0.004

					},1000).start();
					var tw = new TWEEN.Tween(disrupter_groups['tabletop'].rotation).to({
							y : disrupter_groups['tabletop'].rotation.y - (2 * Math.PI)
						},2000).easing(TWEEN.Easing.Quadratic.InOut);
					
					if(typeof(cb) == 'function'){
						tw.onComplete(cb);
					}
					tw.start();
					
					var delay = 2000 / steps[1].clones.length;
					for(var ci = 0; ci < steps[1].clones.length; ci++){
						steps[1].clones[ci].position.y = 300;
						new TWEEN.Tween(steps[1].clones[ci].position).to({
							y : 21
						},delay).delay(ci * delay).start();
					}
				},		
				'out' :	 function(cb){
					var ctw = new TWEEN.Tween(camera.position).to({
						x : -2,
						z : 231,
						y : 191

					},1000);
					ctw.onComplete(function(){orbitcntrl.update();});
					ctw.start();
					new TWEEN.Tween(camera.rotation).to({
						x : -0.5169,
						z : -0.007,
						y : -0.004

					},1000).start();
					var tw = new TWEEN.Tween(disrupter_groups['tabletop'].rotation).to({
							y : disrupter_groups['tabletop'].rotation.y + (2 * Math.PI)
						},2000);
					
					if(typeof(cb) == 'function'){
						tw.onComplete(cb);
					}
					tw.start();
					
					var delay = 2000 / steps[1].clones.length;
					for(var ci = steps[1].clones.length - 1, ci2 = 0; ci >= 0; ci--, ci2++){
						steps[1].clones[ci].position.y = 21;
						new TWEEN.Tween(steps[1].clones[ci].position).to({
							y : 300
						},delay).delay(ci2 * delay).start();
						
					}
				}		
			},
			2 : {
				'in' :	function(cb){
					var ctw = new TWEEN.Tween(camera.position).to({
						x : -2,
						z : 231,
						y : 191

					},1000);
					ctw.onComplete(function(){orbitcntrl.update();});
					ctw.start();
					new TWEEN.Tween(camera.rotation).to({
						x : -0.5169,
						z : -0.007,
						y : -0.004

					},1000).start();
					var tw = new TWEEN.Tween(disrupter_groups['tabletop'].rotation).to({
							y : disrupter_groups['tabletop'].rotation.y - (2 * Math.PI)
						},2000);
					
					if(typeof(cb) == 'function'){
						tw.onComplete(cb);
					}
					tw.start();
					
					var delay = 2000 / steps[2].clones.length;
					for(var ci = 0; ci < steps[2].clones.length; ci++){
						steps[2].clones[ci].position.y = 300;
						new TWEEN.Tween(steps[2].clones[ci].position).to({
							y : 21
						},delay).delay(ci * delay).start();
					}
				},	
				'out' :	function(cb){
					var ctw = new TWEEN.Tween(camera.position).to({
						x : -2,
						z : 231,
						y : 191

					},1000);
					ctw.onComplete(function(){orbitcntrl.update();});
					ctw.start();
					new TWEEN.Tween(camera.rotation).to({
						x : -0.5169,
						z : -0.007,
						y : -0.004

					},1000).start();
					var tw = new TWEEN.Tween(disrupter_groups['tabletop'].rotation).to({
							y : disrupter_groups['tabletop'].rotation.y + (2 * Math.PI)
						},2000);
					
					if(typeof(cb) == 'function'){
						tw.onComplete(cb);
					}
					tw.start();
					
					var delay = 2000 / steps[1].clones.length;
					var cnt = steps[1].clones.length;
					for(var ci = steps[1].clones.length - 1, ci2 = 0; ci >= 0; ci--, ci2++){
						steps[2].clones[ci].position.y = 21;
						new TWEEN.Tween(steps[2].clones[ci].position).to({
							y : 300
						},delay).delay(ci2 * delay).start();
						
					}
				}	
			},
			
			3 : {
				'in' : function(cb){
					resetDisrupterTransforms();
					disrupter_groups['disrupter'].position.x = -400;
					var modTween =  new TWEEN.Tween(disrupter_groups['disrupter'].position).to({
							x : 0
						},500);
					
					disrupter_groups['isub_coil02ohm'].position.set(0,250,0);
					var subtween = new TWEEN.Tween(disrupter_groups['isub_coil02ohm'].position).to({
							y : 0
						},500);
						
					disrupter_groups['innocell'].position.x = -30;
					disrupter_groups['innocell'].position.y = 400;
					var tw = new TWEEN.Tween(disrupter_groups['innocell'].position).to({
							y : 0
						},500);
					if(typeof(cb) == 'function'){
						tw.onComplete(cb);
					}
					modTween.chain(subtween);
					subtween.chain(tw);
					modTween.start();
					var ctw = new TWEEN.Tween(camera.position).to({
						x : -146,
						z : 195,
						y : 126

					},1500);
					ctw.onComplete(function(){ orbitcntrl.update();});
					ctw.start();
					new TWEEN.Tween(camera.rotation).to({
						x : -0.326,
						z : -0.193,
						y : -0.6176

					},1500).start();
				},
				'out' : function(cb){
					resetDisrupterTransforms();
					disrupter_groups['disrupter'].position.x = 0;
					var modTween =  new TWEEN.Tween(disrupter_groups['disrupter'].position).to({
							x : -400
						},500);
					
					disrupter_groups['isub_coil02ohm'].position.set(0,0,0);
					var subtween = new TWEEN.Tween(disrupter_groups['isub_coil02ohm'].position).to({
							y : 400
						},500);
						
					disrupter_groups['innocell'].position.x = -30;
					disrupter_groups['innocell'].position.y = 0;
					var tw = new TWEEN.Tween(disrupter_groups['innocell'].position).to({
							y : 400
						},500);
					if(typeof(cb) == 'function'){
						modTween.onComplete(cb);
					}
					tw.chain(subtween);
					subtween.chain(modTween);
					tw.start();
					
					var ctw = new TWEEN.Tween(camera.position).to({
						x : -146,
						z : 195,
						y : 126

					},1500);
					ctw.onComplete(function(){orbitcntrl.update();});
					ctw.start();
					new TWEEN.Tween(camera.rotation).to({
						x : -0.326,
						z : -0.193,
						y : -0.6176

					},1500).start();
				}
			},
			4 : {
				'in' : function(cb){
					resetDisrupterTransforms();
					disrupter.rotation.set(0,0,0);
					disrupter.position.set(0,0,0);
					var tw =  new TWEEN.Tween(disrupter.rotation).to({
						z : -Math.PI / 2,
						x : Math.PI / 2 ,
						//y : Math.PI 
					},1000);
					new TWEEN.Tween(disrupter.position).to({
						x : -60,
						z : -10,
						y : 30

					},1000).start();
					var ctw = new TWEEN.Tween(camera.position).to({
						x : -44,
						z : 101,
						y : 73

					},1000);
					ctw.onComplete(function(){orbitcntrl.update();});
					ctw.start();
					new TWEEN.Tween(camera.rotation).to({
						x : -0.305,
						z : -0.142,
						y : -0.471

					},1000).start();
					if(typeof(cb) == 'function'){
						tw.onComplete(cb);
					}
					tw.start()
				},
				'out' : function(cb){
					resetDisrupterTransforms();
					
					var tw =  new TWEEN.Tween(disrupter.rotation).to({
						z : 0,
						y : 0,
						x : 0,
					},1000);
					new TWEEN.Tween(disrupter.position).to({
						z : 0,
						y : 0,
						x : 0,
					},1000).start();
					var ctw = new TWEEN.Tween(camera.position).to({
						x : -146,
						z : 195,
						y : 126

					},1000);
					ctw.onComplete(function(){orbitcntrl.update();});
					ctw.start();
					new TWEEN.Tween(camera.rotation).to({
						x : -0.326,
						z : -0.193,
						y : -0.6176

					},1000).start();
					if(typeof(cb) == 'function'){
						tw.onComplete(cb);
					}
					tw.start()
				}
			}
		}		
	};
	
	/* private functions */
	function getMousePos(evt){
		var rect = renderer.domElement.getBoundingClientRect();
		if(evt.type == 'touchend') return mouse; //return the last mouse coordinate;
        if(evt.touches){
			mouse.x = 2 * ((evt.touches[0].clientX - rect.left) / renderer.domElement.width) - 1;
			mouse.y = 1 - 2 * ( (evt.touches[0].clientY - rect.top) / renderer.domElement.height );
        }else{
			mouse.x = 2 * ((evt.clientX - rect.left) / renderer.domElement.width) - 1;
			mouse.y = 1 - 2 * ( (evt.clientY - rect.top) / renderer.domElement.height );
        }
        return mouse;
	}
	
	function _handleStepChange(evt){
		var data = parseInt(evt.target.getAttribute("data-step"));
		if(!isNaN(data)){
			setStep(data);
		}
		if(evt.preventDefault){
			evt.preventDefault();
		}
		return false;
	}
	
	function _handleEvents(evt){
		switch(evt.type){
			case 'mousedown':
			case 'touchstart':
			case 'pointerdown':
				getMousePos(evt);
				var picked = pick();
				
				if(picked){
					while(!(picked.parent instanceof THREE.Group)){
						picked = picked.parent;
					}
					console.log(picked);
					switch(current_step){
						case 1:
						case 2:
						case 3:
							break;
						case 4:
							orbitcntrl.enabled = false;
							olcd.update('on')
							break;
					}
				}
				break;
			case 'mouseup':
			case 'touchend':
			case 'pointerup':
				orbitcntrl.enabled = true;
				break;
			default:
		}
		return false;
	}
	
	function pick(){
		if(disrupter_buttons.length){
			raycaster.setFromCamera( mouse, camera );
			var intersects = raycaster.intersectObjects(current_pick_set, true); 
			if(intersects.length){
				return intersects[0]['object'];
			}
		}
		return false;
	}
	
	function render(){
		requestAnimationFrame( render );
		//orbitcntrl.update();
		cameraLight.position.x = camera.position.x;
		cameraLight.position.y = camera.position.y;
		cameraLight.position.z = camera.position.z;
		TWEEN.update();
		
		renderer.render( scene, camera );
	}
	
	function applyUConfig(uconfig){
		if(!uconfig){
			config.container = config.container? config.container : document.body;
			return false;
		}
		uconfig.width = parseInt(uconfig.width);
		uconfig.height = parseInt(uconfig.height);
		
		config.width = isNaN(uconfig.width)? config.width : uconfig.width;
		config.height = isNaN(uconfig.height)? config.height : uconfig.height;
		if(uconfig.containerId){
			var container = document.getElementById(uconfig.containerId);
			if(container){
				config.container = container;
			}
		}else{
			config.container = config.container? config.container : document.body;
		}
	}
	
	function LoadDisruptorObjects(){
		for(var group in toLoad){
			disrupter_groups[group] = new THREE.Group();
			disrupter_groups[group]['name'] = group;
			disrupter_groups[group]['visible'] = false;
			scene.add(disrupter_groups[group]);
			remainingToLoad += toLoad[group].length;
			totalToLoad += toLoad[group].length;
			while(toLoad[group].length){
				var part = toLoad[group].shift()
				loadDisruptorPart(part,group);
			}
		}
	}
	
	function loadDisruptorPart(part,group){
		var loaderClass;
		switch(part['type']){
			case 'collada':
				loaderClass = THREE.ColladaLoader;
				break;
			case 'obj':
				loaderClass = THREE.OBJLoader;
				break;
		}
		var loader = new loaderClass();
		if(part['type'] == 'collada'){
			loader.options.convertUpAxis = true;
		}
		loader.load( resource_base+part['model'],function(imported){
			var imp_obj = imported.scene? imported.scene : imported;
			disrupter_groups[group].add(imp_obj);
			remainingToLoad -= 1;
			//set the material
			if(part.material){
				var material = new THREE.MeshPhongMaterial(part.material);
				imp_obj.traverse(function(child){
					if(child instanceof THREE.Mesh){
						child.material = material;
						/*child.castShadow = true;
						child.receiveShadow = false;*/
					}
				});
			}
			if(part.name === 'olcd'){
				imp_obj.traverse(function(child){
					if(child instanceof THREE.Mesh){
						var box = new THREE.Box3().setFromObject( child );
						var bsz = box.size();
						olcd = new InnokinLCD(512, 176);
						child.material.map = olcd.texture();
						child.material.blending = THREE.MultiplyBlending;
						olcd.update();
					}
				});
				
			}
			
			if(['startbutton', 'up_button', 'down_button'].indexOf(part.name) > -1){
				disrupter_buttons.push(imp_obj.children[0]);
			}
			
			if(part.name){
				imp_obj.name = part.name;
			}
			updateLoading();
			if(!remainingToLoad){
				//disrupter_groups['innocell'].position.x = -15;
				//disrupter_groups['disrupter'].position.x = 15;
				//disrupter_groups['isub_coil02ohm'].position.x = 15;
				onLoadComplete()
			}
		});
		
	}
	
	function showLoading(){
		loadingOverlay = document.getElementById('WebglLoadingOverlay');
		if(!loadingOverlay){
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
			UI.wrapper.appendChild(loadingOverlay);
		}
	}
	
	function hideLoading(){
		loadingOverlay = document.getElementById('WebglLoadingOverlay');
		if(loadingOverlay){
			loadingOverlay.parentNode.removeChild(loadingOverlay);
		}
	}
	
	function updateLoading(){
		var indicator = document.getElementById('progress-indicator');
		var prgress = 1 - (remainingToLoad / totalToLoad);
		if(indicator){
			indicator.style.width = (prgress * 100)+'%';
		}else{
			console.log(prgress * 100);
		}
		
	}
	
	function buildUI(){
		if(renderer){
			UI.wrapper = document.createElement('div');
			UI.wrapper.className = 'disrupter-view-wrapper';
			renderer.domElement.className = 'disrupter-view-canvas';
			renderer.domElement.parentNode.appendChild(UI.wrapper);
			UI.wrapper.appendChild(renderer.domElement);
			UI.wrapper.style.width = renderer.domElement.width+'px';
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
			var evenst = ['mousedown','pointerdown','touchstart'];

			for(var i = 1; i <= 4; i++){
				var btn = document.createElement('span');
				btn.className = 'step-button';
				btn.setAttribute('data-step' , i);
				btn.innerHTML = steps[i]['icon']? '&nbsp;' : i+'. '+steps[i]['title'];
				btn.className += steps[i]['icon']? ' '+steps[i]['icon'] : '';
				sbhi.appendChild(btn);
				step_buttons.push(btn);
				for(var ei = 0; ei < evenst.length; ei++){
					btn.addEventListener( evenst[ei], _handleStepChange);
				}
			}
			
			showLoading();
		}
	} 
	
	function resetDisrupterTransforms(){
		disrupter_groups['isub_coil02ohm'].rotation.set(0,0,0);
		disrupter_groups['isub_coil02ohm'].position.set(0,0,0);
		disrupter_groups['disrupter'].rotation.set(0,0,0);
		disrupter_groups['disrupter'].position.set(0,0,0);
		disrupter_groups['innocell'].rotation.set(0,0,0);
		disrupter_groups['innocell'].position.set(-30, 0,0);
	}
	
	function resetCameraAndControls(){
		orbitcntrl = new THREE.OrbitControls( camera, renderer.domElement );
		orbitcntrl.noPan = true;
		orbitcntrl.noKeys = true;
		orbitcntrl.minDistance = 100;
		orbitcntrl.maxDistance = 250;
		orbitcntrl.maxPolarAngle = Math.PI / 2;
		orbitcntrl.panUp(50);
		orbitcntrl.update();
	}
	
	function hideAllGroups(){
		for(var grp in disrupter_groups){
			disrupter_groups[grp].visible = false;
		}
		for(var stp in steps){
			if(steps[stp].clones){
				for(var ci = 0; ci < steps[stp].clones.length; ci++){
					steps[stp].clones[ci].visible = false;
				}
			}
		}
	}
	
	function _cloneDisrupterForStep1(){
		if(!steps[1]['clones'].length){
			var wholeradians = Math.PI / 4;
			var positions = [
				[-41, 21, 4],
				[-25, 21, 30],
				[ 4, 21, 41],
				[ 32, 21, 25],
				[ 41, 21, -4],
				[ 25, 21, -32],
				[ -4, 21, -41],
				[ -32, 21, -25]
			];
			
			for(var di = 0;  di < 8; di++){
				var dclone = disrupter_groups['disrupter'].clone();
				disrupter_groups['tabletop'].add(dclone);
				dclone.rotation.y = wholeradians * di;
				dclone.position.set(positions[di][0],positions[di][1],positions[di][2]);
				var shell = dclone.getObjectByName('mod_shell');
				if(shell){
					var mi = di % disrupter_matreials.length ;
					var material = new THREE.MeshPhongMaterial(disrupter_matreials[mi]);
					shell.traverse(function(child){
						if(child instanceof THREE.Mesh){
							child.material = material;
						}
					});
				}
				dclone.visible = false;
				steps[1]['clones'].push(dclone);
			}
		}
	}
	
	function cloneDisrupterForStep1(){
		if(!steps[1]['clones'].length){
			disrupter_groups['step1'] = new THREE.Group();
			disrupter_groups['step1']['name'] = 'step1';
			scene.add(disrupter_groups['step1']);
			var dx = 0;
			
			for(var di = 0;  di < disrupter_matreials.length; di++){
				var dclone = disrupter_groups['disrupter'].clone();
				disrupter_groups['step1'].add(dclone);
				var dir = (di % 2)? 1 : -1;
				
				dx += di * 60 * dir;
				dclone.position.set(dx + 15, 0 , 0);
				dclone.rotation.set(0, Math.PI / 4 , 0);
				
				var shell = dclone.getObjectByName('mod_shell');
				if(shell){
					var mi = di % disrupter_matreials.length ;
					var material = new THREE.MeshPhongMaterial(disrupter_matreials[mi]);
					shell.traverse(function(child){
						if(child instanceof THREE.Mesh){
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
	
	function cloneBatteryForStep2(){
		if(!steps[2]['clones'].length){
			var wholeradians = Math.PI / 4;
			var positions = [
				[32.5, 21, 4],
				[26, 21, -21],
				[ 4, 21, -32],
				[ -20, 21, -25],
				[ -32, 21, -4],
				[ -25, 21, 20],
				[ -4, 21, 32],
				[ 20.5, 21, 26]
			];
			
			for(var di = 0;  di < 8; di++){
				var dclone = disrupter_groups['innocell'].clone();
				disrupter_groups['tabletop'].add(dclone);
				dclone.rotation.y = wholeradians * di;
				dclone.position.set(positions[di][0],positions[di][1],positions[di][2]);
				var shell = dclone.getObjectByName('battery_shell');
				if(shell){
					var mi = di % innocell_matreials.length ;
					var material = new THREE.MeshPhongMaterial(innocell_matreials[mi]);
					shell.traverse(function(child){
						if(child instanceof THREE.Mesh){
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
	
	function cloneCoilForStep3(){
		if(!steps[3]['clones'].length){
			disrupter_groups['step3'] = new THREE.Group();
			disrupter_groups['step3']['name'] = 'step3';
			scene.add(disrupter_groups['step3']);
			var dx = 0;
			
			for(var di = 0;  di < coil_ohms.length; di++){
				var dclone = disrupter_groups['isub_coil02ohm'].clone();
				disrupter_groups['step3'].add(dclone);
				var dir = (di % 2)? 1 : -1;
				dclone.userData['ohms'] = coil_ohms[di];
				dx += di * 60 * dir;
				dclone.position.set(dx + 15, 0 , 0);
				dclone.rotation.set(0, Math.PI / 4 , 0);
				
				dclone.visible = false;
				steps[3]['clones'].push(dclone);
			}
			current_choice['coil'] = steps[3]['clones'][0];
		}
	}
	
	function switchViewStep(newstep){
		newstep = parseInt(newstep);
		newstep = isNaN(newstep) || (newstep > 4)? current_step : newstep;
		if(current_step != newstep){
			current_step = newstep;
			hideAllGroups();
			switch(current_step){
				case 1:
					disrupter_groups['step1'].visible = true;
					for(var ci = 0; ci < steps[current_step].clones.length; ci++){
						steps[current_step].clones[ci].visible = true;
					}	
					current_pick_set = steps[current_step].clones;
					camera.position.set(7.4252, 84.2356, 163.364);
					camera.rotation.set(-0.1473, 0.045, 0.006663);
					
					break;
				case 2:
					disrupter_groups['tabletop'].visible = true;
					for(var ci = 0; ci < steps[current_step].clones.length; ci++){
						steps[current_step].clones[ci].visible = true;
						//steps[current_step].clones[ci].positon.y = 400;
					}	
					current_pick_set = disrupter_groups['tabletop'].children;
					break
				case 3:
					disrupter_groups['step3'].visible = true;
					for(var ci = 0; ci < steps[current_step].clones.length; ci++){
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
					
			}
			for(var sbi = 0; sbi < step_buttons.length; sbi++){
				step_buttons[sbi].className = step_buttons[sbi].className.replace(/active/g,' ').replace(/\s+/,' ');
			}
			step_buttons[current_step - 1].className +=' active';
			document.getElementById('WebGlViewerTitle').innerHTML = steps[current_step]['title'];
		} 
	}
	
	function onLoadComplete(){
		scene.remove(disrupter_groups['disrupter'],disrupter_groups['innocell'], disrupter_groups['isub_coil02ohm']);
		disrupter = new THREE.Group();
		disrupter.add(disrupter_groups['disrupter']);
		disrupter.add(disrupter_groups['innocell']);
		disrupter.add(disrupter_groups['isub_coil02ohm']);
		scene.add(disrupter);
		
		hideAllGroups();
		cloneDisrupterForStep1();
		cloneBatteryForStep2();
		cloneCoilForStep3();
		disrupter_groups['tabletop'].position.set(0,-21,0);
		//disrupter_groups['tabletop'].rotation.y = Math.PI / 2;
		hideLoading();
		var tmp = current_step;
		current_step = 0;
		switchViewStep(tmp);
		animations.step[current_step]['in']();
		console.log(current_choice);
	}
	
	
	function addHelpers(){
		if(debug_mode){
			orbitcntrl.minPolarAngle = 0;
			orbitcntrl.maxPolarAngle = Math.PI;
			orbitcntrl.noPan = false;
			camera.far = 1000;
			scene.traverse(function(child){
				if(child instanceof THREE.DirectionalLight){
					scene.add(new THREE.DirectionalLightHelper(child, 20));
				}
			})
			var gridHelper = new THREE.GridHelper( 300, 10 );		
			scene.add( gridHelper );
			var axisHelper = new THREE.AxisHelper( 20 );
			scene.add( axisHelper );
		}
	}
	
	function setStep(newstep){
		from_step = current_step;
		TWEEN.removeAll();
		if(animations.step[current_step]){
			if(current_step == 3 && newstep == 4){
				switchViewStep(newstep);
				animations.step[current_step]['in']();
			}else if (current_step == 4 && newstep == 3){
				animations.step[current_step]['out']();
			}else if (current_step == 4 && newstep < 3){
				animations.step[current_step]['out'](function(){
					animations.step[3]['out'](function(){
						switchViewStep(newstep);
						animations.step[current_step]['in']();
					});
				});
			}else if (current_step < 3 && newstep == 4){
				animations.step[current_step]['out'](function(){
					switchViewStep(newstep);
					animations.step[3]['in'](function(){
						animations.step[current_step]['in']();
					});
					
				});
				
			}else{
				animations.step[current_step]['out'](function(){
					switchViewStep(newstep);
					animations.step[current_step]['in']();
				});
			}
		}else{
			switchViewStep(newstep);
		}	
	}
	
	/* public test functions */
	this.explode = function(){
		TWEEN.removeAll();
		animations.explode_disrupter();
	};
	this.implode = function(){
		TWEEN.removeAll();
		animations.implode_disrupter();
	};
	this.cellout = function(){
		TWEEN.removeAll();
		animations.innocell_flyout();
	};
	this.cellin = function(){
		TWEEN.removeAll();
		animations.innocell_flyin();
	};
	this.tablerotate = function(left){
		TWEEN.removeAll();
		animations.tabletop_rotate(left);
	};
	this.cellchange = function(){
		TWEEN.removeAll();
		animations.change_battery();
	};
	this.coilout = function(){
		TWEEN.removeAll();
		animations.coil_fadeout();
	};
	this.coilin = function(){
		TWEEN.removeAll();
		animations.coil_fadein();
	};
	this.coilflyout = function(){
		TWEEN.removeAll();
		animations.coil_flyout();
	};
	this.coilflyin = function(){
		TWEEN.removeAll();
		animations.coil_flyin();
	};
	this.step1_in = function(){
		TWEEN.removeAll();
		animations.step[1]['in']();
	};
	this.step1_out = function(){
		TWEEN.removeAll();
		animations.step[1]['out']();
	};
	this.step2_in = function(){
		TWEEN.removeAll();
		animations.step[2]['in']();
	};
	this.step2_out = function(){
		TWEEN.removeAll();
		animations.step[2]['out']();
	};
	/* public functions */
	this.getCamera = function(){
		console.log(camera.position, camera.rotation);
	};
	this.Init = function(uconfig){
		if(scene) return false;
		
		applyUConfig(uconfig);
		scene = new THREE.Scene();
		camera = new THREE.PerspectiveCamera( 50, config.width / config.height, 1, 800 );
		camera.position.z = 300;
		camera.position.y = 60;
		renderer = new THREE.WebGLRenderer({antialias: true, alpha : true});
		renderer.setSize(config.width, config.height);
		renderer.autoClear = false;
		renderer.gammaInput = true;
        renderer.gammaOutput = true;
        renderer.shadowMapEnabled = true;
		//renderer.sortObjects = false;
		config.container.appendChild( renderer.domElement );
		
		orbitcntrl = new THREE.OrbitControls( camera, renderer.domElement);
		orbitcntrl.noPan = true;
		orbitcntrl.noKeys = true;
		orbitcntrl.minDistance = 100;
		orbitcntrl.maxDistance = 500;
		orbitcntrl.maxPolarAngle = Math.PI / 2;
		orbitcntrl.minPolarAngle = Math.PI / 3;
		orbitcntrl.panUp(60);
		orbitcntrl.update();

        
		//add the lights
		var lightIntensity = 0.15;
        var coord_mul = 2;
        var lightColor = 0xffffff;
        
		var light1 = new THREE.DirectionalLight(lightColor, lightIntensity);
		light1.position.set(300 * coord_mul, 300 * coord_mul, 0 * coord_mul);
		light1.name = 'StaticLight1';
		//light1.castShadow  = true;
		scene.add( light1);
		
		var light2 = new THREE.DirectionalLight( lightColor, lightIntensity);
		light2.position.set(0 * coord_mul, 300 * coord_mul, 300 * coord_mul);
		light2.name = 'StaticLight2';
		scene.add( light2);
		
		var light3 = new THREE.DirectionalLight( lightColor, lightIntensity);
		light3.position.set(0 * coord_mul, -300 * coord_mul, 300 * coord_mul);
		light3.name = 'StaticLight3';
		scene.add( light3);
		
		var light4 = new THREE.DirectionalLight( lightColor, lightIntensity);
		light4.position.set(-300 * coord_mul, 300 * coord_mul, 0 * coord_mul);
		light4.name = 'StaticLight4';
		scene.add( light4);
		
		var light5 = new THREE.DirectionalLight( lightColor, lightIntensity);
		light5.position.set(0 * coord_mul, -300 * coord_mul, -300 * coord_mul);
		light5.name = 'StaticLight5';
		scene.add( light5);
		
		
		//var light = new THREE.AmbientLight( 0x404040 ); 
		//scene.add( light );
		
		cameraLight = new THREE.PointLight( 0xcccccc, 0.10); //,500);
		cameraLight.position.x = camera.position.x;
		cameraLight.position.y = camera.position.y;
		cameraLight.position.z = camera.position.z;
		scene.add(cameraLight);
		
		addHelpers();
		/*
		var geometry = new THREE.CylinderGeometry( 150, 150, 1, 200 );
		var material = new THREE.MeshPhongMaterial(materials.silver_material);
		var cylinder = new THREE.Mesh( geometry, material );
		cylinder.position.y = -20;
		scene.add( cylinder );
		*/
		buildUI();
		LoadDisruptorObjects();
		render();
		raycaster = new THREE.Raycaster();
		var evenst = ['mousedown','mouseup','mousemove','pointerdown','pointerup', 'pointermove','touchstart','touchend','touchmove'];
		for(var ei = 0; ei < evenst.length; ei++){
			renderer.domElement.addEventListener( evenst[ei], _handleEvents);
		}
		return true;
	};
	
	this.step = function(newstep){
		setStep(newstep)
		
	};
};

var InnokinDisrupterViewer = new _InnokinDisrupterViewer;

var InnokinLCD = function(width,height){
	var canvas = document.createElement('canvas');
	width = parseInt(width,10);
	height = parseInt(height,10);
	width = isNaN(width)? 230 : width;
	height = isNaN(height)? 74 : height;
	canvas.width = width;
	canvas.height = height;
	var fontsize = Math.round(height * 0.63);
	var topY = Math.ceil((height - fontsize) / 2)
	var smallfontsize = Math.round(fontsize / 2);
	var three_x_press_delay = 800; //ms
	var onswitchtimer = null;
	var boottimer = null;
	var switch_on_press_count = 0;
	
	//document.body.appendChild(canvas);
	var watts = [6.0, 50.0];
	var volts = [3.0, 7.5];
	var watt_increment = 0.5
	var volt_increment = 0.1;
	var min_ohm = 0.20;
	var colors = {text : '#FFFFFF', lcd : '#666'};
	var fontfamily = 'DisrupterLCDFont';
	var current_settings = {
		ohm : min_ohm,
		watts : watts[0],
		volts : volts[0],
		on : false,
		booting : false,
		screen : ''
	};
	var screens = {
		test : ['test', '\uE000'],
		off_message : ['off|click 3x on'],
		boot : ['\uE001','innokin|technology'],
		watt_setup : ['0.00\u03A9|0.00v','00.0w','\uE000'],
		volt_setup : ['0.00\u03A9|0.00w','00.0v','\uE000']
	}
	var positions = {};
	
	var tctx = canvas.getContext('2d');
	tctx.textBaseline = 'top';
	tctx.font = smallfontsize+'px '+fontfamily;
	tctx.fillStyle = colors.text;
	
	
	var texture = new THREE.Texture(canvas);
	texture.minFilter = THREE.LinearFilter;
	
	function _handleSwitchOnOffTimer(){
		switch_on_press_count = 0;
		drawScreen();
	}
	
	function setupPositions(){
		var cwdth = width;// * 0.90;
		for(var screen in screens){
			positions[screen] = {};
			var sections = screens[screen].length;
			var x = 0;
			var y = topY;
			
			for(var i = 0; i < sections; i++){
				var section_lines = screens[screen][i].split('|');
				var sec_fsz = section_lines.length == 1? fontsize : smallfontsize;
				var dx = 0;
				var center = (['off_message','boot'].indexOf(screen) > -1) && (section_lines.length == 2)
				for(var sl=0; sl < section_lines.length; sl++){
					tctx.font = sec_fsz+'px '+fontfamily;
			   		var txtmetrics = tctx.measureText(section_lines[sl]);
	        		var twdth = Math.round(txtmetrics.width);
					var _x = center? (x + (cwdth - x - twdth) / 2) : x;
					_x = _x < x? x : _x;
					positions[screen][section_lines[sl]] = {x : _x, y : y + (sec_fsz)*sl, fs : sec_fsz};
					dx = twdth > dx? twdth : dx;
				}
				x += dx;
			}
			//check maybe we are over the allowed width => recalculate font size;
			
			if(x > cwdth){
				var scale = cwdth / x;
				for(var fixtext in positions[screen]){
					 positions[screen][fixtext].x *= scale;
					 //positions[screen][fixtext].y *= scale;
					 //positions[screen][fixtext].fs *= scale;
				}
			}
		}
	}
	
	function drawScreen(){
		tctx.clearRect(0, 0, canvas.width, canvas.height);
		tctx.fillStyle = colors.lcd;
		tctx.fillRect(0, 0, canvas.width, canvas.height);
		tctx.fillStyle = colors.text;
		if(current_settings.screen && screens[current_settings.screen]){
			for(var text in positions[current_settings.screen] ){
				var _text = text.replace(/0\.00w/, current_settings.watts.toFixed(2)+'w');
				_text = _text.replace(/0\.00\u03A9/g, current_settings.ohm.toFixed(2)+'\u03A9');
				_text = _text.replace(/0\.00v/g, current_settings.volts.toFixed(2)+'v');
				_text = _text.replace(/00\.0v/g, current_settings.volts.toFixed(1)+'v');
				_text = _text.replace(/00\.0w/g, current_settings.volts.toFixed(1)+'w');
				var txt_info = positions[current_settings.screen][text];
				tctx.font = txt_info.fs+'px DisrupterLCDFont';
				tctx.fillText(_text, txt_info.x, txt_info.y);
			}
		}
		
		texture.needsUpdate = true;
	}
	
	setupPositions();
	
	this.texture = function(){return texture;};
	
	this.update = function(action){
		switch(action){
			case 'on':
				clearTimeout(onswitchtimer);
				onswitchtimer = null;
				if(!current_settings.on){
					switch_on_press_count += 1;
					onswitchtimer = setTimeout(function(){_handleSwitchOnOffTimer();}, three_x_press_delay);
					if(switch_on_press_count==1){
						//if device is not on and first push display the off_message
						current_settings.screen = 'off_message';
						boottimer = setTimeout(function(){current_settings.screen = '';  drawScreen();},1000);
					}else{
						if(switch_on_press_count >= 3 && !current_settings.booting){
							clearTimeout(boottimer);
							current_settings.booting = true;
							current_settings.on = true;
							current_settings.screen = 'boot';
							setTimeout(
								function(){
									current_settings.booting= false;  
									current_settings.screen = 'volt_setup';  
									drawScreen(); 
									switch_on_press_count = 0;
								},600);
						}
					}
				}else{
					//start switch off process
				}
				break;
			case 'watts':
				current_settings.screen = 'watt_setup'
				break;
			case 'volts':
				current_settings.screen = 'volt_setup'
				break;
			case 'up':
			case 'down':
				switch(current_settings.screen){
					case 'watt_setup':
						break;
					case 'volt_setup':
						break;
				}
				break;
			default:
				
		}
		drawScreen();
	}
}