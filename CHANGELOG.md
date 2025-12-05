
# 📝 Changelog

Todos los cambios notables del proyecto se documentarán en este archivo.

## [1.4.0] - Diciembre 2025

### ✨ Añadido

- **Integración Discord**: Envío de mensajes por voz directamente a Discord
  - Webhook configurado con username "TopiBot"
  - Flujo simplificado: "topibot" → "mensaje" → (dicta tu mensaje)
  - Confirmación auditiva (beep) al enviar exitosamente
  - Error auditivo si falla la conexión
  - Sin necesidad de especificar destinatario

### 🔧 Arreglado

- **Crash del servicio STT**: Crear nuevo recognizer por request
  - Solucionado error "ASSERTION_FAILED: You must call InitDecoding() before AdvanceDecoding"
  - El recognizer de Vosk ahora se instancia nuevo en cada `/listen` request
  - Evita estado corrupto después de `FinalizeDecoding()`
  - El servicio ya no se detiene después de múltiples requests

- **Buzzer PWM**: Cambio de hardware PWM a software PWM
  - GPIO 22 no tiene hardware PWM, solo software PWM
  - Cambiado de `pigs hp` a `pigs p` (software PWM)
  - Eliminados mensajes de error "GPIO has no hardware PWM"
  - Buzzer ahora funciona correctamente con `pigs p 22 128`

### 🗑️ Eliminado

- Sistema multi-paso de mensajes (destinatarios predefinidos)
- Funciones deprecated: `establecerDestinatario()`, `capturarMensaje()`
- Constante `DESTINATARIOS` (padre/madre/esther)

## [1.3.0] - Diciembre 2025

### ✨ Añadido

- **Sistema de mensajes multi-paso**: Flujo conversacional para enviar mensajes
  - Activación: "topibot" → "mensaje" → "padre/madre/esther" → "texto del mensaje"
  - Estado de conversación persistente durante el flujo
  - Mapeo de destinatarios con variaciones (papá/mamá/padre/madre)
  - Preparado para integración futura con Telegram/Discord API
  - Por ahora logea toda la información capturada

- **Buzzer PWM con fallback automático**: GPIO 22 (Pin 15)
  - Soporte para **buzzer pasivo** (PWM a 2000Hz) usando librería `pigpio`
  - Fallback automático a control simple para **buzzer activo**
  - Detección automática del tipo de control disponible
  - `sonidoActivacion()`: Beep doble al detectar palabra de activación "topibot"
  - `sonidoConfirmacion()`: Beep simple para confirmaciones
  - `sonidoError()`: 3 beeps rápidos para errores
  - Ejecución en background sin bloquear comandos
  - Feedback auditivo inmediato para mejor UX

### 🔧 Arreglado

- **GPIO buzzer**: Migrado de GPIO 27 a GPIO 22 (Pin 15)
  - Soluciona error "Device or resource busy" en GPIO 27
  - Comandos ejecutados en background con subshell
  - Evita bloqueo del sistema durante beeps
  - Usa `(comando) &` para ejecución asíncrona
  
- **Buzzer pasivo**: Implementado control PWM desde Node.js
  - Integración con librería `pigpio` para modulación PWM
  - Frecuencia configurable (2000Hz por defecto)
  - Duty cycle 50% para volumen óptimo

## [1.2.0] - Diciembre 2025

### 🔧 Arreglado

- **GPIO en kernels modernos**: Migración de `onoff` a `gpiod` nativo
  - Soluciona error "GPIO no disponible" en Raspberry Pi con kernel reciente
  - Usa `gpioset`/`gpioget` en lugar de `/sys/class/gpio` (deprecated)
  - Compatible con sistema `gpiochip0` del kernel actual
  - LED control funcional en GPIO 17 (Pin 11)
- **Dependencias**: Eliminada biblioteca `onoff` (incompatible con nuevo GPIO)
- **Instalador**: Añadido `gpiod` a dependencias del sistema

### ✨ Añadido

- **testibot.js**: Herramienta de prueba para simular comandos de voz sin micrófono
  - Útil para debugging y desarrollo
  - Simula palabra de activación y comandos
  - Modo standalone sin necesidad del servidor STT

## [1.1.0] - Diciembre 2025

### 🐳 Nuevo: Soporte Python 3.13 con Docker

