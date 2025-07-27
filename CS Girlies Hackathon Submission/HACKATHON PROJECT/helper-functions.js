function resetRecordingUI(type)
{
    if (type === 'video')
    {
        const videoElement = document.getElementById('recorded-video');
        videoElement.src = '';
        document.getElementById('video-area').classList.add('hidden');

        if (videoStream)
        {
            videoStream.getTracks().forEach(track => track.stop());
            videoStream = null;
        }
    }
    else if (type === 'audio')
    {
        const audioElement = document.getElementById('recorded-audio');
        audioElement.src = '';
        document.getElementById('audio-area').classList.add('hidden');
    }
    else if (type === 'letter' || type === 'text')
    {
        document.getElementById('letter').value = '';
        document.getElementById('text-area').classList.add('hidden');
    }

    //Reset unlock time field
    const unlockInput = document.getElementById('unlock-time');
    if (unlockInput)
    {
        unlockInput.value = '';
    }
}

function promptUnlockTime(onConfirm)
{
    const modal = document.getElementById('unlockModal');
    const input = document.getElementById('unlockDateTime');
    const confirmButton = document.getElementById('confirmUnlockButton');
    const cancelButton = document.getElementById('cancelUnlockButton');

    input.value = ""; //reset pervious value
    modal.classList.remove('hidden');

    function cleanup()
    {
        modal.classList.add('hidden'); //hidden class to hide modal
        confirmButton.removeEventListener('click', onConfirmClick);
        cancelButton.removeEventListener('click', onCancelClick);
    }

    function onConfirmClick()
    {
        if (!input.value)
        {
            alert ('Please select a date and time to schedule time capsule delivery');
            return;
        }
        cleanup();
        onConfirm(input.value);
    }

    function onCancelClick()
    {
        cleanup();
    }

    confirmButton.addEventListener('click', onConfirmClick);
    cancelButton.addEventListener('click', onCancelClick)
}

function showOnly(areaId)
{
    const areas = ['video-area', 'audio-area', 'text-area'];
    areas.forEach(id => {
        const el = document.getElementById(id);
        if (id === areaId)
        {
            el.classList.remove('hidden');
        }
        else
        {
            el.classList.add('hidden');
        }
    });

    //Stop streams if switching away
    if (currentVisibleArea === 'video-area' && areaId !== 'video-area')
    {
        stopAllTracks(videoStream);
        videoStream = null;
    }

    if (currentVisibleArea === 'audio-area' && areaId !== 'audio-area')
    {
        stopAllTracks(audioStream);
        audioStream = null;
    }

    currentVisibleArea = areaId;
}

function decodeBase64DataUrl(dataUrl) {
  const base64 = dataUrl.split(',')[1];
  try {
    return atob(base64);
  } catch (err) {
    console.error("Base64 decode error:", err);
    return "Unable to decode message.";
  }
}