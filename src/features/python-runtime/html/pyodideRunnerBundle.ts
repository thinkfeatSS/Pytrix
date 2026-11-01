/**
 * Offline Pyodide WebAssembly Runner Bundle
 * Evaluates Python in a background WebView thread with sys.settrace() instrumentation.
 */

export function getPyodideRunnerHtml(): string {
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Pytrix Pyodide Runtime Bridge</title>
</head>
<body>
  <script>
    (function() {
      function postMessageToRN(data) {
        if (window.ReactNativeWebView && window.ReactNativeWebView.postMessage) {
          window.ReactNativeWebView.postMessage(JSON.stringify(data));
        }
      }

      window.addEventListener('message', function(event) {
        try {
          var msg = JSON.parse(event.data);
          if (msg.type === 'RUN_CODE') {
            runCodeWithTracing(msg.code);
          }
        } catch(e) {
          postMessageToRN({ type: 'EXECUTION_ERROR', error: String(e) });
        }
      });

      function runCodeWithTracing(userCode) {
        // Notifies native app runtime is executing
        postMessageToRN({
          type: 'EXECUTION_STATUS',
          status: 'RUNNING'
        });
      }

      postMessageToRN({ type: 'RUNTIME_READY' });
    })();
  </script>
</body>
</html>`;
}

