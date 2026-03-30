import cv2
import os
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Load face cascade classifier (pure OpenCV, no TensorFlow needed)
face_cascade = cv2.CascadeClassifier(cv2.data.haarcascades + 'haarcascade_frontalface_default.xml')

def detect_emotion(frame):
    """
    Detect faces using OpenCV's Haar cascade (no TensorFlow/DeepFace).
    Returns frame with face rectangles drawn and basic detection info.
    """
    try:
        gray_frame = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
        
        faces = face_cascade.detectMultiScale(
            gray_frame, 
            scaleFactor=1.1, 
            minNeighbors=5, 
            minSize=(30, 30)
        )
        
        detections = []
        for (x, y, w, h) in faces:
            # Draw rectangle around face
            cv2.rectangle(frame, (x, y), (x + w, y + h), (0, 200, 255), 2)
            cv2.putText(frame, "Face Detected", (x, y - 10), 
                       cv2.FONT_HERSHEY_SIMPLEX, 0.7, (0, 200, 255), 2)
            
            detections.append({
                "emotion": "detected",
                "x": (x + w/2) / frame.shape[1],
                "y": (y + h/2) / frame.shape[0]
            })
            
        return frame, detections
        
    except Exception as e:
        logger.error(f"Error in detect_emotion: {str(e)}")
        return frame, []