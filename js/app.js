/* LANS - Sistema de Inventario (GitHub Pages + Firebase)
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

const AREAS = [
    'Laboratorio',
    'Almacen',
    'Administracion',
    'Recepcion',
    'Toma de Muestras',
    'Calidad',
    'Talento Humano',
    'Contabilidad',
    'Finanzas',
    'Credito y Cobranza',
    'Abastecimiento y Compras',
    'Tecnologia de Informacion (TI)',
    'Business Intelligence (BI)'
];

const PRODUCTOS = {
    'Carpetas y Archivadores': [
        { nombre: 'Carpeta Blanca 1"', unidad: 'Pieza', costo: 51.17 },
        { nombre: 'Carpeta Blanca 3"', unidad: 'Pieza', costo: 49.11 },
        { nombre: 'Folder tamano carta color manila', unidad: 'Pieza', costo: 1.58 },
        { nombre: 'Protector de hojas tamano carta (paquete c/100)', unidad: 'Pieza', costo: 66.68 },
        { nombre: 'Revistero Negro tamano carta', unidad: 'Pieza', costo: 82.50 }
    ],
    'Cintas y Adhesivos': [
        { nombre: 'Cinta Acroprint Negro, para reloj checador TR 810', unidad: 'Pieza', costo: 110.83 },
        { nombre: 'Cinta diurex', unidad: 'Pieza', costo: 7.98 },
        { nombre: 'Cinta Etiquetadora Brother QL 800 (DK2210)', unidad: 'Pieza', costo: 377.78 },
        { nombre: 'Kola loka', unidad: 'Pieza', costo: 30.52 },
        { nombre: 'Lapiz adhesivo Pritt', unidad: 'Pieza', costo: 27.08 },
        { nombre: 'Masking 1"', unidad: 'Pieza', costo: 38.90 }
    ],
    'Clips y Sujetadores': [
        { nombre: 'Clips #2 (caja con 10 pqts)', unidad: 'Pieza', costo: 68.57 },
        { nombre: 'Clips mariposa #1', unidad: 'Pieza', costo: 18.00 },
        { nombre: 'Clips mariposa #2', unidad: 'Pieza', costo: 25.20 },
        { nombre: 'Dedales #11 (paquete con 10 pzs)', unidad: 'Pieza', costo: 29.08 },
        { nombre: 'Dedales #13 (paquete con 10 pzs)', unidad: 'Pieza', costo: 29.08 },
        { nombre: 'Engrapadora', unidad: 'Pieza', costo: 59.66 },
        { nombre: 'Grapas estandar', unidad: 'Pieza', costo: 18.31 },
        { nombre: 'Ligas #10', unidad: 'Bolsa', costo: 17.28 },
        { nombre: 'Ligas #18', unidad: 'Bolsa', costo: 17.28 },
        { nombre: 'Pinzas quitagrapas', unidad: 'Pieza', costo: 12.02 }
    ],
    'Cuadernos y Papeleria': [
        { nombre: 'Cuaderno forma francesa cuadro ch', unidad: 'Pieza', costo: 14.00 },
        { nombre: 'Cuaderno forma francesa cuadro grande', unidad: 'Pieza', costo: 14.00 },
        { nombre: 'Cuaderno profesional cuadro ch', unidad: 'Pieza', costo: 14.30 },
        { nombre: 'Cuaderno profesional cuadro grande', unidad: 'Pieza', costo: 14.70 },
        { nombre: 'Hojas blancas paquetes de 500 hojas c/u', unidad: 'Pieza', costo: 57.00 },
        { nombre: 'Regla metalica 30 cm', unidad: 'Pieza', costo: 15.90 },
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
        { nombre: 'Plumon Sharpie negro', unidad: 'Pieza', costo: 11.40 },
        { nombre: 'Plumon Sharpie plateado', unidad: 'Pieza', costo: 16.33 },
        { nombre: 'Plumones para pizarron (caja con 4 colores)', unidad: 'Pieza', costo: 49.37 }
    ],
    'Pilas': [
        { nombre: 'Pila redonda para reloj LR44', unidad: 'Pieza', costo: 23.39 },
        { nombre: 'Pilas AA', unidad: 'Pieza', costo: 18.68 },
        { nombre: 'Pilas AAA', unidad: 'Pieza', costo: 18.68 },
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
        { nombre: 'Toner W150A (elisas) B', unidad: 'Pieza', costo: 265.00 }
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

function showApp() {
    document.getElementById('loginView').style.display = 'none';
    document.getElementById('appView').style.display   = '';
    renderNav();
    const role = currentUser.rolLans;
    if (role === 'admin') showAdminPedidos();
    else if (role === 'lider') showAprobar();
    else if (role === 'almacen') showMovimientos();
    else showNuevoPedido();
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

    links += navLink('showNuevoPedido', 'bi-cart-plus', 'Nuevo Pedido');
    links += navLink('showMisPedidos', 'bi-list-check', 'Mis Pedidos');

    if (role === 'lider') {
        links += navLink('showAprobar', 'bi-check2-square', 'Aprobar');
    }
    if (role === 'almacen') {
        links += navLink('showMovimientos', 'bi-eye', 'Movimientos');
    }
    if (role === 'admin') {
        links += navLink('showAdminPedidos', 'bi-clipboard-data', 'Pedidos');
        links += navLink('showExportar', 'bi-file-earmark-excel', 'Exportar');
        links += navLink('showHistorial', 'bi-bar-chart-line', 'Historial');
        links += navLink('showCatalogo', 'bi-box-seam', 'Catalogo');
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
//  VIEW: Nuevo Pedido
// ═══════════════════════════════

async function showNuevoPedido() {
    setActiveNav('showNuevoPedido');
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
                           data-id="${p.id}" data-nombre="${p.nombre}" data-unidad="${p.unidad}"
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

    main.innerHTML = `
        <div class="row">
            <div class="col-lg-8">
                <div class="card card-lans mb-3">
                    <div class="card-header card-header-lans">
                        <i class="bi bi-cart-plus me-2"></i>Nuevo Pedido de Material
                    </div>
                    <div class="card-body">
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
                    <h6><i class="bi bi-receipt me-2"></i>Resumen del Pedido</h6>
                    <div id="summaryItems"><p class="text-muted small">Agrega productos...</p></div>
                    <hr>
                    <div class="d-flex justify-content-between fw-bold">
                        <span>Total de articulos:</span>
                        <span id="summaryTotal">0</span>
                    </div>
                    <button class="btn btn-lans w-100 mt-3" onclick="submitPedido()" id="btnSubmit">
                        <i class="bi bi-send me-2"></i>Enviar Pedido
                    </button>
                </div>
            </div>
        </div>`;
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

async function submitPedido() {
    const detalles = [];
    document.querySelectorAll('.qty-input').forEach(inp => {
        const qty = parseInt(inp.value) || 0;
        if (qty > 0) {
            detalles.push({
                productoId: inp.dataset.id,
                nombre: inp.dataset.nombre,
                unidad: inp.dataset.unidad,
                cantidad: qty
            });
        }
    });

    if (detalles.length === 0) {
        showAlert('Agrega al menos un producto', 'warning');
        return;
    }

    const btn = document.getElementById('btnSubmit');
    btn.disabled = true;
    btn.innerHTML = '<span class="spinner-border spinner-border-sm"></span> Enviando...';

    try {
        const role = currentUser.rolLans;
        const saltaLider = role === 'admin' || role === 'lider';
        await db.collection('lans_pedidos').add({
            uid: currentUid,
            nombreEmpleado: currentUser.nombre,
            area: currentUser.area,
            rolLans: role,
            detalles: detalles,
            estado: saltaLider ? 'aprobado_lider' : 'pendiente',
            fecha: firebase.firestore.FieldValue.serverTimestamp(),
            aprobadoPorLider: saltaLider ? currentUid : null,
            aprobadoPorAdmin: null,
            nombreLider: saltaLider ? currentUser.nombre : null,
            nombreAdmin: null,
            noInventario: null
        });
        showAlert('Pedido enviado correctamente', 'success');
        showMisPedidos();
    } catch (e) {
        showAlert('Error al enviar: ' + e.message, 'danger');
        btn.disabled = false;
        btn.innerHTML = '<i class="bi bi-send me-2"></i>Enviar Pedido';
    }
}

// ═══════════════════════════════
//  VIEW: Mis Pedidos
// ═══════════════════════════════

async function showMisPedidos() {
    setActiveNav('showMisPedidos');
    const main = document.getElementById('mainContent');
    main.innerHTML = '<div class="spinner-lans"><div class="spinner-border text-primary"></div></div>';

    let snap;
    try {
        snap = await db.collection('lans_pedidos').where('uid', '==', currentUid).get();
    } catch (e) {
        main.innerHTML = `<div class="alert alert-danger">Error al cargar pedidos: ${e.message}</div>`;
        return;
    }

    if (snap.empty) {
        main.innerHTML = `<div class="empty-state">
            <i class="bi bi-inbox"></i><h5>No tienes pedidos</h5>
            <p>Crea tu primer pedido de material</p>
            <button class="btn btn-lans" onclick="showNuevoPedido()">
                <i class="bi bi-cart-plus me-2"></i>Nuevo Pedido
            </button></div>`;
        return;
    }

    const pedidos = [];
    snap.forEach(d => pedidos.push({ id: d.id, ...d.data() }));
    pedidos.sort((a, b) => (b.fecha?.toMillis() || 0) - (a.fecha?.toMillis() || 0));

    let cards = '';
    pedidos.forEach(p => {
        const fecha = p.fecha ? p.fecha.toDate().toLocaleDateString('es-MX') : 'Pendiente';
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
                        <strong>Pedido #${p.id.slice(-5).toUpperCase()}</strong>
                        ${badgeEstado(p.estado)}
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
            <h5 class="mb-0"><i class="bi bi-list-check me-2 text-lans"></i>Mis Pedidos</h5>
            <button class="btn btn-lans btn-sm" onclick="showNuevoPedido()">
                <i class="bi bi-plus-lg me-1"></i>Nuevo
            </button>
        </div>
        <div class="row">${cards}</div>`;
}

// ═══════════════════════════════
//  VIEW: Aprobar (Lider)
// ═══════════════════════════════

async function showAprobar() {
    setActiveNav('showAprobar');
    const main = document.getElementById('mainContent');
    main.innerHTML = '<div class="spinner-lans"><div class="spinner-border text-primary"></div></div>';

    let snap;
    try {
        snap = await db.collection('lans_pedidos')
            .where('area', '==', currentUser.area)
            .where('estado', '==', 'pendiente')
            .get();
    } catch (e) {
        main.innerHTML = `<div class="alert alert-danger">Error al cargar: ${e.message}</div>`;
        return;
    }

    if (snap.empty) {
        main.innerHTML = `<div class="empty-state">
            <i class="bi bi-check-circle"></i>
            <h5>Sin pedidos pendientes</h5>
            <p>No hay pedidos por aprobar en tu area</p></div>`;
        return;
    }

    const pedidosAprobar = [];
    snap.forEach(d => pedidosAprobar.push({ id: d.id, ...d.data() }));
    pedidosAprobar.sort((a, b) => (b.fecha?.toMillis() || 0) - (a.fecha?.toMillis() || 0));

    let cards = '';
    pedidosAprobar.forEach(p => {
        const fecha = p.fecha ? p.fecha.toDate().toLocaleDateString('es-MX') : '';
        const items = (p.detalles || []).map(i =>
            `<tr><td>${i.nombre}</td><td class="text-center">${i.unidad}</td><td class="text-center">${i.cantidad}</td></tr>`
        ).join('');

        cards += `
            <div class="col-lg-6 mb-3">
                <div class="card card-lans">
                    <div class="card-header card-header-lans d-flex justify-content-between">
                        <span><i class="bi bi-person me-1"></i>${p.nombreEmpleado}</span>
                        <small>${fecha}</small>
                    </div>
                    <div class="card-body p-0">
                        <table class="table table-sm mb-0">
                            <thead><tr><th>Producto</th><th class="text-center">UM</th><th class="text-center">Cant.</th></tr></thead>
                            <tbody>${items}</tbody>
                        </table>
                    </div>
                    <div class="card-footer bg-white d-flex gap-2">
                        <button class="btn btn-success btn-sm flex-fill" onclick="aprobarPedido('${p.id}','aprobado_lider')">
                            <i class="bi bi-check-lg me-1"></i>Aprobar
                        </button>
                        <button class="btn btn-danger btn-sm flex-fill" onclick="aprobarPedido('${p.id}','rechazado')">
                            <i class="bi bi-x-lg me-1"></i>Rechazar
                        </button>
                    </div>
                </div>
            </div>`;
    });

    main.innerHTML = `
        <h5 class="mb-3"><i class="bi bi-check2-square me-2 text-lans"></i>Pedidos por Aprobar - ${currentUser.area}</h5>
        <div class="row">${cards}</div>`;
}

async function aprobarPedido(pedidoId, nuevoEstado) {
    try {
        const role = currentUser.rolLans;
        const updates = { estado: nuevoEstado };
        if (nuevoEstado === 'aprobado_lider') {
            updates.aprobadoPorLider = currentUid;
            updates.nombreLider = currentUser.nombre;
            updates.fechaAprobacionLider = firebase.firestore.FieldValue.serverTimestamp();
        } else if (nuevoEstado === 'aprobado') {
            updates.aprobadoPorAdmin = currentUid;
            updates.nombreAdmin = currentUser.nombre;
            updates.fechaAprobacionAdmin = firebase.firestore.FieldValue.serverTimestamp();
        } else if (nuevoEstado === 'rechazado') {
            if (role === 'lider') {
                updates.aprobadoPorLider = currentUid;
                updates.nombreLider = currentUser.nombre;
            } else {
                updates.aprobadoPorAdmin = currentUid;
                updates.nombreAdmin = currentUser.nombre;
            }
        }

        await db.collection('lans_pedidos').doc(pedidoId).update(updates);
        showAlert(nuevoEstado === 'rechazado' ? 'Pedido rechazado' : 'Pedido actualizado', nuevoEstado === 'rechazado' ? 'warning' : 'success');

        if (role === 'lider') showAprobar();
        else showAdminPedidos();
    } catch (e) {
        showAlert('Error: ' + e.message, 'danger');
    }
}

async function eliminarPedido(pedidoId) {
    if (!confirm('Eliminar este pedido? Esta accion no se puede deshacer.')) return;
    try {
        await db.collection('lans_pedidos').doc(pedidoId).delete();
        showAlert('Pedido eliminado', 'warning');
        showAdminPedidos();
    } catch (e) {
        showAlert('Error: ' + e.message, 'danger');
    }
}

// ═══════════════════════════════
//  VIEW: Movimientos (Almacen - solo lectura, sin costos)
// ═══════════════════════════════

async function showMovimientos(filtro) {
    filtro = filtro || 'todos';
    setActiveNav('showMovimientos');
    const main = document.getElementById('mainContent');
    main.innerHTML = '<div class="spinner-lans"><div class="spinner-border text-primary"></div></div>';

    let snap;
    try {
        if (filtro === 'todos') {
            snap = await db.collection('lans_pedidos').get();
        } else {
            snap = await db.collection('lans_pedidos').where('estado', '==', filtro).get();
        }
    } catch (e) {
        main.innerHTML = `<div class="alert alert-danger">Error al cargar: ${e.message}</div>`;
        return;
    }

    const pedidos = [];
    snap.forEach(d => pedidos.push({ id: d.id, ...d.data() }));
    pedidos.sort((a, b) => (b.fecha?.toMillis() || 0) - (a.fecha?.toMillis() || 0));

    const filters = [
        { key: 'todos', label: 'Todos', icon: 'bi-grid' },
        { key: 'pendiente', label: 'Pendientes', icon: 'bi-hourglass-split' },
        { key: 'aprobado_lider', label: 'Aprobado Lider', icon: 'bi-person-check' },
        { key: 'aprobado', label: 'Aprobados', icon: 'bi-check-circle' },
        { key: 'rechazado', label: 'Rechazados', icon: 'bi-x-circle' }
    ];

    const filterBtns = filters.map(f =>
        `<button class="btn btn-sm ${f.key === filtro ? 'btn-lans' : 'btn-outline-secondary'}"
                 onclick="showMovimientos('${f.key}')">
            <i class="bi ${f.icon} me-1"></i>${f.label}
        </button>`
    ).join('');

    if (pedidos.length === 0) {
        main.innerHTML = `
            <h5 class="mb-3"><i class="bi bi-eye me-2 text-lans"></i>Movimientos</h5>
            <div class="filter-tabs d-flex flex-wrap gap-2 mb-3">${filterBtns}</div>
            <div class="empty-state"><i class="bi bi-inbox"></i><h5>Sin movimientos</h5></div>`;
        return;
    }

    let rows = '';
    pedidos.forEach(p => {
        const fecha = p.fecha ? p.fecha.toDate().toLocaleDateString('es-MX') : '';
        const totalItems = (p.detalles || []).reduce((s, i) => s + i.cantidad, 0);
        const itemsList = (p.detalles || []).map(i => `${i.nombre} (${i.cantidad})`).join(', ');

        rows += `
            <tr>
                <td><strong>#${p.id.slice(-5).toUpperCase()}</strong></td>
                <td>${p.nombreEmpleado}</td>
                <td>${p.area}</td>
                <td><small>${itemsList}</small></td>
                <td class="text-center">${totalItems}</td>
                <td class="text-center">${badgeEstado(p.estado)}</td>
                <td>${fecha}</td>
            </tr>`;
    });

    main.innerHTML = `
        <h5 class="mb-3"><i class="bi bi-eye me-2 text-lans"></i>Movimientos</h5>
        <div class="filter-tabs d-flex flex-wrap gap-2 mb-3">${filterBtns}</div>
        <div class="card card-lans">
            <div class="table-responsive">
                <table class="table table-lans table-hover mb-0">
                    <thead><tr>
                        <th>ID</th><th>Solicitante</th><th>Area</th><th>Productos</th>
                        <th class="text-center">Cant.</th><th class="text-center">Estado</th>
                        <th>Fecha</th>
                    </tr></thead>
                    <tbody>${rows}</tbody>
                </table>
            </div>
        </div>`;
}

// ═══════════════════════════════
//  VIEW: Admin Pedidos
// ═══════════════════════════════

async function showAdminPedidos(filtro) {
    filtro = filtro || 'por_aprobar';
    setActiveNav('showAdminPedidos');
    const main = document.getElementById('mainContent');
    main.innerHTML = '<div class="spinner-lans"><div class="spinner-border text-primary"></div></div>';

    let snap;
    try {
        if (filtro === 'por_aprobar') {
            snap = await db.collection('lans_pedidos')
                .where('estado', 'in', ['pendiente', 'aprobado_lider']).get();
        } else if (filtro === 'todos') {
            snap = await db.collection('lans_pedidos').get();
        } else {
            snap = await db.collection('lans_pedidos').where('estado', '==', filtro).get();
        }
    } catch (e) {
        main.innerHTML = `<div class="alert alert-danger">Error al cargar pedidos: ${e.message}</div>`;
        return;
    }

    const adminPedidos = [];
    snap.forEach(d => adminPedidos.push({ id: d.id, ...d.data() }));
    adminPedidos.sort((a, b) => (b.fecha?.toMillis() || 0) - (a.fecha?.toMillis() || 0));

    const filters = [
        { key: 'por_aprobar', label: 'Por Aprobar', icon: 'bi-hourglass-split' },
        { key: 'aprobado', label: 'Aprobados', icon: 'bi-check-circle' },
        { key: 'rechazado', label: 'Rechazados', icon: 'bi-x-circle' },
        { key: 'todos', label: 'Todos', icon: 'bi-grid' }
    ];

    const filterBtns = filters.map(f =>
        `<button class="btn btn-sm ${f.key === filtro ? 'btn-lans' : 'btn-outline-secondary'}"
                 onclick="showAdminPedidos('${f.key}')">
            <i class="bi ${f.icon} me-1"></i>${f.label}
        </button>`
    ).join('');

    if (adminPedidos.length === 0) {
        main.innerHTML = `
            <h5 class="mb-3"><i class="bi bi-clipboard-data me-2 text-lans"></i>Gestion de Pedidos</h5>
            <div class="filter-tabs d-flex flex-wrap gap-2 mb-3">${filterBtns}</div>
            <div class="empty-state"><i class="bi bi-inbox"></i><h5>Sin pedidos</h5></div>`;
        return;
    }

    let rows = '';
    adminPedidos.forEach(p => {
        const fecha = p.fecha ? p.fecha.toDate().toLocaleDateString('es-MX') : '';
        const totalItems = (p.detalles || []).reduce((s, i) => s + i.cantidad, 0);
        const itemsList = (p.detalles || []).map(i => `${i.nombre} (${i.cantidad})`).join(', ');

        let actions = '';
        if (p.estado === 'pendiente' || p.estado === 'aprobado_lider') {
            actions = `
                <button class="btn btn-success btn-sm me-1" onclick="aprobarPedido('${p.id}','aprobado')" title="Aprobar">
                    <i class="bi bi-check-lg"></i>
                </button>
                <button class="btn btn-danger btn-sm me-1" onclick="aprobarPedido('${p.id}','rechazado')" title="Rechazar">
                    <i class="bi bi-x-lg"></i>
                </button>`;
        }
        actions += `
            <button class="btn btn-outline-danger btn-sm" onclick="eliminarPedido('${p.id}')" title="Eliminar">
                <i class="bi bi-trash"></i>
            </button>`;

        rows += `
            <tr>
                <td><strong>#${p.id.slice(-5).toUpperCase()}</strong></td>
                <td>${p.nombreEmpleado}</td>
                <td>${p.area}</td>
                <td><small>${itemsList}</small></td>
                <td class="text-center">${totalItems}</td>
                <td class="text-center">${badgeEstado(p.estado)}</td>
                <td>${fecha}</td>
                <td class="text-center">${actions}</td>
            </tr>`;
    });

    main.innerHTML = `
        <h5 class="mb-3"><i class="bi bi-clipboard-data me-2 text-lans"></i>Gestion de Pedidos</h5>
        <div class="filter-tabs d-flex flex-wrap gap-2 mb-3">${filterBtns}</div>
        <div class="card card-lans">
            <div class="table-responsive">
                <table class="table table-lans table-hover mb-0">
                    <thead><tr>
                        <th>ID</th><th>Empleado</th><th>Area</th><th>Productos</th>
                        <th class="text-center">Cant.</th><th class="text-center">Estado</th>
                        <th>Fecha</th><th class="text-center">Acciones</th>
                    </tr></thead>
                    <tbody>${rows}</tbody>
                </table>
            </div>
        </div>`;
}

// ═══════════════════════════════
//  VIEW: Exportar Excel
// ═══════════════════════════════

async function showExportar() {
    setActiveNav('showExportar');
    const main = document.getElementById('mainContent');
    main.innerHTML = '<div class="spinner-lans"><div class="spinner-border text-primary"></div></div>';

    let snap;
    try {
        snap = await db.collection('lans_pedidos').where('estado', '==', 'aprobado').get();
    } catch (e) {
        main.innerHTML = `<div class="alert alert-danger">Error al cargar: ${e.message}</div>`;
        return;
    }

    const exportPedidos = [];
    snap.forEach(d => exportPedidos.push({ id: d.id, ...d.data() }));
    exportPedidos.sort((a, b) => (b.fecha?.toMillis() || 0) - (a.fecha?.toMillis() || 0));

    if (exportPedidos.length === 0) {
        main.innerHTML = `<div class="empty-state">
            <i class="bi bi-file-earmark-excel"></i>
            <h5>Sin pedidos aprobados</h5>
            <p>No hay pedidos listos para exportar</p></div>`;
        return;
    }

    let rows = '';
    exportPedidos.forEach(p => {
        const fecha = p.fecha ? p.fecha.toDate().toLocaleDateString('es-MX') : '';
        const items = (p.detalles || []).map(i => `${i.nombre} (${i.cantidad})`).join(', ');
        rows += `
            <tr>
                <td class="text-center">
                    <input type="checkbox" class="form-check-input export-check" value="${p.id}"
                           data-detalles='${JSON.stringify(p.detalles || [])}'>
                </td>
                <td><strong>#${p.id.slice(-5).toUpperCase()}</strong></td>
                <td>${p.nombreEmpleado}</td>
                <td>${p.area}</td>
                <td><small>${items}</small></td>
                <td>${fecha}</td>
            </tr>`;
    });

    main.innerHTML = `
        <h5 class="mb-3"><i class="bi bi-file-earmark-excel me-2 text-lans"></i>Exportar a Excel</h5>
        <div class="card card-lans mb-3">
            <div class="card-body">
                <div class="row align-items-end">
                    <div class="col-md-6 mb-2">
                        <label class="form-label fw-bold">No. Inventario</label>
                        <input type="text" id="noInventario" class="form-control"
                               placeholder="Ej: LANS-INV-0001" value="LANS-INV-0001">
                    </div>
                    <div class="col-md-6 mb-2">
                        <button class="btn btn-lans" onclick="descargarExcel()">
                            <i class="bi bi-download me-2"></i>Descargar Excel
                        </button>
                        <button class="btn btn-outline-secondary ms-2" onclick="toggleAllExport()">
                            <i class="bi bi-check2-all me-1"></i>Seleccionar Todos
                        </button>
                    </div>
                </div>
            </div>
        </div>
        <div class="card card-lans">
            <div class="table-responsive">
                <table class="table table-lans table-hover mb-0">
                    <thead><tr>
                        <th class="text-center"><input type="checkbox" class="form-check-input" onchange="toggleAllExport(this.checked)"></th>
                        <th>ID</th><th>Empleado</th><th>Area</th><th>Productos</th><th>Fecha</th>
                    </tr></thead>
                    <tbody>${rows}</tbody>
                </table>
            </div>
        </div>`;
}

function toggleAllExport(checked) {
    const state = checked !== undefined ? checked : true;
    document.querySelectorAll('.export-check').forEach(cb => cb.checked = state);
}

async function descargarExcel() {
    const noInv = document.getElementById('noInventario').value.trim() || 'SIN-NUMERO';
    const checked = document.querySelectorAll('.export-check:checked');

    if (checked.length === 0) { showAlert('Selecciona al menos un pedido', 'warning'); return; }

    const consolidated = {};
    checked.forEach(cb => {
        JSON.parse(cb.dataset.detalles).forEach(item => {
            if (!consolidated[item.nombre]) consolidated[item.nombre] = { nombre: item.nombre, unidad: item.unidad, cantidad: 0 };
            consolidated[item.nombre].cantidad += item.cantidad;
        });
    });

    const wb = new ExcelJS.Workbook();
    const ws = wb.addWorksheet('Pedido LANS');
    ws.columns = [
        { header: 'No. Inventario', key: 'inv', width: 20 },
        { header: 'Descripcion de Linea', key: 'desc', width: 38 },
        { header: 'UM', key: 'um', width: 14 },
        { header: 'Cant. Orden', key: 'cant', width: 14 }
    ];

    const headerRow = ws.getRow(1);
    headerRow.eachCell(cell => {
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1A5276' } };
        cell.font = { color: { argb: 'FFFFFFFF' }, bold: true, size: 11 };
        cell.alignment = { horizontal: 'center', vertical: 'middle' };
        cell.border = { top: { style: 'thin', color: { argb: 'FF0E3650' } }, bottom: { style: 'thin', color: { argb: 'FF0E3650' } }, left: { style: 'thin', color: { argb: 'FF0E3650' } }, right: { style: 'thin', color: { argb: 'FF0E3650' } } };
    });
    headerRow.height = 22;

    Object.values(consolidated).forEach(item => {
        const row = ws.addRow({ inv: noInv, desc: item.nombre, um: item.unidad, cant: item.cantidad });
        row.eachCell(cell => {
            cell.border = { top: { style: 'thin', color: { argb: 'FFD4D4D4' } }, bottom: { style: 'thin', color: { argb: 'FFD4D4D4' } }, left: { style: 'thin', color: { argb: 'FFD4D4D4' } }, right: { style: 'thin', color: { argb: 'FFD4D4D4' } } };
            cell.alignment = { vertical: 'middle' };
        });
    });

    const buffer = await wb.xlsx.writeBuffer();
    const fecha = new Date().toISOString().slice(0, 10);
    saveAs(new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' }), `LANS_Pedido_${fecha}.xlsx`);
    showAlert(`Excel descargado con ${Object.keys(consolidated).length} productos`, 'success');

    checked.forEach(async cb => {
        await db.collection('lans_pedidos').doc(cb.value).update({ noInventario: noInv, fechaExportacion: firebase.firestore.FieldValue.serverTimestamp() });
    });
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

    const pedidos = [];
    snap.forEach(d => pedidos.push({ id: d.id, ...d.data() }));

    const porArea = {};
    pedidos.forEach(p => {
        const area = p.area;
        if (!porArea[area]) porArea[area] = { total: 0, aprobados: 0, rechazados: 0, pendientes: 0, articulos: 0, productos: {} };
        porArea[area].total++;
        if (p.estado === 'aprobado') porArea[area].aprobados++;
        if (p.estado === 'rechazado') porArea[area].rechazados++;
        if (p.estado === 'pendiente' || p.estado === 'aprobado_lider') porArea[area].pendientes++;
        (p.detalles || []).forEach(item => {
            porArea[area].articulos += item.cantidad;
            porArea[area].productos[item.nombre] = (porArea[area].productos[item.nombre] || 0) + item.cantidad;
        });
    });

    const totalPedidos = pedidos.length;
    const totalArticulos = pedidos.reduce((s, p) => s + (p.detalles || []).reduce((ss, i) => ss + i.cantidad, 0), 0);
    const totalAprobados = pedidos.filter(p => p.estado === 'aprobado').length;
    const totalPendientes = pedidos.filter(p => p.estado === 'pendiente' || p.estado === 'aprobado_lider').length;

    const kpis = `
        <div class="row mb-4">
            <div class="col-6 col-md-3 mb-2"><div class="card card-lans text-center p-3"><div class="fs-2 fw-bold text-lans">${totalPedidos}</div><small class="text-muted">Total Pedidos</small></div></div>
            <div class="col-6 col-md-3 mb-2"><div class="card card-lans text-center p-3"><div class="fs-2 fw-bold" style="color:var(--lans-success)">${totalAprobados}</div><small class="text-muted">Aprobados</small></div></div>
            <div class="col-6 col-md-3 mb-2"><div class="card card-lans text-center p-3"><div class="fs-2 fw-bold" style="color:var(--lans-warning)">${totalPendientes}</div><small class="text-muted">Pendientes</small></div></div>
            <div class="col-6 col-md-3 mb-2"><div class="card card-lans text-center p-3"><div class="fs-2 fw-bold text-lans">${totalArticulos}</div><small class="text-muted">Total Articulos</small></div></div>
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
                    <div class="d-flex justify-content-between mb-2"><span class="fw-bold">${stats.total} pedidos</span><span class="small text-muted">${stats.articulos} articulos</span></div>
                    <div class="progress mb-3" style="height:8px"><div class="progress-bar" style="width:${Math.round((stats.total/maxP)*100)}%;background:var(--lans-blue)"></div></div>
                    <div class="d-flex gap-2 mb-3 flex-wrap">
                        <span class="badge badge-aprobado"><i class="bi bi-check me-1"></i>${stats.aprobados}</span>
                        <span class="badge badge-pendiente"><i class="bi bi-clock me-1"></i>${stats.pendientes}</span>
                        <span class="badge badge-rechazado"><i class="bi bi-x me-1"></i>${stats.rechazados}</span>
                    </div>
                    <h6 class="small fw-bold text-muted mb-1">Mas solicitados:</h6>
                    ${topList || '<span class="small text-muted">Sin productos</span>'}
                </div>
            </div></div>`;
    }

    if (!areaCards) areaCards = '<div class="col-12"><div class="empty-state"><i class="bi bi-bar-chart-line"></i><h5>Sin historial</h5></div></div>';

    const globalProds = {};
    pedidos.forEach(p => (p.detalles || []).forEach(i => { globalProds[i.nombre] = (globalProds[i.nombre] || 0) + i.cantidad; }));
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
//  VIEW: Catalogo (Admin)
// ═══════════════════════════════

async function showCatalogo() {
    setActiveNav('showCatalogo');
    const main = document.getElementById('mainContent');
    main.innerHTML = '<div class="spinner-lans"><div class="spinner-border text-primary"></div></div>';

    const snap = await db.collection('lans_productos').get();
    const productos = {};
    const categorias = new Set();
    snap.forEach(d => {
        const p = { id: d.id, ...d.data() };
        categorias.add(p.categoria);
        if (!productos[p.categoria]) productos[p.categoria] = [];
        productos[p.categoria].push(p);
    });

    let tables = '';
    for (const cat of [...categorias].sort()) {
        const items = productos[cat] || [];
        const rows = items.map(p => `
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
            </tr>`).join('');

        tables += `
            <div class="card card-lans mb-3">
                <div class="card-header bg-white fw-bold d-flex justify-content-between align-items-center">
                    <span><i class="bi bi-tag me-2 text-lans"></i>${cat}<span class="badge bg-secondary ms-1">${items.length}</span></span>
                    <button class="btn btn-outline-danger btn-sm" onclick="deleteCategoria('${cat}')"><i class="bi bi-trash me-1"></i>Eliminar</button>
                </div>
                <div class="table-responsive">
                    <table class="table table-sm table-hover mb-0">
                        <thead><tr><th>Producto</th><th class="text-center">Unidad</th><th class="text-center">Costo Unit.</th><th class="text-center">Estado</th><th class="text-center">Acciones</th></tr></thead>
                        <tbody>${rows}</tbody>
                    </table>
                </div>
            </div>`;
    }

    main.innerHTML = `
        <div class="d-flex justify-content-between align-items-center mb-3">
            <h5 class="mb-0"><i class="bi bi-box-seam me-2 text-lans"></i>Catalogo de Productos</h5>
            <div class="d-flex gap-2">
                <button class="btn btn-outline-lans btn-sm" onclick="exportarCatalogo()"><i class="bi bi-file-earmark-excel me-1"></i>Exportar</button>
                <button class="btn btn-success btn-sm" onclick="showAddCategoryForm()"><i class="bi bi-folder-plus me-1"></i>Categoria</button>
                <button class="btn btn-lans btn-sm" onclick="showAddProductForm()"><i class="bi bi-plus-lg me-1"></i>Producto</button>
            </div>
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
//  Muestra usuarios con rolLans, permite dar/quitar acceso LANS
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
        const rolBadge = u.rolLans === 'admin' ? 'bg-danger' : u.rolLans === 'lider' ? 'bg-primary' : 'bg-info';
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
                            <option value="lider" ${u.rolLans==='lider'?'selected':''}>Lider</option>
                            <option value="admin" ${u.rolLans==='admin'?'selected':''}>Admin</option>
                        </select>
                        <button class="btn btn-outline-danger btn-sm" onclick="quitarAccesoLans('${u.id}', '${u.nombre}')">
                            <i class="bi bi-x-lg me-1"></i>Quitar acceso
                        </button>
                    </div>` : ''}
                </div>
            </div>`;
    });

    // Usuarios PROESA sin acceso LANS
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
                        <option value="lider">Lider</option>
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

    const areaOpts = AREAS.map(a => `<option value="${a}">${a}</option>`).join('');

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
                        <div class="col-md-3"><label class="form-label small fw-bold">Nombre completo</label><input type="text" id="newUserNombre" class="form-control form-control-sm"></div>
                        <div class="col-md-2"><label class="form-label small fw-bold">Usuario</label><input type="text" id="newUserUser" class="form-control form-control-sm"></div>
                        <div class="col-md-2"><label class="form-label small fw-bold">Contrasena</label><input type="password" id="newUserPass" class="form-control form-control-sm"></div>
                        <div class="col-md-2"><label class="form-label small fw-bold">Rol LANS</label>
                            <select id="newUserRol" class="form-select form-select-sm">
                                <option value="almacen">Almacen</option>
                                <option value="lider">Lider</option>
                                <option value="admin">Admin</option>
                            </select>
                        </div>
                        <div class="col-md-3"><label class="form-label small fw-bold">Area</label><select id="newUserArea" class="form-select form-select-sm">${areaOpts}</select></div>
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
    const area   = document.getElementById('newUserArea').value;

    if (!nombre || !user || pass.length < 6) {
        showAlert('Completa todos los campos (contrasena min 6)', 'warning');
        return;
    }

    try {
        const email = `${user}@proesa.app`;
        const cred = await secondaryAuth.createUserWithEmailAndPassword(email, pass);
        await db.collection('usuarios').doc(cred.user.uid).set({
            nombre, usuario: user, email, rolLans, area, activo: true,
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
        pendiente:      { clase: 'badge-pendiente',      texto: 'Pendiente' },
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
