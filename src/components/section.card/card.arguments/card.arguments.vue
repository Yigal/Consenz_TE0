<template src="./card.arguments.html"></template>

<script lang="ts">
import {
  DisplayModule,
  RouterModule,
  SectionsModule,
  ArgumentsModule,
  UsersModule,
  VotingModule,
  CommentsModule,
} from '@/store/store.helper';
import * as enums from '@/types/enums';
import { eventBus } from '@/main';
import {
  ArgumentInterface,
  SectionInterface,
  CommentInterface,
  } from '@/types/interfaces';
import Vue from 'vue';
import Component from 'vue-class-component';
import contentBox from '@/components/content.box/content.box.vue';
import cardComments from '../card.comments/card.comments.vue';
import { NavBarInterface} from '@/store/types';
import { colorDirective } from '@/directives/color-directive';
import { Prop } from 'vue-property-decorator';

@Component({
  components: {
    'content-box': contentBox,
    'card-comments': cardComments,
  },
  directives: {
    colorDirective,
  },
})
export default class CardArguments extends Vue {
  @Prop() public section: SectionInterface;
  @Prop() public sectionIndex: Number;
  @Prop() public parentSectionId: String;
  @Prop() public pageStatus: Number;
  @Prop() public sectionsLength: Number;
  @Prop() public isFeedIsDiscussion: Boolean;
  @Prop() public isDisplayed: Boolean;
  @DisplayModule.DisplayGetter private getColor;
  @DisplayModule.DisplayGetter private getBorderTopColor;
  @DisplayModule.DisplayGetter private dateFormatted;
  @DisplayModule.DisplayGetter private navBar: NavBarInterface;

  @DisplayModule.DisplayMutation private setNavBar;

  @RouterModule.RouterGetter private currentRoute;
  @RouterModule.RouterGetter private getPath;
  @RouterModule.RouterMutation private setTransitionName;
  @RouterModule.RouterAction private push;

  @SectionsModule.SectionsGetter private isStaticFeed;
  @SectionsModule.SectionsGetter private isSectionsInRevisions;
  @SectionsModule.SectionsGetter private isParentSection;
  @SectionsModule.SectionsGetter private isDynamicFeed;

  @ArgumentsModule.ArgumentsGetter private argumentBySectionId;
  @ArgumentsModule.ArgumentsGetter private isUserConvinced;
  @ArgumentsModule.ArgumentsAction private userConvinced;
  @ArgumentsModule.ArgumentsAction private userUnconvinced;

  @CommentsModule.CommentsGetter private commentsByArgumentId: (
    string,
  ) => CommentInterface[];
  @CommentsModule.CommentsGetter private commentsBySectionId: (
    string,
  ) => CommentInterface[];

  @UsersModule.UsersGetter private participantDisplayNameById;

  @UsersModule.UsersGetter private isSignedIn;
  @UsersModule.UsersGetter private userUid;
  @UsersModule.UsersAction private signIn;
  @UsersModule.UsersAction private checkUserProperties;

  @RouterModule.RouterAction private pushWithParams;

  @VotingModule.VotingGetter private isUserVoted;
  @VotingModule.VotingGetter private isSectionReachedToThreshold: (
    SectionInterface,
    VotesInterface,
  ) => boolean;
  private sectionArguments: ArgumentInterface[] = [];
  private sectionId: string = '';
  private argumentContent = {};
  private loading: boolean = false;
  private enums = enums;
  private eventBus = eventBus;
  private styleConvincedButtonObject(argument) {
    return {
      'background-color': !this.isUserConvinced(argument)
        ? this.getColor(argument.type)
        : 'white',
      'color': this.isUserConvinced(argument)
        ? this.getColor(argument.type)
        : 'white',
      'border': '2px solid',
      'border-color': this.isUserConvinced(argument)
        ? this.getColor(argument.type)
        : 'white',
    };
  }

  public async mounted() {
    this.sectionId =
      this.pageStatus === enums.FEED_TYPE.sectionEdited
        ? this.section.edited![this.section.edited!.length - 1]
        : this.section.id!;
  }

