/**
 * Archivo de acciones/funciones del sistema
 * 
 * Aquí defines todas las funciones que se pueden ejecutar mediante comandos de voz.
 * Cada función debe ser autocontenida y realizar una acción específica.
 */

import { execSync } from 'child_process';
import { existsSync } from 'fs';
import https from 'https';

// ========================================
// CONFIGURACIÓN GPIO
// ========================================

const LED_PIN = 17; // GPIO 17 (Pin físico 11)
const BUZZER_PIN = 22; // GPIO 22 (Pin físico 15)
const BUZZER_FREQUENCY = 2000; // 2000Hz para buzzer pasivo
const GPIO_CHIP = 'gpiochip0'; // Chip GPIO en Raspberry Pi
const DISCORD_WEBHOOK = 'https://discord.com/api/webhooks/1446504694204858491/_0D3_B1bM8Od5K0-Hke30Owcx7jEDF9Vh3Zjhb4J5Hx5cuS25V3TRr9oCIWQIYSqk66R';
let gpioAvailable = false;
let pigpioAvailable = false;

// Verificar si gpiod está disponible
try {
  execSync('which gpioset', { stdio: 'ignore' });
  execSync('which gpioget', { stdio: 'ignore' });
  // Verificar que el chip GPIO existe
  if (existsSync('/dev/gpiochip0')) {
    gpioAvailable = true;
    
    // Verificar si pigpiod daemon está disponible para PWM
    try {
      execSync('which pigs', { stdio: 'ignore' });
      execSync('pigs t 2>/dev/null', { stdio: 'ignore' }); // Test connection to daemon
      pigpioAvailable = true;
      console.log('✅ GPIO inicializado - LED en GPIO 17, Buzzer PWM en GPIO 22');
    } catch (err) {
      console.log('✅ GPIO inicializado - LED en GPIO 17, Buzzer simple en GPIO 22');
      console.log('   💡 Para buzzer pasivo: sudo systemctl start pigpiod');
    }
  }
} catch (err) {
  console.log('⚠️  GPIO no disponible - Modo simulación');
  console.log('   💡 Instala gpiod con: sudo apt install gpiod');
}

// ========================================
// ESTADO GLOBAL
// ========================================

let ledState = false;

// Estado para sistema de mensajes Discord
let mensajeState = {
  activo: false
};

// ========================================
// FUNCIONES DE MENSAJERÍA
// ========================================

/**
 * Activa el modo mensaje para Discord
 */
export function activarModoMensaje() {
  mensajeState.activo = true;
  sonidoConfirmacion(); // 🔊 Beep de confirmación
  console.log("📨 Modo mensaje ACTIVADO");
  console.log("💬 Di tu mensaje para Discord...");
}

/**
 * Envía mensaje directo a Discord
 * @param {string} texto - El mensaje a enviar
 */
export function enviarMensajeDiscord(texto) {
  if (!mensajeState.activo) {
    console.log("⚠️  Primero activa el modo mensaje diciendo: 'mensaje'");
    return;
  }
  
  const mensaje = texto.trim();
  const mensajeCompleto = `Topibot dice: ${mensaje}`;
  
  console.log("\n╔════════════════════════════════════════╗");
  console.log("║       📨 ENVIANDO A DISCORD 📨        ║");
  console.log("╚════════════════════════════════════════╝");
  console.log(`💬 Mensaje: "${mensajeCompleto}"`);
  console.log("════════════════════════════════════════");
  
  // Preparar el payload para Discord
  const payload = JSON.stringify({
    content: mensajeCompleto,
    username: "TopiBot"
  });
  
  // Parsear la URL del webhook
  const webhookUrl = new URL(DISCORD_WEBHOOK);
  
  const options = {
    hostname: webhookUrl.hostname,
    path: webhookUrl.pathname,
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(payload)
    }
  };
  
  const req = https.request(options, (res) => {
    if (res.statusCode === 204 || res.statusCode === 200) {
      console.log("✅ Mensaje enviado a Discord correctamente");
      sonidoActivacion(); // Beep de confirmación
    } else {
      console.log(`⚠️  Discord respondió con código: ${res.statusCode}`);
    }
    
    // Resetear estado
    mensajeState.activo = false;
  });
  
  req.on('error', (error) => {
    console.error("❌ Error al enviar mensaje a Discord:", error.message);
    sonidoError();
    
    // Resetear estado
    mensajeState.activo = false;
  });
  
  req.write(payload);
  req.end();
}

