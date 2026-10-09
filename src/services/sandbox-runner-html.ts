/**
 * Self-contained HTML bundle for Sandbox Playground runner.
 * Completely offline with zero external network requests.
 * Features:
 * - Syntax highlighting & line numbers
 * - Isolated Web Worker execution for arbitrary code
 * - Intercepts console.log, console.warn, console.error
 * - Captures return values & evaluation results
 * - Error line detection & highlighting
 * - 3000ms timeout protection against infinite loops
 */
export const SANDBOX_RUNNER_HTML = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
  <meta http-equiv="Content-Security-Policy" content="default-src 'none'; script-src 'unsafe-eval' 'unsafe-inline' blob:; style-src 'unsafe-inline';" />
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    :root {
      --text-color: #1F1B2E;
      --gutter-bg: #F8F7FC;
      --gutter-color: #A3A0B5;
      --caret-color: #5B4BDB;
      --comment: #6B7280;
      --keyword: #7C3AED;
      --string: #059669;
      --number: #D97706;
      --function: #2563EB;
      --operator: #E11D48;
      --boolean: #D97706;
      --error-line-bg: rgba(239, 68, 68, 0.14);
      --error-border: #EF4444;
    }
    body.dark {
      --text-color: #F3F2FA;
      --gutter-bg: #151322;
      --gutter-color: #6B6785;
      --caret-color: #8B7CFF;
      --comment: #9CA3AF;
      --keyword: #A78BFA;
      --string: #34D399;
      --number: #FBBF24;
      --function: #60A5FA;
      --operator: #FB7185;
      --boolean: #FBBF24;
      --error-line-bg: rgba(239, 68, 68, 0.22);
      --error-border: #F87171;
    }
    html, body {
      width: 100%;
      height: 100%;
      overflow: hidden;
      background: transparent;
      font-family: 'JetBrains Mono', 'Fira Code', 'Courier New', monospace;
    }
    #editor-container {
      width: 100%;
      height: 100%;
      display: flex;
      flex-direction: row;
      position: relative;
    }
    #gutter {
      width: 44px;
      height: 100%;
      background: var(--gutter-bg);
      color: var(--gutter-color);
      font-size: 13px;
      line-height: 22px;
      text-align: right;
      padding: 14px 8px 14px 0;
      user-select: none;
      flex-shrink: 0;
      border-right: 1px solid rgba(0,0,0,0.06);
    }
    body.dark #gutter {
      border-right: 1px solid rgba(255,255,255,0.06);
    }
    .gutter-line {
      height: 22px;
    }
    .gutter-error {
      color: var(--error-border);
      font-weight: bold;
    }
    #editor-wrapper {
      flex: 1;
      height: 100%;
      position: relative;
      overflow: hidden;
    }
    #highlight-layer, #textarea {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      padding: 14px 14px;
      font-family: inherit;
      font-size: 14.5px;
      line-height: 22px;
      white-space: pre;
      overflow: auto;
      tab-size: 2;
    }
    #highlight-layer {
      pointer-events: none;
      color: var(--text-color);
      z-index: 1;
    }
    #textarea {
      color: transparent;
      background: transparent;
      caret-color: var(--caret-color);
      resize: none;
      border: none;
      outline: none;
      z-index: 2;
      -webkit-text-fill-color: transparent;
    }
    .err-line {
      background: var(--error-line-bg);
      border-left: 3px solid var(--error-border);
      display: block;
      margin-left: -14px;
      padding-left: 11px;
    }
    .hl-kw { color: var(--keyword); font-weight: 700; }
    .hl-str { color: var(--string); }
    .hl-num { color: var(--number); }
    .hl-fn { color: var(--function); }
    .hl-com { color: var(--comment); font-style: italic; }
    .hl-op { color: var(--operator); }
  </style>
