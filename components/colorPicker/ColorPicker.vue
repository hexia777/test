<template>
  <div
    role="application"
    aria-label="Sketch color picker"
    :class="['vc-sketch', disableAlpha ? 'vc-sketch__disable-alpha' : '']"
  >
    <div class="vc-sketch-saturation-wrap">
      <saturation v-model="colors" @change="childChange" />
    </div>
    <div class="vc-sketch-controls">
      <div class="vc-sketch-sliders">
        <div class="vc-sketch-hue-wrap">
          <hue v-model="colors" @change="childChange" />
        </div>
        <div class="vc-sketch-alpha-wrap" v-if="!disableAlpha">
          <alpha v-model="colors" @change="childChange" />
        </div>
      </div>
      <div class="vc-sketch-color-wrap">
        <div
          :aria-label="`Current color is ${activeColor}`"
          class="vc-sketch-active-color"
          :style="{ background: activeColor }"
        ></div>
        <checkboard />
      </div>
    </div>
    <!-- rgba -->
    <!-- <div class="vc-sketch-field" v-if="!disableFields">
     
      <div class="vc-sketch-field--double">
        <ed-in label="hex" :value="hex" @change="inputChange" />
      </div>
      <div class="vc-sketch-field--single">
        <ed-in label="r" :value="colors.rgba.r" @change="inputChange" />
      </div>
      <div class="vc-sketch-field--single">
        <ed-in label="g" :value="colors.rgba.g" @change="inputChange" />
      </div>
      <div class="vc-sketch-field--single">
        <ed-in label="b" :value="colors.rgba.b" @change="inputChange" />
      </div>
      <div class="vc-sketch-field--single" v-if="!disableAlpha">
        <ed-in label="a" :value="colors.a" :arrow-offset="0.01" :max="1" @change="inputChange" />
      </div>
    </div> -->
    <div class="vc-sketch-presets" role="group" aria-label="A color preset, pick one to set as current color">
      <template v-for="c in presetColors">
        <div
          v-if="!isTransparent(c)"
          class="vc-sketch-presets-color"
          :aria-label="'Color:' + c"
          :key="c"
          :style="{ background: c }"
          @click="handlePreset(c)"
        ></div>
        <div
          v-else
          :key="c"
          :aria-label="'Color:' + c"
          class="vc-sketch-presets-color"
          @click="handlePreset(c)"
        >
          <checkboard />
        </div>
      </template>
    </div>
  </div>
</template>

<script>
  import colorMixin from './mixin/color'
  import editableInput from './common/EditableInput.vue'
  import saturation from './common/Saturation.vue'
  import hue from './common/Hue.vue'
  import alpha from './common/Alpha.vue'
  import checkboard from './common/Checkboard.vue'

  const presetColors = [
    '#D0021B',
    '#F5A623',
    '#F8E71C',
    '#8B572A',
    '#7ED321',
    '#417505',
    '#BD10E0',
    '#9013FE',
    '#4A90E2',
    '#50E3C2',
    '#B8E986',
    '#000000',
    '#4A4A4A',
    '#9B9B9B',
    '#FFFFFF',
    'rgba(0,0,0,0)',
  ]

  export default {
    name: 'ColorPicker',
    components: {
      saturation,
      hue,
      alpha,
      // 'ed-in': editableInput,
      checkboard,
    },
    mixins: [colorMixin],
    props: {
      presetColors: {
        type: Array,
        default() {
          return presetColors
        },
      },
      disableAlpha: {
        type: Boolean,
        default: false,
      },
      disableFields: {
        type: Boolean,
        default: false,
      },
    },
    computed: {
      hex() {
        let hex
        if (this.colors.a < 1) {
          hex = this.colors.hex8
        } else {
          hex = this.colors.hex
        }
        return hex.replace('#', '')
      },
      activeColor() {
        const rgba = this.colors.rgba
        return 'rgba(' + [rgba.r, rgba.g, rgba.b, rgba.a].join(',') + ')'
      },
    },
    methods: {
      handlePreset(c) {
        this.colorChange({
          hex: c,
          source: 'hex',
        })
      },
      childChange(data) {
        this.colorChange(data)
      },
      inputChange(data) {
        if (!data) {
          return
        }
        if (data.hex) {
          this.isValidHex(data.hex) &&
            this.colorChange({
              hex: data.hex,
              source: 'hex',
            })
        } else if (data.r || data.g || data.b || data.a) {
          this.colorChange({
            r: data.r || this.colors.rgba.r,
            g: data.g || this.colors.rgba.g,
            b: data.b || this.colors.rgba.b,
            a: data.a || this.colors.rgba.a,
            source: 'rgba',
          })
        }
      },
    },
  }
