# DISCLOSURES

In accordance with Hackathon guidelines and project rule H10, all models, libraries, fonts, and AI development tools are recorded here.

## 1. On-Device AI Models
- **Model**: Qwen2.5-Coder-1.5B-Instruct (GGUF, Q4_K_M quantization, ~986 MB)
- **Source**: Qwen team official HuggingFace repository (`Qwen/Qwen2.5-Coder-1.5B-Instruct-GGUF`)
- **License**: Apache 2.0
- **Runtime**: `llama.rn` (React Native bindings for `llama.cpp`) executing locally on device CPU.

## 2. Frameworks & Libraries
- **React Native & Expo**: Expo SDK 57 (React Native 0.86, React 19, New Architecture enabled)
- **llama.rn**: React Native bindings for llama.cpp (offline on-device LLM inference)
- **react-native-webview**: Isolated Web View for running the CodeMirror editor & Web Worker sandboxed execution
- **expo-sqlite**: Embedded SQLite engine for storing offline progress, mastery scores, attempts, and drafts
- **expo-file-system**: Local filesystem access for managing model storage
- **@react-navigation/native, bottom-tabs, native-stack**: Client-side screen navigation
- **zustand**: Lightweight local state management
- **react-native-reanimated**: Native thread animations
- **react-native-safe-area-context, react-native-screens**: Mobile layout and screen primitives
- **react-native-svg, lucide-react-native**: Vector icons
- **acorn, acorn-walk**: Offline JavaScript AST parser for structural and construct verification
- **jest, ts-jest**: Unit testing harness for pure TypeScript core logic

## 3. Fonts
- **Nunito**: Google Fonts, SIL Open Font License (OFL)
- **JetBrains Mono**: JetBrains, Apache 2.0 License

## 4. AI Development Tools
- **Antigravity (Google DeepMind)**: AI pair-programming assistant used during hackathon implementation
