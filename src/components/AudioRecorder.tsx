import React, { useState, useRef, useEffect } from 'react';
import { S3Client } from '@aws-sdk/client-s3';
import { createPresignedPost } from '@aws-sdk/s3-presigned-post';
import { signUrl } from 'aws-iot-device-sdk-v2';
import mqtt from 'mqtt';

export function AudioRecorder() {
  // State management for recording status and UI feedback
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState(null);
  const [isPlayingResponse, setIsPlayingResponse] = useState(false);

  // Refs to hold stateful objects that don't trigger re-renders
  const mediaRecorder = useRef(null);      // Holds the MediaRecorder instance
  const audioContext = useRef(null);       // Web Audio API context
  const analyser = useRef(null);           // Audio analyzer for silence detection
  const audioChunks = useRef([]);          // Stores recorded audio chunks
  const silenceTimeout = useRef(null);     // Timer for silence detection
  const audioPlayer = useRef(null);        // HTML audio element for playback
  const mqttClient = useRef(null);         // AWS IoT MQTT client

  // Initialize MQTT connection when component mounts
  useEffect(() => {
    const initMqtt = async () => {
      try {
        // Get AWS configuration from environment variables
        const endpoint = import.meta.env.VITE_IOT_ENDPOINT;
        const region = import.meta.env.VITE_AWS_REGION;
        const accessKeyId = import.meta.env.VITE_AWS_ACCESS_KEY_ID;
        const secretAccessKey = import.meta.env.VITE_AWS_SECRET_ACCESS_KEY;

        // Generate signed websocket URL for AWS IoT
        const signedUrl = signUrl(
          endpoint,
          region,
          'iotdevicegateway',
          accessKeyId,
          secretAccessKey
        );

        // Initialize MQTT client with AWS IoT websocket connection
        mqttClient.current = mqtt.connect(signedUrl, {
          protocol: 'wss',
          protocolVersion: 4,
          clientId: `teddy-recorder-${Math.random().toString(16).substring(2, 10)}`,
          clean: true,                    // Start a clean session
          reconnectPeriod: 3000,          // Try to reconnect every 3 seconds
          connectTimeout: 30000,          // Connection timeout after 30 seconds
        });

        // Set up MQTT event handlers
        mqttClient.current.on('connect', () => {
          console.log('Connected to AWS IoT');
          // Subscribe to the response topic
          mqttClient.current.subscribe('audio/output', (err) => {
            if (!err) {
              console.log('Successfully subscribed to audio/output');
            }
          });
        });

        // Handle incoming messages
        mqttClient.current.on('message', (topic, message) => {
          if (topic === 'audio/output') {
            const data = JSON.parse(message.toString());
            if (data.message === 'audio processed') {
              handleResponseAudio();
            }
          }
        });

        // Error handling
        mqttClient.current.on('error', (err) => {
          console.error('MQTT Error:', err);
          setError('Connection error occurred');
        });

        // Handle offline state
        mqttClient.current.on('offline', () => {
          console.log('MQTT Client is offline');
        });

        // Handle reconnection attempts
        mqttClient.current.on('reconnect', () => {
          console.log('Reconnecting to AWS IoT...');
        });

      } catch (err) {
        console.error('Error connecting to AWS IoT:', err);
        setError('Failed to initialize AWS IoT connection');
      }
    };

    // Initialize MQTT connection
    initMqtt();

    // Cleanup function to run when component unmounts
    return () => {
      if (mqttClient.current && mqttClient.current.connected) {
        mqttClient.current.end(false, () => {
          console.log('MQTT connection closed');
        });
      }
    };
  }, []); // Empty dependency array means this runs once on mount

  // Function to detect silence in the audio stream
  const detectSilence = (stream) => {
    if (!audioContext.current) {
      audioContext.current = new AudioContext();
    }

    const source = audioContext.current.createMediaStreamSource(stream);
    analyser.current = audioContext.current.createAnalyser();
    analyser.current.fftSize = 2048;
    source.connect(analyser.current);

    const bufferLength = analyser.current.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    let silenceStart = null;

    const checkAudioLevel = () => {
      if (!analyser.current || !isRecording) return;

      analyser.current.getByteFrequencyData(dataArray);
      const average = dataArray.reduce((a, b) => a + b) / bufferLength;
      
      const SILENCE_THRESHOLD = 5;

      // Check if audio level is below silence threshold
      if (average < SILENCE_THRESHOLD) {
        if (!silenceStart) {
          silenceStart = Date.now();
        } else if (Date.now() - silenceStart > 5000) { // 5 seconds of silence
          stopRecording();
          return;
        }
      } else {
        silenceStart = null;
      }

      silenceTimeout.current = window.requestAnimationFrame(checkAudioLevel);
    };

    checkAudioLevel();
  };

  // Start recording audio
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorder.current = new MediaRecorder(stream);
      audioChunks.current = [];

      mediaRecorder.current.ondataavailable = (event) => {
        audioChunks.current.push(event.data);
      };

      mediaRecorder.current.onstop = async () => {
        const audioBlob = new Blob(audioChunks.current, { type: 'audio/wav' });
        await handleAudioUpload(audioBlob);
      };

      mediaRecorder.current.start();
      setIsRecording(true);
      setError(null);
      detectSilence(stream);
    } catch (err) {
      setError('Please allow microphone access to record audio');
      console.error('Error accessing microphone:', err);
    }
  };

  // Stop recording audio
  const stopRecording = () => {
    if (mediaRecorder.current?.state === 'recording') {
      mediaRecorder.current.stop();
      mediaRecorder.current.stream.getTracks().forEach(track => track.stop());
    }
    
    if (silenceTimeout.current) {
      cancelAnimationFrame(silenceTimeout.current);
    }

    if (audioContext.current) {
      audioContext.current.close();
      audioContext.current = null;
    }

    setIsRecording(false);
  };

  // Handle playing back the response audio
  const handleResponseAudio = async () => {
    try {
      const bucket = import.meta.env.VITE_S3_BUCKET;
      const region = import.meta.env.VITE_AWS_REGION;
      
      // Construct the URL for the processed audio file
      const audioUrl = `https://${bucket}.s3.${region}.amazonaws.com/processed_audio.wav`;
      
      if (audioPlayer.current) {
        audioPlayer.current.src = audioUrl;
        audioPlayer.current.play();
        setIsPlayingResponse(true);
        
        audioPlayer.current.onended = () => {
          setIsPlayingResponse(false);
        };
      }
    } catch (err) {
      console.error('Error playing response:', err);
      setError('Failed to play response audio');
      setIsPlayingResponse(false);
    }
  };

  // Upload recorded audio to S3 and trigger processing
  const handleAudioUpload = async (audioBlob) => {
    setIsProcessing(true);
    setError(null);
    
    try {
      const region = import.meta.env.VITE_AWS_REGION;
      const accessKeyId = import.meta.env.VITE_AWS_ACCESS_KEY_ID;
      const secretAccessKey = import.meta.env.VITE_AWS_SECRET_ACCESS_KEY;
      const bucket = import.meta.env.VITE_S3_BUCKET;

      // Validate AWS configuration
      if (!region || !accessKeyId || !secretAccessKey || !bucket) {
        throw new Error('Missing AWS configuration');
      }

      // Create S3 client
      const s3Client = new S3Client({
        region,
        credentials: {
          accessKeyId,
          secretAccessKey,
        },
      });

      // Get presigned URL for S3 upload
      const { url, fields } = await createPresignedPost(s3Client, {
        Bucket: bucket,
        Key: 'prompt.wav',
        Fields: {
          'Content-Type': 'audio/wav',
        },
        Conditions: [
          ['content-length-range', 0, 10485760], // Max 10MB
          ['eq', '$Content-Type', 'audio/wav'],
        ],
        Expires: 600, // URL expires in 10 minutes
      });

      // Prepare form data for upload
      const formData = new FormData();
      Object.entries(fields).forEach(([key, value]) => {
        formData.append(key, value);
      });
      formData.append('file', audioBlob, 'prompt.wav');
      formData.append('Content-Type', 'audio/wav');

      // Upload to S3
      const uploadResponse = await fetch(url, {
        method: 'POST',
        body: formData,
      });

      if (!uploadResponse.ok) {
        throw new Error('Upload failed');
      }

      // Publish message to MQTT topic
      if (mqttClient.current && mqttClient.current.connected) {
        mqttClient.current.publish(
          'audio/input',
          JSON.stringify({ message: 'audio published' }),
          { qos: 1 }, // Quality of Service level 1
          (err) => {
            if (err) {
              console.error('Error publishing message:', err);
              setError('Failed to trigger audio processing');
            } else {
              console.log('Successfully published to audio/input');
            }
          }
        );
      } else {
        throw new Error('MQTT client not connected');
      }

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to upload audio';
      setError(errorMessage);
      console.error('Error:', err);
    } finally {
      setIsProcessing(false);
    }
  };

  // Handle button click to start/stop recording
  const handleTeddyClick = () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  // Render the component
  return (
    <div className="relative">
      <button
        onClick={handleTeddyClick}
        disabled={isProcessing || isPlayingResponse}
        className={`transform transition-transform duration-200 ${
          isRecording ? 'scale-110' : 'scale-100'
        } ${(isProcessing || isPlayingResponse) ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105'}`}
        aria-label={isRecording ? 'Stop Recording' : 'Start Recording'}
      >
        <img 
          src="../../public/teddy.png"
          alt="Teddy Bear"
          className={`w-32 h-32 object-cover rounded-full ${
            isRecording ? 'animate-pulse' : ''
          } ${isPlayingResponse ? 'animate-bounce' : ''}`}
        />
      </button>
      
      {/* Error message display */}
      {error && (
        <p className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 text-red-500 text-sm whitespace-nowrap">
          {error}
        </p>
      )}
      
      {/* Processing status display */}
      {isProcessing && (
        <p className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 text-pink-800 text-sm whitespace-nowrap">
          Processing audio...
        </p>
      )}

      {/* Response playback status display */}
      {isPlayingResponse && (
        <p className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 text-green-600 text-sm whitespace-nowrap">
          Teddy is responding...
        </p>
      )}

      {/* Hidden audio player for response playback */}
      <audio ref={audioPlayer} className="hidden" controls />
    </div>
  );
}

export default AudioRecorder;