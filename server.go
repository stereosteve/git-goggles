package main

import (
	"embed"
	"io/fs"
	"log"
	"net/http"
	"os/exec"
	"strings"
)

//go:embed dist
var distFiles embed.FS

func git(w http.ResponseWriter, req *http.Request) {
	args := strings.Split(req.URL.Query().Get("args"), ",")

	if len(args) == 0 {
		http.Error(w, "args param is required", 400)
		return
	}

	log.Println("git", args)
	cmd := exec.Command("git", args...)
	cmd.Stdout = w

	if err := cmd.Run(); err != nil {
		log.Println("git err", err)
		http.Error(w, err.Error(), 500)
		return
	}
}

func main() {

	http.HandleFunc("/git", git)

	dist, err := fs.Sub(distFiles, "dist")
	if err != nil {
		panic(err)
	}

	fs := http.FileServer(http.FS(dist))

	http.HandleFunc("/", func(w http.ResponseWriter, req *http.Request) {
		accept := req.Header.Get("Accept")
		if strings.Contains(accept, "html") {
			req.URL.Path = "/"
		}
		fs.ServeHTTP(w, req)
	})

	http.ListenAndServe(":8090", nil)
}
