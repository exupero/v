NODE ?= node

build: macros.sjs v.js
	cat macros.sjs v.js | sjs -s > build/v.js
	cat build/v.js | uglifyjs -m toplevel > build/v.min.js

test: build
	$(NODE) test.js ./build/v
	$(NODE) test.js ./build/v.min

size: build
	cat macros.sjs v.js | wc -c
	cat build/v.js | wc -c
	cat build/v.min.js | wc -c
	cat build/v.min.js | gzip | wc -c
