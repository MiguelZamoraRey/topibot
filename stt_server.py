import json
import queue
import sounddevice as sd
from vosk import Model, KaldiRecognizer
from flask import Flask, jsonify
import sys
import os

app = Flask(__name__)

# Obtener el directorio del script
script_dir = os.path.dirname(os.path.abspath(__file__))
model_path = os.path.join(script_dir, "model")

# Verificar que el modelo existe
if not os.path.exists(model_path):
    print(f"❌ ERROR: No se encuentra el modelo en {model_path}", file=sys.stderr)
    print(f"💡 Directorio actual: {script_dir}", file=sys.stderr)
    print("💡 Descarga un modelo desde: https://alphacephei.com/vosk/models", file=sys.stderr)
    sys.exit(1)

print(f"📦 Cargando modelo desde {model_path}...")
try:
    model = Model(model_path)
    recognizer = KaldiRecognizer(model, 16000)
    print("✅ Modelo cargado correctamente")
except Exception as e:
    print(f"❌ ERROR al cargar modelo Vosk: {e}", file=sys.stderr)
    print(f"💡 Path del modelo: {model_path}", file=sys.stderr)
    sys.exit(1)

# Detectar micrófono USB automáticamente
def find_usb_microphone():
    """Encuentra el primer micrófono USB disponible"""
    devices = sd.query_devices()
    print("\n🎤 Dispositivos de audio disponibles:")
    for i, device in enumerate(devices):
        print(f"  [{i}] {device['name']} - In: {device['max_input_channels']}, Out: {device['max_output_channels']}")
    
    # Buscar dispositivo USB con entrada
    for i, device in enumerate(devices):
        name = device['name'].lower()
        if device['max_input_channels'] > 0 and ('usb' in name or 'pnp' in name):
            print(f"\n✅ Micrófono USB detectado: [{i}] {device['name']}")
            return i
    
    # Si no encuentra USB, usar el primer dispositivo con entrada
    for i, device in enumerate(devices):
        if device['max_input_channels'] > 0:
            print(f"\n⚠️  Usando primer dispositivo con entrada: [{i}] {device['name']}")
            return i
    
    print("\n❌ ERROR: No se encontró ningún dispositivo de entrada de audio")
    return None

# Detectar dispositivo de audio
audio_device = find_usb_microphone()
if audio_device is None:
    sys.exit(1)

q = queue.Queue()

def callback(indata, frames, time, status):
    q.put(bytes(indata))

@app.route("/listen", methods=["GET"])
def listen():
    recognizer.Reset()
    try:
        with sd.RawInputStream(
            samplerate=16000,
            blocksize=8000,
            dtype="int16",
            channels=1,
            callback=callback,
            device=audio_device,  # Usar el dispositivo detectado
        ):
            print("⏺ Escuchando…")
            while True:
                data = q.get()
                if recognizer.AcceptWaveform(data):
                    result = json.loads(recognizer.Result())
                    if result.get("text", "").strip():
                        print(f"✅ Reconocido: {result['text']}")
                        return jsonify(result)
    except Exception as e:
        print(f"❌ Error en captura de audio: {e}")
        return jsonify({"text": "", "error": str(e)})

if __name__ == "__main__":
    print("Servidor Vosk STT iniciado en puerto 5005")
    app.run(host="0.0.0.0", port=5005, debug=False)
