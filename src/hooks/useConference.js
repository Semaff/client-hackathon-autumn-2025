import { useEffect, useRef, useState } from "react";

export function useConference() {
  const [isMuted, setIsMuted] = useState(false);
  const [camOff, setCamOff] = useState(false);
  const [hasVideo, setHasVideo] = useState(false);
  const [participants, setParticipants] = useState([]);

  const ws = useRef(null);
  const myId = useRef(null);
  const localStream = useRef(null);
  const peers = useRef({});
  const readyQueue = useRef([]);

  useEffect(() => {
    ws.current = new WebSocket("ws://localhost:8080");

    ws.current.onmessage = async (e) => {
      const data = JSON.parse(e.data);

      switch (data.type) {
        case "init":
          myId.current = data.id;
          console.log("My ID:", myId.current);
          data.others.forEach((peerId) => {
            withLocalStream(() => {
              connectPeer(peerId, true);
            });
          });
          break;

        case "new-peer":
          withLocalStream(() => {
            connectPeer(data.id, false);
          });
          break;

        case "offer":
          withLocalStream(async () => {
            if (!peers.current[data.from]) createPeerConnection(data.from);
            const pcWrap = peers.current[data.from];
            await pcWrap.pc.setRemoteDescription(data.sdp);
            const answer = await pcWrap.pc.createAnswer();
            await pcWrap.pc.setLocalDescription(answer);
            ws.current.send(
              JSON.stringify({
                type: "answer",
                from: myId.current,
                target: data.from,
                sdp: answer,
              })
            );
            // Добавляем буферизованные кандидаты
            pcWrap.pendingCandidates.forEach((c) => pcWrap.pc.addIceCandidate(c));
            pcWrap.pendingCandidates = [];
          });
          break;

        case "answer":
          {
            const pcWrap = peers.current[data.from];
            if (pcWrap) {
              await pcWrap.pc.setRemoteDescription(data.sdp);
              pcWrap.pendingCandidates.forEach((c) => pcWrap.pc.addIceCandidate(c));
              pcWrap.pendingCandidates = [];
            }
          }
          break;

        case "candidate":
          {
            const pcWrap = peers.current[data.from];
            if (!pcWrap) return;
            const cand = new RTCIceCandidate(data.candidate);
            if (pcWrap.pc.remoteDescription) await pcWrap.pc.addIceCandidate(cand);
            else pcWrap.pendingCandidates.push(cand);
          }
          break;

        case "peer-left":
          {
            const pcWrap = peers.current[data.id];
            if (pcWrap) pcWrap.pc.close();
            delete peers.current[data.id];
            setParticipants((prev) => prev.filter((p) => p.id !== data.id));
          }
          break;

        default:
          break;
      }
    };

    getMedia();
  }, []);

  const withLocalStream = (fn) => {
    if (!localStream.current) {
      readyQueue.current.push(fn);
    } else if (localStream.current.getTracks().length > 0) {
      fn();
    } else {
      console.warn("No local tracks available, skipping peer connection");
    }
  };

  const getMedia = async () => {
    try {
      localStream.current = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: true,
      });
      setHasVideo(true);
      console.log("🎤 Mic & 📹 Camera ready");
    } catch (err) {
      console.warn("Camera not found, using audio only:", err);
      localStream.current = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: false,
      });
      setHasVideo(false);
      console.log("🎤 Mic ready, no camera");
    }

    setParticipants([{ id: "me", stream: localStream.current }]);

    readyQueue.current.forEach((fn) => fn());
    readyQueue.current = [];
  };

  const addParticipant = (id, stream) => {
    setParticipants((prev) => {
      const existing = prev.find((p) => p.id === id);
      if (existing) {
        return prev.map((p) => (p.id === id ? { ...p, stream } : p));
      }
      return [...prev, { id, stream }];
    });
  };

  const createPeerConnection = (peerId) => {
    const pc = new RTCPeerConnection();
    peers.current[peerId] = { pc, pendingCandidates: [] };

    if (localStream.current) {
      localStream.current.getTracks().forEach((track) => pc.addTrack(track, localStream.current));
    }

    pc.ontrack = (e) => {
      addParticipant(peerId, e.streams[0]);
    };

    pc.onicecandidate = (e) => {
      if (e.candidate) {
        ws.current.send(
          JSON.stringify({
            type: "candidate",
            from: myId.current,
            target: peerId,
            candidate: e.candidate,
          })
        );
      }
    };

    return pc;
  };

  const connectPeer = async (peerId, isInitiator) => {
    if (!localStream.current || localStream.current.getTracks().length === 0) {
      console.warn("Skipping connectPeer, no local stream", peerId);
      return;
    }

    if (peers.current[peerId]) return;

    const pc = createPeerConnection(peerId);

    if (isInitiator) {
      try {
        const offer = await pc.createOffer();
        await pc.setLocalDescription(offer);
        ws.current.send(
          JSON.stringify({
            type: "offer",
            from: myId.current,
            target: peerId,
            sdp: offer,
          })
        );
      } catch (err) {
        console.error("Failed to create/send offer:", err);
      }
    }
  };

  const toggleMute = () => {
    if (!localStream.current) return;
    localStream.current.getAudioTracks().forEach((t) => (t.enabled = isMuted));
    setIsMuted((prev) => !prev);
  };

  const toggleCam = () => {
    if (!localStream.current || !hasVideo) return;
    localStream.current.getVideoTracks().forEach((t) => (t.enabled = camOff));
    setCamOff((prev) => !prev);
  };

  return { participants, toggleMute, toggleCam, isMuted, camOff };
}

