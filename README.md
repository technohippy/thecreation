```
ruby -rwebrick -rwebrick/https -e 'WEBrick::HTTPServer.new(:DocumentRoot => "./", :Port => 9090, :SSLEnable => true, :SSLCertName => [["CN", WEBrick::Utils::getservername]] ).start'
```