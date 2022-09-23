package main

import (
	"embed"
	"encoding/json"
	"flag"
	"fmt"
	"io/fs"
	"log"
	"net/http"
	"os"
	"os/exec"
	"strings"

	"github.com/gobwas/ws"
	"github.com/gobwas/ws/wsutil"
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

type GitResponse struct {
	Args   []string `json:"args"`
	Error  string   `json:"error,omitempty"`
	Output string   `json:"output"`
}

func gitws(w http.ResponseWriter, r *http.Request) {

	conn, _, _, err := ws.UpgradeHTTP(r, w)
	if err != nil {
		http.Error(w, err.Error(), 500)
		return
	}

	go func() {
		defer conn.Close()

		for {
			msg, op, err := wsutil.ReadClientData(conn)
			if err != nil {
				log.Println("ws read err", err)
				return
			}

			var args []string
			json.Unmarshal(msg, &args)

			// log.Println("[ws] git", args)

			go func() {

				cmd := exec.Command("git", args...)
				cmd.Dir = cwd

				output, err := cmd.CombinedOutput()

				response := GitResponse{
					Args:   args,
					Output: string(output),
				}

				if err != nil {
					response.Error = err.Error()
				}

				respJson, err := json.Marshal(&response)
				if err != nil {
					panic(err)
				}

				err = wsutil.WriteServerMessage(conn, op, respJson)
				if err != nil {
					log.Println("ws write err", err)
					return
				}
			}()

		}
	}()
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
	http.HandleFunc("/gitws", gitws)

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
