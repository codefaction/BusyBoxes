//<![CDATA[
var DEBUG = false;
var DEBUG2 = false;
var CELL_TRAIL = false;
var AVG_TRAIL = false;
var avg_trail_a = [];
var cell_trail_a = [];
DEFAULT_COLOR = 0x8090aa;
POS_EVEN = 0xff3333;
POS_ODD = 0x3333ff;
NEG_EVEN = 0xffcc00;
NEG_ODD = 0x00ccff;


// adding these to a cell's coords gives you its knight-move bretheren
// var offs1 = [+2, +1, -1, -2, +2, +1, -1, -2];
// var offs2 = [+1, +2, +2, +1, -1, -2, -2, -1];

// adding these to 
// var move1 = [+1, -1, +1, -1, +1, -1, +1, -1];
// var move2 = [-1, +1, +1, -1, +1, -1, -1, +1];

var thirdStateRules = [
                        {xOffset: 2, yOffset: 1, xMove: 1, yMove: -1},
                        {xOffset: 2, yOffset: 1, xMove: 1, yMove: -1}
                        ];




var knightsMoveRules = [
                            {xOffset: 4, yOffset: 1, xMove: 1, yMove: -1},
                            {xOffset: 1, yOffset: 2, xMove: -1, yMove: 1},
                            {xOffset: -1, yOffset: 2, xMove: 1, yMove: 1},
                            {xOffset: -2, yOffset: 1, xMove: -1, yMove: -1},
                            {xOffset: 2, yOffset: -1, xMove: 1, yMove: 1},
                            {xOffset: 1, yOffset: -2, xMove: -1, yMove: -1},
                            {xOffset: -1, yOffset: -2, xMove: 1, yMove: -1},
                            {xOffset: -2, yOffset: -1, xMove: -1, yMove: +1},
                        ];

var rules = [];

// recompute grid with below code at start of each generation
// for (var i = 0, i < rules.length; i++) {
//   ruleOfInterest = rules[i];
//   if (cellExists(ruleOfInterest.xOffset, ruleOfInterest.yOffset)) {
//     doMove(ruleOfInterest.xMove, ruleOfInterest.yMove);
//   }
// }

// function offsets(x, y, z){
//   this.x = x;
//   this.y = 0;
//   this.z = z;
// }
// function moves(x, y, z){
//   this.x = x;
//   this.y = 0;
//   this.z = z;
// }





var cursor = [0, 0, 0];
var gLastCursor = cursor;
var visual_and_numerical_grid = {};
IS_RUNNING = false;
var direction = "forward";
var lasthash = "";
var gUpdateHash = "";
var gInitialHash = "";
var gInitialFrame;
var encodeString = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+-";
var frame = 0; //
var cellCount = 0;
var mode = "wrap";
var axisMin = -12;
var axisMax = 11;
processSpeed = "fast";
var lastSelectedEl;
var gLastRefreshedUrl;
var scrollBarX = false;
var moveFifo = [];
for (var i=0; i<60; i++) moveFifo.push(0);
var qargs = {};
var container, interval,
camera, scene, renderer,
projector, plane, cube, linesMaterial,
color = 0,colors = [ 0xDF1F1F, 0xDFAF1F, 0x80DF1F, 0x1FDF50, 0x1FDFDF, 0x1F4FDF, 0x7F1FDF, 0xDF1FAF, 0xEFEFEF, 0x303030 ],
// minusColor = 0, minusColors = [0x4e9258,0xffff00 ],
ray, brush, objectHovered,
isMouseDown = false, onMouseDownPosition,
radius = 2000, theta = 0, onMouseDownTheta = 45, phi = 60, onMouseDownPhi = 60;
randWidth = 4, randCount = 33, randRatio = 0.5;

var mainGrid;
mainGrid = new Grid(24, 24, 24); //FIXME TODO: set size acc to qargs
var gThreeInUse = [];
var gThreeUnused = [];

init();
render();

function CellObj(threejs, state, xyz){
  this.threejs = threejs;
  this.state = state;
  this.bugg = bugg++;
  // this.xyz = xyz;
}


//breaks up the hash string and returns different elements of the query

function parseQueryArgs() {
    var queryArgs = {};
    var searchString = document.URL;
    
    var index = searchString.indexOf("?");
    
    if (index < 0) return queryArgs;
    // return substring after index + 1
    // js method substr 0 index is before string begins
    // so "index + 1" gets string after the special character
    searchString = searchString.substr(index + 1);
    
    index = searchString.indexOf("/");
    
    // for indexOf(), if it does not find a match for parameter, it will return -1
    if (index < 0) {
        //no match for "/"
        index = searchString.indexOf("#");
        if (index < 0) {
            // no match for "#"
            index = searchString.length;
        }
    }
    
    searchString = searchString.substr(0, index);
    var queryArgList = searchString.split("&");
    
    for (var i = 0; i < queryArgList.length; i++) {
        var query = queryArgList[i];
        var keyval = query.split("=");
        var key = keyval[0];
        if (keyval.length <= 1) keyval.push(true);
        queryArgs[key] = keyval[1];
    }
      
    return queryArgs;
}