</head>
<body>
  <div id="editor-container">
    <div id="gutter"></div>
    <div id="editor-wrapper">
      <div id="highlight-layer"></div>
      <textarea id="textarea" spellcheck="false" autocapitalize="none" autocomplete="off" autocorrect="off"></textarea>
    </div>
  </div>

  <script>
    const gutter = document.getElementById('gutter');
    const textarea = document.getElementById('textarea');
    const highlightLayer = document.getElementById('highlight-layer');

    let currentErrorInfo = null;
    let currentWorker = null;
    let runTimeoutTimer = null;

    function escapeHtml(str) {
      return str
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
    }

    function highlightJS(code) {
      const tokens = [];
      const regex = /("(?:\\\\.|[^"\\\\\\n])*"|'(?:\\\\.|[^'\\\\\\n])*'|\`[\\s\\S]*?\`|\\/\\/.*|\\/\\*[\\s\\S]*?\\*\\/|\\b(?:const|let|var|function|return|if|else|for|while|do|switch|case|break|continue|new|class|import|export|default|try|catch|finally|throw|typeof|instanceof|void|async|await|yield|this|super)\\b|\\b(?:true|false|null|undefined|NaN|Infinity)\\b|\\b\\d+(?:\\.\\d+)?\\b|[a-zA-Z_$][a-zA-Z0-9_$]*(?=\\s*\\()|[+\\-*\\/%&|^!=<>?:]+)/g;

      let lastIndex = 0;
      let match;

      while ((match = regex.exec(code)) !== null) {
        if (match.index > lastIndex) {
          tokens.push(escapeHtml(code.slice(lastIndex, match.index)));
        }

        const m = match[0];
        if (m.startsWith('//') || m.startsWith('/*')) {
          tokens.push('<span class="hl-com">' + escapeHtml(m) + '</span>');
        } else if (m.startsWith('"') || m.startsWith("'") || m.startsWith('\`')) {
          tokens.push('<span class="hl-str">' + escapeHtml(m) + '</span>');
        } else if (/^(?:const|let|var|function|return|if|else|for|while|do|switch|case|break|continue|new|class|import|export|default|try|catch|finally|throw|typeof|instanceof|void|async|await|yield|this|super)$/.test(m)) {
          tokens.push('<span class="hl-kw">' + escapeHtml(m) + '</span>');
        } else if (/^(?:true|false|null|undefined|NaN|Infinity)$/.test(m) || /^\\d+(?:\\.\\d+)?$/.test(m)) {
          tokens.push('<span class="hl-num">' + escapeHtml(m) + '</span>');
        } else if (/^[a-zA-Z_$]/.test(m)) {
          tokens.push('<span class="hl-fn">' + escapeHtml(m) + '</span>');
        } else {
          tokens.push('<span class="hl-op">' + escapeHtml(m) + '</span>');
        }

        lastIndex = regex.lastIndex;
      }

      if (lastIndex < code.length) {
        tokens.push(escapeHtml(code.slice(lastIndex)));
      }

      return tokens.join('');
    }

    function renderEditor() {
      const code = textarea.value;
      const lines = code.split('\\n');
      const errLine = currentErrorInfo && currentErrorInfo.line ? currentErrorInfo.line : null;

      let gutterHtml = '';
      for (let i = 1; i <= lines.length; i++) {
        const isErr = i === errLine;
        gutterHtml += '<div class="gutter-line' + (isErr ? ' gutter-error' : '') + '">' + i + '</div>';
      }
      gutter.innerHTML = gutterHtml;

      const highlightedLines = lines.map((line, idx) => {
        const lineNum = idx + 1;
        const hl = highlightJS(line) || '&nbsp;';
        if (lineNum === errLine) {
          return '<span class="err-line">' + hl + '</span>';
        }
        return hl;
      });

      highlightLayer.innerHTML = highlightedLines.join('\\n') + (code.endsWith('\\n') ? '\\n&nbsp;' : '');
    }

    textarea.addEventListener('input', () => {
      currentErrorInfo = null;
      renderEditor();
      postToRN({ type: 'code_change', code: textarea.value });
    });

    textarea.addEventListener('scroll', () => {
      highlightLayer.scrollTop = textarea.scrollTop;
      highlightLayer.scrollLeft = textarea.scrollLeft;
      gutter.scrollTop = textarea.scrollTop;
    });

    function postToRN(msg) {
      if (window.ReactNativeWebView && window.ReactNativeWebView.postMessage) {
        window.ReactNativeWebView.postMessage(JSON.stringify(msg));
      }
    }

    // Isolated sandbox execution worker
    const workerScript = \`
      self.onmessage = function(e) {
        const data = e.data;
        if (data.type === 'execute_sandbox') {
          const logs = [];
          const originalLog = console.log;
          const originalWarn = console.warn;
          const originalError = console.error;
          const originalInfo = console.info;

          function formatArg(a) {
            if (a === null) return 'null';
            if (a === undefined) return 'undefined';
            if (typeof a === 'object') {
              try { return JSON.stringify(a, null, 2); } catch(err) { return String(a); }
            }
            return String(a);
          }

          console.log = function(...args) {
            logs.push({ level: 'log', text: args.map(formatArg).join(' ') });
          };
          console.info = function(...args) {
            logs.push({ level: 'info', text: args.map(formatArg).join(' ') });
          };
          console.warn = function(...args) {
            logs.push({ level: 'warn', text: args.map(formatArg).join(' ') });
          };
          console.error = function(...args) {
            logs.push({ level: 'error', text: args.map(formatArg).join(' ') });
          };

          const startTime = Date.now();
          try {
            // Execute code and capture the result
            const evalResult = (function() {
              return eval(data.code);
            })();

            const durationMs = Date.now() - startTime;
            console.log = originalLog;
            console.warn = originalWarn;
            console.error = originalError;
            console.info = originalInfo;

            self.postMessage({
              type: 'sandbox_complete',
              runId: data.runId,
              status: 'success',
              logs: logs,
              result: evalResult !== undefined ? formatArg(evalResult) : null,
              durationMs: durationMs
            });
          } catch(err) {
            const durationMs = Date.now() - startTime;
            console.log = originalLog;
            console.warn = originalWarn;
            console.error = originalError;
            console.info = originalInfo;

            const errMsg = err ? err.message : String(err);
            let line = null;
            const cLines = (data.code || '').split(String.fromCharCode(10));

            if (err && err.stack) {
              const m = err.stack.match(/eval.*:([0-9]+):([0-9]+)/) || err.stack.match(/anonymous>:([0-9]+)/) || err.stack.match(/:([0-9]+):([0-9]+)/);
              if (m) {
                const rawLine = parseInt(m[1], 10);
                if (rawLine >= 1 && rawLine <= cLines.length) {
                  line = rawLine;
                }
              }
            }

            self.postMessage({
              type: 'sandbox_complete',
              runId: data.runId,
              status: 'error',
              logs: logs,
              error: {
                name: err.name || 'Error',
                message: errMsg,
                line: line || undefined
              },
              durationMs: durationMs
            });
          }
        }
      };
    \`;

    const blob = new Blob([workerScript], { type: 'application/javascript' });
    const workerUrl = URL.createObjectURL(blob);

    window.addEventListener('message', (event) => {
      try {
        const msg = typeof event.data === 'string' ? JSON.parse(event.data) : event.data;
        handleRNMessage(msg);
      } catch(e) {}
    });

    document.addEventListener('message', (event) => {
      try {
        const msg = typeof event.data === 'string' ? JSON.parse(event.data) : event.data;
        handleRNMessage(msg);
      } catch(e) {}
    });

    function handleRNMessage(msg) {
      if (msg.type === 'set_code') {
        textarea.value = msg.code || '';
        currentErrorInfo = null;
        renderEditor();
      } else if (msg.type === 'set_theme') {
        document.body.className = msg.isDark ? 'dark' : '';
        renderEditor();
      } else if (msg.type === 'highlight_error') {
        currentErrorInfo = msg.error;
        renderEditor();
      } else if (msg.type === 'clear_error') {
        currentErrorInfo = null;
        renderEditor();
      } else if (msg.type === 'insert_symbol') {
        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        const val = textarea.value;
        const sym = msg.symbol;
        if (sym === 'tab') {
          textarea.value = val.substring(0, start) + '  ' + val.substring(end);
          textarea.selectionStart = textarea.selectionEnd = start + 2;
        } else if (sym === '{}') {
          textarea.value = val.substring(0, start) + '{}' + val.substring(end);
          textarea.selectionStart = textarea.selectionEnd = start + 1;
        } else if (sym === '()') {
          textarea.value = val.substring(0, start) + '()' + val.substring(end);
          textarea.selectionStart = textarea.selectionEnd = start + 1;
        } else if (sym === '[]') {
          textarea.value = val.substring(0, start) + '[]' + val.substring(end);
          textarea.selectionStart = textarea.selectionEnd = start + 1;
        } else if (sym === '""') {
          textarea.value = val.substring(0, start) + '""' + val.substring(end);
          textarea.selectionStart = textarea.selectionEnd = start + 1;
        } else if (sym === "''") {
          textarea.value = val.substring(0, start) + "''" + val.substring(end);
          textarea.selectionStart = textarea.selectionEnd = start + 1;
        } else {
          textarea.value = val.substring(0, start) + sym + val.substring(end);
          textarea.selectionStart = textarea.selectionEnd = start + sym.length;
        }
        currentErrorInfo = null;
        renderEditor();
        postToRN({ type: 'code_change', code: textarea.value });
      } else if (msg.type === 'run_sandbox') {
        runSandbox(msg);
      }
    }

    function runSandbox(msg) {
      if (currentWorker) {
        currentWorker.terminate();
      }
      clearTimeout(runTimeoutTimer);

      currentWorker = new Worker(workerUrl);

      runTimeoutTimer = setTimeout(() => {
        if (currentWorker) {
          currentWorker.terminate();
          currentWorker = null;
          postToRN({
            type: 'sandbox_timeout',
            runId: msg.runId,
            error: { name: 'TimeoutError', message: 'Execution timed out (3s). Check for an infinite loop.' }
          });
        }
      }, 3000);

      currentWorker.onmessage = function(e) {
        clearTimeout(runTimeoutTimer);
        currentWorker.terminate();
        currentWorker = null;

        if (e.data.status === 'error' && e.data.error) {
          currentErrorInfo = e.data.error;
        } else {
          currentErrorInfo = null;
        }
        renderEditor();

        postToRN(e.data);
      };

      currentWorker.onerror = function(err) {
        clearTimeout(runTimeoutTimer);
        currentWorker.terminate();
        currentWorker = null;
        currentErrorInfo = { message: err.message || 'Execution error' };
        renderEditor();
        postToRN({
          type: 'sandbox_complete',
          runId: msg.runId,
          status: 'error',
          logs: [],
          error: { name: 'RuntimeError', message: err.message || 'Execution error' }
        });
      };

      currentWorker.postMessage({
        type: 'execute_sandbox',
        runId: msg.runId,
        code: msg.code
      });
    }

    renderEditor();
    postToRN({ type: 'runner_ready' });
  </script>
</body>
</html>
`;
