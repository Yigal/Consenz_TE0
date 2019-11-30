<template src="./NavBar.html"></template>


<script lang="ts">
import {
  DisplayModule,
  DocumentsModule,
  RouterModule,
  UsersModule,
} from '@/store/store.helper';
import { NavBarInterface, NAVBAR_SIDE_ICON } from '@/store/types';
// import { ROUTE_NAME } from "@/types/enums";
import firebase from 'firebase/app';
import { Component, Vue } from 'vue-property-decorator';
import { ROUTE_NAME } from '../../types/enums';
const DEFAULT_TRANSITION = 'slide-left';

Component.registerHooks([
  // "beforeLeave",
  // "enter",
  'afterEnter',
  'beforeRouteUpdate',
]);

@Component({})
export default class NavBar extends Vue {
  @DocumentsModule.DocumentsGetter private documentTitle;
  @DocumentsModule.DocumentsGetter private documentId;

  @UsersModule.UsersGetter private user;
  @UsersModule.UsersGetter private isSignedIn;
  @UsersModule.UsersMutation private logOut;
  @UsersModule.UsersAction private signIn;

  @RouterModule.RouterGetter private getPath;
  @RouterModule.RouterGetter private currentRoute;
  @RouterModule.RouterGetter private transitionName;
  @RouterModule.RouterMutation private setTransitionName;
  @RouterModule.RouterAction private push;
  @RouterModule.RouterAction private goBack;

  @DisplayModule.DisplayGetter private navBar: NavBarInterface;
  private drawer = {
    open: false,
    clipped: true,
    fixed: false,
    permanent: false,
    mini: true,
  };
  private toolbar = {
    fixed: true,
    clippedLeft: false,
  };
  private navItems: any[] = [];

  public created() {
    if (this.isDesktop(1260)) {
      this.drawer.open = true;
    }
  }

  public isDesktop(width) {
    return window.innerWidth > width;
  }

  // changes the drawer to permanent
  public makeDrawerPermanent() {
    this.drawer.permanent = true;
    // set the clipped state of the drawer and toolbar
    this.drawer.clipped = false;
    this.toolbar.clippedLeft = false;
  }

  public onClickNavBar() {
    switch (this.navBar.icon) {
      case NAVBAR_SIDE_ICON.menu:
        this.toggleDrawer();
        break;
      case NAVBAR_SIDE_ICON['arrow_forward']:
        this.setTransitionName('slide-left');

        this.navigate();
        break;
      case NAVBAR_SIDE_ICON.close:
        this.setTransitionName('slide-left');
        this.goBack();
        break;
    }
  }

  // toggles the drawer type (permanent vs temporary) or shows/hides the drawer
  public toggleDrawer() {
    if (this.drawer.permanent) {
      this.drawer.permanent = !this.drawer.permanent;
      this.drawer.clipped = true;
      this.toolbar.clippedLeft = true;
    } else {
      this.drawer.open = !this.drawer.open;
    }
  }

  private navigate() {
    if (!this.navBar.path || this.navBar.path === this.currentRoute.fullPath) {
      this.push({
        path: this.getPath({ name: ROUTE_NAME.draft, params: {} }),
      });
    } else {
      this.push({ path: this.navBar.path });
    }
  }

  private async logout() {
    if (this.isSignedIn) {
      await firebase.auth().signOut();
      await this.logOut();
      this.toggleDrawer();
    }
  }
}
</script>

<style>
.link {
  color: #1976d2 !important;
  cursor: pointer;
  text-decoration: underline;
}
.align_left_drawer {
  padding-right: 252px;
}
.slide-left-enter-active,
.slide-left-leave-active,
.slide-right-enter-active,
.slide-right-leave-active {
  transition-duration: 0.5s;
  transition-property: height, opacity, transform;
  transition-timing-function: cubic-bezier(0.55, 0, 0.1, 1);
  overflow: hidden;
}

.slide-left-enter,
.slide-right-leave-active {
  opacity: 0;
  transform: translate(2em, 0);
}

.slide-left-leave-active,
.slide-right-enter {
  opacity: 0;
  transform: translate(-2em, 0);
}
</style>
