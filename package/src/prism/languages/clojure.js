import { languages } from '../core.js';

// Copied from https://github.com/jeluard/prism-clojure
languages.clojure = {
	'comment': {
		pattern: /;.*/g,
		greedy: true
	},
	'string': {
		pattern: /"(?:\\.|[^\\"])*"/g,
		greedy: true
	},
	'char': /\\\w+/,
	'symbol': {
		pattern: /(^|[\s()[\]{},])::?[\w*+!?'<>=/.-]+/,
		lookbehind: true
	},
	'keyword': {
		pattern: /(\()(?:->?>?|\.\.?|[*/+]|[=<>]=?|accessor|agent|agent-errors|aget|alength|all-ns|alter|and|append-child|apply|array-map|aset|aset-boolean|aset-byte|aset-char|aset-double|aset-float|aset-int|aset-long|aset-short|assert|assoc|await-for|await|bean|binding|bit-and|bit-not|bit-or|bit-shift-left|bit-shift-right|bit-xor|boolean|branch\?|butlast|byte|cast|char|children|class|clear-agent-errors|comment|commute|comparator|complement|comp|concat|con[djs]|constantly|construct-proxy|contains\?|count|create-ns|create-struct|cycle|dec|declare|definline|definterface|defmacro|defmethod|defmulti|defn|defn-|defonce|defproject|defprotocol|defrecord|defstruct|deftype|def-?|deref|difference|disj|dissoc|distinct|doall|doc|dorun|doseq|dosync|dotimes|doto|double|down|do|drop-while|drop|edit|end\?|ensure|eval|every\?|false\?|[fr]?first|file-seq|filter|find|find-doc|find-ns|find-var|float|flush|fnseq|fn|for|frest|gensym|get-proxy-class|get|hash-map|hash-set|identical\?|identity|if-let|if-not|if|import|in-ns|inc|index|insert-child|insert-left|insert-right|inspect-table|inspect-tree|instance\?|interleave|intersection|into-array|into|int|iterate|join|keys?|keyword\??|last|lazy-cat|lazy-cons|lefts?|let|line-seq|list\*?|load-file|load|locking|long|loop|macroexpand-1|macroexpand|make-array|make-node|map-invert|mapcat|map\??|max-key|max|memfn|merge-with|merge|meta|min-key|min|monitor-enter|namespace|name|neg\?|newline|new|next|nil\?|node|not-any\?|not-every\?|not=?|ns-imports|ns-interns|ns-map|ns-name|ns-publics|ns-refers|ns-resolve|ns-unmap|ns|nthrest|nth|or|parse|partial|path|peek|pop|pos\?|pr-str|print-str|println|println-str|print|prn-str|prn|project|proxy-mappings|proxy|pr|quot|quote|rand-int|rand|range|re-find|re-groups|re-matcher|re-matches|re-pattern|re-seq|read-line|read|recur|reduce|ref-set|refer|ref|remove-method|remove-ns|remove|rem|rename-keys|rename|repeat|replace|replicate|resolve|rest|resultset-seq|reverse|rights?|root|rrest|rseq|second|select-keys|select|send-off|send|seq-zip|seq\??|set!?|short|slurp|some|sort-by|sorted-map|sorted-map-by|sorted-set|sort|special-symbol\?|split-at|split-with|string\?|struct-map|struct|str|subs|subvec|symbol\??|sync|take-nth|take-while|take|test|throw|time|to-array-2d|to-array|tree-seq|true\?|try|union|update-proxy|up|vals?|var-get|var-set|var\??|vector-zip|vector\??|when-first|when-let|when-not|when|with-local-vars|with-meta|with-open|with-out-str|xml-seq|xml-zip|zero\?|zipmap|zipper)(?=[\s)]|$)/,
		lookbehind: true
	},
	'boolean': /\b(?:false|nil|true)\b/,
	'number': {
		pattern: /(^|[^$\w@])(?:\d+(?:[/.]\d+)?(?:e[+-]?\d+)?|0x[a-f\d]+|[1-9]\d?r[a-z\d]+)[lmn]?(?![$\w@])/i,
		lookbehind: true
	},
	'function': {
		pattern: /((?:^|[^'])\()[\w*+!?'<>=/.-]+(?=[\s)]|$)/,
		lookbehind: true
	},
	'operator': /[#@^`~]/,
	'punctuation': /[()[\]{},]/
};
