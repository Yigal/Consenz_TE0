<template lang="html">
  <v-container class="main-container" fluid>
    <div class="mirFont">
      <v-layout justify-space-around class="ma-4">
        <p class="my-headline font-weight-medium cmp mf">{{ documentTitle }}</p>
      </v-layout>
    </div>
    <!-- <div> -->
    <v-layout class="mt-4 text-xs-right pr-2">
      <span class="my-subheading font-weight-medium cg mf" v-html="documentAbout"></span>
    </v-layout>
    <!-- </div> -->
  </v-container>
</template>

<script lang="ts">
import {
  DisplayModule,
  MainModule,
  DocumentsModule,
} from '@/store/store.helper';
import { Component, Vue } from 'vue-property-decorator';
import { mapGetters } from 'vuex';

@Component({})
export default class aboutDocument extends Vue {
  @DocumentsModule.DocumentsGetter private documentTitle;
  @DocumentsModule.DocumentsGetter private documentId;
  @DocumentsModule.DocumentsGetter private documentAbout;

  @DisplayModule.DisplayMutation public setNavBar;

  private async created() {
    this.setNavBar({
      title: `אודות המסמך`,
      icon: 'close',
      color: '#69378e',
    });
  }
}
</script>

<style>
.align-right {
  text-align: right !important;
}
</style>

