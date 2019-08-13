<script>
  import { onMount } from "svelte";
  import CodeMirror from "codemirror";
  import JS from "codemirror/mode/javascript/javascript";
  import { highlight } from "./search.js";
  import "../node_modules/codemirror/lib/codemirror.css";

  let cm;

  const worker = new Worker("./worker.js");
  worker.onmessage = function(e) {
    console.log("Message received from worker");
    highlight(cm, e.data);
  };

  onMount(() => {
    const textarea = document.getElementById("codemirror-textarea");
    textarea.value = `
(function() {
  class Greeter {
    constructor(target) {
      this.target = target;
    }
    greet() {
      console.log(\`Hello \${this.target}\`);
    }
    setTarget(newTarget) {
      this.target = newTarget;
    }
  }
  const greeter = new Greeter("world");
  greeter.greet();
  greeter.setTarget("reader");
  greeter.greet();
})();  
`

    cm = CodeMirror.fromTextArea(textarea, {
      lineNumbers: true,
      extraKeys: { "Alt-F": "findPersistent" }
    });
    cm.setSize("100%", "100%");
  });

  function go(evt) {
    evt.preventDefault();
    const queryEl = document.getElementById("query");

    if (cm) {
      worker.postMessage({ source: cm.getValue(), query: queryEl.value });
    }
  }
</script>

<style>
  .editor {
    height: 100%;
  }
  .query {
    background-color: hsl(200, 20%, 90%);
    filter: drop-shadow(0 3px 5px #ccc);
    position: relative;
    z-index: 10;
    height: 50px;
    font-family: monospace;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  input {
    font-family: monospace;
    font-size: 16pt;
    width: 80%;
    height: 40px;
    padding: 0 5px;
    box-sizing: border-box;
  }
  button {
    font-family: monospace;
    font-size: 16pt;
    line-height: 18pt;
    height: 40px;
    box-sizing: border-box;
  }
  .code {
    height: calc(100% - 50px);
  }
</style>

<form on:submit={go}>
<div class="query">
  <input type="text" name="query" id="query" value="IdentifierExpression" />
  <button id="submit" on:click={go}>Go</button>
</div>
</form>
<div class="code">
  <div class="editor">
    <textarea id="codemirror-textarea">
    </textarea>
  </div>
</div>
