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
	"time"

	"github.com/toqueteos/webbrowser"
)

var port = flag.Int("p", 8000, "Port")
var indexTemplate = `<!DOCTYPE html><body>
<script type="text/json">{{.data}}</script>
<script type="text/v">{{.src}}</script>
<script type="text/javascript">
	window.abort=function(f){
		var r=new XMLHttpRequest();r.open('GET','/abort',true);
		r.onreadystatechange=function(){if(r.readyState==4&&r.status==200&&r.responseText=="1"){f(function(d){var s=new XMLHttpRequest();s.open('POST','/payload',true);s.send(JSON.stringify(d))})}}
		r.send()}
</script>
<script type="text/javascript">{{.v}}</script>
</body>`

func main() {
	flag.Parse()

	url := fmt.Sprintf("0.0.0.0:%d", *port)
	src := flag.Arg(0)
	indexPage := template.Must(template.New("index").Parse(indexTemplate))
	data := "{}"
	abort := make(chan bool)
	payload := make(chan string)
	existingConnection := false

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

		if existingConnection {
			abort <- false // abort the existing connection and don't request a payload
		} else {
			existingConnection = true
		}
	})

	http.HandleFunc("/abort", func(w http.ResponseWriter, req *http.Request) {
		if <-abort {
			w.Write([]byte("1"))
		}
	})

	http.HandleFunc("/payload", func(w http.ResponseWriter, req *http.Request) {
		b, err := ioutil.ReadAll(req.Body)
		if err != nil { http.Error(w, err.Error(), http.StatusInternalServerError) }
		payload <- string(b)
	})

	go func(){
		webbrowser.Open(url)
	}()

	go func(){
		c := make(chan os.Signal)
		signal.Notify(c, os.Interrupt)
		for _ = range c {
			fmt.Fprintf(os.Stderr, "Signalling client to abort...\n")
			select {
			case abort <- true:
				select {
				case p := <-payload:
					fmt.Printf(p)
					os.Exit(0)
				case <-time.After(5 * time.Second):
					fmt.Fprintf(os.Stderr, "Timed out waiting for client payload.\n")
					os.Exit(1)
				case <-c:
					os.Exit(0)
				}
			case <-time.After(100 * time.Millisecond):
				fmt.Fprintf(os.Stderr, "No client listening for abort. Aborting without payload.\n")
				os.Exit(0)
			}
		}
	}()

	if err := http.ListenAndServe(url, nil); err != nil {
		log.Fatal("Server failed:", err)
	}
}
