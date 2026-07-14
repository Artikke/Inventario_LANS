/* LANS - Registro de Entregas (GitHub Pages + Firebase)
   Almacen registra entregas a areas, Admin ve historial.
   Comparte usuarios con PROESA — usa campo rolLans */

const firebaseConfig = {
    apiKey: "AIzaSyA2TBZwWuebLhxb32BYcxr4DGb1A-iDC84",
    authDomain: "sistema-de-inventario-proesa.firebaseapp.com",
    projectId: "sistema-de-inventario-proesa",
    storageBucket: "sistema-de-inventario-proesa.firebasestorage.app",
    messagingSenderId: "788858693454",
    appId: "1:788858693454:web:e506cb5184a44f4ce6201f"
};

firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db   = firebase.firestore();

let secondaryApp = null;
try {
    secondaryApp = firebase.app('secondary');
} catch {
    secondaryApp = firebase.initializeApp(firebaseConfig, 'secondary');
}
const secondaryAuth = secondaryApp.auth();

let currentUser = null;
let currentUid  = null;

let AREAS = [
    'Biologia Molecular',
    'Logistica',
    'Calidad',
    'Almacen',
    'Subrogados',
    'Citometria y Hematologia',
    'Citologia',
    'Inmunologia',
    'Microbiologia',
    'Neonatologia',
    'Recepcion de Muestras'
];

async function cargarAreas() {
    try {
        const doc = await db.collection('lans_config').doc('areas').get();
        if (doc.exists && doc.data().lista && doc.data().lista.length > 0) {
            AREAS = doc.data().lista.sort();
        } else {
            await db.collection('lans_config').doc('areas').set({ lista: AREAS.sort() });
        }
    } catch (e) {}
}

async function showAreas() {
    setActiveNav('showAreas');
    const main = document.getElementById('mainContent');
    await cargarAreas();
    const rows = AREAS.map(a => `
        <tr>
            <td>${a}</td>
            <td class="text-end" style="width:80px">
                <button class="btn btn-outline-danger btn-sm" onclick="eliminarArea('${a.replace(/'/g, "\\'")}')">
                    <i class="bi bi-trash"></i>
                </button>
            </td>
        </tr>`).join('');
    main.innerHTML = `
        <div class="card card-lans">
            <div class="card-header card-header-lans d-flex justify-content-between align-items-center">
                <span><i class="bi bi-diagram-3 me-2"></i>Areas (${AREAS.length})</span>
            </div>
            <div class="card-body">
                <div class="input-group mb-3" style="max-width:400px">
                    <input type="text" id="nuevaArea" class="form-control" placeholder="Nueva area...">
                    <button class="btn btn-lans" onclick="agregarArea()">
                        <i class="bi bi-plus-lg me-1"></i>Agregar
                    </button>
                </div>
                <table class="table table-lans table-hover mb-0">
                    <thead><tr><th>Area</th><th></th></tr></thead>
                    <tbody>${rows}</tbody>
                </table>
            </div>
        </div>`;
}

async function agregarArea() {
    const input = document.getElementById('nuevaArea');
    const nombre = input.value.trim();
    if (!nombre) return;
    if (AREAS.includes(nombre)) { showAlert('Esa area ya existe', 'warning'); return; }
    AREAS.push(nombre);
    AREAS.sort();
    await db.collection('lans_config').doc('areas').set({ lista: AREAS });
    showAlert(`Area "${nombre}" agregada`, 'success');
    showAreas();
}

async function eliminarArea(nombre) {
    if (!confirm(`Eliminar el area "${nombre}"?`)) return;
    AREAS = AREAS.filter(a => a !== nombre);
    await db.collection('lans_config').doc('areas').set({ lista: AREAS });
    showAlert(`Area "${nombre}" eliminada`, 'warning');
    showAreas();
}

const PRODUCTOS = {
    'Carpetas y Archivadores': [
        { nombre: 'Carpeta Blanca 1"', unidad: 'Pieza', costo: 51.17 },
        { nombre: 'Carpeta Blanca 3"', unidad: 'Pieza', costo: 49.11 },
        { nombre: 'Folder tamano carta color manila', unidad: 'Pieza', costo: 1.58 },
        { nombre: 'Protector de hojas tamano carta (paquete c/100)', unidad: 'Pieza', costo: 66.68 },
        { nombre: 'Revistero Negro tamano carta', unidad: 'Pieza', costo: 82.5 }
    ],
    'Cintas y Adhesivos': [
        { nombre: 'Cinta Acroprint Negro, para reloj checador TR 810', unidad: 'Pieza', costo: 110.83 },
        { nombre: 'Cinta diurex', unidad: 'Pieza', costo: 7.98 },
        { nombre: 'Cinta Etiquetadora Brother QL 800 (DK2210)', unidad: 'Pieza', costo: 377.78 },
        { nombre: 'Kola loka', unidad: 'Pieza', costo: 30.52 },
        { nombre: 'Lapiz adhesivo Pritt', unidad: 'Pieza', costo: 27.08 },
        { nombre: 'Masking 1"', unidad: 'Pieza', costo: 38.9 }
    ],
    'Clips y Sujetadores': [
        { nombre: 'Clips #2 (caja con 10 pqts)', unidad: 'Pieza', costo: 68.57 },
        { nombre: 'Clips mariposa #1', unidad: 'Pieza', costo: 18 },
        { nombre: 'Clips mariposa #2', unidad: 'Pieza', costo: 25.2 },
        { nombre: 'Dedales #11 (paquete con 10 pzs)', unidad: 'Pieza', costo: 29.08 },
        { nombre: 'Dedales #13 (paquete con 10 pzs)', unidad: 'Pieza', costo: 29.08 },
        { nombre: 'Engrapadora', unidad: 'Pieza', costo: 59.66 },
        { nombre: 'Grapas estandar', unidad: 'Pieza', costo: 18.31 },
        { nombre: 'Ligas #10', unidad: 'Bolsa', costo: 17.28 },
        { nombre: 'Ligas #18', unidad: 'Bolsa', costo: 17.28 },
        { nombre: 'Pinzas quitagrapas', unidad: 'Pieza', costo: 12.02 }
    ],
    'Cuadernos y Papeleria': [
        { nombre: 'Cuaderno forma francesa cuadro ch', unidad: 'Pieza', costo: 14 },
        { nombre: 'Cuaderno forma francesa cuadro grande', unidad: 'Pieza', costo: 14 },
        { nombre: 'Cuaderno profesional cuadro ch', unidad: 'Pieza', costo: 14.3 },
        { nombre: 'Cuaderno profesional cuadro grande', unidad: 'Pieza', costo: 14.7 },
        { nombre: 'Hojas blancas paquetes de 500 hojas c/u', unidad: 'Pieza', costo: 57 },
        { nombre: 'Regla metalica 30 cm', unidad: 'Pieza', costo: 15.9 },
        { nombre: 'Sacapuntas', unidad: 'Pieza', costo: 1.52 },
        { nombre: 'Tijeras', unidad: 'Pieza', costo: 30.32 }
    ],
    'Escritura': [
        { nombre: 'Lapiz No.2', unidad: 'Pieza', costo: 2.35 },
        { nombre: 'Marcatextos amarillo', unidad: 'Pieza', costo: 69.96 },
        { nombre: 'Marcatextos azul', unidad: 'Pieza', costo: 69.96 },
        { nombre: 'Marcatextos naranja', unidad: 'Pieza', costo: 69.96 },
        { nombre: 'Marcatextos rosa', unidad: 'Pieza', costo: 69.96 },
        { nombre: 'Marcatextos verde', unidad: 'Pieza', costo: 69.96 },
        { nombre: 'Pluma Azul punto medio', unidad: 'Pieza', costo: 29.31 },
        { nombre: 'Pluma Negra punto medio', unidad: 'Pieza', costo: 29.31 },
        { nombre: 'Pluma Roja punto medio', unidad: 'Pieza', costo: 29.31 },
        { nombre: 'Pluma Verde punto medio', unidad: 'Pieza', costo: 39.57 },
        { nombre: 'Plumon Esterbrook', unidad: 'Pieza', costo: 31.16 },
        { nombre: 'Plumon Sharpie azul', unidad: 'Pieza', costo: 7.83 },
        { nombre: 'Plumon Sharpie negro', unidad: 'Pieza', costo: 11.4 },
        { nombre: 'Plumon Sharpie plateado', unidad: 'Pieza', costo: 16.33 },
        { nombre: 'Plumones para pizarron (caja con 4 colores)', unidad: 'Pieza', costo: 49.37 }
    ],
    'Pilas': [
        { nombre: 'Pila redonda para reloj LR44', unidad: 'Pieza', costo: 23.39 },
        { nombre: 'Pilas AA', unidad: 'Pieza', costo: 18.675 },
        { nombre: 'Pilas AAA', unidad: 'Pieza', costo: 18.675 },
        { nombre: 'Pilas CR2032 3v', unidad: 'Pieza', costo: 7.24 },
        { nombre: 'Pilas cuadradas 9v', unidad: 'Pieza', costo: 116.18 },
        { nombre: 'Pilas LR45 1.5v (paquete c/10)', unidad: 'Pieza', costo: 73.64 },
        { nombre: 'Pilas tipo C', unidad: 'Pieza', costo: 39.47 }
    ],
    'Tintas y Toner': [
        { nombre: 'TINTA HP954XL (amarillo)', unidad: 'Pieza', costo: 612.85 },
        { nombre: 'TINTA HP954XL (Cian)', unidad: 'Pieza', costo: 612.85 },
        { nombre: 'TINTA HP954XL (magenta)', unidad: 'Pieza', costo: 612.85 },
        { nombre: 'TINTA HP954XL (negro)', unidad: 'Pieza', costo: 612.85 },
        { nombre: 'Toner W150A (elisas) A', unidad: 'Pieza', costo: 434.26 },
        { nombre: 'Toner W150A (elisas) B', unidad: 'Pieza', costo: 265 }
    ]
};