</script>

<style>
  .vc-sketch {
    position: absolute;
    bottom: 50px;
    box-sizing: initial;
    width: 200px;
    padding: 10px 10px 0;
    background: #fff;
    border-radius: 4px;
    box-shadow: 0 0 0 1px rgba(0, 0, 0, 0.15), 0 8px 16px rgba(0, 0, 0, 0.15);
  }

  .vc-sketch-saturation-wrap {
    position: relative;
    width: 100%;
    padding-bottom: 75%;
    overflow: hidden;
  }

  .vc-sketch-controls {
    display: flex;
  }

  .vc-sketch-sliders {
    flex: 1;
    padding: 4px 0;
  }

  .vc-sketch-sliders .vc-hue,
  .vc-sketch-sliders .vc-alpha-gradient {
    border-radius: 2px;
  }

  .vc-sketch-hue-wrap {
    position: relative;
    height: 10px;
  }

  .vc-sketch-alpha-wrap {
    position: relative;
    height: 10px;
    margin-top: 4px;
    overflow: hidden;
  }

  .vc-sketch-color-wrap {
    position: relative;
    width: 24px;
    height: 24px;
    margin-top: 4px;
    margin-left: 4px;
    border-radius: 3px;
  }

  .vc-sketch-active-color {
    position: absolute;
    top: 0;
    right: 0;
    bottom: 0;
    left: 0;
    z-index: 2;
    border-radius: 2px;
    box-shadow: inset 0 0 0 1px rgba(0, 0, 0, 0.15), inset 0 0 4px rgba(0, 0, 0, 0.25);
  }

  .vc-sketch-color-wrap .vc-checkerboard {
    background-size: auto;
  }

  .vc-sketch-field {
    display: flex;
    padding-top: 4px;
  }

  .vc-sketch-field .vc-input__input {
    width: 90%;
    padding: 4px 0 3px 10%;
    font-size: 10px;
    border: none;
    box-shadow: inset 0 0 0 1px #ccc;
  }

  .vc-sketch-field .vc-input__label {
    display: block;
    padding-top: 3px;
    padding-bottom: 4px;
    font-size: 11px;
    color: #222;
    text-align: center;
    text-transform: capitalize;
  }

  .vc-sketch-field--single {
    flex: 1;
    padding-left: 6px;
  }

  .vc-sketch-field--double {
    flex: 2;
  }

  .vc-sketch-presets {
    padding-top: 10px;
    padding-left: 10px;
    margin-right: -10px;
    margin-left: -10px;
    border-top: 1px solid #eee;
  }

  .vc-sketch-presets-color {
    position: relative;
    display: inline-block;
    width: 16px;
    height: 16px;
    margin: 0 10px 10px 0;
    overflow: hidden;
    vertical-align: top;
    cursor: pointer;
    border-radius: 3px;
    box-shadow: inset 0 0 0 1px rgba(0, 0, 0, 0.15);
  }

  .vc-sketch-presets-color .vc-checkerboard {
    border-radius: 3px;
    box-shadow: inset 0 0 0 1px rgba(0, 0, 0, 0.15);
  }

  .vc-sketch__disable-alpha .vc-sketch-color-wrap {
    height: 10px;
  }
</style>
