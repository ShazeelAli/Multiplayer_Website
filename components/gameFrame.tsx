import { useEffect, useRef, useState } from "react";
import { Game, GamesFull, GamesEnum, GameType } from "../utils/game";
import RoomState from "../utils/roomState";
import clientWebsocket from "utils/clientWebsocket";
import styles from "./gameFrame.module.css";
import Player from "utils/player";
export default function gameFrame({
  roomState,
  clientWebsocket,
  player,
}: {
  roomState: RoomState;
  clientWebsocket: clientWebsocket;
  player: Player;
}) {
  const IFrameRef = useRef<HTMLIFrameElement>();
  const [display, setDisplay] = useState(
    <h1
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      LOADING
    </h1>
  );
  const [frameLoaded, setFrameLoaded] = useState<boolean>(false);
  const bufferedPackets = useRef([]);
  var socket = clientWebsocket.socket;
  useEffect(() => {
    if (GamesFull.has(roomState.currentGame)) {
      var current_game = GamesFull.get(roomState.currentGame);
      if (current_game.gameType == GameType.GODOT) {
        var frameSrc = current_game.urlImbed;
        setDisplay(
          <iframe
            src={frameSrc}
            width="100%"
            ref={IFrameRef}
            height="100%"
            scrolling="no"
          />
        );
      } else {
        setDisplay(
          <current_game.webComponent
            clientWebsocket={clientWebsocket}
            roomState={roomState}
          ></current_game.webComponent>
        );
      }
    }
  }, [roomState]);

  useEffect(() => {
    if (IFrameRef.current != null) {
      var msg = {
        code: "room_state_changed",
        room: roomState,
      };
      IFrameRef.current.contentWindow.postMessage(JSON.stringify(msg));
    }
  }, [roomState]);

  useEffect(() => {
    if (socket != null) {
      socket.on("godotRelayReceive", (msg) => {
        if (frameLoaded) {
          received_packet(msg);
        } else {
          bufferedPackets.current.push(msg);
          // console.log(bufferedPackets)
        }
      });
    }
  }, [socket, frameLoaded]);

  useEffect(() => {
    if (frameLoaded) {
      // console.log(bufferedPackets)
      bufferedPackets.current.forEach((msg) => {
        received_packet(msg);
      });
    }
  }, [frameLoaded]);
  useEffect(() => {
    if (IFrameRef.current == null) {
      window.onmessage = (event) => {};
      return;
    }

    window.onmessage = (event) => {
      var message = event.data;

      console.log("BROWSER :");
      console.log(message);
      if (!message.code) {
        return;
      }
      switch (message.code) {
        case "frame_loaded":
          var host = false;
          if (roomState.host.id == clientWebsocket.socket.id) {
            host = true;
          }
          const msg = {
            code: "INIT",
            id: player.webRTCID,
            name: player.name,
            host: host,
            room: roomState,
          };
          IFrameRef.current.contentWindow.postMessage(JSON.stringify(msg));
          setFrameLoaded(true);
          break;
        case "relayTarget":
          clientWebsocket.socket.emit(
            "relayTarget",
            message.targetID,
            "godotRelay",
            message.data
          );
          break;
        case "relay":
          clientWebsocket.socket.emit("relay", "godotRelay", message.data);
        case "updateScore":
      }
    };

    return () => {
      window.onmessage = (event) => {};
    };
  });

  function received_packet(message) {
    if (IFrameRef.current == null) {
      return;
    }
    IFrameRef.current.contentWindow.postMessage(JSON.stringify(message));
  }
  return <div style={{ width: "100%", height: "100%" }}>{display}</div>;
}
