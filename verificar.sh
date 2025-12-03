#!/bin/bash
# Script de verificación rápida del sistema TopiBot

# Detectar directorio del proyecto
PROJECT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

echo "╔══════════════════════════════════════════╗"
echo "║   🔍 VERIFICACIÓN TOPIBOT 🔍            ║"
echo "╚══════════════════════════════════════════╝"
echo ""
echo "📁 Directorio del proyecto: $PROJECT_DIR"
echo ""

# Colores
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Contadores
PASSED=0
FAILED=0

check_pass() {
    echo -e "${GREEN}✅ $1${NC}"
    ((PASSED++))
}

check_fail() {
    echo -e "${RED}❌ $1${NC}"
    ((FAILED++))
}

check_warn() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

echo "1️⃣  Verificando Node.js..."
if command -v node &> /dev/null; then
    NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
    if [ "$NODE_VERSION" -ge 16 ]; then
        check_pass "Node.js $(node -v) - Compatible"
    else
        check_fail "Node.js v$NODE_VERSION - Requiere v16+"
    fi
else
    check_fail "Node.js no instalado"
fi

echo ""
echo "2️⃣  Verificando Python 3..."
if command -v python3 &> /dev/null; then
    check_pass "Python $(python3 --version 2>&1 | cut -d' ' -f2) - Disponible"
else
    check_fail "Python 3 no instalado"
fi

echo ""
echo "3️⃣  Verificando virtual environment..."
if [ -d "$PROJECT_DIR/venv" ]; then
    check_pass "Virtual environment existe"
else
    check_fail "Virtual environment no existe - ejecuta ./install.sh"
fi

echo ""
echo "4️⃣  Verificando paquetes Python en venv..."
if [ -f "$PROJECT_DIR/venv/bin/pip" ]; then
    if "$PROJECT_DIR/venv/bin/pip" list 2>/dev/null | grep -q "vosk"; then
        check_pass "vosk instalado en venv"
    else
        check_fail "vosk no instalado - ejecuta ./install.sh"
    fi

    if "$PROJECT_DIR/venv/bin/pip" list 2>/dev/null | grep -q "sounddevice"; then
        check_pass "sounddevice instalado en venv"
    else
        check_fail "sounddevice no instalado - ejecuta ./install.sh"
    fi

    if "$PROJECT_DIR/venv/bin/pip" list 2>/dev/null | grep -q "Flask"; then
        check_pass "flask instalado en venv"
    else
        check_fail "flask no instalado - ejecuta ./install.sh"
    fi
else
    check_fail "Virtual environment no configurado correctamente"
fi

echo ""
echo "5️⃣  Verificando paquetes Node.js..."
cd "$PROJECT_DIR"

if [ -f "package.json" ]; then
    if npm list axios &>/dev/null; then
        check_pass "axios instalado"
    else
        check_fail "axios no instalado - npm install axios"
    fi
else
    check_warn "package.json no encontrado"
fi

echo ""
echo "6️⃣  Verificando archivos del proyecto..."
FILES=("stt_server.py" "index.js" "comandos.js" "acciones.js" "package.json")
for file in "${FILES[@]}"; do
    if [ -f "$PROJECT_DIR/$file" ]; then
        check_pass "$file existe"
    else
        check_fail "$file no encontrado"
    fi
done

echo ""
echo "7️⃣  Verificando modelo Vosk..."
if [ -d "$PROJECT_DIR/model/am" ] && [ -d "$PROJECT_DIR/model/conf" ]; then
    check_pass "Modelo Vosk instalado en model/"
else
    check_fail "Modelo Vosk no encontrado en model/"
    echo "   💡 Descarga desde: https://alphacephei.com/vosk/models"
fi

echo ""
echo "8️⃣  Verificando servicios systemd..."
if [ -f "/etc/systemd/system/stt.service" ]; then
    check_pass "stt.service instalado"
else
    check_warn "stt.service no instalado en systemd"
fi

if [ -f "/etc/systemd/system/topibot.service" ]; then
    check_pass "topibot.service instalado"
else
    check_warn "topibot.service no instalado en systemd"
fi

echo ""
echo "9️⃣  Verificando dispositivo de audio..."
if command -v arecord &> /dev/null; then
    if arecord -l 2>/dev/null | grep -q "card"; then
        check_pass "Dispositivo de audio detectado"
        arecord -l | grep "card" | head -n 2
    else
        check_warn "No se detectaron dispositivos de audio"
    fi
else
    check_warn "alsa-utils no instalado - sudo apt install alsa-utils"
fi

echo ""
echo "🔟 Verificando memoria disponible..."
if command -v free &> /dev/null; then
    FREE_RAM=$(free -m | awk '/^Mem:/{print $4}')
    if [ "$FREE_RAM" -gt 200 ]; then
        check_pass "RAM libre: ${FREE_RAM} MB - Suficiente"
    else
        check_warn "RAM libre: ${FREE_RAM} MB - Ajustado (mínimo 200 MB)"
    fi
else
    check_warn "Comando 'free' no disponible"
fi

echo ""
echo "1️⃣1️⃣  Verificando estado de servicios..."
if systemctl is-active --quiet stt.service; then
    check_pass "stt.service está corriendo"
else
    check_warn "stt.service no está corriendo"
    echo "   💡 Inicia con: sudo systemctl start stt.service"
fi

if systemctl is-active --quiet topibot.service; then
    check_pass "topibot.service está corriendo"
else
    check_warn "topibot.service no está corriendo"
    echo "   💡 Inicia con: sudo systemctl start topibot.service"
fi

echo ""
echo "════════════════════════════════════════════"
echo " RESUMEN"
echo "════════════════════════════════════════════"
echo -e "${GREEN}✅ Verificaciones pasadas: $PASSED${NC}"
echo -e "${RED}❌ Verificaciones fallidas: $FAILED${NC}"
echo ""

if [ $FAILED -eq 0 ]; then
    echo -e "${GREEN}🎉 ¡Sistema listo para usar!${NC}"
    echo ""
    echo "Próximos pasos:"
    echo "  1. Inicia los servicios: sudo systemctl start stt.service topibot.service"
    echo "  2. Prueba diciendo: 'topibot' + 'encender'"
    echo "  3. Ver logs: sudo journalctl -u topibot.service -f"
    echo ""
    echo "📖 Documentación: docs/GUIA_COMPLETA.md"
    exit 0
else
    echo -e "${RED}⚠️  Hay problemas que corregir${NC}"
    echo ""
    echo "Consulta:"
    echo "  • docs/GUIA_COMPLETA.md - Documentación completa"
    echo "  • O ejecuta: ./install.sh"
    exit 1
fi
