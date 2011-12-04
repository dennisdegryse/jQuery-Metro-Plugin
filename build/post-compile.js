#!/usr/bin/env node

var print = require(/^v0\.[012]/.test(process.version) ? "sys" : "util").print,
	fs = require( "fs" ),
	src = fs.readFileSync( process.argv[2], "utf8" ),
	version = fs.readFileSync( "version.txt", "utf8" ),
	// License Template
	license = "/*! jQuery Metro Plugin v@VERSION Dennis Degryse | https://github.com/dennisdegryse/jQuery-Metro-Plugin/blob/master/README.md */";


// Previously done in sed but reimplemented here due to portability issues
src = src.replace( /^(\s*\*\/)(.+)/m, "$1\n$2" ) + ";";

// Set minimal license block var
license = license.replace( "@VERSION", version );

// Replace license block with minimal license
src = src.replace( /\/\/.*?\/?\*.+?(?=\n|\r|$)|\/\*[\s\S]*?\/\/[\s\S]*?\*\//, license );

print( src );