/**
 * Cancela el modo mensaje
 */
export function cancelarMensaje() {
  mensajeState.activo = false;
  sonidoError(); // 🔊 Beep de cancelación
  console.log("❌ Modo mensaje CANCELADO");
}

/**
 * Obtiene el estado actual del sistema de mensajes
 */
export function obtenerEstadoMensaje() {
  return { ...mensajeState };
}

// ========================================
// FUNCIONES DE LED
// ========================================

/**
 * Enciende el LED
 */
export function encenderLED() {
  ledState = true;
  if (gpioAvailable) {
    try {
      // Matar procesos gpioset anteriores
      execSync('pkill -9 gpioset 2>/dev/null || true');
      // Establecer nuevo estado en background
      execSync(`nohup gpioset -c ${GPIO_CHIP} ${LED_PIN}=1 > /dev/null 2>&1 &`);
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
      // Matar procesos gpioset anteriores
      execSync('pkill -9 gpioset 2>/dev/null || true');
      // Establecer nuevo estado en background
      execSync(`nohup gpioset -c ${GPIO_CHIP} ${LED_PIN}=0 > /dev/null 2>&1 &`);
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
      // Matar procesos anteriores
      execSync('pkill -9 gpioset 2>/dev/null || true');
      // Establecer nuevo estado en background
      execSync(`nohup gpioset -c ${GPIO_CHIP} ${LED_PIN}=${ledState ? 1 : 0} > /dev/null 2>&1 &`);
    } catch (err) {
      console.log('⚠️  Error al cambiar LED:', err.message);
    }
  }
  console.log(`🔄 LED ${ledState ? "encendido" : "apagado"}`);
}

// ========================================
// FUNCIONES DE BUZZER
// ========================================

/**
 * Emite un beep con PWM o método simple según disponibilidad
 * @param {number} duracion - Duración del beep en milisegundos
 */
function beep(duracion = 100) {
  if (!gpioAvailable) return;
  
  try {
    if (pigpioAvailable) {
      // Usar software PWM con daemon pigpiod (comando pigs p)
      execSync(`pigs p ${BUZZER_PIN} 128`, { stdio: 'ignore' });
      setTimeout(() => {
        execSync(`pigs p ${BUZZER_PIN} 0`, { stdio: 'ignore' });
      }, duracion);
    } else {
      // Fallback: método simple para buzzer activo
      const cmd = `(gpioset -c ${GPIO_CHIP} ${BUZZER_PIN}=1 && sleep ${duracion / 1000} && gpioset -c ${GPIO_CHIP} ${BUZZER_PIN}=0) &`;
      execSync(cmd);
    }
  } catch (err) {
    console.log('⚠️  Error en buzzer:', err.message);
  }
}

/**
 * Sonido de activación - Beep doble
 */