function init() {
bugg = 1000;
    

    if (DEBUG) console.log("init start");

    //parses out url query (after "?") and turns them into arguments
    qargs = parseQueryArgs();
    
    if (qargs.rule) {
    	gRule = window[qargs.rule]
    	if (!gRule) alert("rule " + qargs.rule + " not defined");
    }
    else {
    	gRule = bbRule; // for nows
    }
    if (gRule.Color!=null) {
        POS_EVEN = gRule.Color;
        POS_ODD = gRule.Color;
    }
    
    if (gRule.EvenColor!=null) {
        POS_EVEN = gRule.EvenColor;
    }
    
    if (gRule.OddColor!=null) {
        POS_ODD = gRule.OddColor;
    }
    
    if (gRule.EvenMinusColor!=null) {
        NEG_EVEN = gRule.EvenMinusColor;
    }
    
    if (gRule.OddMinusColor!=null) {
        NEG_ODD = gRule.OddMinusColor;
    }
    
    if (qargs.dir) {
        direction = qargs.dir;
    }
    
    if (qargs.size) {
        var size = parseInt(qargs.size);
        axisMax = parseInt(size / 2) - 1;
        axisMin = axisMax - (size - 1);
        radius *= size/24.0;
    }
    
    if (qargs.avg_trail_a) {
        AVG_TRAIL = parseInt(qargs.avg_trail_a);
    }
    
    if (qargs.cell_trail_a) {
        // that's the green trail thing they used to show path
        CELL_TRAIL = parseInt(qargs.cell_trail_a);
    }
    mode = "wrap";
    if (qargs.mode) {
        mode = qargs.mode;
        mode = "wrap";
    }
    mode = "wrap";
    if (DEBUG) console.log("DEBUG query args:", qargs, "axisMax:", axisMax, "axisMin:", axisMin)
    
    
    //Create a scene
    container = document.createElement( 'div' );
    // container = document.getElementById('canvas-container');
    // console.log(container);
    document.body.appendChild( container );
    
    
    //THREE.js camera
    camera = new THREE.Camera( 40, window.innerWidth / window.innerHeight, 1, 10000 );
    
    
    if(DEBUG) console.log("camera:", camera);
    camera.position.x = radius * Math.sin( theta * Math.PI / 360 ) * Math.cos( phi * Math.PI / 360 );
    camera.position.y = radius * Math.sin( phi * Math.PI / 360 );
    camera.position.z = radius * Math.cos( theta * Math.PI / 360 ) * Math.cos( phi * Math.PI / 360 );


    //camera.position.y = 200;
    scene = new THREE.Scene();

    
    //Graphical Grid
    var geometry = new THREE.Geometry();
    var vertical = new THREE.Geometry();
    geometry.vertices.push( new THREE.Vertex( new THREE.Vector3( axisMin * 50, 0, 0 ) ) );
    geometry.vertices.push( new THREE.Vertex( new THREE.Vector3( (axisMax+1) * 50, 0, 0 ) ) );
    vertical.vertices.push( new THREE.Vertex( new THREE.Vector3( 0, axisMin * 50, 0 ) ) );
    vertical.vertices.push( new THREE.Vertex( new THREE.Vector3( 0, (axisMax+1) * 50, 0 ) ) );
    linesMaterial = new THREE.LineColorMaterial( 0x000000, 0.2 );
    xLineMaterial = new THREE.LineColorMaterial( 0xFF0000, 1 );
    yLineMaterial = new THREE.LineColorMaterial( 0x00FF00, 1 );
    zLineMaterial = new THREE.LineColorMaterial( 0x0000FF, 1 );
    
    if (!qargs.nogrid) {
        for (var i = 0; i <= axisMax - axisMin + 1; i++) {
        
            var line = new THREE.Line(geometry, linesMaterial);
            line.position.z = (i * 50) + axisMin * 50;
            scene.addObject(line);
            
            var line = new THREE.Line(geometry, linesMaterial);
            line.position.x = (i * 50) + axisMin * 50;
            line.rotation.y = 90 * Math.PI / 180;
            scene.addObject(line);
            
        }
            //var line = new THREE.Line(geometry, linesMaterial);
            //((axisMax - axisMin)/2 * 50) + axisMin * 50
            var line = new THREE.Line(geometry, zLineMaterial);
            line.position.z = 0;
            scene.addObject(line);

            var line = new THREE.Line(vertical, yLineMaterial);
            scene.addObject(line);

            var line = new THREE.Line(geometry, xLineMaterial);
            line.position.x = 0;
            line.rotation.y = 90 * Math.PI / 180;
            scene.addObject(line);

    }
    
    
    projector = new THREE.Projector();
    
    
    plane = new THREE.Mesh( new Plane( 1000, 1000 ) );
    plane.rotation.x = - 90 * Math.PI / 180;
    scene.addObject( plane );
    
    var boxDim = 50;
    if (gRule.boxSize != null) boxDim *= gRule.boxSize;

    //a way to see just 2 dimensions if there is only one plane of interest
    if (qargs.dim == 2) {
      
        //So we use Squares instead of cubes!
        cube = new Square( boxDim, boxDim, boxDim);
        phi = 180;
        adjustCamera();
    }
    else {
        cube = new Cube( boxDim, boxDim, boxDim );
    }
    
    cubette = new Cube(10, 10, 10);
    
    
    //might be to figure out what is in front of the camera
    ray = new THREE.Ray( camera.position, null );
    

    //Add a compass rose to help the user stay oriented
    var compassRoseOffsetFromCenter
    if(size) {
        compassRoseOffsetFromCenter = size * 25 + 30;
    } else {
        compassRoseOffsetFromCenter = 630;
    }
    compassRoseAlpha = .5;

    var compassRose1 = new THREE.Mesh( new Cube(10, 10, 100), new THREE.MeshColorFillMaterial( 0xFF0000, compassRoseAlpha) );
    compassRose1.position.x = -compassRoseOffsetFromCenter;
    compassRose1.position.y = 0;
    compassRose1.position.z = compassRoseOffsetFromCenter;
    compassRose1.overdraw = true;
    scene.addObject( compassRose1 );

    var compassRose2 = new THREE.Mesh( new Cube(10, 100, 10), new THREE.MeshColorFillMaterial( 0x00FF00, compassRoseAlpha) );
    compassRose2.position.x = -compassRoseOffsetFromCenter;
    compassRose2.position.y = 0;
    compassRose2.position.z = compassRoseOffsetFromCenter;
    compassRose2.overdraw = true;
    scene.addObject( compassRose2 );

    var compassRose3 = new THREE.Mesh( new Cube(100, 10, 10), new THREE.MeshColorFillMaterial( 0x0000FF, compassRoseAlpha) );
    compassRose3.position.x = -compassRoseOffsetFromCenter;
    compassRose3.position.y = 0;
    compassRose3.position.z = compassRoseOffsetFromCenter;
    compassRose3.overdraw = true;
    scene.addObject( compassRose3 );


    // this is the cursor that shows where you are going to create a cube
    brush = new THREE.Mesh( cube, new THREE.MeshColorFillMaterial( colors[ color ], 0.4 ) );
    //brush.position.y = brushY;
    setObjPosition(brush, cursor);
    brush.overdraw = true;
    scene.addObject( brush );

    onMouseDownPosition = new THREE.Vector2();

    // Lights
    var ambientLight = new THREE.AmbientLight( 0x404040 );
    scene.addLight( ambientLight );
    var directionalLight = new THREE.DirectionalLight( 0xffffff );
    directionalLight.position.x = 1;
    directionalLight.position.y = 1;
    directionalLight.position.z = 0.75;
    directionalLight.position.normalize();
    scene.addLight( directionalLight );
    var directionalLight = new THREE.DirectionalLight( 0x808080 );
    directionalLight.position.x = - 1;
    directionalLight.position.y = 1;
    directionalLight.position.z = - 0.75;
    directionalLight.position.normalize();
    scene.addLight( directionalLight );
    
    //THREE: create the renderer
    renderer = new THREE.CanvasRenderer();
    

    if (renderer.invalid) {
        //alert ("CANVAS element not supported")
        document.location = "nocanvas.html"; 
    }
    renderer.setSize( window.innerWidth, window.innerHeight );


    //this is the container div we created in the beginning
    container.appendChild(renderer.domElement);
    
    //standard dom stuff--so that our keyboard controls work
    document.addEventListener( 'keydown', onDocumentKeyDown, false );
    document.addEventListener( 'mousemove', onDocumentMouseMove, false );
    document.addEventListener( 'mousedown', onDocumentMouseDown, false );
    document.addEventListener( 'mouseup', onDocumentMouseUp, false );
    container.addEventListener( 'mousewheel', onDocumentMouseWheel, false );
    document.addEventListener( 'DOMMouseScroll', onDocumentMouseWheel, false );
    

	if (qargs.hash) {
		buildFromHash(qargs.hash);
		if (qargs.sel) {
			lastSelectedEl = document.getElementById(qargs.sel);
			lastSelectedEl.style.backgroundColor = 0x00f0ff;
			if (history.replaceState) {
				var url = "" + window.location;
				var i = url.indexOf('&sel=');
				if (i > -1) {
					var j = i + 1 + url.substr(i + 1).indexOf('&');
					url = url.substr(0, i) + url.substr(j);
					history.replaceState(url, url, url);
				}
			}
		}
	} else {
		if (qargs.coords) {
			// console.log("look!:",qargs.coords);
			var coords = [];
			var s = qargs.coords.split(",(");
			for (var i = 0; i < s.length; i++) {
				var coord = s[i].replace("(", "")
				coord = coord.split(",");
				for (var j = 0; j < 3; j++) {
					coord[j] = parseInt(coord[j]);
				}
				coords.push(coord);
			}
			buildFromCoords(coords);
		} else {

			// this is the inital state to get you interested when you hit the site and have never done anything
			//it is just two gliders
			//automatically puts the gliders thing in

			// selectHash('PeciXwDuTA0', document.getElementById("introHash"));
		}
	}
    
    //g means Global
    gInitialHash = gUpdateHash;
    gInitialFrame = frame;

      
    // mainGrid.put(0,0,0,1);
    // mainGrid.update();

    setInterval(mainLoopFast, 14);
    setInterval(mainLoopSlow, 140);
    setTimeout(mainLoopScience, 10);
    render();
    
    if (qargs.play) {
        setTimeout(function() {
            if (!IS_RUNNING) {
                toggleRunning();
            }
        }, 2500);
    }
    if (qargs.science == "test") {
        scienceTest();
    }
}
//end of init function



