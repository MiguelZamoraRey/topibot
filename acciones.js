/**
 * Archivo de acciones/funciones del sistema
 * 
 * Aquí defines todas las funciones que se pueden ejecutar mediante comandos de voz.
 * Cada función debe ser autocontenida y realizar una acción específica.
 */

import { execSync, spawn } from 'child_process';
import { existsSync } from 'fs';

// ========================================
// CONFIGURACIÓN GPIO
// ========================================

const LED_PIN = 17; // GPIO 17 (Pin físico 11)
const GPIO_CHIP = 'gpiochip0'; // Chip GPIO en Raspberry Pi
let gpioAvailable = false;
let gpioProcess = null; // Proceso activo de gpioset

// Verificar si gpiod está disponible
try {
  execSync('which gpioset', { stdio: 'ignore' });
  execSync('which gpioget', { stdio: 'ignore' });
  // Verificar que el chip GPIO existe
  if (existsSync('/dev/gpiochip0')) {
    gpioAvailable = true;
    console.log('✅ GPIO inicializado - LED en GPIO 17 (usando gpiod)');
  }
} catch (err) {
  console.log('⚠️  GPIO no disponible - Modo simulación');
  console.log('   💡 Instala gpiod con: sudo apt install gpiod');
}

// ========================================
// ESTADO GLOBAL
// ========================================

let ledState = false;

// ========================================
// FUNCIONES DE LED
// ========================================

/**
 * Establece el estado del GPIO
 */
function setGpioState(value) {
  // Matar proceso anterior si existe
  if (gpioProcess) {
    gpioProcess.kill();
    gpioProcess = null;
  }
  
  // Iniciar nuevo proceso en background
  gpioProcess = spawn('gpioset', ['-c', GPIO_CHIP, `${LED_PIN}=${value}`], {
    detached: false,
    stdio: 'ignore'
  });
  
  gpioProcess.on('error', (err) => {
    console.log('⚠️  Error en proceso GPIO:', err.message);
  });
}

/**
 * Enciende el LED
 */
export function encenderLED() {
  ledState = true;
  if (gpioAvailable) {
    try {
      setGpioState(1);
    } catch (err) {
      console.log('⚠️  Error al encender LED:', err.message);
    }
  }
  console.log("💡 LED encendido");
}

/**
 * Apaga el LED
 */
export function apagarLED() {
  ledState = false;
  if (gpioAvailable) {
    try {
      setGpioState(0);
    } catch (err) {
      console.log('⚠️  Error al apagar LED:', err.message);
    }
  }
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
  if (gpioAvailable) {
    try {
      setGpioState(ledState ? 1 : 0);
    } catch (err) {
      console.log('⚠️  Error al cambiar LED:', err.message);
    }
  }
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

// ========================================
// LIMPIEZA AL SALIR
// ========================================

/**
 * Limpia los recursos GPIO al cerrar la aplicación
 */
export function cleanup() {
  if (gpioProcess) {
    gpioProcess.kill();
    gpioProcess = null;
    console.log('🧹 GPIO limpiado - LED apagado');
  }
}

// Manejar cierre de aplicación
process.on('SIGINT', () => {
  cleanup();
  process.exit();
});
