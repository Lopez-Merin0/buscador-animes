// main.js - Versión final: usa data-index para obtener id real si data-id falla
const API_URL = 'https://68d07d36ec1a5ff33827584d.mockapi.io/animes';

// Elementos del DOM
const listaAnimes = document.getElementById('animes-listado');
const filtroNombre = document.getElementById('filtro-nombre');
const filtroGenero = document.getElementById('filtro-genero');
const filtroEstado = document.getElementById('filtro-estado');
const limpiarFiltrosBtn = document.getElementById('limpiar-filtros');
const noResultadosDiv = document.getElementById('no-resultados');
const loadingSpinner = document.getElementById('loading-spinner');

// Elementos del Modal CRUD (Agregar/Editar)
const crudModal = document.getElementById('crud-modal');
const modalTitle = document.getElementById('modal-title');
const cerrarModalBtn = document.getElementById('cerrar-modal');
const cancelarModalBtn = document.getElementById('cancelar-modal');
const agregarAnimeBtn = document.getElementById('btn-agregar-anime');
const guardarAnimeBtn = document.getElementById('guardar-anime');
const animeForm = document.getElementById('anime-form');
const animeIdInput = document.getElementById('anime-id'); // input oculto
const animeTituloInput = document.getElementById('anime-titulo');
const animeImagenInput = document.getElementById('anime-imagen');
const animeGeneroSelect = document.getElementById('anime-genero');
const animeEstadoSelect = document.getElementById('anime-estado');

// Elementos del Modal de Eliminación (Requieren estar definidos para que la lógica funcione)
const modalEliminar = document.getElementById('modal-eliminar');
const cerrarEliminarBtn = document.getElementById('cerrar-eliminar');
const cancelarEliminarBtn = document.getElementById('cancelar-eliminar');
const confirmarEliminarBtn = document.getElementById('confirmar-eliminar');
const mensajeEliminarNombre = document.getElementById('mensaje-eliminar-nombre');

let listaCompletaAnimes = [];

// Helper: normaliza posibles campos de id que regrese la API
const getResourceId = (obj) => {
    if (!obj) return '';
    // incluye "Id" (con mayúscula I) que es tu caso
    const raw = obj.id ?? obj.Id ?? obj._id ?? obj.objectId ?? obj.ID ?? obj._id_str ?? '';
    return (raw === null || raw === undefined) ? '' : String(raw);
};

// Utilidades UI
const mostrarSpinner = () => loadingSpinner.classList.add('is-active');
const ocultarSpinner = () => loadingSpinner.classList.remove('is-active');
const mostrarModal = (titulo) => {
    modalTitle.textContent = titulo;
    crudModal.classList.add('is-active');
};
const ocultarModal = () => {
    crudModal.classList.remove('is-active');
    animeForm.reset();
    animeIdInput.value = '';
    delete crudModal.dataset.editingId;
    delete crudModal.dataset.editingIndex;
};

// Nueva función UI: Modal de Eliminación
const mostrarModalEliminar = (id, nombre) => {
    // Es buena práctica cerrar otros modales
    ocultarModal(); 
    mensajeEliminarNombre.innerHTML = `¿Estás seguro que deseas eliminar a <strong>${nombre}</strong>?`;
    confirmarEliminarBtn.dataset.animeId = id;
    modalEliminar.classList.add('is-active');
};

const ocultarModalEliminar = () => {
    modalEliminar.classList.remove('is-active');
    delete confirmarEliminarBtn.dataset.animeId; 
};


const limpiarListado = () => listaAnimes.innerHTML = '';
const mostrarNoResultados = (mostrar) => {
    mostrar ? noResultadosDiv.classList.remove('is-hidden') : noResultadosDiv.classList.add('is-hidden');
};

// Renderizado (con data-index siempre presente)
const renderizarAnimes = (animes) => {
    limpiarListado();
    if (!Array.isArray(animes) || animes.length === 0) {
        mostrarNoResultados(true);
        return;
    }
    mostrarNoResultados(false);

    animes.forEach((anime, index) => {
        const resourceId = getResourceId(anime) || ''; // puede quedar vacío si no hay id
        const columna = document.createElement('div');
        columna.className = 'column is-one-third-desktop is-half-tablet';
        columna.innerHTML = `
            <div class="card">
                <div class="card-content">
                    <div class="media">
                        <div class="media-left">
                            <figure class="image is-48x48">
                                <img class="is-rounded" src="${anime.imagen || ''}" alt="Portada de ${anime.titulo || ''}">
                            </figure>
                        </div>
                        <div class="media-content">
                            <p class="title is-4">${anime.titulo || ''}</p>
                            <span class="tag is-primary is-light">${anime.genero || ''}</span>
                            <span class="tag is-link is-light">${anime.estado || ''}</span>
                        </div>
                    </div>
                </div>
                <footer class="card-footer">
                                        <a href="#" class="card-footer-item editar-anime" data-id="${resourceId}" data-index="${index}">
                        <span class="icon"><i class="fas fa-edit"></i></span> Editar
                    </a>
                    <a href="#" class="card-footer-item eliminar-anime" data-id="${resourceId}" data-index="${index}">
                        <span class="icon"><i class="fas fa-trash"></i></span> Eliminar
                    </a>
                </footer>
            </div>
        `;
        listaAnimes.appendChild(columna);
    });
};

