<!--suppress ALL -->
<template lang="html">
  <v-form v-model="valid">
    <v-container>
      <v-layout>
        <v-flex
          xs12
          md4
        >
          <v-text-field
            v-model="title"
            label="שם כותרת מסמך"
            required
          ></v-text-field>
        </v-flex>

        <v-flex
          xs12
          md4
        >
          <v-text-field
            v-model="url"
            label="url"
            required
          ></v-text-field>
        </v-flex>

      </v-layout>
    </v-container>
        <v-btn @click="submit">submit</v-btn>

  </v-form>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import { DocumentsModule } from '../../store/store.helper';

@Component({})
export default class AddDocument extends Vue {
  @DocumentsModule.DocumentsAction private addDocument;
  private valid: boolean = false;
  private url: string = '';
  private title: string = '';

  private async submit() {
    await this.addDocument({ title: this.title, id: this.url });
    this.title = '';
    this.url = '';
  }
}
</script>

<style>
</style>
