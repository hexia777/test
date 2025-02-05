<template>
  <div class="workflow-operator">
    <div v-if="fromConfig[work]">
      <div
        v-for="(item, index) in Array.isArray(fromConfig[work]) ? fromConfig[work] : fromConfig[work].render"
        :key="index"
      >
        <div
          v-if="item.type === 'radio' && !item.subType && getLinkageResult(item.linkage)"
          class="workflow-element"
        >
          <div v-if="item.group" class="separation"></div>
          <span v-if="item.label" class="element-label">{{ item.label }}</span>
          <template v-for="(child, i) in item.childs">
            <div v-if="getLinkageResult(child.linkage)" :key="i" style="width: 100%;">
              <el-radio
                v-if="item.customKey && !item.others"
                v-model="customParams[item.key]"
                :label="child.value"
                :disabled="limitUser"
                class="workflow-radio"
                :class="[item.style === 'checkbox' && 'checkbox-radio']"
                text-color="#2980ff"
                v-track-label="$commonTrackLabel(work + '_' + item.key + '_' + child.value + '_' + item.type)"
              >
                <span class="workflow-radio-label" @click="child.clickHandle">{{ child.label }}</span>
                <!-- <span class="tag" v-if="child.tag && limitUser">{{ child.tag }}</span> -->
              </el-radio>
              <el-radio
                v-else-if="item.customKey && item.others"
                v-model="otherParams[item.key]"
                :label="child.value"
                :disabled="limitUser"
                class="workflow-radio"
                :class="[item.style === 'checkbox' && 'checkbox-radio']"
                text-color="#2980ff"
                v-track-label="$commonTrackLabel(work + '_' + item.key + '_' + child.value + '_' + item.type)"
              >
                <span class="workflow-radio-label" @click="child.clickHandle">{{ child.label }}</span>
                <span class="tag" v-if="child.tag && limitUser">{{ child.tag }}</span>
              </el-radio>
              <el-radio
                v-else
                v-model="defaultConfig[item.key]"
                :label="child.value"
                class="workflow-radio"
                text-color="#2980ff"
                :class="[item.style === 'checkbox' && 'checkbox-radio']"
                v-track-label="$commonTrackLabel(work + '_' + item.key + '_' + child.value + '_' + item.type)"
              >
                <span class="workflow-radio-label">{{ child.label }}</span>
                <!-- <span class="tag" v-if="child.tag">{{ child.tag }}</span> -->
              </el-radio>
            </div>
          </template>
        </div>
        <div v-if="item.type === 'radio' && item.subType === 'btns'" class="workflow-element2">
          <div v-if="item.group" class="separation"></div>
          <span v-if="item.label" class="element-label">{{ item.label }}</span>
          <div v-if="item.detail" class="separation-detail">{{ item.detail }}</div>
          <div class="workflow-element radio-group">
            <template v-for="(child, i) in item.childs">
              <div v-if="getLinkageResult(child.linkage)" :key="i">
                <el-radio
                  v-if="item.customKey && !item.isOhter"
                  v-model="customParams[item.key]"
                  :label="child.value"
                  class="workflow-radio"
                  text-color="#2980ff"
                  v-track-label="
                    $commonTrackLabel(work + '_' + item.key + '_' + child.value + '_' + item.type)
                  "
                >
                  <span class="workflow-radio-label">{{ child.label }}</span>
                  <!-- <span class="tag" v-if="child.tag">{{ child.tag }}</span> -->
                </el-radio>
                <el-radio
                  v-else-if="item.customKey && item.isOhter"
                  v-model="otherParams[item.key]"
                  :label="child.value"
                  class="workflow-radio"
                  text-color="#2980ff"
                  v-track-label="
                    $commonTrackLabel(work + '_' + item.key + '_' + child.value + '_' + item.type)
                  "
                >
                  <span class="workflow-radio-label">{{ child.label }}</span>
                  <!-- <span class="tag" v-if="child.tag">{{ child.tag }}</span> -->
                </el-radio>
                <el-tooltip
                  v-else-if="item.radioBtn === 'enlarger'"
                  popper-class="scale-tip"
                  effect="dark"
                  :content="$t('workspace.config_9')"
                  placement="top"
                  :disabled="isSubscribe || !child.subscript"
                >
                  <div class="flex">
                    <el-radio
                      @change="changeEnlarge"
                      v-model="defaultConfig[item.key]"
                      :label="child.value"
                      class="workflow-radio"
                      text-color="#2980ff"
                      :disabled="child.subscript && !isSubscribe"
                      v-track-label="
                        $commonTrackLabel(work + '_' + item.key + '_' + child.value + '_' + item.type)
                      "
                    >
                      <span class="workflow-radio-label">{{ child.label }}</span>
                    </el-radio>
                    <div
                      class="mag-l-10"
                      v-if="child.key === 'customize' && defaultConfig[item.key] === 'customize'"
                    >
                      <el-input-number
                        @input.native="changeInputNumber('width')"
                        class="input-number mag-ve-10"
                        :controls="false"
                        size="small"
                        :min="0"
                        :max="imgSize ? imgSize.w * 8 : null"
                        :step="1"
                        ref="width"
                        v-model="defaultConfig['width']"
                        :placeholder="$t('workspace.width')"
                      />
                      x
                      <el-input-number
                        @input.native="changeInputNumber('height')"
                        class="input-number"
                        :controls="false"
                        size="small"
                        :min="0"
                        :max="imgSize ? imgSize.h * 8 : null"
                        :step="1"
                        ref="height"
                        v-model="defaultConfig['height']"
                        :placeholder="$t('workspace.height')"
                      />
                      px
                      <i class="iconfont-single icon-s-info" @click="$emit('showTip')"></i>
                    </div>
                  </div>
                </el-tooltip>
                <el-tooltip
                  v-else-if="item.radioBtn === 'scale'"
                  popper-class="scale-tip"
                  effect="dark"
                  :content="$t('workspace.config_9')"
                  placement="top"
                  :disabled="isSubscribe || !child.subscript"
                >
                  <div class="flex">
                    <el-radio
                      @change="changeScale"
                      v-model="defaultConfig[item.key]"
                      :label="child.value"
                      class="workflow-radio"
                      text-color="#2980ff"
                      :disabled="child.subscript && !isSubscribe"
                      v-track-label="
                        $commonTrackLabel(work + '_' + item.key + '_' + child.value + '_' + item.type)
                      "
                    >
                      <span class="workflow-radio-label">{{ child.label }}</span>
                    </el-radio>
                    <div
                      class="mag-l-10"
                      v-if="child.key === 'customize' && defaultConfig[item.key] === 'customize'"
                    >
                      <el-input-number
                        @input.native="changeInputNumber('width')"
                        class="input-number mag-ve-10"
                        :controls="false"
                        size="small"
                        :min="0"
                        :max="imgSize ? imgSize.w * 8 : null"
                        :step="1"
                        ref="width"
                        v-model="defaultConfig['width']"
                        :placeholder="$t('workspace.width')"
                      />
                      x
                      <el-input-number
                        @input.native="changeInputNumber('height')"
                        class="input-number"
                        :controls="false"
                        size="small"
                        :min="0"
                        :max="imgSize ? imgSize.h * 8 : null"
                        :step="1"
                        ref="height"
                        v-model="defaultConfig['height']"
                        :placeholder="$t('workspace.height')"
                      />
                      px
                      <i class="iconfont-single icon-s-info" @click="$emit('showTip')"></i>
                    </div>
                  </div>
                </el-tooltip>
                <el-tooltip
                  v-else
                  popper-class="scale-tip"
                  effect="dark"
                  :content="$t('workspace.config_9')"
                  placement="top"
                  :disabled="isSubscribe || !child.subscript"
                >
                  <el-radio
                    v-model="defaultConfig[item.key]"
                    :label="child.value"
                    class="workflow-radio"
                    text-color="#2980ff"
                    :disabled="child.subscript && !isSubscribe"
                    v-track-label="
                      $commonTrackLabel(work + '_' + item.key + '_' + child.value + '_' + item.type)
                    "
                  >
                    <span class="workflow-radio-label">{{ child.label }}</span>
                  </el-radio>
                </el-tooltip>
              </div>
            </template>
          </div>
        </div>
        <div v-if="item.type === 'checkbox'" class="workflow-element">
          <div v-if="item.group" class="separation"></div>

          <template v-if="item.customKey && !item.isOhter">
            <div v-if="item.childs">
              <el-checkbox
                class="workflow-checkbox"
                v-for="(child, i) in item.childs"
                v-model="customParams[item.key]"
                :key="i"
                :label="child.value"
                v-track-label="$commonTrackLabel(work + '_' + item.key + '_' + child.value + '_' + item.type)"
              >
                <span class="workflow-checkbox-label">{{ child.label }}</span>
                <!-- <span class="tag" v-if="child.tag">{{ child.tag }}</span> -->
              </el-checkbox>
            </div>
            <el-checkbox v-else v-model="customParams[item.key]" class="workflow-checkbox">
              <span class="workflow-checkbox-label">{{ item.label }}</span>
              <!-- <span class="tag" v-if="item.tag">{{ item.tag }}</span> -->
            </el-checkbox>
          </template>
          <template v-else-if="item.customKey && item.isOhter">
            <div v-if="item.childs">
              <el-checkbox
                class="workflow-checkbox"
                v-for="(child, i) in item.childs"
                v-model="otherParams[item.key]"
                :key="i"
                :label="child.value"
                v-track-label="$commonTrackLabel(work + '_' + item.key + '_' + child.value + '_' + item.type)"
              >
                <span class="workflow-checkbox-label">{{ child.label }}</span>
                <!-- <span class="tag" v-if="child.tag">{{ child.tag }}</span> -->
              </el-checkbox>
            </div>
            <el-checkbox
              v-else
              v-model="otherParams[item.key]"
              class="workflow-checkbox"
              v-track-label="
                $commonTrackLabel(work + '_' + item.key + '_' + otherParams[item.key] + '_' + item.type)
              "
            >
              <span class="workflow-checkbox-label">{{ item.label }}</span>
              <!-- <span class="tag" v-if="item.tag">{{ item.tag }}</span> -->
            </el-checkbox>
          </template>
          <template v-else>
            <div v-if="item.childs">
              <el-checkbox
                class="workflow-checkbox"
                v-for="(child, i) in item.childs"
                v-model="defaultConfig[item.key]"
                :key="i"
                :label="child.value"
                v-track-label="$commonTrackLabel(work + '_' + item.key + '_' + child.value + '_' + item.type)"
              >
                <span class="workflow-checkbox-label">{{ child.label }}</span>
                <!-- <span class="tag" v-if="child.tag">{{ child.tag }}</span> -->
              </el-checkbox>
            </div>
            <el-checkbox
              v-else
              v-model="defaultConfig[item.key]"
              class="workflow-checkbox"
              v-track-label="
                $commonTrackLabel(work + '_' + item.key + '_' + defaultConfig[item.key] + '_' + item.type)
              "
            >
              <span class="workflow-checkbox-label">{{ item.label }}</span>
              <!-- <span class="tag" v-if="item.tag">{{ item.tag }}</span> -->
            </el-checkbox>
          </template>
        </div>
        <div v-if="item.type === 'selectBox' && getLinkageResult(item.linkage)" class="workflow-element">
          <div v-if="item.group" class="separation"></div>
          <div v-if="item.detail" class="separation-detail">{{ item.detail }}</div>
          <el-select
            class="module-select"
            v-model="defaultConfig[item.key]"
            popper-class="work-selection-down"
            v-track-label="
              $commonTrackLabel(work + '_' + item.key + '_' + defaultConfig[item.key] + '_' + item.type)
            "
          >
            <el-option
              v-for="(option, i) in item.childs"
              :key="i"
              :label="option.label"
              :value="option.value"
            />
          </el-select>
        </div>
        <div v-else-if="item.type === 'switch'" class="workflow-element">
          <div v-if="item.group" class="separation"></div>
          <span class="element-switch-label">{{ item.label }}</span>
          <el-switch
            v-model="defaultConfig[item.key]"
            :active-value="item.activeValue"
            :inactive-value="item.inactiveValue"
            v-track-label="
              $commonTrackLabel(work + '_' + item.key + '_' + !defaultConfig[item.key] + '_' + item.type)
            "
          />
        </div>
        <div v-else-if="item.type === 'slider' && getLinkageResult(item.linkage)" class="workflow-element2">
          <div v-if="item.group" class="separation"></div>
          <span class="slider-label">{{ item.label }}</span>
          <div class="workflow-slider">
            <span>{{ item.min || 0 }}</span>
            <el-slider
              label="slider"
              v-model="defaultConfig[item.key]"
              :min="item.min"
              :max="item.max"
              :step="item.step || 1"
              :format-tooltip="item.formatTooltipHandle || null"
              @change="item.changeHandle"
              :disabled="defaultConfig['autoparams']"
              v-track-label="
                $commonTrackLabel(work + '_' + item.key + '_' + defaultConfig[item.key] + '_' + item.type)
              "
            />
            <span>{{ item.maxLabel || item.max || 100 }}</span>
          </div>
        </div>
        <div v-else-if="item.type === 'openSilde'">
          <div class="flex justify-between flex-align-c mag-b-10 f-16">
            <div>{{ $t('workspace.parameters') }}</div>
            <div class="flex flex-align-c" v-if="item.show !== false">
              <div class="mag-r-10">{{ $t('workspace.auto') }}</div>
              <el-switch
                v-model="defaultConfig[item.key]"
                v-track-label="
                  $commonTrackLabel(work + '_' + item.key + '_' + !defaultConfig[item.key] + '_' + item.type)
                "
              />
            </div>
          </div>
        </div>
        <div
          v-else-if="item.type === 'radioSlot' && getLinkageResult(item.linkage)"
          class="workflow-element2"
        >
          <div v-if="item.group" class="separation"></div>
          <div v-for="(child, i) in item.childs" :key="i" class="workflow-radio-slot">
            <div>
              <div v-for="(cc, ii) in child.childs" :key="ii">
                <div class="workflow-element flex-align-c" v-if="cc.type === 'radioBtn'">
                  <p class="mini-title">
                    {{ $t('workspace.photo_type') }}
                  </p>
                  <div class="radio-btns">
                    <div
                      class="radio-btns-item round-btns pointer icons"
                      v-for="(childss, iii) in cc.childs"
                      :class="[
                        { 'is-active': defaultConfig[cc.key] === childss.value },
                        { disabled: defaultConfig[item.key] },
                      ]"
                      :key="iii"
                      @click="radioSelFun(cc.key, childss.value)"
                    >
                      {{ childss.label }}
                    </div>
                  </div>
                </div>
                <div v-if="cc.type === 'slider'" class="workflow-secord-element">
                  <span class="slider-label">{{ cc.label }}</span>
                  <div class="workflow-slider">
                    <span>{{ cc.min || 0 }}</span>
                    <el-slider
                      :disabled="defaultConfig[item.key]"
                      label="slider"
                      v-model="defaultConfig[cc.key]"
                      :min="cc.min"
                      :max="cc.max"
                      :step="cc.step || 1"
                      :format-tooltip="cc.formatTooltipHandle || null"
                      @change="cc.changeHandle"
                      v-track-label="
                        $commonTrackLabel(
                          work + '_' + item.key + '_' + defaultConfig[item.key] + '_' + cc.type
                        )
                      "
                    />
                    <span>{{ cc.maxLabel || cc.max || 100 }}</span>
                  </div>
                </div>
                <div v-else-if="cc.type === 'text'" class="workflow-secord-element workflow-radio-text">
                  {{ cc.value }}
                </div>
                <div v-else-if="cc.type === 'radio' && cc.subType === 'btns'" class="workflow-element2">
                  <span v-if="cc.label" class="element-label">{{ cc.label }}</span>
                  <div class="workflow-element radio-group">
                    <div v-for="(ccc, iii) in cc.childs" :key="iii">
                      <el-radio
                        v-if="cc.customKey && !cc.isOhter"
                        v-model="customParams[cc.key]"
                        :label="ccc.value"
                        class="workflow-radio"
                        text-color="#2980ff"
                        v-track-label="
                          $commonTrackLabel(
                            work + '_' + item.key + '_' + customParams[cc.key] + '_' + item.type
                          )
                        "
                      >
                        <span class="workflow-radio-label">{{ ccc.label }}</span>
                        <!-- <span class="tag" v-if="ccc.tag">{{ ccc.tag }}</span> -->
                      </el-radio>
                      <el-radio
                        v-else-if="cc.customKey && cc.isOhter"
                        v-model="otherParams[cc.key]"
                        :label="ccc.value"
                        class="workflow-radio"
                        text-color="#2980ff"
                        v-track-label="
                          $commonTrackLabel(
                            work + '_' + item.key + '_' + otherParams[cc.key] + '_' + item.type
                          )
                        "
                      >
                        <span class="workflow-radio-label">{{ ccc.label }}</span>
                        <!-- <span class="tag" v-if="ccc.tag">{{ ccc.tag }}</span> -->
                      </el-radio>
                      <el-tooltip
                        v-else
                        popper-class="scale-tip"
                        effect="dark"
                        :content="$t('workspace.config_9')"
                        placement="top"
                        :disabled="isSubscribe || !ccc.subscript"
                      >
                        <el-radio
                          v-model="defaultConfig[cc.key]"
                          :label="ccc.value"
                          class="workflow-radio"
                          text-color="#2980ff"
                          :disabled="ccc.subscript && !isSubscribe"
                          v-track-label="
                            $commonTrackLabel(
                              work + '_' + item.key + '_' + defaultConfig[cc.key] + '_' + item.type
                            )
                          "
                        >
                          <span class="workflow-radio-label">{{ ccc.label }}</span>
                          <!-- <span class="tag" v-if="ccc.tag">{{ ccc.tag }}</span> -->
                        </el-radio>
                      </el-tooltip>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div
          v-else-if="item.type === 'portraitCustomFun' && getLinkageResult(item.linkage)"
          class="workflow-element2"
        >
          <span class="slider-label">{{ item.label }}</span>
          <div class="portrait-options">
            <div
              class="portrait-option"
              v-for="(option, i) in portraitList"
              :key="'portraitList' + i"
              :class="[otherParams.portraitCheckIndex === i && 'portrait-option-active']"
            >
              <i class="iconfont-single icon-s-right"></i>
              <img :src="$imgPath(`/batch/sketch${i + 1}.png`)" @click="onPortraitOptionClick(i)" />
            </div>
          </div>
        </div>
        <div
          v-else-if="item.type === 'noteDetail' && getLinkageResult(item.linkage)"
          class="workflow-element2"
        >
          <span class="quicksand-bold note-title">{{ item.label }}</span>
          <p>{{ item.noteDetail }}</p>
          <span class="slider-label">{{ item.sampleTip }}</span>
          <div class="sample-cont" v-for="(imgItem, Key) in item.imgList" :key="Key">
            <div class="sample-img-cont">
              <img :src="imgItem.url" :alt="imgItem.alt" :width="imgItem.width" :height="imgItem.height" />
            </div>
            <div class="sample-img-cont">
              <img
                :src="imgItem.urlafter"
                :alt="imgItem.alt"
                :width="imgItem.width"
                :height="imgItem.height"
              />
            </div>
          </div>
        </div>
        <div
          v-else-if="item.type === 'note' && getLinkageResult(item.linkage)"
          class="workflow-tip"
          v-show="item.tip"
        >
          <div class="workflow-tip-title">
            <div class="workflow-tip-title-le">
              <i class="iconfont-single icon-s-warn"></i>
              <span>{{ item.tipTitle }}</span>
            </div>
            <div class="workflow-tip-title-ri">
              <i class="el-icon-close" @click="item.tipCloseHandle(work, item)"></i>
            </div>
          </div>
          <div class="workflow-tip-content" v-html="item.tipContent"></div>
        </div>
        <div class="workflow-element flex-align-c" v-else-if="item.type === 'radioBtn'">
          <p class="mini-title">
            {{ $t('workspace.photo_type') }}
          </p>
          <div class="radio-btns">
            <div
              class="radio-btns-item round-btns pointer icons"
              v-for="(child, i) in item.childs"
              :class="[{ 'is-active': defaultConfig[item.key] === child.value }]"
              :key="i"
              @click="defaultConfig[item.key] = child.value"
            >
              {{ child.label }}
            </div>
          </div>
        </div>
        <div v-else-if="item.type === 'text' && getLinkageResult(item.linkage)">
          <div class="workflow-text" v-html="item.text"></div>
        </div>
        <div
          v-else-if="item.type === 'checkModel' && getLinkageResult(item.linkage)"
          class="workflow-element2"
        >
          <p class="quicksand-bold">{{ item.detail }}</p>
          <div class="check-model-tabs">
            <div
              class="check-model-tab"
              :class="defaultConfig[item.key] === childitem.value ? 'check-model-tab-select' : ''"
              v-for="(childitem, key) in item.childs"
              :key="key"
              @click="childitem.clickHandle(item.key, childitem.value)"
              v-track-label="$commonTrackLabel(work + '_' + childitem.value)"
            >
              <span
                :style="{ display: defaultConfig[item.key] === childitem.value ? 'none' : '' }"
                :class="`${childitem.icon}`"
              ></span>
              <span
                :style="{ display: defaultConfig[item.key] === childitem.value ? 'block' : 'none' }"
                :class="[childitem.icon, 'check']"
              ></span>
              <div class="label">{{ childitem.label }}</div>
              <span v-if="childitem.isNew" class="new">New</span>
            </div>
          </div>
        </div>
        <div
          class="face-child-box mag-b-20 mag-t-10"
          v-else-if="item.type === 'faceSwitch' && getLinkageResult(item.linkage)"
        >
          <div class="flex tc">
            <div
              class="flex1 face-child"
              v-for="(childitem, key) in item.childs"
              :class="{
                sel: defaultConfig[item.key] === childitem.value,
                'dis-no': childitem.showTxtBtn === 'prop' ? showTxtBtn : false,
              }"
              :key="key"
              @click="childitem.clickHandle(item.key, childitem.value)"
            >
              <div
                class="flex flex-just-c check-model-tab face-child-tab"
                v-track-label="$commonTrackLabel(work + '_' + childitem.value)"
              >
                <span
                  :style="{ display: defaultConfig[item.key] === childitem.value ? 'none' : '' }"
                  :class="`${childitem.icon}`"
                ></span>
                <span
                  :style="{ display: defaultConfig[item.key] === childitem.value ? 'block' : 'none' }"
                  :class="[childitem.icon, 'check']"
                ></span>
              </div>
              <div class="mag-t-5">{{ childitem.label }}</div>
            </div>
          </div>
        </div>
        <div v-else-if="item.type === 'noMaintainedTip'" class="workflow-element no-wrap">
          <no-maintained-tip :source="item.source" />
        </div>
        <div
          v-else-if="item.type === 'customizeSize' && getLinkageResult(item.linkage)"
          class="workflow-element no-wrap"
        >
          <div @click="item.clickHandle" :class="[{ 'is-active': defaultConfig[item.key] }, 'custom-radio']">
            {{ $t('workspace.edit_crop_5') }}
          </div>
        </div>
      </div>
    </div>
    <div v-else class="no-config">
      <div class="workflow-tip" v-if="work === 'repair' && repairWorkflow">
        <div class="workflow-tip-title">
          <div class="workflow-tip-title-le">
            <i class="iconfont-single icon-s-warn"></i>
            <span>{{ $t('workspace.manual_tip_title') }}</span>
          </div>
          <div class="workflow-tip-title-ri">
            <i class="el-icon-close" @click="closeTip(work, {})"></i>
          </div>
        </div>
        <div class="workflow-tip-content">{{ $t('workspace.repair_note_tip') }}</div>
      </div>
      {{ $t('workspace.workflow_no_configer') }}
    </div>
  </div>
