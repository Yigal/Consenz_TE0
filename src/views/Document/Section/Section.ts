import { eventBus } from '@/main';
import { DisplayModule, RouterModule, SectionsModule, UsersModule, ArgumentsModule, CommentsModule } from '@/store/store.helper';
import { SectionInterface} from '@/types/interfaces';
import * as enums from '@/types/enums';
import { NavBarInterface, NAVBAR_SIDE_ICON } from '@/store/types';
import SectionCard from '@/components/section.card/section.card';
import { Component, Vue, Watch } from 'vue-property-decorator';
import { DYNAMIC_PAGES } from '@/types/constants';
import * as VueScrollTo from 'vue-scrollto';
Component.registerHooks(['beforeRouteEnter', 'beforeRouteLeave', 'beforeRouteUpdate']);
@Component({
  components: {
    SectionCard,
  },
})
export default class Section extends Vue {
  @DisplayModule.DisplayGetter public getColor: (number) => string;
  @DisplayModule.DisplayGetter public scrollingOptions;
  @DisplayModule.DisplayMutation public setNavBar;

  @RouterModule.RouterGetter private currentRoute;
  @RouterModule.RouterGetter private getPath;
  @RouterModule.RouterAction private pushWithParams;
  @RouterModule.RouterAction private push;

  @UsersModule.UsersGetter private isSignedIn;
  @UsersModule.UsersAction private signIn;
  @UsersModule.UsersAction private checkUserProperties;

  @DisplayModule.DisplayGetter private snackbar;
  @DisplayModule.DisplayMutation private closeSnackbar;

  @SectionsModule.SectionsGetter private sectionsByStatus;
  @SectionsModule.SectionsGetter private sectionById;
  @SectionsModule.SectionsGetter private isParentSection;
  @SectionsModule.SectionsGetter private initialParentId;
  @SectionsModule.SectionsGetter private sectionRejectedLength;
  @SectionsModule.SectionsGetter private isDynamicFeed: (pageStatus) => boolean;

  @CommentsModule.CommentsGetter private commentById;

  @ArgumentsModule.ArgumentsGetter private argumentById;
  public pageStatus: any;
  private sectionByFunction;
  private sectionByKey;
  private sectionByValue = '';
  //private SectionCard;
  private pageSectionId = '';
  private sectionIndex: number = 1;
  private parentSectionId = '';
  private isFeedIsDiscussion: boolean;

  // This enums silly assignment is needed in order to prevent the 'Property or method "enums" is not defined on the instance but referenced during render' Error
  private enums = enums;

  @Watch('$route', { immediate: true, deep: true })
  private onUrlChange(to, from) {
    console.log('Section.ts URL Change' + (from ? ' from ' + from : '') + ' to ' + to.path);
    this.mountFeed();
  }

  get sections() {
    console.log('Section.ts Get Sections');
    if (DYNAMIC_PAGES.includes(this.pageStatus)) {
      // @ts-ignore
      return this.sectionByFunction(...this.getParams())
        .sort((sectionA: SectionInterface, sectionB: SectionInterface) => {
          const aThreshold = sectionA.threshold;
          const aPros = sectionA.pros;
          const aCons = sectionA.cons;
          const bThreshold = sectionB.threshold;
          const bPros = sectionB.pros;
          const bCons = sectionB.cons;
          return aThreshold - aPros.length + aCons.length - (bThreshold - bPros.length + bCons.length)
        });
    } else {
      return this.sectionByFunction(...this.getParams());
    }
  }

  /**
   * gets the params from the route
   * getting section by id / getting sections by status
   */
  private async mountFeed() {

    console.log('Section.ts Mount Feed');
    const query = this.$route.query;
    const queryKey = Object.keys(query)[0];
    this.sectionByKey = queryKey;
    this.sectionByValue = (<any>Object).values(query)[0];

    console.log('Section.ts Set sectionByFunction: this[' + queryKey + ']');
    this.sectionByFunction = this[queryKey];

    this.setPageStatus();
    this.setPageSectionId();

    this.isFeedIsDiscussion = DYNAMIC_PAGES.includes(this.pageStatus) && this.sectionByKey === enums.SECTION_BY.sectionById;
    this.buildComponentBySectionsStatus();
    this.setParentSectionId();
    this.$nextTick(function() {
      this.handleArgumentDisplay();
      this.scrollToArgument();
    });
  }

  private getParams() {
    const params = [this.sectionByValue];
    if ('id' in this.$route.query) {
      // @ts-ignore
      params.push(this.$route.query.id);
    }
    return params;
  }

  private setPageStatus() {
    this.pageStatus = this.sectionByKey === enums.SECTION_BY.sectionsByStatus ? this.sectionByValue : this.sections[0].status;
    if ('status' in this.$route.query) { this.pageStatus = this.$route.query.status; }

    if (this.pageStatus === enums.SECTION_STATUS.approved) { this.pageStatus = enums.SECTION_STATUS.edited; }
    this.pageStatus = parseInt(this.pageStatus);
  }