export function sonidoActivacion() {
  if (!gpioAvailable) {
    console.log("🔊 [Simulación] Beep-beep de activación");
    return;
  }
  
  try {
    console.log("🔊 Beep de activación");
    
    if (pigpioAvailable) {
      // Beep corto + pausa + beep largo con software PWM usando daemon pigpiod
      const cmd = `(pigs p ${BUZZER_PIN} 128 && sleep 0.08 && pigs p ${BUZZER_PIN} 0 && sleep 0.05 && pigs p ${BUZZER_PIN} 128 && sleep 0.15 && pigs p ${BUZZER_PIN} 0) &`;
      execSync(cmd);
    } else {
      // Fallback: método simple
      const cmd = `(gpioset -c ${GPIO_CHIP} ${BUZZER_PIN}=1 && sleep 0.08 && gpioset -c ${GPIO_CHIP} ${BUZZER_PIN}=0 && sleep 0.05 && gpioset -c ${GPIO_CHIP} ${BUZZER_PIN}=1 && sleep 0.15 && gpioset -c ${GPIO_CHIP} ${BUZZER_PIN}=0) &`;
      execSync(cmd);
    }
  } catch (err) {
    console.log('⚠️  Error en sonido de activación:', err.message);
  }
}

/**
 * Sonido de confirmación - Beep simple
 */
export function sonidoConfirmacion() {
  if (!gpioAvailable) {
    console.log("🔊 [Simulación] Beep de confirmación");
    return;
  }
  
  try {
    console.log("🔊 Beep de confirmación");
    beep(100); // Usa la función beep que ya tiene PWM/fallback
  } catch (err) {
    console.log('⚠️  Error en sonido de confirmación:', err.message);
  }
}

/**
 * Sonido de error - Beeps rápidos
 */
export function sonidoError() {
  if (!gpioAvailable) {
    console.log("🔊 [Simulación] Beeps de error");
    return;
  }
  
  try {
    console.log("🔊 Beep de error");
    
    if (pigpioAvailable) {
      // Tres beeps cortos con software PWM usando daemon pigpiod
      const cmd = `(pigs p ${BUZZER_PIN} 128 && sleep 0.05 && pigs p ${BUZZER_PIN} 0 && sleep 0.03 && pigs p ${BUZZER_PIN} 128 && sleep 0.05 && pigs p ${BUZZER_PIN} 0 && sleep 0.03 && pigs p ${BUZZER_PIN} 128 && sleep 0.05 && pigs p ${BUZZER_PIN} 0) &`;
      execSync(cmd);
    } else {
      // Fallback: método simple
      const cmd = `(gpioset -c ${GPIO_CHIP} ${BUZZER_PIN}=1 && sleep 0.05 && gpioset -c ${GPIO_CHIP} ${BUZZER_PIN}=0 && sleep 0.03 && gpioset -c ${GPIO_CHIP} ${BUZZER_PIN}=1 && sleep 0.05 && gpioset -c ${GPIO_CHIP} ${BUZZER_PIN}=0 && sleep 0.03 && gpioset -c ${GPIO_CHIP} ${BUZZER_PIN}=1 && sleep 0.05 && gpioset -c ${GPIO_CHIP} ${BUZZER_PIN}=0) &`;
      execSync(cmd);
    }
  } catch (err) {
    console.log('⚠️  Error en sonido de error:', err.message);
  }
}

/**
 * Canción tonta con el buzzer - Melodía divertida usando PWM
 */