function mainLoopFast() {
    if (processSpeed == "fast") {
        mainLoop();
    }
}

function mainLoopSlow() {
    // if (document.getElementById("leftLinks").clientHeight >= window.innerHeight) {
    //     if (!scrollBarX) {
    //         scrollBarX = true;
    //         document.body.style.overflowY="scroll";
    //     }
    // }
    // else {
    //     if (scrollBarX) {
    //         scrollBarX = false;
    //         document.body.style.overflowY="hidden";
    //     }
    // }
    if (processSpeed == "slow") {
        mainLoop();
    }
}

function mainLoopScience() {
    if (IS_RUNNING && processSpeed == "science") {
        for (var i=0; i<250; i++) {
            mainLoop(true);                     // no render during main loop for speed
        }
        render();
        setTimeout(mainLoopScience, 0);
    }
    else {
        setTimeout(mainLoopScience, 10);
    }
}

function bugg_used() {
	var r = [];
	for(i=0; i<gThreeInUse.length; i++) {
		r.push(gThreeInUse[i].bugg);
	}
	return r;
}

function bugg_unused() {
	var r = [];
	for(i=0; i<gThreeUnused.length; i++) {
		r.push(gThreeUnused[i].bugg);
	}
	return r;
}

function liveCell(xyz, color, state) {
    if (DEBUG2) console.log("color:", color.toString(16));
	var cell_obj = visual_and_numerical_grid[xyz];
    
    if (!cell_obj) {
        if (DEBUG) console.log("liveCell gThreeUnused: ", gThreeUnused);
		if (!gThreeUnused.length) {
			var threejs = new THREE.Mesh( cube, new THREE.MeshColorFillMaterial( color ) );
		  	cell_obj = new CellObj(threejs, state );
            cell_obj.threejs.overdraw = true;
			scene.addObject( cell_obj.threejs );
            if (DEBUG2) console.log("liveCell: creating new obj:", xyz, cell_obj, "color:", color.toString(16));

		}
		else {
			cell_obj = gThreeUnused.pop(0);
            if (DEBUG2) console.log("liveCell: reusing obj:", xyz, cell_obj, "state:", state, "color:", color.toString(16));
            if(state === -1) {
                cell_obj.state = -1;
                cell_obj.threejs.material[ 0 ].color.setHex(color ^ 0xFF000000)
                cell_obj.threejs.overdraw = true;


                if (DEBUG2) console.log("look here: ", cell_obj, gThreeInUse, gThreeUnused);

            }
            else if(state === 1){
                cell_obj.state = 1;
                cell_obj.threejs.material[ 0 ].color.setHex(color ^ 0xFF000000)
                cell_obj.threejs.overdraw = true;


                if (DEBUG2) console.log("should be grey--look here: ", cell_obj, gThreeInUse, gThreeUnused);

            }
			// deal with color somehow
		}
		gThreeInUse.push(cell_obj);
		setObjPosition(cell_obj.threejs, xyz);
		putGrid(cell_obj, xyz);
        
		if (DEBUG) console.log("live gThreeInUse:", bugg_used(), "gThreeUnused:", bugg_unused());
	}
	else 
		if (DEBUG) console.log("liveCell: already live, doing nuttin", xyz);
    return cell_obj;
}

function killCell(xyz) {
	var obj = visual_and_numerical_grid[xyz];
            //////
            //console.log("killed this cell: ", obj);
	if (obj) {
		var i = gThreeInUse.indexOf(obj);
        //console.log("killCell gThreeInUse index: ", i);
		if (i < 0) {
			//console.log("killCell: not found in gThreeInUse:", xyz, obj);
		}
		else {
			if (DEBUG) console.log("killCell", xyz, "index:", i, "obj:", obj.bugg);
			gThreeInUse.splice(i, 1);
			gThreeUnused.push(obj);
		}
		delGrid(xyz);
                    ///////
                    //console.log("after killing: ", visual_and_numerical_grid[xyz], gThreeUnused);
	    setObjPosition(obj.threejs, [-1111,-1111,-1111]);

		if (DEBUG) console.log("kill gThreeInUse:", gThreeInUse.length, "gThreeUnused:", gThreeUnused.length);
	}
	// else console.log("killCell: obj not vangrid, doing nothing", xyz, xyz);
}

