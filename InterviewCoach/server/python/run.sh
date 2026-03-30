#!/bin/bash
# Run the Python video server with PyTorch forced to CPU
export PYTORCH_MPS_HIGH_WATERMARK_RATIO=0.0
export CUDA_VISIBLE_DEVICES=-1
export KMP_DUPLICATE_LIB_OK=True
export OMP_NUM_THREADS=1

echo "✅ PyTorch CPU-only mode enabled"
echo "🚀 Starting video server on port 6500..."
python3 app.py
