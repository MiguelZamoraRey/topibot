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
if command -v python3 &> /dev/null; then
    print_status "Python $(python3 --version) - Disponible ✓"
else
    print_error "Python 3 no está instalado"
    exit 1
fi

# Instalar dependencias del sistema
echo ""
echo "📦 Instalando dependencias del sistema..."
sudo apt update
sudo apt install -y portaudio19-dev python3-dev python3-venv alsa-utils

# Crear virtual environment
echo ""
echo "🐍 Creando entorno virtual Python..."
if [ -d "$PROJECT_DIR/venv" ]; then
    print_warning "Virtual environment ya existe, recreando..."
    rm -rf "$PROJECT_DIR/venv"
fi

python3 -m venv "$PROJECT_DIR/venv"
print_status "Virtual environment creado"

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

# Crear servicios temporales con rutas correctas
sed "s|/home/pi/topibot|$PROJECT_DIR|g; s|User=pi|User=$CURRENT_USER|g; s|/usr/bin/node|$NODE_PATH|g" "$PROJECT_DIR/stt.service" > /tmp/stt.service.tmp
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

# Preguntar si habilitar servicios
echo ""
read -p "¿Deseas habilitar los servicios para inicio automático? (s/n): " -n 1 -r
echo ""
if [[ $REPLY =~ ^[SsYy]$ ]]; then
    sudo systemctl enable stt.service
    sudo systemctl enable topibot.service
    print_status "Servicios habilitados para inicio automático"
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
