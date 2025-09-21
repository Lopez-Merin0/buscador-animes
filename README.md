# 🎌 Buscador y Gestión de Animes

![Captura de pantalla de la aplicación](https://via.placeholder.com/800x400.png?text=Captura+de+tu+aplicación+aquí)

### **📝 Descripción del Proyecto**

Esta es una aplicación web que funciona como un **buscador, listado y gestor de animes**. Permite a los usuarios consultar información, aplicar filtros de búsqueda, y administrar los datos de la colección de animes a través de operaciones CRUD (Crear, Leer, Actualizar y Eliminar). La aplicación consume datos de una API externa, está diseñada para ser responsive y sigue buenas prácticas de código y de gestión de Git.

### **✨ Funcionalidades Principales**

* **Búsqueda y Filtrado**: Permite buscar animes por título y filtrar por género y estado (en emisión, finalizado, etc.).
* **Visualización de Elementos**: Muestra una lista clara de los animes con su nombre, imagen, género y estado.
* **Gestión de Datos (CRUD)**:
    * **Crear**: Agregar nuevos animes a la colección mediante un formulario modal.
    * **Editar**: Modificar la información de un anime existente.
    * **Eliminar**: Borrar un anime de la lista con una confirmación de seguridad.
* **Experiencia de Usuario**:
    * Muestra un **spinner/loader** durante la carga de datos.
    * Permite limpiar todos los filtros de búsqueda con un solo botón.
    * Muestra un mensaje claro cuando no hay resultados para la búsqueda.

### **🛠️ Tecnologías Utilizadas**

* **HTML5**: Estructura semántica del proyecto.
* **CSS3**: Estilos y diseño.
* **Bulma**: Framework CSS para el diseño responsive y componentes.
* **JavaScript**: Lógica de la aplicación, manejo del DOM, y operaciones asíncronas con la API.
* **MockAPI**: Para simular una API REST y gestionar los datos del proyecto.

### **🚀 Instrucciones de Instalación y Uso**

1.  **Clonar el repositorio**:
    ```bash
    git clone (tu-url-del-repositorio-de-github)
    ```
2.  **Navegar al directorio del proyecto**:
    ```bash
    cd buscador-animes
    ```
3.  **Configurar la API**:
    * Ve a [MockAPI.io](https://mockapi.io) y crea un proyecto y un recurso llamado `animes` con los campos `titulo`, `imagen`, `genero`, y `estado`.
    * Copia la URL de tu API y reemplázala en la constante `API_URL` en el archivo `main.js`.
4.  **Ejecutar la aplicación**:
    * Simplemente abre el archivo `index.html` en tu navegador.

### **🧑‍💻 Autor**

* **Tu Nombre**: [(Enlace a GitHub)](https://github.com/Lopez-Merin0)

### **🙏 Créditos y Agradecimientos**

* [Bulma](https://bulma.io/): Framework CSS utilizado para el diseño.
* [Font Awesome](https://fontawesome.com/): Librería de íconos.
* [MockAPI](https://mockapi.io/): Servicio utilizado para la simulación del servidor REST.