// ═══════════════════════════════
//  AUTH — usa coleccion 'usuarios' compartida, campo 'rolLans'
// ═══════════════════════════════

auth.onAuthStateChanged(async user => {
    if (user) {
        currentUid = user.uid;
        try {
            const doc = await db.collection('usuarios').doc(user.uid).get();
            if (doc.exists) {
                const data = { id: doc.id, ...doc.data() };
                if (data.rolLans) {
                    currentUser = data;
                    showApp();
                } else if (data.rol === 'admin') {
                    currentUser = data;
                    showSetupLans();
                } else {
                    showNoAccess();
                }
            } else {
                showNoAccess();
            }
        } catch (e) {
            document.getElementById('mainContent').innerHTML =
                `<div class="alert alert-danger m-3">Error: ${e.message}</div>`;
        }
    } else {
        currentUser = null;
        currentUid  = null;
        showLogin();
    }
});

async function login() {
    const userInput = document.getElementById('loginUser').value.trim();
    const pass      = document.getElementById('loginPass').value;
    const alert     = document.getElementById('loginAlert');
    const btn       = document.getElementById('loginBtn');

    if (!userInput || !pass) {
        alert.textContent = 'Ingresa usuario y contrasena';
        alert.classList.remove('d-none');
        return;
    }

    btn.disabled = true;
    btn.innerHTML = '<span class="spinner-border spinner-border-sm"></span> Entrando...';
    alert.classList.add('d-none');

    try {
        if (userInput.includes('@')) {
            await auth.signInWithEmailAndPassword(userInput, pass);
        } else {
            try {
                await auth.signInWithEmailAndPassword(`${userInput}@proesa.app`, pass);
            } catch {
                await auth.signInWithEmailAndPassword(`${userInput}@lans.app`, pass);
            }
        }
    } catch (e) {
        alert.textContent = 'Usuario o contrasena incorrectos';
        alert.classList.remove('d-none');
        btn.disabled = false;
        btn.textContent = 'Iniciar Sesion';
    }
}

function logout() {
    auth.signOut();
}

function showLogin() {
    document.getElementById('loginView').style.display = '';
    document.getElementById('appView').style.display   = 'none';
    document.getElementById('loginUser').value = '';
    document.getElementById('loginPass').value = '';
    document.getElementById('loginAlert').classList.add('d-none');
    document.getElementById('loginBtn').disabled = false;
    document.getElementById('loginBtn').textContent = 'Iniciar Sesion';
}

async function showApp() {
    document.getElementById('loginView').style.display = 'none';
    document.getElementById('appView').style.display   = '';
    await cargarAreas();
    renderNav();
    const role = currentUser.rolLans;
    if (role === 'admin') showEntregas();
    else showRegistrarEntrega();
}

function showNoAccess() {
    document.getElementById('loginView').style.display = 'none';
    document.getElementById('appView').style.display   = '';
    document.getElementById('mainNav').innerHTML = `
        <div class="container-fluid">
            <span class="navbar-brand"><i class="bi bi-building me-2"></i>LANS</span>
        </div>`;
    document.getElementById('mainContent').innerHTML = `
        <div class="text-center py-5">
            <i class="bi bi-lock" style="font-size:3rem;color:var(--lans-blue)"></i>
            <h4 class="mt-3">Sin acceso a LANS</h4>
            <p class="text-muted">Tu cuenta no tiene acceso a este sistema.<br>Contacta al administrador.</p>
            <button class="btn btn-outline-secondary" onclick="logout()">
                <i class="bi bi-box-arrow-right me-1"></i>Salir
            </button>
        </div>`;
}

function showSetupLans() {
    document.getElementById('loginView').style.display = 'none';
    document.getElementById('appView').style.display   = '';
    document.getElementById('mainNav').innerHTML = `
        <div class="container-fluid">
            <span class="navbar-brand"><i class="bi bi-building me-2"></i>LANS</span>
        </div>`;
    document.getElementById('mainContent').innerHTML = `
        <div class="text-center py-5">
            <i class="bi bi-gear" style="font-size:3rem;color:var(--lans-blue)"></i>
            <h4 class="mt-3">Configurar LANS</h4>
            <p class="text-muted">Eres admin de PROESA. Activa tu acceso a LANS y carga los 57 productos.</p>
            <button class="btn btn-lans btn-lg" onclick="activarLans()">
                <i class="bi bi-rocket-takeoff me-2"></i>Activar LANS
            </button>
            <br><br>
            <button class="btn btn-outline-secondary btn-sm" onclick="logout()">Salir</button>
        </div>`;
}

async function activarLans() {
    try {
        await db.collection('usuarios').doc(currentUid).update({
            rolLans: 'admin'
        });

        const existing = await db.collection('lans_productos').limit(1).get();
        if (existing.empty) {
            await cargarDatosIniciales();
        }

        currentUser.rolLans = 'admin';
        showAlert('LANS activado con 57 productos', 'success');
        showApp();
    } catch (e) {
        showAlert('Error: ' + e.message, 'danger');
    }
}

async function cargarDatosIniciales() {
    const batch = db.batch();
    for (const [categoria, items] of Object.entries(PRODUCTOS)) {
        for (const item of items) {
            const ref = db.collection('lans_productos').doc();
            batch.set(ref, {
                nombre: item.nombre,
                categoria: categoria,
                unidad: item.unidad,
                costo: item.costo || 0,
                activo: true
            });
        }
    }
    await batch.commit();
}

// ═══════════════════════════════
//  NAVIGATION
// ═══════════════════════════════

function renderNav() {
    const nav = document.getElementById('mainNav');
    const role = currentUser.rolLans;
    let links = '';

    links += navLink('showRegistrarEntrega', 'bi-box-arrow-in-down', 'Registrar Entrega');
    links += navLink('showMisEntregas', 'bi-list-check', 'Mis Entregas');
    links += navLink('showCatalogo', 'bi-box-seam', 'Catalogo');

    if (role === 'admin') {
        links += navLink('showEntregas', 'bi-clipboard-data', 'Entregas');
        links += navLink('showArchivo', 'bi-archive', 'Archivo');
        links += navLink('showHistorial', 'bi-bar-chart-line', 'Historial');
        links += navLink('showAreas', 'bi-diagram-3', 'Areas');
        links += navLink('showUsuarios', 'bi-people', 'Usuarios');
    }

    nav.innerHTML = `
        <div class="container-fluid">
            <span class="navbar-brand"><i class="bi bi-building me-2"></i>LANS</span>
            <button class="navbar-toggler" data-bs-toggle="collapse" data-bs-target="#navMenu">
                <span class="navbar-toggler-icon"></span>
            </button>
            <div class="collapse navbar-collapse" id="navMenu">
                <ul class="navbar-nav me-auto">${links}</ul>
                <span class="navbar-text me-3">
                    <i class="bi bi-person-circle me-1"></i>${currentUser.nombre}
                    <small class="ms-1 opacity-75">(${role})</small>
                </span>
                <button class="btn btn-outline-danger btn-sm" onclick="logout()">
                    <i class="bi bi-box-arrow-right me-1"></i>Salir
                </button>
            </div>
        </div>`;
}

function navLink(fn, icon, label) {
    return `<li class="nav-item">
        <a class="nav-link" href="#" onclick="${fn}();return false" data-view="${fn}">
            <i class="bi ${icon} me-1"></i>${label}
        </a></li>`;
}

function setActiveNav(fn) {
    document.querySelectorAll('#mainNav .nav-link').forEach(a => {
        a.classList.toggle('active', a.dataset.view === fn);
    });
}

// ═══════════════════════════════
//  ALERTS
// ═══════════════════════════════

function showAlert(msg, type = 'info') {
    const c = document.getElementById('alertContainer');
    const id = 'alert-' + Date.now();
    c.innerHTML = `<div id="${id}" class="alert alert-${type} alert-dismissible fade show py-2" role="alert">
        ${msg}
        <button type="button" class="btn-close btn-close-sm" data-bs-dismiss="alert"></button>
    </div>`;
    setTimeout(() => {
        const el = document.getElementById(id);
        if (el) el.remove();
    }, 5000);
}

// ═══════════════════════════════
//  VIEW: Registrar Entrega
// ═══════════════════════════════

