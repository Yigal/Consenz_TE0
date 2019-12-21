import { SECTION_STATUS } from './../../types/enums';
import { SectionInterface } from '@/types/interfaces';
import { SectionsModule, ArgumentsModule, CommentsModule } from './../../store/store.helper';
import CardText from '@/components/section.card/card.text/card.text.vue';
import CardTitle from '@/components/section.card/card.title/card.title.vue';
import textEditor from '@/components/text.editor/text.editor.vue';
import { Editor } from 'tiptap';
import { Placeholder } from 'tiptap-extensions';
import CustomLink from '@/costumes/custom.link';
import { DisplayModule, RouterModule, DocumentsModule } from '@/store/store.helper';
import { NavBarInterface, NAVBAR_SIDE_ICON } from '@/store/types';
import * as enums from '@/types/enums';
import { Component, Vue, Watch } from 'vue-property-decorator';

@Component({
  components: {
    CardTitle,
    CardText,
    'text-editor': textEditor,
  },
})
export default class AddNew extends Vue {
  @DisplayModule.DisplayGetter private getColor;
  @DisplayModule.DisplayMutation private setNavBar;

  @RouterModule.RouterGetter private lastRoute;
  @RouterModule.RouterGetter private getPath;
  @RouterModule.RouterAction private push;
  @RouterModule.RouterAction private goBack;

  @DocumentsModule.DocumentsGetter private documentTopics;
  @DocumentsModule.DocumentsGetter private documentId;
  @DocumentsModule.DocumentsGetter private documentDivisionOfTopics;
  @DocumentsModule.DocumentsAction private addTopic;

  @SectionsModule.SectionsGetter private sectionById;
  @SectionsModule.SectionsAction private addSection;

  @SectionsModule.SectionsAction private updateParentSection;

  @ArgumentsModule.ArgumentsAction private addArgument;
  @ArgumentsModule.ArgumentsAction private updateArgument;

  @CommentsModule.CommentsAction private addComment;

  private handler;
  private objectToAdd: string = '';
  private sectionId: string | null = '';
  private action: number | string;
  private title: string = '';
  private btnText: string = '';
  private mainColor: string = '';
  private placeholderText: string = '';
  private input: string = '';
  private contentHtml: string = '';
  private tag: string = '';
  private loading: boolean = false;
  private notificationsOff: boolean = false;
  private sectionStatus: number;
  private section: SectionInterface;
  private argumentId: string | null;
  private parentSectionId: string | null = null;
  private topic: string | null = 'מבוא';
  private valid: boolean = true;
  private inputRules: any[] = [(v) => !!v || 'אנא הכנס שם', (v) => /([^\s])/.test(v) || 'אנא הכנס שם'];
  private topicRules: any[] = [(v) => !!v || 'אנא בחר נושא'];
  private enums = enums;
  private editor: any = {};
  private showEditorMenu: boolean = false;

  private created() {
    this.editor = new Editor({
      extensions: [
        new CustomLink(),
        new Placeholder({
          emptyNodeClass: 'is-empty',
          emptyNodeText: 'Write something …',
          showOnlyWhenEditable: true,
        }),
      ],
      content: ``,
    });
    this.getParamsFromRoute();
    const navBarPref: NavBarInterface = {
      title: '',
      color: this.getColor(this.action),
      icon: NAVBAR_SIDE_ICON.close,
    };
    this.buildComponent(navBarPref);
  }

  private buildComponent(navBarPref) {
    this.editor.clearContent();
    this.setNavBar(navBarPref);
    this.getPropsByType();
    this.editor.extensions.options.placeholder.emptyNodeText = this.placeholderText;
  }

  private getParamsFromRoute() {
    this.objectToAdd = this.$route.params.type; // argument / section / comment
    this.action = this.$route.params.action; // addArgument / addSection / addComment
    this.parentSectionId = this.$route.params.parentSectionId;
    this.sectionId = this.$route.params.sectionId;
    if (this.sectionId !== undefined) {
      this.section = this.sectionById(this.sectionId)[0];
    }
    this.sectionStatus = this.section ? this.section.status : enums.SECTION_STATUS.inTheVote;
    this.argumentId = this.$route.params.argumentId ? this.$route.params.argumentId : null;
  }

