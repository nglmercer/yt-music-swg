<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import type { SongData } from "../utils/fetch/youtube-music"; // Asegúrate de que esta ruta de importación sea correcta en tu proyecto
  import { YTMusicApi } from "../utils/fetch/fetchapi";
  import {emitter} from "@utils/Emitter";
  async function nextOrprevious(number:number) {
    let result;
    if (Number(number) >= 0) {
        result = await YTMusicApi.next();
    } else {
        result = await YTMusicApi.previous();
    }
    console.log("result", result);
    return result;
  }
  // --- ESTADO DEL COMPONENTE ---

  // El estado reactivo principal que almacena los datos de la canción.
  // Comienza como `null` para indicar que no hay ninguna canción activa.
  let songData: SongData | null = null;

  // Estado para el tiempo transcurrido de la canción.
  let elapsedSeconds = 0;
  
  // Estado para controlar la reproducción (play/pause).
  let isPlaying = false;
  let volumeLevel = 0.75; 


  // --- MANEJO DE ACTUALIZACIONES EXTERNAS ---

  // Esta función se activa cuando se recibe el evento 'update-song'.
  async function handleSongUpdate(newData: SongData) {
      if (!newData) return;
      songData = newData;
      elapsedSeconds = songData.elapsedSeconds || 0;
      isPlaying =!songData.isPaused;
      const volume_value = await YTMusicApi.getVolume();
      if (volume_value?.state){
        volumeLevel = volume_value.state;
      }
      console.log("volume_value", volume_value)
  }

  // --- LÓGICA DEL CICLO DE VIDA ---

  let timer: number; // Variable para el intervalo del temporizador.

  onMount(() => {
    // Escucha eventos para actualizar la canción desde fuera del componente.
    emitter.on('update-song', handleSongUpdate);
    // Inicia el temporizador para la barra de progreso.
    timer = window.setInterval(() => {
      if (songData && isPlaying && elapsedSeconds < songData.songDuration) {
        elapsedSeconds++;
      }
    }, 1000);
  });

  onDestroy(() => {
    // Limpia el listener y el intervalo para evitar fugas de memoria.
    clearInterval(timer);
  });

  // --- LÓGICA REACTIVA ---

  // Cuando `songData` cambia, se resetea el tiempo transcurrido.
  $: if (songData) {
    elapsedSeconds = songData.elapsedSeconds;
    isPlaying = !songData.isPaused;
  }

  // --- DATOS DERIVADOS PARA LA UI ---

  // Calcula el porcentaje de progreso para la barra.
  $: progressPercentage = songData
    ? (elapsedSeconds / songData.songDuration) * 100
    : 0;

  // Formatea el tiempo de segundos a un formato `minutos:segundos`.
  function formatTime(seconds: number): string {
    if (isNaN(seconds) || seconds < 0) return '0:00';
    const minutes = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  }

  // --- FUNCIONES DE CONTROL (Simuladas) ---
  
  function togglePlayPause() {
    if (!songData) return; // No hacer nada si no hay canción
    isPlaying = !isPlaying;
    if (isPlaying){
      YTMusicApi.play()
    } else {
      YTMusicApi.pause()
    }
    // Aquí iría la lógica para comunicarte con tu servicio de música (ej. `fetch('/api/player/toggle')`)
  }
  
  function playNext() {
      if (!songData) return;
    // Lógica para la siguiente canción
    console.log("Siguiente canción");
    nextOrprevious(1)
  }

  function playPrevious() {
      if (!songData) return;
    // Lógica para la canción anterior
    console.log("Canción anterior");
    nextOrprevious(-1)
  }
    // Variable para rastrear el estado de silencio (mute)
    let isMuted = false;
    // Propiedad para habilitar o deshabilitar el control, similar a tu 'songData'

    // Función para cambiar el estado de silencio
    function toggleMute() {
        if (songData) {
            isMuted = !isMuted;
            YTMusicApi.toggleMute();
            // Aquí añadirías la lógica para silenciar o anular el silencio del audio.
            // Por ejemplo: audioElement.muted = isMuted;
        }
    }
        /**
     * Establece el volumen basado en la posición del clic en la barra.
     * @param {MouseEvent} event
     */
        // El volumen actual, de 0 (silencio) a 1 (máximo).

    async function setFavorite() {
        const result = YTMusicApi.likeSong();
        return result
    }
</script>
<!-- 
  ESTRUCTURA HTML DEL REPRODUCTOR
  - El contenedor principal siempre está visible.
  - Se usan clases condicionales (`opacity-50`, `cursor-not-allowed`) para deshabilitar visualmente los controles cuando `songData` es `null`.
  - La información de la canción se muestra dinámicamente o se presenta un texto predeterminado.