async function showRegistrarEntrega() {
    setActiveNav('showRegistrarEntrega');
    const main = document.getElementById('mainContent');
    main.innerHTML = '<div class="spinner-lans"><div class="spinner-border text-primary"></div></div>';

    const snap = await db.collection('lans_productos').where('activo', '==', true).get();
    const productos = {};
    snap.forEach(d => {
        const p = d.data();
        if (!productos[p.categoria]) productos[p.categoria] = [];
        productos[p.categoria].push({ id: d.id, ...p });
    });
    const sortedProductos = Object.keys(productos).sort().reduce((obj, key) => {
        obj[key] = productos[key];
        return obj;
    }, {});

    let accordionItems = '';
    let idx = 0;
    for (const [cat, items] of Object.entries(sortedProductos)) {
        const rows = items.map(p => `
            <tr>
                <td>${p.nombre}</td>
                <td class="text-center"><small class="text-muted">${p.unidad}</small></td>
                <td class="text-center">
                    <input type="number" min="0" value="0" class="form-control form-control-sm qty-input"
                           data-id="${p.id}" data-nombre="${p.nombre}" data-unidad="${p.unidad}" data-costo="${p.costo || 0}"
                           onchange="updateSummary()" oninput="updateSummary()">
                </td>
            </tr>`).join('');

        accordionItems += `
            <div class="accordion-item">
                <h2 class="accordion-header">
                    <button class="accordion-button ${idx > 0 ? 'collapsed' : ''}" data-bs-toggle="collapse"
                            data-bs-target="#cat${idx}">
                        <i class="bi bi-tag me-2"></i>${cat}
                        <span class="badge bg-secondary ms-2">${items.length}</span>
                    </button>
                </h2>
                <div id="cat${idx}" class="accordion-collapse collapse ${idx === 0 ? 'show' : ''}">
                    <div class="accordion-body p-0">
                        <table class="table table-sm table-hover mb-0">
                            <thead><tr>
                                <th>Producto</th><th class="text-center">Unidad</th><th class="text-center">Cant.</th>
                            </tr></thead>
                            <tbody>${rows}</tbody>
                        </table>
                    </div>
                </div>
            </div>`;
        idx++;
    }

    const areaOpts = AREAS.map(a => `<option value="${a}">${a}</option>`).join('');

    main.innerHTML = `
        <div class="row">
            <div class="col-lg-8">
                <div class="card card-lans mb-3">
                    <div class="card-header card-header-lans">
                        <i class="bi bi-box-arrow-in-down me-2"></i>Registrar Entrega de Material
                    </div>
                    <div class="card-body">
                        <div class="mb-3">
                            <label class="form-label fw-bold"><i class="bi bi-building me-1"></i>Area que recibe</label>
                            <select id="areaEntrega" class="form-select">
                                <option value="">-- Selecciona el area --</option>
                                ${areaOpts}
                            </select>
                        </div>
                        <div class="search-box mb-3">
                            <i class="bi bi-search"></i>
                            <input type="text" class="form-control" placeholder="Buscar producto..."
                                   oninput="filterProducts(this.value)">
                        </div>
                        <div class="accordion accordion-lans" id="catalogAccordion">
                            ${accordionItems}
                        </div>
                    </div>
                </div>
            </div>
            <div class="col-lg-4">
                <div class="order-summary" id="orderSummary">
                    <h6><i class="bi bi-receipt me-2"></i>Resumen de Entrega</h6>
                    <div id="summaryArea" class="mb-2"><small class="text-muted">Selecciona un area...</small></div>
                    <hr>
                    <div id="summaryItems"><p class="text-muted small">Agrega productos...</p></div>
                    <hr>
                    <div class="mb-3">
                        <label class="form-label small fw-bold">Observaciones (opcional)</label>
                        <textarea id="entregaObs" class="form-control form-control-sm" rows="2"
                                  placeholder="Notas adicionales..."></textarea>
                    </div>
                    <div class="d-flex justify-content-between fw-bold">
                        <span>Total de articulos:</span>
                        <span id="summaryTotal">0</span>
                    </div>
                    <button class="btn btn-lans w-100 mt-3" onclick="submitEntrega()" id="btnSubmit">
                        <i class="bi bi-check-circle me-2"></i>Registrar Entrega
                    </button>
                </div>
            </div>
        </div>`;

    document.getElementById('areaEntrega').addEventListener('change', function() {
        const areaDiv = document.getElementById('summaryArea');
        if (this.value) {
            areaDiv.innerHTML = `<span class="badge bg-primary"><i class="bi bi-building me-1"></i>${this.value}</span>`;
        } else {
            areaDiv.innerHTML = '<small class="text-muted">Selecciona un area...</small>';
        }
    });
}

function filterProducts(query) {
    const q = query.toLowerCase();
    document.querySelectorAll('#catalogAccordion tbody tr').forEach(row => {
        const name = row.querySelector('td').textContent.toLowerCase();
        row.style.display = name.includes(q) ? '' : 'none';
    });
}

function updateSummary() {
    const items = [];
    let total = 0;
    document.querySelectorAll('.qty-input').forEach(inp => {
        const qty = parseInt(inp.value) || 0;
        if (qty > 0) {
            items.push({ nombre: inp.dataset.nombre, cantidad: qty, unidad: inp.dataset.unidad });
            total += qty;
        }
    });

    const container = document.getElementById('summaryItems');
    if (items.length === 0) {
        container.innerHTML = '<p class="text-muted small">Agrega productos...</p>';
    } else {
        container.innerHTML = items.map(i =>
            `<div class="summary-item"><span>${i.nombre}</span><span>${i.cantidad} ${i.unidad}</span></div>`
        ).join('');
    }
    document.getElementById('summaryTotal').textContent = total;
}

async function submitEntrega() {
    const area = document.getElementById('areaEntrega').value;
    if (!area) {
        showAlert('Selecciona el area que recibe la entrega', 'warning');
        return;
    }

    const detalles = [];
    document.querySelectorAll('.qty-input').forEach(inp => {
        const qty = parseInt(inp.value) || 0;
        if (qty > 0) {
            detalles.push({
                productoId: inp.dataset.id,
                nombre: inp.dataset.nombre,
                unidad: inp.dataset.unidad,
                cantidad: qty,
                costo: parseFloat(inp.dataset.costo) || 0
            });
        }
    });

    if (detalles.length === 0) {
        showAlert('Agrega al menos un producto', 'warning');
        return;
    }

    const btn = document.getElementById('btnSubmit');
    btn.disabled = true;
    btn.innerHTML = '<span class="spinner-border spinner-border-sm"></span> Registrando...';

    try {
        const obs = document.getElementById('entregaObs').value.trim();
        await db.collection('lans_pedidos').add({
            uid: currentUid,
            nombreEmpleado: currentUser.nombre,
            area: area,
            detalles: detalles,
            estado: 'entregado',
            fecha: firebase.firestore.FieldValue.serverTimestamp(),
            observaciones: obs || null
        });
        showAlert(`Entrega registrada para ${area}`, 'success');
        showMisEntregas();
    } catch (e) {
        showAlert('Error al registrar: ' + e.message, 'danger');
        btn.disabled = false;
        btn.innerHTML = '<i class="bi bi-check-circle me-2"></i>Registrar Entrega';
    }
}

// ═══════════════════════════════
//  VIEW: Mis Entregas
// ═══════════════════════════════

let _misEntregasArea = 'todas';
let _misEntregasDesde = '';
let _misEntregasHasta = '';

