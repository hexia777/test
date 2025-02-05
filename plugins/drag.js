import Vue from 'vue'
import VueDraggableResizable from 'vue-draggable-resizable'

// 可选择导入默认样式
import 'vue-draggable-resizable/dist/VueDraggableResizable.css'

console.log('enter /plugins/drag:         ', new Date().getTime())

Vue.component('vue-draggable-resizable', VueDraggableResizable)