  private getPropsByType() {
    switch (this.objectToAdd) {
      case 'section':
        this.handler = this.addSectionToDB;
        switch (this.action) {
          case enums.SECTION_STATUS.inTheVote:
            this.title = 'הוספת הצעה לסעיף חדש';
            this.placeholderText = 'נוסח סעיף חדש';
            this.btnText = 'המשך להוספת טיעון';
            break;
          case enums.SECTION_STATUS.toEdit:
            this.title = 'נוסח ההצעה שלי:';
            if ('contentHtml' in this.section) {
              this.editor.setContent(this.section.contentHtml);
            } else {
              this.editor.setContent('<p>' + this.section!.content + '</p>');
            }
            this.placeholderText = '';
            this.btnText = 'הוספה';
            break;
          case enums.SECTION_STATUS.toDelete:
            this.title = 'הצעה למחיקת סעיף';
            this.placeholderText = 'למה צריך למחוק את הסעיף?';
            this.btnText = 'פרסום והצבעה';
            break;
        }
        break;
      case 'argument':
        this.handler = this.addArgumentToDB;
        switch (this.action) {
          case 'pros':
            this.title = 'הוספת טיעון בעד';
            this.placeholderText = 'זה המקום לנמק ולשכנע - למה כדאי להצביע בעד ההצעה?';
            this.btnText = 'פרסום והצבעה';
            break;
          case 'cons':
            this.title = 'הוספת טיעון נגד';
            this.placeholderText = 'זה המקום לנמק ולשכנע - למה כדאי להצביע נגד ההצעה?';
            this.btnText = 'פרסום והצבעה';
            break;
          case 'comment':
            this.title = 'הוספת תגובה';
            this.placeholderText = '';
            this.btnText = 'פרסום';
            break;
        }
        break;
      case 'comment':
        this.title = 'הוספת תגובה לטיעון';
        this.placeholderText = '';
        this.btnText = 'פרסום';
        this.handler = this.addCommentToDb;
        break;
    }
  }

  private isValid() {
    const input = this.editor
      .getHTML()
      .replace(/<[^>]*>/g, ' ')
      .replace(/\s{2,}/g, ' ');
    const parentSection = this.sectionById(this.parentSectionId)[0];
    let isValid;
    if (parentSection !== undefined) {
      isValid = parentSection.content === input ? false : true;
    } else { isValid = true; }
    return input.length > 1 && isValid;
  }
  /**
   * adding argument / section
   */
  private async submit() {
    const form: any = this.$refs.form;
    if (form.validate()) {
      this.$ga.event('info', this.documentId, `adding-${this.objectToAdd}`, 0); // Google Analytics Event
      this.loading = true;
      this.contentHtml = this.editor.getHTML(); // HTML content that contains text editor
      this.input = this.editor
        .getHTML()
        .replace(/<[^>]*>/g, ' ')
        .replace(/\s{2,}/g, ' ');

      const path = await this.handler(); // runs the Add Argument logic
      if (path == null) { return; }
      this.push({ path });
      this.editor.destroy();
    }
  }

  private topicErrors() {
    const errors: string[] = [];
    !this.topic && this.documentDivisionOfTopics ? errors.push('אנא בחר נושא') : null;
    return errors;
  }

  private inputErrors() {
    const errors: string[] = [];
    this.input !== '' ? errors.push('אנא כתוב') : null;
    return errors;
  }

  /**
   * Add section with 'toEdit' status
   */
  private async addSectionToEdit() {
    console.log('AddNew.addSectionToEdit() Add Section To Edit');
    const newSectionId = await this.createNewSection();

    this.reloadPageToAddArgument(newSectionId, enums.SECTION_STATUS.toEdit);
    return null;
  }

  /**
   * Add section with 'toDelete' status
   */
  private async addSectionToDelete() {
    this.notificationsOff = true;
    const newArgId = await this.addArgument({
      content: this.input,
      contentHtml: this.contentHtml,
      sectionId: this.parentSectionId,
      type: true,
    });
    const newSectionId = await this.createNewSection(newArgId);

    return this.getPathByAction(newSectionId, newSectionId);
  }

