#!/usr/bin/env node
/**
 * TestiBot - Simulador de comandos de voz para testing
 * 
 * Uso:
 *   ./testibot.js "computadora"
 *   ./testibot.js "computadora" "encender"
 *   ./testibot.js "hola"
 */

import { 
  procesarComando, 
  mostrarComandosDisponibles,
  PALABRA_ACTIVACION,
  TIEMPO_ESCUCHA_ACTIVA
} from "./comandos.js";

// Estado del sistema de activación
let sistemaActivo = false;
let timeoutId = null;

console.log("╔══════════════════════════════════════════╗");
console.log("║      🧪 TESTIBOT - MODO PRUEBA 🧪       ║");
console.log("╚══════════════════════════════════════════╝");
console.log("");

// Mostrar comandos disponibles
mostrarComandosDisponibles();
console.log("");

// Obtener argumentos de la línea de comandos
const args = process.argv.slice(2);

if (args.length === 0) {
  console.log("❌ Error: Debes proporcionar al menos un texto para simular");
  console.log("");
  console.log("📋 Ejemplos de uso:");
  console.log("  ./testibot.js \"computadora\"");
  console.log("  ./testibot.js \"computadora\" \"encender\"");
  console.log("  ./testibot.js \"hola\"");
  console.log("  ./testibot.js \"computadora\" \"qué hora es\"");
  console.log("");
  process.exit(1);
}

/**
 * Activa el sistema de escucha
 */
function activarSistema() {
  sistemaActivo = true;
  console.log("🟢 Sistema ACTIVADO - Esperando comando...");
  
  // Desactivar después del timeout
  if (timeoutId) clearTimeout(timeoutId);
  timeoutId = setTimeout(() => {
    sistemaActivo = false;
    console.log("⏸️  Sistema DESACTIVADO - Di 'computadora' para activar");
  }, TIEMPO_ESCUCHA_ACTIVA);
}

/**
 * Procesa el texto simulado
 */
function procesarTextoSimulado(texto) {
  console.log(`\n📥 Texto recibido: "${texto}"\n`);
  
  const textoLower = texto.toLowerCase().trim();
  
  // Verificar palabra de activación
  if (textoLower.includes(PALABRA_ACTIVACION.toLowerCase())) {
    console.log(`✅ Palabra de activación detectada: "${PALABRA_ACTIVACION}"`);
    activarSistema();
    return;
  }
  
  // Si el sistema está activo, procesar comando
  if (sistemaActivo) {
    console.log("🎯 Sistema activo - Procesando comando...");
    procesarComando(textoLower, sistemaActivo);
    
    // Resetear timeout después de ejecutar comando
    if (timeoutId) clearTimeout(timeoutId);
    timeoutId = setTimeout(() => {
      sistemaActivo = false;
      console.log("⏸️  Sistema DESACTIVADO - Di 'computadora' para activar");
    }, TIEMPO_ESCUCHA_ACTIVA);
  } else {
    console.log("⏸️  Sistema inactivo - Di 'computadora' primero para activar");
  }
}

// Procesar cada argumento como si fuera una entrada de voz
console.log("🎬 Iniciando simulación...\n");
console.log("=" .repeat(50));

for (let i = 0; i < args.length; i++) {
  // Pequeña pausa entre comandos para simular tiempo real
  await new Promise(resolve => setTimeout(resolve, i === 0 ? 0 : 1000));
  procesarTextoSimulado(args[i]);
  console.log("=" .repeat(50));
}

// Esperar un poco antes de salir para que se vean los mensajes
setTimeout(() => {
  console.log("\n✅ Simulación completada");
  process.exit(0);
}, 2000);
