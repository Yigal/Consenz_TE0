import * as storeHelper from '@/store/store.helper';
import { NAVBAR_COLOR, NavBarInterface, NAVBAR_SIDE_ICON } from '@/store/types';
import { Component, Vue, Provide, Prop } from 'vue-property-decorator';
import { mapActions, mapGetters, mapMutations } from 'vuex';
import { SectionInterface, MiniUserInterface, ParentSectionInterface, DocumentInterface, VotesInterface, uid } from '@/types/interfaces';
import * as enums from '@/types/enums';
import route from 'vue-router';

Component.registerHooks(['beforeRouteEnter', 'beforeRouteLeave', 'beforeRouteUpdate']);

@Component({})
export default class DocumentDraft extends Vue {
  @storeHelper.DocumentsModule.DocumentsGetter
  private document: DocumentInterface;
  @storeHelper.DocumentsModule.DocumentsGetter
  private documentTitle: string;
  @storeHelper.DocumentsModule.DocumentsGetter
  private documentId: string;
  @storeHelper.DocumentsModule.DocumentsGetter
  private documentDivisionOfTopics: boolean;
  @storeHelper.DocumentsModule.DocumentsGetter
  private voteOnDocument: boolean;
  @storeHelper.DocumentsModule.DocumentsGetter
  private documentPros: uid[];
  @storeHelper.DocumentsModule.DocumentsGetter
  private documentCons: uid[];
  @storeHelper.DocumentsModule.DocumentsGetter
  private documentProsConditional: uid[];
  @storeHelper.DocumentsModule.DocumentsGetter
  private documentConditionalSupport: boolean;

  @storeHelper.UsersModule.UsersGetter
  private isSignedIn: boolean;
  @storeHelper.UsersModule.UsersGetter
  private isNewUser: boolean;
  @storeHelper.UsersModule.UsersGetter
  private participantsSize: number;
  @storeHelper.UsersModule.UsersAction
  private signIn;
  @storeHelper.UsersModule.UsersAction
  private checkUserProperties;

  @storeHelper.RouterModule.RouterGetter
  private getPath: (object) => string;
  @storeHelper.RouterModule.RouterGetter
  private currentRoute;
  @storeHelper.RouterModule.RouterMutation
  private setTransitionName;
  @storeHelper.RouterModule.RouterAction
  private pushWithParams;
  @storeHelper.RouterModule.RouterAction
  private push;

  @storeHelper.DisplayModule.DisplayMutation
  private setNavBar;

  @storeHelper.SectionsModule.SectionsGetter
  public allSections: ParentSectionInterface[];
  @storeHelper.SectionsModule.SectionsGetter
  private sectionsByStatus: (number, string) => ParentSectionInterface[];
  @storeHelper.SectionsModule.SectionsGetter
  private initialParentId: string;
  @storeHelper.SectionsModule.SectionsAction
  private getSizeByStatus: (number) => number;

  @storeHelper.MainModule.MainGetter
  private isLoading: boolean;
  @storeHelper.MainModule.MainGetter
  private infoVideo: string;
  @storeHelper.MainModule.MainGetter
  private showInfoVideo: boolean;
  @storeHelper.MainModule.MainMutation
  private setShowInfoVideo;

  @storeHelper.VotingModule.VotingAction private addVote: (
    {
      // type: string;
      // object: SectionInterface | DocumentInterface,
      // vote: enums.VOTING_OPTIONS;
    },
  ) => VotesInterface;
  @storeHelper.VotingModule.VotingGetter
  private isUserVoted: boolean;
  @storeHelper.ArgumentsModule.ArgumentsGetter
  private argumentsSize: () => number;
  @storeHelper.CommentsModule.CommentsGetter
  private commentsSize: () => number;

  private inTheVoteSize: number = 0;
  private approvedSize: number = 0;
  private dialog: boolean = true;
  private enums = enums;

  public beforeRouteEnter(to, from, next) {
    /**
     * if the path is empty -> push to path with the full path
     */
    if (to.path === '/') {
      next((vm) =>
        vm.push({
          path: vm.getPath({ name: enums.ROUTE_NAME.draft, params: {} }),
        }),
      );
    } else { next(); }
  }
  private async mounted() {
    const navBarPref: NavBarInterface = {
      title: 'טיוטת המסמך',
      icon: NAVBAR_SIDE_ICON.menu,
      color: NAVBAR_COLOR.purple,
    };
    this.setNavBar(navBarPref);
    this.setTransitionName('slide-right');
    this.getSizes();
  }

  get sections() {
    console.log('Draft.ts Get Sections');
    const parentSectionInterfaces = this.sectionsByStatus(enums.SECTION_STATUS.approved, this.initialParentId);
    console.log('Draft.ts Parent Section Interfaces: ' + parentSectionInterfaces);
    const sections: ParentSectionInterface[] = parentSectionInterfaces;
    if (this.documentDivisionOfTopics) {
      const sortedSections = this.sortByTopics(this.sortByFirstVersionCreatedAt(sections));
      console.log('Draft.ts Sorted Sections: ' + sortedSections);
      return sortedSections;
    } else {
      const sortedSections = this.sortByFirstVersionCreatedAt(sections).map((section, index) => {
        Object.assign(section, {index: index + 1})
      });
      console.log('Draft.ts Sorted Sections (Null): ' + sortedSections);
      return {
        null: sortedSections,
      };
    }
  }

