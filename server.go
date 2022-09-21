package main

import (
	"embed"
	"flag"
	"fmt"
	"io/fs"
	"log"
	"net/http"
	"os"
	"os/exec"
	"strings"
)

var (
	cwd string
)

//go:embed dist
var distFiles embed.FS

func git(w http.ResponseWriter, req *http.Request) {
	args := req.URL.Query()["args"]

	if len(args) == 0 {
		http.Error(w, "args param is required", 400)
		return
	}

	log.Println("git", args)
	cmd := exec.Command("git", args...)
	cmd.Stdout = w
	cmd.Dir = cwd

	if err := cmd.Run(); err != nil {
		log.Println("git err", err)
		http.Error(w, err.Error(), 500)
		return
	}
}

func main() {

	var listenFlag string

	flag.Usage = func() {
		fmt.Fprintf(os.Stderr, "\ngit-goggles ~/path/to/repo \n\n")
		flag.PrintDefaults()
		fmt.Fprintf(os.Stderr, "\n\n")
	}
	flag.StringVar(&listenFlag, "listen", ":8090", "address to listen on")
	flag.Parse()
	flagArgs := flag.Args()

	// default arg is cwd
	if len(flagArgs) > 0 {
		cwd = flagArgs[0]
	}

	fmt.Printf("listen: %s, cwd: %s \n", listenFlag, cwd)

	http.HandleFunc("/git", git)

	dist, err := fs.Sub(distFiles, "dist")
	if err != nil {
		panic(err)
	}

	fs := http.FileServer(http.FS(dist))
	http.HandleFunc("/", func(w http.ResponseWriter, req *http.Request) {
		accept := req.Header.Get("Accept")
		log.Println(req.URL.Path, accept)
		if strings.Contains(accept, "html") {
			req.URL.Path = "/"
		}
		fs.ServeHTTP(w, req)
	})

	http.ListenAndServe(listenFlag, nil)
}