function changeCell(xyz, color, state) {
    if (DEBUG2) console.log("color:", color.toString(16));
	var cell_obj = visual_and_numerical_grid[xyz];
    if(state === -1) {
        cell_obj.state = -1;
        cell_obj.threejs.material[ 0 ].color.setHex(color ^ 0xFF000000)
        cell_obj.threejs.overdraw = true;


        if (DEBUG2) console.log("look here: ", cell_obj, gThreeInUse, gThreeUnused);

    }
    else if(state === 1){
        cell_obj.state = 1;
        cell_obj.threejs.material[ 0 ].color.setHex(color ^ 0xFF000000)
        cell_obj.threejs.overdraw = true;


        if (DEBUG2) console.log("should be grey--look here: ", cell_obj, gThreeInUse, gThreeUnused);

    }
    return cell_obj;
}

//most important
function mainLoop(noRender) {
    //these are updating those little numbers that are keeping tack of the generation, etc.
    document.getElementById("generation").innerHTML = frame;
    document.getElementById("showphase").innerHTML = (frame % 6 + 6) %6;
    document.getElementById("direction").innerHTML = direction;
    var phase = (frame % 6 + 6) %6;
    
    if (IS_RUNNING) {
        if (direction == "reverse") {
            frame--;
        }

        ///////////////

        if(DEBUG) console.log("frame: ", frame)

        if(DEBUG) console.log("frame:", frame, "grid:", visual_and_numerical_grid);
        if(DEBUG) console.log("mainGrid.cells: ", mainGrid.cells);
        ///////////////

		// killCell([0, 0, 0]);
		// liveCell([1, 1, 1], DEFAULT_COLOR);
        
        //calling iterate with an anonymous function as callback(cb)
        mainGrid.iterate(function(grid, x, y, z, f){
        	var old = grid.get(x, y, z);
        	var dir = 1;
        	if (direction != "forward") dir = -1;
        	var coi = gRule.rule(grid, x, y, z, f, dir);
        	// if (coi != null) console.log("DBG coi:", x, y, z, "state:", coi, "old:", old)
        	if (coi == null) coi = old;
            if(old && !coi){
                if (DEBUG) console.log("WE ARE KILLING!", [x,y,z]);
                killCell([x,y,z]);
            }else if(old != coi){
                if (DEBUG) console.log("WE ARE CREATING!", [x,y,z], coi, f);
                var col;
                if (f & 1) {
                	if (coi > 0) {
                		col = POS_ODD;
                		// console.log("DBG2 color POS_ODD:", x, y, z, col);
                	}
                	else {
                		col = NEG_ODD;
                		// console.log("DBG2 color NEG_ODD:", x, y, z, col);
                	}
                }
                else {
                	if (coi > 0) {
                		col = POS_EVEN;
                		// console.log("DBG2 color POS_EVEN:", x, y, z, col);
                	}
                	else {
                		col = NEG_EVEN;
                		// console.log("DBG2 color NEG_EVEN:", x, y, z, col);
                	}
                }
                if (!old) {
                	liveCell([x,y,z], col, coi);
                }
                else {
	                changeCell([x,y,z], col, coi);
                }
            }
            return coi;
        }, frame);

        mainGrid.update();



        /// this is where the cells are rendered!!!
        
        if (!noRender) {
            render();
        }

        if (direction == "forward") frame++;
        updateHash(true);
    }
}
//END of MainLoop

function v3eq(v1, v2){
    return (v1[0] == v2[0] && v1[1] == v2[1] && v1[2] == v2[2]);
}


function moveCell(oldxyz, cell_obj, newxyz) {
  
  
    if (CELL_TRAIL) {
        // one of the cubes
        //cubettes are the trail
        var voxel = new THREE.Mesh(cubette, new THREE.MeshColorFillMaterial(colors[4]));
        
        setObjPosition(voxel, oldxyz);
        voxel.overdraw = true;
        scene.addObject(voxel);
        cell_trail_a.push(voxel);
        if (cell_trail_a.length > CELL_TRAIL) {
            scene.removeObject(cell_trail_a[0]);
            cell_trail_a = cell_trail_a.splice(1);
        }
        //console.log("trails:", trails.length)
    }
    
    //if there are no cell trails (cubettes) then you just set obj positoin to newxyz
    setObjPosition(cell_obj.threejs, newxyz);
    delGrid(oldxyz);
    putGrid(cell_obj, newxyz);
}

//conceptual representation of Grid is an object with a bunch of coordinates 
// convert grid coord to 3D coord and set obj.position accordingly given vector [x,y,z]
//all of this code is for creating a visual representation of the conceptual grid, which might be a sparse array
function setObjPosition(obj, xyz) {
    obj.position.x = xyz[0] * 50 + 25;
    obj.position.y = xyz[1] * 50 + 25;
    obj.position.z = xyz[2] * -50 - 25;
}

function setBrushPosition(xyz) {
    setObjPosition(brush, xyz);
    if ((xyz[0] + xyz[1] + xyz[2]) % 2 == 0) {
        setBrushColor(0);                    
    }
    else {
        setBrushColor(5);                    
    }
    document.getElementById("cursorpos").innerHTML = xyz[0] + "," + xyz[1] + "," + xyz[2]
}

// this is the visual grid
// grid actually has visual things
// we could get rid of it 
function putGrid(obj, xyz) {
    visual_and_numerical_grid[xyz] = obj;
}
function putGrid2(obj, xyz){
  visual_and_numerical_grid[xyz] = [obj.threejs, obj.state];
}

// function trueMod(v, base) {
    // if (v < 0) {
        // return ((v % base) + base) % base;
    // }
    // return v % base;
// }

function getGrid(xyz) {
    if (mode == "wrap") {
        for (var i = 0; i < 3; i++) {
            if (xyz[i] < axisMin || xyz[i] > axisMax) {
                xyz[i] = trueMod(xyz[i] - axisMin, (axisMax - axisMin) + 1) + axisMin;
            }
        }
    }
    return visual_and_numerical_grid[xyz]
}
function delGrid(xyz) {
    // console.log("delete: ", visual_and_numerical_grid[xyz]);
    delete visual_and_numerical_grid[xyz];
    // console.log("deleted: ", visual_and_numerical_grid[xyz]);
}

function toggleRunning(){
    if (IS_RUNNING) {
        IS_RUNNING = false;
        setBrushPosition(cursor);
    }
    else {
        brush.material[ 0 ].color.setHex( 0x00000000 );
        IS_RUNNING = true;
    }
}