  get visibleArguments() {
    if (this.argumentBySectionId(this.sectionId).length > 0) {
      const theArray = this.isDisplayed
        ? this.argumentBySectionId(this.sectionId)
        : new Array(this.argumentBySectionId(this.sectionId)[0]);
      return theArray;
    } else { return []; }
  }

  /**
   * adding new argument
   */
  private async addNewArgument(action: number) {
    if (!this.isSignedIn) {
      this.signIn();
    } else {
      // Each user has notification properties
      // If flag is true, app sends notifications (emails)
      await this.checkUserProperties();
      const pushToParams = {
        sectionId: this.section.id,
        parentSectionId: this.parentSectionId,
        type: 'argument',
        action,
        index: this.sectionIndex,
      };
      // Route UI to addNew component
      this.pushWithParams({
        name: enums.ROUTE_NAME.addNew,
        params: pushToParams,
      });
    }
  }

  /**
   * route to feed page with this current section and open it's arguments
   */
  public routeAndToggle() {
    // if this is a discussion page and the arguments are opens -> close the arguments and go back to the feed
    if (this.isFeedIsDiscussion) {
      this.push({ path: this.navBar.path });
    } else if (!(<any>Object).values(enums.STATIC_STATUS).includes(this.pageStatus)) {
      this.setTransitionName('slide-right');
      if (this.pageStatus !== enums.FEED_TYPE.edited) {
        // route to section page with this specific section
        const path = this.getPath({
          name: enums.ROUTE_NAME.section,
          params: {
            [enums.SECTION_BY.sectionById]: this.section.id,
            index: this.sectionIndex,
          },
        });
        this.setNavBar({ path: this.currentRoute.fullPath });
        this.push({ path });
      }
    } else {
      eventBus.$emit('toggleArguments', {
        sectionId: this.sectionId,
      });
    }
  }

  public toggleComments(argumentId) {
    this.$refs[`commentsComponent${argumentId}`][0].toggleComments();
  }

  public addComment(argumentId) {
    this.$refs[`commentsComponent${argumentId}`][0].addComment();
  }
  /**
   * user clicked on convinced button
   */
  public async convinced(argument) {
    console.log('Convinced on argument ' + JSON.stringify(argument));
    const vote = argument.type
      ? enums.VOTING_OPTIONS.pros
      : enums.VOTING_OPTIONS.cons;
    if (!this.isSignedIn) {
      this.signIn();
    } else {
      if (this.isUserConvinced(argument)) {
        console.log('User Unconvinced');
        await this.userUnconvinced(argument.id);
      } else {
        console.log('User Convinced');
        this.loading = true;
        await this.userConvinced(argument.id);
        if (
          this.isUserVoted(this.section, vote) ||
          this.isSectionReachedToThreshold(this.section, {
            pros: this.section.pros,
            cons: this.section.cons,
          })
        ) {
          this.loading = false;
          return;
        }
        await this.$emit(
          'userVoted',
          argument.type ? enums.VOTING_OPTIONS.pros : enums.VOTING_OPTIONS.cons,
        );
        this.loading = false;
      }
    }
  }
}
</script>

<style lang="scss">
@import "@/main.scss";

.arguments_container {
  .btn_arguments {
    .v-btn {
      border-radius: 10px;
      padding: 0 11px !important;
    }
  }
}
.convinced-button-container {
  .v-btn {
    letter-spacing: 1px;
    display: flex;
    justify-content: space-around;
    align-items: center;
    border-radius: 10px;
    .btn_flexed {
      font-size: medium;
      font-weight: 100 !important;
    }
  }
  .pros {
    background-color: $blue-pro;
  }

  .cons {
    background-color: $red-con;
  }
}

.application--is-rtl .v-badge__badge {
  right: initial;
  left: -8px;
  top: -4px;
}

.openArgsBtn {
  box-shadow: 0 0px 0px, 0 0px 0px 0 !important;
  background-color: transparent !important;
  padding: 0px !important;
  font-weight: 400 !important;
  letter-spacing: 0.02em !important;
}

.more-comments:hover {
  text-decoration: underline;
}
</style>
