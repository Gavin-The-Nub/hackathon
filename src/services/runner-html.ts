import { SKULPT_CORE_JS, SKULPT_STDLIB_JS } from './skulpt-bundle';

/**
 * Self-contained HTML bundle for react-native-webview runner.
 * Completely offline with zero external network requests.
 * Features IDE syntax highlighting, line numbers gutter, error underlines,
 * and runs user code inside an isolated Web Worker with timeout and CSP protection.
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
    :root {
      --text-color: #1F1B2E;
      --gutter-bg: #F8F7FC;
      --gutter-color: #A3A0B5;
      --caret-color: #6366F1;
      --comment: #6B7280;
      --keyword: #7C3AED;
      --string: #059669;
      --number: #D97706;
      --function: #2563EB;
      --operator: #E11D48;
      --boolean: #D97706;
      --error-line-bg: rgba(239, 68, 68, 0.12);
      --error-border: #EF4444;
      --error-squiggle: #EF4444;
    }
    body.dark {
      --text-color: #F3F2FA;
      --gutter-bg: #151322;
      --gutter-color: #6B6785;
      --caret-color: #818CF8;
      --comment: #9CA3AF;
      --keyword: #A78BFA;
      --string: #34D399;
      --number: #FBBF24;
      --function: #60A5FA;
      --operator: #FB7185;
      --boolean: #FBBF24;
      --error-line-bg: rgba(239, 68, 68, 0.22);
      --error-border: #F87171;
      --error-squiggle: #F87171;
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
      width: 38px;
      min-width: 38px;
      height: 100%;
      padding: 14px 4px 14px 2px;
      box-sizing: border-box;
      background: var(--gutter-bg);
      color: var(--gutter-color);
      font-family: inherit;
      font-size: 13px;
      line-height: 24px;
      text-align: right;
      user-select: none;
      -webkit-user-select: none;
      overflow: hidden;
      border-right: 1px solid rgba(0, 0, 0, 0.06);
    }
    body.dark #gutter {
      border-right: 1px solid rgba(255, 255, 255, 0.08);
    }
    .gutter-line {
      height: 24px;
      line-height: 24px;
      padding-right: 6px;
    }
    .gutter-line.error-gutter {
      color: #EF4444 !important;
      font-weight: 800;
    }
    #code-area {
      position: relative;
      flex: 1;
      height: 100%;
      overflow: hidden;
    }
    #highlighting, #code-input {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      margin: 0;
      padding: 14px 16px;
      border: none;
      font-family: inherit;
      font-size: 15px;
      line-height: 24px;
      tab-size: 2;
      -moz-tab-size: 2;
      white-space: pre;
      word-wrap: normal;
      overflow-wrap: normal;
      box-sizing: border-box;
      -webkit-text-size-adjust: none;
    }
    #code-input {
      z-index: 2;
      color: transparent;
      background: transparent;
      caret-color: var(--caret-color);
      resize: none;
      outline: none;
      overflow: auto;
      -webkit-overflow-scrolling: touch;
    }
    #code-input::selection {
      background: rgba(99, 102, 241, 0.28);
      color: transparent;
    }
    #highlighting {
      z-index: 1;
      pointer-events: none;
      overflow: hidden;
      color: var(--text-color);
    }
    .code-line {
      height: 24px;
      line-height: 24px;
      display: block;
      white-space: pre;
    }
    .code-line.error-line {
      background-color: var(--error-line-bg);
      border-left: 3px solid var(--error-border);
      margin-left: -3px;
      border-radius: 2px;
    }
    .error-squiggle {
      color: #EF4444 !important;
      font-weight: 700;
      text-decoration: underline wavy var(--error-squiggle) 2.5px;
      -webkit-text-decoration: underline wavy var(--error-squiggle) 2.5px;
      text-underline-offset: 3.5px;
      background-color: rgba(239, 68, 68, 0.22);
      border-bottom: 2px dashed var(--error-squiggle);
      border-radius: 3px;
      padding: 0 2px;
    }
    .code-line.error-line.error-line-general {
      text-decoration: underline wavy var(--error-squiggle) 2px;
      -webkit-text-decoration: underline wavy var(--error-squiggle) 2px;
      text-underline-offset: 3px;
    }
    /* Syntax Highlighting Tokens */
    .token-comment { color: var(--comment); font-style: italic; }
    .token-keyword { color: var(--keyword); font-weight: 700; }
    .token-string { color: var(--string); }
    .token-number { color: var(--number); font-weight: 600; }
    .token-boolean { color: var(--boolean); font-weight: 700; }
    .token-function { color: var(--function); font-weight: 600; }
    .token-operator { color: var(--operator); }
    .token-punct { color: var(--text-color); opacity: 0.7; }
  </style>
