package main

import (
	"embed"
	"encoding/json"
	"flag"
	"fmt"
	"io/fs"
	"log"
	"net"
	"net/http"
	"os"
	"os/exec"
	"runtime"
	"strings"
	"time"

	"github.com/gobwas/ws"
	"github.com/gobwas/ws/wsutil"
)

var (
	cwd string
)

//go:generate pnpm build
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
	var devFlag bool

	flag.Usage = func() {
		fmt.Fprintf(os.Stderr, "\ngit-goggles ~/path/to/repo \n\n")
		flag.PrintDefaults()
		fmt.Fprintf(os.Stderr, "\n\n")
	}
	flag.StringVar(&listenFlag, "listen", ":0", "address to listen on")
	flag.BoolVar(&devFlag, "dev", false, "listen on fixed port and don't open browser")
	flag.Parse()
	flagArgs := flag.Args()

	// listen on random port
	if devFlag {
		listenFlag = ":8090"
	}

	// default arg is cwd
	if len(flagArgs) > 0 {
		cwd = flagArgs[0]
	}

	log.Printf("dev: %v, listen: %s, cwd: %s \n", devFlag, listenFlag, cwd)

	http.HandleFunc("/git", git)
	http.HandleFunc("/gitws", gitws)

	dist, err := fs.Sub(distFiles, "dist")
	if err != nil {
		panic(err)
	}

	fs := http.FileServer(http.FS(dist))
	http.HandleFunc("/", func(w http.ResponseWriter, req *http.Request) {
		accept := req.Header.Get("Accept")
		// log.Println(req.URL.Path, accept)
		if strings.Contains(accept, "html") {
			req.URL.Path = "/"
		}
		fs.ServeHTTP(w, req)
	})

	listener, err := net.Listen("tcp", listenFlag)
	if err != nil {
		panic(err)
	}

	port := listener.Addr().(*net.TCPAddr).Port
	addr := fmt.Sprintf("http://localhost:%d", port)
	log.Printf("starting on %s \n", addr)

	if !devFlag {
		go openbrowser(addr)
	}

	if err := http.Serve(listener, nil); err != nil {
		log.Fatal(err)
	}
}

// https://gist.github.com/hyg/9c4afcd91fe24316cbf0
func openbrowser(url string) {
	time.Sleep(10 * time.Millisecond)

	var err error

	switch runtime.GOOS {
	case "linux":
		err = exec.Command("xdg-open", url).Start()
	case "windows":
		err = exec.Command("rundll32", "url.dll,FileProtocolHandler", url).Start()
	case "darwin":
		err = exec.Command("open", url).Start()
	default:
		err = fmt.Errorf("unsupported platform")
	}
	if err != nil {
		log.Fatal(err)
	}

}
