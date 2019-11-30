<template lang="html">
  <v-container class="main-container" fluid>
    <!-- <div> -->
    <v-layout class="mt-4 text-xs-right pr-2">
      <span class="my-subheading font-weight-medium cg mf" v-html="aboutConsenz"></span>
    </v-layout>
    <!-- </div> -->
    <!-- <div>
            <v-layout justify-space-around class="ma-4">
                <p class="my-subheading font-weight-medium cg mf align-right">{{aboutConsenz}}</p>
            </v-layout>
        </div> -->

    <div>
      <v-layout justify-space-around class="ma-4">
        <p class="my-subheading font-weight-medium cmp mf align-right"><span>info@consenz.co.il</span></p>
      </v-layout>
    </div>
  </v-container>
</template>

<script lang="ts">
import { DisplayModule, MainModule } from '@/store/store.helper';
import { Component, Vue } from 'vue-property-decorator';
import { mapGetters } from 'vuex';

@Component({})
export default class aboutConsenz extends Vue {
  @DisplayModule.DisplayMutation public setNavBar;
  @MainModule.MainGetter private aboutConsenz;

  private async created() {
    console.log('Created AboutConsenz.vue');
    this.setNavBar({
      title: 'אודות קונסנז',
      icon: 'close',
      color: '#69378e',
    });
  }
}
</script>

<style>
</style>