</head>
<body>
  <div id="editor-container">
    <div id="gutter"></div>
    <div id="code-area">
      <pre id="highlighting" aria-hidden="true"><code id="highlighting-content"></code></pre>
      <textarea id="code-input" spellcheck="false" autocapitalize="off" autocomplete="off" autocorrect="off"></textarea>
    </div>
  </div>

  <script>
    const textarea = document.getElementById('code-input');
    const highlighting = document.getElementById('highlighting');
    const highlightingContent = document.getElementById('highlighting-content');
    const gutter = document.getElementById('gutter');

    let currentLanguage = 'javascript';
    let currentWorker = null;
    let runTimeoutTimer = null;
    let currentErrorInfo = null;

    function escapeHtml(str) {
      return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    }

    function formatPlain(str, isErrorLine, errorToken) {
      if (isErrorLine && errorToken && str.includes(errorToken)) {
        const parts = str.split(errorToken);
        return parts.map(p => escapeHtml(p)).join('<span class="error-squiggle">' + escapeHtml(errorToken) + '</span>');
      }
      return escapeHtml(str);
    }

    function highlightPythonSegment(text, isErrorLine, errorToken) {
      if (!text) return '';
      const tokenRegex = /("(?:\\\\.|[^"\\\\\\n])*"|'(?:\\\\.|[^'\\\\\\n])*'|"""[\\s\\S]*?"""|'''[\\s\\S]*?'''|\\b(?:def|return|if|elif|else|for|while|break|continue|pass|in|is|not|and|or|import|from|as|try|except|finally|raise|class|lambda|with|yield|global|nonlocal|assert|del)\\b|\\b(?:True|False|None)\\b|\\b(?:print|len|range|sum|min|max|int|float|str|list|dict|set|tuple|bool|abs|round|any|all|sorted|type|isinstance|enumerate|zip|input)\\b|\\b\\d+(?:\\.\\d+)?\\b|\\b[a-zA-Z_][a-zA-Z0-9_]*(?=\\s*\\()|==|!=|<=|>=|\\/\\/|\\*\\*|[-+*\\/%&|^!~?:=<>]+|[{}()[\],;.:])/g;

      let result = '';
      let lastIndex = 0;
      let match;

      while ((match = tokenRegex.exec(text)) !== null) {
        if (match.index > lastIndex) {
          result += formatPlain(text.substring(lastIndex, match.index), isErrorLine, errorToken);
        }

        const token = match[0];
        let cls = '';
        if (token.startsWith('"') || token.startsWith("'")) {
          cls = 'token-string';
        } else if (/^(def|return|if|elif|else|for|while|break|continue|pass|in|is|not|and|or|import|from|as|try|except|finally|raise|class|lambda|with|yield|global|nonlocal|assert|del)$/.test(token)) {
          cls = 'token-keyword';
        } else if (/^(True|False|None)$/.test(token)) {
          cls = 'token-boolean';
        } else if (/^\d/.test(token)) {
          cls = 'token-number';
        } else if (/^(print|len|range|sum|min|max|int|float|str|list|dict|set|tuple|bool|abs|round|any|all|sorted|type|isinstance|enumerate|zip|input)$/.test(token) || text[match.index + token.length] === '(') {
          cls = 'token-function';
        } else if (/^[-+*\/%&|^!~?:=<>]+$/.test(token)) {
          cls = 'token-operator';
        } else if (/^[{}()[\],;.:]/.test(token)) {
          cls = 'token-punct';
        }

        const isSquiggle = isErrorLine && errorToken && token === errorToken;
        const extraClass = isSquiggle ? ' error-squiggle' : '';
        result += '<span class="' + cls + extraClass + '">' + escapeHtml(token) + '</span>';
        lastIndex = tokenRegex.lastIndex;
      }

      if (lastIndex < text.length) {
        result += formatPlain(text.substring(lastIndex), isErrorLine, errorToken);
      }
      return result;
    }

    function highlightJSSegment(text, isErrorLine, errorToken) {
      if (!text) return '';
      const tokenRegex = /("(?:\\\\.|[^"\\\\\\n])*"|'(?:\\\\.|[^'\\\\\\n])*'|\`(?:\`|[^\\\`])*?\`|\\b(?:function|return|let|const|var|if|else|for|while|do|switch|case|break|continue|new|this|typeof|instanceof|try|catch|finally|throw|class|extends|async|await|yield|in|of)\\b|\\b(?:true|false|null|undefined|NaN|Infinity)\\b|\\b\\d+(?:\\.\\d+)?\\b|\\b[a-zA-Z_$][a-zA-Z0-9_$]*(?=\\s*\\()|=>|===|!==|==|!=|<=|>=|[-+*\\/%&|^!~?:=<>]+|[{}()[\],;.])/g;
      
      let result = '';
      let lastIndex = 0;
      let match;

      while ((match = tokenRegex.exec(text)) !== null) {
        if (match.index > lastIndex) {
          result += formatPlain(text.substring(lastIndex, match.index), isErrorLine, errorToken);
        }

        const token = match[0];
        let cls = '';
        if (token.startsWith('"') || token.startsWith("'") || token.startsWith(String.fromCharCode(96))) {
          cls = 'token-string';
        } else if (/^(function|return|let|const|var|if|else|for|while|do|switch|case|break|continue|new|this|typeof|instanceof|try|catch|finally|throw|class|extends|async|await|yield|in|of)$/.test(token)) {
          cls = 'token-keyword';
        } else if (/^(true|false|null|undefined|NaN|Infinity)$/.test(token)) {
          cls = 'token-boolean';
        } else if (/^\d/.test(token)) {
          cls = 'token-number';
        } else if (text[match.index + token.length] === '(' || (/^[a-zA-Z_$]/.test(token) && match.index + token.length < text.length && text.slice(match.index + token.length).trim().startsWith('('))) {
          cls = 'token-function';
        } else if (/^[-+*\/%&|^!~?:=<>]+$/.test(token) || token === '=>') {
          cls = 'token-operator';
        } else if (/^[{}()[\],;.]/.test(token)) {
          cls = 'token-punct';
        }

        const isSquiggle = isErrorLine && errorToken && token === errorToken;
        const extraClass = isSquiggle ? ' error-squiggle' : '';
        result += '<span class="' + cls + extraClass + '">' + escapeHtml(token) + '</span>';
        lastIndex = tokenRegex.lastIndex;
      }

      if (lastIndex < text.length) {
        result += formatPlain(text.substring(lastIndex), isErrorLine, errorToken);
      }
      return result;
    }

    function highlightLine(line, isErrorLine, errorToken) {
      if (!line) return '&nbsp;';
      const commentChar = currentLanguage === 'python' ? '#' : '//';
      const commentIdx = line.indexOf(commentChar);
      if (commentIdx !== -1) {
        const before = line.substring(0, commentIdx);
        const comment = line.substring(commentIdx);
        const codeHl = currentLanguage === 'python'
          ? highlightPythonSegment(before, isErrorLine, errorToken)
          : highlightJSSegment(before, isErrorLine, errorToken);
        return codeHl + '<span class="token-comment">' + escapeHtml(comment) + '</span>';
      }
      return currentLanguage === 'python'
        ? highlightPythonSegment(line, isErrorLine, errorToken)
        : highlightJSSegment(line, isErrorLine, errorToken);
    }

    function renderEditor() {
      const code = textarea.value || '';
      const lines = code.split(String.fromCharCode(10)).map(function(l) { return l.replace(String.fromCharCode(13), ''); });
      
      let gutterHtml = '';
      let codeHtml = '';

      for (let i = 0; i < lines.length; i++) {
        const lineNum = i + 1;
        const isErrorLine = currentErrorInfo && currentErrorInfo.line === lineNum;
        const errorToken = isErrorLine ? currentErrorInfo.token : null;

        gutterHtml += '<div class="gutter-line' + (isErrorLine ? ' error-gutter' : '') + '">' + 
          (isErrorLine ? '✕ ' : '') + lineNum + '</div>';

        const lineContent = highlightLine(lines[i], isErrorLine, errorToken);
        const generalClass = (isErrorLine && !errorToken) ? ' error-line-general' : '';
        codeHtml += '<div class="code-line' + (isErrorLine ? ' error-line' : '') + generalClass + '">' + lineContent + '</div>';
      }

      gutter.innerHTML = gutterHtml;
      highlightingContent.innerHTML = codeHtml;

      // Keep scroll positions aligned
      highlighting.scrollTop = textarea.scrollTop;
      highlighting.scrollLeft = textarea.scrollLeft;
      gutter.scrollTop = textarea.scrollTop;
    }

    textarea.addEventListener('scroll', () => {
      highlighting.scrollTop = textarea.scrollTop;
      highlighting.scrollLeft = textarea.scrollLeft;
      gutter.scrollTop = textarea.scrollTop;
    });

    textarea.addEventListener('input', () => {
      currentErrorInfo = null; // Clear error highlight on edits
      renderEditor();
      postToRN({ type: 'code_change', code: textarea.value });
    });

    textarea.addEventListener('focus', () => {
      postToRN({ type: 'editor_focus' });
    });

    textarea.addEventListener('blur', () => {
      postToRN({ type: 'editor_blur' });
    });

    function postToRN(msg) {
      if (window.ReactNativeWebView && window.ReactNativeWebView.postMessage) {
        window.ReactNativeWebView.postMessage(JSON.stringify(msg));
      }
    }

    // Isolated execution worker
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
            const evalFn = new Function(data.code + '; return ' + data.functionName + ';')();
            const results = [];
            let firstFailing = null;

            for (const t of data.visibleTests) {
              let actual = null;
              let status = 'pass';
              let errMsg = null;
              let errorDetail = null;

              try {
                actual = evalFn(...t.args);
                if (JSON.stringify(actual) !== JSON.stringify(t.expected)) {
                  status = 'fail';
                }
              } catch(err) {
                status = 'error';
                errMsg = err && err.message ? err.message : String(err);
                
                let line = null;
                let token = null;
                const tokMatch = errMsg.match(/([a-zA-Z0-9_$]+) is not defined/);
                const cLines = (data.code || '').split(String.fromCharCode(10)).map(function(l) { return l.replace(String.fromCharCode(13), ''); });
                if (tokMatch) {
                  token = tokMatch[1];
                  for (let idx = 0; idx < cLines.length; idx++) {
                    const words = cLines[idx].match(/[a-zA-Z0-9_$]+/g) || [];
                    if (words.indexOf(token) !== -1) {
                      line = idx + 1;
                      break;
                    }
                  }
                }
                if (!line && err && err.stack) {
                  const m = err.stack.match(/anonymous>:([0-9]+)/) || err.stack.match(/:([0-9]+):([0-9]+)/);
                  if (m) {
                    const rawLine = parseInt(m[1], 10);
                    const calcLine = rawLine > 2 ? rawLine - 2 : rawLine;
                    if (calcLine >= 1 && calcLine <= cLines.length) {
                      line = calcLine;
                    }
                  }
                }
                errorDetail = {
                  name: err.name || 'RuntimeError',
                  message: errMsg,
                  line: line || undefined,
                  token: token || undefined
                };
              }

              const testRes = { id: t.id, hidden: false, status, args: t.args, expected: t.expected, actual, errorMessage: errMsg, errorDetail };
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
            const errMsg = err ? err.message : String(err);
            let line = null;
            let token = null;
            const tokMatch = errMsg.match(/([a-zA-Z0-9_$]+) is not defined/);
            const cLines = (data.code || '').split(String.fromCharCode(10)).map(function(l) { return l.replace(String.fromCharCode(13), ''); });
            if (tokMatch) {
              token = tokMatch[1];
              for (let idx = 0; idx < cLines.length; idx++) {
                const words = cLines[idx].match(/[a-zA-Z0-9_$]+/g) || [];
                if (words.indexOf(token) !== -1) {
                  line = idx + 1;
                  break;
                }
              }
            }
            if (!line && err && err.stack) {
              const m = err.stack.match(/anonymous>:([0-9]+)/) || err.stack.match(/:([0-9]+):([0-9]+)/);
              if (m) {
                const rawLine = parseInt(m[1], 10);
                const calcLine = rawLine > 2 ? rawLine - 2 : rawLine;
                if (calcLine >= 1 && calcLine <= cLines.length) {
                  line = calcLine;
                }
              }
            }
            self.postMessage({
              type: 'run_error',
              runId: data.runId,
              error: {
                kind: 'runtime',
                name: err.name || 'Error',
                message: errMsg,
                line: line || undefined,
                token: token || undefined
              }
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
        if (msg.language) currentLanguage = msg.language;
        currentErrorInfo = null;
        renderEditor();
      } else if (msg.type === 'set_language') {
        currentLanguage = msg.language || 'javascript';
        renderEditor();
      } else if (msg.type === 'set_theme') {
        if (msg.isDark) {
          document.body.className = 'dark';
        } else {
          document.body.className = '';
        }
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
        const indent = currentLanguage === 'python' ? '    ' : '  ';
        if (sym === 'tab') {
          textarea.value = val.substring(0, start) + indent + val.substring(end);
          textarea.selectionStart = textarea.selectionEnd = start + indent.length;
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
        textarea.focus();
      } else if (msg.type === 'run_tests') {
        if (msg.language) currentLanguage = msg.language;
        if (currentLanguage === 'python') {
          runPythonCode(msg);
        } else {
          runJSCode(msg);
        }
      }
    }

    function deepCompare(a, b) {
      if (a === b) return true;
      if (typeof a === 'number' && typeof b === 'number') {
        return Math.abs(a - b) < 1e-6;
      }
      return JSON.stringify(a) === JSON.stringify(b);
    }

    function runPythonCode(msg) {
      clearTimeout(runTimeoutTimer);
      let printed = '';

      if (typeof Sk === 'undefined') {
        postToRN({
          type: 'run_error',
          runId: msg.runId,
          error: { kind: 'runtime', message: 'Python interpreter initializing. Please try again in a moment.' }
        });
        return;
      }

      Sk.configure({
        output: function(text) {
          printed += text;
          if (printed.length > 4000) printed = printed.substring(0, 4000);
        },
        read: function(x) {
          if (Sk.builtinFiles === undefined || Sk.builtinFiles["files"][x] === undefined) {
            throw "File not found: " + x;
          }
          return Sk.builtinFiles["files"][x];
        },
        execLimit: 3000,
        __future__: Sk.python3
      });

      runTimeoutTimer = setTimeout(function() {
        postToRN({
          type: 'run_timeout',
          runId: msg.runId,
          error: { kind: 'runtime', message: 'Your code ran too long. Check for a loop that never ends.' }
        });
      }, 3000);

      Sk.misceval.asyncToPromise(function() {
        return Sk.importMainWithBody("<stdin>", false, msg.code, true);
      }).then(function(module) {
        clearTimeout(runTimeoutTimer);
        const fnObj = module.tp$getattr(new Sk.builtin.str(msg.functionName));
        if (!fnObj) {
          const missingErr = {
            kind: 'missing_function',
            name: 'NameError',
            message: "Function '" + msg.functionName + "' is not defined in your code.",
          };
          currentErrorInfo = missingErr;
          renderEditor();
          postToRN({
            type: 'run_error',
            runId: msg.runId,
            error: missingErr
          });
          return;
        }

        const results = [];
        let firstFailing = null;

        for (const t of (msg.visibleTests || [])) {
          let actual = null;
          let status = 'pass';
          let errMsg = null;
          let errorDetail = null;

          try {
            const pyArgs = (t.args || []).map(function(a) { return Sk.ffi.remapToPy(a); });
            const pyRes = Sk.misceval.callsimArray(fnObj, pyArgs);
            actual = Sk.ffi.remapToJs(pyRes);

            if (!deepCompare(actual, t.expected)) {
              status = 'fail';
            }
          } catch(err) {
            status = 'error';
            errMsg = err.toString();
            let errLine = null;
            if (err.traceback && err.traceback.length > 0) {
              errLine = err.traceback[0].lineno;
            }
            errorDetail = {
              name: err.tp$name || 'RuntimeError',
              message: errMsg,
              line: errLine || undefined,
            };
          }

          const testRes = {
            id: t.id,
            hidden: false,
            status: status,
            args: t.args,
            expected: t.expected,
            actual: actual,
            errorMessage: errMsg,
            errorDetail: errorDetail
          };
          results.push(testRes);
          if (status !== 'pass' && !firstFailing) {
            firstFailing = testRes;
          }
        }

        if (firstFailing && firstFailing.errorDetail) {
          currentErrorInfo = firstFailing.errorDetail;
        } else {
          currentErrorInfo = null;
        }
        renderEditor();

        postToRN({
          type: 'run_complete',
          runId: msg.runId,
          status: firstFailing ? 'tests_failed' : 'tests_passed',
          visible: results,
          firstFailing: firstFailing,
          printed: printed
        });
      }).catch(function(err) {
        clearTimeout(runTimeoutTimer);
        const errMsg = err.toString();
        let errLine = null;
        if (err.traceback && err.traceback.length > 0) {
          errLine = err.traceback[0].lineno;
        }
        currentErrorInfo = { message: errMsg, line: errLine || undefined };
        renderEditor();
        postToRN({
          type: 'run_error',
          runId: msg.runId,
          error: {
            kind: 'runtime',
            name: err.tp$name || 'Error',
            message: errMsg,
            line: errLine || undefined,
          }
        });
      });
    }

    function runJSCode(msg) {
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
        
        // If error occurred, highlight line in editor immediately
        if (e.data.status === 'tests_passed') {
          currentErrorInfo = null;
        } else if (e.data.firstFailing && e.data.firstFailing.errorDetail) {
          currentErrorInfo = e.data.firstFailing.errorDetail;
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
    renderEditor();
    postToRN({ type: 'runner_ready' });
  </script>
  <script>
    ${SKULPT_CORE_JS}
  </script>
  <script>
    ${SKULPT_STDLIB_JS}
  </script>
</body>
</html>
`;
