<template>
  <div>
    <svg-icon icon-class="github" @click="goto" />
  </div>
</template>

<script setup>
const url = ref('https://github.com/sdhkj/Ruoyi_vue3_web/tree/main');

function goto() {
  window.open(url.value)
}
</script>
