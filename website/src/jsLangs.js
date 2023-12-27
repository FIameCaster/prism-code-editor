// The website uses a modified javascript grammar. Therefore
// i can't import any grammars that depend on javascript, since
// then the normal js-grammar will get imported.

import { Prism as e } from "prism-code-editor"
var t=e.languages,n=t.insertBefore,a=e.util.clone(t.js),r=t.jsx=t.extend("markup",a),s=(x=r.tag).inside,i=/(?:\s|\/\/.*(?!.)|\/\*(?:[^*]|\*(?!\/))*\*\/)/.source,p=/(?:\{(?:\{(?:\{[^{}]*\}|[^{}])*\}|[^{}])*\})/.source,o=/(?:\{<S>*\.{3}(?:[^{}]|<BRACES>)*\})/,l=e=>RegExp(e.source.replace(/<S>/g,i).replace(/<BRACES>/g,p).replace(/<SPREAD>/g,o.source));o=l(o),x.pattern=l(/<\/?(?:(?!\d)[^\s>\/=<%]+(?:<S>+(?:[^\s{*<>\/=]+(?:<S>*=\s*(?:"[^"]*"|'[^']*'|[^\s{'"\/>=]+|<BRACES>)?)?|<SPREAD>))*<S>*\/?)?>/),s.tag.pattern=/^<\/?[^\s>/]*/,s["attr-value"].pattern=/=\s*(?:"[^"]*"|'[^']*'|[^\s\/'">]+)?/,s.tag.inside["class-name"]=/^[A-Z]\w*(?:\.[A-Z]\w*)*$/,s.comment=a.comment,delete r.style,delete r.script,delete r["markup-bracket"],n("inside","attr-name",{spread:{pattern:o,inside:r}},x),n("inside","special-attr",{script:{pattern:l(/=<BRACES>/),alias:"language-jsx",inside:{"script-punctuation":{pattern:/^=/,alias:"punctuation"},rest:r}}},x);var c=e=>e&&e.type?Array.isArray(e=e.content)?e.map(c).join(""):e:e||"",d=t=>{for(var n=0,a=[];n<t.length;n++){var r,s=t[n],i=!1,p=s.content,o=s.type;if(o&&("tag"==o&&"tag"==p[0].type?"</"==p[0].content[0].content?a[0]&&a[a.length-1][0]==c(p[0].content[1])&&a.pop():">"==p[p.length-1].content&&a.push([c(p[0].content[1]),0]):a[0]&&"punctuation"==o?(r=a[a.length-1],"{"==p?r[1]++:r[1]&&"}"==p?r[1]--:i=!0):i=!0),(i||!o)&&a[0]&&!a[a.length-1][1]){var l=c(s),u=e=>e&&(!e.type||"plain-text"==e.type);u(t[n+1])&&(l+=c(t[n+1]),t.splice(n+1,1)),u(t[n-1])&&(l=c(t[--n])+l,t.splice(n,1)),t[n]=new e.Token("plain-text",l,null,l)}Array.isArray(p)&&d(p)}};e.hooks.add("after-tokenize",(e=>{"jsx"!=e.language&&"tsx"!=e.language||d(e.tokens)}));var u=t.ts=t.typescript=t.extend("js",{"class-name":{pattern:/(\b(?:class|extends|implements|instanceof|interface|new|type)\s+)(?!keyof\b)(?!\d)(?:(?!\s)[$\w\xA0-\uFFFF])+(?:\s*<(?:[^<>]|<(?:[^<>]|<[^<>]*>)*>)*>)?/,lookbehind:!0,greedy:!0},builtin:/\b(?:Array|Function|Promise|any|boolean|never|number|string|symbol|unknown)\b/});u.keyword.push(/\b(?:abstract|declare|is|keyof|readonly|require)\b/,/\b(?:asserts|infer|interface|module|namespace|type)\b(?=\s*(?:[{_$a-zA-Z\xA0-\uFFFF]|$))/,/\btype\b(?=\s*(?:[\{*]|$))/),delete u.parameter,delete u["literal-property"];var m=e.util.clone(u);delete m["class-name"],u["class-name"].inside=m,n("typescript","function",{decorator:{pattern:/@[$\w\xA0-\uFFFF]+/,inside:{at:{pattern:/^@/,alias:"operator"},function:/^[\s\S]+/}},"generic-function":{pattern:/#?(?!\d)(?:(?!\s)[$\w\xA0-\uFFFF])+\s*<(?:[^<>]|<(?:[^<>]|<[^<>]*>)*>)*>(?=\s*\()/,greedy:!0,inside:{function:/^#?(?!\d)(?:(?!\s)[$\w\xA0-\uFFFF])+/,generic:{pattern:/<[\s\S]+/,alias:"class-name",inside:m}}}});var g=e.util.clone(t.ts),y=t.tsx=t.extend("jsx",g),x=y.tag,F="(?:^|(";delete y.parameter,delete y["literal-property"];try{RegExp("(?<=)"),F+="?<="}catch{x.lookbehind=!0}x.pattern=RegExp(F+`[^\\w$])|(?=</))${x.pattern.source}`,"g");
