#!/bin/bash
# Script de instalación automatizada de TopiBot para Raspberry Pi 3 B+

set -e  # Salir si hay algún error

# Detectar directorio del proyecto
PROJECT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
USER_HOME="$HOME"
CURRENT_USER="$USER"

echo "╔══════════════════════════════════════════╗"
echo "║   🤖 INSTALADOR DE TOPIBOT 🤖           ║"
echo "╚══════════════════════════════════════════╝"
echo ""
echo "📁 Directorio del proyecto: $PROJECT_DIR"
echo "👤 Usuario: $CURRENT_USER"
echo ""

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Función para imprimir mensajes
print_status() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

# Detener servicios si están corriendo
echo "🧹 Limpieza previa..."
if systemctl is-active --quiet topibot.service 2>/dev/null; then
    print_warning "Servicio topibot.service detectado, deteniéndolo..."
    sudo systemctl stop topibot.service
fi

if systemctl is-active --quiet stt.service 2>/dev/null; then
    print_warning "Servicio stt.service detectado, deteniéndolo..."
    sudo systemctl stop stt.service
fi

# Limpiar procesos anteriores
if pgrep -f "stt_server.py" > /dev/null; then
    print_warning "Proceso stt_server.py detectado, terminándolo..."
    pkill -f "stt_server.py" || true
fi

if pgrep -f "topibot.*index.js" > /dev/null; then
    print_warning "Proceso index.js detectado, terminándolo..."
    pkill -f "topibot.*index.js" || true
fi

print_status "Limpieza completada"
echo ""

# Verificar que estamos en Raspberry Pi
if [ ! -f /proc/device-tree/model ]; then
    print_warning "No se detectó Raspberry Pi, pero continuando..."
else
    print_status "Raspberry Pi detectada: $(cat /proc/device-tree/model)"
fi

# Detectar y configurar Node.js (nvm o system)
echo ""
echo "🔍 Verificando Node.js..."

