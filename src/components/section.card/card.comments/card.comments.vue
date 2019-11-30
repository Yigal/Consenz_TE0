<template>
  <div v-if="isDisplayed">
    <div class="card-action-div arguments_container" v-show="isDisplayed">
      <v-list>
        <div class="mr-4 pr-2" :style="{'border-right': '1.5px solid #d1c3dc'}">
          <div v-for="(comment) in commentsByArgumentId(argumentId)" :key="comment.id">
            <v-layout column>
              <v-layout
                column
                v-bind:style="[{'border-top': ' 2px solid'}, {'border-color': `${getBorderTopColor(comment.type)}`}]"
              >
                <content-box
                  :item="comment"
                  :itemContent="comment.content"
                  :itemContentHtml="comment.contentHtml"
                ></content-box>
              </v-layout>
            </v-layout>
          </div>
        </div>
        <div>
          <v-layout
            class="btn_arguments"
            column
            justify-end
            mr-4
            mt-3
            pr-1
            pt-1
            v-bind:style="{'border-top': '1px solid #d1d1d1'}"
          >
            <v-layout justify-end>
              <v-btn :disabled="isDisabled" @click="addComment()" class="bcp80 cw">הוספת תגובה</v-btn>
            </v-layout>
          </v-layout>
        </div>
      </v-list>
    </div>
  </div>
</template>


<script lang="ts">
import { eventBus } from '@/main';
import Vue from 'vue';
import Component from 'vue-class-component';
import {
  DisplayModule,
  RouterModule,
  SectionsModule,
  ArgumentsModule,
  UsersModule,
  VotingModule,
  CommentsModule,
} from '@/store/store.helper';
import { CommentInterface, SectionInterface } from '@/types/interfaces';
import contentBox from '@/components/content.box/content.box.vue';
import * as enums from '@/types/enums';
import { Prop } from 'vue-property-decorator';

@Component({
  components: {
    'content-box': contentBox,
  },
})
export default class cardComments extends Vue {
  @Prop() public argumentId: String;
  @Prop() public isDisabled: Boolean;
  @ArgumentsModule.ArgumentsGetter private argumentById;
  @SectionsModule.SectionsGetter private sectionById: (
    string,
  ) => SectionInterface[];
  @DisplayModule.DisplayGetter private getBorderTopColor;
  @UsersModule.UsersGetter private isSignedIn;
  @UsersModule.UsersAction private signIn;
  @UsersModule.UsersAction private checkUserProperties;
  @RouterModule.RouterAction private pushWithParams;
  @CommentsModule.CommentsGetter private commentsByArgumentId: (
    string,
  ) => CommentInterface[];

  private isDisplayed: boolean = false;
  private comments: CommentInterface[] = [];

  private created() {
    eventBus.$on('toggleComments', (argumentId) => {
      if (this.argumentId === argumentId) { this.toggleComments(); }
    });
  }

  private toggleComments() {
    this.isDisplayed = !this.isDisplayed;
  }

  private async addComment() {
    if (!this.isSignedIn) {
      this.signIn();
    } else {
      await this.checkUserProperties();
      const sectionId = this.argumentById(this.argumentId).sectionId;
      const pushToParams = {
        argumentId: this.argumentId,
        sectionId,
        parentSectionId: this.sectionById(sectionId)[0].parentSectionId,
        type: 'comment',
        action: 'addComment',
      };
      this.pushWithParams({
        name: enums.ROUTE_NAME.addNew,
        params: pushToParams,
      });
    }
  }
}
</script>