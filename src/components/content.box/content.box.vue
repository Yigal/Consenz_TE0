<template>
  <v-layout column pa-1>
    <v-layout v-if="itemContent" class="text-xs-right">
      <span v-if="itemContentHtml" v-html="itemContentHtml"></span>
      <span v-else>{{itemContent}}</span>
    </v-layout>
    <v-layout row justify-space-between align-end class="my-body-1">
      <v-flex xs6>
        <v-layout align-end row pt-2>
          <!-- <span> -->
          <!-- <v-icon small color="purple">person</v-icon> -->
          <!-- </span> -->
          <img class="profile-pic" :src="participantPhotoUrlById(item.owner)">
          <span
            class="pr-1"
            v-colorDirective="{color: item.type}"
          >{{ participantDisplayNameById(item.owner) }}</span>
        </v-layout>
      </v-flex>
      <span class="no-wrap">
        {{ dateFormatted(item.createdAt).time }} &#8226;
        {{ dateFormatted(item.createdAt).date }}
      </span>
    </v-layout>
  </v-layout>
</template>


<script lang="ts">
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

import { colorDirective } from '@/directives/color-directive';
import { Prop } from 'vue-property-decorator';

@Component({
  directives: {
    colorDirective,
  },
})
export default class contentBox extends Vue {
  @Prop() public item: Object;
  @Prop() public itemContent: String;
  @Prop() public itemContentHtml: String;
  @UsersModule.UsersGetter private participantDisplayNameById;
  @UsersModule.UsersGetter private participantPhotoUrlById;

  @DisplayModule.DisplayGetter private dateFormatted;
}
</script>

<style>
.profile-pic {
  border-radius: 50%;
  width: 25px;
  height: 25px;
}
</style>