# Intentar cargar nvm
if [ -f "$USER_HOME/.nvm/nvm.sh" ]; then
    export NVM_DIR="$USER_HOME/.nvm"
    [ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
    
    if command -v nvm &> /dev/null; then
        print_status "nvm detectado"
        
        # Intentar usar Node.js 18
        if nvm ls 18 &> /dev/null; then
            nvm use 18 &> /dev/null
            print_status "Usando Node.js $(node -v) desde nvm"
        else
            print_warning "Node.js 18 no instalado en nvm, usando versión actual"
            nvm use node &> /dev/null
        fi
        
        NODE_PATH=$(which node)
        print_status "Ruta de Node.js: $NODE_PATH"
    fi
fi

# Verificar si Node.js está disponible
if command -v node &> /dev/null; then
    NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
    NODE_PATH=$(which node)
    
    if [ "$NODE_VERSION" -ge 16 ]; then
        print_status "Node.js $(node -v) - Compatible ✓"
    else
        print_error "Node.js $NODE_VERSION - Se requiere versión 16 o superior"
        echo "Opciones de instalación:"
        echo "  1. Con nvm: nvm install 18 && nvm use 18"
        echo "  2. Sistema: curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -"
        echo "             sudo apt install -y nodejs"
        exit 1
    fi
else
    print_error "Node.js no está instalado"
    echo "Instala Node.js 18 con nvm o desde el sistema"
    exit 1
fi

# Verificar Python
echo ""
echo "🔍 Verificando Python 3..."

# Buscar Python 3.8, 3.11 o 3.12 (evitar 3.13 por problemas con libvosk.so)
PYTHON_CMD=""
for py_version in python3.8 python3.11 python3.12 python3.10 python3.9 python3; do
    if command -v $py_version &> /dev/null; then
        PY_VER=$($py_version --version 2>&1 | grep -oP '\d+\.\d+' | head -1)
        PY_MAJOR=$(echo $PY_VER | cut -d. -f1)
        PY_MINOR=$(echo $PY_VER | cut -d. -f2)
        
        # Evitar Python 3.13 por incompatibilidad con libvosk.so
        if [ "$PY_MAJOR" -eq 3 ] && [ "$PY_MINOR" -lt 13 ]; then
            PYTHON_CMD=$py_version
            print_status "Python $PY_VER ($py_version) - Compatible ✓"
            break
        elif [ "$PY_MAJOR" -eq 3 ] && [ "$PY_MINOR" -ge 13 ]; then
            print_warning "Python $PY_VER tiene problemas con libvosk.so, buscando otra versión..."
        fi
    fi
done

if [ -z "$PYTHON_CMD" ]; then
    print_error "No se encontró una versión compatible de Python 3 (< 3.13)"
    print_warning "Python 3.13+ tiene problemas con libvosk.so"
    echo ""
    echo "Intentando instalar Python 3.11 con pyenv..."
    
    # Instalar pyenv si no está instalado
    if ! command -v pyenv &> /dev/null; then
        echo "📦 Instalando dependencias para compilar Python..."
        sudo apt install -y build-essential libssl-dev zlib1g-dev \
            libbz2-dev libreadline-dev libsqlite3-dev wget curl llvm \
            libncursesw5-dev xz-utils tk-dev libxml2-dev libxmlsec1-dev \
            libffi-dev liblzma-dev
        
        echo "📥 Instalando pyenv..."
        curl https://pyenv.run | bash
        
        export PYENV_ROOT="$HOME/.pyenv"
        export PATH="$PYENV_ROOT/bin:$PATH"
        eval "$(pyenv init -)"
        
        echo "📥 Instalando Python 3.11.9 con pyenv..."
        pyenv install 3.11.9
        pyenv local 3.11.9
        
        PYTHON_CMD="python3"
        print_status "Python 3.11.9 instalado con pyenv ✓"
    else
        print_error "Por favor instala Python 3.8-3.12 manualmente"
        exit 1
    fi
fi

# Instalar dependencias del sistema
echo ""
echo "📦 Instalando dependencias del sistema..."
sudo apt update
sudo apt install -y portaudio19-dev python3-dev python3-venv alsa-utils

# Intentar instalar Python 3.8-3.12 si están disponibles
for py_ver in 3.8 3.9 3.10 3.11 3.12; do
    sudo apt install -y python$py_ver python$py_ver-venv python$py_ver-dev 2>/dev/null || true
done

# Crear virtual environment
echo ""
echo "🐍 Creando entorno virtual Python con $PYTHON_CMD..."
if [ -d "$PROJECT_DIR/venv" ]; then
    print_warning "Virtual environment ya existe, recreando..."
    rm -rf "$PROJECT_DIR/venv"
fi

$PYTHON_CMD -m venv "$PROJECT_DIR/venv"
print_status "Virtual environment creado con $PYTHON_CMD"

# Instalar dependencias Python en venv
echo ""
echo "📦 Instalando dependencias Python en venv..."
"$PROJECT_DIR/venv/bin/pip" install --upgrade pip
"$PROJECT_DIR/venv/bin/pip" install vosk sounddevice flask

print_status "Dependencias Python instaladas en venv"

# Instalar dependencias Node.js
echo ""
echo "📦 Instalando dependencias Node.js..."
cd "$PROJECT_DIR"
npm install

print_status "Dependencias Node.js instaladas"

# Verificar modelo Vosk
echo ""
echo "🔍 Verificando modelo Vosk..."
if [ -d "$PROJECT_DIR/model/am" ] && [ -d "$PROJECT_DIR/model/conf" ]; then
    print_status "Modelo Vosk encontrado ✓"
else
    print_warning "Modelo Vosk NO encontrado"
    echo ""
    echo "📥 Descargando modelo Vosk español..."
    cd "$PROJECT_DIR"
    wget -q --show-progress https://alphacephei.com/vosk/models/vosk-model-small-es-0.42.zip
    
    echo "📦 Descomprimiendo modelo..."
    unzip -q vosk-model-small-es-0.42.zip
    
    echo "📁 Moviendo archivos..."
    mkdir -p model
    mv vosk-model-small-es-0.42/* model/
    
    echo "🧹 Limpiando archivos temporales..."
    rm -rf vosk-model-small-es-0.42*
    
    print_status "Modelo Vosk instalado correctamente"
fi

# Configurar dispositivo de audio
echo ""
echo "🎤 Configurando dispositivo de audio..."
if [ ! -f ~/.asoundrc ]; then
    echo "defaults.pcm.card 1" > ~/.asoundrc
    echo "defaults.ctl.card 1" >> ~/.asoundrc
    print_status "Configuración de audio creada"
else
    print_status "Configuración de audio ya existe"
fi

# Copiar servicios systemd
echo ""
echo "⚙️  Configurando servicios systemd..."

# Obtener la ruta del Python del venv
VENV_PYTHON="$PROJECT_DIR/venv/bin/python3"

# Crear servicios temporales con rutas correctas
sed "s|/home/pi/topibot|$PROJECT_DIR|g; s|User=pi|User=$CURRENT_USER|g; s|/usr/bin/node|$NODE_PATH|g; s|/usr/bin/python3.8|$VENV_PYTHON|g; s|ExecStart=/home/pi/topibot/venv/bin/python3|ExecStart=$VENV_PYTHON|g" "$PROJECT_DIR/stt.service" > /tmp/stt.service.tmp
sed "s|/home/pi/topibot|$PROJECT_DIR|g; s|User=pi|User=$CURRENT_USER|g; s|/usr/bin/node|$NODE_PATH|g" "$PROJECT_DIR/topibot.service" > /tmp/topibot.service.tmp

# Si usamos nvm, agregar configuración de entorno
if [ -f "$USER_HOME/.nvm/nvm.sh" ]; then
    # Agregar variables de entorno de nvm al servicio de Node.js
    sed -i "/\[Service\]/a Environment=\"NVM_DIR=$USER_HOME/.nvm\"" /tmp/topibot.service.tmp
fi

sudo cp /tmp/stt.service.tmp /etc/systemd/system/stt.service
sudo cp /tmp/topibot.service.tmp /etc/systemd/system/topibot.service

rm /tmp/stt.service.tmp /tmp/topibot.service.tmp

sudo systemctl daemon-reload

print_status "Servicios systemd configurados con Node.js: $NODE_PATH"

# Habilitar servicios para inicio automático
echo ""
echo "⚙️  Configurando inicio automático..."
read -p "¿Deseas que TopiBot se inicie automáticamente al arrancar? (S/n): " -n 1 -r
echo ""
if [[ ! $REPLY =~ ^[Nn]$ ]]; then
    sudo systemctl enable stt.service
    sudo systemctl enable topibot.service
    print_status "✅ Servicios habilitados - TopiBot arrancará automáticamente en cada reboot"
else
    print_warning "Servicios NO habilitados - Deberás iniciarlos manualmente"
    echo "   Para habilitarlos después: sudo systemctl enable stt.service topibot.service"
fi

# Preguntar si iniciar servicios ahora
echo ""
read -p "¿Deseas iniciar los servicios ahora? (s/n): " -n 1 -r
echo ""
if [[ $REPLY =~ ^[SsYy]$ ]]; then
    echo "🚀 Iniciando servidor STT..."
    sudo systemctl start stt.service
    sleep 3
    
    echo "🚀 Iniciando TopiBot..."
    sudo systemctl start topibot.service
    sleep 2
    
    print_status "Servicios iniciados"
    
    echo ""
    echo "📊 Estado de los servicios:"
    sudo systemctl status stt.service --no-pager -l | head -n 4
    echo ""
    sudo systemctl status topibot.service --no-pager -l | head -n 4
fi

# Resumen final
echo ""
echo "╔══════════════════════════════════════════╗"
echo "║   ✅ INSTALACIÓN COMPLETADA ✅          ║"
echo "╚══════════════════════════════════════════╝"
echo ""
echo "🎯 TopiBot está listo para usar"
echo ""
echo "📝 Comandos útiles:"
echo "  • Ver logs:    sudo journalctl -u topibot.service -f"
echo "  • Reiniciar:   sudo systemctl restart stt.service topibot.service"
echo "  • Verificar:   ./verificar.sh"
echo ""
echo "🎤 Palabra de activación: 'topibot'"
echo "💬 Ejemplo: Di 'topibot' → espera → 'encender'"
echo ""
echo "📖 Documentación completa: docs/GUIA_COMPLETA.md"
echo ""
print_status "¡Disfruta de TopiBot!"
