GDPC                �                                                                         \   res://.godot/exported/133200997/export-571eec760c03d5c4ebf56ccab8a879c1-multiplayer_menu.scn0E      U	      �Lڟ����#a�*��        res://.godot/extension_list.cfg �Z              
bs�]]3�����*�B    ,   res://.godot/global_script_class_cache.cfg  �U      �       W��y¥�B�a�of{�    D   res://.godot/imported/icon.svg-218a8f2b3041327d8a5756f3a245f83b.ctex`1            ：Qt�E�cO���       res://.godot/uid_cache.bin  0Z      E       �^T=�j����Ś�       res://PlayerData.gd �N      '       �����
�"pU
�&s    $   res://Scripts/Networking/WebRTC.gd          	      r�s�'��ڐӭ�$���    ,   res://Scripts/Networking/WebSocketClient.gd 	      r
      �Lɕx-��D�o���       res://ca_bundle.crt        	      ���C�'m�|L�,��Z       res://certificate.crt   �(      �      k��R��R%�-ykG       res://icon.svg  pV      �      k����X3Y���f       res://icon.svg.import   �>      �       jl�/��U���r 
       res://multiplayer_menu.gd   P?      �      4��5���|*�tzj�    $   res://multiplayer_menu.tscn.remap   pU      m       P]"vGr�����0׃�       res://private.key   �N      �      >�%U���'�RF:��|       res://project.binary�Z      �      V��{�IDr�i'�t       res://webrtc/LICENSE.json   �      4      �i}{~Ш�<+�� %�        res://webrtc/webrtc.gdextension �      +      �s�
