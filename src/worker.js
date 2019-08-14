import { parseScriptWithLocation } from 'shift-parser';
import query from 'shift-query';

onmessage = function(event) {
  const {tree, locations, comments} = parseScriptWithLocation(event.data.source);
  const nodes = query(tree, event.data.query);
  const results = nodes.map(node => ({node:node, loc: locations.get(node)}));
  postMessage(results);
}
