<!--suppress ALL -->
<template lang="html">
  <v-fade-transition mode="slide">
    <router-view></router-view>
  </v-fade-transition>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';

@Component({})
export default class Document extends Vue {}
</script>

<style>
</style>