  /**
   * Add section with 'inTheVote' status
   */
  private async addSectionInTheVote() {
    console.log('AddNew.addSectionInTheVote() Add Topic ' + this.topic);
    await this.addTopic(this.topic);
    const newSectionId = await this.addSection({
      content: this.input,
      contentHtml: this.contentHtml,
      parentSectionId: this.parentSectionId,
      tag: this.tag,
      status: this.sectionStatus,
      toDelete: [],
      deleted: [],
      toEdit: [],
      edited: [],
      topic: this.documentDivisionOfTopics ? this.topic : null,
    });

    console.log('AddNew.addSectionInTheVote() Reload Page To AddArgument');
    this.reloadPageToAddArgument(newSectionId, enums.SECTION_STATUS.inTheVote);
    return null;
  }

  private async addSectionToDB() {
    switch (this.action) {
      case enums.SECTION_STATUS.inTheVote:
        return this.addSectionInTheVote();
      case enums.SECTION_STATUS.toDelete:
        return this.addSectionToDelete();
      case enums.SECTION_STATUS.toEdit:
        return this.addSectionToEdit();
    }
  }

  /**
   * Add argument to section
   */
  private async addArgumentToDB() {
    const newArgId = await this.addArgument({// This syncs with firebase
      content: this.input,
      contentHtml: this.contentHtml,
      sectionId: this.sectionId,
      type: this.action === 'comment' ? null : this.action !== enums.VOTING_OPTIONS.cons,
    });
    if (!newArgId) { return; }

    this.setNavBar({
      path: this.getPath({
        name: enums.ROUTE_NAME.section,
        params: {
          [enums.SECTION_BY.sectionsByStatus]: this.section.status,
          index: 1,
          id: this.section.parentSectionId,
        },
      }),
    });
    return this.getPathByAction(this.sectionId, newArgId);
  }

  /**
   * Add comment to section
   */

  private async addCommentToDb() {
    const newCommentId = await this.addComment({
      content: this.input,
      contentHtml: this.contentHtml,
      sectionId: this.sectionId,
      argumentId: this.argumentId,
    });

    return this.getPathByAction(this.sectionId, newCommentId);
  }

  /**
   * reload the page to add argument after adding section
   * @param newSectionId new section Id
   * @param status status of the section
   */
  private reloadPageToAddArgument(newSectionId: string, status: number) {
    this.notificationsOff = true;
    this.objectToAdd = 'argument';
    this.action = enums.VOTING_OPTIONS.pros;
    this.parentSectionId = this.sectionId;
    this.sectionId = newSectionId;
    this.section = this.sectionById(newSectionId)[0];
    this.input = '';
    this.loading = false;
    this.sectionStatus = status;
    this.buildComponent({ color: this.getColor(this.action) });
  }

  /**
   * create new section in case of toDelete / toEdit
   * @param newArgId if toEdit
   */
  private async createNewSection(newArgId?): Promise<string> {
    const section = this.sectionById(this.sectionId)[0];
    const content = this.action === enums.SECTION_STATUS.toDelete ? section.content : this.input;
    const newSectionId: string = await this.addSection({
      content,
      contentHtml: this.contentHtml,
      topic: this.documentDivisionOfTopics ? section.topic : null,
      parentSectionId: this.parentSectionId,
      status: this.action,
    });
    const updateObj = {
      parentSectionId: this.parentSectionId,
      sectionId: newSectionId,
      newStatus: this.action,
      prevStatus: this.section.status,
      acceptedByEditor: null,
    };

    this.updateParentSection(updateObj);
    if (newArgId) {
      await this.updateArgument({
        id: newArgId,
        updateObject: { sectionId: newSectionId },
      });
    }
    return newSectionId;
  }

  //
  /**
   * gets the path of the next route
   * @param {string} sectionId
   */
  private getPathByAction(sectionId, scrollId) {
    return this.getPath({
      name: enums.ROUTE_NAME.section,
      params: {
        [enums.SECTION_BY.sectionById]: sectionId,
        scrollId,
        scrollTo: this.objectToAdd,
      },
    });
  }

}
