import { useRef, useEffect } from "react";
import css from "../styles/ModelDisplay.module.css";

import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

const ModelDisplay = ({ modelUrl }) => {
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

        // -----------------------------------------------------
        // 🔥🔥🔥 CLEAN, REALISTIC, COLOR-ACCURATE LIGHTING 🔥🔥🔥
        // -----------------------------------------------------

        // Soft ambient environment light (natural bounce)
        const hemiLight = new THREE.HemisphereLight(0xffffff, 0x222222, 1.2);
        hemiLight.position.set(0, 20, 0);
        scene.add(hemiLight);

        // Main studio key light — like Amazon/Myntra showroom
        const keyLight = new THREE.DirectionalLight(0xffffff, 1.8);
        keyLight.position.set(5, 10, 7);
        scene.add(keyLight);

        // Gentle fill light to soften shadows
        const fillLight = new THREE.DirectionalLight(0xffffff, 0.8);
        fillLight.position.set(-5, 5, -3);
        scene.add(fillLight);

        // -----------------------------------------------------
        // END LIGHTS
        // -----------------------------------------------------

        const controls = new OrbitControls(camera, renderer.domElement);

        const loader = new GLTFLoader();
        let model = null;

        loader.load(
            modelUrl,
            (gltf) => {
                model = gltf.scene;

                // Fix Sketchfab scale issues
                model.scale.set(50, 50, 50);
                model.rotation.set(0, 0, 0);
                model.position.set(0, 0, 0);

                // Center the model
                const box = new THREE.Box3().setFromObject(model);
                const center = new THREE.Vector3();
                box.getCenter(center);
                model.position.sub(center);

                scene.add(model);

                controls.target.set(0, 0, 0);
                camera.lookAt(0, 0, 0);
                controls.update();
            },
            undefined,
            (err) => console.error("GLB Load Error:", err)
        );

        // Orbit control settings
        controls.enableDamping = true;
        controls.enablePan = false;
        controls.enableZoom = true;

        let frameId;
        const animate = () => {
            frameId = requestAnimationFrame(animate);
            controls.update();
            renderer.render(scene, camera);
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
    }, [modelUrl]);

    return (
        <div ref={mountRef} id={css["model-display"]}>
            <canvas ref={canvasRef}></canvas>
        </div>
    );
};

export default ModelDisplay;