async function showMisEntregas(filtroArea, fechaDesde, fechaHasta) {
    _misEntregasArea = filtroArea !== undefined ? filtroArea : _misEntregasArea;
    _misEntregasDesde = fechaDesde !== undefined ? fechaDesde : _misEntregasDesde;
    _misEntregasHasta = fechaHasta !== undefined ? fechaHasta : _misEntregasHasta;
    setActiveNav('showMisEntregas');
    const main = document.getElementById('mainContent');
    main.innerHTML = '<div class="spinner-lans"><div class="spinner-border text-primary"></div></div>';

    let snap;
    try {
        snap = await db.collection('lans_pedidos').where('uid', '==', currentUid).get();
    } catch (e) {
        main.innerHTML = `<div class="alert alert-danger">Error al cargar entregas: ${e.message}</div>`;
        return;
    }

    let entregas = [];
    snap.forEach(d => entregas.push({ id: d.id, ...d.data() }));

    if (_misEntregasArea !== 'todas') {
        entregas = entregas.filter(e => e.area === _misEntregasArea);
    }
    if (_misEntregasDesde) {
        const desde = new Date(_misEntregasDesde + 'T00:00:00');
        entregas = entregas.filter(e => e.fecha && e.fecha.toDate() >= desde);
    }
    if (_misEntregasHasta) {
        const hasta = new Date(_misEntregasHasta + 'T23:59:59');
        entregas = entregas.filter(e => e.fecha && e.fecha.toDate() <= hasta);
    }

    entregas.sort((a, b) => (b.fecha?.toMillis() || 0) - (a.fecha?.toMillis() || 0));

    const areaOpts = ['todas', ...AREAS];
    const filtros = `
        <div class="card card-lans mb-3">
            <div class="card-body py-2">
                <div class="row g-2 align-items-end">
                    <div class="col-md-4">
                        <label class="form-label small fw-bold mb-1"><i class="bi bi-building me-1"></i>Area</label>
                        <select class="form-select form-select-sm" onchange="showMisEntregas(this.value)">
                            ${areaOpts.map(a => `<option value="${a}" ${a === _misEntregasArea ? 'selected' : ''}>${a === 'todas' ? 'Todas las areas' : a}</option>`).join('')}
                        </select>
                    </div>
                    <div class="col-6 col-md-3">
                        <label class="form-label small fw-bold mb-1"><i class="bi bi-calendar me-1"></i>Desde</label>
                        <input type="date" class="form-control form-control-sm" value="${_misEntregasDesde}"
                               onchange="showMisEntregas(undefined, this.value, undefined)">
                    </div>
                    <div class="col-6 col-md-3">
                        <label class="form-label small fw-bold mb-1"><i class="bi bi-calendar me-1"></i>Hasta</label>
                        <input type="date" class="form-control form-control-sm" value="${_misEntregasHasta}"
                               onchange="showMisEntregas(undefined, undefined, this.value)">
                    </div>
                    <div class="col-md-2">
                        <button class="btn btn-outline-secondary btn-sm w-100" onclick="_misEntregasArea='todas';_misEntregasDesde='';_misEntregasHasta='';showMisEntregas('todas','','')">
                            <i class="bi bi-x-circle me-1"></i>Limpiar
                        </button>
                    </div>
                </div>
            </div>
        </div>`;

    if (entregas.length === 0) {
        main.innerHTML = `
            <div class="d-flex justify-content-between align-items-center mb-3">
                <h5 class="mb-0"><i class="bi bi-list-check me-2 text-lans"></i>Mis Entregas</h5>
                <button class="btn btn-lans btn-sm" onclick="showRegistrarEntrega()">
                    <i class="bi bi-plus-lg me-1"></i>Nueva
                </button>
            </div>
            ${filtros}
            <div class="empty-state"><i class="bi bi-inbox"></i><h5>Sin entregas</h5><p>No hay entregas con estos filtros</p></div>`;
        return;
    }

    let cards = '';
    entregas.forEach(p => {
        const fecha = p.fecha ? p.fecha.toDate().toLocaleDateString('es-MX') : '';
        const items = (p.detalles || []).map(i =>
            `<li class="list-group-item d-flex justify-content-between py-1 px-2">
                <span>${i.nombre}</span>
                <span class="text-muted">${i.cantidad} ${i.unidad}</span>
            </li>`
        ).join('');

        cards += `
            <div class="col-md-6 col-lg-4 mb-3">
                <div class="card card-lans h-100">
                    <div class="card-header d-flex justify-content-between align-items-center bg-white border-bottom">
                        <strong>#${p.id.slice(-5).toUpperCase()}</strong>
                        <span class="badge bg-success"><i class="bi bi-check-circle me-1"></i>Entregado</span>
                    </div>
                    <div class="card-body p-2">
                        <div class="mb-2">
                            <small class="text-muted"><i class="bi bi-building me-1"></i>Area:</small>
                            <span class="badge bg-primary ms-1">${p.area}</span>
                        </div>
                        ${p.observaciones ? `<div class="mb-2"><small class="text-muted"><i class="bi bi-chat-text me-1"></i>${p.observaciones}</small></div>` : ''}
                    </div>
                    <div class="card-body p-0">
                        <ul class="list-group list-group-flush">${items}</ul>
                    </div>
                    <div class="card-footer bg-white small text-muted">
                        <i class="bi bi-calendar me-1"></i>${fecha}
                    </div>
                </div>
            </div>`;
    });

    main.innerHTML = `
        <div class="d-flex justify-content-between align-items-center mb-3">
            <h5 class="mb-0"><i class="bi bi-list-check me-2 text-lans"></i>Mis Entregas <span class="badge bg-secondary ms-1">${entregas.length}</span></h5>
            <button class="btn btn-lans btn-sm" onclick="showRegistrarEntrega()">
                <i class="bi bi-plus-lg me-1"></i>Nueva
            </button>
        </div>
        ${filtros}
        <div class="row">${cards}</div>`;
}

// ═══════════════════════════════
//  VIEW: Entregas (Admin - todas)
// ═══════════════════════════════

let _entregasFiltroArea = 'todas';
let _entregasFechaDesde = '';
let _entregasFechaHasta = '';

async function showEntregas(filtroArea, fechaDesde, fechaHasta) {
    _entregasFiltroArea = filtroArea || _entregasFiltroArea || 'todas';
    _entregasFechaDesde = fechaDesde !== undefined ? fechaDesde : _entregasFechaDesde;
    _entregasFechaHasta = fechaHasta !== undefined ? fechaHasta : _entregasFechaHasta;
    setActiveNav('showEntregas');
    const main = document.getElementById('mainContent');
    main.innerHTML = '<div class="spinner-lans"><div class="spinner-border text-primary"></div></div>';

    let snap;
    try {
        snap = await db.collection('lans_pedidos').get();
    } catch (e) {
        main.innerHTML = `<div class="alert alert-danger">Error al cargar entregas: ${e.message}</div>`;
        return;
    }

    let entregas = [];
    snap.forEach(d => entregas.push({ id: d.id, ...d.data() }));

    entregas = entregas.filter(e => !e.archivado);

    if (_entregasFiltroArea !== 'todas') {
        entregas = entregas.filter(e => e.area === _entregasFiltroArea);
    }
    if (_entregasFechaDesde) {
        const desde = new Date(_entregasFechaDesde + 'T00:00:00');
        entregas = entregas.filter(e => e.fecha && e.fecha.toDate() >= desde);
    }
    if (_entregasFechaHasta) {
        const hasta = new Date(_entregasFechaHasta + 'T23:59:59');
        entregas = entregas.filter(e => e.fecha && e.fecha.toDate() <= hasta);
    }

    entregas.sort((a, b) => (b.fecha?.toMillis() || 0) - (a.fecha?.toMillis() || 0));

    const areaOpts = ['todas', ...AREAS];
    const filtros = `
        <div class="card card-lans mb-3">
            <div class="card-body py-2">
                <div class="row g-2 align-items-end">
                    <div class="col-md-3">
                        <label class="form-label small fw-bold mb-1"><i class="bi bi-search me-1"></i>Buscar</label>
                        <input type="text" class="form-control form-control-sm" placeholder="Nombre, producto, area..."
                               id="entregasBusqueda" oninput="filtrarEntregasTabla(this.value)">
                    </div>
                    <div class="col-md-2">
                        <label class="form-label small fw-bold mb-1"><i class="bi bi-building me-1"></i>Area</label>
                        <select class="form-select form-select-sm" onchange="showEntregas(this.value)">
                            ${areaOpts.map(a => `<option value="${a}" ${a === _entregasFiltroArea ? 'selected' : ''}>${a === 'todas' ? 'Todas las areas' : a}</option>`).join('')}
                        </select>
                    </div>
                    <div class="col-6 col-md-2">
                        <label class="form-label small fw-bold mb-1"><i class="bi bi-calendar me-1"></i>Desde</label>
                        <input type="date" class="form-control form-control-sm" value="${_entregasFechaDesde}"
                               onchange="showEntregas(undefined, this.value, undefined)">
                    </div>
                    <div class="col-6 col-md-2">
                        <label class="form-label small fw-bold mb-1"><i class="bi bi-calendar me-1"></i>Hasta</label>
                        <input type="date" class="form-control form-control-sm" value="${_entregasFechaHasta}"
                               onchange="showEntregas(undefined, undefined, this.value)">
                    </div>
                    <div class="col-md-3">
                        <label class="form-label small fw-bold mb-1">No. Inventario</label>
                        <input type="text" id="noInventario" class="form-control form-control-sm"
                               placeholder="LANS-INV-0001" value="LANS-INV-0001">
                    </div>
                </div>
                <div class="row g-2 mt-1">
                    <div class="col-12 d-flex gap-1 justify-content-end">
                        <button class="btn btn-lans btn-sm" onclick="descargarExcel()">
                            <i class="bi bi-download me-1"></i>Excel
                        </button>
                        <button class="btn btn-outline-secondary btn-sm" onclick="toggleAllExport()" title="Seleccionar todos">
                            <i class="bi bi-check2-all"></i>
                        </button>
                        <button class="btn btn-outline-secondary btn-sm" onclick="_entregasFiltroArea='todas';_entregasFechaDesde='';_entregasFechaHasta='';showEntregas('todas','','')" title="Limpiar filtros">
                            <i class="bi bi-x-circle"></i>
                        </button>
                    </div>
                </div>
            </div>
        </div>`;

    if (entregas.length === 0) {
        main.innerHTML = `
            <h5 class="mb-3"><i class="bi bi-clipboard-data me-2 text-lans"></i>Entregas</h5>
            ${filtros}
            <div class="empty-state"><i class="bi bi-inbox"></i><h5>Sin entregas</h5><p>No hay entregas con estos filtros</p></div>`;
        return;
    }

    let rows = '';
    entregas.forEach(p => {
        const fecha = p.fecha ? p.fecha.toDate().toLocaleDateString('es-MX') : '';
        const hora = p.fecha ? p.fecha.toDate().toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' }) : '';
        const totalItems = (p.detalles || []).reduce((s, i) => s + i.cantidad, 0);
        const itemsList = (p.detalles || []).map(i => `${i.nombre} (${i.cantidad})`).join(', ');
        const exportado = p.fechaExportacion ? '<span class="badge bg-success ms-1" title="Ya exportado a Excel"><i class="bi bi-check2"></i> Exportado</span>' : '';

        rows += `
            <tr>
                <td class="text-center">
                    <input type="checkbox" class="form-check-input export-check" value="${p.id}"
                           data-detalles='${JSON.stringify(p.detalles || [])}' data-area="${p.area}">
                </td>
                <td><strong>#${p.id.slice(-5).toUpperCase()}</strong>${exportado}</td>
                <td>${p.nombreEmpleado}</td>
                <td><span class="badge bg-primary">${p.area}</span></td>
                <td><small>${itemsList}</small></td>
                <td class="text-center">${totalItems}</td>
                <td>${fecha} <small class="text-muted">${hora}</small></td>
                <td class="text-center">
                    <button class="btn btn-outline-info btn-sm me-1" onclick="verDetalle('${p.id}')" title="Ver detalle">
                        <i class="bi bi-eye"></i>
                    </button>
                    <button class="btn btn-outline-danger btn-sm" onclick="archivarEntrega('${p.id}')" title="Archivar">
                        <i class="bi bi-archive"></i>
                    </button>
                </td>
            </tr>`;
    });

    main.innerHTML = `
        <h5 class="mb-3"><i class="bi bi-clipboard-data me-2 text-lans"></i>Entregas <span class="badge bg-secondary ms-1">${entregas.length}</span></h5>
        ${filtros}
        <div class="card card-lans">
            <div class="table-responsive">
                <table class="table table-lans table-hover mb-0" id="tablaEntregas">
                    <thead><tr>
                        <th class="text-center"><input type="checkbox" class="form-check-input" onchange="toggleAllExport(this.checked)"></th>
                        <th>ID</th><th>Registrado por</th><th>Area</th><th>Productos</th>
                        <th class="text-center">Cant.</th><th>Fecha</th><th class="text-center">Acciones</th>
                    </tr></thead>
                    <tbody>${rows}</tbody>
                </table>
            </div>
        </div>`;
}

