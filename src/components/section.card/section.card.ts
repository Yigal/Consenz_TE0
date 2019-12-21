import { DocumentInterface } from './../../types/interfaces';
import { MiniUserInterface } from './../../types/interfaces';
import { VOTING_OPTIONS } from '@/types/constants';
import { eventBus } from '@/main';
import { SECTION_STATUS } from '@/types/enums';
import Vue from 'vue';
import Component from 'vue-class-component';
import { mapGetters, mapMutations } from 'vuex';
import CardArguments from './card.arguments/card.arguments.vue';
import CardText from './card.text/card.text.vue';
import CardTitle from './card.title/card.title.vue';
import CardVoting from './card.voting/card.voting.vue';
import { DisplayModule, RouterModule, SectionsModule, UsersModule, VotingModule, DocumentsModule } from '@/store/store.helper';
import { SectionInterface, VotesInterface } from '@/types/interfaces';
import * as enums from '@/types/enums';
import { Prop } from 'vue-property-decorator';
// The @Component decorator indicates the class is a Vue component
@Component({
  computed: {
    ...mapGetters({
      sectionById: 'sectionsModule/sectionById',
    }),
  },
  // All component options are allowed in here
  components: {
    CardTitle,
    CardText,
    CardVoting,
    CardArguments,
  },
  props: {},
})
export default class SectionCard extends Vue {
  @Prop() public pageStatus: Number;
  @Prop() public sectionIndex: Number;
  @Prop() public index: Number;
  @Prop() public section: SectionInterface;
  @Prop() public parentSectionId: String;
  @Prop() public sectionsLength: Number;
  @Prop() public isAddingNewArgument: Boolean;
  @Prop() public isRejectedFeed: Function;
  @Prop() public isFeedIsDiscussion: Boolean;

  private previousSection;
  private sectionById;
  private switched: boolean;

  @DocumentsModule.DocumentsGetter private documentEditors;

  @RouterModule.RouterGetter public currentRoute;
  @RouterModule.RouterGetter public getPath;
  @RouterModule.RouterAction private push;

  @DisplayModule.DisplayMutation public setNavBar;

  @SectionsModule.SectionsGetter public isParentSection;
  @SectionsModule.SectionsGetter private isDynamicFeed: (pageStatus) => boolean;

  @UsersModule.UsersGetter private isSignedIn;
  @UsersModule.UsersGetter private user: MiniUserInterface;
  @UsersModule.UsersAction private checkUserProperties;
  @UsersModule.UsersAction private signIn;

  @VotingModule.VotingGetter private isSectionReachedToThreshold: (SectionInterface, VotesInterface) => boolean;
  @VotingModule.VotingAction private addVote;
  @VotingModule.VotingAction private endVoting: ({ section: SectionInterface, parentSectionId: string, sectionIndex: number }) => Promise<any>;
  @VotingModule.VotingAction private updateAll: ({ updatedVotes: VotesInterface, section: SectionInterface, parentSectionId: string }) => Promise<any>;
  @VotingModule.VotingAction private addPrivilegeVote: ({ section: SectionInterface, parentSectionId: string, vote: VOTING_OPTIONS }) => Promise<any>;

  private loading: boolean = false;
  private isDisplayed = false;
  private privilegeEditorCheckbox: boolean = false;

  public created() {
    if (this.pageStatus === SECTION_STATUS.toEdit) {
      this.initSwitch();
      this.previousSection = this.sectionById(this.parentSectionId);
    }
    eventBus.$emit('switchDisplays', this.section.id);
    eventBus.$on('toggleArguments', (payload) => {
      const { sectionId, toDisplay } = payload;
      if (this.section.id === sectionId) {
        if ('toDisplay' in payload) {
          this.isDisplayed = toDisplay;
        } else { this.toggleArguments(); }
      }
    });
  }

  get isUserEditor() {
    return this.isSignedIn && this.documentEditors ? this.documentEditors.includes(this.user.notifications.mailAddress) : false;
  }

  private toggleArguments() {
    this.isDisplayed = !this.isDisplayed;
  }

  private initSwitch() {
    this.switched = true;
  }

  /**
   * adding vote to section
   * @param {string} vote
   */
  private async onUserVoted(vote: enums.VOTING_OPTIONS) {// triggered by userVoted event
    if (!this.isSignedIn) {
      this.signIn();
    } else {
      console.log('User Voted: ' + JSON.stringify(vote));
      await this.checkUserProperties();
      // If this user is privileged (super user) than his breaks the vote
      if (this.privilegeEditorCheckbox) { return this.activatePrivilege(vote); }
      const updatedVotes = await this.addVote({ type: 'section', object: this.section, vote });
      // await this.checkUserProperties(vote);
      // const updatedVotes = await this.addVote({ section: this.section, vote });

      // Check if voting reached terminate condition
      if (this.isSectionReachedToThreshold(this.section, updatedVotes)) {
        // Update all according to consenses logic
        await this.updateAll({
          updatedVotes,
          section: this.section,
          parentSectionId: this.parentSectionId,
        });
        // Finish Voting
        await this.endVoting({
          section: this.section,
          parentSectionId: this.parentSectionId,
          sectionIndex: this.sectionIndex
        });
      } else if (!this.isSectionReachedToThreshold(this.section, updatedVotes) && this.isParentSection(this.parentSectionId)) {
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
      this.loading = false;
      eventBus.$emit('toggleArguments', { sectionId: this.section.id, toDisplay: true });
    }
  }

  private async activatePrivilege(vote: enums.VOTING_OPTIONS) {
    await this.addPrivilegeVote({ section: this.section, parentSectionId: this.parentSectionId, vote });
    await this.endVoting({
      section: this.section,
      parentSectionId: this.parentSectionId,
      sectionIndex: this.sectionIndex,
    });
  }
}
