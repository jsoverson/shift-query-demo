<script>
	import Editor from './Editor.svelte';

  export let name;
</script>

<style>
  h1 {
    color: black;
  }
  .app {
		height:100%;
  }
  header {
    height:3em;
    line-height:2em;
    text-align:center;
    font-family:monospace;
  }
  .content {
		height:calc(100vh - 100px);
  }

@media (max-width: 800px) { 
  h1 {
    font-size:1.2em;
  }
}

</style>

<div class="app">
  <header>
    <h1>Shift-query interactive demo (<a href="https://github.com/jsoverson/shift-query">Github</a>)</h1>
  </header>
  <main class="content">
	<Editor></Editor>
  </main>
</div>
