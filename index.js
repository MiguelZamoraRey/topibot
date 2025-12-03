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
  PALABRA_ACTIVACION,
  TIEMPO_ESCUCHA_ACTIVA
} from "./comandos.js";

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
  console.log("🟢 Sistema activado - Escuchando comando...");
  
  // Desactivar después del tiempo configurado
  if (timeoutEscucha) {
    clearTimeout(timeoutEscucha);
  }
  
  timeoutEscucha = setTimeout(() => {
    sistemaActivo = false;
    console.log("⏸️  Sistema en espera - Di '%s' para activar", PALABRA_ACTIVACION);
  }, TIEMPO_ESCUCHA_ACTIVA);
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
    // Desactivar el sistema después de ejecutar el comando
    sistemaActivo = false;
    console.log("⏸️  Sistema en espera - Di '%s' para activar", PALABRA_ACTIVACION);
  }
}

/**
 * Bucle principal del bot
 */
async function mainLoop() {
  console.log("╔══════════════════════════════════════════╗");
  console.log("║        🤖 TOPIBOT INICIADO 🤖           ║");
  console.log("╚══════════════════════════════════════════╝\n");
  
  console.log("📡 Conectando al servidor STT...");
  console.log("🎤 Palabra de activación: '%s'\n", PALABRA_ACTIVACION);
  
  mostrarComandosDisponibles();
  
  console.log("\n⏸️  Sistema en espera - Di '%s' para activar\n", PALABRA_ACTIVACION);
  
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
