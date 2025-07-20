import LocalStorageManager from "@utils/LocalStorageManager";
import { emitter } from "@utils/Emitter";

interface LocalStorageInput {
  [key: string]: string;
}

interface LocalStorageSwitch {
  [key: string]: boolean;
}

const InputStoreManager = new LocalStorageManager<LocalStorageInput>(
  "InputStoreManager"
);
const SwitchStoreManager = new LocalStorageManager<LocalStorageSwitch>(
  "SwitchStoreManager"
);

function setupLocalStorageInputs() {
  // Seleccionamos todos los elementos con el marcador en la página.
  const inputElements = document.querySelectorAll("[data-local-storage-input]");

  // Si no hay ninguno, no hacemos nada.
  if (inputElements.length === 0) return;

  inputElements.forEach((input) => {
    // Nos aseguramos de que sea un elemento de input HTML
    if (!(input instanceof HTMLInputElement)) return;

    // El 'id' del input se usa como la clave única para localStorage.
    const storageKey = input.id;
    if (!storageKey) {
      console.warn(
        "El input con data-local-storage-input no tiene un id y será ignorado.",
        input
      );
      return;
    }

    // 1. Cargar el valor guardado de localStorage al iniciar.
    const savedValue = InputStoreManager.getItem(storageKey);
    if (savedValue !== null) {
      input.value = savedValue;
    }

    // 2. Guardar el valor en localStorage cada vez que el usuario escribe.
    const handleInput = () => {
      InputStoreManager.set(storageKey, input.value);
      emitter.emit(`ls:input:${storageKey}`, input.value);
    };

    input.addEventListener("input", handleInput);
  });
}

function setupLocalStorageSwitches() {
  const switchElements = document.querySelectorAll(
    "[data-local-storage-switch]"
  );

  if (switchElements.length === 0) return;

  switchElements.forEach((el) => {
    if (!(el instanceof HTMLInputElement)) return;

    const storageKey = el.id;
    if (!storageKey) {
      console.warn(
        "El switch con data-local-storage-switch no tiene un id y será ignorado.",
        el
      );
      return;
    }

    // Cargar el valor guardado de localStorage al iniciar.
    const savedValue = SwitchStoreManager.getItem(storageKey);
    if (savedValue !== null) {
      el.checked = savedValue;
    }

    // Guardar el valor en localStorage cada vez que cambie.
    const handleChange = () => {
      SwitchStoreManager.set(storageKey, el.checked);
      emitter.emit(`ls:switch:${storageKey}`, el.checked);
    };

    el.addEventListener("change", handleChange);
  });
}

function initializeLocalStorageComponents() {
  setupLocalStorageInputs();
  setupLocalStorageSwitches();
}

// Nos aseguramos de ejecutar nuestro script solo cuando el DOM esté completamente cargado.
if (document.readyState === "loading") {
  document.addEventListener(
    "DOMContentLoaded",
    initializeLocalStorageComponents
  );
} else {
  // El DOM ya está cargado, ejecutamos la función directamente.
  initializeLocalStorageComponents();
}
export { InputStoreManager, SwitchStoreManager };