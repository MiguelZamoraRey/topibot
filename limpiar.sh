#!/bin/bash
# Script para limpiar instalación de TopiBot

set -e

PROJECT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

echo "╔══════════════════════════════════════════╗"
echo "║   🧹 LIMPIEZA DE TOPIBOT 🧹             ║"
echo "╚══════════════════════════════════════════╝"
echo ""
echo "📁 Directorio del proyecto: $PROJECT_DIR"
echo ""
echo "Este script limpia la instalación de TopiBot."
echo "Nota: ./install.sh ya hace limpieza automáticamente."
echo ""

# Colores
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

print_status() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

# Confirmar
read -p "⚠️  Esto eliminará servicios, venv y configuración. ¿Continuar? (s/N): " -n 1 -r
echo ""
if [[ ! $REPLY =~ ^[SsYy]$ ]]; then
    echo "Operación cancelada"
    exit 0
fi

echo ""
echo "🛑 Deteniendo servicios..."
if systemctl is-active --quiet topibot.service 2>/dev/null; then
    sudo systemctl stop topibot.service
    print_status "topibot.service detenido"
fi

if systemctl is-active --quiet stt.service 2>/dev/null; then
    sudo systemctl stop stt.service
    print_status "stt.service detenido"
fi

echo ""
echo "🗑️  Deshabilitando servicios..."
if systemctl is-enabled --quiet topibot.service 2>/dev/null; then
    sudo systemctl disable topibot.service
    print_status "topibot.service deshabilitado"
fi

if systemctl is-enabled --quiet stt.service 2>/dev/null; then
    sudo systemctl disable stt.service
    print_status "stt.service deshabilitado"
fi

echo ""
echo "📝 Eliminando archivos de servicio..."
if [ -f /etc/systemd/system/topibot.service ]; then
    sudo rm /etc/systemd/system/topibot.service
    print_status "topibot.service eliminado"
fi

if [ -f /etc/systemd/system/stt.service ]; then
    sudo rm /etc/systemd/system/stt.service
    print_status "stt.service eliminado"
fi

sudo systemctl daemon-reload
print_status "Daemon recargado"

echo ""
echo "🐍 Eliminando virtual environment..."
if [ -d "$PROJECT_DIR/venv" ]; then
    rm -rf "$PROJECT_DIR/venv"
    print_status "venv eliminado"
else
    print_warning "venv no encontrado"
fi

echo ""
echo "🧹 Matando procesos residuales..."
pkill -f "stt_server.py" 2>/dev/null || true
pkill -f "topibot.*index.js" 2>/dev/null || true
print_status "Procesos eliminados"

echo ""
echo "╔══════════════════════════════════════════╗"
echo "║   ✅ LIMPIEZA COMPLETADA ✅             ║"
echo "╚══════════════════════════════════════════╝"
echo ""
echo "Para reinstalar ejecuta: ./install.sh"
echo ""
