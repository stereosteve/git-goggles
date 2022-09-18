package main

import (
	"fmt"
	"log"
	"net/http"
	"os/exec"
	"strings"
)

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

func headers(w http.ResponseWriter, req *http.Request) {

	for name, headers := range req.Header {
		for _, h := range headers {
			fmt.Fprintf(w, "%v: %v\n", name, h)
		}
	}
}

func main() {

	http.HandleFunc("/git", git)
	http.HandleFunc("/headers", headers)

	http.ListenAndServe(":8090", nil)
}