</template>

<script>
  import Work from '@/static/script/work'
  import {
    WorkFlowType,
    WorkFlowConfig,
    _waifuConfig,
    _mattingConfig,
    _paddleMattingConfig,
  } from '@/static/script/workflow_util'
  import NoMaintainedTip from '@/components/NoMaintainedTip.vue'
  import { deepClone } from '@/static/script/utils'

  export default {
    name: 'WorkflowOperations',
    components: { NoMaintainedTip },
    props: {
      module: {
        type: String,
        default: '',
      },
      workIndex: {
        type: [Number, String],
        default: 0,
      },
      work: {
        type: String,
        require: true,
        default: '',
      },
      config: {
        type: [Object, Array],
        default: null,
      },
      isSubscribe: {
        type: Boolean,
        default: true,
      },
      limitUser: {
        type: Boolean,
        default: true,
      },
      configAllLength: {
        type: Number,
        default: 0,
      },
      isEdit: {
        type: Boolean,
        default: false,
      },
      showTxtBtn: {
        type: Boolean,
        default: false,
      },
    },
    inject: { imageSize: { default: null } },
    data() {
      return {
        defaultConfig: {},
        customParams: {
          isBrightness: false,
          isBest: false,
          isRealEsrgan: false,
          isAnimegan: true,
          // isAutoRetoucher: false,
          isCartoon: false,
          convert: false,
          sharpenJob: '3',
        },
        otherParams: {
          portraitCheckIndex: 0,
        },
        fromConfig: {
          portrait_enhancer: [
            {
              type: 'checkModel',
              key: 'model_name',
              detail: this.$t('workspace.workflow_perfect_1'),
              childs: [
                {
                  label: this.$t('workspace.workflow_perfect_6'),
                  value: 'PortraitEnhancer_v1.4',
                  icon: 'iconfont-single icon-s-retouch',
                  clickHandle: this.onCheckSharpen,
                },
                {
                  label: this.$t('workspace.workflow_perfect_7'),
                  value: 'portrait_enhancer',
                  icon: 'iconfont-single icon-s-enhance',
                  clickHandle: this.onCheckSharpen,
                },
              ],
            },
            {
              type: 'text',
              text: this.$t('workspace.workflow_perfect_8'),
              linkage: `this.defaultConfig['model_name'] === 'PortraitEnhancer_v1.4'`,
            },
            {
              type: 'text',
              text: this.$t('workspace.workflow_perfect_9'),
              linkage: `this.defaultConfig['model_name'] === 'PortraitEnhancer_v1.2'`,
            },
          ],
          art_enlarge: [
            {
              type: 'radio',
              subType: 'btns',
              key: 'scale',
              radioBtn: 'scale',
              childs: [
                {
                  label: this.$t('workspace.workflow_enlarge_7'),
                  value: 1,
                  clickHandle: () => {},
                },
                {
                  label: this.$t('workspace.workflow_enlarge_1'),
                  value: 2,
                  subscript: false, //订阅用户可以使用 false为不可用
                  clickHandle: () => {},
                },
                {
                  label: this.$t('workspace.workflow_enlarge_2'),
                  value: 4,
                  subscript: false, //订阅用户可以使用 false为不可用
                  clickHandle: () => {},
                },
                {
                  label: this.$t('workspace.workflow_enlarge_4'),
                  value: 8,
                  subscript: false, //订阅用户可以使用 false为不可用
                  clickHandle: () => {},
                },
                {
                  label: this.$t('workspace.edit_crop_5'),
                  value: 'customize',
                  subscript: false, //订阅用户可以使用 false为不可用
                  linkage: `this.showCustomize`,
                  type: 'customizeSize',
                  key: 'customize',
                  clickHandle: () => {},
                },
              ],
            },
          ],
          chainner_txt: [
            {
              type: 'radio',
              subType: 'btns',
              key: 'scale',
              radioBtn: 'scale',
              childs: [
                {
                  label: this.$t('workspace.workflow_enlarge_7'),
                  value: 1,
                  clickHandle: () => {},
                },
                {
                  label: this.$t('workspace.workflow_enlarge_1'),
                  value: 2,
                  subscript: false, //订阅用户可以使用 false为不可用
                  clickHandle: () => {},
                },
                {
                  label: this.$t('workspace.workflow_enlarge_2'),
                  value: 4,
                  subscript: false, //订阅用户可以使用 false为不可用
                  clickHandle: () => {},
                },
                {
                  label: this.$t('workspace.workflow_enlarge_4'),
                  value: 8,
                  subscript: false, //订阅用户可以使用 false为不可用
                  clickHandle: () => {},
                },
                {
                  label: this.$t('workspace.edit_crop_5'),
                  value: 'customize',
                  subscript: false, //订阅用户可以使用 false为不可用
                  linkage: `this.showCustomize`,
                  type: 'customizeSize',
                  key: 'customize',
                  clickHandle: () => {},
                },
              ],
            },
          ],
          [WorkFlowType.chainner]: [
            {
              type: 'radio',
              subType: 'btns',
              key: 'scale',
              radioBtn: 'scale',
              childs: [
                {
                  label: this.$t('workspace.workflow_enlarge_7'),
                  value: 1,
                  clickHandle: () => {},
                },
                {
                  label: this.$t('workspace.workflow_enlarge_1'),
                  value: 2,
                  subscript: false, //订阅用户可以使用 false为不可用
                  clickHandle: () => {},
                },
                {
                  label: this.$t('workspace.workflow_enlarge_2'),
                  value: 4,
                  subscript: false, //订阅用户可以使用 false为不可用
                  clickHandle: () => {},
                },
                {
                  label: this.$t('workspace.workflow_enlarge_4'),
                  value: 8,
                  subscript: false, //订阅用户可以使用 false为不可用
                  clickHandle: () => {},
                },
                {
                  label: this.$t('workspace.edit_crop_5'),
                  value: 'customize',
                  subscript: false, //订阅用户可以使用 false为不可用
                  linkage: `this.showCustomize`,
                  type: 'customizeSize',
                  key: 'customize',
                  clickHandle: () => {},
                },
              ],
            },
          ],
          text_enlarge: [
            {
              type: 'radio',
              subType: 'btns',
              key: 'scale',
              childs: [
                {
                  label: this.$t('workspace.workflow_enlarge_7'),
                  value: 1,
                  clickHandle: () => {},
                },
                {
                  label: this.$t('workspace.workflow_enlarge_1'),
                  value: 2,
                  subscript: false, //订阅用户可以使用 false为不可用
                  clickHandle: () => {},
                },
                {
                  label: this.$t('workspace.workflow_enlarge_2'),
                  value: 4,
                  subscript: false, //订阅用户可以使用 false为不可用
                  clickHandle: () => {},
                },
                {
                  label: this.$t('workspace.workflow_enlarge_4'),
                  value: 8,
                  subscript: false, //订阅用户可以使用 false为不可用
                  clickHandle: () => {},
                },
              ],
            },
          ],
          [WorkFlowType.enlarge]: [
            {
              type: 'radio',
              subType: 'btns',
              model_name: 'enlarger',
              key: 'scale',
              radioBtn: 'enlarger',
              childs: [
                {
                  label: this.$t('workspace.workflow_enlarge_7'),
                  value: 1,
                  clickHandle: () => {},
                },
                {
                  label: this.$t('workspace.workflow_enlarge_1'),
                  value: 2,
                  subscript: false, //订阅用户可以使用 false为不可用
                  clickHandle: () => {},
                },
                {
                  label: this.$t('workspace.workflow_enlarge_2'),
                  value: 4,
                  subscript: false, //订阅用户可以使用 false为不可用
                  clickHandle: () => {},
                },
                {
                  label: this.$t('workspace.workflow_enlarge_4'),
                  value: 8,
                  subscript: false, //订阅用户可以使用 false为不可用
                  clickHandle: () => {},
                },
                {
                  label: this.$t('workspace.edit_crop_5'),
                  value: 'customize',
                  subscript: false, //订阅用户可以使用 false为不可用
                  linkage: `this.showCustomize`,
                  type: 'customizeSize',
                  key: 'customize',
                  clickHandle: () => {},
                },
              ],
            },
            {
              type: 'openSilde',
              key: 'autoparams',
            },
            {
              type: 'radioSlot',
              key: 'autoparams',
              linkage: `this.defaultConfig['model_name'] !== 'RealEnhancerStable'`,
              childs: [
                {
                  value: true,
                  label: this.$t('workspace.auto_params'),
                },
                {
                  value: false,
                  label: this.$t('workspace.manual_params'),
                  tip: !this.$getCookie('cloud_enlarge_manual_close'),
                  tipTitle: this.$t('workspace.manual_tip_title'),
                  tipContent: this.$t('workspace.manual_tip_content'),
                  tipCloseHandle: this.closeTip,
                  childs: [
                    {
                      type: 'slider',
                      label: this.$t('workspace.workflow_enlarge_5'),
                      key: 'suppress_noise',
                      min: 0,
                      max: 100,
                      changeHandle: () => {},
                      // activeValue: 26,
                      // inactiveValue: 0,
                    },
                    {
                      type: 'slider',
                      label: this.$t('workspace.workflow_enlarge_6'),
                      key: 'remove_blur',
                      min: 0,
                      max: 100,
                      changeHandle: () => {},
                      // activeValue: 26,
                      // inactiveValue: 0,
                    },
                  ],
                },
              ],
            },
          ],
          enlarge2: [
            {
              type: 'radio',
              subType: 'btns',
              model_name: 'enlarger',
              key: 'scale',
              radioBtn: 'enlarger',
              childs: [
                {
                  label: this.$t('workspace.workflow_enlarge_7'),
                  value: 1,
                  clickHandle: () => {},
                },
                {
                  label: this.$t('workspace.workflow_enlarge_1'),
                  value: 2,
                  subscript: false, //订阅用户可以使用 false为不可用
                  clickHandle: () => {},
                },
                {
                  label: this.$t('workspace.workflow_enlarge_2'),
                  value: 4,
                  subscript: false, //订阅用户可以使用 false为不可用
                  clickHandle: () => {},
                },
                {
                  label: this.$t('workspace.workflow_enlarge_4'),
                  value: 8,
                  subscript: false, //订阅用户可以使用 false为不可用
                  clickHandle: () => {},
                },
                {
                  label: this.$t('workspace.edit_crop_5'),
                  value: 'customize',
                  subscript: false, //订阅用户可以使用 false为不可用
                  linkage: `this.showCustomize`,
                  type: 'customizeSize',
                  key: 'customize',
                  clickHandle: () => {},
                },
              ],
            },
            {
              type: 'openSilde',
              key: 'autoparams',
            },
            {
              type: 'radioSlot',
              key: 'autoparams',
              linkage: `this.defaultConfig['model_name'] !== 'RealEnhancerStable'`,
              childs: [
                {
                  value: true,
                  label: this.$t('workspace.auto_params'),
                },
                {
                  value: false,
                  label: this.$t('workspace.manual_params'),
                  tip: !this.$getCookie('cloud_enlarge_manual_close'),
                  tipTitle: this.$t('workspace.manual_tip_title'),
                  tipContent: this.$t('workspace.manual_tip_content'),
                  tipCloseHandle: this.closeTip,
                  childs: [
                    {
                      type: 'slider',
                      label: this.$t('workspace.workflow_enlarge_5'),
                      key: 'suppress_noise',
                      min: 0,
                      max: 100,
                      changeHandle: () => {},
                      // activeValue: 26,
                      // inactiveValue: 0,
                    },
                    {
                      type: 'slider',
                      label: this.$t('workspace.workflow_enlarge_6'),
                      key: 'remove_blur',
                      min: 0,
                      max: 100,
                      changeHandle: () => {},
                      // activeValue: 26,
                      // inactiveValue: 0,
                    },
                  ],
                },
              ],
            },
          ],
          [WorkFlowType.enlarge3]: [
            {
              type: 'openSilde',
              key: 'autoparams',
            },
            {
              type: 'radioSlot',
              key: 'autoparams',
              linkage: `this.defaultConfig['model_name'] !== 'RealEnhancerStable'`,
              childs: [
                {
                  value: true,
                  label: this.$t('workspace.auto_params'),
                },
                {
                  value: false,
                  label: this.$t('workspace.manual_params'),
                  tip: !this.$getCookie('cloud_enlarge_manual_close'),
                  tipTitle: this.$t('workspace.manual_tip_title'),
                  tipContent: this.$t('workspace.manual_tip_content'),
                  tipCloseHandle: this.closeTip,
                  childs: [
                    {
                      type: 'slider',
                      label: this.$t('workspace.workflow_enlarge_5'),
                      key: 'suppress_noise',
                      min: 0,
                      max: 100,
                      changeHandle: () => {},
                      // activeValue: 26,
                      // inactiveValue: 0,
                    },
                    {
                      type: 'slider',
                      label: this.$t('workspace.workflow_enlarge_6'),
                      key: 'remove_blur',
                      min: 0,
                      max: 100,
                      changeHandle: () => {},
                      // activeValue: 26,
                      // inactiveValue: 0,
                    },
                  ],
                },
              ],
            },
          ],
          denoise: [
            {
              type: 'openSilde',
              key: 'autoparams',
            },
            {
              type: 'radioSlot',
              key: 'autoparams',
              childs: [
                {
                  value: true,
                  label: this.$t('workspace.auto_params'),
                },
                {
                  value: false,
                  label: this.$t('workspace.manual_params'),
                  tip: !this.$getCookie('cloud_denoise_manual_close'),
                  tipTitle: this.$t('workspace.manual_tip_title'),
                  tipContent: this.$t('workspace.manual_tip_content'),
                  tipCloseHandle: this.closeTip,
                  childs: [
                    {
                      type: 'slider',
                      label: this.$t('workspace.workflow_denoise_1'),
                      key: 'remove_noise',
                      min: 0,
                      max: 100,
                      changeHandle: () => {},
                    },
                    {
                      type: 'slider',
                      label: this.$t('workspace.workflow_denoise_2'),
                      key: 'sharpen',
                      min: 0,
                      max: 100,
                      changeHandle: () => {},
                    },
                  ],
                },
              ],
            },
          ],
          onlySharpen: [
            {
              type: 'radioSlot',
              key: 'autoparams',
              linkage: `this.defaultConfig['model_name'] === 'SharpenStable'`,
              childs: [
                {
                  value: true,
                  label: this.$t('workspace.auto_params'),
                },
                {
                  value: false,
                  label: this.$t('workspace.manual_params'),
                  tip: !this.$getCookie('cloud_sharpen_manual_close'),
                  tipTitle: this.$t('workspace.manual_tip_title'),
                  tipContent: this.$t('workspace.manual_tip_content'),
                  tipCloseHandle: this.closeTip,
                  childs: [
                    {
                      type: 'slider',
                      label: this.$t('workspace.workflow_sharpen_3'),
                      key: 'sharpness',
                      min: 0,
                      max: 100,
                      changeHandle: () => {},
                    },
                    {
                      type: 'slider',
                      label: this.$t('workspace.workflow_sharpen_5'),
                      key: 'suppress_noise',
                      min: 0,
                      max: 100,
                      changeHandle: () => {},
                    },
                  ],
                },
              ],
            },
          ],
          onlyPortrait: [
            {
              type: 'radioSlot',
              key: 'autoparams',
              linkage: `this.defaultConfig['model_name'] === 'SharpenStable'`,
              childs: [
                {
                  value: true,
                  label: this.$t('workspace.auto_params'),
                },
                {
                  value: false,
                  label: this.$t('workspace.manual_params'),
                  tip: !this.$getCookie('cloud_sharpen_manual_close'),
                  tipTitle: this.$t('workspace.manual_tip_title'),
                  tipContent: this.$t('workspace.manual_tip_content'),
                  tipCloseHandle: this.closeTip,
                  childs: [
                    {
                      type: 'slider',
                      label: this.$t('workspace.workflow_sharpen_3'),
                      key: 'sharpness',
                      min: 0,
                      max: 100,
                      changeHandle: () => {},
                    },
                    {
                      type: 'slider',
                      label: this.$t('workspace.workflow_sharpen_5'),
                      key: 'suppress_noise',
                      min: 0,
                      max: 100,
                      changeHandle: () => {},
                    },
                  ],
                },
              ],
            },
          ],
          [WorkFlowType.sharpen3]: [
            {
              type: 'openSilde',
              key: 'autoparams',
            },
            {
              type: 'radioSlot',
              key: 'autoparams',
              childs: [
                {
                  value: true,
                  label: this.$t('workspace.auto_params'),
                },
                {
                  value: false,
                  label: this.$t('workspace.manual_params'),
                  tip: !this.$getCookie('cloud_sharpen_manual_close'),
                  tipTitle: this.$t('workspace.manual_tip_title'),
                  tipContent: this.$t('workspace.manual_tip_content'),
                  tipCloseHandle: this.closeTip,
                  childs: [
                    {
                      type: 'slider',
                      label: this.$t('workspace.workflow_sharpen_3'),
                      key: 'remove_blur',
                      min: 0,
                      max: 1,
                      maxLabel: 100,
                      step: 0.01,
                      formatTooltipHandle: this.hundredfold,
                      changeHandle: () => {},
                    },
                    {
                      type: 'slider',
                      label: this.$t('workspace.workflow_sharpen_5'),
                      key: 'suppress_noise',
                      min: 0,
                      max: 1,
                      maxLabel: 100,
                      step: 0.01,
                      formatTooltipHandle: this.hundredfold,
                      changeHandle: () => {},
                    },
                  ],
                },
              ],
            },
          ],
          sharpen: [
            {
              type: 'openSilde',
              key: 'autoparams',
              show: `this.defaultConfig['model_name'] === 'SharpenGeneralStable'`,
            },
            {
              type: 'noteDetail',
              label: this.$t('workspace.workflow_sharpen_model_sharpen_note'),
              linkage: `this.defaultConfig['model_name'] === 'HinetRealblurStable'`,
              noteDetail: this.$t('workspace.workflow_sharpen_7'),
              imgList: [],
            },
            {
              type: 'noteDetail',
              label: this.$t('workspace.workflow_sharpen_model_motionblur_note'),
              linkage: `this.defaultConfig['model_name'] === 'DebouncingStable'`,
              noteDetail: this.$t('workspace.workflow_sharpen_model_motionblur_note_tip'),
              imgList: [],
            },
            {
              type: 'faceSwitch',
              linkage: `this.defaultConfig['model_name'] === 'SharpenStable'||this.defaultConfig['model_name'] === 'models-cunet'`,
              key: 'auto_mode',
              childs: [
                {
                  label: this.$t('workspace.portrait'),
                  value: true,
                  icon: 'iconfont-single icon-s-retouch',
                  clickHandle: this.onCheckSharpen,
                },
                {
                  label: this.$t('workspace.general'),
                  value: false,
                  icon: 'iconfont-single icon-s-general',
                  clickHandle: this.onCheckSharpen,
                },
                {
                  label: this.$t('workspace.workflow_real_esrgan'),
                  value: '2',
                  icon: 'text',
                  clickHandle: this.onCheckSharpen,
                  showTxtBtn: 'prop',
                },
              ],
            },
            {
              type: 'radioSlot',
              key: 'autoparams',
              linkage: `this.defaultConfig['model_name'] === 'SharpenStable'`,
              childs: [
                {
                  value: true,
                  label: this.$t('workspace.auto_params'),
                },
                {
                  value: false,
                  label: this.$t('workspace.manual_params'),
                  tip: !this.$getCookie('cloud_sharpen_manual_close'),
                  tipTitle: this.$t('workspace.manual_tip_title'),
                  tipContent: this.$t('workspace.manual_tip_content'),
                  tipCloseHandle: this.closeTip,
                  childs: [
                    {
                      type: 'slider',
                      label: this.$t('workspace.workflow_sharpen_3'),
                      key: 'sharpness',
                      min: 0,
                      max: 100,
                      changeHandle: () => {},
                    },
                    {
                      type: 'slider',
                      label: this.$t('workspace.workflow_sharpen_5'),
                      key: 'suppress_noise',
                      min: 0,
                      max: 100,
                      changeHandle: () => {},
                    },
                  ],
                },
              ],
            },
            {
              type: 'radioSlot',
              key: 'autoparams',
              linkage: `this.defaultConfig['model_name'] === 'SharpenGeneralStable'`,
              childs: [
                {
                  value: true,
                  label: this.$t('workspace.auto_params'),
                },
                {
                  value: false,
                  label: this.$t('workspace.manual_params'),
                  tip: !this.$getCookie('cloud_sharpen_manual_close'),
                  tipTitle: this.$t('workspace.manual_tip_title'),
                  tipContent: this.$t('workspace.manual_tip_content'),
                  tipCloseHandle: this.closeTip,
                  childs: [
                    {
                      type: 'slider',
                      label: this.$t('workspace.workflow_sharpen_3'),
                      key: 'remove_blur',
                      min: 0,
                      max: 1,
                      step: 0.01,
                      formatTooltipHandle: this.hundredfold,
                      changeHandle: () => {},
                    },
                    {
                      type: 'slider',
                      label: this.$t('workspace.workflow_sharpen_5'),
                      key: 'suppress_noise',
                      min: 0,
                      max: 1,
                      step: 0.01,
                      formatTooltipHandle: this.hundredfold,
                      changeHandle: () => {},
                    },
                  ],
                },
              ],
            },
            {
              type: 'slider',
              label: this.$t('workspace.workflow_sharpen_model_motionblur_1'),
              linkage: `this.defaultConfig['model_name'] === 'DebouncingStable'`,
              key: 'sharpness',
              min: 0,
              max: 100,
              changeHandle: () => {},
            },
            {
              type: 'slider',
              label: this.$t('workspace.workflow_sharpen_model_motionblur_2'),
              linkage: `this.defaultConfig['model_name'] === 'DebouncingStable'`,
              key: 'suppress_noise',
              min: 0,
              max: 100,
              changeHandle: () => {},
            },
            {
              type: 'text',
              text: this.$t('workspace.workflow_real_esrgan_note'),
              linkage: `this.defaultConfig['model_name'] === 'models-cunet'`,
            },
          ],
          [WorkFlowType.sharpen2_general]: [
            {
              type: 'openSilde',
              key: 'autoparams',
              show: false,
            },
            {
              type: 'radioSlot',
              key: 'autoparams',
              linkage: `this.defaultConfig['model_name'] !== 'RealEnhancerStable'`,
              childs: [
                {
                  value: true,
                  label: this.$t('workspace.auto_params'),
                },
                {
                  value: false,
                  label: this.$t('workspace.manual_params'),
                  tip: !this.$getCookie('cloud_enlarge_manual_close'),
                  tipTitle: this.$t('workspace.manual_tip_title'),
                  tipContent: this.$t('workspace.manual_tip_content'),
                  tipCloseHandle: this.closeTip,
                  childs: [
                    {
                      type: 'radioBtn',
                      label: this.$t('workspace.parameters'),
                      key: 'blur_type',
                      childs: [
                        {
                          label: this.$t('workspace.static'),
                          value: 0,
                          clickHandle: this.onCheckMatting,
                        },
                        {
                          label: this.$t('workspace.dynamic'),
                          value: 1,
                          clickHandle: this.onCheckMatting,
                        },
                      ],
                    },
                  ],
                },
              ],
            },
            {
              type: 'slider',
              label: this.$t('workspace.workflow_denoise_2'),
              key: 'remove_blur',
              min: 0,
              max: 1,
              step: 0.01,
              formatTooltipHandle: this.hundredfold,
              changeHandle: () => {},
            },
            {
              type: 'slider',
              label: this.$t('workspace.workflow_sharpen_5'),
              key: 'suppress_noise',
              min: 0,
              max: 1,
              step: 0.01,
              formatTooltipHandle: this.hundredfold,
              changeHandle: () => {},
            },
            {
              type: 'slider',
              label: this.$t('workspace.remove_jpeg_artifacts'),
              key: 'remove_artifacts',
              min: 0,
              max: 1,
              step: 0.01,
              formatTooltipHandle: this.hundredfold,
              changeHandle: () => {},
            },
          ],
          [WorkFlowType.sharpen2_motion_blur]: [
            {
              type: 'openSilde',
              key: 'autoparams',
              show: false,
            },
            {
              type: 'slider',
              label: this.$t('workspace.workflow_denoise_2'),
              key: 'remove_blur',
              min: 0,
              max: 1,
              maxLabel: 100,
              step: 0.01,
              formatTooltipHandle: this.hundredfold,
              changeHandle: () => {},
            },
            {
              type: 'slider',
              label: this.$t('workspace.workflow_sharpen_5'),
              key: 'suppress_noise',
              min: 0,
              max: 1,
              maxLabel: 100,
              step: 0.01,
              formatTooltipHandle: this.hundredfold,
              changeHandle: () => {},
            },
          ],
          [WorkFlowType.sharpen2_lens_blur]: [
            {
              type: 'openSilde',
              key: 'autoparams',
              show: false,
            },
            {
              type: 'slider',
              label: this.$t('workspace.workflow_denoise_2'),
              key: 'remove_blur',
              min: 0,
              max: 1,
              maxLabel: 100,
              step: 0.01,
              formatTooltipHandle: this.hundredfold,
              changeHandle: () => {},
            },
            {
              type: 'slider',
              label: this.$t('workspace.workflow_sharpen_5'),
              key: 'suppress_noise',
              min: 0,
              max: 1,
              maxLabel: 100,
              step: 0.01,
              formatTooltipHandle: this.hundredfold,
              changeHandle: () => {},
            },
          ],
          [WorkFlowType.sharpen2_sort_normal]: [
            {
              type: 'openSilde',
              key: 'autoparams',
              show: false,
            },
            {
              type: 'slider',
              label: this.$t('workspace.workflow_denoise_2'),
              key: 'remove_blur',
              min: 0,
              max: 1,
              maxLabel: 100,
              step: 0.01,
              formatTooltipHandle: this.hundredfold,
              changeHandle: () => {},
            },
            {
              type: 'slider',
              label: this.$t('workspace.workflow_sharpen_5'),
              key: 'suppress_noise',
              min: 0,
              max: 1,
              maxLabel: 100,
              step: 0.01,
              formatTooltipHandle: this.hundredfold,
              changeHandle: () => {},
            },
          ],
          matting: [
            {
              type: 'faceSwitch',
              linkage: `this.defaultConfig['model_name']==='MattingStable'||this.defaultConfig['model_name']==='Mattingstable'`,
              key: 'web_auto_mode',
              childs: [
                {
                  label: this.$t('workspace.portrait'),
                  value: true,
                  icon: 'iconfont-single icon-s-retouch',
                  clickHandle: this.onCheckMatting,
                },
                {
                  label: this.$t('workspace.object'),
                  value: false,
                  icon: 'iconfont-single icon-s-general',
                  clickHandle: this.onCheckMatting,
                },
              ],
            },
          ],
          onlyMatting: null,
          pd_matting: null,
          colorize: [
            {
              type: 'radioSlot',
              key: 'autoparams',
              childs: [
                {
                  value: false,
                  childs: [
                    {
                      type: 'slider',
                      label: this.$t('workspace.render_factor'),
                      key: 'render_factor',
                      min: 10,
                      max: 70,
                      step: 10,
                      changeHandle: () => {},
                    },
                  ],
                },
              ],
            },
          ],
          [WorkFlowType.animegan]: [
            {
              type: 'noteDetail',
              label: this.$t('workspace.workflow_sketch_anime_notetitle'),
              noteDetail: this.$t('workspace.workflow_sketch_anime_note'),
              sampleTip: this.$t('workspace.workflow_sketch_anime_sample'),
              imgList: [
                {
                  url: this.$imgPath(`/batch/sample_1.png`),
                  urlafter: this.$imgPath(`/batch/sample_1_after.png`),
                  width: 149,
                  height: 130,
                  alt: 'sample',
                },
                {
                  url: this.$imgPath(`/batch/sample_2.png`),
                  urlafter: this.$imgPath(`/batch/sample_2_after.png`),
                  width: 149,
                  height: 130,
                  alt: 'sample',
                },
                {
                  url: this.$imgPath(`/batch/sample_3.png`),
                  urlafter: this.$imgPath(`/batch/sample_3_after.png`),
                  width: 149,
                  height: 130,
                  alt: 'sample',
                },
              ],
            },
          ],
          [WorkFlowType.animegan2c]: [
            {
              type: 'noteDetail',
              label: this.$t('workspace.workflow_sketch_anime_notetitle'),
              noteDetail: this.$t('workspace.workflow_sketch_anime_note'),
              sampleTip: this.$t('workspace.workflow_sketch_anime_sample'),
              imgList: [
                {
                  url: this.$imgPath(`/common/full_cartoon_before.png`),
                  urlafter: this.$imgPath(`/common/full_cartoon_after.png`),
                  width: 149,
                  height: 130,
                  alt: 'sample',
                },
              ],
            },
          ],
          [WorkFlowType.animegan]: [
            {
              type: 'noteDetail',
              label: this.$t('workspace.workflow_sketch_anime_notetitle'),
              linkage: `this.config['module'] !== 'animegan2c' && this.defaultConfig['model_name'] === 'Animegan2Stable'`,
              noteDetail: this.$t('workspace.workflow_sketch_anime_note'),
              sampleTip: this.$t('workspace.workflow_sketch_anime_sample'),
              imgList: [
                {
                  url: this.$imgPath(`/batch/sample_1.png`),
                  urlafter: this.$imgPath(`/batch/sample_1_after.png`),
                  width: 149,
                  height: 130,
                  alt: 'sample',
                },
                {
                  url: this.$imgPath(`/batch/sample_2.png`),
                  urlafter: this.$imgPath(`/batch/sample_2_after.png`),
                  width: 149,
                  height: 130,
                  alt: 'sample',
                },
                {
                  url: this.$imgPath(`/batch/sample_3.png`),
                  urlafter: this.$imgPath(`/batch/sample_3_after.png`),
                  width: 149,
                  height: 130,
                  alt: 'sample',
                },
              ],
            },
          ],
          cartoonize: [
            // {
            //   type: 'selectBox',
            //   key: 'model_name',
            //   detail: this.$t('workspace.workflow_sketch_select'),
            //   // linkage: `this.defaultConfig['model_name'] === 'Animegan2Stable'`,
            //   childs: [
            //     {
            //       label: this.$t('common.upload_34'),
            //       value: 'CartoonizeStable',
            //       clickHandle: () => {},
            //     },
            //     {
            //       label: this.$t('workspace.workflow_sketch_option_2'),
            //       value: 'Animegan2Stable',
            //       clickHandle: () => {},
            //     },
            //   ],
            // },
            {
              type: 'noteDetail',
              label: this.$t('workspace.workflow_sketch_anime_notetitle'),
              linkage: `this.config['module'] === 'animegan2c'`,
              noteDetail: this.$t('workspace.workflow_sketch_anime_note'),
              sampleTip: this.$t('workspace.workflow_sketch_anime_sample'),
              imgList: [
                {
                  url: this.$imgPath(`/common/full_cartoon_before.png`),
                  urlafter: this.$imgPath(`/common/full_cartoon_after.png`),
                  width: 149,
                  height: 130,
                  alt: 'sample',
                },
              ],
            },
            {
              type: 'noteDetail',
              label: this.$t('workspace.workflow_sketch_anime_notetitle'),
              linkage: `this.config['module'] !== 'animegan2c' && this.defaultConfig['model_name'] === 'Animegan2Stable'`,
              noteDetail: this.$t('workspace.workflow_sketch_anime_note'),
              sampleTip: this.$t('workspace.workflow_sketch_anime_sample'),
              imgList: [
                {
                  url: this.$imgPath(`/batch/sample_1.png`),
                  urlafter: this.$imgPath(`/batch/sample_1_after.png`),
                  width: 149,
                  height: 130,
                  alt: 'sample',
                },
                {
                  url: this.$imgPath(`/batch/sample_2.png`),
                  urlafter: this.$imgPath(`/batch/sample_2_after.png`),
                  width: 149,
                  height: 130,
                  alt: 'sample',
                },
                {
                  url: this.$imgPath(`/batch/sample_3.png`),
                  urlafter: this.$imgPath(`/batch/sample_3_after.png`),
                  width: 149,
                  height: 130,
                  alt: 'sample',
                },
              ],
            },
            {
              type: 'noteDetail',
              label: this.$t('workspace.workflow_sketch_anime_notetitle'),
              linkage: `this.defaultConfig['model_name'] === 'CartoonizeStable'`,
              noteDetail: this.$t('workspace.workflow_cartoonize_stable_note'),
              sampleTip: '',
            },
          ],
          portrait: [
            {
              type: 'radio',
              key: 'single_face',
              childs: [
                {
                  label: this.$t('workspace.workflow_portrait_1'),
                  value: false,
                  clickHandle: () => {},
                },
                {
                  label: this.$t('workspace.workflow_portrait_2'),
                  value: true,
                  clickHandle: () => {},
                },
              ],
            },
            {
              group: true,
              type: 'slider',
              label: this.$t('workspace.workflow_portrait_3'),
              key: 'sigma',
              min: 0,
              max: 100,
              changeHandle: this.portraitChangeHandle,
            },
            {
              type: 'slider',
              label: this.$t('workspace.workflow_portrait_4'),
              key: 'alpha',
              min: 0,
              max: 1,
              step: 0.01,
              formatTooltipHandle: this.hundredfold,
              changeHandle: this.portraitChangeHandle,
            },
            {
              type: 'portraitCustomFun',
              label: this.$t('workspace.workflow_portrait_5'),
              customKey: true,
              isOther: true,
              key: 'portraitCheckIndex',
            },
          ],
          sketch: [
            // {
            //   type: 'selectBox',
            //   key: 'model_name',
            //   detail: this.$t('workspace.workflow_sketch_select'),
            //   // linkage: `this.defaultConfig['model_name'] === 'Animegan2Stable'`,
            //   childs: [
            //     {
            //       label: this.$t('workspace.workflow_sketch_option_1'),
            //       value: 'SketchStable',
            //       clickHandle: () => {},
            //     },
            //     {
            //       label: this.$t('workspace.sketch_model'),
            //       value: 'Animegan2Stable',
            //       clickHandle: () => {},
            //     },
            //   ],
            // },
            {
              type: 'faceSwitch',
              linkage: `this.defaultConfig['model_name'] === 'SketchStable'`,
              key: 'auto_mode',
              childs: [
                {
                  label: this.$t('workspace.portrait'),
                  value: true,
                  icon: 'iconfont-single icon-s-retouch',
                  clickHandle: (key, value) => {
                    this.$set(this.defaultConfig, key, value)
                  },
                },
                {
                  label: this.$t('workspace.general'),
                  value: false,
                  icon: 'iconfont-single icon-s-general',
                  clickHandle: (key, value) => {
                    this.$set(this.defaultConfig, key, value)
                  },
                  // clickHandle: this.onCheckSharpen,
                },
              ],
            },
            {
              type: 'slider',
              label: this.$t('workspace.workflow_portrait_3'),
              linkage: `this.defaultConfig['model_name'] === 'SketchStable'`,
              key: 'sigma',
              min: 0,
              max: 100,
              changeHandle: this.portraitChangeHandle,
            },
            {
              type: 'slider',
              label: this.$t('workspace.workflow_portrait_4'),
              linkage: `this.defaultConfig['model_name'] === 'SketchStable'`,
              key: 'alpha',
              min: 0,
              max: 1,
              step: 0.01,
              formatTooltipHandle: this.hundredfold,
              changeHandle: this.portraitChangeHandle,
            },
            {
              type: 'portraitCustomFun',
              linkage: `this.defaultConfig['model_name'] === 'SketchStable'`,
              label: this.$t('workspace.workflow_portrait_5'),
              customKey: true,
              isOther: true,
              key: 'portraitCheckIndex',
            },
            {
              group: true,
              type: 'radio',
              linkage: `this.defaultConfig['model_name'] === 'SketchStable'`,
              key: 'single_face',
              value: true,
              childs: [
                {
                  label: this.$t('workspace.workflow_portrait_1'),
                  value: false,
                  clickHandle: () => {},
                },
                {
                  label: this.$t('workspace.workflow_portrait_2'),
                  value: true,
                  clickHandle: () => {},
                },
              ],
            },
            // {
            //   type: 'noteDetail',
            //   label: this.$t('workspace.workflow_sketch_anime_notetitle'),
            //   linkage: `this.defaultConfig['model_name'] === 'Animegan2Stable'`,
            //   noteDetail: this.$t('workspace.workflow_sketch_anime_note'),
            //   sampleTip: this.$t('workspace.workflow_sketch_anime_sample'),
            //   imgList: [
            //     {
            //       url: this.$imgPath(`/batch/sample_1.png`),
            //       urlafter: this.$imgPath(`/batch/sample_1_after.png`),
            //       width: 149,
            //       height: 130,
            //       alt: 'sample',
            //     },
            //     {
            //       url: this.$imgPath(`/batch/sample_2.png`),
            //       urlafter: this.$imgPath(`/batch/sample_2_after.png`),
            //       width: 149,
            //       height: 130,
            //       alt: 'sample',
            //     },
            //     {
            //       url: this.$imgPath(`/batch/sample_3.png`),
            //       urlafter: this.$imgPath(`/batch/sample_3_after.png`),
            //       width: 149,
            //       height: 130,
            //       alt: 'sample',
            //     },
            //   ],
            // },
          ],
          waifu: [
            {
              type: 'selectBox',
              key: 'model_name',
              detail: this.$t('workspace.workflow_waifu_1'),
              value: 'RealEsrganStable',
              childs: [
                {
                  label: this.$t('workspace.workflow_waifu_3'),
                  value: 'models-cunet',
                  clickHandle: () => {},
                },
                {
                  label: this.$t('workspace.workflow_waifu_4'),
                  value: 'models-upconv_7_anime_style_art_rgb',
                  clickHandle: () => {},
                },
                {
                  label: this.$t('workspace.workflow_waifu_9'),
                  value: 'RealEsrganStable',
                  clickHandle: () => {},
                },
              ],
            },
            {
              type: 'radio',
              subType: 'btns',
              key: 'scale',
              sdfs: true,
              detail: this.$t('workspace.workflow_waifu_2'),
              childs: [
                {
                  label: this.$t('workspace.workflow_waifu_a'),
                  value: 2,
                  clickHandle: () => {},
                },
                {
                  label: this.$t('workspace.workflow_waifu_b'),
                  value: 4,
                  subscript: false,
                  clickHandle: () => {},
                },
                {
                  label: this.$t('workspace.workflow_waifu_11'),
                  value: 6,
                  linkage: `this.defaultConfig['model_name'] === 'RealEsrganStable'`,
                  subscript: false,
                  clickHandle: () => {},
                },
                {
                  label: this.$t('workspace.workflow_waifu_c'),
                  value: 8,
                  subscript: false,
                  clickHandle: () => {},
                },
                {
                  label: this.$t('workspace.workflow_waifu_d'),
                  value: 16,
                  linkage: `this.defaultConfig['model_name'] !== 'RealEsrganStable'`,
                  subscript: false,
                  clickHandle: () => {},
                },
              ],
            },
            {
              linkage: `this.defaultConfig['model_name'] !== 'RealEsrganStable'`,
              type: 'selectBox',
              key: 'noise_level',
              detail: this.$t('workspace.workflow_waifu_noise'),
              value: 2,
              childs: [
                {
                  label: this.$t('workspace.workflow_waifu_5'),
                  value: 0,
                  clickHandle: () => {},
                },
                {
                  label: this.$t('workspace.workflow_waifu_6'),
                  value: 1,
                  clickHandle: () => {},
                },
                {
                  label: this.$t('workspace.workflow_waifu_7'),
                  value: 2,
                  clickHandle: () => {},
                },
                {
                  label: this.$t('workspace.workflow_waifu_8'),
                  value: 3,
                  clickHandle: () => {},
                },
              ],
            },
            {
              type: 'radio',
              key: 'scale',
              style: 'checkbox',
              childs: [
                {
                  linkage: `this.defaultConfig['model_name'] === 'RealEsrganStable'`,
                  label: this.$t('workspace.workflow_waifu_12'),
                  value: 1,
                  clickHandle: () => {},
                },
              ],
              clickHandle: () => {},
            },
          ],
          [WorkFlowType.waifu_cunet]: [
            {
              type: 'radio',
              subType: 'btns',
              key: 'scale',
              detail: this.$t('workspace.workflow_waifu_2'),
              childs: [
                {
                  label: this.$t('workspace.workflow_waifu_a'),
                  value: 2,
                  clickHandle: () => {},
                },
                {
                  label: this.$t('workspace.workflow_waifu_b'),
                  value: 4,
                  subscript: false,
                  clickHandle: () => {},
                },
                {
                  label: this.$t('workspace.workflow_waifu_c'),
                  value: 8,
                  subscript: false,
                  clickHandle: () => {},
                },
                {
                  label: this.$t('workspace.workflow_waifu_d'),
                  value: 16,
                  subscript: false,
                  clickHandle: () => {},
                },
              ],
            },
            {
              type: 'selectBox',
              key: 'noise_level',
              detail: this.$t('workspace.workflow_waifu_noise'),
              value: 2,
              childs: [
                {
                  label: this.$t('workspace.workflow_waifu_5'),
                  value: 0,
                  clickHandle: () => {},
                },
                {
                  label: this.$t('workspace.workflow_waifu_6'),
                  value: 1,
                  clickHandle: () => {},
                },
                {
                  label: this.$t('workspace.workflow_waifu_7'),
                  value: 2,
                  clickHandle: () => {},
                },
                {
                  label: this.$t('workspace.workflow_waifu_8'),
                  value: 3,
                  clickHandle: () => {},
                },
              ],
            },
          ],
          [WorkFlowType.waifu_upconv]: [
            {
              type: 'radio',
              subType: 'btns',
              key: 'scale',
              detail: this.$t('workspace.workflow_waifu_2'),
              childs: [
                {
                  label: this.$t('workspace.workflow_waifu_a'),
                  value: 2,
                  clickHandle: () => {},
                },
                {
                  label: this.$t('workspace.workflow_waifu_b'),
                  value: 4,
                  subscript: false,
                  clickHandle: () => {},
                },
                {
                  label: this.$t('workspace.workflow_waifu_c'),
                  value: 8,
                  subscript: false,
                  clickHandle: () => {},
                },
                {
                  label: this.$t('workspace.workflow_waifu_d'),
                  value: 16,
                  subscript: false,
                  clickHandle: () => {},
                },
              ],
            },
            {
              type: 'selectBox',
              key: 'noise_level',
              detail: this.$t('workspace.workflow_waifu_noise'),
              value: 2,
              childs: [
                {
                  label: this.$t('workspace.workflow_waifu_5'),
                  value: 0,
                  clickHandle: () => {},
                },
                {
                  label: this.$t('workspace.workflow_waifu_6'),
                  value: 1,
                  clickHandle: () => {},
                },
                {
                  label: this.$t('workspace.workflow_waifu_7'),
                  value: 2,
                  clickHandle: () => {},
                },
                {
                  label: this.$t('workspace.workflow_waifu_8'),
                  value: 3,
                  clickHandle: () => {},
                },
              ],
            },
          ],
          real_esrgan: [
            {
              type: 'radio',
              subType: 'btns',
              key: 'scale',
              radioBtn: 'scale',
              detail: this.$t('workspace.workflow_waifu_2'),
              childs: [
                {
                  label: this.$t('workspace.workflow_waifu_a'),
                  value: 2,
                  clickHandle: () => {},
                },
                {
                  label: this.$t('workspace.workflow_waifu_b'),
                  value: 4,
                  subscript: false,
                  clickHandle: () => {},
                },
                {
                  label: this.$t('workspace.workflow_waifu_11'),
                  value: 6,
                  subscript: false,
                  clickHandle: () => {},
                },
                {
                  label: this.$t('workspace.workflow_waifu_c'),
                  value: 8,
                  subscript: false,
                  clickHandle: () => {},
                },
                {
                  label: this.$t('workspace.edit_crop_5'),
                  value: 'customize',
                  subscript: false, //订阅用户可以使用 false为不可用
                  linkage: `this.showCustomize`,
                  type: 'customizeSize',
                  key: 'customize',
                  clickHandle: () => {},
                },
              ],
            },
            {
              type: 'radio',
              key: 'scale',
              style: 'checkbox',
              childs: [
                {
                  label: this.$t('workspace.workflow_waifu_12'),
                  value: 1,
                  clickHandle: () => {},
                },
              ],
              clickHandle: () => {},
            },
          ],
          jpeg_artifact: [
            {
              type: 'checkbox',
              key: 'deblur',
              label: this.$t('workspace.workflow_jpeg_enabledeblur'),
              value: false,
              clickHandle: () => {},
            },
            {
              type: 'noMaintainedTip',
              source: 'jpeg_artifact',
              key: 'noMaintainedTip',
            },
          ],
          perfect: [
            // {
            //   type: 'checkModel',
            //   key: 'model_name',
            //   detail: this.$t('workspace.workflow_perfect_1'),
            //   childs: [
            //     {
            //       label: this.$t('workspace.workflow_perfect_2'),
            //       value: 'DpedSharpenStable',
            //       icon: 'palette',
            //       clickHandle: this.onCheckSharpen,
            //     },
            //     {
            //       label: this.$t('workspace.workflow_perfect_4'),
            //       value: 'perfect_2k',
            //       icon: 'brightness',
            //       clickHandle: this.onCheckSharpen,
            //     },
            //   ],
            // },
            {
              type: 'text',
              text: this.$t('workspace.workflow_perfect_5'),
              // linkage: `this.defaultConfig['model_name'] === 'perfect_2k'`,
            },
            {
              type: 'noMaintainedTip',
              source: 'perfect',
              key: 'noMaintainedTip',
            },
          ],
          brightness: [
            {
              type: 'text',
              text: this.$t('workspace.workflow_perfect_3'),
              // linkage: `this.defaultConfig['model_name'] === 'DpedSharpenStable'`,
            },
            {
              type: 'noMaintainedTip',
              source: 'perfect',
              key: 'noMaintainedTip',
            },
          ],
          repair: [
            {
              type: 'checkbox',
              group: false,
              customKey: true,
              key: 'convert',
              label: this.$t('workspace.coloring_pictures'),
              value: true,
              clickHandle: () => {},
            },
            {
              type: 'note',
              tip: !this.$getCookie('cloud_se-dehazing_manual_close'),
              tipTitle: this.$t('workspace.workflow_dehaze_2'),
              tipContent: this.$t('workspace.repair_note_tip2'),
              tipCloseHandle: this.closeTip,
            },
          ],
          'se-dehazing': [
            {
              type: 'checkbox',
              key: 'autoRetoucher',
              label: this.$t('workspace.workflow_dehaze_1'),
              value: false,
              clickHandle: () => {},
            },
            {
              type: 'noMaintainedTip',
              source: 'se-dehazing',
              key: 'noMaintainedTip',
            },
            // {
            //   type: 'note',
            //   tip: !this.$getCookie('cloud_se-dehazing_manual_close'),
            //   tipTitle: this.$t('workspace.workflow_dehaze_2'),
            //   tipContent: this.$t('workspace.workflow_dehaze_3'),
            //   tipCloseHandle: this.closeTip,
            // },
          ],
          real_esrgan2: [
            {
              type: 'noteDetail',
              label: this.$t('workspace.workflow_dehaze_2'),
              noteDetail: this.$t('workspace.workflow_perfect_10'),
            },
          ],
        },
        showCompareDialog: false,
        repairWorkflow: !this.$getCookie('cloud_repair_manual_close'),
        portraitList: [
          {
            sigma: 0,
            alpha: 0,
          },
          {
            sigma: 2,
            alpha: 0.35,
          },
          {
            sigma: 20,
            alpha: 0.35,
          },
          {
            sigma: 2,
            alpha: 0.5,
          },
          {
            sigma: 10,
            alpha: 0.5,
          },
          {
            sigma: 20,
            alpha: 0.5,
          },
          {
            sigma: 2,
            alpha: 0.75,
          },
          {
            sigma: 10,
            alpha: 0.75,
          },
          {
            sigma: 20,
            alpha: 0.75,
          },
        ],
        //memoryData 临时缓存
        memoryData: null,
        defaultConfigCopy: {},
      }
    },
    computed: {
      emptyConfig() {
        return !this.fromConfig[this.work]
      },
      imgSize() {
        return this.imageSize ? this.imageSize() : null
      },
      showCustomize() {
        const pages = [
          'workspace-enhance',
          'anime_upscaler',
          'denoise_ai',
          'image_enhancer',
          'image_enlarger',
          'image_upscaler',
          'increase_resolution',
          'make_photo_hd',
          'sharpen_ai',
          'unblur_image',
        ]
        return pages.includes(this.$route.name.replace('lang-', ''))
      },
    },
    watch: {
      imgSize: {
        handler(val) {
          this.initOutPutImageSize()
        },
        deep: true,
      },
      emptyConfig: {
        handler(val) {
          this.$emit('hideWorkConfig', !!val)
        },
        immediate: true,
      },
      defaultConfig: {
        deep: true,
        handler(val) {
          if (
            val.model_name === 'EnlargeStable' ||
            val.model_name === 'SharpenStable' ||
            val.model_name === 'SketchStable' ||
            val.model_name === 'perfect_2k' ||
            val.model_name === 'PortraitEnhancer_v1.4'
          ) {
            this.memoryData = deepClone(this.defaultConfig)
          }
        },
      },
      config: {
        handler(val) {
          if (val) {
            // if (Array.isArray(val)) {
            //   if (val.length === 2) {
            //     this.customParams.isAutoRetoucher = false
            //   } else {
            //     this.customParams.isAutoRetoucher = true
            //   }
            // } else {
            this.defaultConfigCopy = val
            this.defaultConfig = val.module_params
            const model_name = val.module_params.model_name
            if (val && model_name === 'DpedSharpenStable') {
              this.customParams.isBrightness = true
              this.customParams.sharpenJob = '3'
            } else if (val && model_name === 'perfect_2k') {
              this.customParams.isBrightness = false
              this.customParams.sharpenJob = '3'
            } else if (val && model_name === 'ColorizeStable_pth') {
              this.customParams.isBest = true
              if (val.module_params.convert) {
                this.customParams.convert = true
              }
            } else if (val && model_name === 'ColorizeStable') {
              this.customParams.isBest = true
              if (val.module_params.convert) {
                this.customParams.convert = true
              }
            } else if (val && model_name === 'DeoldifyStable') {
              this.customParams.isBest = true
              if (val.module_params.convert) {
                this.customParams.convert = true
              }
            } else if (val && model_name === 'RealEsrganStable') {
              this.customParams.isRealEsrgan = true
            } else if (val && model_name === 'models-upconv_7_anime_style_art_rgb') {
              this.customParams.isRealEsrgan = false
            } else if (val && model_name === 'models-cunet') {
              this.customParams.isRealEsrgan = false
            } else if (val && model_name === 'Animegan2Stable') {
              this.customParams.isAnimegan = true
              this.customParams.isCartoon = false
              if (
                typeof this.otherParams.portraitCheckIndex === 'number' &&
                val.module_params.model_name === 'SketchStable'
              ) {
                this.defaultConfig.alpha = this.portraitList[this.otherParams.portraitCheckIndex].alpha
                this.defaultConfig.sigma = this.portraitList[this.otherParams.portraitCheckIndex].sigma
              }
            } else if (val && model_name === 'SketchStable') {
              this.customParams.isAnimegan = false
              if (val.module_params.portraitCheckIndex) {
                this.otherParams.portraitCheckIndex = val.module_params.portraitCheckIndex
              }
              this.$nextTick(() => {
                this.defaultConfig.single_face = val.module_params.single_face
              })
            } else if (val && model_name === 'SharpenStable') {
              this.customParams.sharpenJob = '1'
              this.customParams.auto_mode = true
            } else if (val && model_name === 'DebouncingStable') {
              this.customParams.sharpenJob = '2'
            } else if (val && model_name === 'HinetRealblurStable') {
              this.customParams.sharpenJob = '3'
            } else if (val && model_name === 'CartoonizeStable') {
              this.customParams.isCartoon = true
            }
            //修改传入的模型
            if (val.module === 'enlarge' && val.module_params.scale === 1) {
              const json = WorkFlowConfig(Work.typeRealesrgan2)

              this.defaultConfigCopy.module = Work.typeRealesrgan

              delete this.defaultConfig.autoparams
              delete this.defaultConfig.remove_blur
              delete this.defaultConfig.suppress_noise
              this.defaultConfig.model_name = json.module_params.model_name
            }
            if (val.module === 'repair' && val.module_params.convert) {
              this.customParams.convert = true
            }
            if (val.module === 'matting' && val.module_params.web_auto_mode === '') {
              const mode = _paddleMattingConfig()
              //修改matting默认模型
              this.$emit('changeModuleFun', {
                index: this.workIndex,
                module_params: mode.module_params,
                module: 'matting',
              })
            }
            // }
          }
        },
        immediate: true,
        deep: true,
      },
      // 'customParams.isAnimegan'() {
      //   this.customParams.portraitCheckIndex = 0
      // },
      'customParams.isBest'() {
        //等待emit事件执行完后再赋值
        this.$nextTick(() => {
          this.defaultConfig.convert = this.customParams.convert
        })
      },
      'customParams.convert'(val) {
        //等待emit事件执行完后再赋值
        this.$nextTick(() => {
          this.defaultConfig.convert = val
        })
      },
      customParams: {
        handler(val) {
          this.$emit('changeCustomParams', val, this.workIndex)
        },
        deep: true,
      },
      'otherParams.portraitCheckIndex'(val) {
        if (typeof val === 'number' && this.currentWork === Work.sketch) {
          this.defaultConfig.alpha = this.portraitList[val].alpha
          this.defaultConfig.sigma = this.portraitList[val].sigma
          this.defaultConfig.portraitCheckIndex = val
          this.$setCookie('cloud_portraitCheckIndex', val)
        }
      },
    },
    mounted() {
      if (this.$getCookie('cloud_portraitCheckIndex') && this.currentWork === Work.sketch && !this.isEdit) {
        this.otherParams.portraitCheckIndex =
          this.$getCookie('cloud_portraitCheckIndex') !== ''
            ? parseInt(this.$getCookie('cloud_portraitCheckIndex'))
            : this.$getCookie('cloud_portraitCheckIndex')
      }
      // if (this.config && this.config.module == Work.typeRepair) {
      //   this.customParams.convert = true
      // }
    },
    methods: {
      initOutPutImageSize() {
        console.log('initOutPutImageSize')
        if (this.showCustomize && this.imgSize) {
          this.defaultConfig.width = this.imgSize.w
          this.defaultConfig.height = this.imgSize.h
        }
      },
      /**
       * @radioSelFun
       */
      radioSelFun(key, val) {
        if (this.defaultConfig['autoparams']) {
          return
        }
        this.defaultConfig[key] = val
      },
      onCheckMatting(req, val) {
        let params = null
        let module = null
        if (val === false) {
          params = _mattingConfig()
          module = Work.typeMatting
        } else {
          params = _paddleMattingConfig()
          module = 'matting'
        }
        params.module_params.web_auto_mode = val
        this.$emit('changeModuleFun', {
          index: this.workIndex,
          module_params: params.module_params,
          module,
        })
      },
      changeScale(req) {
        if (req === 'customize') {
          this.defaultConfig.customize = true
          this.initOutPutImageSize()
        } else {
          this.defaultConfig.scale = req
          this.defaultConfig.customize = false
        }
      },
      /**
       * @changeEnlarge 放大选项功能
       */
      changeEnlarge(req) {
        let json
        if (req == 1 && this.config.module !== WorkFlowType.enlarge3) {
          json = WorkFlowConfig(Work.typeRealesrgan2)
          this.defaultConfig.model_name = json.module_params.model_name
          this.defaultConfig.scale = json.module_params.scale
          this.defaultConfigCopy.module = json.module
          this.defaultConfig.customize = false
        } else if (req === 'customize') {
          json = WorkFlowConfig(WorkFlowType.enlarge3, 4)
          this.defaultConfig.model_name = json.module_params.model_name
          this.defaultConfig.customize = true
          // this.$set(this.defaultConfig, 'customize', true)
          // this.$set(this.defaultConfig, 'width', 0)
          // this.$set(this.defaultConfig, 'height', 0)
          this.defaultConfigCopy.module = json.module
          this.initOutPutImageSize()
        } else {
          this.defaultConfig.scale = req
          //一律按typeEnlarge处理有问题，暂时这么处理：添加module区分
          if (this.module) {
            json = WorkFlowConfig(this.module)
          } else {
            json = WorkFlowConfig(Work.typeEnlarge)
          }

          this.defaultConfig.model_name = json.module_params.model_name
          if (this.module) {
            //enlarge3的处理，先这么处理
            this.defaultConfig.model_name = `EnlargeStandard_${req}x_Stable`
          }
          this.defaultConfig.customize = false
          this.defaultConfigCopy.module = json.module

          //回滚上次结果
          if (this.memoryData) {
            this.$set(this.defaultConfig, 'autoparams', this.memoryData.autoparams)
            this.$set(this.defaultConfig, 'remove_blur', this.memoryData.remove_blur)
            this.$set(this.defaultConfig, 'suppress_noise', this.memoryData.suppress_noise)
          } else {
            this.$set(this.defaultConfig, 'autoparams', json.module_params.autoparams)
            this.$set(this.defaultConfig, 'remove_blur', json.module_params.remove_blur)
            this.$set(this.defaultConfig, 'suppress_noise', json.module_params.suppress_noise)
            this.memoryData = deepClone(this.defaultConfig)
          }
        }
      },
      onCheckSharpen(key, item) {
        console.log('onCheckSharpen')
        //模块产生联动
        if (this.work === Work.typeSketch) {
          if (key === 'auto_mode') {
            this.defaultConfig['single_face'] = item
          }
        }
        this.memoryData[key] = item
        //切换模型
        if (item == 2) {
          if (this.configAllLength > 1) {
            this.$emit('dontAddFun', { contentTxt: this.$t('workspace.tip_txt') })
            return
          }
          this.memoryData = deepClone(this.defaultConfig)
          const mode = _waifuConfig()
          mode.module_params.auto_mode = 2
          this.$emit('changeModuleFun', {
            index: this.workIndex,
            module_params: mode.module_params,
            module: Work.typeWaifu,
          })
        } else {
          this.$emit('changeModuleFun', {
            index: this.workIndex,
            module_params: this.memoryData,
            module: this.work,
          })
        }
      },
      changeInputNumber(key) {
        console.log('changeInputNumber')
        if (this.imgSize) {
          const imageSize = this.imgSize
          const r = imageSize.w / imageSize.h
          if (key === 'width') {
            if (this.$refs.width[0].displayValue > imageSize.w * 8) {
              this.defaultConfig.width = Math.round(imageSize.w * 8)
              this.defaultConfig.height = Math.round(imageSize.h * 8)
            } else if (this.defaultConfig.width === 0) {
              this.defaultConfig.width = 0
              this.defaultConfig.height = 0
            } else {
              this.defaultConfig.width = this.$refs.width[0].displayValue
              this.defaultConfig.height = Math.round(this.defaultConfig.width / r)
            }
          } else {
            if (this.$refs.height[0].displayValue > imageSize.h * 8) {
              this.defaultConfig.width = Math.round(imageSize.w * 8)
              this.defaultConfig.height = Math.round(imageSize.h * 8)
            } else if (this.defaultConfig.height === 0) {
              this.defaultConfig.width = 0
              this.defaultConfig.height = 0
            } else {
              this.defaultConfig.height = this.$refs.height[0].displayValue
              this.defaultConfig.width = Math.round(r * this.defaultConfig.height)
            }
          }
        }
      },
      getLinkageResult(str) {
        if (!str) {
          return true
        }
        return eval(str)
      },
      onPortraitOptionClick(val) {
        this.otherParams.portraitCheckIndex = val
      },
      portraitChangeHandle() {
        this.otherParams.portraitCheckIndex = ''
      },
      hundredfold(val) {
        return (val * 100).toFixed(0)
      },
      closeTip(type, item) {
        this.$setCookie('cloud_' + type + '_manual_close', '1')
        item.tip = false
        if (type === 'repair') {
          this.repairWorkflow = !this.$getCookie('cloud_repair_manual_close')
        }
      },
    },
  }
