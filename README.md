# 🤖 TopiBot - Asistente de Voz Offline para Raspberry Pi

Sistema de reconocimiento de voz **completamente offline** usando Vosk y palabra de activación.

> 🚀 **¿Tienes Raspberry Pi 5?** Usa la [versión optimizada](./README-RASPI5.md) con Node.js 20 LTS y mejor rendimiento.

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
  - 🚀 Para Raspberry Pi 5: Usa la [rama optimizada](./README-RASPI5.md)
- **Software**: Node.js 18+, Python 3.7+
- **OS**: Raspberry Pi OS (Bullseye o posterior)

---

## Estructura del Proyecto

```
topibot/
├── stt_server.py          # Servidor Python/Vosk
├── index.js               # Bot Node.js principal
├── comandos.js            # Mapeo de comandos
├── acciones.js            # Funciones ejecutables
├── install.sh             # Instalador automático
├── verificar.sh           # Script de verificación
├── model/                 # Modelo Vosk (descargado por instalador)
├── stt.service            # Servicio systemd Python
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
sudo systemctl start stt.service
sudo journalctl -u stt.service -n 50
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
