# Sistema de Reconocimiento de Voz con Vosk

Sistema de control por voz para Raspberry Pi usando el modelo Vosk en español con palabra de activación.

## 🎯 Cómo funciona

1. **Di la palabra de activación**: "**Topibot**"
2. **El sistema se activa** por 5 segundos
3. **Di tu comando** (ej: "encender", "apagar", "hora")
4. **El sistema ejecuta la acción**
5. Si no dices nada en 5 segundos, el sistema vuelve a modo espera

⚠️ **Importante**: El sistema SOLO responde a comandos después de decir "Topibot". Puedes hablar normalmente sin que se ejecuten comandos accidentales.

## 📋 Requisitos

- Node.js v18+
- Micrófono (en Raspberry Pi)
- alsa-utils (instalado automáticamente en Raspberry Pi)

## 🚀 Instalación

```bash
npm install
```

## ▶️ Ejecución

```bash
npm start
```

## 🎯 Comandos Disponibles

### 🔑 Palabra de Activación
- **"Topibot"** - Activa el sistema por 5 segundos

### LED
- **Encender LED**: "encender", "enciende", "prende", "prender"
- **Apagar LED**: "apagar", "apaga"
- **Estado LED**: "estado", "cómo está", "como esta"
- **Alternar LED**: "alternar", "cambiar", "toggle"

### Información
- **Saludar**: "hola", "buenos días", "buenas tardes", "buenas noches"
- **Hora**: "hora", "qué hora es"
- **Fecha**: "fecha", "qué día es"

### Sistema
- **Info Sistema**: "información", "sistema"
- **Reiniciar**: "reiniciar", "reset"

### 💡 Ejemplo de uso
```
Usuario: "Topibot"
Sistema: ✅ Sistema activado - Escuchando comandos por 5 segundos...

Usuario: "encender"
Sistema: 💡 LED encendido

Usuario: "qué hora es"
Sistema: 🕐 La hora es: 14:30:25

[5 segundos después sin actividad]
Sistema: ⏸️  Sistema en espera - Di "topibot" para activar
```

## 🔧 Añadir Nuevos Comandos

### Paso 1: Crear la función en `acciones.js`

```javascript
/**
 * Tu nueva función
 */
export function miFuncion() {
  console.log("✨ ¡Mi función ejecutada!");
  // Tu lógica aquí
}
```

### Paso 2: Importar en `comandos.js`

```javascript
import {
  encenderLED,
  apagarLED,
  miFuncion,  // ← Añade tu función aquí
  // ... otras funciones
} from "./acciones.js";
```

### Paso 3: Añadir comando al array en `comandos.js`

```javascript
{
  keywords: ["palabra1", "palabra2", "palabra3"],
  action: miFuncion,
  description: "Descripción de mi función"
}
```

### Ejemplo completo: Añadir comando para leer temperatura

**En `acciones.js`:**
```javascript
export function leerTemperatura() {
  const temp = (20 + Math.random() * 10).toFixed(1);
  console.log(`🌡️  Temperatura: ${temp}°C`);
}
```

**En `comandos.js`:**
```javascript
// 1. Importar
import { leerTemperatura } from "./acciones.js";

// 2. Añadir al array comandos
{
  keywords: ["temperatura", "cuántos grados"],
  action: leerTemperatura,
  description: "Lee la temperatura actual"
}
```

## 📁 Estructura del Proyecto

```
vosk-commands/
├── voz_led.js                     # Script principal (reconocimiento de voz)
├── comandos.js                    # Configuración de comandos (mapeo)
├── acciones.js                    # Funciones/acciones del sistema
├── package.json                   # Dependencias del proyecto
└── vosk-model-small-es-0.42/      # Modelo de reconocimiento en español
```

### Arquitectura
- **`voz_led.js`**: Motor de reconocimiento de voz (no necesitas modificarlo)
- **`acciones.js`**: Define QUÉ hace cada función (lógica de negocio)
- **`comandos.js`**: Define CUÁNDO se ejecuta (mapeo voz → acción)

## 🔍 Configuración

### Cambiar la palabra de activación

Edita `comandos.js`:

```javascript
export const PALABRA_ACTIVACION = "mipalabra"; // Cambia "topibot" por tu palabra
```

### Cambiar el tiempo de escucha activa

Edita `comandos.js`:

```javascript
export const TIEMPO_ESCUCHA_ACTIVA = 10000; // 10 segundos (en milisegundos)
```

### Otras configuraciones

Puedes modificar la configuración en `voz_led.js`:

```javascript
const CONFIG = {
  modelPath: "./vosk-model-small-es-0.42/vosk-model-small-es-0.42",
  sampleRate: 16000,        // Frecuencia de muestreo
  channels: 1,              // Número de canales (mono)
  exitOnSilence: 6,         // Segundos de silencio antes de salir (0 = nunca)
};
```
## 🐛 Solución de Problemas

### Error: "spawn arecord ENOENT"

Instala alsa-utils:

```bash
sudo apt-get update
sudo apt-get install -y alsa-utils
```

### Error: "no soundcards found"

Verifica que tu micrófono esté conectado:

```bash
arecord -l
```

En WSL2 esto es normal, el código funcionará en Raspberry Pi.

## 📝 Licencia

ISC
