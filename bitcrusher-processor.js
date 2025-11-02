class BitCrusherProcessor extends AudioWorkletProcessor {
  static get parameterDescriptors() {
    return [
      {
        name: 'bits',
        defaultValue: 8,
        minValue: 2,
        maxValue: 16,
        automationRate: 'k-rate'
      },
      {
        name: 'frequencyReduction',
        defaultValue: 8,
        minValue: 1,
        maxValue: 64,
        automationRate: 'k-rate'
      }
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

    const bits = Math.max(2, Math.min(16, Math.round(parameters.bits[0])));
    const freqReduction = Math.max(1, Math.round(parameters.frequencyReduction[0]));

    // step 크기 (양자화 단계)
    const step = 1 / Math.pow(2, bits - 1);

    for (let channel = 0; channel < output.length; ++channel) {
      const inputChannel = input[channel] || input[0];
      const outputChannel = output[channel];

      for (let i = 0; i < outputChannel.length; ++i) {
        this.phase++;
        if (this.phase >= freqReduction) {
          this.phase = 0;
          this.lastSample = inputChannel ? inputChannel[i] : 0;
        }

        // Bit Depth에 따른 양자화 (거칠게 들리도록)
        outputChannel[i] = Math.round(this.lastSample / step) * step;
      }
    }

    return true;
  }
}

registerProcessor('bitcrusher-processor', BitCrusherProcessor);