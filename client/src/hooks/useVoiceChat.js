import { useState, useEffect, useRef, useCallback } from 'react';
import { Peer } from 'peerjs';
import socket from '../socket';

export function useVoiceChat(roomCode, playerSymbol) {
  const [isMuted, setIsMuted] = useState(true);
  const [isConnected, setIsConnected] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState('idle'); // idle | connecting | connected | failed

  const peerRef = useRef(null);
  const localStreamRef = useRef(null);
  const remoteAudioRef = useRef(null);
  const currentCallRef = useRef(null);

  // Initialize peer when entering a room
  useEffect(() => {
    if (!roomCode || !playerSymbol) return;

    const peerId = `ttt-${roomCode}-${playerSymbol}`;
    const peer = new Peer(peerId, {
      debug: 0,
    });

    peer.on('open', (id) => {
      console.log('🎙️ PeerJS connected with ID:', id);
      peerRef.current = peer;
    });

    peer.on('call', async (call) => {
      console.log('📞 Incoming call...');
      setConnectionStatus('connecting');
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
        localStreamRef.current = stream;

        // Start muted
        stream.getAudioTracks().forEach((track) => {
          track.enabled = false;
        });

        call.answer(stream);
        currentCallRef.current = call;

        call.on('stream', (remoteStream) => {
          playRemoteAudio(remoteStream);
          setIsConnected(true);
          setConnectionStatus('connected');
        });

        call.on('close', () => {
          setIsConnected(false);
          setConnectionStatus('idle');
        });

        call.on('error', (err) => {
          console.error('Call error:', err);
          setConnectionStatus('failed');
        });
      } catch (err) {
        console.error('Failed to get audio:', err);
        setConnectionStatus('failed');
      }
    });

    peer.on('error', (err) => {
      console.error('PeerJS error:', err);
      if (err.type !== 'peer-unavailable') {
        setConnectionStatus('failed');
      }
    });

    return () => {
      cleanupVoice();
      peer.destroy();
    };
  }, [roomCode, playerSymbol]);

  // Player X initiates the call when both players are in the room
  const initiateCall = useCallback(async () => {
    if (!peerRef.current || !roomCode || playerSymbol !== 'X') return;

    const remotePeerId = `ttt-${roomCode}-O`;
    setConnectionStatus('connecting');

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
      localStreamRef.current = stream;

      // Start muted
      stream.getAudioTracks().forEach((track) => {
        track.enabled = false;
      });

      const call = peerRef.current.call(remotePeerId, stream);
      currentCallRef.current = call;

      call.on('stream', (remoteStream) => {
        playRemoteAudio(remoteStream);
        setIsConnected(true);
        setConnectionStatus('connected');
      });

      call.on('close', () => {
        setIsConnected(false);
        setConnectionStatus('idle');
      });

      call.on('error', (err) => {
        console.error('Call error:', err);
        setConnectionStatus('failed');
      });
    } catch (err) {
      console.error('Failed to get audio:', err);
      setConnectionStatus('failed');
    }
  }, [roomCode, playerSymbol]);

  const playRemoteAudio = (stream) => {
    if (remoteAudioRef.current) {
      remoteAudioRef.current.pause();
      remoteAudioRef.current.srcObject = null;
    }
    const audio = new Audio();
    audio.srcObject = stream;
    audio.play().catch(console.error);
    remoteAudioRef.current = audio;
  };

  const toggleMute = useCallback(() => {
    if (localStreamRef.current) {
      const tracks = localStreamRef.current.getAudioTracks();
      tracks.forEach((track) => {
        track.enabled = !track.enabled;
      });
      setIsMuted(!tracks[0]?.enabled);
    }
  }, []);

  const cleanupVoice = useCallback(() => {
    if (currentCallRef.current) {
      currentCallRef.current.close();
      currentCallRef.current = null;
    }
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((t) => t.stop());
      localStreamRef.current = null;
    }
    if (remoteAudioRef.current) {
      remoteAudioRef.current.pause();
      remoteAudioRef.current.srcObject = null;
      remoteAudioRef.current = null;
    }
    setIsConnected(false);
    setIsMuted(true);
    setConnectionStatus('idle');
  }, []);

  return {
    isMuted,
    isConnected,
    connectionStatus,
    toggleMute,
    initiateCall,
    cleanupVoice,
  };
}
