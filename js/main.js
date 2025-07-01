// Basic setup: scene, camera, renderer
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 2000);
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);
document.getElementById('scene-container').appendChild(renderer.domElement);

// OrbitControls for camera manipulation
const controls = new THREE.OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.05;
controls.minDistance = 10;
controls.maxDistance = 200;

// Lighting
const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
scene.add(ambientLight);
const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
directionalLight.position.set(-5, 10, 7.5);
scene.add(directionalLight);

// Raycaster for detecting clicks
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

// Array to hold clickable stage objects
const stages = [];

// --- Data for Wastewater Treatment Stages ---
// IMPORTANT: Please save your slide images in the /slides/ directory with the specified filenames.
const STAGES_DATA = [
    // Main physical stages
    { name: 'Screening', type: 'stage', info: 'Removes large objects like plastics, rags, and debris.', slide: 'slides/01_screening.png', color: 0xff6347, position: { x: -60, y: 0, z: 0 }, size: { x: 10, y: 15, z: 10 } },
    { name: 'Primary Treatment', type: 'stage', info: 'Heavy solids settle to the bottom as sludge, while lighter materials float.', slide: 'slides/02_primary_treatment.png', color: 0x4682b4, position: { x: -30, y: 0, z: 0 }, size: { x: 15, y: 10, z: 20 } },
    { name: 'Secondary Treatment', type: 'stage', info: 'Aeration encourages bacteria to consume organic matter.', slide: 'slides/03_secondary_treatment.png', color: 0x32cd32, position: { x: 0, y: 0, z: 0 }, size: { x: 20, y: 12, z: 20 } },
    { name: 'Sludge Management', type: 'stage', info: 'Sludge is treated in a digester to reduce volume and produce biogas.', slide: 'slides/04_sludge_management.png', color: 0x8B4513, position: { x: 30, y: 0, z: 0 }, size: { x: 15, y: 10, z: 20 } },
    { name: 'Tertiary Treatment', type: 'stage', info: 'The effluent is disinfected with chemicals or UV light to kill remaining pathogens.', slide: 'slides/05_tertiary_treatment.png', color: 0x9370db, position: { x: 60, y: 0, z: 0 }, size: { x: 10, y: 8, z: 15 } },

    // Summary info points
    { name: 'Complete Flow', type: 'info_point', info: 'A summary of the entire wastewater treatment journey.', slide: 'slides/06_summary_flow.png', color: 0x17a2b8, position: { x: -30, y: 0, z: 40 } },
    { name: 'Key Impurities', type: 'info_point', info: 'Understanding what is removed at each stage.', slide: 'slides/07_summary_impurities.png', color: 0x17a2b8, position: { x: 0, y: 0, z: 40 } },
    { name: 'Anaerobic Digestion', type: 'info_point', info: 'The significance of anaerobic digestion and biogas production.', slide: 'slides/08_summary_biogas.png', color: 0x17a2b8, position: { x: 30, y: 0, z: 40 } },
    { name: 'Key Takeaways', type: 'info_point', info: 'Key takeaways and next steps.', slide: 'slides/09_summary_takeaways.png', color: 0x17a2b8, position: { x: 60, y: 0, z: 40 } },
];

// --- Create 3D Representations for Stages ---
function createStage(data) {
    const isInfoPoint = data.type === 'info_point';
    
    // Use a box for stages and a cylinder for info points
    const geometry = isInfoPoint 
        ? new THREE.CylinderGeometry(5, 5, 2, 32) 
        : new THREE.BoxGeometry(data.size.x, data.size.y, data.size.z);

    const material = new THREE.MeshStandardMaterial({ color: data.color, roughness: 0.5, metalness: 0.1 });
    const stageMesh = new THREE.Mesh(geometry, material);

    // Set position based on type
    if (isInfoPoint) {
        stageMesh.position.set(data.position.x, data.position.y + 1, data.position.z);
    } else {
        stageMesh.position.set(data.position.x, data.position.y + data.size.y / 2, data.position.z);
    }

    stageMesh.name = data.name;
    stageMesh.userData = { 
        info: data.info,
        slide: data.slide
    };
    
    scene.add(stageMesh);
    stages.push(stageMesh);
}

STAGES_DATA.forEach(createStage);

// Create a ground plane
const groundGeometry = new THREE.PlaneGeometry(200, 100);
const groundMaterial = new THREE.MeshStandardMaterial({ color: 0x223344, side: THREE.DoubleSide });
const ground = new THREE.Mesh(groundGeometry, groundMaterial);
ground.rotation.x = -Math.PI / 2;
scene.add(ground);

// Camera initial position
camera.position.set(0, 60, 100);
camera.lookAt(scene.position);

// --- Event Listeners ---
const infoPanel = document.getElementById('info-panel');
const stageName = document.getElementById('stage-name');
const stageInfo = document.getElementById('stage-info');
const stageSlide = document.getElementById('stage-slide');

window.addEventListener('resize', onWindowResize, false);
window.addEventListener('click', onStageClick, false);
document.getElementById('close-button').addEventListener('click', () => {
    infoPanel.style.display = 'none';
    // Reset image src when closing panel
    stageSlide.src = '';
});

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

function onStageClick(event) {
    // Don't trigger if the click is on the info panel itself
    if (infoPanel.style.display === 'block' && infoPanel.contains(event.target)) {
        return;
    }

    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
    raycaster.setFromCamera(mouse, camera);

    const intersects = raycaster.intersectObjects(stages);

    if (intersects.length > 0) {
        const clickedObject = intersects[0].object;
        stageName.innerText = clickedObject.name;
        stageInfo.innerText = clickedObject.userData.info;
        
        // Set the slide image source
        stageSlide.src = clickedObject.userData.slide;

        infoPanel.style.display = 'block';
    } else {
        // Optional: hide panel if clicking outside an object
        // infoPanel.style.display = 'none';
        // stageVideo.src = '';
    }
}

// Animation loop
function animate() {
    requestAnimationFrame(animate);
    controls.update();
    renderer.render(scene, camera);
}

// Start animation
animate();
