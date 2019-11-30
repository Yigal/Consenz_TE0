<template lang="html">
  <h1>contactUs</h1>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import { mapGetters, mapMutations } from 'vuex';
import { DocumentsModule, DisplayModule } from '@/store/store.helper';
import { NavBarInterface, NAVBAR_SIDE_ICON } from '@/store/types';

@Component({})
export default class contactUs extends Vue {
  @DocumentsModule.DocumentsGetter private documentTitle;
  @DocumentsModule.DocumentsGetter private documentId;

  @DisplayModule.DisplayMutation public setNavBar;

  private async created() {
    this.setNavBar({
      titleNavBar: `צור קשר`,
      sideIconType: 'arrowForward',
      navBarColor: '#69378e',
    });
  }
}
</script>

<style>
</style>
