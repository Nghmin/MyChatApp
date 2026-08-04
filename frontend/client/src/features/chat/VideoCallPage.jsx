import { Buffer } from 'buffer';
import process from 'process';
import EventEmitter from 'events';

if (typeof window !== 'undefined') {
  window.Buffer = Buffer;
  window.process = process;
  window.global = window;
  window.EventEmitter = EventEmitter;
}

import React, { useEffect, useRef, useState, useCallback } from "react";
import Peer from "simple-peer";
import { io } from "socket.io-client";

// --- ICONS (Giữ nguyên) ---
const MicIcon = () => (<svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" x2="12" y1="19" y2="22"/></svg>);
const MicOffIcon = () => (<svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="2" x2="22" y1="2" y2="22"/><path d="M18.89 13.23A7.12 7.12 0 0 0 19 12v-2"/><path d="M5 10v2a7 7 0 0 0 12 5"/><path d="M15 9.34V5a3 3 0 0 0-5.68-1.33"/><path d="M9 9v3a3 3 0 0 0 5.12 2.12"/><line x1="12" x2="12" y1="19" y2="22"/></svg>);
const VideoIcon = () => (<svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m16 13 5.223 3.482a.5.5 0 0 0 .777-.416V7.87a.5.5 0 0 0-.752-.432L16 10.5"/><rect x="2" y="6" width="14" height="12" rx="2"/></svg>);
const VideoOffIcon = () => (<svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10.66 6H14a2 2 0 0 1 2 2v2.5l5.248-3.062A.5.5 0 0 1 22 7.87v8.196"/><path d="M16 16a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h2"/><path d="m2 2 20 20"/></svg>);
const PhoneOffIcon = () => (<svg width="28" height="28" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M10.68 13.31a16 16 0 0 0 3.41 2.6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7 2 2 0 0 1 1.72 2v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.42 19.42 0 0 1-3.33-2.67m-2.67-3.34a19.79 19.79 0 0 1-3.07-8.63A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91"/><line x1="2" x2="22" y1="2" y2="22"/></svg>);
const SpeakerIcon = () => (<svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M15.54 8.46a5 5 0 0 1 0 7.07"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14"/></svg>);
const SpeakerOffIcon = () => (<svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><line x1="22" x2="16" y1="9" y2="15"/><line x1="16" x2="22" y1="9" y2="15"/></svg>);
const SwitchCameraIcon = () => (<svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 19H4a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h5"/><path d="M13 5h7a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2h-5"/><circle cx="12" cy="12" r="3"/><path d="m18 22-3-3 3-3"/><path d="m6 2 3 3-3 3"/></svg>);

const VideoCallPage = () => {
    const query = new URLSearchParams(window.location.search);
    const targetId = query.get("targetId");
    const isInitiator = query.get("isInitiator") === "true";
    const callType = query.get("type") || "video";
    const displayName = query.get("displayName") || "Người dùng";
    const targetAvatar = query.get("displayAvatar") || "";

    const [stream, setStream] = useState(null);
    const [callStatus, setCallStatus] = useState(isInitiator ? "calling" : "connecting");
    const [remoteVideoMuted, setRemoteVideoMuted] = useState(false);
    const [timer, setTimer] = useState(0); 
    const [isVideoMuted, setIsVideoMuted] = useState(false);
    const [isAudioMuted, setIsAudioMuted] = useState(false);
    const [hasCamera, setHasCamera] = useState(true);
    const [showControls, setShowControls] = useState(true);
    const [isSpeakerOn, setIsSpeakerOn] = useState(true);
    const [remoteStreamReceived, setRemoteStreamReceived] = useState(false);

    const myVideo = useRef();
    const userVideo = useRef();
    const connectionRef = useRef();
    const socket = useRef();
    const controlsTimer = useRef();
    const remoteStreamRef = useRef();

    const currentUser = JSON.parse(localStorage.getItem('user'));
    const myId = currentUser?.userId || currentUser?._id;

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    const resetControlsTimer = useCallback(() => {
        setShowControls(true);
        if (controlsTimer.current) clearTimeout(controlsTimer.current);
        controlsTimer.current = setTimeout(() => {
            if (callStatus === "connected") setShowControls(false);
        }, 5000);
    }, [callStatus]);

    // --- FIX AUTOPLAY POLICY: Gán stream và play video ---
    useEffect(() => {
        if (callStatus === "connected" && remoteStreamRef.current && userVideo.current) {
            console.log(">>> [Autoplay] Gán stream remote...");
            const videoElement = userVideo.current;
            
            if (videoElement.srcObject !== remoteStreamRef.current) {
                videoElement.srcObject = remoteStreamRef.current;
            }

            // Đảm bảo luôn mute dùng attribute (yêu cầu autoplay policy)
            videoElement.muted = true;

            const playPromise = videoElement.play();
            if (playPromise !== undefined) {
                playPromise
                    .then(() => {
                        console.log(">>> [Autoplay] ✓ Video playing");
                        // Sau khi play thành công, apply speaker preference
                        setTimeout(() => {
                            if (!isSpeakerOn) {
                                videoElement.volume = 0;
                            } else {
                                videoElement.volume = 1;
                            }
                        }, 100);
                    })
                    .catch(error => {
                        console.warn(">>> [Autoplay] Lỗi:", error.message);
                        // Thử lại sau delay
                        setTimeout(() => {
                            videoElement.play().catch(e => console.error("Play retry failed:", e));
                        }, 500);
                    });
            }
        }
    }, [callStatus, remoteStreamReceived, isSpeakerOn]);

    
    useEffect(() => {
        if (userVideo.current && callStatus === "connected") {
            try {
                if (!isSpeakerOn) {
                    userVideo.current.volume = 0;
                } else {
                    userVideo.current.volume = 1;
                }
            } catch (e) {
                console.error("Error setting volume:", e);
            }
        }
    }, [isSpeakerOn, callStatus]);

    useEffect(() => {
        socket.current = io('http://localhost:5000', {
            path: '/socket.io',
            transports: ['websocket'],
        });

        socket.current.on('connect', () => {
            socket.current.emit('register_call_socket', myId);
        });

        socket.current.on("call_accepted", (signal) => {
            console.log(">>> Chấp nhận cuộc gọi, đang bắt đầu kết nối WebRTC...");
            if (connectionRef.current) connectionRef.current.signal(signal);
        });

        socket.current.on("call_ended", () => {
            setCallStatus("rejected");
            setTimeout(() => window.close(), 2000);
        });

        socket.current.on("remote_video_toggled", (data) => setRemoteVideoMuted(data.muted));

        socket.current.on("ice_candidate", (candidate) => {
            if (connectionRef.current) connectionRef.current.signal(candidate);
        });

        navigator.mediaDevices.getUserMedia({ video: true, audio: true })
            .then((currentStream) => {
                setStream(currentStream);
                if (myVideo.current) myVideo.current.srcObject = currentStream;
                if (isInitiator) callUser(currentStream);
                else answerCall(currentStream);
            })
            .catch(() => {
                setHasCamera(false);
                setIsVideoMuted(true);
                navigator.mediaDevices.getUserMedia({ video: false, audio: true }).then(s => {
                    setStream(s);
                    if (isInitiator) callUser(s);
                    else answerCall(s);
                });
            });

        return () => {
            connectionRef.current?.destroy();
            socket.current?.disconnect();
            if (stream) stream.getTracks().forEach(t => t.stop());
        };
    }, []);

    // --- ĐỒNG BỘ THỜI GIAN: Chỉ đếm khi ĐÃ CÓ HÌNH ---
    useEffect(() => {
        let interval;
        if (callStatus === "connected" && remoteStreamReceived) {
            interval = setInterval(() => setTimer(prev => prev + 1), 1000);
        }
        return () => clearInterval(interval);
    }, [callStatus, remoteStreamReceived]);

    const callUser = (currentStream) => {
        const peer = new Peer({ initiator: true, trickle: true, stream: currentStream });
        connectionRef.current = peer;

        peer.on("signal", (data) => {
            if (data.type === 'offer') {
                socket.current.emit("call_user", {
                    userToCall: targetId, signalData: data, from: myId,
                    name: currentUser?.username, avatar: currentUser?.avatar,
                    displayName: displayName, type: callType
                });
            } else if (data.candidate) {
                socket.current.emit("ice_candidate", { to: targetId, candidate: data });
            }
        });

        peer.on("stream", (remoteStream) => {
            console.log(">>> [Người gọi] Nhận stream!");
            remoteStreamRef.current = remoteStream;
            setCallStatus("connected");
            setRemoteStreamReceived(true);
        });
    };

    const answerCall = (currentStream) => {
        const savedSignal = localStorage.getItem('pendingSignal');
        if (!savedSignal) return;

        const peer = new Peer({ initiator: false, trickle: true, stream: currentStream });

        peer.on("signal", (data) => {
            if (data.type === 'answer') {
                socket.current.emit("answer_call", { signal: data, to: targetId, from: myId });
            } else if (data.candidate) {
                socket.current.emit("ice_candidate", { to: targetId, candidate: data });
            }
        });

        peer.on("stream", (remoteStream) => {
            console.log(">>> [Người nhận] Nhận stream!");
            remoteStreamRef.current = remoteStream;
            setCallStatus("connected");
            setRemoteStreamReceived(true);
        });

        peer.signal(JSON.parse(savedSignal));
        connectionRef.current = peer;
        localStorage.removeItem('pendingSignal');
    };

    const handleCloseWindow = () => {
        socket.current?.emit("end_call", { to: targetId, reason: 'ended' });
        window.close();
    };

    const toggleVideo = () => {
        if (stream) {
            const track = stream.getVideoTracks()[0];
            if (track) {
                track.enabled = !track.enabled;
                setIsVideoMuted(!track.enabled);
                socket.current.emit("toggle_video", { to: targetId, from: myId, muted: !track.enabled });
            }
        }
    };

    const toggleAudio = () => {
        if (stream) {
            const track = stream.getAudioTracks()[0];
            if (track) {
                track.enabled = !track.enabled;
                setIsAudioMuted(!track.enabled);
                socket.current.emit("toggle_audio", { to: targetId, from: myId, muted: !track.enabled });
            }
        }
    };

    return (
        <div 
            className="w-screen h-screen bg-gradient-to-br from-[#0a0a0a] via-[#1a1a2e] to-[#16213e] flex flex-col font-sans overflow-hidden relative select-none text-white"
            onMouseMove={resetControlsTimer}
            onClick={resetControlsTimer}
        >
            <div className="flex-1 relative flex items-center justify-center">
                <div className="w-full h-full relative flex items-center justify-center bg-black">
                    
                    {(callStatus !== "connected") ? (
                        <div className="flex flex-col items-center gap-6 animate-[fadeInUp_0.6s_ease-out] z-50">
                            <div className="relative w-[130px] h-[130px] md:w-[160px] md:h-[160px] flex items-center justify-center">
                                {callStatus !== "rejected" && (
                                    <>
                                        <div className="absolute w-full h-full rounded-full border-[3px] border-[#0068ff] animate-[pulse-ring_1.5s_ease-out_infinite]"></div>
                                        <div className="absolute inset-[-15px] rounded-full border-2 border-[#0068ff] opacity-50 animate-[pulse-ring_1.5s_ease-out_infinite] [animation-delay:0.3s]"></div>
                                    </>
                                )}
                                <img 
                                    src={targetAvatar || "https://via.placeholder.com/150"} 
                                    alt="avatar"
                                    className={`w-[110px] h-[110px] md:w-[140px] md:h-[140px] rounded-full object-cover border-4 ${callStatus === 'rejected' ? 'border-red-500' : 'border-[#0068ff] shadow-[0_0_40px_rgba(0,104,255,0.4)]'} z-10 transition-all duration-500`}
                                />
                            </div>
                            <h2 className="text-2xl md:text-3xl font-semibold drop-shadow-lg">{displayName}</h2>
                            <div className="text-white/70">
                                {callStatus === 'calling' && "Đang gọi cho đối phương..."}
                                {callStatus === 'connecting' && "Đang kết nối..."}
                                {callStatus === 'rejected' && "Cuộc gọi đã kết thúc."}
                            </div>
                        </div>
                    ) : (
                        <div className="relative w-full h-full flex items-center justify-center overflow-hidden">
                            {remoteVideoMuted && (
                                <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-[#0f0f1a] gap-4">
                                    <img src={targetAvatar || "https://via.placeholder.com/100"} alt="remote" className="w-24 h-24 rounded-full border-4 border-white/30 object-cover" />
                                    <p className="text-white text-lg">Camera đối phương đã tắt</p>
                                </div>
                            )}

                            <video 
                                ref={userVideo} 
                                playsInline 
                                autoPlay 
                                muted={true}
                                className="w-full h-full object-cover"
                            />
                            
                            <div className={`absolute top-0 left-0 right-0 p-6 bg-gradient-to-b from-black/80 to-transparent transition-all z-40 ${showControls ? 'opacity-100' : 'opacity-0'}`}>
                                <div className="flex items-center gap-3">
                                    <img src={targetAvatar || "https://via.placeholder.com/40"} alt="avatar" className="w-11 h-11 rounded-full border-2 border-white/30 object-cover" />
                                    <div>
                                        <div className="text-white font-semibold">{displayName}</div>
                                        <div className="text-white/80 text-xs flex items-center gap-1.5">
                                            <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span>
                                            {formatTime(timer)}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* PiP (My Video) */}
                <div className={`absolute right-5 bottom-[130px] w-[110px] h-[147px] md:w-[130px] md:h-[173px] rounded-2xl overflow-hidden bg-[#1a1a2e] shadow-2xl border-2 border-white/10 z-30`}>
                    {isVideoMuted && (
                        <div className="absolute inset-0 flex items-center justify-center bg-slate-900 z-10">
                            <img src={currentUser?.avatar || "https://via.placeholder.com/60"} alt="me" className="w-14 h-14 rounded-full object-cover" />
                        </div>
                    )}
                    <video ref={myVideo} playsInline muted autoPlay className="w-full h-full object-cover bg-black" />
                </div>
            </div>

            {/* Controls */}
            <div className={`absolute bottom-0 left-0 right-0 p-10 bg-gradient-to-t from-black/90 to-transparent transition-all z-50 ${showControls ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
                <div className="flex items-center justify-center gap-6">
                    <button onClick={toggleAudio} className={`w-14 h-14 rounded-full flex items-center justify-center text-white ${isAudioMuted ? 'bg-red-500' : 'bg-white/10'}`}>
                        {isAudioMuted ? <MicOffIcon /> : <MicIcon />}
                    </button>
                    <button onClick={handleCloseWindow} className="w-[72px] h-[72px] bg-red-600 rounded-full flex items-center justify-center text-white hover:scale-110 transition-all">
                        <PhoneOffIcon />
                    </button>
                    <button onClick={toggleVideo} className={`w-14 h-14 rounded-full flex items-center justify-center text-white ${isVideoMuted ? 'bg-red-500' : 'bg-white/10'}`}>
                        {isVideoMuted ? <VideoOffIcon /> : <VideoIcon />}
                    </button>
                </div>
            </div>

            <style>{`
                @keyframes pulse-ring { 0% { transform: scale(1); opacity: 0.8; } 100% { transform: scale(1.4); opacity: 0; } }
                @keyframes fadeInUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
            `}</style>
        </div>
    );
};

export default VideoCallPage;