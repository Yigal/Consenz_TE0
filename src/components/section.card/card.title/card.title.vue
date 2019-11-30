<template>
  <v-card-title v-colorDirective="{color: pageStatus}" class="bbg mf">
    <v-layout row justify-space-between align-center>
      <div v-switch="pageStatus">
        <h1 class="my-title bold" v-case="enums.FEED_TYPE.sectionApproved">
          סעיף
          {{ index + 1 }}
        </h1>

        <h1 class="my-title bold" v-case="enums.FEED_TYPE.approved">
          סעיף
          {{ index + 1 }}
        </h1>

        <h3 v-case="enums.FEED_TYPE.sectionEdited">
          סעיף {{ index + 1 }}
          <span v-bind:style="{ color: '#000', fontSize: '0.95em' }">
            התקבל ב-{{ dateFormatted(sectionAcceptedAt).time }}
            &#8226;
            {{ dateFormatted(sectionAcceptedAt).date }}
          </span>
        </h3>

        <h1 class="my-title bold" v-case="enums.FEED_TYPE.deleted">
          סעיף
          {{ index + 1 }}
        </h1>

        <h2 class="my-title bold" v-case="enums.FEED_TYPE.inTheVote">נוסח הסעיף המוצע</h2>

        <h2 class="my-title bold" v-case="enums.FEED_TYPE.toDelete">
          הצבעה
          {{ index + 1 }}
        </h2>

        <h3 class v-case="enums.FEED_TYPE.edited">
          גרסה
          {{ sectionsLength - index }}:
          <span
            v-bind:style="{ color: '#000', fontSize: '0.95em' }"
          >
            התקבלה ב-{{ dateFormatted(sectionAcceptedAt).time }}
            &#8226;
            {{ dateFormatted(sectionAcceptedAt).date }}
          </span>
        </h3>

        <h3 class v-case="enums.FEED_TYPE.rejected">
          <span v-bind:style="{ color: '#000', fontSize: '0.95em' }">
            נדחתה ב-{{ dateFormatted(sectionRejectedAt).time }}
            &#8226;
            {{ dateFormatted(sectionRejectedAt).date }}
          </span>
        </h3>

        <h2
          class="my-title bold"
          v-case="enums.FEED_TYPE.toEdit"
          v-if="isInAddComponent"
        >נוסח הסעיף המקורי</h2>

        <h2 class="my-title bold" v-case="enums.FEED_TYPE.toEdit" v-else>נוסח ההצעה:</h2>
      </div>

      <v-flex>
        <v-layout justify-end align-end column>
          <div v-if="documentDivisionOfTopics" class="pr-3 pb-1">
            <p :style="{ 'font-size': '1.2rem'}">{{sectionTopic}}</p>
          </div>
          <div v-if="pageStatus === enums.FEED_TYPE.toEdit">
            <v-switch :label="'תצוגת שינויים'" color="purple" height="2px" v-model="isSwitched"></v-switch>
          </div>
        </v-layout>
      </v-flex>
    </v-layout>
  </v-card-title>
</template>

<script lang="ts">
import { eventBus } from '@/main';
import { DisplayModule, DocumentsModule } from '@/store/store.helper';
import moment from 'moment';
import Vue from 'vue';
import Component from 'vue-class-component';
import * as enums from '@/types/enums';
import { Watch } from 'vue-property-decorator';
import { colorDirective } from '@/directives/color-directive';

// The @Component decorator indicates the class is a Vue component
@Component({
  // All component options are allowed in here
  directives: {
    colorDirective,
  },
  props: {
    pageStatus: Number,
    sectionIndex: Number,
    index: Number,
    sectionId: String,
    isInAddComponent: Boolean,
    sectionAcceptedAt: Date,
    sectionRejectedAt: Date,
    sectionsLength: Number,
    sectionTopic: String,
  },
})
export default class CardTitle extends Vue {
  // Initial data can be declared as instance properties
  @DisplayModule.DisplayGetter private dateFormatted;
  @DocumentsModule.DocumentsGetter
  private documentDivisionOfTopics: boolean;

  private isSwitched: boolean = true;
  private pageStatus;
  private sectionId;
  private sectionAcceptedAt;
  private sectionTopic;
  private enums = enums;
  @Watch('isSwitched')
  private onSwitchChange(newVal: any) {
    this.switchDisplays();
  }
  public switchDisplays() {
    eventBus.$emit('switchDisplays', this.sectionId);
  }
}
</script>

<style lang="sass"></style>
