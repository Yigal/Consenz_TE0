s<template>
  <v-card-text class="card-actions">
    <v-layout justify-space-between class="card-action-div">
      <v-layout
        justify-start
        align-start
        column
        class="timer bold cmp"
        v-if="!isRejectedFeed() && isDynamicFeed(pageStatus)"
      >
        <!-- <img src="../../../assets/timer.png"> -->
        <span class>ההצבעה פתוחה לעוד:</span>
        <v-layout align-end>
          <span>
            <v-icon color="purple">timer</v-icon>
          </span>
          <span class="timer-spacing">{{deadline}}</span>
        </v-layout>
        <div>
          <span>שניות | דקות | שעות | ימים</span>
        </div>
      </v-layout>
      <span v-if="isDynamicFeed(pageStatus)">
        <span class="bold">{{ section.threshold - section.pros.length + section.cons.length }}</span>
        תומכים חסרים לאישור
      </span>
    </v-layout>
    <div class="btn_container">
      <v-layout
        justify-space-between
        v-if="!('acceptedByEditor' in section) || section.acceptedByEditor === null"
      >
        <div v-for="(vote, voteIndex) in votingOptionsKeys" :key="voteIndex">
          <v-btn
            large
            :disabled="!isDynamicFeed(pageStatus) || isSectionReachedToThreshold(section, {pros: section.pros, cons: section.cons})"
            :loading="loading"
            @click.exact="voteClicked(vote)"
            @click.native="loader = 'loading'"
            v-bind:class="isUserVoted(section, vote) ? `user-voted-${vote}` : ''"
            v-colorDirective="{backgroundColor: vote}"
          >
            <span>
              <v-layout justify-space-around>
                <span v-if="!isDynamicFeed(pageStatus)" class="pl-3">
                  <!-- <span> -->
                  <span v-if="vote === 'pros'">תמכו</span>
                  <span v-else>התנגדו</span>
                  <!-- </span> -->
                </span>
                <span v-else class="pl-3">
                  <span>
                    <span v-if="vote === 'pros'">בעד</span>
                    <span v-else>נגד</span>
                  </span>
                  <span v-if="section.status === 'toDelete'">
                    <span>&nbsp; מחיקה</span>
                  </span>
                </span>
                <span class="pr-1" v-bind:style="{ 'fontWeight': '200' }">{{ section[vote].length }}</span>
              </v-layout>
            </span>
          </v-btn>
        </div>
      </v-layout>
      <v-layout justify-center v-else>
        <span v-if="isRejectedFeed()">נדחתה</span>
        <span v-else>אושרה</span>
        <span class="mr-1">על ידי {{participantDisplayNameById(section.acceptedByEditor)}}</span>
      </v-layout>
    </div>
  </v-card-text>
</template>

<script lang="ts">
import {
  DisplayModule,
  RouterModule,
  SectionsModule,
  VotingModule,
  UsersModule,
  NotificationsModule,
  DocumentsModule,
} from '@/store/store.helper';
import { SectionInterface, VotesInterface } from '@/types/interfaces';
import * as enums from '@/types/enums';
import Vue from 'vue';
import Component from 'vue-class-component';
import { mapActions, mapGetters, mapMutations } from 'vuex';
// import { UsersModule } from "../../../store/modules/UsersModule";
import moment from 'moment';
import { colorDirective } from '@/directives/color-directive';
import { Prop } from 'vue-property-decorator';

@Component({
  directives: {
    colorDirective,
  },
  props: {},
})
export default class CardVoting extends Vue {
  @Prop() public section: SectionInterface;
  @Prop() public sectionIndex: Number;
  @Prop() public parentSectionId: String;
  @Prop() public pageStatus: Number;
  @Prop() public open: Boolean;
  @Prop() public isRejectedFeed: Function;

  @RouterModule.RouterGetter public currentRoute;
  @RouterModule.RouterGetter public getPath;
  @RouterModule.RouterAction private push;

  @DisplayModule.DisplayMutation public setNavBar;

  @DocumentsModule.DocumentsGetter private documentId;

  @SectionsModule.SectionsGetter public isParentSection;
  @SectionsModule.SectionsGetter private getDeadline: (Date) => number;
  @SectionsModule.SectionsGetter private isDynamicFeed: (pageStatus) => boolean;
  @SectionsModule.SectionsGetter private isSectionsInRevisions;

  @UsersModule.UsersGetter private userUid;
  @UsersModule.UsersGetter private isSignedIn;
  @UsersModule.UsersGetter private participantDisplayNameById;
  @UsersModule.UsersAction private checkUserProperties;
  @UsersModule.UsersAction
  private signIn;

  @NotificationsModule.NotificationsAction private sendParallelNotifications;

  @VotingModule.VotingGetter private isUserVoted;
  @VotingModule.VotingGetter private votingOptionsKeys;
  @VotingModule.VotingGetter private isSectionReachedToThreshold: (
    SectionInterface,
    VotesInterface,
  ) => boolean;
  @VotingModule.VotingAction private addVote: ({
    section: SectionInterface,
    vote: VOTING_OPTIONS,
  }) => VotesInterface;
  @VotingModule.VotingAction private updateAll: ({
    updatedVotes: VotesInterface,
    section: SectionInterface,
    parentSectionId: string,
  }) => Promise<any>;
  @VotingModule.VotingAction private endVoting: ({
    updatedVotes: VotesInterface,
    section: SectionInterface,
    parentSectionId: string,
    sectionIndex: number,
  }) => Promise<any>;
  private loading: boolean = false;
  public deadline = '';

  public mounted() {
    this.getTimer(this.section.deadline, this.section.timer);
  }
  /**
   * adding vote to section
   * @param {string} vote
   */
  private async voteClicked(vote: string) {// user has voted
    this.$ga.event('info', this.documentId, 'vote', 0); // Google Analytics
    this.loading = true; // Loading visualization
    await this.$emit('userVoted', vote); // Send vote event to Section-Card parent
    this.loading = false;
  }

  public getTimer(deadline, timer) {
    const that = this;
    return setInterval(function() {
      const distance = that.getDeadline(deadline);
      let days = Math.floor(distance / (1000 * 60 * 60 * 24)).toString();
      let hours = Math.floor(
        (distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60),
      ).toString();
      let minutes = Math.floor(
        (distance % (1000 * 60 * 60)) / (1000 * 60),
      ).toString();
      let seconds = Math.floor((distance % (1000 * 60)) / 1000).toString();
      days = days.length === 1 ? '0' + days : days;
      hours = hours.length === 1 ? '0' + hours : hours;
      minutes = minutes.length === 1 ? '0' + minutes : minutes;
      seconds = seconds.length === 1 ? '0' + seconds : seconds;
      if (distance < 0) {
        return 'EXPIRED';
      }
      that.deadline = seconds + ' : ' + minutes + ' : ' + hours + ' : ' + days;
    }, 1000);
  }
}
</script>

<style lang="scss">
@import "@/main.scss";

.btn_container {
  div {
    .pros {
      background-color: $blue-pro;
    }

    .cons {
      background-color: $red-con;
    }

    .v-btn {
      color: white;
      font-size: 1.2em;
      font-weight: 800;
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
  }
}
.timer-spacing {
  letter-spacing: 0.08rem !important;
}
</style>
