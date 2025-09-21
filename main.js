// Configuración de la API (usa la URL de tu MockAPI para animes)
const API_URL = 'https://68d07d36ec1a5ff33827584d.mockapi.io/:endpoint';

// Elementos del DOM
const listaAnimes = document.getElementById('animes-listado');
const filtroNombre = document.getElementById('filtro-nombre');
const filtroGenero = document.getElementById('filtro-genero');
const filtroEstado = document.getElementById('filtro-estado');
const limpiarFiltrosBtn = document.getElementById('limpiar-filtros');
const noResultadosDiv = document.getElementById('no-resultados');
const loadingSpinner = document.getElementById('loading-spinner');

// Elementos del Modal
const crudModal = document.getElementById('crud-modal');
const modalTitle = document.getElementById('modal-title');
const cerrarModalBtn = document.getElementById('cerrar-modal');
const cancelarModalBtn = document.getElementById('cancelar-modal');
const agregarAnimeBtn = document.getElementById('btn-agregar-anime');
const guardarAnimeBtn = document.getElementById('guardar-anime');
const animeForm = document.getElementById('anime-form');
const animeIdInput = document.getElementById('anime-id');
const animeTituloInput = document.getElementById('anime-titulo');
const animeImagenInput = document.getElementById('anime-imagen');
const animeGeneroSelect = document.getElementById('anime-genero');
const animeEstadoSelect = document.getElementById('anime-estado');

let listaCompletaAnimes = [];

// Funciones de utilidad
const mostrarSpinner = () => loadingSpinner.classList.add('is-active');
const ocultarSpinner = () => loadingSpinner.classList.remove('is-active');
const mostrarModal = (titulo, id = null) => {
    modalTitle.textContent = titulo;
    animeIdInput.value = id;
    crudModal.classList.add('is-active');
};
const ocultarModal = () => {
    crudModal.classList.remove('is-active');
    animeForm.reset();
};
const limpiarListado = () => listaAnimes.innerHTML = '';
const mostrarNoResultados = (mostrar) => {
    mostrar ? noResultadosDiv.classList.remove('is-hidden') : noResultadosDiv.classList.add('is-hidden');
};

// Renderizar Animes
const renderizarAnimes = (animes) => {
    limpiarListado();
    if (animes.length === 0) {
        mostrarNoResultados(true);
        return;
    }
    mostrarNoResultados(false);
    animes.forEach(anime => {
        const columna = document.createElement('div');
        columna.className = 'column is-one-third-desktop is-half-tablet';
        columna.innerHTML = `
            <div class="card">
                <div class="card-content">
                    <div class="media">
                        <div class="media-left">
                            <figure class="image is-48x48">
                                <img class="is-rounded" src="${anime.imagen}" alt="Portada de ${anime.titulo}">
                            </figure>
                        </div>
                        <div class="media-content">
                            <p class="title is-4">${anime.titulo}</p>
                            <span class="tag is-primary is-light">${anime.genero}</span>
                            <span class="tag is-link is-light">${anime.estado}</span>
                        </div>
                    </div>
                </div>
                <footer class="card-footer">
                    <a href="#" class="card-footer-item editar-anime" data-id="${anime.id}">
                        <span class="icon"><i class="fas fa-edit"></i></span> Editar
                    </a>
                    <a href="#" class="card-footer-item eliminar-anime" data-id="${anime.id}">
                        <span class="icon"><i class="fas fa-trash"></i></span> Eliminar
                    </a>
                </footer>
            </div>
        `;
        listaAnimes.appendChild(columna);
    });
};

// Funciones CRUD
const obtenerAnimes = async () => {
    mostrarSpinner();
    try {
        const respuesta = await fetch(API_URL);
        if (!respuesta.ok) throw new Error('Error al obtener los animes');
        listaCompletaAnimes = await respuesta.json();
        filtrarYRenderizarAnimes();
    } catch (error) {
        console.error('Error:', error);
        mostrarNoResultados(true);
    } finally {
        ocultarSpinner();
    }
};

const agregarOEditarAnime = async (anime) => {
    mostrarSpinner();
    try {
        const esEdicion = !!anime.id;
        const url = esEdicion ? `${API_URL}/${anime.id}` : API_URL;
        const metodo = esEdicion ? 'PUT' : 'POST';

        const respuesta = await fetch(url, {
            method: metodo,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(anime)
        });

        if (!respuesta.ok) throw new Error(`Error al ${esEdicion ? 'editar' : 'agregar'} el anime`);

        ocultarModal();
        await obtenerAnimes();
    } catch (error) {
        console.error('Error:', error);
        alert(`Ocurrió un error al ${esEdicion ? 'editar' : 'agregar'} el anime.`);
    } finally {
        ocultarSpinner();
    }
};

const eliminarAnime = async (id) => {
    if (!confirm('¿Estás seguro de que quieres eliminar este anime?')) return;
    mostrarSpinner();
    try {
        const respuesta = await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
        if (!respuesta.ok) throw new Error('Error al eliminar el anime');
        await obtenerAnimes();
    } catch (error) {
        console.error('Error:', error);
        alert('Ocurrió un error al eliminar el anime.');
    } finally {
        ocultarSpinner();
    }
};

// Lógica de Filtrado
const filtrarYRenderizarAnimes = () => {
    const filtroNombreValor = filtroNombre.value.toLowerCase();
    const filtroGeneroValor = filtroGenero.value;
    const filtroEstadoValor = filtroEstado.value;

    const animesFiltrados = listaCompletaAnimes.filter(anime => {
        const matchNombre = anime.titulo.toLowerCase().includes(filtroNombreValor);
        const matchGenero = !filtroGeneroValor || anime.genero === filtroGeneroValor;
        const matchEstado = !filtroEstadoValor || anime.estado === filtroEstadoValor;
        return matchNombre && matchGenero && matchEstado;
    });

    renderizarAnimes(animesFiltrados);
};

// Event Listeners
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
    mostrarModal('Agregar Anime');
});

cerrarModalBtn.addEventListener('click', ocultarModal);
cancelarModalBtn.addEventListener('click', ocultarModal);

window.addEventListener('click', (evento) => {
    if (evento.target === crudModal) ocultarModal();
});

guardarAnimeBtn.addEventListener('click', (evento) => {
    evento.preventDefault();
    if (animeForm.checkValidity()) {
        const nuevoAnime = {
            titulo: animeTituloInput.value,
            imagen: animeImagenInput.value,
            genero: animeGeneroSelect.value,
            estado: animeEstadoSelect.value
        };
        const animeId = animeIdInput.value;
        if (animeId) {
            nuevoAnime.id = animeId;
        }
        agregarOEditarAnime(nuevoAnime);
    } else {
        animeForm.reportValidity();
    }
});

listaAnimes.addEventListener('click', (evento) => {
    const botonEditar = evento.target.closest('.editar-anime');
    const botonEliminar = evento.target.closest('.eliminar-anime');

    if (botonEditar) {
        evento.preventDefault();
        const id = botonEditar.dataset.id;
        const animeAEditar = listaCompletaAnimes.find(anime => anime.id === id);
        if (animeAEditar) {
            animeIdInput.value = animeAEditar.id;
            animeTituloInput.value = animeAEditar.titulo;
            animeImagenInput.value = animeAEditar.imagen;
            animeGeneroSelect.value = animeAEditar.genero;
            animeEstadoSelect.value = animeAEditar.estado;
            mostrarModal('Editar Anime', id);
        }
    } else if (botonEliminar) {
        evento.preventDefault();
        const id = botonEliminar.dataset.id;
        eliminarAnime(id);
    }
});