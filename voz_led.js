/**
 * Sistema de reconocimiento de voz con Vosk
 * 
 * Este script captura audio del micrófono en tiempo real y ejecuta comandos
 * de voz configurados en el archivo comandos.js
 */

import path from "path";
import vosk from "vosk";
import mic from "mic";
import { 
  procesarComando, 
  mostrarComandosDisponibles,
  PALABRA_ACTIVACION,
  TIEMPO_ESCUCHA_ACTIVA
} from "./comandos.js";

// Desestructurar Model y Recognizer desde vosk
const { Model, Recognizer } = vosk;

// Configuración del sistema
const CONFIG = {
  modelPath: "./vosk-model-small-es-0.42/vosk-model-small-es-0.42",
  sampleRate: 16000,
  channels: 1,
  exitOnSilence: 6, // Segundos de silencio antes de salir (0 = nunca)
};

// Estado del sistema de activación
let sistemaActivo = false;
let timeoutEscucha = null;

/**
 * Inicializa y carga el modelo de reconocimiento de voz Vosk
 * @returns {Promise<Object>} Modelo cargado
 */
async function cargarModelo() {
  console.log("📦 Cargando modelo de reconocimiento de voz...");
  
  const modelPath = path.resolve(CONFIG.modelPath);
  const model = new Model(modelPath);
  
  // Esperar un momento para asegurar que el modelo se cargue completamente
  await new Promise((resolve) => setTimeout(resolve, 100));
  
  console.log("✅ Modelo cargado correctamente\n");
  return model;
}

/**
 * Configura el reconocedor de voz con el modelo y tasa de muestreo
 * @param {Object} model - Modelo de Vosk cargado
 * @returns {Object} Reconocedor configurado
 */
function configurarReconocedor(model) {
  return new Recognizer({ 
    model: model, 
    sampleRate: CONFIG.sampleRate 
  });
}

/**
 * Configura y retorna la instancia del micrófono
 * @returns {Object} Instancia del micrófono configurada
 */
function configurarMicrofono() {
  return mic({
    rate: CONFIG.sampleRate.toString(),
    channels: CONFIG.channels.toString(),
    debug: false,
    exitOnSilence: CONFIG.exitOnSilence,
  });
}

/**
 * Activa el sistema de escucha por un tiempo determinado
 */
function activarSistema() {
  sistemaActivo = true;
  console.log(`✅ Sistema activado - Escuchando comandos por ${TIEMPO_ESCUCHA_ACTIVA / 1000} segundos...\n`);
  
  // Limpiar timeout anterior si existe
  if (timeoutEscucha) {
    clearTimeout(timeoutEscucha);
  }
  
  // Configurar nuevo timeout para desactivar el sistema
  timeoutEscucha = setTimeout(() => {
    sistemaActivo = false;
    console.log(`\n⏸️  Sistema en espera - Di "${PALABRA_ACTIVACION}" para activar\n`);
  }, TIEMPO_ESCUCHA_ACTIVA);
}

/**
 * Procesa el resultado del reconocimiento de voz
 * @param {Object} recognizer - Reconocedor de Vosk
 * @param {Buffer} chunk - Fragmento de audio
 */
function procesarAudio(recognizer, chunk) {
  if (recognizer.acceptWaveform(chunk)) {
    const result = JSON.parse(recognizer.result());
    const texto = (result.text || "").trim();

    if (texto) {
      // Mostrar todo lo que se reconoce (para debug)
      if (!sistemaActivo) {
        console.log("💬", texto, "(ignorado)");
      } else {
        console.log("🗣️  Reconocido:", texto);
      }
      
      // Procesar comando
      const { ejecutado, activacion } = procesarComando(texto, sistemaActivo);
      
      // Si se detectó la palabra de activación
      if (activacion) {
        activarSistema();
      }
      
      // Si el sistema estaba activo y se ejecutó un comando, reiniciar el timer
      if (ejecutado && sistemaActivo) {
        activarSistema(); // Reinicia el tiempo de escucha
      }
    }
  }
}

/**
 * Configura los manejadores de eventos del micrófono
 * @param {Object} micInstance - Instancia del micrófono
 * @param {Object} recognizer - Reconocedor de Vosk
 * @param {Object} model - Modelo de Vosk
 */
function configurarEventosMicrofono(micInstance, recognizer, model) {
  const micInputStream = micInstance.getAudioStream();

  // Procesar datos de audio
  micInputStream.on("data", (chunk) => {
    procesarAudio(recognizer, chunk);
  });

  // Manejar errores del micrófono
  micInputStream.on("error", (err) => {
    console.error("❌ Error en el micrófono:", err);
    console.log("\nℹ️  Si estás en WSL2, el acceso al micrófono es limitado.");
    console.log("   Este código funcionará correctamente en la Raspberry Pi.\n");
  });

  // Detectar silencio (si exitOnSilence > 0)
  micInputStream.on("silence", () => {
    console.log("🔇 Silencio detectado");
  });

  // Manejar cierre limpio con Ctrl+C
  process.on("SIGINT", () => {
    console.log("\n\n👋 Cerrando aplicación...");
    if (timeoutEscucha) {
      clearTimeout(timeoutEscucha);
    }
    micInstance.stop();
    recognizer.free();
    model.free();
    console.log("✅ Recursos liberados correctamente");
    process.exit(0);
  });
}

/**
 * Función principal que orquesta todo el sistema
 */
async function main() {
  try {
    console.log("🎤 Iniciando sistema de reconocimiento de voz\n");
    console.log("=" .repeat(50));
    
    // Mostrar comandos disponibles
    mostrarComandosDisponibles();
    
    // Cargar modelo de reconocimiento
    const model = await cargarModelo();
    
    // Configurar reconocedor
    const recognizer = configurarReconocedor(model);
    
    // Configurar micrófono
    const micInstance = configurarMicrofono();
    
    // Configurar eventos
    configurarEventosMicrofono(micInstance, recognizer, model);
    
    // Iniciar captura de audio
    console.log(`🎙️  Escuchando...`);
    console.log(`   💡 Di "${PALABRA_ACTIVACION}" para activar el sistema`);
    console.log(`   ⏱️  El sistema permanecerá activo ${TIEMPO_ESCUCHA_ACTIVA / 1000} segundos después de activarse`);
    console.log(`   ⌨️  Presiona Ctrl+C para salir\n`);
    console.log("=" .repeat(50) + "\n");
    
    micInstance.start();
    
  } catch (error) {
    console.error("❌ Error fatal:", error.message);
    process.exit(1);
  }
}

// Ejecutar la función principal
main().catch(console.error);
