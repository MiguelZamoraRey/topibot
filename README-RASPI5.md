# 🚀 TopiBot para Raspberry Pi 5

Versión optimizada para Raspberry Pi 5 con las últimas versiones de Node.js y Python.

## ⚡ Características Optimizadas

- ✅ Node.js 20 LTS (última versión estable)
- ✅ Python 3.11+ totalmente compatible
- ✅ Mejor rendimiento en Raspberry Pi 5
- ✅ Sin necesidad de workarounds para libvosk.so
- ✅ Instalación en ~3 minutos

## 🚀 Instalación Rápida

### 1. Clonar repositorio

```bash
cd ~
git clone https://github.com/MiguelZamoraRey/topibot.git
cd topibot
git checkout raspi5-optimized  # Usar rama optimizada para Raspberry Pi 5
```

### 2. Instalar

```bash
chmod +x install.sh
./install.sh
```

¡Eso es todo! El script detecta automáticamente que estás en Raspberry Pi 5 y aplica las optimizaciones necesarias.

### 3. Probar

Di: **"topibot"** → **"qué hora es"**

## 📊 Rendimiento en Raspberry Pi 5

| Métrica | Raspberry Pi 5 | Raspberry Pi 3 B+ |
|---------|----------------|-------------------|
| Tiempo de inicio | 3-5 seg | 10-15 seg |
| Latencia | <1 seg | 2-3 seg |
| RAM usada | ~200 MB | ~300 MB |
| CPU (activo) | 10-20% | 30-50% |

## 🔧 Compatibilidad

Esta versión también funciona en:
- ✅ Raspberry Pi 5 (optimizado)
- ✅ Raspberry Pi 4
- ✅ Raspberry Pi 3 B+

El script detecta automáticamente el modelo y aplica las configuraciones adecuadas.

## 📖 Documentación Completa

Ver [README.md](./README.md) para documentación completa, comandos disponibles y guía de desarrollo.

## 🆕 Diferencias vs Versión Estándar

- **Node.js 20 LTS** en lugar de 18 (mejor rendimiento y seguridad)
- **Sin workarounds** para Python 3.13 (funciona nativamente)
- **Detección automática** del modelo de Raspberry Pi
- **Optimizaciones** específicas para ARM64

## 🔄 Actualizar desde Versión Estándar

```bash
cd ~/topibot
git fetch origin
git checkout raspi5-optimized
git pull
./install.sh
```

---

**Hecho con ❤️ para Raspberry Pi 5**
