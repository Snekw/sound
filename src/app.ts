import './styles/main.scss'
import { SrcOption, setupSourceLabels, sourceAudioFiles, loadAudioFile } from "./audioSources"
import { setupPlayPause } from "./controls"
import { AudioVisualizer } from "./audioVisualizer"

let src: SrcOption = SrcOption.mic

setupSourceLabels()

const audioVisualizer = new AudioVisualizer()

setupPlayPause(audioVisualizer.play.bind(audioVisualizer), audioVisualizer.pause.bind(audioVisualizer))

// handle cases where the audio context was created in suspended state
const resumeElement = document.getElementById('resume')
if (audioVisualizer.getState() === 'suspended') {
    resumeElement.addEventListener('click', () => {
        audioVisualizer.play()
            .then(() => {
                resumeElement.hidden = true
            })
    })
    resumeElement.hidden = false
}

const srcSelector = document.getElementById('src-selector') as HTMLSelectElement

async function getAudioFileUrl(): Promise<string> {
    return new Promise((resolve) => {
        const el = document.getElementById('audio-file') as HTMLInputElement
        el.addEventListener('change', () => {
            resolve(el.value)
        })
    })
}

const updateSource = async () => {
    const selectedOptionElement = srcSelector[srcSelector.selectedIndex] as HTMLOptionElement
    src = selectedOptionElement.value as SrcOption
    if (src === SrcOption.file) {
        document.getElementById('audio-input').style.display = 'inline-block'
    } else {
        const ai = document.getElementById('audio-input') as HTMLInputElement
        ai.style.display = 'none'
        ai.value = ''
    }
    await audioVisualizer.pause()
    switch (src) {
        case SrcOption.mic:
            await listenMic()
            break
        case SrcOption.file:
            await listenToFileURL(await getAudioFileUrl())
            break
        case SrcOption.truck:
            await listenToFileURL(sourceAudioFiles.truck)
            break
        case SrcOption.f500_1000_1000:
            await listenToFileURL(sourceAudioFiles.f500_1000_1000)
            break
    }
    await audioVisualizer.play()
}
srcSelector.addEventListener('change', updateSource)
updateSource()
const listenElement = document.getElementById('listen') as HTMLInputElement

const updateListenState = () => {
    if (listenElement.checked) {
        audioVisualizer.setGain(1)
    } else {
        audioVisualizer.setGain(0)
    }
}

listenElement.addEventListener('change', updateListenState)

/**
 * Listen to microphone
 */
async function listenMic(): Promise<void> {
    const src = await audioVisualizer.createMicSource()
    audioVisualizer.setSource(src)
}

/**
 * Listen to a file from a url
 * @param url URL of the file
 */
async function listenToFileURL(url): Promise<void> {
    const src = await audioVisualizer.createUrlSource(url)
    audioVisualizer.setSource(src)
}

function update() {
    audioVisualizer.update()
    window.requestAnimationFrame(update)
}

window.requestAnimationFrame(update)

