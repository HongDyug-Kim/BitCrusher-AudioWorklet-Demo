class BitCrusherProcessor extends AudioWorkletProcessor {
  static get parameterDescriptors() {
    return [
      { name: 'bits', defaultValue: 8, minValue: 2, maxValue: 16, automationRate: 'k-rate' },
      { name: 'frequencyReduction', defaultValue: 1, minValue: 1, maxValue: 128, automationRate: 'k-rate' },
      // 선택: 드라이/웻 블렌드로 체감 강화
      { name: 'mix', defaultValue: 1, minValue: 0, maxValue: 1, automationRate: 'k-rate' }
    ];
  }

  constructor() {
    super();
    this.phase = 0;
    this.hold = 0;
  }

  process(inputs, outputs, parameters) {
    const input = inputs[0];
    const output = outputs[0];

    const bits  = Math.max(2, Math.min(16, Math.round(parameters.bits[0])));
    const freqR = Math.max(1, Math.round(parameters.frequencyReduction[0]));
    const mix   = Math.min(1, Math.max(0, parameters.mix ? parameters.mix[0] : 1));

    // 레벨 수와 스텝 계산 ([-1,1] 구간을 균등 분할)
    const levels = Math.pow(2, bits) - 1;     // 예: 8bit → 255
    const step   = 2 / levels;                // [-1,1]을 levels 등분
    // 샘플을 스텝 격자로 스냅시키는 함수
    const quantize = (x) => {
      const sn = Math.round((x + 1) / step) * step - 1;
      // 경계 과양자화 방지용 하드클립
      return Math.max(-1, Math.min(1, sn));
    };

    for (let ch = 0; ch < output.length; ch++) {
      const inCh  = input[ch] || input[0];
      const outCh = output[ch];

      for (let i = 0; i < outCh.length; i++) {
        // sample & hold 로 샘플레이트 감소
        if (this.phase++ >= freqR) {
          this.phase = 0;
          this.hold = inCh ? inCh[i] : 0;
        }
        const dry = inCh ? inCh[i] : 0;
        const wet = quantize(this.hold);
        outCh[i] = wet * mix + dry * (1 - mix);
      }
    }
    return true;
  }
}

registerProcessor('bitcrusher-processor', BitCrusherProcessor);