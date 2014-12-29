build/v.js: macros.sjs v.js
	cat macros.sjs v.js | sjs -s -o build/v.js

minify: build/v.js
	cat build/v.js | uglifyjs -c -m toplevel >build/v.min.js 2>/dev/null

test: build/v.js
	cat macros.sjs v.js test.js | sjs -s -o test/v.js
	node test/v.js