</script>

<style scoped lang="less">
  .icon-s-palette,
  .icon-s-brightness,
  .icon-s-retouch {
    font-size: 22 / @base;
    font-weight: 700;
  }

  .icon-s-general,
  .icon-s-enhance {
    font-size: 24 / @base;
    font-weight: 700;
  }

  .icon-s-right {
    position: absolute;
    top: -11px;
    left: 0;
    display: none;
    font-size: 30 / @base;
    color: #0374ff;
  }

  .icon-s-info {
    margin-left: 5px;
    font-size: 14px;
    color: #232323;
    cursor: pointer;
  }

  .check-model-tab:hover {
    .icon-s-palette,
    .icon-s-brightness,
    .icon-s-retouch,
    .icon-s-enhance {
      color: #0374ff;
    }
  }

  .face-child-box .flex1:hover {
    .icon-s-retouch,
    .icon-s-general {
      color: #0374ff;
    }
  }

  .icon-s-palette.check,
  .icon-s-brightness.check,
  .icon-s-retouch.check,
  .icon-s-enhance.check,
  .icon-s-general.check {
    color: #fff !important;
  }

  .dis-no {
    display: none;
  }

  .face-child {
    padding: 9px;
    background: #eaeaea;

    &.sel {
      color: white;
      background: #0374ff;
    }
  }

  .workflow-operator {
    display: flex;
    flex-direction: column;
    width: 100%;
    padding: 10px;
    margin-bottom: 10px;
    background: #f5f7fa;

    .workflow-element,
    .workflow-element2,
    .workflow-secord-element {
      display: flex;
      width: 100%;
    }

    .workflow-radio-slot {
      // margin-bottom: 10px;
      .el-radio {
        margin-bottom: 10px;
      }
    }

    .workflow-element {
      flex-wrap: wrap;
      justify-content: space-between;

      .module-select {
        width: 100%;
      }
    }

    .workflow-element2,
    .workflow-secord-element {
      flex-direction: column;
      text-align: left;
    }

    .workflow-element.no-wrap {
      flex-wrap: nowrap;
    }

    .workflow-radio,
    .workflow-checkbox {
      display: flex;
      align-items: flex-start;
      margin: 10px 0;
      text-align: left;

      .workflow-radio-label,
      .workflow-checkbox-label {
        font-size: 14px;
        line-height: 18px;
        text-align: left;
        word-break: break-word;
        white-space: pre-wrap;
        vertical-align: text-top;
      }
    }

    .radio-group {
      display: flex;
      justify-content: flex-start;

      > * {
        margin-right: 1.2rem;
      }

      .workflow-radio {
        display: flex;
        align-items: center;
        justify-content: center;
        min-width: 50px;
        padding: 0.25rem 8px;
        text-align: center;
        border: 1px solid #cecece;
        border-radius: 3px;
      }

      .workflow-radio:hover {
        border: 1px solid #0374ff;
      }

      /deep/ .is-checked {
        color: #fff;
        background: #0374ff;
        border: 1px solid #cecece;

        .workflow-radio-label {
          color: #fff;
        }
      }

      /deep/ .el-radio__input {
        display: none;
      }

      /deep/ .el-radio__label {
        padding: 0;
      }
    }

    .slider-label,
    .element-label {
      display: block;
      font-size: 14px;
      color: #717e8f;
    }

    .workflow-slider {
      display: flex;
      align-items: center;
      justify-content: space-between;

      span {
        font-size: 14px;
        color: #4f6785;
      }

      .el-slider {
        width: 100%;
        padding: 0 10px;
      }
    }

    .workflow-radio-text {
      font-size: 14px;
      color: #717e8f;
    }

    .tag {
      padding: 0 8px;
      font-size: 12px;
      color: #fff;
      background: #836bc3;
      border-radius: 3px;
    }

    .no-config {
      color: #717e8f;
      text-align: left;
      //background: #f5f7fa;
    }
  }

  .sample-cont {
    display: flex;
    flex-wrap: wrap;
    justify-content: space-between;
  }

  .sample-img-cont {
    margin-top: 8px;
    border: 1px dashed #3699ff;
  }

  .check-model-tabs {
    display: flex;
    justify-content: center;
    width: 100%;
    min-height: 63 / @base;
    background: #eaeaea;
    background: #eaeaea;
    border-radius: 3px;

    .check-model-tab {
      position: relative;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      width: 100%;
      padding: 9px;
      overflow: hidden;
      font-size: 12rpx;
      cursor: pointer;

      .hover {
        display: none;
      }
      // [class$='_hover'] {
      //   display: none;
      // }

      .label {
        margin-top: 8px;
        font-size: 12px;
      }

      .new {
        position: absolute;
        top: 6px;
        right: -26px;
        width: 80px;
        height: 20px;
        font-size: 10px;
        color: #ffe81d;
        text-align: center;
        background: #ff2828;
        box-shadow: 0 1px 9px -2px #ff282888;
        transform: rotate(45deg) scale(0.8);
      }
    }

    .check-model-tab:hover {
      color: #0374ff;

      [class^='icon_'] {
        display: none;
      }

      [class$='_hover'] {
        display: block;
      }
    }

    .check-model-tab-select {
      color: #fff !important;
      background: #0374ff;
    }
  }

  .face-child {
    .check-model-tab {
      [class$='_hover'] {
        display: none;
      }
    }
  }

  .face-child {
    cursor: pointer;

    &:hover {
      color: #0374ff;

      [class^='icon_'] {
        display: none;
      }

      [class$='_hover'] {
        display: block;
      }
    }

    &.sel {
      color: white;
    }
  }

  .separation {
    width: 100%;
    padding-bottom: 10px;
    border-top: 1px solid #d5d5d5;
  }

  .separation-detail {
    width: 100%;
    padding: 5px 0;
  }

  .workflow-tip {
    position: relative;
    padding: 0 10px 10px;
    margin: 10px 0;
    background: #fff5e8;
    border: 2px solid #efcea6;

    .workflow-tip-title {
      display: flex;
      align-items: center;
      justify-content: space-between;
      font-size: 14 / @base;
      color: #665c50;

      .workflow-tip-title-le {
        display: flex;
        align-items: center;
        justify-content: space-between;

        .icon-s-warn {
          margin-right: 10px;
          font-size: 24 / @base;
          color: #deac14;
        }
      }

      .workflow-tip-title-ri {
        .el-icon-close {
          position: absolute;
          top: 5px;
          right: 5px;
          font-size: 20px;
          cursor: pointer;

          &:hover {
            color: #5b0000;
          }
        }
      }
    }

    .workflow-tip-content {
      font-size: 12 / @base;
      line-height: 16 / @base;
      color: #665c50;
      text-align: left;
    }
  }

  .portrait-options {
    display: flex;
    flex-wrap: wrap;
    margin-top: 10px;

    .portrait-option {
      position: relative;
      width: 100px;
      height: 100px;
      margin-right: 5px;
      margin-bottom: 5px;
      cursor: pointer;
      box-shadow: 0 0 0 1px #e8eaed;

      img {
        z-index: 0;
      }

      .icon {
        position: absolute;
        top: 0;
        left: 0;
        display: none;
      }

      &:hover {
        box-shadow: 0 0 0 2px #3887fe;
      }
    }

    & > :nth-child(3n) {
      margin-right: 0;
      margin-bottom: 0;
    }

    .portrait-option-active {
      box-shadow: 0 0 0 2px #3887fe;

      .icon-s-right {
        display: block;
      }

      .icon {
        display: block;
      }
    }
  }

  .mini-title {
    font-size: 14 / @base;
  }

  .radio-btns {
    display: flex;
    align-items: center;

    .radio-btns-item {
      padding: 5 / @base;
      font-size: 14 / @base;
      text-align: center;
      background-color: #ededed;
      border-radius: 3px;

      &:hover {
        color: #0374ff;
      }

      &.disabled {
        color: #babfc4 !important;
        background-color: #f1f2f2 !important;
      }

      &.disabled:hover {
        cursor: not-allowed;
      }
    }

    .radio-btns-item.is-active {
      color: #fff;
      background-color: #0374ff;
    }

    > :first-child {
      border-radius: 3px 0 0 3px;
    }

    > :last-child {
      border-radius: 0 3px 3px 0;
    }
  }

  .workflow-operator {
    /deep/ .el-slider__button {
      width: 10px;
      height: 10px;
      background-color: #3887fe;
    }

    /deep/ .el-slider__runway.disabled {
      .el-slider__button {
        background-color: #c0c4cc;
      }
    }

    /deep/ .el-slider__bar,
    /deep/ .el-slider__runway {
      height: 2px;
    }

    /deep/ .el-slider__button-wrapper {
      top: -17px;
    }
  }

  .custom-radio {
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 0 10px;
    margin-right: 10 / @base;
    cursor: pointer;
    border: 1px solid #cecece;
    border-radius: 3px;

    &:hover {
      border: 1px solid #0374ff;
    }
  }

  .custom-radio.is-active {
    color: #fff;
    background: #0374ff;
    border: 1px solid #cecece;

    &:hover {
      border: 1px solid #cecece;
    }
  }

  /deep/ .input-number.el-input-number--small {
    width: 60 / @base;
  }

  /deep/ .input-number.el-input-number--small,
  /deep/ .input-number .el-input .el-input__inner {
    height: 28px;
    padding: 0 5px !important;
    line-height: 28px;
  }
