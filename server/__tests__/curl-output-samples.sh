mern-social-from-scratch$ curl -I http://localhost:3000
HTTP/1.1 200 OK
X-Powered-By: Express
Access-Control-Allow-Origin: * <<<<<<<<<< From cors
Content-Type: text/html; charset=utf-8
Content-Length: 762
ETag: W/"2fa-LnL2r8pfUnBXNR2H1eYQxHDqyPQ"
Vary: Accept-Encoding <<<<<<<<<< From compression
Date: Sun, 30 Aug 2020 21:23:08 GMT
Connection: keep-alive

mern-social-from-scratch$ curl -I http://localhost:3000 <<<<<<<<<< Using helmet
HTTP/1.1 200 OK
Content-Security-Policy: default-src 'self';base-uri 'self';block-all-mixed-content;font-src 'self' https: data:;frame-ancestors 'self';img-src 'self' data:;object-src 'none';script-src 'self';script-src-attr 'none';style-src 'self' https: 'unsafe-inline';upgrade-insecure-requests
X-DNS-Prefetch-Control: off
Expect-CT: max-age=0
X-Frame-Options: SAMEORIGIN
Strict-Transport-Security: max-age=15552000; includeSubDomains
X-Download-Options: noopen
X-Content-Type-Options: nosniff
X-Permitted-Cross-Domain-Policies: none
Referrer-Policy: no-referrer
X-XSS-Protection: 0
Content-Type: text/html; charset=utf-8
Content-Length: 762
ETag: W/"2fa-LnL2r8pfUnBXNR2H1eYQxHDqyPQ"
Date: Sun, 30 Aug 2020 21:27:33 GMT
Connection: keep-alive
