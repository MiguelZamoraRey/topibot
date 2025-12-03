# 📁 Estructura del Proyecto TopiBot

## Archivos Principales

```
topibot/
├── README.md              # Documentación principal (inicio rápido)
├── stt_server.py          # Servidor Python con Vosk (puerto 5005)
├── index.js               # Bot Node.js con lógica de activación
├── comandos.js            # Configuración de comandos y mapeo
├── acciones.js            # Implementación de funciones/acciones
├── package.json           # Dependencias Node.js
└── voz_led.js             # Script legacy (modo directo Vosk)
```

## Scripts de Instalación

```
├── install.sh             # Instalador automático completo
└── verificar.sh           # Script de verificación del sistema
```

## Servicios Systemd

```
├── stt.service            # Servicio para servidor Python
└── topibot.service        # Servicio para bot Node.js
```

## Directorios

```
├── model/                 # Modelo Vosk (descargado por instalador)
│   └── .gitkeep          # Para mantener directorio en git
└── docs/
    └── GUIA_COMPLETA.md  # Documentación detallada
```

## Archivos de Configuración

```
├── .gitignore            # Archivos ignorados por git
└── package-lock.json     # Lock de dependencias npm
```

---

## Propósito de Cada Archivo

### Archivos Core

- **`stt_server.py`**: Servidor Flask que captura audio, usa Vosk para transcribir y devuelve texto vía HTTP
- **`index.js`**: Cliente que consulta el STT, detecta palabra de activación y ejecuta comandos
- **`comandos.js`**: Define qué palabras activan qué acciones
- **`acciones.js`**: Implementa las funciones que se ejecutan (LED, hora, etc.)

### Scripts

- **`install.sh`**: Instala todo automáticamente (dependencias, modelo, servicios)
- **`verificar.sh`**: Verifica que todo esté instalado y funcionando correctamente

### Servicios

- **`stt.service`**: Inicia `stt_server.py` al arrancar el sistema
- **`topibot.service`**: Inicia `index.js` después de que `stt.service` esté listo

### Documentación

- **`README.md`**: Documentación principal, inicio rápido
- **`docs/GUIA_COMPLETA.md`**: Documentación extensa con todos los detalles

---

## Flujo de Ejecución

```
1. systemd inicia stt.service → stt_server.py
   ↓
2. Python carga modelo Vosk y espera conexiones HTTP en puerto 5005
   ↓
3. systemd inicia topibot.service → index.js
   ↓
4. Node.js se conecta a http://localhost:5005/listen
   ↓
5. Usuario habla al micrófono
   ↓
6. Python transcribe y envía texto a Node.js
   ↓
7. Node.js procesa (comandos.js)
   ↓
8. Si detecta "topibot", activa sistema
   ↓
9. Si hay comando válido, ejecuta acción (acciones.js)
```

---

## Archivos Generados (no en git)

Estos archivos se crean durante la instalación y no están en el repositorio:

```
model/                     # Modelo Vosk (~43 MB)
  ├── am/
  ├── conf/
  ├── graph/
  └── ivector/

node_modules/              # Dependencias npm (~30 MB)
  └── ...

*.wav                      # Archivos de prueba de audio
test.*                     # Archivos temporales de pruebas
```

---

## Notas

- **model/**: Vacío en el repositorio, el instalador descarga el modelo automáticamente
- **voz_led.js**: Script legacy que usa Vosk directamente en Node.js (no usado en producción)
- **.gitignore**: Configurado para excluir model/, node_modules/ y archivos temporales

---

**Documentación actualizada**: Diciembre 2025
