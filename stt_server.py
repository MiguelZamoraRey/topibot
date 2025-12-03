import json
import queue
import sounddevice as sd
from vosk import Model, KaldiRecognizer
from flask import Flask, jsonify
import sys
import os

app = Flask(__name__)

# Verificar que el modelo existe
model_path = "/home/pi/topibot/model"
if not os.path.exists(model_path):
    print(f"❌ ERROR: No se encuentra el modelo en {model_path}")
    print("💡 Descarga un modelo desde: https://alphacephei.com/vosk/models")
    sys.exit(1)

print(f"📦 Cargando modelo desde {model_path}...")
model = Model(model_path)
recognizer = KaldiRecognizer(model, 16000)
print("✅ Modelo cargado correctamente")

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
