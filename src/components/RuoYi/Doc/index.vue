<template>
  <div>
    <svg-icon icon-class="question" @click="goto" />
  </div>
</template>

<script setup>
const url = ref('https://github.com/sdhkj');

function goto() {
  window.open(url.value)
}
</script>