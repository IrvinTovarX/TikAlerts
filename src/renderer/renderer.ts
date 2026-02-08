async function call(path: string, init?: RequestInit): Promise<unknown> {
  const res = await fetch(`http://127.0.0.1:3210${path}`, init);
  return res.json();
}

const testBtn = document.getElementById('testBtn') as HTMLButtonElement;
const createBtn = document.getElementById('createScreen') as HTMLButtonElement;
const screenName = document.getElementById('screenName') as HTMLInputElement;
const output = document.getElementById('output') as HTMLElement;

testBtn.addEventListener('click', async () => {
  const data = await call('/test');
  output.textContent = JSON.stringify(data, null, 2);
});

createBtn.addEventListener('click', async () => {
  const data = await call('/api/screens', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ name: screenName.value || 'New Screen' })
  });
  output.textContent = JSON.stringify(data, null, 2);
});
