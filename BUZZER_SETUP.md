# 🔊 Configuración del Buzzer

## Tipos de Buzzer

Existen dos tipos principales de buzzers:

### 1. **Buzzer Activo** (Active Buzzer)
- ✅ Tiene un oscilador interno
- ✅ Solo necesita voltaje ON/OFF (3.3V o 5V)
- ✅ Emite un tono fijo cuando se le aplica voltaje
- ✅ Suele tener una etiqueta o componentes visibles en la parte inferior
- ✅ **TopiBot lo detecta automáticamente** (fallback)

### 2. **Buzzer Pasivo** (Passive Buzzer)
- 🔧 **Necesita señal PWM** (modulación de ancho de pulso)
- 🔧 Puede generar diferentes frecuencias
- 🔧 Es básicamente un disco piezoeléctrico
- 🔧 No suena con solo aplicarle voltaje constante
- 🔧 **TopiBot lo soporta con la librería `pigpio`**

---

## 🔌 Conexión del Hardware

```
Raspberry Pi GPIO:

GPIO 17 (Pin 11)  →  Resistor 220-330Ω  →  LED (+)  →  LED (-)  →  GND (Pin 9)
GPIO 22 (Pin 15)  →  Buzzer (+)
                     Buzzer (-)  →  GND (compartido con LED)
```

**Notas importantes:**
- Conecta todos los GND al mismo rail negativo
- El buzzer puede ir a 3.3V (GPIO) o 5V (con transistor si necesita más corriente)
- Verifica la polaridad del buzzer (+ y -)

---

## 📦 Instalación para Buzzer Pasivo

Si tu buzzer **NO suena** con el control simple, es un buzzer pasivo y necesitas PWM:

```bash
# 1. Instalar dependencias del sistema
sudo apt update
sudo apt install pigpio -y

# 2. Instalar librería Node.js en el directorio del proyecto
cd ~/topibot  # O donde tengas el proyecto
npm install pigpio

# 3. Reiniciar TopiBot
sudo systemctl restart topibot.service

# 4. Verificar logs
sudo journalctl -u topibot.service -f
```

Deberías ver en los logs:
```
✅ GPIO inicializado - LED en GPIO 17, Buzzer PWM en GPIO 22
```

Si ves:
```
✅ GPIO inicializado - LED en GPIO 17, Buzzer simple en GPIO 22
```

Significa que está usando el fallback (buzzer activo o `pigpio` no disponible).

---

## 🧪 Probar el Buzzer

### Prueba Rápida con Python (ambos tipos)

```bash
# Crear script de prueba
cat > /tmp/test_buzzer.py << 'EOF'
import RPi.GPIO as GPIO
import time

BUZZER = 22
GPIO.setmode(GPIO.BCM)
GPIO.setup(BUZZER, GPIO.OUT)

# Crear PWM a 2000Hz (para buzzer pasivo)
pwm = GPIO.PWM(BUZZER, 2000)
pwm.start(50)  # 50% duty cycle

print("🔊 Sonando durante 1 segundo...")
time.sleep(1)

pwm.stop()
GPIO.cleanup()
print("✅ Test completado")
EOF

# Ejecutar
sudo python3 /tmp/test_buzzer.py
```

**¿Suena?**
- ✅ **SÍ** → Tienes un buzzer pasivo → Instala `pigpio`
- ❌ **NO** → Puede ser:
  - Buzzer roto
  - Polaridad invertida (prueba al revés)
  - Necesita 5V en lugar de 3.3V

### Prueba con TopiBot

```bash
# Método 1: Usando testibot
cd ~/topibot
sudo ./testibot.js "topibot" "hola"

# Método 2: Hablando por el micrófono
# Di: "topibot"
# Deberías escuchar: Beep-beep 🔊
```

---

## 🔧 Solución de Problemas

### El buzzer no suena

1. **Verifica la conexión física:**
   ```bash
   # Ver estado del pin GPIO 22
   sudo gpioget gpiochip0 22
   ```

2. **Prueba invertir la polaridad:**
   - Intercambia los cables + y - del buzzer

3. **Prueba con voltaje constante (buzzer activo):**
   ```bash
   # Encender
   sudo gpioset gpiochip0 22=1
   sleep 1
   # Apagar
   sudo gpioset gpiochip0 22=0
   ```
   - Si suena → Buzzer activo (funciona sin `pigpio`)
   - Si NO suena → Buzzer pasivo (necesita PWM)

4. **Verifica que pigpio esté instalado:**
   ```bash
   # Verificar daemon
   sudo systemctl status pigpiod
   
   # Si no está activo, iniciarlo
   sudo systemctl enable pigpiod
   sudo systemctl start pigpiod
   ```

5. **Mira los logs de TopiBot:**
   ```bash
   sudo journalctl -u topibot.service -n 50
   ```

### El LED funciona pero el buzzer no

- El LED funciona con control simple ON/OFF
- El buzzer pasivo **requiere PWM obligatoriamente**
- Instala `pigpio` según las instrucciones arriba

### Error: "Device or resource busy"

- Ya solucionado en TopiBot
- Ahora usa GPIO 22 en lugar de GPIO 27
- Si persiste, verifica que no haya otros procesos usando el pin:
  ```bash
  sudo pkill -9 gpioset
  sudo pkill -9 pigpiod
  sudo systemctl restart pigpiod
  ```

---

## 🎵 Configuración Avanzada

### Cambiar frecuencia del buzzer

Edita `acciones.js`:
```javascript
const BUZZER_FREQUENCY = 2000; // Cambia esta línea (Hz)
```

Frecuencias comunes:
- 1000Hz - Tono grave
- 2000Hz - Tono medio (predeterminado)
- 3000Hz - Tono agudo

### Cambiar duración de los beeps

Busca en `acciones.js`:
```javascript
buzzerPwm.pwmWrite(128);  // Encender
setTimeout(() => {
  buzzerPwm.pwmWrite(0);   // Apagar
}, 150);  // ← Duración en milisegundos
```

---

## 📚 Referencias

- [pigpio Library](http://abyz.me.uk/rpi/pigpio/)
- [GPIO Pinout](https://pinout.xyz/)
- [Active vs Passive Buzzer](https://www.best-microcontroller-projects.com/active-vs-passive-buzzer.html)

---

**¿Tienes problemas?** Abre un issue en el repositorio con:
- Tipo de buzzer (activo/pasivo)
- Salida de `sudo journalctl -u topibot.service -n 50`
- Resultado del test de Python