- **Compatibilidad Python 3.13**: Detección automática de Python 3.13 (incompatible con vosk)
- **Solución Docker**: Instalación automática de Docker con contenedor Python 3.11
- **Instalación inteligente**: El script detecta la versión de Python y elige:
  - Python 3.11 o anterior → Virtual environment tradicional
  - Python 3.13+ → Contenedor Docker con Python 3.11
- **Nuevo archivo**: `Dockerfile` para construcción de imagen con Python 3.11
- **Nuevo archivo**: `stt-docker.service` para gestión del contenedor
- **Nuevo archivo**: `requirements-stt.txt` con dependencias Python del STT

### 🔧 Arreglado

- **Instalación Docker en Trixie**: Usa repo de Bookworm (Trixie no tiene repo oficial aún)
  - Instalación manual de Docker con repositorio compatible
  - Soluciona error "The repository does not have a Release file"
- **Path del modelo**: `stt_server.py` ahora usa path relativo en lugar de hardcodeado
  - Funciona en cualquier directorio de instalación
  - Mejores mensajes de error al cargar el modelo
- **Dependencias Node.js**: Eliminadas dependencias nativas problemáticas
  - Removido: `vosk`, `mic`, `ffi-napi` (causaban errores de compilación)
  - Mantenido: `axios` (comunicación HTTP con servidor STT)
- **Compatibilidad**: Soporte para Raspberry Pi OS Trixie (Python 3.13 por defecto)

### ⚡ Mejorado

- **Instalador**: Detección automática de versión de Python
- **Logs**: Mejores mensajes de error en servidor STT
- **Rendimiento**: Sin overhead de compilación de dependencias nativas en Node.js

## [1.0.1] - Diciembre 2025

### 🔄 Cambiado

- **Virtual Environment**: Dependencias Python ahora se instalan en un venv en lugar del sistema
  - Soluciona problema de PEP 668 en Python 3.11+
  - Compatible con Raspberry Pi OS Trixie y Bookworm
  - `stt.service` actualizado para usar `venv/bin/python3`
- **Instalador**: `install.sh` ahora crea automáticamente el virtual environment
- **Verificador**: `verificar.sh` actualizado para verificar el venv
- **Documentación**: Actualizada para reflejar el uso de virtual environment

### ✨ Añadido

- Instalación de `python3-venv` en el script de instalación

## [1.0.0] - Diciembre 2025

### ✨ Características Iniciales

- 🎤 Reconocimiento de voz offline usando Vosk
- 🔑 Sistema de palabra de activación ("topibot")
- ⏱️ Timeout configurable (5 segundos por defecto)
- 🏗️ Arquitectura Python (STT) + Node.js (lógica)
- 📡 Comunicación HTTP REST entre componentes
- 🔧 10 comandos predefinidos (LED, hora, fecha, sistema)
- 🤖 Servicios systemd para auto-inicio
- 📦 Script de instalación automática
- ✅ Script de verificación del sistema
- 📖 Documentación completa

### 🎯 Comandos Disponibles

**Activación:**
- "topibot" - Activa el sistema

**LED:**
- Encender, apagar, estado, alternar

**Información:**
- Saludar, hora, fecha

**Sistema:**
- Información del sistema, reiniciar estado

### 📊 Rendimiento

- Compatible con Raspberry Pi 3 B+
- Uso de RAM: ~300 MB
- Latencia: 2-3 segundos
- CPU: 30-50% durante escucha activa

### 🛠️ Tecnologías

- Python 3.7+ con Vosk, sounddevice, Flask
- Node.js 16+ con axios
- Systemd para gestión de servicios
- ALSA para captura de audio

---

## Formato

El formato se basa en [Keep a Changelog](https://keepachangelog.com/es-ES/1.0.0/),
y este proyecto adhiere a [Semantic Versioning](https://semver.org/lang/es/).

### Tipos de Cambios

- **✨ Añadido** - Para nuevas características
- **🔄 Cambiado** - Para cambios en funcionalidad existente
- **🗑️ Deprecado** - Para características que serán eliminadas
- **🚮 Eliminado** - Para características eliminadas
- **🐛 Corregido** - Para corrección de bugs
- **🔒 Seguridad** - Para parches de seguridad