function clampCursor() {
    for (var x=0; x<3; x++) {
        if (cursor[x] < axisMin) cursor[x] = axisMin;
        if (cursor[x] > axisMax) cursor[x] = axisMax;
    }
}
function reverseDirection(){
    document.getElementById("duplicates").innerHTML = "";
    if (direction == "forward") {
        direction = "reverse";
    }
    else {
        direction = "forward";
    }
    updateHash(true);
    document.getElementById("direction").innerHTML = direction;
}



function onDocumentKeyDown( event ) {
    if (gMoodalInEffect) {
        if (event.keyCode == 27) {
            moodal_choice("CANCEL");
        }  
        if (event.keyCode == 10 || event.keyCode == 13) {
            moodal_choice("OK");
        }  
        return;
    }
//document.getElementById("debug").innerHTML = ''+event.keyCode;
// console.log("key:", event.keyCode);
    if (event.shiftKey || event.ctrlKey || event.altKey || event.altGraphKey) return;
    
    // THIS is the navigation interface
    // We should think about redesigning
    var yChan = -1 * Math.sin( theta * Math.PI / 360 );
    var xChan = 1 * Math.cos( theta * Math.PI / 360 );
    var field = (cursor[0] ^ cursor[1] ^ cursor[2]) & 1;
    if (DEBUG) console.log("FIELD:", field);
    switch( event.keyCode ) {
        case 37:                           // LEFT
            event.preventDefault();
            cursor[2]+=Math.round(yChan);
            cursor[0]-=Math.round(xChan);
            clampCursor();
            setBrushPosition(cursor);
            render(); 
            break;
        case 40:                           // DOWN
            event.preventDefault();
            cursor[2]-=Math.round(xChan);
            cursor[0]-=Math.round(yChan);
            clampCursor();
            setBrushPosition(cursor);
            render(); 
            break;
        case 39:                           // RIGHT
            event.preventDefault();
            cursor[2]-=Math.round(yChan);
            cursor[0]+=Math.round(xChan);
            clampCursor();
            setBrushPosition(cursor);
            render(); 
            break;
        case 38:                           // UP
            event.preventDefault();
            cursor[2]+=Math.round(xChan);
            cursor[0]+=Math.round(yChan);
            clampCursor();
            setBrushPosition(cursor);
            render(); 
            break;
        case 85:                           // U
        case 33:                           // Page Up
            event.preventDefault();
            cursor[1]++;
            clampCursor();
            setBrushPosition(cursor);
            render(); 
            break;
        case 68:                           // D
        case 34:                           // Page Down
            event.preventDefault();
            cursor[1]--;
            clampCursor();
            setBrushPosition(cursor);
            render(); 
            break;
        case 82:                           // R
            event.preventDefault();
            reset();
            break;
        case 83:                           // S
            event.preventDefault();
            if (!IS_RUNNING) {
                toggleRunning();
            }
            mainLoop();
            toggleRunning();
            break;
        case 10:
        case 13:                           // ENTER
            event.preventDefault();
            toggleRunning();
            break;
        case 191:                           // / ?
            if (IS_RUNNING) {
                toggleRunning();
            }
            event.preventDefault();
            randomCells();
            break;
        case 188:                           // , <
            event.preventDefault();
            if (direction=="forward") {
                reverseDirection();
            }
            break;
        case 190:                           // . >
            event.preventDefault();
            if (direction=="reverse") {
                reverseDirection();
            }
            break;
        case 70:                            // F
            event.preventDefault();
            if (!IS_RUNNING) {
                toggleRunning();
            }
            fastSlow();
            break;
        case 74:                            // J
            event.preventDefault();
            phi += 5.0;
            adjustCamera();
            render();
            break;
        case 75:                            // K
            event.preventDefault();
            phi -= 5.0;
            adjustCamera();
            render();
            break;
        case 78:                            // N
            event.preventDefault();
            theta += 5.0;
            adjustCamera();
            render();
            break;
        case 77:                            // M
            event.preventDefault();
            theta -= 5.0;
            adjustCamera();
            render();
            break;
        case 73:                            // I
            event.preventDefault();
            radius -= 50.0;
            adjustCamera();
            render();
            break;
        case 79:                            // J
            event.preventDefault();
            radius += 50.0;
            adjustCamera();
            render();
            break;
        case 32:                           // SPACE
            event.preventDefault();
            if (IS_RUNNING) break;
            var obj = getGrid(cursor);
            if (!obj){
                if (field==1) {
	                liveCell(cursor, POS_ODD, 1 );          	
                }
                else {
                	liveCell(cursor, POS_EVEN, 1 );
                }
              

              mainGrid.put(cursor[0],cursor[1],cursor[2], 1);
            }
            else if (gRule.STATES == 3 && obj.state === 1){
                killCell(cursor);
                updateHash(); 
                gInitialHash = lasthash;
                gInitialFrame = frame;
                render();
                if (field==1) {
	                liveCell(cursor, NEG_ODD, -1 );          	
                }
                else {
                	liveCell(cursor, NEG_EVEN, -1 );
                }
                mainGrid.put(cursor[0],cursor[1],cursor[2], -1);
            }
            else{
              killCell(cursor);
              mainGrid.put(cursor[0],cursor[1],cursor[2], 0)
              
            }
            
            updateHash(); 
            gInitialHash = lasthash;
            gInitialFrame = frame;
            render();
            break;
    }
}