�
���(2���            extends Node

var rtc : WebRTCMultiplayerPeer
# Called when the node enters the scene tree for the first time.
func _ready() -> void:
	WebSocketClient.ConnectedToWS.connect(onConnected)
	WebSocketClient.peerJoined.connect(create_peer)
	WebSocketClient.iceComing.connect(_ice_received)
	WebSocketClient.sessionComing.connect(_session_received)
	
	multiplayer.peer_connected.connect(on_player_connected)
	pass # Replace with function body.

func onConnected(player_id):
	rtc = WebRTCMultiplayerPeer.new()
	var error = rtc.create_mesh(player_id)
	multiplayer.multiplayer_peer = rtc
	


func create_peer(id,send_offer):
	var peer: WebRTCPeerConnection = WebRTCPeerConnection.new()
	peer.initialize({
		"iceServers": [ { "urls": ["stun:stun.l.google.com:19302"] } ]
	})
	
	peer.session_description_created.connect(_on_session.bind(id))
	peer.ice_candidate_created.connect(_on_ice_candidate.bind(id))
	rtc.add_peer(peer, id)
	
	if send_offer:
		peer.create_offer()
		

func _on_ice_candidate(mid, index, sdp,id):
	var data = JavaScriptBridge.create_object("Object")
	data.code = "ice"
	data.mid = mid
	data.index = index
	data.sdp = sdp
	data.id = id
	
	var target_id = WebSocketClient.ROOM.players.get(id).id
	var message = JavaScriptBridge.create_object("Object")
	message.code = "relayTarget"
	message.targetID = target_id
	message.data = data
	WebSocketClient.window.parent.parent.postMessage(message)


func on_player_connected(peer_id):
	print("PEER_ID:%d"%peer_id);

func _ice_received(mid: String, index: int, sdp: String,id: int) -> void:
	if rtc.has_peer(id):
		rtc.get_peer(id).connection.add_ice_candidate(mid, index, sdp)


func _on_session(type, sdp,id):
	rtc.get_peer(id).connection.set_local_description(type, sdp)
	
	var data = JavaScriptBridge.create_object("Object")
	data.code = "session"
	data.type = type
	data.sdp = sdp
	data.id = id
	
	var target_id = WebSocketClient.ROOM.players.get(id).id
	var message = JavaScriptBridge.create_object("Object")
	message.code = "relayTarget"
	message.targetID = target_id
	message.data = data
	WebSocketClient.window.parent.parent.postMessage(message)


func _session_received(type,sdp,id) -> void:
	var state = rtc.get_peer(id).connection.get_connection_state()
	if rtc.has_peer(id):
		rtc.get_peer(id).connection.set_remote_description(type, sdp)




             extends Node

var room_code
var is_host
var id
var player_name
var peer_count = 0;
var ROOM = null
signal ConnectedToWS(player_name)
signal iceComing(mid,index,sdp,id)
signal sessionComing(type,sdp,id)
signal peerJoined(id,send_offer)
signal codeHere(code)

var window = JavaScriptBridge.get_interface("window")
var _javascript_callback = JavaScriptBridge.create_callback(javascript_message)
# Called when the node enters the scene tree for the first time.
func _ready() -> void:
	window.addEventListener('message', _javascript_callback)
	# Send Init message to browser
	var message = JavaScriptBridge.create_object("Object")
	message.code = "frame_loaded"
	window.parent.parent.postMessage(message)
	JavaScriptBridge.get_interface("console").log(message)	
	pass

func javascript_message(args):
	var event = args[0]
	var data = JSON.parse_string(event.data)
	received_packet(data)
	pass

func _process(delta: float) -> void:
	pass

func received_packet(message):

	match message.code:
		"INIT":
			print("init")
			print(message)
			ConnectedToWS.emit(message.id)
			player_name = message.name
			id = message.id
			is_host = message.host
			getRoomData(message.room)
		"JOIN_SUCCESS":
			for player in message.room:
				if(player.id == id):
					continue
				peerJoined.emit(player.id,false)
		"room_state_changed":	
			getRoomData(message.room)
		"PLAYER_JOINED":
			peerJoined.emit(message.id,true)
		"ice":
			iceComing.emit(message.mid,message.index,message.sdp,message.sender_id)
		"session":
			sessionComing.emit(message.type,message.sdp,message.sender_id)

func getRoomData(incomingRoom):
	if(ROOM == null):
		var newRoom = {
			"host":incomingRoom.host.webRTCID,
			"players":{},
		}
		var sendOffers = false
		for player_name in incomingRoom.players:
			var player = incomingRoom.players.get(player_name)
			newRoom.players[player.webRTCID] = player
			if(player.webRTCID == id):
				sendOffers = true
				continue
			peerJoined.emit(player.webRTCID,sendOffers)
		ROOM = newRoom
	else:
		## New player joined
		for player_name in incomingRoom.players:
			var player = incomingRoom.players.get(player_name)
			if(ROOM.players.has(player.webRTCID)):
				continue
			if(player.webRTCID == id):
				continue
			ROOM.players[player.webRTCID] = player
			peerJoined.emit(player.webRTCID,true)	
		## Player Left	
		for player_id in ROOM.players:
			var player = ROOM.players.get(player_id)
			if(incomingRoom.players.has(player.name)):
				continue
			if(player.webRTCID == id):
				continue
			ROOM.players.erase(player.webRTCID)
			
func getPlayerFromID(id):
	return ROOM.players.get(float(id))

func getAuthority():
	for player_id in ROOM.players:
		return player_id
              MIT License 

Copyright (c) 2013-2022 Niels Lohmann

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
            [configuration]

entry_symbol = "webrtc_extension_init"
compatibility_minimum = 4.1

[libraries]

linux.debug.x86_64 = "lib/libwebrtc_native.linux.template_debug.x86_64.so"
linux.debug.x86_32 = "lib/libwebrtc_native.linux.template_debug.x86_32.so"
linux.debug.arm64 = "lib/libwebrtc_native.linux.template_debug.arm64.so"
linux.debug.arm32 = "lib/libwebrtc_native.linux.template_debug.arm32.so"
macos.debug = "lib/libwebrtc_native.macos.template_debug.universal.framework"
windows.debug.x86_64 = "lib/libwebrtc_native.windows.template_debug.x86_64.dll"
windows.debug.x86_32 = "lib/libwebrtc_native.windows.template_debug.x86_32.dll"
android.debug.arm64 = "lib/libwebrtc_native.android.template_debug.arm64.so"
android.debug.x86_64 = "lib/libwebrtc_native.android.template_debug.x86_64.so"
ios.debug.arm64 = "lib/libwebrtc_native.ios.template_debug.arm64.dylib"
ios.debug.x86_64 = "lib/libwebrtc_native.ios.template_debug.x86_64.simulator.dylib"

linux.release.x86_64 = "lib/libwebrtc_native.linux.template_release.x86_64.so"
linux.release.x86_32 = "lib/libwebrtc_native.linux.template_release.x86_32.so"
linux.release.arm64 = "lib/libwebrtc_native.linux.template_release.arm64.so"
linux.release.arm32 = "lib/libwebrtc_native.linux.template_release.arm32.so"
macos.release = "lib/libwebrtc_native.macos.template_release.universal.framework"
windows.release.x86_64 = "lib/libwebrtc_native.windows.template_release.x86_64.dll"
windows.release.x86_32 = "lib/libwebrtc_native.windows.template_release.x86_32.dll"
android.release.arm64 = "lib/libwebrtc_native.android.template_release.arm64.so"
android.release.x86_64 = "lib/libwebrtc_native.android.template_release.x86_64.so"
ios.release.arm64 = "lib/libwebrtc_native.ios.template_release.arm64.dylib"
ios.release.x86_64 = "lib/libwebrtc_native.ios.template_release.x86_64.simulator.dylib"
     -----BEGIN CERTIFICATE-----
MIIG1TCCBL2gAwIBAgIQbFWr29AHksedBwzYEZ7WvzANBgkqhkiG9w0BAQwFADCB
iDELMAkGA1UEBhMCVVMxEzARBgNVBAgTCk5ldyBKZXJzZXkxFDASBgNVBAcTC0pl
cnNleSBDaXR5MR4wHAYDVQQKExVUaGUgVVNFUlRSVVNUIE5ldHdvcmsxLjAsBgNV
BAMTJVVTRVJUcnVzdCBSU0EgQ2VydGlmaWNhdGlvbiBBdXRob3JpdHkwHhcNMjAw
MTMwMDAwMDAwWhcNMzAwMTI5MjM1OTU5WjBLMQswCQYDVQQGEwJBVDEQMA4GA1UE
ChMHWmVyb1NTTDEqMCgGA1UEAxMhWmVyb1NTTCBSU0EgRG9tYWluIFNlY3VyZSBT
aXRlIENBMIICIjANBgkqhkiG9w0BAQEFAAOCAg8AMIICCgKCAgEAhmlzfqO1Mdgj
4W3dpBPTVBX1AuvcAyG1fl0dUnw/MeueCWzRWTheZ35LVo91kLI3DDVaZKW+TBAs
JBjEbYmMwcWSTWYCg5334SF0+ctDAsFxsX+rTDh9kSrG/4mp6OShubLaEIUJiZo4
t873TuSd0Wj5DWt3DtpAG8T35l/v+xrN8ub8PSSoX5Vkgw+jWf4KQtNvUFLDq8mF
WhUnPL6jHAADXpvs4lTNYwOtx9yQtbpxwSt7QJY1+ICrmRJB6BuKRt/jfDJF9Jsc
RQVlHIxQdKAJl7oaVnXgDkqtk2qddd3kCDXd74gv813G91z7CjsGyJ93oJIlNS3U
gFbD6V54JMgZ3rSmotYbz98oZxX7MKbtCm1aJ/q+hTv2YK1yMxrnfcieKmOYBbFD
hnW5O6RMA703dBK92j6XRN2EttLkQuujZgy+jXRKtaWMIlkNkWJmOiHmErQngHvt
iNkIcjJumq1ddFX4iaTI40a6zgvIBtxFeDs2RfcaH73er7ctNUUqgQT5rFgJhMmF
x76rQgB5OZUkodb5k2ex7P+Gu4J86bS15094UuYcV09hVeknmTh5Ex9CBKipLS2W
2wKBakf+aVYnNCU6S0nASqt2xrZpGC1v7v6DhuepyyJtn3qSV2PoBiU5Sql+aARp
wUibQMGm44gjyNDqDlVp+ShLQlUH9x8CAwEAAaOCAXUwggFxMB8GA1UdIwQYMBaA
FFN5v1qqK0rPVIDh2JvAnfKyA2bLMB0GA1UdDgQWBBTI2XhootkZaNU9ct5fCj7c
tYaGpjAOBgNVHQ8BAf8EBAMCAYYwEgYDVR0TAQH/BAgwBgEB/wIBADAdBgNVHSUE
FjAUBggrBgEFBQcDAQYIKwYBBQUHAwIwIgYDVR0gBBswGTANBgsrBgEEAbIxAQIC
TjAIBgZngQwBAgEwUAYDVR0fBEkwRzBFoEOgQYY/aHR0cDovL2NybC51c2VydHJ1
c3QuY29tL1VTRVJUcnVzdFJTQUNlcnRpZmljYXRpb25BdXRob3JpdHkuY3JsMHYG
CCsGAQUFBwEBBGowaDA/BggrBgEFBQcwAoYzaHR0cDovL2NydC51c2VydHJ1c3Qu
Y29tL1VTRVJUcnVzdFJTQUFkZFRydXN0Q0EuY3J0MCUGCCsGAQUFBzABhhlodHRw
Oi8vb2NzcC51c2VydHJ1c3QuY29tMA0GCSqGSIb3DQEBDAUAA4ICAQAVDwoIzQDV
ercT0eYqZjBNJ8VNWwVFlQOtZERqn5iWnEVaLZZdzxlbvz2Fx0ExUNuUEgYkIVM4
YocKkCQ7hO5noicoq/DrEYH5IuNcuW1I8JJZ9DLuB1fYvIHlZ2JG46iNbVKA3ygA
Ez86RvDQlt2C494qqPVItRjrz9YlJEGT0DrttyApq0YLFDzf+Z1pkMhh7c+7fXeJ
qmIhfJpduKc8HEQkYQQShen426S3H0JrIAbKcBCiyYFuOhfyvuwVCFDfFvrjADjd
4jX1uQXd161IyFRbm89s2Oj5oU1wDYz5sx+hoCuh6lSs+/uPuWomIq3y1GDFNafW
+LsHBU16lQo5Q2yh25laQsKRgyPmMpHJ98edm6y2sHUabASmRHxvGiuwwE25aDU0
2SAeepyImJ2CzB80YG7WxlynHqNhpE7xfC7PzQlLgmfEHdU+tHFeQazRQnrFkW2W
kqRGIq7cKRnyypvjPMkjeiV9lRdAM9fSJvsB3svUuu1coIG1xxI1yegoGM4r5QP4
RGIVvYaiI76C0djoSbQ/dkIUUXQuB8AL5jyH34g3BZaaXyvpmnV4ilppMXVAnAYG
ON51WhJ6W0xNdNJwzYASZYH+tmCWI+N60Gv2NNMGHwMZ7e9bXgzUCZH5FaBFDGR5
S9VWqHB73Q+OyIVvIbKYcSc2w/aSuFKGSA==
-----END CERTIFICATE-----
 -----BEGIN CERTIFICATE-----
MIIGXzCCBEegAwIBAgIQOwizlBXtNJRkfbBhwe8MsDANBgkqhkiG9w0BAQwFADBL
MQswCQYDVQQGEwJBVDEQMA4GA1UEChMHWmVyb1NTTDEqMCgGA1UEAxMhWmVyb1NT
TCBSU0EgRG9tYWluIFNlY3VyZSBTaXRlIENBMB4XDTI0MDcyODAwMDAwMFoXDTI0
MTAyNjIzNTk1OVowFzEVMBMGA1UEAxMMMTMuMjEwLjcxLjY0MIIBIjANBgkqhkiG
9w0BAQEFAAOCAQ8AMIIBCgKCAQEAtZYdrLajneA80nsyyznkOZAT3XB3aYjUciSt
ItETSEe1QgrZE2AeKajtpoooAxLlVxvGIbH3syZR+4RyFgBPV66uTaua884zGbOE
XP+QezOR7686tPccOIvcpOAUbzyAtKn6tqCJH8YK78cKJq5afbnlaX3/juSgePYc
XCs7TfDSL1Flrk4/DwOgOV2eI0Y80an2oNAF76VaxNOQDfGfVs7sWom8AgZ3O33U
/FyUliaUy1H2br1L84z5EQtfunukldqcXqMpR24a54XRP0ZKJc1CvJgXnViSRRpe
KfnOTJ3Z/UcH09xgJHhwuf4YraBlui1K7JLlwAvybbnMjduwhwIDAQABo4ICcTCC
Am0wHwYDVR0jBBgwFoAUyNl4aKLZGWjVPXLeXwo+3LWGhqYwHQYDVR0OBBYEFGUL
YW3IWex30xNNAqJ10dFBE1jDMA4GA1UdDwEB/wQEAwIFoDAMBgNVHRMBAf8EAjAA
MB0GA1UdJQQWMBQGCCsGAQUFBwMBBggrBgEFBQcDAjBJBgNVHSAEQjBAMDQGCysG
AQQBsjEBAgJOMCUwIwYIKwYBBQUHAgEWF2h0dHBzOi8vc2VjdGlnby5jb20vQ1BT
MAgGBmeBDAECATCBiAYIKwYBBQUHAQEEfDB6MEsGCCsGAQUFBzAChj9odHRwOi8v
emVyb3NzbC5jcnQuc2VjdGlnby5jb20vWmVyb1NTTFJTQURvbWFpblNlY3VyZVNp
dGVDQS5jcnQwKwYIKwYBBQUHMAGGH2h0dHA6Ly96ZXJvc3NsLm9jc3Auc2VjdGln
by5jb20wggEFBgorBgEEAdZ5AgQCBIH2BIHzAPEAdwB2/4g/Crb7lVHCYcz1h7o0
tKTNuyncaEIKn+ZnTFo6dAAAAZD4U8KJAAAEAwBIMEYCIQDQI+skVrBYDwZ1SiBD
xikcaymxG4uRhRF/VwM2lRuK3wIhAISIWO0RJVfgyP6eFgVmjRr9JEyNwj94ZTHR
XwsEuSquAHYAPxdLT9ciR1iUHWUchL4NEu2QN38fhWrrwb8ohez4ZG4AAAGQ+FPC
TwAABAMARzBFAiEAsNF5Nx021A0IcObqnCvqCZ2tuR6g9TjXP4YTYq9/XPYCIB30
+EiNRUIZnTlQQPT/VBBke8bN0L1Juqc7zCJbJYUIMA8GA1UdEQQIMAaHBA3SR0Aw
DQYJKoZIhvcNAQEMBQADggIBAFcxVuMhGgFfk0B5EE3MOqS0r0F1W9MvWY9M+BJi
UFx77OooXuQwujjmI0IXtwzM6/ZXGEy5aDwCh4lej1K73AJ120oj1aqVZwIS6C0m
ml94Wee+5FfmMG44zeVKSyisNa2kxafmR0Qbw9+4zBHqmT5zBo/5IPuV5b0bT1oP
IBbVaapoQ/GUQS5FZpUtQoM6LAbj7euEKRkhnjpZmgbdr7WP3xWt7Q2IkNkOvdw/
I3X2OUzjuB2QBLb/EEz8oAw1RHdxsOa+Uos6KoSFdFx7fkriIs67mdcD53PGvGuF
qdXuJw7rCk9hG96Mp4jO2hxPJN3uhmFQBeVKIKGQm+pC5fko3DfpwnV00QHEVZoa
OQh/EV9QtzrddS/qtQQ6VKkkPUgdgcT9XrTn7jGIxfx3neJrkgfBproPzSVzHrzR
AvMqJ48J6vF+DBM1qbKeCNE8zxAnnhwcu8U+M+fktEQg1L2GRiYsXkNJ1jewZEps
GPZdDt3sE5YNABhmxmTWGdgCR7kv4+kQZGbFRjQSzKvwri8zBjIBRQ9gNVom51Wj
2IJuXtN9cjHSqHONJ8cez7ZqxN6wpabkirv5lxZTMX2ClqelPjqtAPd6yE6ohPlU
0Lwpsp4zyKPQo1CscH+ELhoIGZsGTa2UAW7MlIGR2pV3nkTFpXE/vRY85mhEmmZG
HGCN
-----END CERTIFICATE-----
   GST2   �   �      ����               � �        �  RIFF�  WEBPVP8L�  /������!"2�H�m�m۬�}�p,��5xi�d�M���)3��$�V������3���$G�$2#�Z��v{Z�lێ=W�~� �����d�vF���h���ڋ��F����1��ڶ�i�엵���bVff3/���Vff���Ҿ%���qd���m�J�}����t�"<�,���`B �m���]ILb�����Cp�F�D�=���c*��XA6���$
2#�E.@$���A.T�p )��#L��;Ev9	Б )��D)�f(qA�r�3A�,#ѐA6��npy:<ƨ�Ӱ����dK���|��m�v�N�>��n�e�(�	>����ٍ!x��y�:��9��4�C���#�Ka���9�i]9m��h�{Bb�k@�t��:s����¼@>&�r� ��w�GA����ը>�l�;��:�
�wT���]�i]zݥ~@o��>l�|�2�Ż}�:�S�;5�-�¸ߥW�vi�OA�x��Wwk�f��{�+�h�i�
4�˰^91��z�8�(��yޔ7֛�;0����^en2�2i�s�)3�E�f��Lt�YZ���f-�[u2}��^q����P��r��v��
�Dd��ݷ@��&���F2�%�XZ!�5�.s�:�!�Њ�Ǝ��(��e!m��E$IQ�=VX'�E1oܪì�v��47�Fы�K챂D�Z�#[1-�7�Js��!�W.3׹p���R�R�Ctb������y��lT ��Z�4�729f�Ј)w��T0Ĕ�ix�\�b�9�<%�#Ɩs�Z�O�mjX �qZ0W����E�Y�ڨD!�$G�v����BJ�f|pq8��5�g�o��9�l�?���Q˝+U�	>�7�K��z�t����n�H�+��FbQ9���3g-UCv���-�n�*���E��A�҂
�Dʶ� ��WA�d�j��+�5�Ȓ���"���n�U��^�����$G��WX+\^�"�h.���M�3�e.
����MX�K,�Jfѕ*N�^�o2��:ՙ�#o�e.
��p�"<W22ENd�4B�V4x0=حZ�y����\^�J��dg��_4�oW�d�ĭ:Q��7c�ڡ��
A>��E�q�e-��2�=Ϲkh���*���jh�?4�QK��y@'�����zu;<-��|�����Y٠m|�+ۡII+^���L5j+�QK]����I �y��[�����(}�*>+���$��A3�EPg�K{��_;�v�K@���U��� gO��g��F� ���gW� �#J$��U~��-��u���������N�@���2@1��Vs���Ŷ`����Dd$R�":$ x��@�t���+D�}� \F�|��h��>�B�����B#�*6��  ��:���< ���=�P!���G@0��a��N�D�'hX�׀ "5#�l"j߸��n������w@ K�@A3�c s`\���J2�@#�_ 8�����I1�&��EN � 3T�����MEp9N�@�B���?ϓb�C��� � ��+�����N-s�M�  ��k���yA 7 �%@��&��c��� �4�{� � �����"(�ԗ�� �t�!"��TJN�2�O~� fB�R3?�������`��@�f!zD��%|��Z��ʈX��Ǐ�^�b��#5� }ى`�u�S6�F�"'U�JB/!5�>ԫ�������/��;	��O�!z����@�/�'�F�D"#��h�a �׆\-������ Xf  @ �q�`��鎊��M��T�� ���0���}�x^�����.�s�l�>�.�O��J�d/F�ě|+^�3�BS����>2S����L�2ޣm�=�Έ���[��6>���TъÞ.<m�3^iжC���D5�抺�����wO"F�Qv�ږ�Po͕ʾ��"��B��כS�p�
��E1e�������*c�������v���%'ž��&=�Y�ް>1�/E������}�_��#��|������ФT7׉����u������>����0����緗?47�j�b^�7�ě�5�7�����|t�H�Ե�1#�~��>�̮�|/y�,ol�|o.��QJ rmϘO���:��n�ϯ�1�Z��ը�u9�A������Yg��a�\���x���l���(����L��a��q��%`�O6~1�9���d�O{�Vd��	��r\�՜Yd$�,�P'�~�|Z!�v{�N�`���T����3?DwD��X3l �����*����7l�h����	;�ߚ�;h���i�0�6	>��-�/�&}% %��8���=+��N�1�Ye��宠p�kb_����$P�i�5�]��:��Wb�����������ě|��[3l����`��# -���KQ�W�O��eǛ�"�7�Ƭ�љ�WZ�:|���є9�Y5�m7�����o������F^ߋ������������������Р��Ze�>�������������?H^����&=����~�?ڭ�>���Np�3��~���J�5jk�5!ˀ�"�aM��Z%�-,�QU⃳����m����:�#��������<�o�����ۇ���ˇ/�u�S9��������ٲG}��?~<�]��?>��u��9��_7=}�����~����jN���2�%>�K�C�T���"������Ģ~$�Cc�J�I�s�? wڻU���ə��KJ7����+U%��$x�6
�$0�T����E45������G���U7�3��Z��󴘶�L�������^	dW{q����d�lQ-��u.�:{�������Q��_'�X*�e�:�7��.1�#���(� �k����E�Q��=�	�:e[����u��	�*�PF%*"+B��QKc˪�:Y��ـĘ��ʴ�b�1�������\w����n���l镲��l��i#����!WĶ��L}rեm|�{�\�<mۇ�B�HQ���m�����x�a�j9.�cRD�@��fi9O�.e�@�+�4�<�������v4�[���#bD�j��W����֢4�[>.�c�1-�R�����N�v��[�O�>��v�e�66$����P
�HQ��9���r�	5FO� �<���1f����kH���e�;����ˆB�1C���j@��qdK|
����4ŧ�f�Q��+�     [remap]

importer="texture"
type="CompressedTexture2D"
uid="uid://c5blj12uqwekh"
path="res://.godot/imported/icon.svg-218a8f2b3041327d8a5756f3a245f83b.ctex"
metadata={
"vram_texture": false
}
                extends Control

@export var label: RichTextLabel
@export var textArea : RichTextLabel
@export var textInput : LineEdit
@export var multiplayerSyncroniser : MultiplayerSynchronizer
func _ready() -> void:
	multiplayer.peer_connected.connect(on_player_connected)
	WebSocketClient.ConnectedToWS.connect(on_server_connected)

func on_server_connected(player_name):
	pass
	
func on_player_connected(peer_id):
	self.set_multiplayer_authority(WebSocketClient.getAuthority())
	var text =  ""
	for player in WebSocketClient.ROOM.players:
		text += WebSocketClient.ROOM.players[player].name + "\n"
	label.text = text
	
func onCodeHere(code):
	label.text = code;

func _on_host_button_down() -> void:
	WebSocketClient.host_room()
	pass # Replace with function body.


func _on_roomcode_text_changed(new_text: String) -> void:
	WebSocketClient.room_code = new_text
	pass # Replace with function body.


func _on_join_button_down() -> void:
	WebSocketClient.join_room()
	pass # Replace with function body.


func _on_line_edit_text_submitted(new_text: String) -> void:
	send_messageRPC.rpc(textInput.text)
	textInput.clear()
	pass # Replace with function body.


func _on_button_button_down() -> void:
	send_messageRPC.rpc(textInput.text)
	textInput.clear()
	pass # Replace with function body.

@rpc("any_peer","call_local","reliable")
func send_messageRPC(message):
	var player = WebSocketClient.getPlayerFromID(multiplayer.get_remote_sender_id())
	textArea.text += (player.name + ":" + message +"\n")
	 
           RSRC                    PackedScene            ��������                                                  RichTextLabel2 	   textArea 	   LineEdit    MultiplayerSynchronizer    ..    .    text    resource_local_to_scene    resource_name    properties/0/path    properties/0/spawn    properties/0/replication_mode    script 	   _bundled       Script    res://multiplayer_menu.gd ��������   %   local://SceneReplicationConfig_10k0j �         local://PackedScene_6puwn C         SceneReplicationConfig    	              
                           PackedScene          	         names "         Playground    layout_mode    anchors_preset    script    label 	   textArea 
   textInput    multiplayerSyncroniser    Control    RichTextLabel    offset_left    offset_top    offset_right    offset_bottom    text    RichTextLabel2    Label    HBoxContainer 	   LineEdit    custom_minimum_size    Button    MultiplayerSynchronizer 
   root_path    replication_config    _on_line_edit_text_submitted    text_submitted    _on_button_button_down    button_down    	   variants    '                                                                          @@     �B     
C     �B      Players In Lobby       @     �B     cC    ��C     �C    @nD    @D    ��C    �sD    @D     B      B     �B
     �C  HB     �C    �D    �oD    @D
     �B  HB    �qD    �D    @�D     D      Send                             node_count    	         nodes     �   ��������       ����                        @     @     @     @               	   	   ����         
         	      
                           	      ����         
                                    	      ����         
                                          ����         
                                    ����                                             ����               
                                          ����               
          !      "      #      $                     ����      %      &             conn_count             conns                                                              node_paths              editable_instances              version             RSRC           class_name PlayerData

var name
var id
         -----BEGIN RSA PRIVATE KEY-----
MIIEpQIBAAKCAQEAtZYdrLajneA80nsyyznkOZAT3XB3aYjUciStItETSEe1QgrZ
E2AeKajtpoooAxLlVxvGIbH3syZR+4RyFgBPV66uTaua884zGbOEXP+QezOR7686
tPccOIvcpOAUbzyAtKn6tqCJH8YK78cKJq5afbnlaX3/juSgePYcXCs7TfDSL1Fl
rk4/DwOgOV2eI0Y80an2oNAF76VaxNOQDfGfVs7sWom8AgZ3O33U/FyUliaUy1H2
br1L84z5EQtfunukldqcXqMpR24a54XRP0ZKJc1CvJgXnViSRRpeKfnOTJ3Z/UcH
09xgJHhwuf4YraBlui1K7JLlwAvybbnMjduwhwIDAQABAoIBAQCRAcq6tLLeDUak
0ssSLS3KpfqnF/vT4/e7GvzD0/AxBUqC7cTByzzrCcKV/rfLFJjeQgirucHTZ2OK
lg7A8QhrPcxlrAc2cNCv0oJ9/Xv0Vo9Qtz8LalY39cCCTYsj9U3Wd/MFSheWrwDm
z6yUjSEoS34fCwY8puhbEDY/iCp4puCTsxXoJSJvz6MdymjjRcWqOtgqFJIz1lH1
oVbvSCCgYUob0Mr1gpI/v8Uen1DloW6ILXJ58QpVP3ZgbDiV5JoKcCnA0MuXTo/V
uR8XS+zg5fwT6no96Z0smA5q8xV1Mk479O8q6qhNv9dGcFjuSkJ8PfTS46D0okUJ
d06hfY4xAoGBAOtjlRe4QQWVVFp9LOCXdbvCHkgdUuVZxmdB4ARrlBQN+3ewnZ+9
lm9mvu5PffyP2S+2iWo+Ue2SfxQPaNhNQa+0Na3MzS+/boUCYZMTpS7gB1bk0dSA
lWACYdOj7f4vLoXEneHyPdiE4HSPuzbo5qK6HVTzDLzV6elHV5Wv6ikZAoGBAMV8
gjCWDzUoBkds7gflA4iCtIn72hXOrJBwIw3wBMg+3L9O+pStNRpkmMMfGF2V2ns/
LH0lSyCE3IzgKfOw63oFEqdVfGX/DGuYqYTxxZZDEtsb/A8N7pWGLKWvusb9p9HO
Wf85Wa4QcP1GK2LLhiMi92UkIdvrimYcSmlYELqfAoGBAJ8KUZoNLCGRm8Tn/oJg
03Ng3QTsiy3bUmpB4BIcfZhvOhDMjDN57UKnsSljHEShDKVoN8BJCyHxcVskbjp3
OIJ2yC39ykUQmqPT0AmHpHvfchYL1Jo3prWP5nkQsaSkTFKlXedjvNWmMeGPm3am
Ne6MwXS8I0cTYU/0nADPMu9BAoGAaPYT+97Flmr/a1bp7Cg8CIHvkqbY8l42OU5g
UzgOUp+Wk9dWN08Xuj9dMdeFC7hptreM3bbEhzQWRImfwnV1shSgJW+5/jvgTg+F
ibM2YPalPu9QuG+fLrlxYV5U1w5Z85jJHG1OzMTQSMzSol+pm2MqOgdKN6ioljzT
D8pOmeECgYEA5VpDwxY+fqa7gPq0mAr58HDDO9LySlhX64LU/x4AOaT5Lhw51NSZ
AQJpRYxmUEKlL5noyJF/v60hbAs6BcioXXWPpGSenR3Xg2nE10y19FhrbpA7voP4
P1jdWjrwI6UJ+ncg7CcK80/yfPE60x5/z3CXRek4U1WsWgzhRi/Ef48=
-----END RSA PRIVATE KEY-----
      [remap]

path="res://.godot/exported/133200997/export-571eec760c03d5c4ebf56ccab8a879c1-multiplayer_menu.scn"
   list=Array[Dictionary]([{
"base": &"RefCounted",
"class": &"PlayerData",
"icon": "",
"language": &"GDScript",
"path": "res://PlayerData.gd"
}])
<svg height="128" width="128" xmlns="http://www.w3.org/2000/svg"><rect x="2" y="2" width="124" height="124" rx="14" fill="#363d52" stroke="#212532" stroke-width="4"/><g transform="scale(.101) translate(122 122)"><g fill="#fff"><path d="M105 673v33q407 354 814 0v-33z"/><path d="m105 673 152 14q12 1 15 14l4 67 132 10 8-61q2-11 15-15h162q13 4 15 15l8 61 132-10 4-67q3-13 15-14l152-14V427q30-39 56-81-35-59-83-108-43 20-82 47-40-37-88-64 7-51 8-102-59-28-123-42-26 43-46 89-49-7-98 0-20-46-46-89-64 14-123 42 1 51 8 102-48 27-88 64-39-27-82-47-48 49-83 108 26 42 56 81zm0 33v39c0 276 813 276 814 0v-39l-134 12-5 69q-2 10-14 13l-162 11q-12 0-16-11l-10-65H446l-10 65q-4 11-16 11l-162-11q-12-3-14-13l-5-69z" fill="#478cbf"/><path d="M483 600c0 34 58 34 58 0v-86c0-34-58-34-58 0z"/><circle cx="725" cy="526" r="90"/><circle cx="299" cy="526" r="90"/></g><g fill="#414042"><circle cx="307" cy="532" r="60"/><circle cx="717" cy="532" r="60"/></g></g></svg>
              [o��A"_   res://icon.svgfB��n   res://multiplayer_menu.tscn           res://webrtc/webrtc.gdextension
ECFG
      application/config/name      
   WebRTCTest     application/run/main_scene$         res://multiplayer_menu.tscn    application/config/features(   "         4.2    GL Compatibility       application/config/icon         res://icon.svg     autoload/WebSocketClient4      ,   *res://Scripts/Networking/WebSocketClient.gd   autoload/WebRTC,      #   *res://Scripts/Networking/WebRTC.gd    editor/run/main_run_args          -- --room_code="Hello"  '   network/tls/certificate_bundle_override          res://certificate.crt   #   rendering/renderer/rendering_method         gl_compatibility*   rendering/renderer/rendering_method.mobile         gl_compatibility          