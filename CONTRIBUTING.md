# 🤝 Contribuir a TopiBot

¡Gracias por tu interés en mejorar TopiBot!

## 🚀 Inicio Rápido para Desarrolladores

### 1. Fork y Clona

```bash
git clone <tu-fork> topibot
cd topibot
```

### 2. Instala Dependencias

```bash
# Python
pip3 install vosk sounddevice flask

# Node.js
npm install
```

### 3. Descarga el Modelo (para pruebas)

```bash
wget https://alphacephei.com/vosk/models/vosk-model-small-es-0.42.zip
unzip vosk-model-small-es-0.42.zip
mv vosk-model-small-es-0.42/* model/
rm -rf vosk-model-small-es-0.42*
```

### 4. Ejecuta en Modo Desarrollo

```bash
# Terminal 1
python3 stt_server.py

# Terminal 2
node index.js
```

## 📝 Guías de Contribución

### Añadir un Nuevo Comando

1. **Crea la función** en `acciones.js`
2. **Importa y mapea** en `comandos.js`
3. **Prueba manualmente**
4. **Documenta** en el README

### Mejorar el Reconocimiento

- Edita `comandos.js` para añadir sinónimos a keywords existentes
- Considera el contexto en español (acentos, variaciones regionales)

### Optimizar Rendimiento

- Perfila con `top` y `htop` en Raspberry Pi
- Documenta cambios de rendimiento en el PR

## 🐛 Reportar Bugs

Usa GitHub Issues con:
- Descripción clara del problema
- Pasos para reproducir
- Logs relevantes (`journalctl -u topibot.service -n 100`)
- Hardware usado (modelo de Raspberry Pi)

## ✅ Pull Request

1. Crea una rama: `git checkout -b feature/mi-mejora`
2. Haz commits claros: `git commit -m "Añade comando para X"`
3. Push: `git push origin feature/mi-mejora`
4. Abre PR en GitHub con descripción detallada

## 📚 Estilo de Código

### JavaScript
- ES Modules (`import/export`)
- Comentarios en español
- JSDoc para funciones públicas

### Python
- PEP 8
- Type hints cuando sea posible
- Docstrings en español

## 🧪 Testing

Actualmente no hay tests automáticos. Contribuciones de testing son bienvenidas.

## 📄 Licencia

Al contribuir, aceptas que tu código se publique bajo la licencia ISC del proyecto.

---

**¡Gracias por contribuir a TopiBot!** 🤖
