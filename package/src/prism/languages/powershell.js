import { languages } from '../core.js';

var string = {
	pattern: /"(?:`[\s\S]|[^`"])*"/g,
	greedy: true
};

var powershell = languages.powershell = {
	'comment': {
		pattern: /(^|[^`])(?:#.*|<#[\s\S]*?#>)/,
		lookbehind: true
	},
	'string': [
		string,
		{
			pattern: /'(?:[^']|'')*'/g,
			greedy: true
		}
	],
	// Matches name spaces as well as casts, attribute decorators. Force starting with letter to avoid matching array indices
	// Supports two levels of nested brackets (e.g. `[OutputType([System.Collections.Generic.List[int]])]`)
	'namespace': /\[[a-z](?:\[(?:\[[^\]]*\]|[^[\]])*\]|[^[\]])*\]/i,
	'boolean': /\$(?:false|true)\b/i,
	'variable': /\$\w+/,
	// Cmdlets and aliases. Aliases should come last, otherwise "write" gets preferred over "write-host" for example
	// Get-Command | ?{ $_.ModuleName -match "Microsoft.PowerShell.(Util|Core|Management)" }
	// Get-Alias | ?{ $_.ReferencedCommand.Module.Name -match "Microsoft.PowerShell.(Util|Core|Management)" }
	'function': [
		/\b(?:add|approve|assert|backup|block|checkpoint|clear|close|compare|complete|compress|confirm|connect|convert|convertfrom|convertto|copy|debug|deny|disable|disconnect|dismount|edit|enable|enter|exit|expand|export|find|foreach|format|get|grant|group|hide|import|initialize|install|invoke|join|limit|lock|measure|merge|move|new|open|optimize|out|ping|pop|protect|publish|push|read|receive|redo|register|remove|rename|repair|request|reset|resize|resolve|restart|restore|resume|revoke|save|search|select|send|set|show|skip|sort|split|start|step|stop|submit|suspend|switch|sync|tee|test|trace|unblock|undo|uninstall|unlock|unprotect|unpublish|unregister|update|use|wait|watch|where|write)-[a-z]+\b/i,
		/\b(?:ac|cat|chdir|clc|cli|clp|clv|compare|copy|cp|cpi|cpp|cvpa|dbp|del|diff|dir|ebp|echo|epal|epcsv|epsn|erase|fc|fl|ft|fw|gal|gbp|gc|gci|gcs|gdr|gi|gl|gm|gp|gps|group|gsv|gu|gv|gwmi|iex|ii|ipal|ipcsv|ipsn|irm|iwmi|iwr|kill|lp|ls|measure|mi|mount|move|mp|mv|nal|ndr|ni|nv|ogv|popd|ps|pushd|pwd|rbp|rd|rdr|ren|ri|rm|rmdir|rni|rnp|rp|rv|rvpa|rwmi|sal|saps|sasv|sbp|sc|select|set|shcm|si|sl|sleep|sls|sort|sp|spps|spsv|start|sv|swmi|tee|trcm|type|write)\b/i
	],
	// per http://technet.microsoft.com/en-us/library/hh847744.aspx
	'keyword': /\b(?:begin|break|catch|class|continue|data|define|do|dynamicparam|else|elseif|end|exit|filter|finally|for|foreach|from|function|if|inlinescript|parallel|param|process|return|sequence|switch|throw|trap|try|until|using|var|while|workflow)\b/i,
	'operator': {
		pattern: /(^|\W)(?:!|-(?:b?(?:and|x?or)|as|(?:Not)?(?:contains|in|like|match)|eq|ge|gt|is(?:Not)?|join|le|lt|ne|not|replace|sh[lr])\b|-[-=]?|\+[+=]?|[*\/%]=?)/i,
		lookbehind: true
	},
	'punctuation': /[()[\]{}.,;|]/
};

// Variable interpolation inside strings, and nested expressions
string.inside = {
	'function': {
		// Allow for one level of nesting
		pattern: /(^|[^`])\$\((?:\$\([^\n()]*\)|(?!\$\()[^\n)])*\)/,
		lookbehind: true,
		inside: powershell
	},
	'boolean': powershell.boolean,
	'variable': powershell.variable,
};
