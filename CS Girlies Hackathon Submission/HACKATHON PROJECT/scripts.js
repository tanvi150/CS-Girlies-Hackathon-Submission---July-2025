let mediaRecorder;
let recordedBlobs = [];

let audioRecorder;
let audioChunks = [];
let audioStream = null;

let videoStream = null;
let transcript = '';
let currentVisibleArea = null;
let recognitionInstance = null;

function toggleHidden(el) {
  el.classList.toggle('hidden');
}

function startTranscription()
{
  if (!('SpeechRecognition' in window || 'webkitSpeechRecognition' in window))
  {
    console.warn('Speech Recognition API not supported in this browser.');
    return null;
  }

  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  const recognition = new SpeechRecognition();
  
  recognition.continuous = true;
  recognition.interimResults = false;
  recognition.lang = 'en-US';

  recognition.onresult = (event) => {
    console.log('SpeechRecognition result event:', event);
    for (let i=event.resultIndex; i < event.results.length; i++)
    {
      if(event.results[i].isFinal)
      {
        transcript += event.results[i][0].transcript + ' ';
        console.log('Transcript so far:', transcript);  //to see transcript updates
      }
    }
  };

  recognition.onerror = (event) => {
    console.error('Speech recognition error', event.error);
  };

  recognition.onspeechstart = () => {
    console.log('Speech started');
  };
  recognition.onspeechend = () => {
    console.log('Speech ended');
  };

  recognition.start();
  console.log('SpeechRecognition started');
  return recognition;
}

function stopTranscription(recognition)
{
  if (recognition)
  {
    recognition.stop();
    recognition.onresult = null;
    recognition.onerror = null;
  }
}

async function sendTranscriptToNarrator(transcript) 
{
 if (!transcript || transcript.trim() === '')
  {
    console.log("No transcript to send");
    return null;
  } 

  console.log('Sending transcript to AI Narrator', transcript);

  try
  {
    /*API Keys removed for confidentiality
    const response = await fetch('OPENROUTER_ENDPOINT', {
      method: 'POST',
      headers: 
      {
        'Content-type': 'application/json',
        'Authorization': 'Bearer OPENROUTER_API_KEY'
      },
      body: JSON.stringify({
        model: OPENROUTER_MODEL,
        messages: [
          {role: "user", content: transcript}
        ]
      })
    });*/

    if (!response.ok)
    {
      console.error('AI Narrator API error:', response.status, response.statusText);
      return null;
    }

    const data = await response.json();
    console.log('AI Narrator response:', data);
    return data;
  } catch(error){
    console.error('Error sending transcript to AI Narrator:', error);
    return null;
  }
}

function stopAllTracks(stream) {
  if (!stream) return;
  stream.getTracks().forEach(t => t.stop());
}

function showVideo() {
  if (currentVisibleArea === 'video-area')
  {
    showOnly(null); //hide all
    return;
  }
  showOnly('video-area');
  
 navigator.mediaDevices.getUserMedia({ video: true, audio: true })
    .then(stream => {
      videoStream = stream;
      document.getElementById('video').srcObject = stream;
    })
    .catch(err => {
      console.error(err);
      alert('Could not access camera/microphone.');
    });
}

function startVideoRecording() {
  if (!videoStream) {
    alert('Please enable the camera first.');
    return;
  }

  recordedBlobs = [];
  transcript = ''; //reset transcript at start
  recognitionInstance = null;

  recognitionInstance = startTranscription(); //start transcription silently on video

  const options = { mimeType: 'video/webm;codecs=vp9,opus' };

  try {
    mediaRecorder = new MediaRecorder(videoStream, options);
  } catch (e) {
    console.warn('Falling back to default MediaRecorder options', e);
    mediaRecorder = new MediaRecorder(videoStream);
  }

  mediaRecorder.ondataavailable = e => {
    if (e.data && e.data.size > 0) recordedBlobs.push(e.data);
  };

  mediaRecorder.onstop = async () => {
    stopTranscription(recognitionInstance);

    // Wait for transcription to finalize
    await new Promise(resolve => setTimeout(resolve, 1500));

    const superBuffer = new Blob(recordedBlobs, { type: 'video/webm' });
    const title = document.getElementById('videoTitle').value.trim() || "Untitled";

    //Get AI narration response
    const narrationResponse = await sendTranscriptToNarrator(transcript.trim());
    let narrationText = '';
    if (narrationResponse)
    {
      narrationText = narrationResponse.choices?.[0]?.message?.content || '';
    }

    promptUnlockTime(unlockDateTimeValue => {
      saveBlob(superBuffer, 'video', unlockDateTimeValue, title, transcript.trim(), narrationText);
      transcript = ''; //reset transcript after save
      document.getElementById('recorded-video').src = URL.createObjectURL(superBuffer);
    });
  };

  mediaRecorder.start();
}

function stopVideoRecording() {
  if (!mediaRecorder || mediaRecorder.state === 'inactive') return;
  mediaRecorder.stop();
}

