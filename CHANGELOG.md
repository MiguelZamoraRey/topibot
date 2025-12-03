# 📝 Changelog

Todos los cambios notables del proyecto se documentarán en este archivo.

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
