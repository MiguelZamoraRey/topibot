# 🤖 TopiBot - Asistente de Voz Offline para Raspberry Pi

Sistema de reconocimiento de voz **completamente offline** usando Vosk y palabra de activación.

<div align="center">

**[🚀 Inicio Rápido](#inicio-rápido)** • 
**[📖 Documentación](./docs/GUIA_COMPLETA.md)** • 
**[🎤 Comandos](#comandos-disponibles)** • 
**[🔧 Desarrollo](#desarrollo)**

</div>

---

## ¿Qué es TopiBot?

TopiBot te permite controlar tu Raspberry Pi por voz sin necesidad de internet:

```
Tú: "topibot"              →  🟢 Sistema activado
Tú: "encender"             →  💡 LED encendido
Tú: "qué hora es"          →  🕐 La hora es: 14:30
```

### Características

- ✅ **100% Offline** - No requiere internet
- ✅ **Palabra de activación** - Solo responde cuando dices "topibot"
- ✅ **Feedback sonoro** - Buzzer confirma activación con beep-beep
- ✅ **Control GPIO** - LED y buzzer integrados
- ✅ **Mensajes multi-paso** - Sistema conversacional para enviar mensajes
- ✅ **Python 3.13 compatible** - Usa Docker automáticamente si es necesario
- ✅ **Bajo consumo** - ~300 MB RAM en Raspberry Pi 3 B+
- ✅ **Extensible** - Añade tus propios comandos fácilmente
- ✅ **Plug & Play** - Script de instalación automática

---

## Inicio Rápido

### 1. Clonar en tu Raspberry Pi

```bash
git clone <tu-repo> ~/topibot
cd ~/topibot
```

> 💡 **Nota**: Puedes clonar el proyecto en cualquier directorio. Los scripts detectan automáticamente la ubicación.

### 2. Ejecutar instalador

```bash
chmod +x install.sh
./install.sh
```

El instalador se encarga de todo:
- Detecta versión de Python (3.11, 3.13, etc.)
- Instala Docker automáticamente si usa Python 3.13
- Instala dependencias (Python, Node.js, ALSA)
- Descarga el modelo de voz en español
- Configura servicios systemd
- Inicia el sistema

### 3. Verificar

```bash
./verificar.sh
```

### 4. ¡Pruébalo!

Di: **"topibot"** → **"encender"**

---

## Arquitectura

```
Micrófono → Python/Vosk → HTTP → Node.js → Acciones
            (Puerto 5005)         (Comandos)
```

- **Python**: Reconocimiento de voz pesado (Vosk)
- **Node.js**: Lógica de comandos ligera
- **Comunicación**: HTTP REST local

---

## Comandos Disponibles

### Activación
- **"topibot"** - Activa el sistema por 5 segundos

### LED
- **Encender**: "encender", "enciende", "prende"
- **Apagar**: "apagar", "apaga"
- **Estado**: "estado", "cómo está"
- **Alternar**: "alternar", "cambiar"

### Información
- **Saludar**: "hola", "buenos días"
- **Hora**: "hora", "qué hora es"
- **Fecha**: "fecha", "qué día es"

### Sistema
- **Info**: "información", "sistema"
- **Reiniciar**: "reiniciar", "reset"

---

## Gestión del Sistema

### Comandos útiles

```bash
# Ver logs en tiempo real
sudo journalctl -u topibot.service -f

# Reiniciar servicios
sudo systemctl restart stt.service topibot.service

# Ver estado
sudo systemctl status topibot.service

# Verificar sistema
./verificar.sh
```

---

## Control de Hardware (GPIO)

TopiBot incluye control de LED y buzzer mediante GPIO:

### 🔌 Conexión del Hardware

```
GPIO 17 (Pin 11) → Resistor 220-330Ω → LED (+) → LED (-) → GND (Pin 6 o 9)
GPIO 22 (Pin 15) → Buzzer (+)
                   Buzzer (-) → GND (compartido)
```

**Tipos de Buzzer soportados:**
- **Buzzer Activo**: Control ON/OFF simple (fallback automático)
- **Buzzer Pasivo**: Control PWM a 2000Hz (requiere librería `pigpio`)

### 💡 Comandos de LED

```
"topibot" → "encender"    # Enciende el LED
"topibot" → "apagar"      # Apaga el LED  
"topibot" → "alternar"    # Cambia el estado
"topibot" → "estado"      # Muestra si está encendido/apagado
```

### 🔊 Buzzer de Feedback

El buzzer emite un **beep-beep** automáticamente cuando dices "topibot" para confirmar que el sistema te está escuchando.

**El sistema soporta ambos tipos de buzzer:**
- **Buzzer Activo**: Funciona automáticamente con control ON/OFF simple
- **Buzzer Pasivo**: Usa PWM vía daemon `pigpiod` (se instala automáticamente con `install.sh`)

**Si el buzzer no suena:**
```bash
# 1. Verifica que pigpiod esté corriendo
sudo systemctl status pigpiod
sudo systemctl start pigpiod  # Si no está activo

# 2. Prueba con comando directo
pigs hp 22 2000 128  # Encender PWM
sleep 1
pigs hp 22 0 0       # Apagar

# 3. Si no funciona, verifica polaridad (intercambia + y -)
```

**Troubleshooting:**
- Si no suena → Prueba invertir la polaridad (+ y -)
- Si sigue sin sonar → El buzzer puede estar roto o necesitar 5V en lugar de 3.3V
- Verifica que `pigpiod` esté corriendo: `sudo systemctl status pigpiod`

### 📨 Sistema de Mensajes Multi-Paso

```
"topibot" → "mensaje" → "padre" → "hola papá, cómo estás"
```

Flujo:
1. **Activación**: Di "topibot" (🔊 beep-beep)
2. **Modo mensaje**: Di "mensaje"
3. **Destinatario**: Di "padre", "madre" o "esther"
4. **Mensaje**: Di el texto que quieres enviar
5. Sistema captura y logea (preparado para Telegram/Discord)

### 🧪 Modo de Prueba (sin micrófono)

```bash
# Simular comandos sin necesidad del servidor STT
sudo ./testibot.js "topibot" "encender"
sudo ./testibot.js "topibot" "apagar"
sudo ./testibot.js "topibot" "hola"
```

> **Nota**: TopiBot usa `gpiod` nativo (instalado automáticamente). Si tu sistema usa el viejo sistema sysfs, verás "Modo simulación" pero los comandos seguirán ejecutándose sin error.

---

## Desarrollo

### Añadir un nuevo comando

**1. Crea la función en `acciones.js`:**

```javascript
export function miComando() {
  console.log("✨ ¡Mi comando ejecutado!");
}
```

**2. Importa en `comandos.js`:**

```javascript
import { miComando } from "./acciones.js";
```

**3. Añade al array de comandos:**

```javascript
{
  keywords: ["mi comando", "ejecutar"],
  action: miComando,
  description: "Mi comando personalizado"
}
```

**4. Reinicia:**

```bash
sudo systemctl restart topibot.service
```

### Configuración

**Cambiar palabra de activación** (`comandos.js`):
```javascript
export const PALABRA_ACTIVACION = "jarvis";
```

**Cambiar timeout** (`comandos.js`):
```javascript
export const TIEMPO_ESCUCHA_ACTIVA = 10000; // 10 segundos
```

---

## Requisitos

- **Hardware**: Raspberry Pi 3 B+ o superior, Micrófono USB
- **Software**: Node.js 16+, Python 3.7+ (Python 3.13 usa Docker automáticamente)
- **OS**: Raspberry Pi OS (Bullseye, Bookworm o Trixie)
- **Opcional**: Docker (se instala automáticamente si es necesario)

---

## Estructura del Proyecto

```
topibot/
├── stt_server.py          # Servidor Python/Vosk
├── index.js               # Bot Node.js principal
├── comandos.js            # Mapeo de comandos
├── acciones.js            # Funciones ejecutables
├── testibot.js            # 🧪 Herramienta de prueba (sin micrófono)
├── install.sh             # Instalador automático
├── verificar.sh           # Script de verificación
├── Dockerfile             # Contenedor Python 3.11 (para Python 3.13)
├── requirements-stt.txt   # Dependencias Python del STT
├── model/                 # Modelo Vosk (descargado por instalador)
├── stt.service            # Servicio systemd Python (venv)
├── stt-docker.service     # Servicio systemd Python (Docker)
├── topibot.service        # Servicio systemd Node.js
└── docs/
    └── GUIA_COMPLETA.md   # Documentación detallada
```

---

## Documentación

- **[📖 Guía Completa](./docs/GUIA_COMPLETA.md)** - Todo lo que necesitas saber
  - Arquitectura detallada
  - Instalación paso a paso
  - Troubleshooting
  - Optimización
  - Ejemplos avanzados
- **[📁 Estructura del Proyecto](./docs/ESTRUCTURA.md)** - Explicación de archivos
- **[🤝 Contribuir](./CONTRIBUTING.md)** - Guía para colaboradores
- **[📝 Changelog](./CHANGELOG.md)** - Historial de versiones

---

## Solución Rápida de Problemas

### Servidor STT no arranca
```bash
sudo systemctl status stt.service
sudo journalctl -u stt.service -n 50

# Si usas Docker (Python 3.13):
sudo docker logs topibot-stt
```

### Python 3.13 detectado
El instalador automáticamente usa Docker con Python 3.11. Si hay problemas:
```bash
sudo systemctl status docker
sudo docker ps -a
```

### No detecta micrófono
```bash
arecord -l  # Listar dispositivos
alsamixer   # Ajustar volumen (F4 para captura)
```

### Palabra de activación no funciona
- Habla más claro y despacio
- Ajusta volumen del micrófono
- Verifica logs: `sudo journalctl -u topibot.service -f`

### GPIO no funciona (LED no enciende)
```bash
# Verificar que gpiod está instalado
which gpioset

# Probar manualmente
gpioset gpiochip0 17=1  # Encender
gpioset gpiochip0 17=0  # Apagar

# Si falla, instalar gpiod
sudo apt install -y gpiod

# Probar con testibot
sudo ./testibot.js "topibot" "encender"
```

**Más soluciones en la [Guía Completa](./docs/GUIA_COMPLETA.md#troubleshooting)**

---

## Rendimiento

| Raspberry Pi 3 B+ | Valor |
|-------------------|-------|
| Tiempo de inicio | 10-15 seg |
| Latencia | 2-3 seg |
| RAM usada | ~300 MB |
| CPU (activo) | 30-50% |

---

## Licencia

ISC

---

<div align="center">

**Hecho con ❤️ para Raspberry Pi**

[⬆ Volver arriba](#-topibot---asistente-de-voz-offline-para-raspberry-pi)

</div>