function adjustCamera(){
    camera.position.x = radius * Math.sin(theta * Math.PI / 360) * Math.cos(phi * Math.PI / 360);
    camera.position.y = radius * Math.sin(phi * Math.PI / 360);
    camera.position.z = radius * Math.cos(theta * Math.PI / 360) * Math.cos(phi * Math.PI / 360);
    if (DEBUG) console.log("camera:", camera.position)
    camera.updateMatrix();
}
function onDocumentMouseDown(event){
    if (gMoodalInEffect) return;
    if (scrollBarX && window.innerWidth - event.clientX < 30) {
        return;
    }
    event.preventDefault();
    
    isMouseDown = true;
    
    onMouseDownTheta = theta;
    onMouseDownPhi = phi;
    onMouseDownPosition.x = event.clientX;
    onMouseDownPosition.y = event.clientY;
    
}
function onDocumentMouseMove( event ) {
    if (gMoodalInEffect) return;
    if(scrollBarX && window.innerWidth - event.clientX < 30) {
        return;
    }
    var dx = event.clientX - onMouseDownPosition.x;
    var dy = event.clientY - onMouseDownPosition.y;
//if(DEBUG) console.log("dx, dy:", dx, dy)
    event.preventDefault();
    if ( isMouseDown ) {
        theta = - ( ( event.clientX - onMouseDownPosition.x ) * 0.5 ) + onMouseDownTheta;
        phi = ( ( event.clientY - onMouseDownPosition.y ) * 0.5 ) + onMouseDownPhi;
        phi = Math.min( 180, Math.max( -180, phi ) );
        adjustCamera();
        //var collisionray =THREE.Ray({camera.position.x,camera.position.y,camera.position.z},{theta,phi,0});
        //collisionray.get
        render();
    }
}
function onDocumentMouseUp( event ) {
    if (gMoodalInEffect) return;
    if(scrollBarX && window.innerWidth - event.clientX < 30) {
        return;
    }
    //event.preventDefault();
    isMouseDown = false;
    onMouseDownPosition.x = event.clientX - onMouseDownPosition.x;
    onMouseDownPosition.y = event.clientY - onMouseDownPosition.y;
}
function onDocumentMouseWheel( event ) {
    if (gMoodalInEffect) return;
    event.preventDefault();
    if (event.detail) {                         /// ugh, dumb Firefox hack
        if (event.detail > 0) {
            radius += 120;
        }
        else {
            radius -= 120;
        }
    }
    else {
        if (event.wheelDeltayY) {
            radius -= event.wheelDeltaY;       /// chrome?
        }
        else {
            if (event.wheelDelta) {             /// IE! & opera I hear
                radius -= event.wheelDelta;
            }
            // else fuggedaboudit
        }
    }
    if (DEBUG) console.log("mw ev:", radius)
    camera.position.x = radius * Math.sin( theta * Math.PI / 360 ) * Math.cos( phi * Math.PI / 360 );
    camera.position.y = radius * Math.sin( phi * Math.PI / 360 );
    camera.position.z = radius * Math.cos( theta * Math.PI / 360 ) * Math.cos( phi * Math.PI / 360 );
    camera.updateMatrix();
    render();


    
 //    event.preventDefault();
 //    if (event.detail) {							/// ugh, dumb Firefox hack
 //        if (event.detail > 0) {
 //            radius += 120;
 //        }
 //        else {
 //            radius -= 120;
 //        }
 //    }
 //    else {
 //        if (event.wheelDeltayY) {
 //            radius -= event.wheelDeltaY;       /// chrome?
 //        }
 //        else {
 //            if (event.wheelDelta) {             /// IE! & opera I hear
 //                radius -= event.wheelDelta;
 //            }
 //            // else fuggedaboudit
 //        }
 //    }
	// if (DEBUG) console.log("mw ev:", radius)
 //    camera.position.x = radius * Math.sin( theta * Math.PI / 360 ) * Math.cos( phi * Math.PI / 360 );
 //    camera.position.y = radius * Math.sin( phi * Math.PI / 360 );
 //    camera.position.z = radius * Math.cos( theta * Math.PI / 360 ) * Math.cos( phi * Math.PI / 360 );
 //    camera.updateMatrix();
 //    render();
}
function setBrushColor( value ) {
    color = value;
    brush.material[ 0 ].color.setHex( colors[ color ] ^ 0x4C000000 );
    render();
}

function setRule(rule){
    var url = rule;
    cursor = gLastCursor;
    setBrushPosition(cursor);
    clearScreen();
    reset();
    history.replaceState(url, url, url);
    gLastRefreshedUrl = url;
}

function refreshUrl(hash) {
    //console.log("should refresh:", url);
    var url = hash2url(hash);
    gInitialHash = hash;
    gInitialFrame = frame;
    if (history.replaceState) {
        if(url != gLastRefreshedUrl) {
            history.replaceState(url, url, url);
        }
        gLastRefreshedUrl = url;
    }
    else {
        
        document.location = url;
    }
}
function buildFromHash(hash) {
    var phase = hash.substr(hash.length-1, hash.length);
    if (phase=='a') phase = "10";							// phase is 0-11 in hex
    if (phase=='b') phase = "11";
    frame = parseInt(phase);
    if ('' + frame == "NaN") {
        frame = 0;
    }
    else {
        hash = hash.substr( 0, hash.length - 1 );
    }
    var states = 2;
    if (frame >= 6) {
    	states = 3;											// really means new load/save protocol	
    	frame -= 6;
    }
    var data = hash;
    data = encdec_decode(data);
    if (states==3) {
	    var len_p = data.shift();	
    }
    else {
    	len_p = data.length;
    }
    var cur = [0, 0, 0];
    var x = 0;
    var delta, sign;
    while (x < data.length) {
        var state = 1;
    	if (x == len_p) cur = [0, 0, 0];
        if (x >= len_p) state = -1;
        for (var i = 0; i < 3; i++) {
            delta = data[x++];
            cur[i] += delta;
        }
        var parity = (cur[0] + cur[1] + cur[2]) & 1;
        // var voxel = new THREE.Mesh(cube, new THREE.MeshColorFillMaterial(colors[parity * 5]));
        // //voxel.position.x = cur[0] * 50 + 25;
        // //voxel.position.y = cur[1] * 50 + 25;
        // //voxel.position.z = cur[2] * 50 + 25;
        // setObjPosition(voxel, cur);
        // voxel.overdraw = true;
        // scene.addObject(voxel);
        // putGrid(voxel, cur);
                           
        // var threejs = new THREE.Mesh( cube, new THREE.MeshColorFillMaterial( colors[ parity * 5 ] ) );
        // var cell_obj = new CellObj(threejs, 1 );

		var cc;
		if (parity && state==1) cc = POS_ODD;
		if (parity && state==-1) cc = NEG_ODD;
		if (!parity && state==1) cc = POS_EVEN;
		if (!parity && state==-1) cc = NEG_EVEN;
        var cell_obj = liveCell(cur, cc, state);
        mainGrid.put(cur[0],cur[1],cur[2], state)

        //voxel.position.x = cur[0] * 50 + 25;
        //voxel.position.y = cur[1] * 50 + 25;
        //voxel.position.z = cur[2] * 50 + 25;
        // console.log("bloody cell: ", cell_obj);
        var overdraw_bool = true;
        cell_obj.threejs.overdraw = true;
    }
    updateHash();
}

//sometimes you actualy want to put the coordinates in to build
function buildFromCoords(coords){
    for(var i=0; i<coords.length; i++) {
        var cur = coords[i];
        var parity = (cur[0] + cur[1] + cur[2]) & 1;
        var voxel = new THREE.Mesh(cube, new THREE.MeshColorFillMaterial(colors[parity * 5]));
        setObjPosition(voxel, cur);
        voxel.overdraw = true;
        scene.addObject(voxel);
        putGrid(voxel, cur);
    }
    updateHash();
}

