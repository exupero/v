build: build/v.core.js build/v.js build/v.min.js v

test: build/v.core.test.js
	node build/v.core.test.js

v: v.go assets.go
	GOPATH=`pwd` go build -o v assets.go v.go

assets.go: build/v.min.js
	cp build/v.min.js assets/
	go-bindata -debug -prefix "assets/" -o assets.go assets/

build/v.core.js: src/macros.sjs src/v.core.js
	cat src/macros.sjs src/v.core.js | sjs -s -o build/v.core.js

build/v.js: build/v.core.js src/macros.sjs src/v.js
	cat src/macros.sjs src/v.js | sjs -s -o build/v.js

build/v.min.js: build/v.js lib/*.js
	browserify build/v.js | uglifyjs -c -m toplevel >build/v.min.js 2>/dev/null

build/v.core.test.js: src/macros.sjs src/v.core.js test/v.core.js
	cat src/macros.sjs src/v.core.js test/v.core.js | sjs -s -o build/v.core.test.js
