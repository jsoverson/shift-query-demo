<script>
  import { onMount } from "svelte";
  import CodeMirror from "codemirror";
  import { highlightAll, removeHighlights } from "./highlight.js";
  import codegen from "shift-codegen";
  import defaultSample from "./default-sample.js";
  import Shift from "shift-ast";

  const shiftTypes = Object.keys(Shift);

  import "codemirror/mode/javascript/javascript";
  import "../node_modules/codemirror/lib/codemirror.css";

  let cm = null;
  let wrapper = null;
  let results = [];
  let resultIndex = -1;
  let selectedMarker = null;

  const worker = new Worker("./worker.js");
  worker.onmessage = function(e) {
    results = e.data;
    highlightAll(cm, e.data);
  };

  onMount(() => {
    const textarea = document.getElementById("codemirror-textarea");
    textarea.value = defaultSample;

    window.cm = cm = CodeMirror.fromTextArea(textarea, {
      lineNumbers: true
    });
    wrapper = cm.getWrapperElement();

    cm.setSize("auto", "100%");
    cm.on("change", _ => {
      results = [];
      removeHighlights();
      resetSelection();
    });
    cm.on("focus", resetSelection);
    go();
  });

  function go() {
    const queryEl = document.getElementById("query");
    resetSelection();
    if (cm) {
      worker.postMessage({ source: cm.getValue(), query: queryEl.value });
    }
  }

  function resetSelection() {
    if (selectedMarker) {
      selectedMarker.clear();
    }
    resultIndex = -1;
    wrapper.classList.remove("selection-active");
  }

  function select(index) {
    resetSelection();
    resultIndex = index;
    const result = results[index];
    const doc = cm.getDoc();
    const loc = doc.posFromIndex(result.loc.start.offset);
    const end = doc.posFromIndex(result.loc.end.offset);
    doc.setCursor(loc);
    wrapper.classList.add("selection-active");
    selectedMarker = doc.markText(loc, end, { className: `cm-nodeSelected` });
  }

  function formatCode(node) {
    const src = codegen(node);
    return src;
  }

  function autocomplete(evt) {
    //someday
  }
</script>

<style>
  .editor {
    height: 100%;
    display:flex;
  }

  .editor > * {
    width:50%;
    height:100%;
  }

  @media (max-width: 800px) { 
    .editor {
      flex-wrap: wrap;
    }
    .editor > * {
      width:100%;
      height:auto;
    }
    .query input {
      font-size:1.2em;
      height: 1.8em;
      width:90%;
    }
    .query button {
      display:none
    }
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
    height: calc(100% - 10px);
  }
  #results-list {
    overflow-y: scroll;
    border-left: 1px solid #ccc;
  }
  #results-list ol {
    list-style-type: none;
    margin: 5px;
    padding: 0;
  }
  .result {
    border: 1px solid #ccc;
    margin: 5px 0;
    cursor: pointer;
    font-family: monospace;
    padding: 0.2em 0.5em 0.6em 0.5em;
  }
  .result h1 {
    font-size: 1em;
  }
  .selected {
    background-color: rgb(154, 255, 253);
    border-color: #64b3bb;
  }
  .source {
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
    max-width: 50em;
  }
</style>

<form on:submit|preventDefault={go}>
  <div class="query">
    <input
      type="text"
      name="query"
      id="query"
      on:input={autocomplete}
      value='FunctionBody, LiteralStringExpression, IdentifierExpression[name="Point"]' />
    <button id="submit" on:click={go}>Go</button>
  </div>
</form>
<div class="code">
  <div class="editor">
    <div>
      <textarea id="codemirror-textarea" />
    </div>
    <div id="results-list">
      <ol>
        {#each results as result, i}
          <li
            data-index={i}
            class="result {resultIndex === i ? 'selected' : ''}"
            on:click={_ => select(i)}>
            <h1>
              ({result.loc.start.line}:{result.loc.start.column}):{result.node.type}
            </h1>
            <div class="source">{formatCode(result.node)}</div>
          </li>
        {/each}
      </ol>
    </div>
  </div>
</div>
