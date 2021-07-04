var mtlLoader = new THREE.MTLLoader();
mtlLoader.load("skeleton.mtl", function(materials){
  materials.preload();
  var objLoader = new THREE.OBJLoader();
  objLoader.setMaterials(materials);
  objLoader.load("skeleton.obj", function(mesh){
    //mesh.rotation.y = 180;
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );
    camera.position.z = 110;
    camera.lookAt(0, 0, 0)
    const renderer = new THREE.WebGLRenderer({alpha: true,});
    renderer.setSize( window.innerWidth, window.innerHeight );
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 20));
    document.body.appendChild( renderer.domElement );

    const light = new THREE.DirectionalLight(0xFFFFFF, 0.5);
    light.position.set(-1, 2, 4);
    scene.add(light);

    const light2 = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(light2);

    const light3 = new THREE.DirectionalLight(0xFFFFFF, 0.2);
    light3.position.set(1, -2, -4);
    scene.add(light3);

    const controls = new THREE.OrbitControls (camera, renderer.domElement);
    scene.add(mesh);
    var r = 1;
    var w = 1;
    var s1 = 1;
    var s2 = 1;
    var longChange = [];
    var shortChange = [];
    var originalL, originalSX;
    const videoElement = document.getElementsByClassName('input_video')[0];
    const canvasElement = document.getElementsByClassName('output_canvas')[0];
    const canvasCtx = canvasElement.getContext('2d');
    var size;
    mesh.rotation.x = -50;

    function onResults(results) {
      canvasCtx.save();
      canvasCtx.clearRect(0, 0, canvasElement.width, canvasElement.height);
      canvasCtx.drawImage(results.image, 0, 0, canvasElement.width, canvasElement.height);
      w = r;
      s1 = s2;
      if (results.multiHandLandmarks) {
        for (const landmarks of results.multiHandLandmarks) {

          //drawConnectors(canvasCtx, landmarks, HAND_CONNECTIONS,{color: '#00FF00', lineWidth: 5});
          var longG = [landmarks[8],landmarks[5],landmarks[4]]
          drawLandmarks(canvasCtx, landmarks, {color: '#66ffef', lineWidth: 2});
          function find_angle(A,B,C) {
            var AB = Math.sqrt(Math.pow(B.x-A.x,2)+ Math.pow(B.y-A.y,2));
            var BC = Math.sqrt(Math.pow(B.x-C.x,2)+ Math.pow(B.y-C.y,2));
            var AC = Math.sqrt(Math.pow(C.x-A.x,2)+ Math.pow(C.y-A.y,2));
            return Math.acos((BC*BC+AB*AB-AC*AC)/(2*BC*AB));
          }
          var angle = find_angle(longG[0], longG[1], longG[2]) / Math.PI
          var es = Math.abs(landmarks[5].x - 0.5);
          var elem2 = document.getElementById("zoin");
          var elem3 = document.getElementById("zout");

          if(angle > 0.7){
            drawConnectors(canvasCtx, longG, HAND_CONNECTIONS,{color: '#FFFFFF', lineWidth: 20});
            r = r + 1;
            if(longChange.length == 0){
              originalL = landmarks[5].x
            }else{
              //console.log((originalL - landmarks[5].x) * 10)
              var posiz = (originalL - landmarks[5].x)*10
              camera.position.z = camera.position.z - posiz
              if(posiz >0){
                console.log("Zoom IN")
                elem3.style.color = 'red';
                elem2.style.color = '#bbb';
              }else{
                console.log("Zoom OUT")
                elem2.style.color = 'red';
                elem3.style.color = '#bbb';
              }
            }
          }else{
            elem2.style.color = '#bbb';
            elem3.style.color = '#bbb';
          }
          var shortG = [landmarks[8], landmarks[4]]
          var distance = Math.sqrt( Math.pow( shortG[0].x - shortG[1].x, 2 ) + Math.pow( shortG[0].y - shortG[1].y, 2 ) + Math.pow( shortG[0].z - shortG[1].z, 2 ) ) ;
          var elem1 = document.getElementById("rot");
          if(distance < 0.1 ){
            drawLandmarks(canvasCtx, shortG, {color: '#FFFFFF', lineWidth: 30});
            elem1.style.color = 'red';
            s1 = s1 + 1;
            if(shortChange.length == 0){
              originalSX= landmarks[5].x
              originalSY= landmarks[5].y
            }else{
              //console.log(originalSX - landmarks[5].x)
              //camera.lookAt(0, 0, 0)
              var xd = (originalSX - landmarks[5].x) * 1
              var yd = (originalSY - landmarks[5].y) * 1
              mesh.rotation.y = mesh.rotation.y + xd
              mesh.rotation.x = mesh.rotation.x - yd
            }
          }else{
            elem1.style.color = '#bbb';
          }
        }
      }
      canvasCtx.restore();
      if(w != r){
        longChange.push(r)
      }else{
        longChange = []
      }
      if(s2 != s1){
        shortChange.push(s1)
      }else{
        shortChange = []
      }
      //console.log(camera.position.y)
      controls.update();
      //camera.position.y = cursor.y * 4;
      var howtoOpen = document.getElementById("howto");
      howtoOpen.style.display = 'block';
      var loading = document.getElementById("loading");
      loading.style.display = 'none';
      renderer.render( scene, camera );
    }
    const hands = new Hands({locateFile: (file) => {
      return `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`;
    }});
    hands.setOptions({
      maxNumHands: 2,
      minDetectionConfidence: 0.8,
      minTrackingConfidence: 0.8
    });
    hands.onResults(onResults);
    const cameraM = new Camera(videoElement, {
      onFrame: async () => {
        await hands.send({image: videoElement});
      },

      width: 1280,
      height: 720
    });
    cameraM.start();

  });
});