-->
<div class="fixed bottom-0 left-0 right-0 bg-gray-900 text-white border-t border-gray-800 px-2 md:px-4 py-2 md:py-3 z-50">
  <div class="flex items-center justify-between">
    <!-- Song Info -->
    <div class="flex items-center space-x-2 md:space-x-3 min-w-0 flex-1">
      <div class="w-10 h-10 md:w-12 md:h-12 bg-gray-700 rounded-lg flex-shrink-0 flex items-center justify-center overflow-hidden">
        {#if songData}
          <img src={songData.imageSrc} alt={`Carátula de ${songData.album}`} class="w-full h-full object-cover"/>
        {:else}
          <svg class="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3"></path>
          </svg>
        {/if}
      </div>
      <div class="min-w-0 flex-1 hidden sm:block">
        <p class="text-xs md:text-sm font-medium truncate">{songData?.title || 'Selecciona una canción'}</p>
        <p class="text-xs text-gray-400 truncate">{songData?.artist || 'Artista'}</p>
      </div>
      <button class="hidden md:block p-1 rounded-full hover:bg-gray-800 transition-colors" on:click={setFavorite} disabled={!songData}  aria-label="Add to favorites">
        <svg class="w-5 h-5 text-gray-400" class:opacity-50={!songData} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path>
        </svg>
      </button>
    </div>
    
    <!-- Player Controls -->
    <div class="flex flex-col items-center space-y-1 md:space-y-2 flex-1 max-w-md">
      <div class="flex items-center space-x-2 md:space-x-4">
        <!-- Previous -->
        <button on:click={playPrevious} class="p-1 rounded-full hover:bg-gray-800 transition-colors" disabled={!songData}  aria-label="Add to favorites">
          <svg class="w-5 h-5 md:w-6 md:h-6" class:opacity-50={!songData} fill="currentColor" viewBox="0 0 24 24">
            <path d="M6 6h2v12H6zm3.5 6l8.5 6V6z"/>
          </svg>
        </button>
        
        <!-- Play/Pause -->
        <button on:click={togglePlayPause} class="p-1.5 md:p-2 rounded-full bg-white text-gray-900 hover:scale-105 transition-transform" disabled={!songData} class:cursor-not-allowed={!songData} class:opacity-50={!songData}>
          <svg class="w-5 h-5 md:w-6 md:h-6" fill="currentColor" viewBox="0 0 24 24">
            {#if isPlaying}
              <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/>
            {:else}
              <path d="M8 5v14l11-7z"/>
            {/if}
          </svg>
        </button>
        
        <!-- Next -->
        <button on:click={playNext} class="p-1 rounded-full hover:bg-gray-800 transition-colors" disabled={!songData}  aria-label="Add to favorites">
          <svg class="w-5 h-5 md:w-6 md:h-6" class:opacity-50={!songData} fill="currentColor" viewBox="0 0 24 24">
            <path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z"/>
          </svg>
        </button>
      </div>
      
      <!-- Progress Bar -->
      <div class="hidden md:flex items-center space-x-2 w-full">
        <span class="text-xs text-gray-400 w-10 text-right">{formatTime(elapsedSeconds)}</span>
        <div class="flex-1 h-1 bg-gray-700 rounded-full">
          <div class="h-1 bg-white rounded-full" style="width: {progressPercentage}%"></div>
        </div>
        <span class="text-xs text-gray-400 w-10">{formatTime(songData?.songDuration || 0)}</span>
      </div>
    </div>
    
    <!-- Volume and Options (simplificado para el ejemplo) -->


<div class="flex items-center space-x-1 md:space-x-2 flex-1 justify-end">
    <div class="flex items-center space-x-2">
        <!-- Botón para silenciar/anular el silencio -->
        <button
            class="p-1 rounded-full hover:bg-gray-800 transition-colors"
            disabled={!songData}
            on:click={toggleMute}
            aria-label={isMuted ? 'Unmute' : 'Mute'}>
            
            {#if isMuted}
                <!-- Icono de Silencio (Muted) -->
                <svg class="w-5 h-5" class:opacity-50={!songData} fill="currentColor" viewBox="0 0 24 24">
                    <path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z"/>
                </svg>
            {:else}
                <!-- Icono de Volumen (Sonido) -->
                <svg class="w-5 h-5" class:opacity-50={!songData} fill="currentColor" viewBox="0 0 24 24">
                    <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/>
                </svg>
            {/if}
        </button>

        <!-- Barra de volumen (sin cambios) -->
        <input
            type="range"
            min="0"
            max="100"
            bind:value={volumeLevel}
            disabled={!songData}
            on:change={()=> YTMusicApi.setVolume(volumeLevel)}
            class="w-16 lg:w-20 h-1 bg-gray-700 rounded-full appearance-none cursor-pointer"
            class:opacity-50={!songData}
            aria-label="Volume slider"
        />
    </div>
</div>
  </div>
</div>