import React, { useRef, useEffect } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";

const App = () => {
  const mountRef = useRef(null);
  const canvasRef = useRef(null);

  useEffect(() => {
    if (!mountRef.current || !canvasRef.current) return;

    const width = mountRef.current.clientWidth;
    const height = mountRef.current.clientHeight;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x111118);

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(3, 3, 6);

    const renderer = new THREE.WebGLRenderer({
      canvas: canvasRef.current,
      antialias: true,
    });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(width, height);

    // --- LIGHTS ---
    const directionalLight = new THREE.DirectionalLight(0xffffff, 10);
    directionalLight.position.set(5, 10, 7.5);
    scene.add(directionalLight);

    const ambientLight = new THREE.AmbientLight(0x404040, 2);
    scene.add(ambientLight);

    // --- LOAD GLB MODEL ---
    const loader = new GLTFLoader();
    let model = null;

    loader.load(
      "/models/Shirt2.glb",
      (gltf) => {
        model = gltf.scene;

        // Fix insane Sketchfab transforms
        model.scale.set(50, 50, 50);
        model.rotation.set(0, 0, 0);
        model.position.set(0, 0, 0);

        // Center geometry
        const box = new THREE.Box3().setFromObject(model);
        const center = new THREE.Vector3();
        box.getCenter(center);
        model.position.sub(center);

        // Add to scene
        scene.add(model);

        // Focus camera on model
        controls.target.set(0, 0, 0);
        camera.lookAt(0, 0, 0);
        controls.update();

        console.log("Model centered:", model);
      },
      undefined,
      (err) => console.error("GLB Load Error:", err)
    );

    const hemiLight = new THREE.HemisphereLight(0xffffff, 0x444444, 3);
    scene.add(hemiLight);

    // Orbit Controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.enablePan = false;
    controls.enableZoom = true;

    let frameId;
    const animate = () => {
      frameId = requestAnimationFrame(animate);

      if (model) {
        // model.rotation.y += 0.005; // spin model slowly
      }

      controls.update();
      renderer.render(scene, camera);
      if (model) console.log("Model Loaded:", model);
    };

    animate();

    const handleResize = () => {
      if (!mountRef.current) return;

      const newWidth = mountRef.current.clientWidth;
      const newHeight = mountRef.current.clientHeight;

      renderer.setSize(newWidth, newHeight);
      camera.aspect = newWidth / newHeight;
      camera.updateProjectionMatrix();
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      cancelAnimationFrame(frameId);
      renderer.dispose();
      controls.dispose();
    };
  }, []);


  return (
    <div className="app-wrapper">
      <div className="left-panel">
        <h1>Cube Viewer</h1>
        <p>A professional 3D viewer built with React + Three.js.</p>

        <div className="control-box">
          <h2>Controls</h2>
          <p>Drag to orbit, scroll to zoom.</p>
          <button onClick={() => console.log("Reset clicked!")}>
            Reset View
          </button>
        </div>
      </div>

      <div ref={mountRef} className="viewer-container">
        <canvas ref={canvasRef} />
      </div>
    </div>
  );
};

export default App;
