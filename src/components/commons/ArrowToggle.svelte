<script>
  export let value;      // true = maximizado / false = minimizado
  export let onToggle;   // función que se ejecuta al hacer click

  $: ariaLabel = value ? 'Minimizar sección' : 'Maximizar sección';
</script>

<button
  type="button"
  aria-pressed={value}
  aria-label={ariaLabel}
  title={ariaLabel}
  on:click={onToggle}
  class="p-2 rounded-full focus:outline-none transition-all"
>
  {#if value}
    <svg class="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
      <path d="M11.47 7.72a.75.75 0 011.06 0l7.5 7.5a.75.75 0 11-1.06 1.06L12 9.31l-6.97 6.97a.75.75 0 01-1.06-1.06l7.5-7.5z"/>
    </svg>
  {:else}
    <svg class="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12.53 16.28a.75.75 0 01-1.06 0l-7.5-7.5a.75.75 0 011.06-1.06L12 14.69l6.97-6.97a.75.75 0 111.06 1.06l-7.5 7.5z"/>
    </svg>
  {/if}
</button>