class BitCrusherProcessor extends AudioWorkletProcessor {
  static get parameterDescriptors() {
    return [
      {
        name: 'bits',
        defaultValue: 8,
        minValue: 2,
        maxValue: 16,
        automationRate: 'k-rate',
      },
      {
        name: 'frequencyReduction',
        defaultValue: 8,
        minValue: 1,
        maxValue: 64,
        automationRate: 'k-rate',
      },
    ];
  }

  constructor() {
    super();
    this.phase = 0;
    this.lastSample = 0;
  }

  process(inputs, outputs, parameters) {
    const input = inputs[0];
    const output = outputs[0];

    const bits = parameters.bits[0];
    const freqRed = parameters.frequencyReduction[0];

    const step = Math.pow(0.5, bits);

    for (let ch = 0; ch < output.length; ch++) {
      const inCh = input[ch] || input[0];
      const outCh = output[ch];

      for (let i = 0; i < outCh.length; i++) {
        this.phase++;
        if (this.phase >= freqRed) {
          this.phase = 0;
          this.lastSample = inCh ? inCh[i] : 0;
        }
        outCh[i] = Math.round(this.lastSample / step) * step;
      }
    }

    return true; // 오디오 처리를 계속 진행
  }
}

registerProcessor('bitcrusher-processor', BitCrusherProcessor);