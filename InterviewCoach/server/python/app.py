import os
import sys
import threading
import logging
from datetime import datetime

from flask import Flask, Response, jsonify
from flask_cors import CORS
import cv2

# Load .env
from dotenv import load_dotenv
load_dotenv(os.path.join(os.path.dirname(__file__), '..', '.env'))

from facemotion import detect_emotion
from person_and_phone import detect_phone_and_person

# ─── Logging ─────────────────────────────────────────────────────────────────
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# ─── Flask App ────────────────────────────────────────────────────────────────
app = Flask(__name__)
CORS(app, supports_credentials=True, origins=["http://localhost:5173", "http://localhost:3000"])

# ─── Shared State ─────────────────────────────────────────────────────────────
total_frames = 0
phone_detection_count = 0
analysis_history = []

def get_camera():
    camera = cv2.VideoCapture(0)
    if not camera.isOpened():
        raise RuntimeError("Could not initialise camera")
    return camera

# ─── Video Feed Generator ────────────────────────────────────────────────────
def webcam_feed():
    global total_frames, phone_detection_count
    camera = None

    try:
        camera = get_camera()
        while True:
            ok, frame = camera.read()
            if not ok:
                logger.error("Failed to grab frame")
                break
            
            total_frames += 1

            # 1. Detect Phone & Person locally via OpenCV YOLOv4-tiny
            processed, obj_detections = detect_phone_and_person(frame.copy())
            
            phone_detected = any(d['type'] == 'Phone' for d in obj_detections)
            if phone_detected:
                phone_detection_count += 1
                
                # Massive red border and alert
                h, w = processed.shape[:2]
                cv2.rectangle(processed, (0, 0), (w, h), (0, 0, 255), 10)
                cv2.putText(processed, "WARNING: MOBILE PHONE DETECTED", (50, 60),
                            cv2.FONT_HERSHEY_DUPLEX, 1.0, (0, 0, 255), 3)

            # 2. Extract Emotion via OpenCV Haarcascade
            processed, face_detections = detect_emotion(processed)
            emotion = face_detections[0].get('emotion', 'detected').upper() if face_detections else 'UNKNOWN'

            # 3. Translucent panel for stats
            h, w = processed.shape[:2]
            overlay = processed.copy()
            cv2.rectangle(overlay, (15, h - 120), (350, h - 15), (0, 0, 0), -1)
            cv2.addWeighted(overlay, 0.7, processed, 0.3, 0, processed)

            y0, dy = h - 85, 35
            # Emotion overlay
            cv2.putText(processed, f"EMOTION: {emotion}", (30, y0),
                        cv2.FONT_HERSHEY_DUPLEX, 0.8, (0, 255, 255), 2)
            
            # Posture overlay (Placeholder for local processing)
            cv2.putText(processed, f"POSTURE: OK", (30, y0 + dy),
                        cv2.FONT_HERSHEY_DUPLEX, 0.8, (200, 200, 200), 2)

            # Timestamp
            ts = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
            cv2.putText(processed, ts, (10, 30),
                        cv2.FONT_HERSHEY_SIMPLEX, 0.7, (0, 255, 0), 2)

            ret, buf = cv2.imencode('.jpg', processed)
            if not ret:
                break

            yield (b'--frame\r\n'
                   b'Content-Type: image/jpeg\r\n\r\n' + buf.tobytes() + b'\r\n')

    except Exception as e:
        logger.error(f"webcam_feed error: {e}")
        yield b''
    finally:
        if camera is not None:
            camera.release()

# ─── Routes ───────────────────────────────────────────────────────────────────
@app.route('/video_feed1')
def video_feed1():
    logger.info("📹 Video-feed requested")
    try:
        return Response(webcam_feed(), mimetype='multipart/x-mixed-replace; boundary=frame')
    except Exception as e:
        logger.error(f"video_feed1 error: {e}")
        return jsonify({"error": str(e)}), 500

@app.route('/api/test', methods=['GET'])
def test_endpoint():
    try:
        cam = get_camera()
        cam.release()
        cam_status = "Camera is accessible"
    except Exception as e:
        cam_status = f"Camera error: {e}"

    return jsonify({
        "status": "Server is running (Local AI)",
        "camera": cam_status,
        "timestamp": datetime.now().isoformat(),
    })

@app.route('/api/detection-counts', methods=['GET'])
def get_detection_counts():
    return jsonify({
        "total_frames": total_frames,
        "phone_detections": phone_detection_count,
        "timestamp": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
    })

if __name__ == '__main__':
    logger.info("🚀 Starting Crash-Free Saarthi AI Video Server on port 6500")
    app.run(threaded=True, host="0.0.0.0", port=6500, debug=False, use_reloader=False)