export function cantar() {
  if (!gpioAvailable) {
    console.log("🎵 [Simulación] ♪♫ Cantando una canción tonta ♪♫");
    return;
  }
  
  try {
    console.log("🎵 ♪♫ Cantando... ♪♫");
    
    if (pigpioAvailable) {
      // Melodía usando diferentes duty cycles para simular notas
      // Patrón: do-re-mi-mi / do-re-do-do / sol-sol-fa-mi / re-re-do
      const cmd = `(
        pigs p ${BUZZER_PIN} 100 && sleep 0.25 && pigs p ${BUZZER_PIN} 0 && sleep 0.05 &&
        pigs p ${BUZZER_PIN} 120 && sleep 0.25 && pigs p ${BUZZER_PIN} 0 && sleep 0.05 &&
        pigs p ${BUZZER_PIN} 140 && sleep 0.25 && pigs p ${BUZZER_PIN} 0 && sleep 0.05 &&
        pigs p ${BUZZER_PIN} 140 && sleep 0.25 && pigs p ${BUZZER_PIN} 0 && sleep 0.1 &&
        pigs p ${BUZZER_PIN} 100 && sleep 0.25 && pigs p ${BUZZER_PIN} 0 && sleep 0.05 &&
        pigs p ${BUZZER_PIN} 120 && sleep 0.25 && pigs p ${BUZZER_PIN} 0 && sleep 0.05 &&
        pigs p ${BUZZER_PIN} 100 && sleep 0.25 && pigs p ${BUZZER_PIN} 0 && sleep 0.05 &&
        pigs p ${BUZZER_PIN} 100 && sleep 0.25 && pigs p ${BUZZER_PIN} 0 && sleep 0.1 &&
        pigs p ${BUZZER_PIN} 180 && sleep 0.25 && pigs p ${BUZZER_PIN} 0 && sleep 0.05 &&
        pigs p ${BUZZER_PIN} 180 && sleep 0.25 && pigs p ${BUZZER_PIN} 0 && sleep 0.05 &&
        pigs p ${BUZZER_PIN} 160 && sleep 0.25 && pigs p ${BUZZER_PIN} 0 && sleep 0.05 &&
        pigs p ${BUZZER_PIN} 140 && sleep 0.25 && pigs p ${BUZZER_PIN} 0 && sleep 0.1 &&
        pigs p ${BUZZER_PIN} 120 && sleep 0.25 && pigs p ${BUZZER_PIN} 0 && sleep 0.05 &&
        pigs p ${BUZZER_PIN} 120 && sleep 0.25 && pigs p ${BUZZER_PIN} 0 && sleep 0.05 &&
        pigs p ${BUZZER_PIN} 100 && sleep 0.4 && pigs p ${BUZZER_PIN} 0
      ) &`;
      execSync(cmd);
    } else {
      // Fallback: patrón rítmico simple
      const cmd = `(
        gpioset -c ${GPIO_CHIP} ${BUZZER_PIN}=1 && sleep 0.15 && gpioset -c ${GPIO_CHIP} ${BUZZER_PIN}=0 && sleep 0.05 &&
        gpioset -c ${GPIO_CHIP} ${BUZZER_PIN}=1 && sleep 0.15 && gpioset -c ${GPIO_CHIP} ${BUZZER_PIN}=0 && sleep 0.05 &&
        gpioset -c ${GPIO_CHIP} ${BUZZER_PIN}=1 && sleep 0.15 && gpioset -c ${GPIO_CHIP} ${BUZZER_PIN}=0 && sleep 0.1 &&
        gpioset -c ${GPIO_CHIP} ${BUZZER_PIN}=1 && sleep 0.2 && gpioset -c ${GPIO_CHIP} ${BUZZER_PIN}=0 && sleep 0.1 &&
        gpioset -c ${GPIO_CHIP} ${BUZZER_PIN}=1 && sleep 0.1 && gpioset -c ${GPIO_CHIP} ${BUZZER_PIN}=0 && sleep 0.05 &&
        gpioset -c ${GPIO_CHIP} ${BUZZER_PIN}=1 && sleep 0.1 && gpioset -c ${GPIO_CHIP} ${BUZZER_PIN}=0 && sleep 0.05 &&
        gpioset -c ${GPIO_CHIP} ${BUZZER_PIN}=1 && sleep 0.3 && gpioset -c ${GPIO_CHIP} ${BUZZER_PIN}=0
      ) &`;
      execSync(cmd);
    }
  } catch (err) {
    console.log('⚠️  Error en canción:', err.message);
  }
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
  if (gpioAvailable) {
    try {
      execSync('pkill gpioset 2>/dev/null || true', { shell: true });
      console.log('🧹 GPIO limpiado');
    } catch (err) {
      // Ignorar errores
    }
  }
}

// Manejar cierre de aplicación
process.on('SIGINT', () => {
  cleanup();
  process.exit();
});