async function verDetalle(entregaId) {
    const doc = await db.collection('lans_pedidos').doc(entregaId).get();
    if (!doc.exists) { showAlert('Entrega no encontrada', 'warning'); return; }
    const p = { id: doc.id, ...doc.data() };
    const fecha = p.fecha ? p.fecha.toDate().toLocaleString('es-MX') : '';
    const items = (p.detalles || []).map(i =>
        `<tr><td>${i.nombre}</td><td class="text-center">${i.unidad}</td><td class="text-center">${i.cantidad}</td></tr>`
    ).join('');

    const modal = document.createElement('div');
    modal.innerHTML = `
        <div class="modal fade" id="detalleModal" tabindex="-1">
            <div class="modal-dialog">
                <div class="modal-content">
                    <div class="modal-header" style="background:var(--lans-blue);color:white">
                        <h5 class="modal-title"><i class="bi bi-receipt me-2"></i>Entrega #${p.id.slice(-5).toUpperCase()}</h5>
                        <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal"></button>
                    </div>
                    <div class="modal-body">
                        <div class="row mb-3">
                            <div class="col-6"><strong>Registrado por:</strong><br>${p.nombreEmpleado}</div>
                            <div class="col-6"><strong>Area:</strong><br><span class="badge bg-primary">${p.area}</span></div>
                        </div>
                        <div class="mb-3"><strong>Fecha:</strong> ${fecha}</div>
                        ${p.observaciones ? `<div class="mb-3"><strong>Observaciones:</strong><br><span class="text-muted">${p.observaciones}</span></div>` : ''}
                        <table class="table table-sm">
                            <thead><tr><th>Producto</th><th class="text-center">Unidad</th><th class="text-center">Cantidad</th></tr></thead>
                            <tbody>${items}</tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>`;
    document.body.appendChild(modal);
    const m = new bootstrap.Modal(document.getElementById('detalleModal'));
    m.show();
    document.getElementById('detalleModal').addEventListener('hidden.bs.modal', () => modal.remove());
}

function filtrarEntregasTabla(q) {
    const query = q.toLowerCase();
    document.querySelectorAll('#tablaEntregas tbody tr').forEach(row => {
        const texto = row.textContent.toLowerCase();
        row.style.display = texto.includes(query) ? '' : 'none';
    });
}

async function archivarEntrega(entregaId) {
    if (!confirm('Archivar esta entrega? Se ocultara de Entregas y Exportar pero seguira visible en Historial.')) return;
    try {
        await db.collection('lans_pedidos').doc(entregaId).update({ archivado: true });
        showAlert('Entrega archivada', 'success');
        showEntregas();
    } catch (e) {
        showAlert('Error: ' + e.message, 'danger');
    }
}

async function desarchivarEntrega(entregaId) {
    if (!confirm('Desarchivar esta entrega? Volvera a aparecer en Entregas.')) return;
    try {
        await db.collection('lans_pedidos').doc(entregaId).update({ archivado: false });
        showAlert('Entrega desarchivada', 'success');
        showArchivo();
    } catch (e) {
        showAlert('Error: ' + e.message, 'danger');
    }
}

// ═══════════════════════════════
//  Excel Export + Helpers
// ═══════════════════════════════

function toggleAllExport(checked) {
    const state = checked !== undefined ? checked : true;
    document.querySelectorAll('.export-check').forEach(cb => cb.checked = state);
}