</style>
<style lang="less">
  .workflow-operator .el-switch__core {
    height: 8px;
    background: #bfc4e0;
  }

  .workflow-operator .el-switch.is-checked .el-switch__core {
    background-color: #a0c8ff;
    border-color: #a0c8ff;
  }

  .workflow-operator .el-switch__core::after {
    top: -6px;
    left: 0;
    width: 18px;
    height: 18px;
    background: #7b89ae;
  }

  .workflow-operator .el-switch.is-checked .el-switch__core::after {
    background: #0d73e3;
  }

  .workflow-operator .workflow-element .checkbox-radio {
    .el-radio__inner {
      position: relative;
      z-index: 1;
      -webkit-box-sizing: border-box;
      box-sizing: border-box;
      display: inline-block;
      height: 14px;
      border: 1px solid #dcdfe6;
      border-radius: 2px;
      transition: border-color 0.25s cubic-bezier(0.71, -0.46, 0.29, 1.46),
        background-color 0.25s cubic-bezier(0.71, -0.46, 0.29, 1.46);

      &::after {
        top: 0;
        left: 0;
      }
    }
  }

  .workflow-operator .workflow-element .checkbox-radio.is-checked {
    .el-radio__inner {
      background-color: #409eff !important;

      &::after {
        position: absolute;
        top: 1px;
        left: 4px;
        -webkit-box-sizing: content-box;
        box-sizing: content-box;
        width: 3px;
        height: 7px;
        content: '';
        background-color: transparent;
        border: 1px solid #fff;
        border-top: 0;
        border-left: 0;
        border-radius: 0;
        transform: rotate(45deg);
        transform-origin: center;
      }
    }
  }
</style>
