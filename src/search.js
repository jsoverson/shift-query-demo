import CodeMirror from "codemirror";

import searchcursor from "codemirror/addon/search/searchcursor.js";
import annotatescrollbar from "codemirror/addon/scroll/annotatescrollbar.js";
import matchesonscrollbar from "codemirror/addon/search/matchesonscrollbar.js";
import jumpToLine from "codemirror/addon/search/jump-to-line.js";
import dialog from "codemirror/addon/dialog/dialog.js";
import "../node_modules/codemirror/addon/search/matchesonscrollbar.css";
import "../node_modules/codemirror/addon/dialog/dialog.css";

(function() {
  "use strict";

  function searchOverlay(query, caseInsensitive) {
    if (typeof query == "string")
      query = new RegExp(
        query.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&"),
        caseInsensitive ? "gi" : "g"
      );
    else if (!query.global)
      query = new RegExp(query.source, query.ignoreCase ? "gi" : "g");

    return {
      token: function(stream) {
        query.lastIndex = stream.pos;
        var match = query.exec(stream.string);
        if (match && match.index == stream.pos) {
          stream.pos += match[0].length || 1;
          return "nodeFound";
        } else if (match) {
          stream.pos = match.index;
        } else {
          stream.skipToEnd();
        }
      }
    };
  }

  function SearchState() {
    this.posFrom = this.posTo = this.lastQuery = this.query = null;
    this.overlay = null;
  }

  function getSearchState(cm) {
    return cm.state.search || (cm.state.search = new SearchState());
  }

  function queryCaseInsensitive(query) {
    return typeof query == "string" && query == query.toLowerCase();
  }

  function getSearchCursor(cm, query, pos) {
    // Heuristic: if the query string is all lowercase, do a case insensitive search.
    return cm.getSearchCursor(query, pos, {
      caseFold: queryCaseInsensitive(query),
      multiline: true
    });
  }

  function parseString(string) {
    return string.replace(/\\([nrt\\])/g, function(match, ch) {
      if (ch == "n") return "\n";
      if (ch == "r") return "\r";
      if (ch == "t") return "\t";
      if (ch == "\\") return "\\";
      return match;
    });
  }

  function parseQuery(query) {
    var isRE = query.match(/^\/(.*)\/([a-z]*)$/);
    if (isRE) {
      try {
        query = new RegExp(isRE[1], isRE[2].indexOf("i") == -1 ? "" : "i");
      } catch (e) {} // Not a regular expression after all, do a string search
    } else {
      query = parseString(query);
    }
    if (typeof query == "string" ? query == "" : query.test("")) query = /x^/;
    return query;
  }

  function startSearch(cm, state, query) {
    state.queryText = query;
    state.query = parseQuery(query);
    cm.removeOverlay(state.overlay, queryCaseInsensitive(state.query));
    state.overlay = searchOverlay(
      state.query,
      queryCaseInsensitive(state.query)
    );
    cm.addOverlay(state.overlay);
    if (cm.showMatchesOnScrollbar) {
      if (state.annotate) {
        state.annotate.clear();
        state.annotate = null;
      }
      state.annotate = cm.showMatchesOnScrollbar(
        state.query,
        queryCaseInsensitive(state.query)
      );
    }
  }

  function doSearch(cm, rev, persistent, immediate) {
    var state = getSearchState(cm);
    if (state.query) return findNext(cm, rev);
    var q = cm.getSelection() || state.lastQuery;
    if (q instanceof RegExp && q.source == "x^") q = null;
    const query = "console";
    cm.operation(function() {
      startSearch(cm, state, query);
      state.posFrom = state.posTo = cm.getCursor();
      findNext(cm, rev);
    });
  }

  function findNext(cm, rev, callback) {
    cm.operation(function() {
      var state = getSearchState(cm);
      var cursor = getSearchCursor(
        cm,
        state.query,
        rev ? state.posFrom : state.posTo
      );
      if (!cursor.find(rev)) {
        cursor = getSearchCursor(
          cm,
          state.query,
          rev
            ? CodeMirror.Pos(cm.lastLine())
            : CodeMirror.Pos(cm.firstLine(), 0)
        );
        if (!cursor.find(rev)) return;
      }
      cm.setSelection(cursor.from(), cursor.to());
      cm.scrollIntoView({ from: cursor.from(), to: cursor.to() }, 20);
      state.posFrom = cursor.from();
      state.posTo = cursor.to();
      if (callback) callback(cursor.from(), cursor.to());
    });
  }

  function clearSearch(cm) {
    cm.operation(function() {
      var state = getSearchState(cm);
      state.lastQuery = state.query;
      if (!state.query) return;
      state.query = state.queryText = null;
      cm.removeOverlay(state.overlay);
      if (state.annotate) {
        state.annotate.clear();
        state.annotate = null;
      }
    });
  }

  CodeMirror.commands.find = function(cm) {
    console.log("finding");
    clearSearch(cm);
    doSearch(cm);
  };

  CodeMirror.commands.highlightNodes = function(nodes) {

  }

})();

function getOverlay(nodes) {
  const sortedNodes = nodes.sort((a,b) => {
    return a.loc.start.offset > b.loc.start.offset ? 1 : a.loc.start.offset < b.loc.start.offset ? -1 : 0;
  })
  let index = 0;
  return {
    token: function(stream) {

      debugger;
      return "nodeFound";
      query.lastIndex = stream.pos;
      var match = query.exec(stream.string);
      if (match && match.index == stream.pos) {
        stream.pos += match[0].length || 1;
        return "nodeFound";
      } else if (match) {
        stream.pos = match.index;
      } else {
        stream.skipToEnd();
      }
    }
  }
}

let markers = [];

export function highlight(cm, nodes) {
  const doc = cm.getDoc();
  markers.forEach(marker => marker.clear())
  markers = nodes.map((node,i) => {
    const start = doc.posFromIndex(node.loc.start.offset);
    const end = doc.posFromIndex(node.loc.end.offset);
    return doc.markText(start, end,
      {
        className: `cm-nodeFound cm-nodeFound-${i}`
      }
    );
  })
}
