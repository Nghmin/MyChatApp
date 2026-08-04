import { useState, useEffect, useRef } from 'react';
import Peer from 'simple-peer';

export const useVideoCall = (socket, myId, currentUser) => {
  const [callStatus, setCallStatus] = useState('idle'); 
  const [callData, setCallData] = useState(null);
  const [stream, setStream] = useState(null);
  const [remoteStream, setRemoteStream] = useState(null);
  
  const myVideo = useRef();
  const userVideo = useRef();
  const connectionRef = useRef();

  useEffect(() => {
    if (!socket.current) return;
    const s = socket.current;
    // Lắng nghe cuộc gọi đến
    s.on('incoming_call', ({ from, signal, name, type }) => {
      setCallStatus('receiving');
      setCallData({ from, signal, name, type });
    });

    // Lắng nghe khi đối phương chấp nhận
    s.on('call_accepted', (signal) => {
      setCallStatus('connected');
      if (connectionRef.current) {
        connectionRef.current.signal(signal);
      }
    });

    // Lắng nghe khi đối phương cúp máy
    s.on('call_ended', () => {
      endCall();
    });

    return () => {
      s.off('incoming_call');
      s.off('call_accepted');
      s.off('call_ended');
    };
  }, [socket.current]);

  // Hàm khởi tạo cuộc gọi (Nhấn nút gọi)
  const startCall = async (targetId, type = 'video') => {
    setCallStatus('calling');
    const localStream = await navigator.mediaDevices.getUserMedia({ video: type === 'video', audio: true });
    setStream(localStream);
    if (myVideo.current) myVideo.current.srcObject = localStream;

    const peer = new Peer({ initiator: true, trickle: false, stream: localStream });

    peer.on('signal', (data) => {
      socket.current.emit('call_user', {
        userToCall: targetId,
        signalData: data,
        from: myId,
        name: currentUser.username,
        type
      });
    });

    peer.on('stream', (remote) => {
      setRemoteStream(remote);
      if (userVideo.current) userVideo.current.srcObject = remote;
    });

    connectionRef.current = peer;
  };

  // Hàm trả lời cuộc gọi
  const answerCall = async () => {
    setCallStatus('connected');
    const localStream = await navigator.mediaDevices.getUserMedia({ video: callData.type === 'video', audio: true });
    setStream(localStream);
    if (myVideo.current) myVideo.current.srcObject = localStream;

    const peer = new Peer({ initiator: false, trickle: false, stream: localStream });

    peer.on('signal', (data) => {
      socket.current.emit('answer_call', { signal: data, to: callData.from });
    });

    peer.on('stream', (remote) => {
      setRemoteStream(remote);
      if (userVideo.current) userVideo.current.srcObject = remote;
    });

    peer.signal(callData.signal);
    connectionRef.current = peer;
  };

  const endCall = () => {
    setCallStatus('idle');
    if (stream) stream.getTracks().forEach(track => track.stop());
    if (connectionRef.current) connectionRef.current.destroy();
    setCallData(null);
    setRemoteStream(null);
  };

  return { callStatus, callData, startCall, answerCall, endCall, myVideo, userVideo };
};