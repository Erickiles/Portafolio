// Base de datos de tus proyectos clasificados
const baseDeDatosProyectos = {
    quirurgica: {
        titulo: "Surgical Planning and Segmentation of Biomodels",
        proyectos: [
            { nombre: "Skull Segmentation", desc: "Segmentation of a patient's cranial biomodel and its subsequent modification for migraine surgical planning.", stl: "stl/Craneo.stl" },
            { nombre: "Brain Aneurysm", desc: "Segmentation and 3D printing of a cerebral aneurysm from a DICOM image for surgical planning.", stl: "stl/aneurisma.stl" },
            { nombre: "Lower Limb Biomodels", desc: "Segmentation of biomodels of the femur and tibia before and after total knee replacement for subsequent assembly and finite element analysis.", stl: "stl/rodilla.stl" }
        ]
    },
    dispositivos: {
        titulo: "Medical Device Design (CAD/CAM)",
        proyectos: [
            { nombre: "Zimmer Biomet Knee Prosthesis", desc: "Modeling of the prosthetic components of the Zimer Biomet knee prosthesis for finite element structural analysis.", stl: "stl/protesis.stl"},
            { nombre: "Video Laryngoscope", desc: "Design and manufacture of a custom videolaryngoscope for use with a smartphone at a medical simulation clinic.", stl: "stl/larongoscopio.stl"},
            { nombre: "Mechanical Fan Part", desc: "Reconstruction of a part of a mechanical ventilator used on a manikin at a medical simulation clinic.", stl: "stl/ventilador.stl" },
            { nombre: "Forearm prosthesis", desc: "Design and fabrication of a mechanical prosthetic arm controlled by tension cables.", stl: "stl/Protesis brazo.stl" },
            { nombre: "Lower Limb Prosthesis Cover", desc: "Design and manufacture of a custom socket for a Game of Thrones fan.", stl: "stl/biocover.stl" },
            { nombre: "Socket for a transfemoral prosthesis", desc: "Custom design of a 3D-printed socket.", stl: "stl/Prótesis pierna.stl" },
            { nombre: "Biomechanical carbon fiber foot", desc: "Design of a carbon fiber prosthetic foot.", stl: "stl/Pie biomecanico.stl"}

        ]
    },
    robotica: {
        titulo: "Robotics and Bionic Systems",
        proyectos: [
            { nombre: "Rootic finger", desc: "Mechanical design of a robotic finger with a speed-controlled DC motor and gears.", stl: "stl/dedo robotico.stl"},
            { nombre: "Hand Exoskeleton for Arthritis", desc: "Hand rehabilitation prototype with speed-controlled motors designed in Fusion 360.", stl: "stl/exoesqueleto.stl" },
            { nombre: "Animatronic Eye System", desc: "Design and construction of an animatronic system as part of my training in bionic technology.", stl: "stl/Animatronico.stl" }
        ]
    },
    simulacion: {
        titulo: "Modeling and Simulation",
        proyectos: [
            { nombre: "Bifurcación Arterial", desc: "Modelado y simulación por elementos finitos de mecánica de fluidos (CFD) en COMSOL." },
            { nombre: "Design of a C-130 aircraft", desc: "Design inspired by a real aircraft for model aircraft in SolidWorks.", stl: "stl/c130 ensamblaje.stl" }
        ]
    }
};

function abrirCategoria(categoriaId) {
    const infoCategoria = baseDeDatosProyectos[categoriaId];
    document.getElementById('modal-titulo').textContent = infoCategoria.titulo;
    const galeria = document.getElementById('modal-galeria');
    galeria.innerHTML = '';
    
    infoCategoria.proyectos.forEach(proyecto => {
        const tarjetaHtml = `
            <div class="proyecto-card">
                <h4>${proyecto.nombre}</h4>
                <p>${proyecto.desc}</p>
                <button class="btn-3d" onclick="abrirVisor3D('${proyecto.stl}', '${proyecto.nombre}')">
                    <i class="fas fa-cube"></i> Ver Modelo 3D
                </button>
            </div>
        `;
        galeria.innerHTML += tarjetaHtml;
    });
    
    document.getElementById('modal-proyectos').classList.add('active');
}

function cerrarModal() {
    document.getElementById('modal-proyectos').classList.remove('active');
}

// =========================================================
// 3. EL MOTOR GRÁFICO (THREE.JS PARA STL)
// =========================================================
let animationId; // Para poder detener la animación al cerrar

function abrirVisor3D(archivoSTL, nombreProyecto) {
    // Abrir la ventana del visor y ponerle título
    document.getElementById('modal-3d').classList.add('active');
    document.getElementById('titulo-3d').textContent = nombreProyecto;
    
    const contenedor = document.getElementById('contenedor-canvas');
    contenedor.innerHTML = ''; // Limpiar cualquier modelo anterior

    // A. Crear la Escena y la Cámara
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, contenedor.clientWidth / contenedor.clientHeight, 0.1, 1000);
    
    // B. Crear el Renderizador (El motor que dibuja)
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(contenedor.clientWidth, contenedor.clientHeight);
    contenedor.appendChild(renderer.domElement);

    // C. Iluminación (Vital para que el STL no se vea como una mancha negra)
    scene.add(new THREE.AmbientLight(0x404040, 1.5)); // Luz base
    
    const luzDireccional1 = new THREE.DirectionalLight(0xffffff, 1);
    luzDireccional1.position.set(1, 1, 1).normalize();
    scene.add(luzDireccional1);
    
    const luzBionica = new THREE.DirectionalLight(0x0ea5e9, 0.8); // Luz cian tecnológica
    luzBionica.position.set(-1, -1, -1).normalize();
    scene.add(luzBionica);

    // D. Controles (Permite rotar con el mouse)
    const controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true; // Rotación suave

    // E. Cargar el archivo STL
    const loader = new THREE.STLLoader();
    loader.load(archivoSTL, function (geometry) {
        
        // Crear un material estilo "Plástico Médico / Resina"
        const material = new THREE.MeshPhongMaterial({ 
            color: 0xcccccc, 
            specular: 0x111111, 
            shininess: 100 
        });
        const mesh = new THREE.Mesh(geometry, material);
        
        // Matemáticas para centrar el modelo automáticamente sin importar cómo lo exportaste de Fusion 360
        geometry.computeBoundingBox();
        const center = new THREE.Vector3();
        geometry.boundingBox.getCenter(center);
        mesh.position.sub(center); 
        
        // Ajustar la cámara automáticamente al tamaño de la pieza
        const size = geometry.boundingBox.getSize(new THREE.Vector3()).length();
        camera.position.z = size * 1.5;

        scene.add(mesh);
        
    }, undefined, function (error) {
        console.error("Error cargando el STL:", error);
        contenedor.innerHTML = '<p style="color:white; padding: 20px; text-align:center;">No se encontró el archivo STL. Verifica que el archivo esté en la carpeta y se llame exactamente igual.</p>';
    });

    // F. Bucle de Animación (Mantiene la pantalla actualizándose a 60fps)
    function animate() {
        animationId = requestAnimationFrame(animate);
        controls.update();
        renderer.render(scene, camera);
    }
    animate();
}

function cerrarVisor3D() {
    document.getElementById('modal-3d').classList.remove('active');
    cancelAnimationFrame(animationId); // Apagamos el motor 3D para que tu compu no se ponga lenta
}
