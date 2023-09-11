import { createWorker } from 'tesseract.js';
import { fileInput, inImageEL, progressEL } from './constants';

let file: any = '';
let imgURL = '/quote.webp';

const worker = await createWorker({
  logger: m => {
    const progress = m.progress * 100;
    progressEL.value = progress;
    progressEL.textContent = '' + progress;
    document.getElementById('logs')!.innerText = `${m.status.replace('tesseract', '')} (${progress}%)\n(${m.userJobId}/${m.workerId})`
  }
});

fileInput.addEventListener('change', (event: any) => {
  file = event!.target!.files[0];

  if (file && file.type.startsWith('image/')) {
    const reader = new FileReader();

    reader.addEventListener('load', (ev: any) => {
      imgURL = ev.target.result;
      inImageEL.src = ev.target.result;
      document.getElementById('file-name')!.textContent = file.name;
    });

    reader.readAsDataURL(file);
  }
});

document.getElementById('btn-file')?.addEventListener('click', () => {
  fileInput.click();
});

document.getElementById('form-extract')?.addEventListener('submit', async (e: any) => {
  e.preventDefault();
  try {
    const url = e.target.elements[0].value;
    const language = e.target.elements[1].value;

    if (url && url.length > 10) {
      imgURL = url;
      inImageEL.src = imgURL;
    }

    await worker.loadLanguage(language);
    await worker.initialize(language);
    const { data: { text } } = await worker.recognize(imgURL);
    document.getElementById('extracted-text')!.innerText = text;
  } catch (error: any) {
    document.getElementById('logs')!.innerText = error.message
  }
});

document.getElementById('btn-terminate-worker')?.addEventListener('click', async () => {
  await worker.terminate();
})