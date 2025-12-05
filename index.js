/**
 * TopiBot - Sistema de reconocimiento de voz usando servidor STT Python/Vosk
 * 
 * Este script se conecta al servidor Python (stt_server.py) para obtener
 * el reconocimiento de voz y ejecuta los comandos configurados
 */

import axios from "axios";
import { 
  procesarComando, 
  mostrarComandosDisponibles,
  PALABRAS_ACTIVACION,
  TIEMPO_ESCUCHA_ACTIVA,
  TIEMPO_ESCUCHA_MENSAJE
} from "./comandos.js";
import { obtenerEstadoMensaje } from "./acciones.js";

// Configuración
const STT_SERVER_URL = "http://localhost:5005/listen";

// Estado del sistema de activación
let sistemaActivo = false;
let timeoutEscucha = null;

/**
 * Función para escuchar y obtener texto del servidor STT
 * @returns {Promise<string>} Texto reconocido
 */
async function listenSTT() {
  try {
    const result = await axios.get(STT_SERVER_URL, {
      timeout: 30000 // 30 segundos timeout para Raspberry Pi
    });
    return result.data.text || "";
  } catch (e) {
    // Si es timeout o error de conexión, no mostrar error (es normal)
    if (e.code === 'ECONNREFUSED') {
      console.error("❌ Error: Servidor STT no está ejecutándose en puerto 5005");
      console.log("💡 Inicia el servidor: python3 stt_server.py");
      process.exit(1);
    } else if (e.code !== 'ECONNABORTED') {
      console.error("❌ Error STT:", e.message);
    }
    return "";
  }
}

/**
 * Activa el sistema de escucha de comandos
 */
function activarSistema() {
  sistemaActivo = true;
  const estadoMensaje = obtenerEstadoMensaje();
  
  // Usar tiempo extendido si está en modo mensaje
  const tiempoEscucha = estadoMensaje.activo ? TIEMPO_ESCUCHA_MENSAJE : TIEMPO_ESCUCHA_ACTIVA;
  const segundos = tiempoEscucha / 1000;
  
  if (estadoMensaje.activo) {
    console.log(`🟢 Modo mensaje activo - Escuchando durante ${segundos} segundos...`);
  } else {
    console.log("🟢 Sistema activado - Escuchando comando...");
  }
  
  // Desactivar después del tiempo configurado
  if (timeoutEscucha) {
    clearTimeout(timeoutEscucha);
  }
  
  timeoutEscucha = setTimeout(() => {
    sistemaActivo = false;
    const estadoMensajeFinal = obtenerEstadoMensaje();
    
    if (estadoMensajeFinal.activo) {
      console.log("⏱️  Tiempo agotado para mensaje - Modo mensaje cancelado");
    }
    
    console.log("⏸️  Sistema en espera - Di alguna palabra de activación para empezar");
  }, tiempoEscucha);
}

/**
 * Procesa el texto reconocido
 * @param {string} text - Texto reconocido por el STT
 */
function handleCommand(text) {
  if (!text) return;
  
  const textoLimpio = text.toLowerCase().trim();
  
  // Procesar el comando usando la función de comandos.js
  const resultado = procesarComando(textoLimpio, sistemaActivo);
  
  // Si se detectó la palabra de activación
  if (resultado.activacion) {
    activarSistema();
    return;
  }
  
  // Si se ejecutó un comando
  if (resultado.ejecutado) {
    console.log("✅ Comando ejecutado");
    
    // Si no está en modo mensaje, desactivar el sistema
    const estadoMensaje = obtenerEstadoMensaje();
    if (!estadoMensaje.activo) {
      sistemaActivo = false;
      console.log("⏸️  Sistema en espera - Di alguna palabra de activación para empezar");
    } else {
      // En modo mensaje, reactivar para dar más tiempo
      activarSistema();
    }
  }
}

/**
 * Bucle principal del bot
 */
async function mainLoop() {
  console.log("╔══════════════════════════════════════════╗");
  console.log("║       🤖 TOPIBOT INICIADO 🤖            ║");
  console.log("╚══════════════════════════════════════════╝\n");
  
  console.log("📡 Conectando al servidor STT...");
  console.log("🎤 Palabras de activación: %s\n", PALABRAS_ACTIVACION.join(", "));
  
  mostrarComandosDisponibles();
  
  console.log("\n⏸️  Sistema en espera - Di alguna palabra de activación para empezar\n");
  
  while (true) {
    const text = await listenSTT();
    if (text) {
      console.log("👂 Escuchado:", text);
      handleCommand(text);
    }
  }
}

// Iniciar el bot
mainLoop().catch(err => {
  console.error("💥 Error fatal:", err);
  process.exit(1);
});
