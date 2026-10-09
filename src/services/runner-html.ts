/**
 * Self-contained HTML bundle for react-native-webview runner.
 * Completely offline with zero external network requests.
 * Runs user code inside an isolated Web Worker with timeout and CSP protection.
 */
export const RUNNER_HTML = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
  <meta http-equiv="Content-Security-Policy" content="default-src 'none'; script-src 'unsafe-eval' 'unsafe-inline' blob:; style-src 'unsafe-inline';" />
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    html, body { width: 100%; height: 100%; overflow: hidden; background: transparent; font-family: -apple-system, sans-serif; }
    #editor-container { width: 100%; height: 100%; display: flex; flex-direction: column; }
    textarea {
      flex: 1;
      width: 100%;
      height: 100%;
      border: none;
      outline: none;
      padding: 12px;
      font-family: 'JetBrains Mono', monospace, monospace;
      font-size: 15px;
      line-height: 1.5;
      background: transparent;
      color: inherit;
      resize: none;
      white-space: pre;
      overflow-wrap: normal;
      overflow-x: auto;
    }
  </style>
</head>
<body>
  <div id="editor-container">
    <textarea id="code-input" spellcheck="false" placeholder="// Write your solution here"></textarea>
  </div>

  <script>
    const textarea = document.getElementById('code-input');
    let currentWorker = null;
    let runTimeoutTimer = null;

    // Send change events to React Native
    textarea.addEventListener('input', () => {
      postToRN({ type: 'code_change', code: textarea.value });
    });

    function postToRN(msg) {
      if (window.ReactNativeWebView && window.ReactNativeWebView.postMessage) {
        window.ReactNativeWebView.postMessage(JSON.stringify(msg));
      }
    }

    // Worker code string
    const workerScript = \`
      self.onmessage = function(e) {
        const data = e.data;
        if (data.type === 'execute') {
          let printed = '';
          const originalLog = console.log;
          console.log = function(...args) {
            printed += args.map(a => typeof a === 'object' ? JSON.stringify(a) : String(a)).join(' ') + '\\\\n';
            if (printed.length > 4000) printed = printed.substring(0, 4000);
          };

          try {
            // Evaluate code in worker
            const evalFn = new Function(data.code + '; return ' + data.functionName + ';')();
            const results = [];
            let firstFailing = null;

            for (const t of data.visibleTests) {
              let actual = null;
              let status = 'pass';
              let errMsg = null;
              try {
                actual = evalFn(...t.args);
                if (JSON.stringify(actual) !== JSON.stringify(t.expected)) {
                  status = 'fail';
                }
              } catch(err) {
                status = 'error';
                errMsg = err && err.message ? err.message : String(err);
              }
              const testRes = { id: t.id, hidden: false, status, args: t.args, expected: t.expected, actual, errorMessage: errMsg };
              results.push(testRes);
              if (status !== 'pass' && !firstFailing) {
                firstFailing = testRes;
              }
            }

            console.log = originalLog;
            self.postMessage({
              type: 'run_complete',
              runId: data.runId,
              status: firstFailing ? 'tests_failed' : 'tests_passed',
              visible: results,
              firstFailing,
              printed
            });
          } catch(err) {
            console.log = originalLog;
            self.postMessage({
              type: 'run_error',
              runId: data.runId,
              error: { kind: 'runtime', message: err ? err.message : String(err) }
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
        postToRN({ type: 'code_change', code: textarea.value });
      } else if (msg.type === 'run_tests') {
        runCode(msg);
      }
    }

    function runCode(msg) {
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
            type: 'run_timeout',
            runId: msg.runId,
            error: { kind: 'runtime', message: 'Your code ran too long. Check for a loop that never ends.' }
          });
        }
      }, 3000);

      currentWorker.onmessage = function(e) {
        clearTimeout(runTimeoutTimer);
        currentWorker.terminate();
        currentWorker = null;
        postToRN(e.data);
      };

      currentWorker.onerror = function(err) {
        clearTimeout(runTimeoutTimer);
        currentWorker.terminate();
        currentWorker = null;
        postToRN({
          type: 'run_error',
          runId: msg.runId,
          error: { kind: 'runtime', message: err.message || 'Execution error' }
        });
      };

      currentWorker.postMessage({
        type: 'execute',
        runId: msg.runId,
        code: msg.code,
        functionName: msg.functionName,
        visibleTests: msg.visibleTests
      });
    }

    // Ready signal
    postToRN({ type: 'runner_ready' });
  </script>
</body>
</html>
`;
