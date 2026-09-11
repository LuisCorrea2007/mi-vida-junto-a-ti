import { n as createSingletonShorthands, r as guessEmbeddedLanguages, t as createBundledHighlighter } from "./@shikijs/core+[...].mjs";
import { t as createOnigurumaEngine } from "./shikijs__engine-oniguruma.mjs";
import { t as createJavaScriptRegexEngine } from "./@shikijs/engine-javascript+[...].mjs";
//#region node_modules/@streamdown/code/node_modules/shiki/dist/langs.mjs
var bundledLanguagesInfo = [
	{
		"id": "abap",
		"name": "ABAP",
		"import": (() => import("./_19.mjs"))
	},
	{
		"id": "actionscript-3",
		"name": "ActionScript",
		"import": (() => import("./_20.mjs"))
	},
	{
		"id": "ada",
		"name": "Ada",
		"import": (() => import("./_21.mjs"))
	},
	{
		"id": "angular-html",
		"name": "Angular HTML",
		"import": (() => import("./_25.mjs"))
	},
	{
		"id": "angular-ts",
		"name": "Angular TypeScript",
		"import": (() => import("./_27.mjs"))
	},
	{
		"id": "apache",
		"name": "Apache Conf",
		"import": (() => import("./_28.mjs"))
	},
	{
		"id": "apex",
		"name": "Apex",
		"import": (() => import("./_29.mjs"))
	},
	{
		"id": "apl",
		"name": "APL",
		"import": (() => import("./_33.mjs"))
	},
	{
		"id": "applescript",
		"name": "AppleScript",
		"import": (() => import("./_34.mjs"))
	},
	{
		"id": "ara",
		"name": "Ara",
		"import": (() => import("./_35.mjs"))
	},
	{
		"id": "asciidoc",
		"name": "AsciiDoc",
		"aliases": ["adoc"],
		"import": (() => import("./_36.mjs"))
	},
	{
		"id": "asm",
		"name": "Assembly",
		"import": (() => import("./_37.mjs"))
	},
	{
		"id": "astro",
		"name": "Astro",
		"import": (() => import("./_41.mjs"))
	},
	{
		"id": "awk",
		"name": "AWK",
		"import": (() => import("./_42.mjs"))
	},
	{
		"id": "ballerina",
		"name": "Ballerina",
		"import": (() => import("./_43.mjs"))
	},
	{
		"id": "bat",
		"name": "Batch File",
		"aliases": ["batch"],
		"import": (() => import("./_44.mjs"))
	},
	{
		"id": "beancount",
		"name": "Beancount",
		"import": (() => import("./_45.mjs"))
	},
	{
		"id": "berry",
		"name": "Berry",
		"aliases": ["be"],
		"import": (() => import("./_46.mjs"))
	},
	{
		"id": "bibtex",
		"name": "BibTeX",
		"import": (() => import("./_47.mjs"))
	},
	{
		"id": "bicep",
		"name": "Bicep",
		"import": (() => import("./_48.mjs"))
	},
	{
		"id": "bird2",
		"name": "BIRD2 Configuration",
		"aliases": ["bird"],
		"import": (() => import("./_49.mjs"))
	},
	{
		"id": "blade",
		"name": "Blade",
		"import": (() => import("./_52.mjs"))
	},
	{
		"id": "bsl",
		"name": "1C (Enterprise)",
		"aliases": ["1c"],
		"import": (() => import("./_54.mjs"))
	},
	{
		"id": "c",
		"name": "C",
		"import": (() => import("./_55.mjs"))
	},
	{
		"id": "c3",
		"name": "C3",
		"import": (() => import("./_56.mjs"))
	},
	{
		"id": "cadence",
		"name": "Cadence",
		"aliases": ["cdc"],
		"import": (() => import("./_57.mjs"))
	},
	{
		"id": "cairo",
		"name": "Cairo",
		"import": (() => import("./_59.mjs"))
	},
	{
		"id": "clarity",
		"name": "Clarity",
		"import": (() => import("./_60.mjs"))
	},
	{
		"id": "clojure",
		"name": "Clojure",
		"aliases": ["clj"],
		"import": (() => import("./_61.mjs"))
	},
	{
		"id": "cmake",
		"name": "CMake",
		"import": (() => import("./_62.mjs"))
	},
	{
		"id": "cobol",
		"name": "COBOL",
		"import": (() => import("./_63.mjs"))
	},
	{
		"id": "codeowners",
		"name": "CODEOWNERS",
		"import": (() => import("./_64.mjs"))
	},
	{
		"id": "codeql",
		"name": "CodeQL",
		"aliases": ["ql"],
		"import": (() => import("./_65.mjs"))
	},
	{
		"id": "coffee",
		"name": "CoffeeScript",
		"aliases": ["coffeescript"],
		"import": (() => import("./_66.mjs"))
	},
	{
		"id": "common-lisp",
		"name": "Common Lisp",
		"aliases": ["lisp"],
		"import": (() => import("./_67.mjs"))
	},
	{
		"id": "coq",
		"name": "Coq",
		"import": (() => import("./_68.mjs"))
	},
	{
		"id": "cpp",
		"name": "C++",
		"aliases": ["c++"],
		"import": (() => import("./_71.mjs"))
	},
	{
		"id": "crystal",
		"name": "Crystal",
		"import": (() => import("./_73.mjs"))
	},
	{
		"id": "csharp",
		"name": "C#",
		"aliases": ["c#", "cs"],
		"import": (() => import("./_74.mjs"))
	},
	{
		"id": "css",
		"name": "CSS",
		"import": (() => import("./_23.mjs"))
	},
	{
		"id": "csv",
		"name": "CSV",
		"import": (() => import("./_75.mjs"))
	},
	{
		"id": "cue",
		"name": "CUE",
		"import": (() => import("./_76.mjs"))
	},
	{
		"id": "cypher",
		"name": "Cypher",
		"aliases": ["cql"],
		"import": (() => import("./_77.mjs"))
	},
	{
		"id": "d",
		"name": "D",
		"import": (() => import("./_78.mjs"))
	},
	{
		"id": "dart",
		"name": "Dart",
		"import": (() => import("./_79.mjs"))
	},
	{
		"id": "dax",
		"name": "DAX",
		"import": (() => import("./_80.mjs"))
	},
	{
		"id": "desktop",
		"name": "Desktop",
		"import": (() => import("./_81.mjs"))
	},
	{
		"id": "diff",
		"name": "Diff",
		"import": (() => import("./_82.mjs"))
	},
	{
		"id": "docker",
		"name": "Dockerfile",
		"aliases": ["dockerfile"],
		"import": (() => import("./_83.mjs"))
	},
	{
		"id": "dotenv",
		"name": "dotEnv",
		"import": (() => import("./_84.mjs"))
	},
	{
		"id": "dream-maker",
		"name": "Dream Maker",
		"import": (() => import("./_85.mjs"))
	},
	{
		"id": "edge",
		"name": "Edge",
		"import": (() => import("./_86.mjs"))
	},
	{
		"id": "elixir",
		"name": "Elixir",
		"import": (() => import("./_87.mjs"))
	},
	{
		"id": "elm",
		"name": "Elm",
		"import": (() => import("./_88.mjs"))
	},
	{
		"id": "emacs-lisp",
		"name": "Emacs Lisp",
		"aliases": ["elisp"],
		"import": (() => import("./_89.mjs"))
	},
	{
		"id": "erb",
		"name": "ERB",
		"import": (() => import("./_96.mjs"))
	},
	{
		"id": "erlang",
		"name": "Erlang",
		"aliases": ["erl"],
		"import": (() => import("./_98.mjs"))
	},
	{
		"id": "fennel",
		"name": "Fennel",
		"import": (() => import("./_99.mjs"))
	},
	{
		"id": "fish",
		"name": "Fish",
		"import": (() => import("./_100.mjs"))
	},
	{
		"id": "fluent",
		"name": "Fluent",
		"aliases": ["ftl"],
		"import": (() => import("./_101.mjs"))
	},
	{
		"id": "fortran-fixed-form",
		"name": "Fortran (Fixed Form)",
		"aliases": [
			"f",
			"for",
			"f77"
		],
		"import": (() => import("./_103.mjs"))
	},
	{
		"id": "fortran-free-form",
		"name": "Fortran (Free Form)",
		"aliases": [
			"f90",
			"f95",
			"f03",
			"f08",
			"f18"
		],
		"import": (() => import("./_102.mjs"))
	},
	{
		"id": "fsharp",
		"name": "F#",
		"aliases": ["f#", "fs"],
		"import": (() => import("./_104.mjs"))
	},
	{
		"id": "gdresource",
		"name": "GDResource",
		"aliases": ["tscn", "tres"],
		"import": (() => import("./_107.mjs"))
	},
	{
		"id": "gdscript",
		"name": "GDScript",
		"aliases": ["gd"],
		"import": (() => import("./_106.mjs"))
	},
	{
		"id": "gdshader",
		"name": "GDShader",
		"import": (() => import("./_105.mjs"))
	},
	{
		"id": "genie",
		"name": "Genie",
		"import": (() => import("./_108.mjs"))
	},
	{
		"id": "gherkin",
		"name": "Gherkin",
		"import": (() => import("./_109.mjs"))
	},
	{
		"id": "git-commit",
		"name": "Git Commit Message",
		"import": (() => import("./_110.mjs"))
	},
	{
		"id": "git-rebase",
		"name": "Git Rebase Message",
		"import": (() => import("./_111.mjs"))
	},
	{
		"id": "gleam",
		"name": "Gleam",
		"import": (() => import("./_112.mjs"))
	},
	{
		"id": "glimmer-js",
		"name": "Glimmer JS",
		"aliases": ["gjs"],
		"import": (() => import("./_113.mjs"))
	},
	{
		"id": "glimmer-ts",
		"name": "Glimmer TS",
		"aliases": ["gts"],
		"import": (() => import("./_114.mjs"))
	},
	{
		"id": "glsl",
		"name": "GLSL",
		"import": (() => import("./_70.mjs"))
	},
	{
		"id": "gn",
		"name": "GN",
		"import": (() => import("./_115.mjs"))
	},
	{
		"id": "gnuplot",
		"name": "Gnuplot",
		"import": (() => import("./_116.mjs"))
	},
	{
		"id": "go",
		"name": "Go",
		"import": (() => import("./_117.mjs"))
	},
	{
		"id": "graphql",
		"name": "GraphQL",
		"aliases": ["gql"],
		"import": (() => import("./_92.mjs"))
	},
	{
		"id": "groovy",
		"name": "Groovy",
		"import": (() => import("./_118.mjs"))
	},
	{
		"id": "hack",
		"name": "Hack",
		"import": (() => import("./_119.mjs"))
	},
	{
		"id": "haml",
		"name": "Ruby Haml",
		"import": (() => import("./_90.mjs"))
	},
	{
		"id": "handlebars",
		"name": "Handlebars",
		"aliases": ["hbs"],
		"import": (() => import("./_120.mjs"))
	},
	{
		"id": "haskell",
		"name": "Haskell",
		"aliases": ["hs"],
		"import": (() => import("./_121.mjs"))
	},
	{
		"id": "haxe",
		"name": "Haxe",
		"import": (() => import("./_122.mjs"))
	},
	{
		"id": "hcl",
		"name": "HashiCorp HCL",
		"import": (() => import("./_123.mjs"))
	},
	{
		"id": "hjson",
		"name": "Hjson",
		"import": (() => import("./_124.mjs"))
	},
	{
		"id": "hlsl",
		"name": "HLSL",
		"import": (() => import("./_125.mjs"))
	},
	{
		"id": "html",
		"name": "HTML",
		"import": (() => import("./_24.mjs"))
	},
	{
		"id": "html-derivative",
		"name": "HTML (Derivative)",
		"import": (() => import("./_50.mjs"))
	},
	{
		"id": "http",
		"name": "HTTP",
		"import": (() => import("./_126.mjs"))
	},
	{
		"id": "hurl",
		"name": "Hurl",
		"import": (() => import("./_127.mjs"))
	},
	{
		"id": "hxml",
		"name": "HXML",
		"import": (() => import("./_128.mjs"))
	},
	{
		"id": "hy",
		"name": "Hy",
		"import": (() => import("./_129.mjs"))
	},
	{
		"id": "imba",
		"name": "Imba",
		"import": (() => import("./_130.mjs"))
	},
	{
		"id": "ini",
		"name": "INI",
		"aliases": ["properties"],
		"import": (() => import("./_131.mjs"))
	},
	{
		"id": "java",
		"name": "Java",
		"import": (() => import("./_30.mjs"))
	},
	{
		"id": "javascript",
		"name": "JavaScript",
		"aliases": [
			"js",
			"cjs",
			"mjs"
		],
		"import": (() => import("./_22.mjs"))
	},
	{
		"id": "jinja",
		"name": "Jinja",
		"import": (() => import("./_132.mjs"))
	},
	{
		"id": "jison",
		"name": "Jison",
		"import": (() => import("./_133.mjs"))
	},
	{
		"id": "json",
		"name": "JSON",
		"import": (() => import("./_32.mjs"))
	},
	{
		"id": "json5",
		"name": "JSON5",
		"import": (() => import("./_134.mjs"))
	},
	{
		"id": "jsonc",
		"name": "JSON with Comments",
		"import": (() => import("./_135.mjs"))
	},
	{
		"id": "jsonl",
		"name": "JSON Lines",
		"import": (() => import("./_136.mjs"))
	},
	{
		"id": "jsonnet",
		"name": "Jsonnet",
		"import": (() => import("./_137.mjs"))
	},
	{
		"id": "jssm",
		"name": "JSSM",
		"aliases": ["fsl"],
		"import": (() => import("./_138.mjs"))
	},
	{
		"id": "jsx",
		"name": "JSX",
		"import": (() => import("./_91.mjs"))
	},
	{
		"id": "julia",
		"name": "Julia",
		"aliases": ["jl"],
		"import": (() => import("./_140.mjs"))
	},
	{
		"id": "just",
		"name": "Just",
		"import": (() => import("./_142.mjs"))
	},
	{
		"id": "kdl",
		"name": "KDL",
		"import": (() => import("./_143.mjs"))
	},
	{
		"id": "kotlin",
		"name": "Kotlin",
		"aliases": ["kt", "kts"],
		"import": (() => import("./_144.mjs"))
	},
	{
		"id": "kusto",
		"name": "Kusto",
		"aliases": ["kql"],
		"import": (() => import("./_145.mjs"))
	},
	{
		"id": "latex",
		"name": "LaTeX",
		"import": (() => import("./_147.mjs"))
	},
	{
		"id": "lean",
		"name": "Lean 4",
		"aliases": ["lean4"],
		"import": (() => import("./_148.mjs"))
	},
	{
		"id": "less",
		"name": "Less",
		"import": (() => import("./_149.mjs"))
	},
	{
		"id": "liquid",
		"name": "Liquid",
		"import": (() => import("./_150.mjs"))
	},
	{
		"id": "llvm",
		"name": "LLVM IR",
		"import": (() => import("./_151.mjs"))
	},
	{
		"id": "log",
		"name": "Log file",
		"import": (() => import("./_152.mjs"))
	},
	{
		"id": "logo",
		"name": "Logo",
		"import": (() => import("./_153.mjs"))
	},
	{
		"id": "lua",
		"name": "Lua",
		"import": (() => import("./_93.mjs"))
	},
	{
		"id": "luau",
		"name": "Luau",
		"import": (() => import("./_154.mjs"))
	},
	{
		"id": "make",
		"name": "Makefile",
		"aliases": ["makefile"],
		"import": (() => import("./_155.mjs"))
	},
	{
		"id": "markdown",
		"name": "Markdown",
		"aliases": ["md"],
		"import": (() => import("./_97.mjs"))
	},
	{
		"id": "marko",
		"name": "Marko",
		"import": (() => import("./_156.mjs"))
	},
	{
		"id": "matlab",
		"name": "MATLAB",
		"import": (() => import("./_157.mjs"))
	},
	{
		"id": "mdc",
		"name": "MDC",
		"import": (() => import("./_158.mjs"))
	},
	{
		"id": "mdx",
		"name": "MDX",
		"import": (() => import("./_159.mjs"))
	},
	{
		"id": "mermaid",
		"name": "Mermaid",
		"aliases": ["mmd"],
		"import": (() => import("./_160.mjs"))
	},
	{
		"id": "mipsasm",
		"name": "MIPS Assembly",
		"aliases": ["mips"],
		"import": (() => import("./_161.mjs"))
	},
	{
		"id": "mojo",
		"name": "Mojo",
		"import": (() => import("./_162.mjs"))
	},
	{
		"id": "moonbit",
		"name": "MoonBit",
		"aliases": ["mbt", "mbti"],
		"import": (() => import("./_163.mjs"))
	},
	{
		"id": "move",
		"name": "Move",
		"import": (() => import("./_164.mjs"))
	},
	{
		"id": "narrat",
		"name": "Narrat Language",
		"aliases": ["nar"],
		"import": (() => import("./_165.mjs"))
	},
	{
		"id": "nextflow",
		"name": "Nextflow",
		"aliases": ["nf"],
		"import": (() => import("./_167.mjs"))
	},
	{
		"id": "nextflow-groovy",
		"name": "nextflow-groovy",
		"import": (() => import("./_166.mjs"))
	},
	{
		"id": "nginx",
		"name": "Nginx",
		"import": (() => import("./_168.mjs"))
	},
	{
		"id": "nim",
		"name": "Nim",
		"import": (() => import("./_169.mjs"))
	},
	{
		"id": "nix",
		"name": "Nix",
		"import": (() => import("./_170.mjs"))
	},
	{
		"id": "nushell",
		"name": "nushell",
		"aliases": ["nu"],
		"import": (() => import("./_171.mjs"))
	},
	{
		"id": "objective-c",
		"name": "Objective-C",
		"aliases": ["objc"],
		"import": (() => import("./_172.mjs"))
	},
	{
		"id": "objective-cpp",
		"name": "Objective-C++",
		"import": (() => import("./_173.mjs"))
	},
	{
		"id": "ocaml",
		"name": "OCaml",
		"import": (() => import("./_174.mjs"))
	},
	{
		"id": "odin",
		"name": "Odin",
		"import": (() => import("./_175.mjs"))
	},
	{
		"id": "openscad",
		"name": "OpenSCAD",
		"aliases": ["scad"],
		"import": (() => import("./_176.mjs"))
	},
	{
		"id": "pascal",
		"name": "Pascal",
		"import": (() => import("./_177.mjs"))
	},
	{
		"id": "perl",
		"name": "Perl",
		"import": (() => import("./_141.mjs"))
	},
	{
		"id": "php",
		"name": "PHP",
		"import": (() => import("./_178.mjs"))
	},
	{
		"id": "pkl",
		"name": "Pkl",
		"import": (() => import("./_179.mjs"))
	},
	{
		"id": "plsql",
		"name": "PL/SQL",
		"import": (() => import("./_180.mjs"))
	},
	{
		"id": "po",
		"name": "Gettext PO",
		"aliases": ["pot", "potx"],
		"import": (() => import("./_181.mjs"))
	},
	{
		"id": "polar",
		"name": "Polar",
		"import": (() => import("./_182.mjs"))
	},
	{
		"id": "postcss",
		"name": "PostCSS",
		"import": (() => import("./_39.mjs"))
	},
	{
		"id": "powerquery",
		"name": "PowerQuery",
		"import": (() => import("./_183.mjs"))
	},
	{
		"id": "powershell",
		"name": "PowerShell",
		"aliases": ["ps", "ps1"],
		"import": (() => import("./_184.mjs"))
	},
	{
		"id": "prisma",
		"name": "Prisma",
		"import": (() => import("./_185.mjs"))
	},
	{
		"id": "prolog",
		"name": "Prolog",
		"import": (() => import("./_186.mjs"))
	},
	{
		"id": "proto",
		"name": "Protocol Buffer 3",
		"aliases": ["protobuf"],
		"import": (() => import("./_187.mjs"))
	},
	{
		"id": "pug",
		"name": "Pug",
		"aliases": ["jade"],
		"import": (() => import("./_188.mjs"))
	},
	{
		"id": "puppet",
		"name": "Puppet",
		"import": (() => import("./_189.mjs"))
	},
	{
		"id": "purescript",
		"name": "PureScript",
		"import": (() => import("./_190.mjs"))
	},
	{
		"id": "python",
		"name": "Python",
		"aliases": ["py"],
		"import": (() => import("./_58.mjs"))
	},
	{
		"id": "qml",
		"name": "QML",
		"import": (() => import("./_191.mjs"))
	},
	{
		"id": "qmldir",
		"name": "QML Directory",
		"import": (() => import("./_192.mjs"))
	},
	{
		"id": "qss",
		"name": "Qt Style Sheets",
		"import": (() => import("./_193.mjs"))
	},
	{
		"id": "r",
		"name": "R",
		"import": (() => import("./_139.mjs"))
	},
	{
		"id": "racket",
		"name": "Racket",
		"import": (() => import("./_194.mjs"))
	},
	{
		"id": "raku",
		"name": "Raku",
		"aliases": ["perl6"],
		"import": (() => import("./_195.mjs"))
	},
	{
		"id": "razor",
		"name": "ASP.NET Razor",
		"import": (() => import("./_196.mjs"))
	},
	{
		"id": "reg",
		"name": "Windows Registry Script",
		"import": (() => import("./_197.mjs"))
	},
	{
		"id": "regexp",
		"name": "RegExp",
		"aliases": ["regex"],
		"import": (() => import("./_69.mjs"))
	},
	{
		"id": "rel",
		"name": "Rel",
		"import": (() => import("./_198.mjs"))
	},
	{
		"id": "riscv",
		"name": "RISC-V",
		"import": (() => import("./_199.mjs"))
	},
	{
		"id": "ron",
		"name": "RON",
		"import": (() => import("./_200.mjs"))
	},
	{
		"id": "rosmsg",
		"name": "ROS Interface",
		"import": (() => import("./_201.mjs"))
	},
	{
		"id": "rst",
		"name": "reStructuredText",
		"import": (() => import("./_202.mjs"))
	},
	{
		"id": "ruby",
		"name": "Ruby",
		"aliases": ["rb"],
		"import": (() => import("./_95.mjs"))
	},
	{
		"id": "rust",
		"name": "Rust",
		"aliases": ["rs"],
		"import": (() => import("./_203.mjs"))
	},
	{
		"id": "sas",
		"name": "SAS",
		"import": (() => import("./_204.mjs"))
	},
	{
		"id": "sass",
		"name": "Sass",
		"import": (() => import("./_205.mjs"))
	},
	{
		"id": "scala",
		"name": "Scala",
		"import": (() => import("./_206.mjs"))
	},
	{
		"id": "scheme",
		"name": "Scheme",
		"import": (() => import("./_207.mjs"))
	},
	{
		"id": "scss",
		"name": "SCSS",
		"import": (() => import("./_26.mjs"))
	},
	{
		"id": "sdbl",
		"name": "1C (Query)",
		"aliases": ["1c-query"],
		"import": (() => import("./_53.mjs"))
	},
	{
		"id": "shaderlab",
		"name": "ShaderLab",
		"aliases": ["shader"],
		"import": (() => import("./_208.mjs"))
	},
	{
		"id": "shellscript",
		"name": "Shell",
		"aliases": [
			"bash",
			"sh",
			"shell",
			"zsh"
		],
		"import": (() => import("./_72.mjs"))
	},
	{
		"id": "shellsession",
		"name": "Shell Session",
		"aliases": ["console"],
		"import": (() => import("./_209.mjs"))
	},
	{
		"id": "smalltalk",
		"name": "Smalltalk",
		"import": (() => import("./_210.mjs"))
	},
	{
		"id": "solidity",
		"name": "Solidity",
		"import": (() => import("./_211.mjs"))
	},
	{
		"id": "soy",
		"name": "Closure Templates",
		"aliases": ["closure-templates"],
		"import": (() => import("./_212.mjs"))
	},
	{
		"id": "sparql",
		"name": "SPARQL",
		"import": (() => import("./_214.mjs"))
	},
	{
		"id": "splunk",
		"name": "Splunk Query Language",
		"aliases": ["spl"],
		"import": (() => import("./_215.mjs"))
	},
	{
		"id": "sql",
		"name": "SQL",
		"import": (() => import("./_51.mjs"))
	},
	{
		"id": "ssh-config",
		"name": "SSH Config",
		"import": (() => import("./_216.mjs"))
	},
	{
		"id": "stata",
		"name": "Stata",
		"import": (() => import("./_217.mjs"))
	},
	{
		"id": "stylus",
		"name": "Stylus",
		"aliases": ["styl"],
		"import": (() => import("./_218.mjs"))
	},
	{
		"id": "surrealql",
		"name": "SurrealQL",
		"aliases": ["surql"],
		"import": (() => import("./_219.mjs"))
	},
	{
		"id": "svelte",
		"name": "Svelte",
		"import": (() => import("./_220.mjs"))
	},
	{
		"id": "swift",
		"name": "Swift",
		"import": (() => import("./_221.mjs"))
	},
	{
		"id": "system-verilog",
		"name": "SystemVerilog",
		"import": (() => import("./_222.mjs"))
	},
	{
		"id": "systemd",
		"name": "Systemd Units",
		"import": (() => import("./_223.mjs"))
	},
	{
		"id": "talonscript",
		"name": "TalonScript",
		"aliases": ["talon"],
		"import": (() => import("./_224.mjs"))
	},
	{
		"id": "tasl",
		"name": "Tasl",
		"import": (() => import("./_225.mjs"))
	},
	{
		"id": "tcl",
		"name": "Tcl",
		"import": (() => import("./_226.mjs"))
	},
	{
		"id": "templ",
		"name": "Templ",
		"import": (() => import("./_227.mjs"))
	},
	{
		"id": "terraform",
		"name": "Terraform",
		"aliases": ["tf", "tfvars"],
		"import": (() => import("./_228.mjs"))
	},
	{
		"id": "tex",
		"name": "TeX",
		"import": (() => import("./_146.mjs"))
	},
	{
		"id": "toml",
		"name": "TOML",
		"import": (() => import("./_229.mjs"))
	},
	{
		"id": "ts-tags",
		"name": "TypeScript with Tags",
		"aliases": ["lit"],
		"import": (() => import("./_230.mjs"))
	},
	{
		"id": "tsv",
		"name": "TSV",
		"import": (() => import("./_231.mjs"))
	},
	{
		"id": "tsx",
		"name": "TSX",
		"import": (() => import("./_40.mjs"))
	},
	{
		"id": "turtle",
		"name": "Turtle",
		"import": (() => import("./_213.mjs"))
	},
	{
		"id": "twig",
		"name": "Twig",
		"import": (() => import("./_232.mjs"))
	},
	{
		"id": "typescript",
		"name": "TypeScript",
		"aliases": [
			"ts",
			"cts",
			"mts"
		],
		"import": (() => import("./_38.mjs"))
	},
	{
		"id": "typespec",
		"name": "TypeSpec",
		"aliases": ["tsp"],
		"import": (() => import("./_233.mjs"))
	},
	{
		"id": "typst",
		"name": "Typst",
		"aliases": ["typ"],
		"import": (() => import("./_234.mjs"))
	},
	{
		"id": "v",
		"name": "V",
		"import": (() => import("./_235.mjs"))
	},
	{
		"id": "vala",
		"name": "Vala",
		"import": (() => import("./_236.mjs"))
	},
	{
		"id": "vb",
		"name": "Visual Basic",
		"aliases": ["cmd"],
		"import": (() => import("./_237.mjs"))
	},
	{
		"id": "verilog",
		"name": "Verilog",
		"import": (() => import("./_238.mjs"))
	},
	{
		"id": "vhdl",
		"name": "VHDL",
		"import": (() => import("./_239.mjs"))
	},
	{
		"id": "viml",
		"name": "Vim Script",
		"aliases": ["vim", "vimscript"],
		"import": (() => import("./_240.mjs"))
	},
	{
		"id": "vue",
		"name": "Vue",
		"import": (() => import("./_243.mjs"))
	},
	{
		"id": "vue-html",
		"name": "Vue HTML",
		"import": (() => import("./_241.mjs"))
	},
	{
		"id": "vue-vine",
		"name": "Vue Vine",
		"import": (() => import("./_242.mjs"))
	},
	{
		"id": "vyper",
		"name": "Vyper",
		"aliases": ["vy"],
		"import": (() => import("./_244.mjs"))
	},
	{
		"id": "wasm",
		"name": "WebAssembly",
		"import": (() => import("./_245.mjs"))
	},
	{
		"id": "wenyan",
		"name": "Wenyan",
		"aliases": ["文言"],
		"import": (() => import("./_246.mjs"))
	},
	{
		"id": "wgsl",
		"name": "WGSL",
		"import": (() => import("./_247.mjs"))
	},
	{
		"id": "wikitext",
		"name": "Wikitext",
		"aliases": ["mediawiki", "wiki"],
		"import": (() => import("./_248.mjs"))
	},
	{
		"id": "wit",
		"name": "WebAssembly Interface Types",
		"import": (() => import("./_249.mjs"))
	},
	{
		"id": "wolfram",
		"name": "Wolfram",
		"aliases": ["wl"],
		"import": (() => import("./_250.mjs"))
	},
	{
		"id": "xml",
		"name": "XML",
		"import": (() => import("./_31.mjs"))
	},
	{
		"id": "xsl",
		"name": "XSL",
		"import": (() => import("./_251.mjs"))
	},
	{
		"id": "yaml",
		"name": "YAML",
		"aliases": ["yml"],
		"import": (() => import("./_94.mjs"))
	},
	{
		"id": "zenscript",
		"name": "ZenScript",
		"import": (() => import("./_252.mjs"))
	},
	{
		"id": "zig",
		"name": "Zig",
		"import": (() => import("./_253.mjs"))
	}
];
var bundledLanguagesBase = Object.fromEntries(bundledLanguagesInfo.map((i) => [i.id, i.import]));
var bundledLanguagesAlias = Object.fromEntries(bundledLanguagesInfo.flatMap((i) => i.aliases?.map((a) => [a, i.import]) || []));
var bundledLanguages = {
	...bundledLanguagesBase,
	...bundledLanguagesAlias
};
var bundledThemes = Object.fromEntries([
	{
		"id": "andromeeda",
		"displayName": "Andromeeda",
		"type": "dark",
		"import": (() => import("./_254.mjs"))
	},
	{
		"id": "aurora-x",
		"displayName": "Aurora X",
		"type": "dark",
		"import": (() => import("./_255.mjs"))
	},
	{
		"id": "ayu-dark",
		"displayName": "Ayu Dark",
		"type": "dark",
		"import": (() => import("./_256.mjs"))
	},
	{
		"id": "ayu-light",
		"displayName": "Ayu Light",
		"type": "light",
		"import": (() => import("./_257.mjs"))
	},
	{
		"id": "ayu-mirage",
		"displayName": "Ayu Mirage",
		"type": "dark",
		"import": (() => import("./_258.mjs"))
	},
	{
		"id": "catppuccin-frappe",
		"displayName": "Catppuccin Frappé",
		"type": "dark",
		"import": (() => import("./_259.mjs"))
	},
	{
		"id": "catppuccin-latte",
		"displayName": "Catppuccin Latte",
		"type": "light",
		"import": (() => import("./_260.mjs"))
	},
	{
		"id": "catppuccin-macchiato",
		"displayName": "Catppuccin Macchiato",
		"type": "dark",
		"import": (() => import("./_261.mjs"))
	},
	{
		"id": "catppuccin-mocha",
		"displayName": "Catppuccin Mocha",
		"type": "dark",
		"import": (() => import("./_262.mjs"))
	},
	{
		"id": "dark-plus",
		"displayName": "Dark Plus",
		"type": "dark",
		"import": (() => import("./_263.mjs"))
	},
	{
		"id": "dracula",
		"displayName": "Dracula Theme",
		"type": "dark",
		"import": (() => import("./_265.mjs"))
	},
	{
		"id": "dracula-soft",
		"displayName": "Dracula Theme Soft",
		"type": "dark",
		"import": (() => import("./_264.mjs"))
	},
	{
		"id": "everforest-dark",
		"displayName": "Everforest Dark",
		"type": "dark",
		"import": (() => import("./_266.mjs"))
	},
	{
		"id": "everforest-light",
		"displayName": "Everforest Light",
		"type": "light",
		"import": (() => import("./_267.mjs"))
	},
	{
		"id": "github-dark",
		"displayName": "GitHub Dark",
		"type": "dark",
		"import": (() => import("./_271.mjs"))
	},
	{
		"id": "github-dark-default",
		"displayName": "GitHub Dark Default",
		"type": "dark",
		"import": (() => import("./_268.mjs"))
	},
	{
		"id": "github-dark-dimmed",
		"displayName": "GitHub Dark Dimmed",
		"type": "dark",
		"import": (() => import("./_269.mjs"))
	},
	{
		"id": "github-dark-high-contrast",
		"displayName": "GitHub Dark High Contrast",
		"type": "dark",
		"import": (() => import("./_270.mjs"))
	},
	{
		"id": "github-light",
		"displayName": "GitHub Light",
		"type": "light",
		"import": (() => import("./_274.mjs"))
	},
	{
		"id": "github-light-default",
		"displayName": "GitHub Light Default",
		"type": "light",
		"import": (() => import("./_272.mjs"))
	},
	{
		"id": "github-light-high-contrast",
		"displayName": "GitHub Light High Contrast",
		"type": "light",
		"import": (() => import("./_273.mjs"))
	},
	{
		"id": "gruvbox-dark-hard",
		"displayName": "Gruvbox Dark Hard",
		"type": "dark",
		"import": (() => import("./_275.mjs"))
	},
	{
		"id": "gruvbox-dark-medium",
		"displayName": "Gruvbox Dark Medium",
		"type": "dark",
		"import": (() => import("./_276.mjs"))
	},
	{
		"id": "gruvbox-dark-soft",
		"displayName": "Gruvbox Dark Soft",
		"type": "dark",
		"import": (() => import("./_277.mjs"))
	},
	{
		"id": "gruvbox-light-hard",
		"displayName": "Gruvbox Light Hard",
		"type": "light",
		"import": (() => import("./_278.mjs"))
	},
	{
		"id": "gruvbox-light-medium",
		"displayName": "Gruvbox Light Medium",
		"type": "light",
		"import": (() => import("./_279.mjs"))
	},
	{
		"id": "gruvbox-light-soft",
		"displayName": "Gruvbox Light Soft",
		"type": "light",
		"import": (() => import("./_280.mjs"))
	},
	{
		"id": "horizon",
		"displayName": "Horizon",
		"type": "dark",
		"import": (() => import("./_282.mjs"))
	},
	{
		"id": "horizon-bright",
		"displayName": "Horizon Bright",
		"type": "dark",
		"import": (() => import("./_281.mjs"))
	},
	{
		"id": "houston",
		"displayName": "Houston",
		"type": "dark",
		"import": (() => import("./_283.mjs"))
	},
	{
		"id": "kanagawa-dragon",
		"displayName": "Kanagawa Dragon",
		"type": "dark",
		"import": (() => import("./_284.mjs"))
	},
	{
		"id": "kanagawa-lotus",
		"displayName": "Kanagawa Lotus",
		"type": "light",
		"import": (() => import("./_285.mjs"))
	},
	{
		"id": "kanagawa-wave",
		"displayName": "Kanagawa Wave",
		"type": "dark",
		"import": (() => import("./_286.mjs"))
	},
	{
		"id": "laserwave",
		"displayName": "LaserWave",
		"type": "dark",
		"import": (() => import("./_287.mjs"))
	},
	{
		"id": "light-plus",
		"displayName": "Light Plus",
		"type": "light",
		"import": (() => import("./_288.mjs"))
	},
	{
		"id": "material-theme",
		"displayName": "Material Theme",
		"type": "dark",
		"import": (() => import("./_293.mjs"))
	},
	{
		"id": "material-theme-darker",
		"displayName": "Material Theme Darker",
		"type": "dark",
		"import": (() => import("./_289.mjs"))
	},
	{
		"id": "material-theme-lighter",
		"displayName": "Material Theme Lighter",
		"type": "light",
		"import": (() => import("./_290.mjs"))
	},
	{
		"id": "material-theme-ocean",
		"displayName": "Material Theme Ocean",
		"type": "dark",
		"import": (() => import("./_291.mjs"))
	},
	{
		"id": "material-theme-palenight",
		"displayName": "Material Theme Palenight",
		"type": "dark",
		"import": (() => import("./_292.mjs"))
	},
	{
		"id": "min-dark",
		"displayName": "Min Dark",
		"type": "dark",
		"import": (() => import("./_294.mjs"))
	},
	{
		"id": "min-light",
		"displayName": "Min Light",
		"type": "light",
		"import": (() => import("./_295.mjs"))
	},
	{
		"id": "monokai",
		"displayName": "Monokai",
		"type": "dark",
		"import": (() => import("./_296.mjs"))
	},
	{
		"id": "night-owl",
		"displayName": "Night Owl",
		"type": "dark",
		"import": (() => import("./_298.mjs"))
	},
	{
		"id": "night-owl-light",
		"displayName": "Night Owl Light",
		"type": "light",
		"import": (() => import("./_297.mjs"))
	},
	{
		"id": "nord",
		"displayName": "Nord",
		"type": "dark",
		"import": (() => import("./_299.mjs"))
	},
	{
		"id": "one-dark-pro",
		"displayName": "One Dark Pro",
		"type": "dark",
		"import": (() => import("./_300.mjs"))
	},
	{
		"id": "one-light",
		"displayName": "One Light",
		"type": "light",
		"import": (() => import("./_301.mjs"))
	},
	{
		"id": "plastic",
		"displayName": "Plastic",
		"type": "dark",
		"import": (() => import("./_302.mjs"))
	},
	{
		"id": "poimandres",
		"displayName": "Poimandres",
		"type": "dark",
		"import": (() => import("./_303.mjs"))
	},
	{
		"id": "red",
		"displayName": "Red",
		"type": "dark",
		"import": (() => import("./_304.mjs"))
	},
	{
		"id": "rose-pine",
		"displayName": "Rosé Pine",
		"type": "dark",
		"import": (() => import("./_307.mjs"))
	},
	{
		"id": "rose-pine-dawn",
		"displayName": "Rosé Pine Dawn",
		"type": "light",
		"import": (() => import("./_305.mjs"))
	},
	{
		"id": "rose-pine-moon",
		"displayName": "Rosé Pine Moon",
		"type": "dark",
		"import": (() => import("./_306.mjs"))
	},
	{
		"id": "slack-dark",
		"displayName": "Slack Dark",
		"type": "dark",
		"import": (() => import("./_308.mjs"))
	},
	{
		"id": "slack-ochin",
		"displayName": "Slack Ochin",
		"type": "light",
		"import": (() => import("./_309.mjs"))
	},
	{
		"id": "snazzy-light",
		"displayName": "Snazzy Light",
		"type": "light",
		"import": (() => import("./_310.mjs"))
	},
	{
		"id": "solarized-dark",
		"displayName": "Solarized Dark",
		"type": "dark",
		"import": (() => import("./_311.mjs"))
	},
	{
		"id": "solarized-light",
		"displayName": "Solarized Light",
		"type": "light",
		"import": (() => import("./_312.mjs"))
	},
	{
		"id": "synthwave-84",
		"displayName": "Synthwave '84",
		"type": "dark",
		"import": (() => import("./_313.mjs"))
	},
	{
		"id": "tokyo-night",
		"displayName": "Tokyo Night",
		"type": "dark",
		"import": (() => import("./_314.mjs"))
	},
	{
		"id": "vesper",
		"displayName": "Vesper",
		"type": "dark",
		"import": (() => import("./_315.mjs"))
	},
	{
		"id": "vitesse-black",
		"displayName": "Vitesse Black",
		"type": "dark",
		"import": (() => import("./_316.mjs"))
	},
	{
		"id": "vitesse-dark",
		"displayName": "Vitesse Dark",
		"type": "dark",
		"import": (() => import("./_317.mjs"))
	},
	{
		"id": "vitesse-light",
		"displayName": "Vitesse Light",
		"type": "light",
		"import": (() => import("./_318.mjs"))
	}
].map((i) => [i.id, i.import]));
//#endregion
//#region node_modules/@streamdown/code/node_modules/shiki/dist/bundle-full.mjs
var createHighlighter = /* @__PURE__ */ createBundledHighlighter({
	langs: bundledLanguages,
	themes: bundledThemes,
	engine: () => createOnigurumaEngine(import("./_319.mjs"))
});
var { codeToHtml, codeToHast, codeToTokens, codeToTokensBase, codeToTokensWithThemes, getSingletonHighlighter, getLastGrammarState } = /* @__PURE__ */ createSingletonShorthands(createHighlighter, { guessEmbeddedLanguages });
//#endregion
//#region node_modules/@streamdown/code/dist/index.js
var S = createJavaScriptRegexEngine({ forgiving: true });
var C = Object.fromEntries(bundledLanguagesInfo.flatMap((e) => {
	var n;
	return ((n = e.aliases) != null ? n : []).map((t) => [t, e.id]);
}));
var r = new Set(Object.keys(bundledLanguages));
var B = (e) => {
	let t = e.trim().toLowerCase();
	return C[t] || (r.has(t), t);
};
var c = /* @__PURE__ */ new Map();
var p = /* @__PURE__ */ new Map();
var s = /* @__PURE__ */ new Map();
var o = (e) => {
	var n;
	return typeof e == "string" ? e : (n = e.name) != null ? n : "custom";
};
var v = (e, n) => `${e}-${o(n[0])}-${o(n[1])}`;
var x = (e, n, t) => {
	let g = e.slice(0, 100), u = e.length > 100 ? e.slice(-100) : "";
	return `${n}:${t[0]}:${t[1]}:${e.length}:${g}:${u}`;
};
var P = (e, n) => {
	let t = v(e, n);
	if (c.has(t)) return c.get(t);
	let g = createHighlighter({
		themes: n,
		langs: [e],
		engine: S
	});
	return c.set(t, g), g;
};
function $(e = {}) {
	var t;
	let n = (t = e.themes) != null ? t : ["github-light", "github-dark"];
	return {
		name: "shiki",
		type: "code-highlighter",
		supportsLanguage(g) {
			let u = B(g);
			return r.has(u);
		},
		getSupportedLanguages() {
			return Array.from(r);
		},
		getThemes() {
			return n;
		},
		highlight({ code: g, language: u, themes: h }, m) {
			let i = B(u), d = [o(h[0]), o(h[1])], a = x(g, i, d);
			if (p.has(a)) return p.get(a);
			m && (s.has(a) || s.set(a, /* @__PURE__ */ new Set()), s.get(a).add(m));
			return P(r.has(i) ? i : "text", h).then((l) => {
				let y = l.getLoadedLanguages().includes(i) ? i : "text", L = l.codeToTokens(g, {
					lang: y,
					themes: {
						light: d[0],
						dark: d[1]
					}
				});
				p.set(a, L);
				let T = s.get(a);
				if (T) {
					for (let H of T) H(L);
					s.delete(a);
				}
			}).catch((l) => {
				console.error("[Streamdown Code] Failed to highlight code:", l), s.delete(a);
			}), null;
		}
	};
}
var G = $();
//#endregion
export { G as t };
