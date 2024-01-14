import { languages } from '../core.js';
import { createT4 } from '../utils/t4-templating.js';
import './csharp.js';

languages.t4 = languages['t4-cs'] = createT4('csharp');
