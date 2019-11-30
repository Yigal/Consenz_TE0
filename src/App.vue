<template>
  <v-app id="app" class="force-mobile" dir="rtl">
    <v-dialog v-model="dialog" persistent content content-class="centered-dialog">
      <v-container fill-height>
        <v-layout column justify-center align-center>
          <v-progress-circular indeterminate :size="70" :width="7" color="white"></v-progress-circular>
        </v-layout>
      </v-container>
    </v-dialog>
    <!-- <ErrorBoundary> -->
    <div class="router_view_container">
      <router-view v-if="isStoreCreated"></router-view>
    </div>
    <!-- </ErrorBoundary> -->
  </v-app>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import { mapActions, mapGetters, mapMutations } from 'vuex';
import ErrorBoundary from './views/ErrorBoundary.vue';
import { MainModule, SectionsModule } from '@/store/store.helper';
import { setInterval } from 'timers';
// import {  } from "@/view";

@Component({
  components: {
    ErrorBoundary,
  },
})
export default class App extends Vue {
  @MainModule.MainGetter private prettyLink;
  @MainModule.MainGetter private navBar;
  @MainModule.MainMutation private setPrettyLink;
  @MainModule.MainAction private initStore;
  @SectionsModule.SectionsAction private updateStatusByDeadline;

  private isStoreCreated: boolean = false;
  private dialog = true;

  public async created() {
    if (this.prettyLink === undefined) {
      // if there is no prettyLink -> check the params in router, else go to the default document -> "demo"
      const prettyLink =
        this.$route.params.prettyLink !== undefined
          ? this.$route.params.prettyLink
          : 'springfield';
      console.log('App.vue prettyLink=' + prettyLink + ' , Init Store');
      this.setPrettyLink(prettyLink);
      await this.initStore();
    }
    this.isStoreCreated = true;
    this.dialog = false;
  }
}
</script>
<style lang="scss">
@import "main.scss";
@import url("https://fonts.googleapis.com/css?family=Heebo");
body {
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: $main-background-color;
}
#app {
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  // max-width: 40vw;
  background-color: $main-background-color;

  .v-toolbar {
    .v-toolbar__title {
      font-family: Heebo, sans-serif;
    }
  }
  -webkit-user-select: text;
}

.router_view_container {
  // border: 1px solid #467094;
  padding-top: 64px;
}

@media only screen and (min-width: 1600px) {
  #app {
    width: 40vw !important;
  }
}

@media only screen and (min-width: 1260px) and (max-width: 1600px) {
  #app {
    width: 50vw !important;
  }
}

@media only screen and (min-width: 600px) and (max-width: 1260px) {
  #app {
    width: 80vw !important;
  }
}

@media only screen and (max-width: 600px) {
  #app {
    width: 100vw !important;
  }
}
</style>
