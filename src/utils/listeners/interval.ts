function createSmartInterval(callback: () => void) {
    let active = true;
    let lastInteraction = Date.now();
    let currentInterval: NodeJS.Timeout;
  
    const ACTIVE_INTERVAL = 1000;      // 1s si hay interacción
    const INACTIVE_INTERVAL = 10000;   // 10s si no hay interacción
    const INACTIVITY_TIMEOUT = 15000;  // Tiempo sin eventos para volverse inactivo
  
    const resetInteraction = () => {
      lastInteraction = Date.now();
      if (!active) {
        active = true;
        restartInterval();
      }
    };
  
    const checkInactivity = () => {
      if (Date.now() - lastInteraction > INACTIVITY_TIMEOUT && active) {
        active = false;
        restartInterval();
      }
    };
  
    const restartInterval = () => {
      clearInterval(currentInterval);
      const delay = active ? ACTIVE_INTERVAL : INACTIVE_INTERVAL;
      currentInterval = setInterval(() => {
        callback();
        checkInactivity();
      }, delay);
    };
  
    // Detectar interacción del usuario
    if (typeof window !== 'undefined') {
        console.error("no se puede ejecutar en el servidor (client:only)")
    }
    ['mousemove', 'keydown', 'scroll', 'click'].forEach(event => {
      window.addEventListener(event, resetInteraction);
    });
  
    restartInterval(); // Iniciar la primera vez
  }
export {
    createSmartInterval
}