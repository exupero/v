build: src/macros.sjs src/v.core.js
	cat src/macros.sjs src/v.core.js | sjs -s -o build/v.core.js

test: src/macros.sjs src/v.core.js test/v.core.js
	cat src/macros.sjs src/v.core.js test/v.core.js | sjs -s -o build/v.core.test.js
	node build/v.core.test.js

browser: build/v.js
	browserify build/v.js | uglifyjs -c -m toplevel >build/v.min.js 2>/dev/null