// CRUD
const obtenerAnimes = async () => {
    mostrarSpinner();
    try {
        const respuesta = await fetch(API_URL);
        if (!respuesta.ok) throw new Error('Error al obtener los animes: ' + respuesta.status);
        listaCompletaAnimes = await respuesta.json();
        console.log('Animes recibidos:', listaCompletaAnimes);
        filtrarYRenderizarAnimes();
    } catch (error) {
        console.error('Error obtenerAnimes:', error);
        mostrarNoResultados(true);
    } finally {
        ocultarSpinner();
    }
};

/**
 * Agrega o edita un anime.
 */
const agregarOEditarAnime = async (anime) => {
    mostrarSpinner();
    try {
        const idRawCandidate = (anime.id ?? '').toString().trim();
        const idRaw = idRawCandidate && idRawCandidate !== 'undefined' ? idRawCandidate : '';
        const esEdicion = idRaw !== '';
        const url = esEdicion ? `${API_URL}/${encodeURIComponent(idRaw)}` : API_URL;

        if (esEdicion) {
            const check = await fetch(url);
            if (check.status === 404) {
                console.warn('agregarOEditarAnime: recurso no encontrado (GET) para id=', idRaw, 'status:', check.status);
                alert('No se puede editar: el anime seleccionado ya no existe en el servidor.');
                return false;
            }
            if (!check.ok) {
                const txt = await check.text().catch(() => '');
                console.error('agregarOEditarAnime: fallo al verificar existencia:', check.status, txt);
                throw new Error(`Fallo al verificar existencia del anime: ${check.status} ${txt}`);
            }
        }

        const metodo = esEdicion ? 'PUT' : 'POST';
        const payload = {
            titulo: anime.titulo,
            imagen: anime.imagen,
            genero: anime.genero,
            estado: anime.estado
        };

        console.log(`${esEdicion ? 'EDITANDO' : 'AGREGANDO'} -> url: ${url} payload:`, payload);

        const respuesta = await fetch(url, {
            method: metodo,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        if (!respuesta.ok) {
            const cuerpo = await respuesta.text().catch(() => '');
            console.error(`agregarOEditarAnime: respuesta no OK -> ${respuesta.status}`, cuerpo);
            throw new Error(`Error al ${esEdicion ? 'editar' : 'agregar'} el anime: ${respuesta.status} ${cuerpo}`);
        }

        await obtenerAnimes();
        return true;
    } catch (error) {
        console.error('Error agregarOEditarAnime:', error);
        return false;
    } finally {
        ocultarSpinner();
    }
};

const eliminarAnime = async (id) => {
    const idStr = (id ?? '').toString().trim();
    if (!idStr || idStr === 'undefined') {
        alert('No se pudo eliminar: identificador inválido.');
        console.warn('eliminarAnime: id inválido ->', id);
        return;
    }

    // No se necesita el 'confirm' ya que usamos el modal de Bulma para la confirmación
    mostrarSpinner();
    try {
        const respuesta = await fetch(`${API_URL}/${encodeURIComponent(idStr)}`, { method: 'DELETE' });
        if (!respuesta.ok) throw new Error('Error al eliminar el anime: ' + respuesta.status);

        // Cerramos el modal de eliminación después del éxito
        ocultarModalEliminar(); 
        await obtenerAnimes();
    } catch (error) {
        console.error('Error eliminarAnime:', error);
        alert('Ocurrió un error al eliminar el anime.');
    } finally {
        ocultarSpinner();
    }
};

// Filtrado
const filtrarYRenderizarAnimes = () => {
    const filtroNombreValor = (filtroNombre.value || '').toLowerCase();
    const filtroGeneroValor = filtroGenero.value;
    const filtroEstadoValor = filtroEstado.value;

    const animesFiltrados = (listaCompletaAnimes || []).filter(anime => {
        const matchNombre = (anime.titulo || '').toLowerCase().includes(filtroNombreValor);
        const matchGenero = !filtroGeneroValor || anime.genero === filtroGeneroValor;
        const matchEstado = !filtroEstadoValor || anime.estado === filtroEstadoValor;
        return matchNombre && matchGenero && matchEstado;
    });

    renderizarAnimes(animesFiltrados);
};

// Eventos
document.addEventListener('DOMContentLoaded', obtenerAnimes);

filtroNombre.addEventListener('input', filtrarYRenderizarAnimes);
filtroGenero.addEventListener('change', filtrarYRenderizarAnimes);
filtroEstado.addEventListener('change', filtrarYRenderizarAnimes);

limpiarFiltrosBtn.addEventListener('click', () => {
    filtroNombre.value = '';
    filtroGenero.value = '';
    filtroEstado.value = '';
    filtrarYRenderizarAnimes();
});

agregarAnimeBtn.addEventListener('click', () => {
    animeForm.reset();
    animeIdInput.value = '';
    delete crudModal.dataset.editingId;
    delete crudModal.dataset.editingIndex;
    mostrarModal('Agregar Anime');
    setTimeout(() => animeTituloInput.focus(), 100);
});

cerrarModalBtn.addEventListener('click', () => ocultarModal());
cancelarModalBtn.addEventListener('click', () => ocultarModal());

// Eventos del modal de eliminación (NUEVOS)
cerrarEliminarBtn.addEventListener('click', () => ocultarModalEliminar());
cancelarEliminarBtn.addEventListener('click', () => ocultarModalEliminar());
confirmarEliminarBtn.addEventListener('click', async (evento) => {
    evento.preventDefault();
    const idFinal = confirmarEliminarBtn.dataset.animeId;
    if (idFinal) {
        confirmarEliminarBtn.disabled = true;
        confirmarEliminarBtn.textContent = 'Eliminando...';
        await eliminarAnime(idFinal);
        confirmarEliminarBtn.disabled = false;
        confirmarEliminarBtn.innerHTML = '<span class="icon"><i class="fas fa-trash-alt"></i></span><span>Eliminar</span>';
    } else {
        alert('No se pudo determinar el anime a eliminar.');
        ocultarModalEliminar();
    }
});


window.addEventListener('click', (evt) => { 
    if (evt.target === crudModal) ocultarModal();
    if (evt.target === modalEliminar) ocultarModalEliminar(); 
});

// Guardar (toma id de animeIdInput o del dataset del modal)
guardarAnimeBtn.addEventListener('click', async (evento) => {
    evento.preventDefault();

    if (!animeForm.checkValidity()) {
        animeForm.reportValidity();
        return;
    }

    let idDesdeInput = (animeIdInput.value || '').toString().trim();
    let idDesdeDataset = (crudModal.dataset.editingId || '').toString().trim();

    if (idDesdeInput === 'undefined') idDesdeInput = '';
    if (idDesdeDataset === 'undefined') idDesdeDataset = '';

    const idFinal = idDesdeInput || idDesdeDataset;

    const modalEsEditar = modalTitle.textContent && modalTitle.textContent.toLowerCase().includes('editar');
    if (modalEsEditar && !idFinal) {
        // Intentamos recuperar id real desde editingIndex si existe
        const idxRaw = crudModal.dataset.editingIndex;
        if (idxRaw) {
            const idx = Number(idxRaw);
            if (Number.isFinite(idx) && listaCompletaAnimes[idx]) {
                const posibleId = getResourceId(listaCompletaAnimes[idx]);
                if (posibleId) {
                    console.log('Se recuperó id real desde index', idx, '->', posibleId);
                    // usamos ese id para editar
                    animeIdInput.value = posibleId;
                    crudModal.dataset.editingId = posibleId;
                } else {
                    console.warn('Objeto en listaCompletaAnimes[index] no tiene id real:', listaCompletaAnimes[idx]);
                }
            }
        }
    }

    // refrescamos idFinal por si lo recuperamos
    const idFinalPostRecovery = (animeIdInput.value || crudModal.dataset.editingId || '').toString().trim();

    // Si modal está en editar y aún no hay id, bloqueamos (no forzamos crear nuevo)
    if (modalEsEditar && !idFinalPostRecovery) {
        console.error('No se encontró el identificador del anime a editar. Asegúrate que la API retorne un campo "id" o similar.');
        alert('No se encontró el identificador del anime a editar. Revisa la consola y la respuesta del servidor.');
        return;
    }

    const nuevoAnime = {
        titulo: animeTituloInput.value.trim(),
        imagen: animeImagenInput.value.trim(),
        genero: animeGeneroSelect.value,
        estado: animeEstadoSelect.value
    };

    if (idFinalPostRecovery) nuevoAnime.id = idFinalPostRecovery;

    guardarAnimeBtn.disabled = true;
    guardarAnimeBtn.textContent = 'Guardando...';

    try {
        const exito = await agregarOEditarAnime(nuevoAnime);
        if (exito) {
            ocultarModal();
            console.log('Anime guardado correctamente:', nuevoAnime);
        } else {
            alert('No se pudieron guardar los cambios. Revisa la consola para más detalles.');
        }
    } catch (err) {
        console.error('Error en el guardado:', err);
        alert('Ocurrió un error inesperado al guardar.');
    } finally {
        guardarAnimeBtn.disabled = false;
        guardarAnimeBtn.textContent = 'Guardar';
    }
});

// Delegación: editar / eliminar
listaAnimes.addEventListener('click', (evento) => {
    const botonEditar = evento.target.closest('.editar-anime');
    if (botonEditar) {
        evento.preventDefault();
        const dataIdRaw = (botonEditar.dataset.id || '').toString().trim();
        const dataIndexRaw = (botonEditar.dataset.index || '').toString().trim();
        const dataId = (dataIdRaw && dataIdRaw !== 'undefined') ? dataIdRaw : '';

        // Primero intentamos localizar el objeto por data-id si existe
        let animeAEditar = null;
        if (dataId) {
            animeAEditar = listaCompletaAnimes.find(a => getResourceId(a) === dataId);
        }

        // Si no hay data-id o no se encontró, intentamos por index (fallback seguro)
        if (!animeAEditar && dataIndexRaw) {
            const idx = Number(dataIndexRaw);
            if (Number.isFinite(idx) && listaCompletaAnimes[idx]) {
                animeAEditar = listaCompletaAnimes[idx];
                // recuperamos id real desde el objeto (si existe)
                const posibleId = getResourceId(animeAEditar);
                if (!posibleId) {
                    console.warn('Objeto seleccionado por index no tiene id:', animeAEditar);
                } else {
                    console.log('Recuperado id desde index:', posibleId);
                }
            } else {
                console.warn('data-index inválido o fuera de rango:', dataIndexRaw);
            }
        }

        if (!animeAEditar) {
            console.warn('No se encontró el anime a editar con id/index:', dataId || dataIndexRaw, listaCompletaAnimes);
            alert('No se encontró la información del anime seleccionado.');
            return;
        }

        // Obtén el id real (si existe) y guárdalo; si no existe, mostramos mensaje al guardar (no aquí)
        const finalId = getResourceId(animeAEditar);
        animeIdInput.value = finalId;
        crudModal.dataset.editingId = finalId || '';
        // guarda editingIndex para uso en recuperación
        if (dataIndexRaw) crudModal.dataset.editingIndex = dataIndexRaw;

        animeTituloInput.value = animeAEditar.titulo || '';
        animeImagenInput.value = animeAEditar.imagen || '';
        animeGeneroSelect.value = animeAEditar.genero || '';
        animeEstadoSelect.value = animeAEditar.estado || '';
        mostrarModal('Editar Anime');

        setTimeout(() => animeTituloInput.focus(), 100);
        return;
    }

    const botonEliminar = evento.target.closest('.eliminar-anime');
    if (botonEliminar) {
        evento.preventDefault();
        const idRaw = (botonEliminar.dataset.id || '').toString().trim();
        const indexRaw = (botonEliminar.dataset.index || '').toString().trim();
        let idFinal = (idRaw && idRaw !== 'undefined') ? idRaw : '';
        let animeTitulo = 'este anime'; // Valor por defecto

        let animeAEliminar = null;
        
        // Intenta encontrar el anime para obtener el título y el ID final si falta
        if (idFinal) {
            animeAEliminar = listaCompletaAnimes.find(a => getResourceId(a) === idFinal);
        }
        if (!animeAEliminar && indexRaw) {
            const idx = Number(indexRaw);
            if (Number.isFinite(idx) && listaCompletaAnimes[idx]) {
                animeAEliminar = listaCompletaAnimes[idx];
                // Si encontramos por índice, actualizamos el idFinal
                idFinal = getResourceId(animeAEliminar) || idFinal;
            }
        }
        
        if (animeAEliminar) {
            animeTitulo = animeAEliminar.titulo || animeTitulo;
        }

        if (!idFinal) {
            console.warn('El elemento eliminar no tiene data-id válido o id no encontrado.');
            alert('No se pudo determinar el anime a eliminar.');
            return;
        }

        // Muestra el modal de confirmación con el nombre del anime
        mostrarModalEliminar(idFinal, animeTitulo);
        return;
    }
});