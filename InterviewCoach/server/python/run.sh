#!/bin/bash
# Saarthi AI Video Analysis Server
# Powered by Gemini Vision API — no PyTorch required

echo "════════════════════════════════════════════"
echo "  🧠 Saarthi AI — Gemini Vision Server"
echo "════════════════════════════════════════════"
echo ""
echo "✅ No PyTorch / YOLO — macOS-safe"
echo "🚀 Starting video server on port 6500..."
echo ""

# Use the jobsphereai conda environment python
CONDA_PYTHON="/opt/homebrew/anaconda3/envs/jobsphereai/bin/python"

if [ -f "$CONDA_PYTHON" ]; then
    $CONDA_PYTHON app.py
else
    echo "⚠️  Conda env not found, trying system python..."
    python3 app.py
fi