function restartVideoRecording() {
  recordedBlobs = [];
  document.getElementById('recorded-video').src = '';
}

// AUDIO
function showAudio() {
   if (currentVisibleArea === 'audio-area')
  {
    showOnly(null); //hide all
    return;
  }
  showOnly('audio-area');
}

function startAudioRecording() {
  stopAllTracks(audioStream);
  audioStream = null;

  transcript = ''; //reset transcript at start
  recognitionInstance = null;

  navigator.mediaDevices.getUserMedia({ audio: true })
    .then(stream => {
      audioStream = stream;
      audioChunks = [];

      recognitionInstance = startTranscription(stream); //start transcription silently

      try {
        audioRecorder = new MediaRecorder(stream, { mimeType: 'audio/webm;codecs=opus' });
      } catch (e) {
        console.warn('Falling back to default MediaRecorder options', e);
        audioRecorder = new MediaRecorder(stream);
      }

      audioRecorder.ondataavailable = e => {
        if (e.data && e.data.size > 0) audioChunks.push(e.data);
      };

      audioRecorder.onstop = async () => {
        stopTranscription(recognitionInstance);

        // Wait for transcription to finalize
        await new Promise(resolve => setTimeout(resolve, 1500));

        const blob = new Blob(audioChunks, { type: audioRecorder.mimeType || 'audio/webm' });
        const title = document.getElementById('audioTitle').value.trim() || "Untitled";

       //Get AI narration response
       const narrationResponse = await sendTranscriptToNarrator(transcript.trim());
       let narrationText = '';
       if (narrationResponse)
       {
        narrationText = narrationResponse.choices?.[0]?.message?.content || '';
       }

        promptUnlockTime(unlockDateTimeValue => {
          saveBlob(blob, 'audio', unlockDateTimeValue, title, transcript.trim(), narrationText);
          transcript = ''; //reset after save
          document.getElementById('recorded-audio').src = URL.createObjectURL(blob);
        });

        stopAllTracks(audioStream);
        audioStream = null;
      };

      audioRecorder.start();
    })
    .catch(err => {
      console.error(err);
      alert('Could not access microphone.');
    });
}

function stopAudioRecording() {
  if (!audioRecorder || audioRecorder.state === 'inactive') return;
  audioRecorder.stop();
}

function showText() {
   if (currentVisibleArea === 'text-area')
  {
    showOnly(null); //hide all
    return;
  }
  showOnly('text-area');
}

function saveText() {
  const title = document.getElementById('textTitle').value.trim() || "Untitled";
  const content = document.getElementById('letter').value.trim();

  if (!content) {
    alert("Please write a message before saving.");
    return;
  }

  promptUnlockTime(unlockDateTimeValue => {
    // Include the title inside the content file itself
    const fullContent = `Title: ${title}\n\n${content}`;
    const blob = new Blob([fullContent], { type: 'text/plain' });

    saveBlob(blob, 'letter', unlockDateTimeValue, title, content, '');

    document.getElementById('letter').value = '';
    document.getElementById('textTitle').value = '';
  });
}

function saveBlob(blob, type, unlockTimeInput, title = "Untitled", transcript = '', narrationText = '') 
{
  const unlockTime = new Date(unlockTimeInput).getTime();
  const safeTitle = title.replace(/[^a-z0-9]/gi, '_').toLowerCase();
  const extension = type === 'video' || type === 'audio' ? 'webm' : 'txt' ;
  const filename = `${safeTitle || type}.${extension}`;

  const reader = new FileReader();
  reader.onloadend = function () {
    const base64data = reader.result;

    const entries = JSON.parse(localStorage.getItem('savedMedia') || '[]');
    entries.push({
      type,
      title,
      name: filename,
      time: new Date().toISOString(),
      deliveryTime: unlockTime,
      delivered: false,
      data: base64data,
      transcript: transcript,
      narration: narrationText
    });

    console.log('Saving blob with transcript:', transcript.trim());
    localStorage.setItem('savedMedia', JSON.stringify(entries));
    resetRecordingUI(type);
    alert(`${type.charAt(0).toUpperCase() + type.slice(1)} saved as "${filename}"! View it in Saved Experiences.`);
  };

  reader.readAsDataURL(blob);
}


function promptUnlockTime(cb) {
  const modal = document.getElementById('unlockModal');
  const input = document.getElementById('unlockDateTime');
  const confirmBtn = document.getElementById('confirmUnlockButton');
  const cancelBtn = document.getElementById('cancelUnlockButton');

  modal.classList.remove('hidden');

  const cleanUp = () => {
    confirmBtn.onclick = null;
    cancelBtn.onclick = null;
    modal.classList.add('hidden');
  };

  confirmBtn.onclick = () => {
    const value = input.value;
    if (!value) {
      alert('Please choose a date/time.');
      return;
    }
    cleanUp();
    cb(value);
  };

  cancelBtn.onclick = () => {
    cleanUp();
  };
}