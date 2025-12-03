/**
 * Archivo de configuración de comandos de voz
 * 
 * Este archivo mapea palabras clave con las acciones definidas en acciones.js
 * 
 * Cada comando tiene:
 * - keywords: array de palabras clave que activan el comando
 * - action: función importada de acciones.js que se ejecuta
 * - description: descripción del comando para el usuario
 * 
 * Para añadir un nuevo comando:
 * 1. Crea la función en acciones.js
 * 2. Impórtala aquí
 * 3. Añade un nuevo objeto al array 'comandos' con las keywords y la action
 */

// ========================================
// PALABRA DE ACTIVACIÓN (WAKE WORD)
// ========================================

/**
 * Palabra clave que debe decirse antes de cualquier comando
 * El sistema solo escuchará comandos después de detectar esta palabra
 */
export const PALABRA_ACTIVACION = "computadora";

/**
 * Tiempo en milisegundos que el sistema permanece activo después de escuchar la palabra de activación
 * Después de este tiempo, vuelve al modo espera
 */
export const TIEMPO_ESCUCHA_ACTIVA = 5000; // 5 segundos

import {
  // Funciones de LED
  encenderLED,
  apagarLED,
  obtenerEstadoLED,
  toggleLED,
  
  // Funciones de buzzer
  sonidoActivacion,
  sonidoConfirmacion,
  sonidoError,
  
  // Funciones de mensajería
  activarModoMensaje,
  establecerDestinatario,
  capturarMensaje,
  cancelarMensaje,
  obtenerEstadoMensaje,
  
  // Funciones de información
  saludar,
  decirHora,
  decirFecha,
  
  // Funciones de sistema
  infoSistema,
  reiniciarSistema,
  
  // Funciones adicionales (ejemplos comentados)
  // modoNocturno,
  // activarAlarma,
  // reproducirMusica,
  // detenerMusica,
  // leerTemperatura,
} from "./acciones.js";

/**
 * Lista de comandos disponibles
 * Para añadir nuevos comandos, simplemente añade un nuevo objeto al array
 */
export const comandos = [
  // ========================================
  // COMANDOS DE LED
  // ========================================
  {
    keywords: ["encender", "enciende", "prende", "prender"],
    action: encenderLED,
    description: "Enciende el LED"
  },
  {
    keywords: ["apagar", "apaga"],
    action: apagarLED,
    description: "Apaga el LED"
  },
  {
    keywords: ["estado", "cómo está", "como esta"],
    action: obtenerEstadoLED,
    description: "Muestra el estado actual del LED"
  },
  {
    keywords: ["alternar", "cambiar", "toggle"],
    action: toggleLED,
    description: "Alterna el estado del LED"
  },
  
  // ========================================
  // COMANDOS DE MENSAJERÍA
  // ========================================
  {
    keywords: ["mensaje", "enviar mensaje", "mandar mensaje"],
    action: activarModoMensaje,
    description: "Activa el modo para enviar mensajes"
  },
  {
    keywords: ["cancelar", "cancelar mensaje"],
    action: cancelarMensaje,
    description: "Cancela el envío de mensaje"
  },
  
  // ========================================
  // COMANDOS DE INFORMACIÓN
  // ========================================
  {
    keywords: ["hola", "buenos días", "buenas tardes", "buenas noches"],
    action: saludar,
    description: "Saluda al usuario"
  },
  {
    keywords: ["hora", "qué hora es", "que hora es"],
    action: decirHora,
    description: "Dice la hora actual"
  },
  {
    keywords: ["fecha", "qué día es", "que dia es"],
    action: decirFecha,
    description: "Dice la fecha actual"
  },
  
  // ========================================
  // COMANDOS DE SISTEMA
  // ========================================
  {
    keywords: ["información", "informacion", "sistema"],
    action: infoSistema,
    description: "Muestra información del sistema"
  },
  {
    keywords: ["reiniciar", "reset"],
    action: reiniciarSistema,
    description: "Reinicia el estado del sistema"
  },
  
  // ========================================
  // COMANDOS ADICIONALES (EJEMPLOS)
  // ========================================
  // Descomenta estos cuando implementes las funciones
  /*
  {
    keywords: ["modo nocturno", "noche"],
    action: modoNocturno,
    description: "Activa el modo nocturno"
  },
  {
    keywords: ["alarma", "activar alarma"],
    action: activarAlarma,
    description: "Activa la alarma"
  },
  {
    keywords: ["música", "musica", "reproducir"],
    action: reproducirMusica,
    description: "Reproduce música"
  },
  {
    keywords: ["detener", "parar", "stop"],
    action: detenerMusica,
    description: "Detiene la música"
  },
  {
    keywords: ["temperatura", "cuántos grados", "cuantos grados"],
    action: leerTemperatura,
    description: "Lee la temperatura actual"
  },
  */
];

/**
 * Procesa el texto reconocido y ejecuta el comando correspondiente
 * @param {string} texto - Texto reconocido por el sistema de voz
 * @param {boolean} sistemaActivo - Si el sistema está en modo escucha activa
 * @returns {Object} - { ejecutado: boolean, activacion: boolean }
 */
export function procesarComando(texto, sistemaActivo = false) {
  const textoLower = texto.toLowerCase().trim();
  
  // Verificar si se dijo la palabra de activación
  if (textoLower.includes(PALABRA_ACTIVACION)) {
    console.log("🎯 ¡Palabra de activación detectada! Sistema activo...");
    sonidoActivacion(); // 🔊 Beep de feedback
    return { ejecutado: false, activacion: true };
  }
  
  // Si el sistema no está activo, ignorar comandos
  if (!sistemaActivo) {
    return { ejecutado: false, activacion: false };
  }
  
  // ========================================
  // MANEJO ESPECIAL: SISTEMA DE MENSAJES MULTI-PASO
  // ========================================
  const estadoMensaje = obtenerEstadoMensaje();
  
  if (estadoMensaje.activo) {
    // Si el modo mensaje está activo, determinar el paso
    if (!estadoMensaje.destinatario) {
      // Paso 1: Establecer destinatario
      const destinatarioEstablecido = establecerDestinatario(texto);
      return { ejecutado: destinatarioEstablecido, activacion: false };
    } else {
      // Paso 2: Capturar mensaje
      capturarMensaje(texto);
      return { ejecutado: true, activacion: false };
    }
  }
  
  // ========================================
  // COMANDOS NORMALES
  // ========================================
  
  // Buscar si algún comando coincide
  for (const comando of comandos) {
    for (const keyword of comando.keywords) {
      if (textoLower.includes(keyword)) {
        comando.action();
        return { ejecutado: true, activacion: false };
      }
    }
  }
  
  // Si llegamos aquí, el sistema estaba activo pero no se reconoció ningún comando
  console.log("⚠️  Comando no reconocido");
  return { ejecutado: false, activacion: false };
}

/**
 * Muestra todos los comandos disponibles en la consola
 */
export function mostrarComandosDisponibles() {
  console.log("\n📋 Comandos disponibles:");
  console.log(`   ⚡ Palabra de activación: "${PALABRA_ACTIVACION.toUpperCase()}"`);
  console.log(`   ⏱️  Tiempo de escucha activa: ${TIEMPO_ESCUCHA_ACTIVA / 1000} segundos\n`);
  comandos.forEach((comando, index) => {
    console.log(`   ${index + 1}. ${comando.description}`);
    console.log(`      Palabras clave: ${comando.keywords.join(", ")}`);
  });
  console.log("");
}
