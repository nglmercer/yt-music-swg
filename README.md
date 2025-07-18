# Youtube Music-swg

## Descripción

Youtube Music-swg es una aplicación web que emula la interfaz y funcionalidades de YouTube Music. Construida con Astro para el framework principal, integrada con Svelte para componentes interactivos, y estilizada con Tailwind CSS. Incluye características como reproducción de música, listas de reproducción, descargas, y un reproductor persistente.

## Instalación

1. Clona el repositorio:
   ```
   git clone https://github.com/tu-usuario/Youtube-Music-swg.git
   ```
2. Instala las dependencias:
   ```
   npm install
   ```
3. Inicia el servidor de desarrollo:
   ```
   npm run dev
   ```

La aplicación estará disponible en `http://localhost:4321`.

## Scripts disponibles

- `npm run dev`: Inicia el servidor de desarrollo.
- `npm run build`: Construye la aplicación para producción.
- `npm run preview`: Previsualiza la build de producción.

## Tecnologías

- Astro
- Svelte
- Tailwind CSS
- TypeScript

## Estructura del proyecto

- `src/components/`: Componentes como Player, Sidebar, Navbar, etc.
- `src/layouts/`: Layouts principales.
- `src/pages/`: Páginas como index.astro y search.astro.
- `src/utils/`: Utilidades como Logger, Emitter, etc.

## Características

- Interfaz responsive con sidebar y reproductor fijo.
- Secciones para canciones favoritas, descargas, listas de reproducción y mixes.
- Integración de QR (posiblemente para sharing).
- Panel de configuraciones.

Para más detalles, explora el código fuente.