package main

import (
	"fmt"
	"flag"
	"io/ioutil"
	"text/template"
	"log"
	"net/http"
	"os"
	"os/signal"
	"strings"

	"github.com/toqueteos/webbrowser"
)

var port = flag.Int("p", 8000, "Port")
var indexTemplate = `<!DOCTYPE html><body>
<script type="text/json">{{.data}}</script>
<script type="text/v">{{.src}}</script>
<script type="text/javascript">
	window.sendData=function(d){var req=new XMLHttpRequest();req.open('POST','/updateData',true);req.send(d)}
	window.sendSrc=function(s){var req=new XMLHttpRequest();req.open('POST','/updateSource',true);req.send(s)}
</script>
<script type="text/javascript">{{.v}}</script>
</body>`

func main() {
	flag.Parse()

	url := fmt.Sprintf("0.0.0.0:%d", *port)
	src := flag.Arg(0)
	indexPage := template.Must(template.New("index").Parse(indexTemplate))
	data := "{}"

	fi, err := os.Stdin.Stat()
	if err != nil { log.Fatal(err) }

	if (fi.Mode() & os.ModeCharDevice) == 0 {
		b, err := ioutil.ReadAll(os.Stdin)
		if err != nil { log.Fatal(err) }
		data = string(b)
	}

	http.HandleFunc("/", func(w http.ResponseWriter, req *http.Request) {
		w.Header().Add("Content-Type", "text/html")
		v, err := Asset("v.min.js")
		if err != nil { http.Error(w, err.Error(), http.StatusInternalServerError) }
		data := map[string]string{"src": src, "v": string(v), "data": data}
		if err := indexPage.Execute(w, data); err != nil { http.Error(w, err.Error(), http.StatusInternalServerError) }
	})

	http.HandleFunc("/updateSource", func(w http.ResponseWriter, req *http.Request) {
		b, err := ioutil.ReadAll(req.Body)
		if err != nil { http.Error(w, err.Error(), http.StatusInternalServerError) }
		src = string(b)
	})

	http.HandleFunc("/updateData", func(w http.ResponseWriter, req *http.Request) {
		b, err := ioutil.ReadAll(req.Body)
		if err != nil { http.Error(w, err.Error(), http.StatusInternalServerError) }
		data = string(b)
	})

	go func(){
		webbrowser.Open(url)
	}()

	go func(){
		c := make(chan os.Signal)
		signal.Notify(c, os.Interrupt)
		for _ = range c {
			fmt.Printf("{\"data\":%s,\"source\":\"%s\"}\n",data,strings.Replace(src,"\"","\\\"",-1))
			os.Exit(0)
		}
	}()

	if err := http.ListenAndServe(url, nil); err != nil {
		log.Fatal("Server failed:", err)
	}
}
