- 赤玉
	- 地形変化
	- 人差し指
		- 地形選択中
			- 盛り上げる
		- 地形未選択
			- 影響範囲を広げる
	- 中指
		- 地形選択中
			- 凹ませる
		- 地形未選択
			- 影響範囲を狭める
- 青玉
	- 移動
	- 人差し指
		- 地形選択中
			- 前進
		- 地形未選択
			- 上昇
	- 中指
		- 地形選択中
			- 後退
		- 地形未選択
			- 下降
	- 人差し指・中指同時
		- 回転
- 緑玉
	- 視点位置
	- 機能なし

```
ruby -rwebrick -rwebrick/https -e 'WEBrick::HTTPServer.new(:DocumentRoot => "./", :Port => 9090, :SSLEnable => true, :SSLCertName => [["CN", WEBrick::Utils::getservername]] ).start'
```