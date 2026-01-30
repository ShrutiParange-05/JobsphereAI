import cv2
import os
import logging

# Filter out TensorFlow/Abseil warnings
os.environ['TF_CPP_MIN_LOG_LEVEL'] = '3' 
os.environ['ABSL_LOG_LEVEL'] = 'error'

try:
    import tensorflow as tf
    # Hide GPU/Metal devices from TensorFlow to prevent conflicts with PyTorch/MPS
    # and avoid the "mutex.cc : 452" lock blocking error on macOS.
    tf.config.set_visible_devices([], 'GPU')
    print("✅ TensorFlow forced to CPU to avoid MPS conflict")
except Exception as e:
    pass

# from deepface import DeepFace

# Load face cascade classifier
face_cascade = cv2.CascadeClassifier(cv2.data.haarcascades + 'haarcascade_frontalface_default.xml')

def detect_emotion(frame):
    try:
        # Convert frame to grayscale
        gray_frame = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
        
        # Convert grayscale frame to RGB format
        rgb_frame = cv2.cvtColor(gray_frame, cv2.COLOR_GRAY2RGB)
        
        # Detect faces in the frame
        faces = face_cascade.detectMultiScale(gray_frame, scaleFactor=1.1, minNeighbors=5, minSize=(30, 30))
        
        detections = []
        for (x, y, w, h) in faces:
            # Extract the face ROI
            face_roi = rgb_frame[y:y + h, x:x + w]
            
            # Analyze emotion
            from deepface import DeepFace
            result = DeepFace.analyze(face_roi, actions=['emotion'], enforce_detection=False)
            emotion = result[0]['dominant_emotion']
            
            # Draw rectangle and emotion
            cv2.rectangle(frame, (x, y), (x + w, y + h), (0, 0, 255), 2)
            cv2.putText(frame, emotion, (x, y - 10), cv2.FONT_HERSHEY_SIMPLEX, 0.9, (0, 0, 255), 2)
            
            detections.append({
                "emotion": emotion,
                "x": (x + w/2) / frame.shape[1],
                "y": (y + h/2) / frame.shape[0]
            })
            
        return frame, detections
        
    except Exception as e:
        print(f"Error in detect_emotion: {str(e)}")
        return frame, []