async function descargarExcel() {
    const noInv = document.getElementById('noInventario').value.trim() || 'SIN-NUMERO';
    const checked = document.querySelectorAll('.export-check:checked');

    if (checked.length === 0) { showAlert('Selecciona al menos una entrega', 'warning'); return; }

    const prodSnap = await db.collection('lans_productos').get();
    const costosPorNombre = {};
    const costosPorId = {};
    prodSnap.forEach(d => {
        const p = d.data();
        costosPorNombre[p.nombre] = p.costo || 0;
        costosPorId[d.id] = p.costo || 0;
    });

    const consolidated = {};
    checked.forEach(cb => {
        JSON.parse(cb.dataset.detalles).forEach(item => {
            if (!consolidated[item.nombre]) {
                const costo = (item.costo && item.costo > 0) ? item.costo : (costosPorId[item.productoId] || costosPorNombre[item.nombre] || 0);
                consolidated[item.nombre] = { nombre: item.nombre, unidad: item.unidad, cantidad: 0, costo: costo };
            }
            consolidated[item.nombre].cantidad += item.cantidad;
        });
    });

    const wb = new ExcelJS.Workbook();
    const ws = wb.addWorksheet('Entregas LANS');
    ws.columns = [
        { header: 'No. Inventario', key: 'inv', width: 20 },
        { header: 'Descripcion de Linea', key: 'desc', width: 38 },
        { header: 'UM', key: 'um', width: 14 },
        { header: 'Cant. Orden', key: 'cant', width: 14 },
        { header: 'Costo Unitario', key: 'costoUnit', width: 16 },
        { header: 'Costo Total', key: 'costoTotal', width: 16 }
    ];

    const headerRow = ws.getRow(1);
    headerRow.eachCell(cell => {
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1A5276' } };
        cell.font = { color: { argb: 'FFFFFFFF' }, bold: true, size: 11 };
        cell.alignment = { horizontal: 'center', vertical: 'middle' };
        cell.border = { top: { style: 'thin', color: { argb: 'FF0E3650' } }, bottom: { style: 'thin', color: { argb: 'FF0E3650' } }, left: { style: 'thin', color: { argb: 'FF0E3650' } }, right: { style: 'thin', color: { argb: 'FF0E3650' } } };
    });
    headerRow.height = 22;

    let granTotal = 0;
    Object.values(consolidated).forEach(item => {
        const costoTotal = item.costo * item.cantidad;
        granTotal += costoTotal;
        const row = ws.addRow({ inv: noInv, desc: item.nombre, um: item.unidad, cant: item.cantidad, costoUnit: item.costo, costoTotal: costoTotal });
        row.eachCell((cell, colNumber) => {
            cell.border = { top: { style: 'thin', color: { argb: 'FFD4D4D4' } }, bottom: { style: 'thin', color: { argb: 'FFD4D4D4' } }, left: { style: 'thin', color: { argb: 'FFD4D4D4' } }, right: { style: 'thin', color: { argb: 'FFD4D4D4' } } };
            cell.alignment = { vertical: 'middle' };
            if (colNumber === 5 || colNumber === 6) cell.numFmt = '$#,##0.00';
        });
    });

    const totalRow = ws.addRow({ inv: '', desc: '', um: '', cant: '', costoUnit: 'TOTAL:', costoTotal: granTotal });
    totalRow.eachCell((cell, colNumber) => {
        cell.font = { bold: true, size: 11 };
        cell.border = { top: { style: 'double', color: { argb: 'FF1A5276' } }, bottom: { style: 'double', color: { argb: 'FF1A5276' } } };
        if (colNumber === 6) cell.numFmt = '$#,##0.00';
    });

    const buffer = await wb.xlsx.writeBuffer();
    const fecha = new Date().toISOString().slice(0, 10);
    saveAs(new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' }), `LANS_Entregas_${fecha}.xlsx`);
    showAlert(`Excel descargado con ${Object.keys(consolidated).length} productos — Total: $${granTotal.toFixed(2)}`, 'success');

    const updatePromises = [];
    checked.forEach(cb => {
        updatePromises.push(db.collection('lans_pedidos').doc(cb.value).update({ noInventario: noInv, fechaExportacion: firebase.firestore.FieldValue.serverTimestamp() }));
    });
    await Promise.all(updatePromises);
    showEntregas();
}

// ═══════════════════════════════
//  VIEW: Historial
// ═══════════════════════════════

async function showHistorial() {
    setActiveNav('showHistorial');
    const main = document.getElementById('mainContent');
    main.innerHTML = '<div class="spinner-lans"><div class="spinner-border text-primary"></div></div>';

    let snap;
    try { snap = await db.collection('lans_pedidos').get(); }
    catch (e) { main.innerHTML = `<div class="alert alert-danger">Error: ${e.message}</div>`; return; }

    const entregas = [];
    snap.forEach(d => entregas.push({ id: d.id, ...d.data() }));

    const porArea = {};
    entregas.forEach(p => {
        const area = p.area;
        if (!porArea[area]) porArea[area] = { total: 0, articulos: 0, productos: {} };
        porArea[area].total++;
        (p.detalles || []).forEach(item => {
            porArea[area].articulos += item.cantidad;
            porArea[area].productos[item.nombre] = (porArea[area].productos[item.nombre] || 0) + item.cantidad;
        });
    });

    const totalEntregas = entregas.length;
    const totalArticulos = entregas.reduce((s, p) => s + (p.detalles || []).reduce((ss, i) => ss + i.cantidad, 0), 0);
    const areasAtendidas = Object.keys(porArea).length;

    const kpis = `
        <div class="row mb-4">
            <div class="col-6 col-md-4 mb-2"><div class="card card-lans text-center p-3"><div class="fs-2 fw-bold text-lans">${totalEntregas}</div><small class="text-muted">Total Entregas</small></div></div>
            <div class="col-6 col-md-4 mb-2"><div class="card card-lans text-center p-3"><div class="fs-2 fw-bold text-lans">${totalArticulos}</div><small class="text-muted">Total Articulos</small></div></div>
            <div class="col-12 col-md-4 mb-2"><div class="card card-lans text-center p-3"><div class="fs-2 fw-bold text-lans">${areasAtendidas}</div><small class="text-muted">Areas Atendidas</small></div></div>
        </div>`;

    let areaCards = '';
    for (const [area, stats] of Object.entries(porArea)) {
        if (stats.total === 0) continue;
        const topProds = Object.entries(stats.productos).sort((a, b) => b[1] - a[1]).slice(0, 5);
        const topList = topProds.map(([n, c]) => `<div class="d-flex justify-content-between py-1 border-bottom" style="border-color:#eee!important"><span class="small">${n}</span><span class="badge bg-secondary">${c}</span></div>`).join('');
        const maxP = Math.max(...Object.values(porArea).map(s => s.total));
        areaCards += `
            <div class="col-md-6 col-lg-4 mb-3"><div class="card card-lans h-100">
                <div class="card-header card-header-lans"><i class="bi bi-building me-2"></i>${area}</div>
                <div class="card-body">
                    <div class="d-flex justify-content-between mb-2"><span class="fw-bold">${stats.total} entregas</span><span class="small text-muted">${stats.articulos} articulos</span></div>
                    <div class="progress mb-3" style="height:8px"><div class="progress-bar" style="width:${Math.round((stats.total/maxP)*100)}%;background:var(--lans-blue)"></div></div>
                    <h6 class="small fw-bold text-muted mb-1">Mas entregados:</h6>
                    ${topList || '<span class="small text-muted">Sin productos</span>'}
                </div>
            </div></div>`;
    }

    if (!areaCards) areaCards = '<div class="col-12"><div class="empty-state"><i class="bi bi-bar-chart-line"></i><h5>Sin historial</h5></div></div>';

    const globalProds = {};
    entregas.forEach(p => (p.detalles || []).forEach(i => { globalProds[i.nombre] = (globalProds[i.nombre] || 0) + i.cantidad; }));
    const topGlobal = Object.entries(globalProds).sort((a, b) => b[1] - a[1]).slice(0, 10);
    let topRows = '';
    if (topGlobal.length > 0) {
        const mx = topGlobal[0][1];
        topRows = topGlobal.map(([n, c], i) => `<tr><td class="text-center">${i+1}</td><td>${n}</td><td><div class="d-flex align-items-center gap-2"><div class="progress flex-fill" style="height:6px"><div class="progress-bar" style="width:${Math.round((c/mx)*100)}%;background:var(--lans-blue)"></div></div><strong>${c}</strong></div></td></tr>`).join('');
    }

    main.innerHTML = `
        <h5 class="mb-3"><i class="bi bi-bar-chart-line me-2 text-lans"></i>Historial por Area</h5>
        ${kpis}<div class="row">${areaCards}</div>
        ${topGlobal.length > 0 ? `<div class="card card-lans mt-3"><div class="card-header card-header-lans"><i class="bi bi-trophy me-2"></i>Top 10 Productos</div><div class="table-responsive"><table class="table table-hover mb-0"><thead><tr><th class="text-center" style="width:50px">#</th><th>Producto</th><th style="width:40%">Cantidad</th></tr></thead><tbody>${topRows}</tbody></table></div></div>` : ''}`;
}

// ═══════════════════════════════
//  VIEW: Archivo
// ═══════════════════════════════

let _archivoFiltroArea = 'todas';
let _archivoFechaDesde = '';
let _archivoFechaHasta = '';

async function showArchivo(filtroArea, fechaDesde, fechaHasta) {
    _archivoFiltroArea = filtroArea !== undefined ? filtroArea : _archivoFiltroArea;
    _archivoFechaDesde = fechaDesde !== undefined ? fechaDesde : _archivoFechaDesde;
    _archivoFechaHasta = fechaHasta !== undefined ? fechaHasta : _archivoFechaHasta;
    setActiveNav('showArchivo');
    const main = document.getElementById('mainContent');
    main.innerHTML = '<div class="spinner-lans"><div class="spinner-border text-primary"></div></div>';

    let snap;
    try { snap = await db.collection('lans_pedidos').get(); }
    catch (e) { main.innerHTML = `<div class="alert alert-danger">Error: ${e.message}</div>`; return; }

    let archivadas = [];
    snap.forEach(d => { const data = { id: d.id, ...d.data() }; if (data.archivado) archivadas.push(data); });

    if (_archivoFiltroArea !== 'todas') {
        archivadas = archivadas.filter(e => e.area === _archivoFiltroArea);
    }
    if (_archivoFechaDesde) {
        const desde = new Date(_archivoFechaDesde + 'T00:00:00');
        archivadas = archivadas.filter(e => e.fecha && e.fecha.toDate() >= desde);
    }
    if (_archivoFechaHasta) {
        const hasta = new Date(_archivoFechaHasta + 'T23:59:59');
        archivadas = archivadas.filter(e => e.fecha && e.fecha.toDate() <= hasta);
    }

    archivadas.sort((a, b) => (b.fecha?.toMillis() || 0) - (a.fecha?.toMillis() || 0));

    const areaOpts = ['todas', ...AREAS];
    const filtros = `
        <div class="card card-lans mb-3">
            <div class="card-body py-2">
                <div class="row g-2 align-items-end">
                    <div class="col-md-3">
                        <label class="form-label small fw-bold mb-1">Area</label>
                        <select class="form-select form-select-sm" onchange="showArchivo(this.value)">
                            ${areaOpts.map(a => `<option value="${a}" ${a === _archivoFiltroArea ? 'selected' : ''}>${a === 'todas' ? 'Todas las areas' : a}</option>`).join('')}
                        </select>
                    </div>
                    <div class="col-md-3">
                        <label class="form-label small fw-bold mb-1">Desde</label>
                        <input type="date" class="form-control form-control-sm" value="${_archivoFechaDesde}" onchange="showArchivo(undefined, this.value)">
                    </div>
                    <div class="col-md-3">
                        <label class="form-label small fw-bold mb-1">Hasta</label>
                        <input type="date" class="form-control form-control-sm" value="${_archivoFechaHasta}" onchange="showArchivo(undefined, undefined, this.value)">
                    </div>
                    <div class="col-md-3">
                        <button class="btn btn-outline-secondary btn-sm w-100" onclick="showArchivo('todas','','')">
                            <i class="bi bi-x-circle me-1"></i>Limpiar
                        </button>
                    </div>
                </div>
            </div>
        </div>`;

    let rows = '';
    archivadas.forEach(p => {
        const fecha = p.fecha ? p.fecha.toDate().toLocaleDateString('es-MX') : '';
        const hora = p.fecha ? p.fecha.toDate().toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' }) : '';
        const totalItems = (p.detalles || []).reduce((s, i) => s + i.cantidad, 0);
        const itemsList = (p.detalles || []).map(i => `${i.nombre} (${i.cantidad})`).join(', ');

        rows += `
            <tr>
                <td><strong>#${p.id.slice(-5).toUpperCase()}</strong></td>
                <td>${p.nombreEmpleado}</td>
                <td><span class="badge bg-primary">${p.area}</span></td>
                <td><small>${itemsList}</small></td>
                <td class="text-center">${totalItems}</td>
                <td>${fecha} <small class="text-muted">${hora}</small></td>
                <td class="text-center">
                    <button class="btn btn-outline-info btn-sm me-1" onclick="verDetalle('${p.id}')" title="Ver detalle">
                        <i class="bi bi-eye"></i>
                    </button>
                    <button class="btn btn-outline-warning btn-sm" onclick="desarchivarEntrega('${p.id}')" title="Desarchivar">
                        <i class="bi bi-arrow-counterclockwise"></i>
                    </button>
                </td>
            </tr>`;
    });

    if (!rows) rows = '<tr><td colspan="7"><div class="empty-state"><i class="bi bi-archive"></i><h5>Sin entregas archivadas</h5><p class="text-muted">Las entregas archivadas apareceran aqui</p></div></td></tr>';

    main.innerHTML = `
        <h5 class="mb-3"><i class="bi bi-archive me-2 text-lans"></i>Archivo <span class="badge bg-secondary ms-1">${archivadas.length}</span></h5>
        ${filtros}
        <div class="card card-lans">
            <div class="table-responsive">
                <table class="table table-lans table-hover mb-0">
                    <thead><tr>
                        <th>ID</th><th>Registrado por</th><th>Area</th><th>Productos</th>
                        <th class="text-center">Cant.</th><th>Fecha</th><th class="text-center">Acciones</th>
                    </tr></thead>
                    <tbody>${rows}</tbody>
                </table>
            </div>
        </div>`;
}

// ═══════════════════════════════
//  VIEW: Catalogo (Admin)
// ═══════════════════════════════

async function showCatalogo() {
    setActiveNav('showCatalogo');
    const main = document.getElementById('mainContent');
    main.innerHTML = '<div class="spinner-lans"><div class="spinner-border text-primary"></div></div>';

    const isAdmin = currentUser.rolLans === 'admin';
    const snap = await db.collection('lans_productos').get();
    const productos = {};
    const categorias = new Set();
    snap.forEach(d => {
        const p = { id: d.id, ...d.data() };
        if (!isAdmin && !p.activo) return;
        categorias.add(p.categoria);
        if (!productos[p.categoria]) productos[p.categoria] = [];
        productos[p.categoria].push(p);
    });

    let tables = '';
    for (const cat of [...categorias].sort()) {
        const items = productos[cat] || [];
        const rows = items.map(p => {
            if (isAdmin) {
                return `
                    <tr class="${!p.activo ? 'table-secondary text-muted' : ''}">
                        <td>${p.nombre}</td>
                        <td class="text-center">${p.unidad}</td>
                        <td class="text-center">
                            <input type="number" class="form-control form-control-sm" style="width:90px;display:inline"
                                   value="${p.costo || 0}" step="0.01" min="0" onchange="updateCosto('${p.id}', this.value)">
                        </td>
                        <td class="text-center"><span class="badge ${p.activo ? 'bg-success' : 'bg-secondary'}">${p.activo ? 'Activo' : 'Inactivo'}</span></td>
                        <td class="text-center">
                            <button class="btn btn-sm btn-outline-${p.activo ? 'warning' : 'success'}" onclick="toggleProducto('${p.id}', ${!p.activo})"><i class="bi bi-${p.activo ? 'pause' : 'play'}"></i></button>
                            <button class="btn btn-sm btn-outline-danger ms-1" onclick="deleteProducto('${p.id}', '${p.nombre.replace(/'/g, "\\'")}')"><i class="bi bi-trash"></i></button>
                        </td>
                    </tr>`;
            } else {
                return `
                    <tr>
                        <td>${p.nombre}</td>
                        <td class="text-center">${p.unidad}</td>
                    </tr>`;
            }
        }).join('');

        const adminHeader = isAdmin
            ? `<div class="card-header bg-white fw-bold d-flex justify-content-between align-items-center">
                    <span><i class="bi bi-tag me-2 text-lans"></i>${cat}<span class="badge bg-secondary ms-1">${items.length}</span></span>
                    <button class="btn btn-outline-danger btn-sm" onclick="deleteCategoria('${cat}')"><i class="bi bi-trash me-1"></i>Eliminar</button>
                </div>`
            : `<div class="card-header bg-white fw-bold">
                    <i class="bi bi-tag me-2 text-lans"></i>${cat}<span class="badge bg-secondary ms-1">${items.length}</span>
                </div>`;

        const thead = isAdmin
            ? '<thead><tr><th>Producto</th><th class="text-center">Unidad</th><th class="text-center">Costo Unit.</th><th class="text-center">Estado</th><th class="text-center">Acciones</th></tr></thead>'
            : '<thead><tr><th>Producto</th><th class="text-center">Unidad</th></tr></thead>';

        tables += `
            <div class="card card-lans mb-3">
                ${adminHeader}
                <div class="table-responsive">
                    <table class="table table-sm table-hover mb-0">
                        ${thead}
                        <tbody>${rows}</tbody>
                    </table>
                </div>
            </div>`;
    }

    const adminButtons = isAdmin ? `
            <div class="d-flex gap-2">
                <button class="btn btn-outline-lans btn-sm" onclick="exportarCatalogo()"><i class="bi bi-file-earmark-excel me-1"></i>Exportar</button>
                <button class="btn btn-success btn-sm" onclick="showAddCategoryForm()"><i class="bi bi-folder-plus me-1"></i>Categoria</button>
                <button class="btn btn-lans btn-sm" onclick="showAddProductForm()"><i class="bi bi-plus-lg me-1"></i>Producto</button>
            </div>` : '';

    main.innerHTML = `
        <div class="d-flex justify-content-between align-items-center mb-3">
            <h5 class="mb-0"><i class="bi bi-box-seam me-2 text-lans"></i>Catalogo de Productos</h5>
            ${adminButtons}
        </div>
        <div id="addCategoryForm" class="d-none"></div>
        <div id="addProductForm" class="d-none"></div>
        ${tables}`;
}

function showAddCategoryForm() {
    const form = document.getElementById('addCategoryForm');
    form.classList.remove('d-none');
    form.innerHTML = `<div class="card card-lans mb-3"><div class="card-body"><div class="row g-2 align-items-end">
        <div class="col-md-8"><label class="form-label small fw-bold">Nombre de la nueva categoria</label><input type="text" id="newCatNombre" class="form-control form-control-sm" placeholder="Ej: Reactivos"></div>
        <div class="col-md-4"><button class="btn btn-success btn-sm w-100" onclick="agregarCategoria()"><i class="bi bi-folder-plus me-1"></i>Crear</button></div>
    </div></div></div>`;
}

async function agregarCategoria() {
    const nombre = document.getElementById('newCatNombre').value.trim();
    if (!nombre) { showAlert('Ingresa el nombre', 'warning'); return; }
    const existing = await db.collection('lans_productos').where('categoria', '==', nombre).limit(1).get();
    if (!existing.empty) { showAlert('Ya existe', 'warning'); return; }
    await db.collection('lans_productos').add({ nombre: '(Nueva categoria)', categoria: nombre, unidad: 'Pieza', costo: 0, activo: false });
    showAlert(`Categoria "${nombre}" creada`, 'success');
    showCatalogo();
}

async function deleteCategoria(cat) {
    if (!confirm(`Eliminar "${cat}" y TODOS sus productos?`)) return;
    const snap = await db.collection('lans_productos').where('categoria', '==', cat).get();
    const batch = db.batch();
    snap.forEach(d => batch.delete(d.ref));
    await batch.commit();
    showAlert(`Categoria eliminada con ${snap.size} productos`, 'warning');
    showCatalogo();
}

function showAddProductForm() {
    const form = document.getElementById('addProductForm');
    const cats = new Set();
    document.querySelectorAll('.card-header .bi-tag').forEach(el => {
        const t = el.parentElement.textContent.trim().split('\n')[0].trim();
        if (t) cats.add(t);
    });
    const catList = cats.size > 0 ? [...cats].sort() : Object.keys(PRODUCTOS).sort();
    const options = catList.map(c => `<option value="${c}">${c}</option>`).join('');
    form.classList.remove('d-none');
    form.innerHTML = `<div class="card card-lans mb-3"><div class="card-body"><div class="row g-2 align-items-end">
        <div class="col-md-4"><label class="form-label small fw-bold">Nombre</label><input type="text" id="newProdNombre" class="form-control form-control-sm"></div>
        <div class="col-md-3"><label class="form-label small fw-bold">Categoria</label><select id="newProdCat" class="form-select form-select-sm">${options}</select></div>
        <div class="col-md-2"><label class="form-label small fw-bold">Unidad</label><select id="newProdUM" class="form-select form-select-sm"><option>Pieza</option><option>Caja</option><option>Paquete</option><option>Bolsa</option><option>Par</option></select></div>
        <div class="col-md-1"><label class="form-label small fw-bold">Costo</label><input type="number" id="newProdCosto" class="form-control form-control-sm" step="0.01" min="0"></div>
        <div class="col-md-2"><button class="btn btn-success btn-sm w-100" onclick="agregarProducto()"><i class="bi bi-plus-lg me-1"></i>Agregar</button></div>
    </div></div></div>`;
}

async function agregarProducto() {
    const nombre = document.getElementById('newProdNombre').value.trim();
    if (!nombre) { showAlert('Ingresa el nombre', 'warning'); return; }
    await db.collection('lans_productos').add({
        nombre, categoria: document.getElementById('newProdCat').value,
        unidad: document.getElementById('newProdUM').value,
        costo: parseFloat(document.getElementById('newProdCosto')?.value) || 0, activo: true
    });
    showAlert(`${nombre} agregado`, 'success');
    showCatalogo();
}

async function updateCosto(id, valor) { await db.collection('lans_productos').doc(id).update({ costo: parseFloat(valor) || 0 }); }
async function toggleProducto(id, s) { await db.collection('lans_productos').doc(id).update({ activo: s }); showCatalogo(); }
async function deleteProducto(id, n) { if (!confirm(`Eliminar "${n}"?`)) return; await db.collection('lans_productos').doc(id).delete(); showAlert(`${n} eliminado`, 'warning'); showCatalogo(); }

async function exportarCatalogo() {
    const snap = await db.collection('lans_productos').where('activo', '==', true).get();
    const productos = {};
    snap.forEach(d => { const p = d.data(); if (!productos[p.categoria]) productos[p.categoria] = []; productos[p.categoria].push(p); });
    const wb = new ExcelJS.Workbook();
    const ws = wb.addWorksheet('Catalogo LANS');
    ws.columns = [{ header: 'Categoria', key: 'cat', width: 25 }, { header: 'Producto', key: 'prod', width: 35 }, { header: 'Unidad', key: 'um', width: 14 }, { header: 'Costo Unitario', key: 'costo', width: 16 }];
    const hr = ws.getRow(1);
    hr.eachCell(cell => { cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1A5276' } }; cell.font = { color: { argb: 'FFFFFFFF' }, bold: true, size: 11 }; cell.alignment = { horizontal: 'center', vertical: 'middle' }; });
    hr.height = 22;
    for (const [cat, items] of Object.entries(productos).sort()) items.forEach(p => ws.addRow({ cat, prod: p.nombre, um: p.unidad, costo: p.costo || 0 }));
    const buffer = await wb.xlsx.writeBuffer();
    saveAs(new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' }), 'LANS_Catalogo.xlsx');
    showAlert('Catalogo exportado', 'success');
}

// ═══════════════════════════════
//  VIEW: Usuarios (Admin)
// ═══════════════════════════════

async function showUsuarios() {
    setActiveNav('showUsuarios');
    const main = document.getElementById('mainContent');
    main.innerHTML = '<div class="spinner-lans"><div class="spinner-border text-primary"></div></div>';

    const snap = await db.collection('usuarios').orderBy('nombre').get();

    const lansUsers = [];
    const proesaOnly = [];
    snap.forEach(d => {
        const u = { id: d.id, ...d.data() };
        if (u.rolLans) lansUsers.push(u);
        else proesaOnly.push(u);
    });

    let cards = '';
    lansUsers.forEach(u => {
        const rolBadge = u.rolLans === 'admin' ? 'bg-danger' : 'bg-info';
        cards += `
            <div class="col-md-6 col-lg-4 mb-3">
                <div class="card card-lans user-card h-100">
                    <div class="card-body">
                        <div class="d-flex justify-content-between align-items-start">
                            <div>
                                <h6 class="mb-1">${u.nombre}</h6>
                                <small class="text-muted">${u.usuario || u.email}</small>
                            </div>
                            <span class="badge ${rolBadge}">${u.rolLans}</span>
                        </div>
                        <div class="mt-2">
                            <small><i class="bi bi-building me-1"></i>${u.area}</small>
                            ${u.rol ? `<br><small class="text-muted"><i class="bi bi-briefcase me-1"></i>PROESA: ${u.rol}</small>` : ''}
                        </div>
                    </div>
                    ${u.id !== currentUid ? `
                    <div class="card-footer bg-white d-flex gap-1">
                        <select class="form-select form-select-sm" style="width:auto" onchange="cambiarRolLans('${u.id}', this.value)">
                            <option value="almacen" ${u.rolLans==='almacen'?'selected':''}>Almacen</option>
                            <option value="admin" ${u.rolLans==='admin'?'selected':''}>Admin</option>
                        </select>
                        <button class="btn btn-outline-danger btn-sm" onclick="quitarAccesoLans('${u.id}', '${u.nombre.replace(/'/g, "\\'")}')">
                            <i class="bi bi-x-lg me-1"></i>Quitar acceso
                        </button>
                    </div>` : ''}
                </div>
            </div>`;
    });

    let proesaList = '';
    if (proesaOnly.length > 0) {
        const rows = proesaOnly.map(u => `
            <tr>
                <td>${u.nombre}</td>
                <td><small class="text-muted">${u.usuario || u.email}</small></td>
                <td>${u.area}</td>
                <td>${u.rol}</td>
                <td>
                    <select class="form-select form-select-sm" style="width:auto;display:inline" id="rolFor_${u.id}">
                        <option value="almacen">Almacen</option>
                        <option value="admin">Admin</option>
                    </select>
                    <button class="btn btn-success btn-sm ms-1" onclick="darAccesoLans('${u.id}')">
                        <i class="bi bi-plus-lg me-1"></i>Dar acceso
                    </button>
                </td>
            </tr>`).join('');

        proesaList = `
            <div class="card card-lans mt-4">
                <div class="card-header card-header-lans">
                    <i class="bi bi-people me-2"></i>Usuarios PROESA sin acceso a LANS
                </div>
                <div class="table-responsive">
                    <table class="table table-sm table-hover mb-0">
                        <thead><tr><th>Nombre</th><th>Usuario</th><th>Area</th><th>Rol PROESA</th><th>Accion</th></tr></thead>
                        <tbody>${rows}</tbody>
                    </table>
                </div>
            </div>`;
    }

    main.innerHTML = `
        <div class="d-flex justify-content-between align-items-center mb-3">
            <h5 class="mb-0"><i class="bi bi-people me-2 text-lans"></i>Usuarios LANS</h5>
            <button class="btn btn-lans btn-sm" onclick="toggleUserForm()">
                <i class="bi bi-person-plus me-1"></i>Nuevo Usuario
            </button>
        </div>

        <div id="userFormDiv" class="d-none mb-3">
            <div class="card card-lans">
                <div class="card-header card-header-lans"><i class="bi bi-person-plus me-2"></i>Crear Nuevo Usuario (solo LANS)</div>
                <div class="card-body">
                    <p class="small text-muted mb-2">Para usuarios que ya existen en PROESA, usa la tabla de abajo para darles acceso.</p>
                    <div class="row g-2">
                        <div class="col-md-4"><label class="form-label small fw-bold">Nombre completo</label><input type="text" id="newUserNombre" class="form-control form-control-sm"></div>
                        <div class="col-md-3"><label class="form-label small fw-bold">Usuario</label><input type="text" id="newUserUser" class="form-control form-control-sm"></div>
                        <div class="col-md-3"><label class="form-label small fw-bold">Contrasena</label><input type="password" id="newUserPass" class="form-control form-control-sm"></div>
                        <div class="col-md-2"><label class="form-label small fw-bold">Rol LANS</label>
                            <select id="newUserRol" class="form-select form-select-sm">
                                <option value="almacen">Almacen</option>
                                <option value="admin">Admin</option>
                            </select>
                        </div>
                    </div>
                    <button class="btn btn-success btn-sm mt-3" onclick="crearUsuario()"><i class="bi bi-check-lg me-1"></i>Crear</button>
                    <button class="btn btn-outline-secondary btn-sm mt-3 ms-2" onclick="toggleUserForm()">Cancelar</button>
                </div>
            </div>
        </div>

        <div class="row">${cards}</div>
        ${proesaList}`;
}

function toggleUserForm() {
    document.getElementById('userFormDiv').classList.toggle('d-none');
}

async function darAccesoLans(uid) {
    const rolLans = document.getElementById('rolFor_' + uid).value;
    await db.collection('usuarios').doc(uid).update({ rolLans: rolLans });
    showAlert('Acceso LANS otorgado', 'success');
    showUsuarios();
}

async function cambiarRolLans(uid, nuevoRol) {
    await db.collection('usuarios').doc(uid).update({ rolLans: nuevoRol });
    showAlert('Rol actualizado', 'success');
}

async function quitarAccesoLans(uid, nombre) {
    if (!confirm(`Quitar acceso LANS a "${nombre}"?`)) return;
    await db.collection('usuarios').doc(uid).update({ rolLans: firebase.firestore.FieldValue.delete() });
    showAlert(`Acceso LANS removido para ${nombre}`, 'warning');
    showUsuarios();
}

async function crearUsuario() {
    const nombre = document.getElementById('newUserNombre').value.trim();
    const user   = document.getElementById('newUserUser').value.trim();
    const pass   = document.getElementById('newUserPass').value;
    const rolLans = document.getElementById('newUserRol').value;

    if (!nombre || !user || pass.length < 6) {
        showAlert('Completa todos los campos (contrasena min 6)', 'warning');
        return;
    }

    try {
        const email = `${user}@proesa.app`;
        const cred = await secondaryAuth.createUserWithEmailAndPassword(email, pass);
        await db.collection('usuarios').doc(cred.user.uid).set({
            nombre, usuario: user, email, rolLans, activo: true,
            creadoEn: firebase.firestore.FieldValue.serverTimestamp()
        });
        await secondaryAuth.signOut();
        showAlert(`"${nombre}" creado con acceso LANS como ${rolLans}`, 'success');
        showUsuarios();
    } catch (e) {
        showAlert('Error: ' + e.message, 'danger');
    }
}

// ═══════════════════════════════
//  HELPERS
// ═══════════════════════════════

function badgeEstado(estado) {
    const map = {
        entregado:      { clase: 'bg-success',            texto: 'Entregado' },
        pendiente:      { clase: 'badge-pendiente',       texto: 'Pendiente' },
        aprobado_lider: { clase: 'badge-aprobado-lider',  texto: 'Aprobado Lider' },
        aprobado:       { clase: 'badge-aprobado',        texto: 'Aprobado' },
        rechazado:      { clase: 'badge-rechazado',       texto: 'Rechazado' }
    };
    const b = map[estado] || { clase: 'bg-secondary', texto: estado };
    return `<span class="badge ${b.clase}">${b.texto}</span>`;
}

document.addEventListener('DOMContentLoaded', () => {
    const style = document.createElement('style');
    style.textContent = '.text-lans { color: #1a5276 !important; }';
    document.head.appendChild(style);
});
