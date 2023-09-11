import { createWorker } from 'tesseract.js';
import { progressEL } from './constants';

const fileInput = document.getElementById('file')!;
const imgElement = document.getElementById('myImage')! as HTMLImageElement;

let file: any = '';
let imgURL = '/quote.webp';

const worker = await createWorker({
  logger: m => {
    console.log(m)
    progressEL.value = m.progress * 100;
    progressEL.textContent = '' + m.progress * 100;
    document.getElementById('logs')!.innerText = `${m.status.replace('tesseract','')}\n(${m.userJobId}/${m.workerId})`
  }
});

fileInput.addEventListener('change', (event: any) => {
  file = event!.target!.files[0];

  if (file && file.type.startsWith('image/')) {
    const reader = new FileReader();

    reader.addEventListener('load', (ev: any) => {
      imgURL = ev.target.result;
      imgElement.src = ev.target.result;
    });

    reader.readAsDataURL(file);
  }
});

document.getElementById('btn-file')?.addEventListener('click', () => {
  fileInput.click();
});

document.getElementById('form-extract')?.addEventListener('submit', async (e: any) => {
  e.preventDefault();

  const url = e.target.elements[0].value;
  const language = e.target.elements[1].value;

  await worker.loadLanguage(language);
  await worker.initialize(language);
  const { data: { text } } = await worker.recognize(url && url.length > 10 ? url : imgURL);
  document.getElementById('extracted-text')!.innerText = text;
  await worker.terminate();

});