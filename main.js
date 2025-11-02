const startBtn = document.getElementById('start');
const stopBtn  = document.getElementById('stop');
const bitsEl   = document.getElementById('bits');
const freqEl   = document.getElementById('freq');
const bitsVal  = document.getElementById('bitsVal');
const freqVal  = document.getElementById('freqVal');

let ctx, workletNode, osc, master;

// ----------------------
// 오디오 컨텍스트 초기화
// ----------------------
async function ensureCtx() {
  if (!ctx) {
    ctx = new (window.AudioContext || window.webkitAudioContext)();
    await ctx.audioWorklet.addModule('./bitcrusher-processor.js');

    workletNode = new AudioWorkletNode(ctx, 'bitcrusher-processor', {
      numberOfInputs: 1,
      numberOfOutputs: 1,
      outputChannelCount: [2]
    });

    master = ctx.createGain();
    master.gain.value = 0.2;
    workletNode.connect(master).connect(ctx.destination);
  }
}

// ----------------------
// 소스 생성 (오실레이터)
// ----------------------
function createSource() {
  osc = ctx.createOscillator();
  osc.type = 'sawtooth'; // 톱니파 (bit depth 변화 잘 들림)
  osc.frequency.value = 500;
  osc.connect(workletNode);
  osc.start();
}

// ----------------------
// 파라미터 업데이트
// ----------------------
function updateBits() {
  const v = Math.round(+bitsEl.value);
  bitsVal.textContent = v;
  if (workletNode) {
    workletNode.parameters.get('bits').value = v;
  }
}

function updateFreq() {
  const v = Math.round(+freqEl.value);
  freqVal.textContent = v;
  if (workletNode) {
    workletNode.parameters.get('frequencyReduction').value = v;
  }
}

// ----------------------
// 버튼 이벤트
// ----------------------
startBtn.addEventListener('click', async () => {
  await ensureCtx();
  if (ctx.state !== 'running') await ctx.resume();

  if (!osc) createSource();

  // 초기 파라미터 적용
  updateBits();
  updateFreq();
});

stopBtn.addEventListener('click', async () => {
  if (!ctx) return;
  if (osc) {
    try { osc.stop(); } catch(_) {}
    try { osc.disconnect(); } catch(_) {}
    osc = null;
  }
});

// ----------------------
// 슬라이더 이벤트
// ----------------------
bitsEl.addEventListener('input', updateBits);
freqEl.addEventListener('input', updateFreq);

// 초기 표시
bitsVal.textContent = bitsEl.value;
freqVal.textContent = freqEl.value;