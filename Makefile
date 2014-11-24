NODE ?= node

all: test

test:
	$(NODE) test.js

size:
	cat v.js | wc -c
	cat v.js | uglifyjs | wc -c
	cat v.js | uglifyjs | gzip | wc -c
