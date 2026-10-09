export interface ModelConfig {
  name: string;
  quant: string;
  filename: string;
  url: string;
  sizeBytes: number;
  sha256?: string;
  license: string;
}

export const MODEL_CONFIG: ModelConfig = {
  name: 'Qwen2.5-Coder-1.5B-Instruct',
  quant: 'Q4_K_M',
  filename: 'qwen2.5-coder-1.5b-instruct-q4_k_m.gguf',
  url: 'https://huggingface.co/Qwen/Qwen2.5-Coder-1.5B-Instruct-GGUF/resolve/main/qwen2.5-coder-1.5b-instruct-q4_k_m.gguf',
  sizeBytes: 986000000, // ~986 MB
  license: 'Apache-2.0',
};
