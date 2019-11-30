<template>
  <v-card-text class="bbg mf">
    <div class="text-xs-right">
      <span class="none">
        <p ref="sectionContent" v-if="'contentHtml' in section" v-html="section.contentHtml"></p>
        <span ref="sectionContent" v-else>{{section.content}}</span>
        <p ref="sectionContentPrev" v-html="previousContent"></p>
      </span>
      <div class="my-body-2" v-if="!switched">
        <p v-html="getContent()"></p>
      </div>
      <div v-else>
        <p v-if="'contentHtml' in section && section.contentHtml" v-html="section.contentHtml"></p>
        <p v-else>{{ section.content }}</p>
      </div>
    </div>
    <content-box :item="section"></content-box>
  </v-card-text>
</template>

<script lang="ts">
import { eventBus } from '@/main';
import * as enums from '@/types/enums';
import { SectionInterface } from '@/types/interfaces';
import moment from 'moment';
import Vue from 'vue';
import Component from 'vue-class-component';
import { mapGetters } from 'vuex';
import {
  DisplayModule,
  SectionsModule,
  UsersModule,
} from '@/store/store.helper';
import contentBox from '@/components/content.box/content.box.vue';
import { Prop } from 'vue-property-decorator';
import HtmlDiff from 'htmldiff-js';
let HtmlDiffer = require('html-differ').HtmlDiffer,
  htmlDiffer = new HtmlDiffer({
    ignoreAttributes: [],
    compareAttributesAsJSON: [],
    ignoreWhitespaces: true,
    ignoreComments: true,
    ignoreEndTags: false,
    ignoreDuplicateAttributes: false,
  });

@Component({
  components: {
    'content-box': contentBox,
  },
})
export default class CardText extends Vue {
  @Prop() public section: SectionInterface;
  @Prop() public pageStatus: Number;
  @Prop() public parentSectionId: String;
  @Prop() public isAddingNewArgument: Boolean;
  @Prop() public editor;

  private switched: boolean = true;
  @SectionsModule.SectionsGetter private sectionById: (
    string,
  ) => SectionInterface[];
  private mounted: boolean = false;

  @UsersModule.UsersGetter private participantDisplayNameById: (
    string,
  ) => string;
  @DisplayModule.DisplayGetter private dateFormatted;

  public created() {
    eventBus.$on('switchDisplays', (sectionId) => {
      if (this.section.id === sectionId) { this.switched = !this.switched; }
    });
    if (
      this.pageStatus === enums.FEED_TYPE.toEdit ||
      this.pageStatus === enums.FEED_TYPE.sectionEdited ||
      this.isAddingNewArgument ||
      this.section.status === enums.SECTION_STATUS.toEdit
    ) {
      eventBus.$emit('switchDisplays', this.section.id);
    }
    this.$nextTick(() => {
      this.mounted = true;
    });
  }

  get previousContent() {
    if (!this.editor) {
      this.isAddingNewArgument = false;
      return this.sectionById(this.parentSectionId)[0]
        ? 'contentHtml' in this.sectionById(this.parentSectionId)[0]
          ? this.sectionById(this.parentSectionId)[0].contentHtml
          : '<p>' + this.sectionById(this.parentSectionId)[0].content + '</p>'
        : '';
    } else {
      return this.editor.getHTML();
    }
  }

  /**
   * if page status is toEdit - get the highlighted content
   */
  private getContent() {
    if (this.mounted) {
      return !this.isAddingNewArgument
        ? this.highlightContent(
            this.$refs.sectionContent,
            this.$refs.sectionContentPrev,
          )
        : this.highlightContent(
            this.$refs.sectionContentPrev,
            this.$refs.sectionContent,
          );
    }
  }

  /**
   * return HTML tag
   * @param {string} newElem
   * @param {string} oldElem
   */
  private highlightContent(newElem, oldElem) {
    let diff = htmlDiffer.diffHtml(newElem.innerHTML, oldElem.innerHTML);
    let isEqual = htmlDiffer.isEqual(newElem.innerHTML, oldElem.innerHTML);
    let span = '<span>';
    diff.forEach(function(part) {
      const tag = part.added ? 'ins' : part.removed ? 'del' : 'span';
      span += `<${tag}>${part.value}</${tag}>`;
    });

    return span;
  }
}
</script>

<style lang="scss">
@import "@/main.scss";

del {
  color: $blue-pro !important;
  font-weight: bold;
  text-decoration-line: none !important;
}

ins {
  color: $red-con !important;
  font-weight: bold !important;
  text-decoration-line: line-through !important;
}
.none {
  display: none;
}
</style>
