#!/usr/bin/env bash
set -e

# CodeChamp Model Sideload Script
# Pushes Qwen2.5-Coder-1.5B-Instruct-Q4_K_M GGUF to the connected Android device
# Usage: ./scripts/sideload-model.sh [path-to-gguf-file]

ADB="${ADB:-$HOME/Library/Android/sdk/platform-tools/adb}"
PACKAGE="com.codechamp.app"
DEST_FILENAME="qwen2.5-coder-1.5b-instruct-q4_k_m.gguf"
MODEL_PATH="${1:-}"

if [ ! -x "$ADB" ]; then
  if command -v adb >/dev/null 2>&1; then
    ADB="adb"
  else
    echo "❌ adb not found. Please ensure Android SDK platform-tools is installed or ADB is in your PATH."
    exit 1
  fi
fi

DEVICE_COUNT=$("$ADB" devices | grep -v "List" | grep -v "^$" | grep -c "device" || true)
if [ "$DEVICE_COUNT" -eq 0 ]; then
  echo "❌ No Android device connected over adb. Connect your phone via USB with USB debugging enabled, or start an emulator."
  exit 1
fi

echo "📱 Connected device found."

if [ -z "$MODEL_PATH" ]; then
  # Check if model exists locally in project cache or downloads
  CANDIDATE_PATHS=(
    "$HOME/Downloads/$DEST_FILENAME"
    "$HOME/Downloads/qwen2.5-coder-1.5b-instruct-q4_k_m.gguf"
    "./models/$DEST_FILENAME"
    "$HOME/.cache/$DEST_FILENAME"
  )
  for c in "${CANDIDATE_PATHS[@]}"; do
    if [ -f "$c" ]; then
      MODEL_PATH="$c"
      break
    fi
  done
fi

if [ -z "$MODEL_PATH" ] || [ ! -f "$MODEL_PATH" ]; then
  echo "⚠️ Model file not found locally."
  echo "Please download the GGUF model first or pass its path:"
  echo "  curl -L -o ./models/$DEST_FILENAME https://huggingface.co/Qwen/Qwen2.5-Coder-1.5B-Instruct-GGUF/resolve/main/qwen2.5-coder-1.5b-instruct-q4_k_m.gguf"
  echo "  ./scripts/sideload-model.sh ./models/$DEST_FILENAME"
  exit 1
fi

echo "📦 Found model: $MODEL_PATH ($(du -h "$MODEL_PATH" | cut -f1))"
echo "🚀 Pushing to device /data/local/tmp/..."
"$ADB" push "$MODEL_PATH" "/data/local/tmp/$DEST_FILENAME"

echo "📂 Installing into app sandbox ($PACKAGE)..."
"$ADB" shell "run-as $PACKAGE mkdir -p files"
"$ADB" shell "run-as $PACKAGE cp /data/local/tmp/$DEST_FILENAME /data/data/$PACKAGE/files/$DEST_FILENAME"
"$ADB" shell "run-as $PACKAGE chmod 644 /data/data/$PACKAGE/files/$DEST_FILENAME"
"$ADB" shell "rm -f /data/local/tmp/$DEST_FILENAME"

echo "✅ Model successfully sideloaded into CodeChamp sandbox!"
echo "📍 Location: /data/data/$PACKAGE/files/$DEST_FILENAME"
echo "You can now launch CodeChamp and the offline AI tutor will use the local LLM!"
