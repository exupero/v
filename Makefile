NODE ?= node

all: build/v.js build/v.min.js

build/v.js: macros.sjs v.js
	cat macros.sjs v.js | sjs -s > build/v.js

build/v.min.js: build/v.js
	cat build/v.js | uglifyjs -m toplevel > build/v.min.js

test: build/v.js build/v.min.js
	$(NODE) test.js ./build/v
	$(NODE) test.js ./build/v.min

size: macros.sjs v.js build/v.js build/v.min.js
	cat macros.sjs v.js | wc -c
	cat build/v.js | wc -c
	cat build/v.min.js | wc -c
	cat build/v.min.js | gzip | wc -c
