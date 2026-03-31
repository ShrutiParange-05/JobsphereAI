import cv2
import numpy as np
import os
import urllib.request
import logging

logger = logging.getLogger(__name__)

# YOLOv4-tiny paths
MODEL_DIR = os.path.dirname(os.path.abspath(__file__))
WEIGHTS_PATH = os.path.join(MODEL_DIR, "yolov4-tiny.weights")
CFG_PATH = os.path.join(MODEL_DIR, "yolov4-tiny.cfg")
NAMES_PATH = os.path.join(MODEL_DIR, "coco.names")

def download_file(url, filename):
    if not os.path.exists(filename):
        logger.info(f"Downloading {filename}...")
        try:
            urllib.request.urlretrieve(url, filename)
            logger.info(f"Downloaded {filename}")
        except Exception as e:
            logger.error(f"Failed to download {filename}: {e}")

# Download YOLOv4-tiny files if they don't exist
download_file("https://github.com/AlexeyAB/darknet/releases/download/darknet_yolo_v4_pre/yolov4-tiny.weights", WEIGHTS_PATH)
download_file("https://raw.githubusercontent.com/AlexeyAB/darknet/master/cfg/yolov4-tiny.cfg", CFG_PATH)
download_file("https://raw.githubusercontent.com/pjreddie/darknet/master/data/coco.names", NAMES_PATH)

_net = None
_classes = []

def get_net():
    global _net, _classes
    if _net is None:
        try:
            if os.path.exists(WEIGHTS_PATH) and os.path.exists(CFG_PATH):
                _net = cv2.dnn.readNet(WEIGHTS_PATH, CFG_PATH)
                with open(NAMES_PATH, "r") as f:
                    _classes = [line.strip() for line in f.readlines()]
                logger.info("✅ YOLOv4-tiny MobileNet model loaded into OpenCV successfully")
            else:
                logger.error("YOLOv4-tiny files missing.")
        except Exception as e:
            logger.error(f"Error loading YOLO: {e}")
    return _net

def detect_phone_and_person(frame, conf_threshold=0.3):
    """
    Detects 'person' and 'cell phone' using OpenCV DNN with YOLOv4-tiny.
    This runs entirely on CPU with zero PyTorch crashes or API Rate Limits!
    """
    try:
        net = get_net()
        if net is None:
            return frame, []

        height, width = frame.shape[:2]
        blob = cv2.dnn.blobFromImage(frame, 1/255.0, (416, 416), swapRB=True, crop=False)
        net.setInput(blob)
        
        layer_names = net.getLayerNames()
        output_layers = [layer_names[i - 1] for i in net.getUnconnectedOutLayers()]
        
        outs = net.forward(output_layers)

        class_ids = []
        confidences = []
        boxes = []

        for out in outs:
            for detection in out:
                scores = detection[5:]
                class_id = np.argmax(scores)
                confidence = float(scores[class_id])
                
                # Check for "person" (class 0) and "cell phone" (class 67)
                if confidence > conf_threshold and class_id in [0, 67]:
                    if class_id < len(_classes):
                        label = "Phone" if class_id == 67 else "Person"
                        
                        center_x = int(detection[0] * width)
                        center_y = int(detection[1] * height)
                        w = int(detection[2] * width)
                        h = int(detection[3] * height)
                        
                        x = int(center_x - w / 2)
                        y = int(center_y - h / 2)
                        
                        boxes.append([x, y, w, h])
                        confidences.append(confidence)
                        class_ids.append(class_id)

        # Apply Non-Max Suppression
        indices = cv2.dnn.NMSBoxes(boxes, confidences, conf_threshold, 0.4)
        
        detections = []
        if len(indices) > 0:
            for i in indices.flatten():
                x, y, w, h = boxes[i]
                label = "Phone" if class_ids[i] == 67 else "Person"
                confidence = confidences[i]
                
                # Colors: Red for Phone, Green for Person
                color = (0, 0, 255) if label == "Phone" else (0, 255, 0)
                
                # Draw thicker boxes
                cv2.rectangle(frame, (x, y), (x + w, y + h), color, 3)
                cv2.putText(frame, f"{label} {confidence:.2f}", (x, y - 10),
                            cv2.FONT_HERSHEY_DUPLEX, 0.7, color, 2)
                            
                detections.append({
                    "type": label,
                    "x": (x + w/2) / width,
                    "y": (y + h/2) / height,
                    "confidence": confidence
                })

        return frame, detections

    except Exception as e:
        logger.error(f"detect_phone_and_person error: {e}")
        return frame, []