function putTheCellInTheGridAndRedraw(cell_obj, cursor, overdraw_bool){
  setObjPosition(cell_obj.threejs, cursor);
  cell_obj.threejs.overdraw = true;
  scene.addObject(cell_obj.threejs);
  putGrid(cell_obj, cursor);

}

//creates a url that you would go to that uses the hash as a query
function hash2url(hash){
    var sep = "?";
    var url = "" + window.location;
    if (url[url.length-1] == "/") url = url.substr(0, url.length-1)
    var i = url.indexOf('?hash=');
    if (i == -1) {
        i = url.indexOf('&hash=');
        if (i == -1) {
            if (url.indexOf("?") > -1) 
                sep = "&"
            i = url.indexOf("/#");
            if (i == -1) {
                i = url.length;
            }
        }
        else {
            sep = "&";
        }
    }
    url = url.substr(0, i) + sep + "hash=" + hash;
    return url;
}

// helper for updateHash
function linearizeCoords(keys, data, cur) {
	var cellCount = 0;
    for (var k in keys) {
        key = keys[k];
        xyz = eval("[" + key + "]");
        var skip = false;
        for (var j = 0; j < 3; j++) {
            if (xyz[j] < axisMin || xyz[j] > axisMax) {
                skip = true;
                break;
            }
        }
        if (skip) continue;
        for (var j = 0; j < 3; j++) {
            var delta = xyz[j] - cur[j];
            data.push(delta);
        }
        cur = xyz;
        cellCount++;
    }
    return cellCount;
}

// This actually creates the hash URL
// We need to think about how we want to share configurations
// Dan is using a hash but it is a quick and dirty solution. Might be something better
function updateHash(noLink) {
    var key;
    var keys_p = [];
    var keys_n = [];

    for (key in visual_and_numerical_grid) {
        var xyz = eval("[" + key + "]");
        var outOfBounds = false;
        for (i=0; i<3; i++) {
            if (xyz[i] > axisMax || xyz[i] < axisMin) {
                outOfBounds = true;
                break;
            }
        }
        if (outOfBounds) continue;
    	if (visual_and_numerical_grid[key]['state'] == -1) {
	        keys_n.push(key);
    	}
    	else if (visual_and_numerical_grid[key]['state'] == 1) {
	        keys_p.push(key);
    	}
    	else {
    		console.log("ERROR -- state undefined:", key, visual_and_numerical_grid[key])
    		// alert("ERROR state != 1 | -1")
    	}
    }
    /// traveling salesman or min span tree would be better here (optimize for small deltas on all 3 coords)
    keys_p.sort();
    keys_n.sort();
    var oldCount = cellCount;
    cellCount = 0;
    // var data = [];
    var data = [keys_p.length * 3];
    var cur = [0, 0, 0];

    cellCount += linearizeCoords(keys_p, data, cur);
	var data2 = [];
    cur = [0, 0, 0];
    cellCount += linearizeCoords(keys_n, data2, cur);
    data = data.concat(data2);
    data = encdec_encode(data);
    phase = ((frame % 6 + 6) % 6)			// crazy JS negaive mod hack
    data += "0123456789ab"[phase+6]		    // OMG look at that! +6 = 3state
    if (!noLink) {                          // yuck. The part of my job I hate
        gUpdateHash = data;
    }
    if (data != lasthash) {
        if (data == gInitialHash) {
            document.getElementById("duplicates").innerHTML = "cycle: " + Math.abs(frame - gInitialFrame) + " match: frame " + frame + "=" + gInitialFrame;
            gInitialFrame = frame;
        }
    }
    document.getElementById('cellcount').innerHTML = cellCount;
    if (cellCount != oldCount) {
        gInitialHash = data;
        gInitialFrame = frame;
    }
    lasthash = data;
    // if (!IS_RUNNING && typeof(console) != "undefined" && console.log) console.log("last hash:", data);
    if (data.length > 12) {
        data = data.substr(0,5) + ".." + data.substr(data.length-5)
    }
    document.getElementById('showhash').innerHTML = data;
    // if (qargs.science == true && typeof(console) != "undefined" && console.log) console.log(''+coords)
}

function render() {
    renderer.render( scene, camera );
}

function clearGrid() {
    cursor = [0, 0, 0]
    setBrushPosition(cursor);
    clearScreen();
    if (lastSelectedEl) lastSelectedEl.style.backgroundColor="#ddd";
    processSpeed = "slow";
    updateHash();
    refreshUrl(gUpdateHash);
}

function reset(hash) {
    if (!hash) hash = gUpdateHash;
    cursor = gLastCursor;
    setBrushPosition(cursor);
    clearScreen();
    buildFromHash(hash);
    refreshUrl(gUpdateHash);
    document.getElementById("duplicates").innerHTML = "";
}

function update(){
    if (lastSelectedEl) {
        lastSelectedEl.style.backgroundColor="#ddd";
    }
    updateHash();
    refreshUrl(gUpdateHash);
}



function selectHash(hash, el, size, trail) {
    if (!trail) {
        AVG_TRAIL = false;
        CELL_TRAIL = false;
    }
    if (trail || (size && size != (axisMax - axisMin + 1))) {
        var trailopt = "";
        if (trail) {
            trailopt = "&trail=" + trail;
        }
        document.location = "/?size=" + size + trailopt + "&sel=" + el.id + "&hash=" + hash;
        if (DEBUG) console.log("size and size!!!");
    }
    else {
        if (lastSelectedEl) {
            lastSelectedEl.style.backgroundColor = "#ddd";
        }
        if (DEBUG) console.log("no pick me!!!");
        reset(hash);
        el.style.backgroundColor = "cyan";
        lastSelectedEl = el;
    }
}

function clearScreen() {
    IS_RUNNING = false;
    visual_and_numerical_grid = {};
    mainGrid.clear();
    gThreeUsed = [];			// these guys are trooublesome
    gThreeUnused = [];
    var i = 0;
    while ( i < scene.objects.length ) {
        object = scene.objects[ i ];
        if ( object instanceof THREE.Mesh && object !== plane && object !== brush ) {
            scene.removeObject( object );
            continue;
        }
        i ++;
    }
    frame = 0;
    avg_trail_a = [];
    cell_trail_a = [];
    lasthash = "";
    if (!qargs.science) direction = "forward";
    document.getElementById("direction").innerHTML = direction;
    document.getElementById("generation").innerHTML = "";
    document.getElementById("showphase").innerHTML = "";
    document.getElementById("duplicates").innerHTML = "";
    document.getElementById("cellcount").innerHTML = "";
    setTimeout(render, 100);
}