  public async getSizes() {
    const inTheVote = await this.getSizeByStatus(enums.SECTION_STATUS.inTheVote);
    const toEdit = await this.getSizeByStatus(enums.SECTION_STATUS.toEdit);
    this.inTheVoteSize = inTheVote + toEdit;
    console.log('Draft.ts inTheVoteSize = ' + this.inTheVoteSize);
    const approved = await this.getSizeByStatus(enums.SECTION_STATUS.approved);
    const edited = await this.getSizeByStatus(enums.SECTION_STATUS.edited);
    this.approvedSize = approved + edited;
    console.log('Draft.ts approvedSize = ' + this.approvedSize);
  }

  /**
   * sort the sections by createdAt of the first version:
   * if section has edited array, take the id and find the timesamp of the first version. if not -> take the timestamp of the section
   * @param {SectionInterface[]} sections status of the section
   *
   */
  private sortByFirstVersionCreatedAt(sections: ParentSectionInterface[]) {
    let sectionsByTimestamp: any[] = [];
    sections.map((section) => {
      if (section.edited && section.edited.length > 0) {
        // take the first version createdAt timestamp
        const id = section.edited[0];
        console.log("createdAt:::::", id, this.allSections, this.allSections[id])

        sectionsByTimestamp.push({
          timestamp: this.allSections[id].createdAt,
          section,
        });
      } else {
        sectionsByTimestamp.push({
          timestamp: section.createdAt,
          section,
        });
      }
    });
    sectionsByTimestamp = sectionsByTimestamp.sort((sectionA, sectionB) => 
    new Date(sectionA.timestamp).getTime() - new Date(sectionB.timestamp).getTime()).map((section) => section.section);
    return sectionsByTimestamp;
  }

  private sortByTopics(sections) {
    const sectionsByTopics = {};
    if (sections.length === 0) { return {}; }
    sections.forEach((section) => {
      if (!sectionsByTopics[section.topic]) { sectionsByTopics[section.topic] = []; }
      sectionsByTopics[section.topic].push(section);
    });
    return this.orderTopics(sectionsByTopics);
  }

  private orderTopics(sectionsByTopics) {
    const sectionsByTopicsWithOrder = {};
    sectionsByTopics['מבוא'] ? (sectionsByTopicsWithOrder['מבוא'] = sectionsByTopics['מבוא']) : null;
    Object.keys(sectionsByTopics).forEach((topic) => {
      if (topic !== 'מבוא' && topic !== 'סיכום') { sectionsByTopicsWithOrder[topic] = sectionsByTopics[topic]; }
    });
    sectionsByTopics['סיכום'] ? (sectionsByTopicsWithOrder['סיכום'] = sectionsByTopics['סיכום']) : null;
    let index = 0;
    Object.keys(sectionsByTopicsWithOrder).forEach((key) => {
      sectionsByTopicsWithOrder[key] = sectionsByTopicsWithOrder[key].map((section) => {
        index++;
        return Object.assign(section, { index });
      });
    });
    return sectionsByTopicsWithOrder;
  }

  //
  /**
   * check if section (parent) have status "toEdit" / "toDelete"
   * @param {SectionInterface} section
   * @param {number} status
   *
   */
  private isSectionHaveStatus(section: SectionInterface, status: number) {
    return section[Object.keys(enums.SECTION_STATUS)[status]].length > 0;
  }

  private voteOnNewSections(): void {
    const navbar = { path: this.currentRoute.fullPath };
    console.log('Draft.ts Set navbar ' + JSON.stringify(navbar));
    this.setNavBar(navbar);
    const path = this.getPath({
      name: enums.ROUTE_NAME.section,
      params: {
        sectionsByStatus: enums.SECTION_STATUS.inTheVote,
      },
    });
    console.log('Draft.ts Push path ' + path);
    this.push({ path });
    this.setShowInfoVideo();
  }

  /**
   * navigate to section page
   * @param {number} index the index of the section
   * @param {SectionInterface} section
   * @param {number} status
   *
   */
  private async navigateToSectionPage(index: number, status: number, section: SectionInterface) {
    const path = this.getPath({
      name: enums.ROUTE_NAME.section,
      params: {
        [enums.SECTION_BY.sectionsByStatus]: status,
        index: index + 1,
        id: section.id,
      },
    });
    this.setNavBar({ path: this.currentRoute.fullPath });
    this.push({ path });
    this.setShowInfoVideo();
  }

  /**
   * revision section (route to Add new page)
   * @param {SectionInterface} section
   * @param {number} nextStatus - toEdit / toDelete
   * @param {number} index
   *
   */
  private async navigateToAddNewPage(section: SectionInterface, nextStatus: number, index: number) {
    if (!this.isSignedIn) {
      this.signIn();
    } else {
      await this.checkUserProperties();
      this.pushWithParams({
        name: enums.ROUTE_NAME.addNew,
        params: {
          type: 'section',
          action: nextStatus,
          sectionId: section.id!,
          parentSectionId: section.id!,
          status: section.status,
        },
      });
    }
    this.setShowInfoVideo();
  }

  private async addVoteToDocument(vote) {
    if (!this.isSignedIn) {
      this.signIn();
    } else {
      await this.checkUserProperties();
      this.addVote({ type: 'document', object: this.document, vote });
    }
  }
}
