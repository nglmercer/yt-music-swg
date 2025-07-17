<script lang="ts">
  import { onMount } from "svelte";
  import { emitter } from "@utils/Emitter";

  export let name: string;   // Para distinguir varios modales
  let visible = false;

  const open  = () => (visible = true);
  const close = () => (visible = false);

  onMount(() => {
    const handleToggle = (toggle: boolean) => {
      console.log("toggle",toggle);
      (visible = !!toggle)
    };

    // Ascoltiamo gli eventi che useremo come "signals"
    emitter.on(`open:${name}`,  open);
    emitter.on(`close:${name}`, close);
    emitter.on(`toggle:${name}`, handleToggle);

    return () => {
      // Puliamo TUTTI i listeners al smontaggio
      emitter.off(`open:${name}`,  open);
      emitter.off(`close:${name}`, close);
      emitter.off(`toggle:${name}`, handleToggle);
    };
  });
</script>

{#if visible}
  <button
    type="button"
    aria-label="Close modal"
    class="fixed inset-0 z-40 flex items-center justify-center bg-black/60"
    on:click={close}
    on:keydown={(e) => {
      if (['Enter', 'Space', 'Escape'].includes(e.code)) {
        e.preventDefault();
        close();
      }
    }}
  >
    <!-- 2. Dialog panel – stopPropagation prevents click bubbling to the button -->
    <section
    class="relative z-50  p-8 rounded-lg shadow-xl"
    role="dialog"
    tabindex="0"
    aria-modal="true"
    on:click|stopPropagation
    on:keydown|stopPropagation
    >
    <slot />
    </section>
  </button>
{/if}

<style>
  .overlay {
    position: fixed;
    inset: 0;
    background: rgba(0,0,0,.6);
    display: grid;
    place-items: center;
  }
  .modal {
    background: white;
    padding: 2rem;
    border-radius: 8px;
    position: relative;
  }
  .close {
    position: absolute;
    top: .5rem;
    right: .75rem;
    background: none;
    border: none;
    font-size: 1.5rem;
    cursor: pointer;
  }
</style>