/**
 * Archivo de acciones/funciones del sistema
 * 
 * Aquí defines todas las funciones que se pueden ejecutar mediante comandos de voz.
 * Cada función debe ser autocontenida y realizar una acción específica.
 */

// ========================================
// ESTADO GLOBAL
// ========================================

let ledState = false;

// ========================================
// FUNCIONES DE LED
// ========================================

/**
 * Enciende el LED
 */
export function encenderLED() {
  ledState = true;
  console.log("💡 LED encendido");
}

/**
 * Apaga el LED
 */
export function apagarLED() {
  ledState = false;
  console.log("🌑 LED apagado");
}

/**
 * Muestra el estado actual del LED
 */
export function obtenerEstadoLED() {
  console.log(`ℹ️  Estado del LED: ${ledState ? "Encendido" : "Apagado"}`);
}

/**
 * Alterna el estado del LED (toggle)
 */
export function toggleLED() {
  ledState = !ledState;
  console.log(`🔄 LED ${ledState ? "encendido" : "apagado"}`);
}

// ========================================
// FUNCIONES DE INFORMACIÓN
// ========================================

/**
 * Saluda al usuario
 */
export function saludar() {
  console.log("👋 ¡Hola! Sistema de voz activo");
}

/**
 * Muestra la hora actual
 */
export function decirHora() {
  const ahora = new Date();
  const hora = ahora.toLocaleTimeString('es-ES');
  console.log(`🕐 La hora es: ${hora}`);
}

/**
 * Muestra la fecha actual
 */
export function decirFecha() {
  const ahora = new Date();
  const fecha = ahora.toLocaleDateString('es-ES', { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });
  console.log(`📅 Hoy es: ${fecha}`);
}

// ========================================
// FUNCIONES DE SISTEMA
// ========================================

/**
 * Muestra información del sistema
 */
export function infoSistema() {
  console.log("ℹ️  Sistema operativo:", process.platform);
  console.log("ℹ️  Node.js versión:", process.version);
  console.log("ℹ️  Memoria usada:", Math.round(process.memoryUsage().heapUsed / 1024 / 1024), "MB");
}

/**
 * Reinicia el estado de la aplicación
 */
export function reiniciarSistema() {
  ledState = false;
  console.log("🔄 Sistema reiniciado - LED apagado");
}

// ========================================
// EJEMPLO: FUNCIONES PARA EXTENDER
// ========================================

/**
 * Ejemplo: Activar modo nocturno
 */
export function modoNocturno() {
  console.log("🌙 Modo nocturno activado");
  // Aquí puedes añadir lógica adicional
}

/**
 * Ejemplo: Activar alarma
 */
export function activarAlarma() {
  console.log("🚨 ¡Alarma activada!");
  // Aquí puedes añadir lógica de alarma
}

/**
 * Ejemplo: Reproducir música
 */
export function reproducirMusica() {
  console.log("🎵 Reproduciendo música...");
  // Aquí puedes integrar con un reproductor
}

/**
 * Ejemplo: Detener música
 */
export function detenerMusica() {
  console.log("⏹️  Música detenida");
}

/**
 * Ejemplo: Control de temperatura
 */
export function leerTemperatura() {
  // En Raspberry Pi podrías leer de un sensor real
  const temperaturaSimulada = (20 + Math.random() * 10).toFixed(1);
  console.log(`🌡️  Temperatura: ${temperaturaSimulada}°C`);
}
