from http.server import HTTPServer, SimpleHTTPRequestHandler
import sys

class NoCacheHTTPRequestHandler(SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header('Cache-Control', 'no-store, no-cache, must-revalidate, max-age=0')
        self.send_header('Pragma', 'no-cache')
        self.send_header('Expires', '0')
        SimpleHTTPRequestHandler.end_headers(self)

if __name__ == '__main__':
    port = 8000
    print(f"Starting server at http://localhost:{port}")
    print("Press Ctrl+C to stop the server")
    httpd = HTTPServer(('localhost', port), NoCacheHTTPRequestHandler)
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        print("\nShutting down server...")
        httpd.server_close()
        sys.exit(0) 