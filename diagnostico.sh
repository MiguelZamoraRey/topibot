#!/bin/bash
# Script de diagnóstico para TopiBot

echo "╔══════════════════════════════════════════╗"
echo "║   🔍 DIAGNÓSTICO TOPIBOT 🔍             ║"
echo "╚══════════════════════════════════════════╝"
echo ""

# Colores
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

print_ok() { echo -e "${GREEN}✅ $1${NC}"; }
print_err() { echo -e "${RED}❌ $1${NC}"; }
print_warn() { echo -e "${YELLOW}⚠️  $1${NC}"; }

PROJECT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

echo "📁 Directorio: $PROJECT_DIR"
echo ""

# 1. Verificar Python
echo "🐍 Python:"
if [ -f "$PROJECT_DIR/venv/bin/python3" ]; then
    PYTHON_VER=$("$PROJECT_DIR/venv/bin/python3" --version)
    print_ok "venv Python: $PYTHON_VER"
else
    print_err "venv no encontrado"
fi

# 2. Verificar dependencias Python
echo ""
echo "📦 Dependencias Python:"
if [ -f "$PROJECT_DIR/venv/bin/pip" ]; then
    "$PROJECT_DIR/venv/bin/pip" list | grep -E "vosk|flask|sounddevice" || print_warn "Algunas dependencias faltan"
else
    print_err "pip no encontrado en venv"
fi

# 3. Verificar modelo Vosk
echo ""
echo "🎤 Modelo Vosk:"
if [ -d "$PROJECT_DIR/model" ]; then
    if [ -f "$PROJECT_DIR/model/am/final.mdl" ]; then
        print_ok "Modelo encontrado"
    else
        print_err "Modelo incompleto"
    fi
else
    print_err "Carpeta model/ no existe"
fi

# 4. Verificar Node.js
echo ""
echo "📦 Node.js:"
if command -v node &> /dev/null; then
    print_ok "Node.js $(node -v)"
    if [ -d "$PROJECT_DIR/node_modules" ]; then
        print_ok "node_modules existe"
    else
        print_warn "node_modules no existe"
    fi
else
    print_err "Node.js no instalado"
fi

# 5. Estado de servicios
echo ""
echo "⚙️  Servicios:"
if systemctl is-active --quiet stt.service; then
    print_ok "stt.service activo"
else
    print_err "stt.service inactivo"
fi

if systemctl is-active --quiet topibot.service; then
    print_ok "topibot.service activo"
else
    print_err "topibot.service inactivo"
fi

# 6. Puerto 5005
echo ""
echo "🌐 Puerto 5005:"
if sudo lsof -i :5005 &> /dev/null; then
    print_ok "Puerto 5005 en uso"
    sudo lsof -i :5005
else
    print_err "Puerto 5005 libre (servidor STT no está escuchando)"
fi

# 7. Probar servidor STT manualmente
echo ""
echo "🧪 Prueba manual del servidor STT:"
echo "Ejecuta esto manualmente para ver el error:"
echo "  cd $PROJECT_DIR"
echo "  $PROJECT_DIR/venv/bin/python3 stt_server.py"
echo ""

# 8. Últimos logs
echo "📋 Últimos logs de stt.service:"
sudo journalctl -u stt.service -n 10 --no-pager

echo ""
echo "╔══════════════════════════════════════════╗"
echo "║   FIN DEL DIAGNÓSTICO                    ║"
echo "╚══════════════════════════════════════════╝"
