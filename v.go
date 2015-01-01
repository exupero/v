package main

import (
	"fmt"
	"flag"
	"text/template"
	"log"
	"net/http"

	"github.com/toqueteos/webbrowser"
)

var port = flag.Int("p", 8000, "Port")
var indexTemplate = `<!DOCTYPE html><body><script type="text/v">{{.src}}</script><script type="text/javascript">{{.v}}</script></body>`

func main() {
	flag.Parse()

	url := fmt.Sprintf("0.0.0.0:%d", *port)
	src := flag.Arg(0)
	indexPage := template.Must(template.New("index").Parse(indexTemplate))

	http.HandleFunc("/", func(w http.ResponseWriter, req *http.Request) {
		w.Header().Add("Content-Type", "text/html")
		v, err := Asset("v.min.js")
		if err != nil { http.Error(w, err.Error(), http.StatusInternalServerError) }
		data := map[string]string{"src": src, "v": string(v)}
		if err := indexPage.Execute(w, data); err != nil { http.Error(w, err.Error(), http.StatusInternalServerError) }
	})

	go func(){
		webbrowser.Open(url)
	}()

	log.Println("Starting server...")
	if err := http.ListenAndServe(url, nil); err != nil {
		log.Fatal("ListenAndServe:", err)
	}
}
