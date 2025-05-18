import { useEffect, useRef, useState } from "react";

const Receiver = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const pendingStreamRef = useRef<MediaStream | null>(null); // store before accept
  const [pc, setPc] = useState<RTCPeerConnection | null>(null);
  const [hasStream, setHasStream] = useState(false); // for showing Accept button

  useEffect(() => {
    const socket = new WebSocket("ws://localhost:8080");
    socket.onopen = () => socket.send(JSON.stringify({ type: "receiver" }));

    const newPc = new RTCPeerConnection();
    setPc(newPc);

    newPc.ontrack = (event) => {
      // Save the track but don't assign it to video yet
      const stream = new MediaStream([event.track]);
      pendingStreamRef.current = stream;
      setHasStream(true); // show Accept button
    };

    socket.onmessage = async (evt) => {
      const msg = JSON.parse(evt.data);
      if (msg.type === "createOffer") {
        await newPc.setRemoteDescription(msg.sdp);
        const answer = await newPc.createAnswer();
        await newPc.setLocalDescription(answer);
        socket.send(JSON.stringify({ type: "createAnswer", sdp: answer }));
      } else if (msg.type === "iceCandidate") {
        await newPc.addIceCandidate(msg.candidate);
      }
    };
  }, []);

  const handleAccept = async () => {
    const video = videoRef.current!;
    const stream = pendingStreamRef.current;
    if (stream) {
      video.srcObject = stream;
      try {
        await video.play();
        console.log("Playback started");
        setHasStream(false); // hide the Accept button
      } catch (err) {
        console.error("Playback failed", err);
      }
    }
  };

  return (
    <div>
      <video
        ref={videoRef}
        controls
        playsInline
        style={{ width: "100%", maxWidth: "600px" }}
      />
      {hasStream && (
        <button onClick={handleAccept} style={{ marginTop: "10px" }}>
          Accept Stream
        </button>
      )}
    </div>
  );
};

export default Receiver;