function randomCells(){
    document.getElementById("random_prompt_width").value = '' + randWidth;
    document.getElementById("random_prompt_count").value = '' + randCount;
    document.getElementById("random_prompt_ratio").value = '' + randRatio;
    moodal("random_prompt", function(result){
        if (DEBUG) console.log("result:", result)
        if (result != "OK") return;
        var width = parseFloat(document.getElementById("random_prompt_width").value);
        var count = parseInt(document.getElementById("random_prompt_count").value);
        var ratio = parseFloat(document.getElementById("random_prompt_ratio").value);
        var axMax, axMin;
        if (width != parseInt(width)) {
            var tot = axisMax - axisMin;
            width = parseInt(tot * width);
            axMax = [axisMax, axisMax, axisMax];
            axMin = [tot - width + axisMin, axisMin, axisMin];
        }
        else {
            width = parseInt(width);
            randWidth = width;
            randCount = count;
            randRatio = ratio;
            axMax = parseInt(width - .5) >> 1;
            axMin = axMax - (width - 1);
            axMax = [axMax, axMax, axMax];
            axMin = [axMin, axMin, axMin];
        }
        clearScreen();
        if (lastSelectedEl) 
            lastSelectedEl.style.backgroundColor = "#ddd";
        cursor = [0, 2000, 0];
        for (i = 0; i < count; i++) {
            var phase = -1;
            var targPhase = i < (count * ratio - 0.5)?0:1;
            while ((cursor in visual_and_numerical_grid) || (phase != targPhase)) {
                for (var axis = 0; axis < 3; axis++) {
                    cursor[axis] = Math.floor(Math.random() * (axMax[axis] - axMin[axis] + 1) + axMin[axis]);
                }
                phase = (cursor[0] + cursor[1] + cursor[2]) & 1;
            }
            setBrushPosition(cursor);
            
            var threejs = new THREE.Mesh( cube, new THREE.MeshColorFillMaterial( colors[color] ) );
            var cell_obj = new CellObj(threejs, 1 );
            var overdraw_bool = true;
            putTheCellInTheGridAndRedraw(cell_obj, cursor, overdraw_bool);
            
        }
        
        updateHash();
        refreshUrl(gUpdateHash);
        reset(gUpdateHash);
    });
}
// https://gist.github.com/665235
function decode( string ) {
    var output = [];
    string.split('').forEach( function ( v ) { output.push( "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/".indexOf( v ) ); } );
    return output;
}
function encode( array ) {
    var output = "";
    array.forEach( function ( v ) { output += "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/".charAt( v ); } );
    return output;
}
function fastSlow() {
    console.log("speed", processSpeed);
    switch (processSpeed) {
        case "slow":
            processSpeed = "fast";
            break;
        case "fast":
            processSpeed = qargs.science?"science":"slow";
            break;
        case "science":
            processSpeed = "slow";
            break;
    }
    document.getElementById("showspeed").innerHTML = processSpeed;
}

function toggleTrails() {
    if (AVG_TRAIL || CELL_TRAIL) {
        AVG_TRAIL = false;
        CELL_TRAIL = false;
        //alert("Trails disabled");
        moodal('trails_disabled', function () {
        })
        var t = cell_trail_a.concat(avg_trail_a);
        for (var i=0; i<avg_trail_a.length + cell_trail_a.length; i++) {
            var obj = t[i];
            scene.removeObject(obj);
        }
        avg_trail_a = [];
        cell_trail_a = [];
    }
    else {
        moodal("trail_type", function (result) {
            var len = parseInt(document.getElementById("trail_length").value);
            if (result == 'cell') {
                CELL_TRAIL = len;
            }
            else {
                AVG_TRAIL = len;
            }
        });
    }
}

function htmlPadSpaces(n, pad) {
    var s = '' + n;
    var len = s.length;
    for (var i=0; i < pad - len; i++) {
        s = '&nbsp;' + s;
    }
    return s;
}

function log(s){
    var req = new XMLHttpRequest();
    if (req) {
        req.onreadystatechange = function(){
            if (req.readyState == 4) {
                if (req.status && req.status != 200) {
                    Kata.error("Error loading Document: status " + req.status + " for url " + url);
                }
                else {
                    if (req.responseText.indexOf("OK") < 0) {
                        alert("log error: " + req.responseText)
                    }
                }
            }
        }
        req.open("POST", "log.py", true);
        req.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
        req.send(s);
    }
}
function scienceTest(){
    if (DEBUG) console.log("SCIENCE!");
    gScienceCounterInit = 100000;
    gScienceTrials = 1000;
    gScienceBatch = 1000;
    gScienceTrial = 0;
    scienceTestInit();
}
function scienceTestInit() {
    document.getElementById("debug").innerHTML = "" + gScienceTrial + " out of " + gScienceTrials;
    gScienceCounter = gScienceCounterInit;
    randomCells_(5, 12, 0.25);
    if (DEBUG) console.log("DEBUG frame at beginning:", frame);
    gStartHash = lasthash;
    processSpeed = "test";
    //console.log("DEBUG lasthash:", lasthash)
    IS_RUNNING = true;
    setTimeout(scienceTestLoop, 10);
}   

function scienceTestLoop(){
    var startCellCount = cellCount;
    var count = Math.min(gScienceCounter, gScienceBatch);
    for (var i = 0; i < count; i++) {
        mainLoop(true);
        //console.log("DEBUG trial:", gScienceTrial, "frame:", frame, "counter:", gScienceCounter)
        gScienceCounter--;
        if ((lasthash == gInitialHash) || (startCellCount != cellCount)) {
            gScienceCounter = 0;
            break;
        }
    }
    render();
    if (gScienceCounter) {
        setTimeout(scienceTestLoop, 1);
    }
    else {
        if (DEBUG) console.log("DEBUG trial over. gScienceCounter: ", gScienceCounter, "trial:", gScienceTrial, "hash:", gStartHash)
        IS_RUNNING = false;
        processSpeed = "slow";
        var result;
        if (startCellCount != cellCount) {
            result = "death";
        }
        else if (lasthash == gInitialHash) {
            result = "cycle,";
        }
        else {
            result = "timeout,,";
        }
        log("LOG_TO_FILE\nscience.log\ntrial," + gScienceTrial + ",hash," + gStartHash + "," + result + "," + frame + "\n");
        gScienceTrial++;
        if (gScienceTrial < gScienceTrials) {
            scienceTestInit();
        }
        else {
            alert("Science as we know it is over");
        }
    }
}
//]]>