  private setPageSectionId() {
    this.pageSectionId = this.sectionByKey === enums.SECTION_BY.sectionById ? this.sectionByValue : 'id' in this.$route.query ? this.$route.query.id : this.initialParentId;
  }

  private setParentSectionId() {
    if (this.isParentSection(this.pageSectionId)) {
      this.parentSectionId = this.pageSectionId;
    } else {
      this.parentSectionId = this.sectionById(this.pageSectionId)[0].parentSectionId;
    }
  }

  // TODO: scrolling directive

  /**
   * scrolling to specifics argument
   */
  private scrollToArgument() {
    let sectionId;
    if (!this.$route.query.scrollTo) { return; }
    const id = this.$route.query.scrollId;
    if (this.$route.query.scrollTo === 'comment') {
      const argId = this.commentById(id).argumentId;
      sectionId = this.argumentById(argId).sectionId;
      eventBus.$emit('toggleArguments', { sectionId, toDisplay: true });
      eventBus.$emit('toggleComments', argId);
    } else if (this.$route.query.scrollTo === 'argument') {
      sectionId = this.argumentById(id).sectionId;
      eventBus.$emit('toggleArguments', { sectionId, toDisplay: true });
    } else {
      sectionId = id;
    }
    if (this.$refs[sectionId] === undefined) { return; }
    this.scrollingOptions.offset = this.$refs[sectionId][0].$el.clientHeight;
    // @ts-ignore
    VueScrollTo.scrollTo(this.$refs[sectionId][0].$el, 1500, this.scrollingOptions);
  }

  /**
   * get section Index from router
   * setting the nav bar of the component
   */
  private buildComponentBySectionsStatus() {
    this.sectionIndex = 'index' in this.$route.query ? parseInt(<string>this.$route.query.index) : 1;
    const navBarPref: NavBarInterface = {
      title: this.isFeedIsDiscussion ? 'דיון בהצעה' : this.getTitle()[this.pageStatus],
      color: this.getColor(this.pageStatus),
      icon: NAVBAR_SIDE_ICON.arrow_forward,
    };
    this.setNavBar(navBarPref);
  }

  /**
   * adds new section
   */
  private async addNewSection() {
    console.log('Section.ts Add New Section');
    if (!this.isSignedIn) {
      this.signIn();
    } else {
      this.checkUserProperties();
      const pushToParams = {
        type: 'section',
        action: Object.values(enums.STATIC_STATUS).includes(this.pageStatus) ? enums.FEED_TYPE.toEdit : this.pageStatus,
        sectionId: this.pageSectionId,
        parentSectionId: this.pageSectionId,
      };
      this.pushWithParams({ name: enums.ROUTE_NAME.addNew, params: pushToParams });
    }
  }

  private showAddButton() {
    return this.pageStatus === enums.FEED_TYPE.inTheVote || this.pageStatus === enums.FEED_TYPE.toEdit || this.pageStatus === enums.FEED_TYPE.sectionApproved || this.pageStatus === enums.FEED_TYPE.edited;
  }
  /**
   * get Nav Bar title by FEED_TYPE
   */
  private getTitle() {
    return {
      [enums.FEED_TYPE.inTheVote]: 'הצעות לסעיפים חדשים',
      [enums.FEED_TYPE.approved]: ` דיון על סעיף ${this.sectionIndex}`,
      [enums.FEED_TYPE.sectionApproved]: 'ההצעה התקבלה!',
      [enums.FEED_TYPE.toDelete]: ` הצבעה על מחיקת סעיף ${this.sectionIndex}`,
      [enums.FEED_TYPE.toEdit]: ` הצעות לשינוי סעיף ${this.sectionIndex}`,
      [enums.FEED_TYPE.deleted]: `ההצעה נמחקה!`,
      [enums.FEED_TYPE.edited]: `היסטוריית סעיף ${this.sectionIndex}`,
      [enums.FEED_TYPE.sectionEdited]: `ההצעה התקבלה!`,
      [enums.FEED_TYPE.rejected]: `הצעות שנדחו`,
    };
  }

  private navigateToRejectedFeed(): void {
    const path = this.getPath({
      name: enums.ROUTE_NAME.section,
      params: {
        [enums.SECTION_BY.sectionsByStatus]: enums.SECTION_STATUS.rejected,
        id: this.parentSectionId,
      },
    });

    this.setNavBar({ path: this.currentRoute.fullPath });
    this.push({ path });
  }

  private isRejectedFeed() {
    return this.pageStatus === enums.FEED_TYPE.rejected;
  }

  private handleArgumentDisplay() {
    if ((DYNAMIC_PAGES.includes(this.pageStatus) && !this.isFeedIsDiscussion) || this.pageStatus === enums.FEED_TYPE.rejected) {
      this.sections.forEach((section) => eventBus.$emit('toggleArguments', { sectionId: section.id, toDisplay: false }));
    } else {
      eventBus.$emit('toggleArguments', { sectionId: this.sections[0].id, toDisplay: true });
    }
  }
}
