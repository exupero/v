NODE ?= node

all: test

test:
	$(NODE) test.js
