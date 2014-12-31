build/v.core.js: macros.sjs v.js
	cat macros.sjs v.js | sjs -s -o build/v.core.js

test: macros.sjs v.js test.js
	cat macros.sjs v.js test.js | sjs -s -o test/v.js
	node test/v.js

browser: build/v.core.js
	browserify build/v.core.js | uglifyjs -c -m toplevel >build/v.min.js 2>/dev/null
