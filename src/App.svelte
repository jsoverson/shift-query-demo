<script>
	import Editor from './Editor.svelte';

  export let name;
</script>

<style>
  h1 {
    color: black;
  }
  .app {
    display: grid;
    grid-template-columns: 1fr;
	  grid-template-rows: repeat(3, auto);
    grid-column-gap: 0px;
		grid-row-gap: 0px;
		height:100vh;
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
</style>

<div class="app">
  <header>
    <h1>Shift-query interactive demo (<a href="https://github.com/jsoverson/shift-query">Github</a>)</h1>
  </header>
  <main class="content">
	<Editor></Editor>
  </main>
</div>
