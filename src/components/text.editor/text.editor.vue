<template>
  <div class="editor">
    <!-- <editor-menu-bar
      v-if="showEditorMenu"
      class="editor-menu-bar"
      :editor="editor"
      v-slot="{ commands, isActive, getMarkAttrs, menu  }"
    >
      <div class="menubar">
        <button
          class="menubar__button"
          :class="{ 'is-active': isActive.bold() }"
          @click="commands.bold"
        >
          <v-icon name="bold">format_bold</v-icon>
        </button>

        <button
          class="menubar__button"
          :class="{ 'is-active': isActive.italic() }"
          @click="commands.italic"
        >
          <v-icon name="bold">format_italic</v-icon>
        </button>

        <button
          class="menubar__button"
          :class="{ 'is-active': isActive.underline() }"
          @click="commands.underline"
        >
          <v-icon name="bold">format_underlined</v-icon>
        </button>

        <form
          class="menubar__form"
          v-if="linkMenuIsActive"
          @submit.prevent="setLinkUrl(commands.link, linkUrl)"
        >
          <input
            class="menububble__input text-xs-left"
            type="text"
            v-model="linkUrl"
            placeholder="//:https"
            ref="linkInput"
            @keydown.esc="hideLinkMenu"
            height="2vh"
          >
          <v-btn
            flat
            icon
            class="menubar__button"
            @click="setLinkUrl(commands.link, null)"
            type="button"
            small
          >
            <v-icon name="bold">close</v-icon>
          </v-btn>
        </form>

        <template v-else>
          <button
            class="menubar__button btn-link"
            @click="showLinkMenu(getMarkAttrs('link'))"
            :class="{ 'is-active': isActive.link() }"
          >
            <v-icon name="bold">insert_link</v-icon>
          </button>
        </template>
      </div>
    </editor-menu-bar>-->
    <template>
      <div class="editor">
        <editor-content ref="content" class="editor__content" :editor="editor" />
      </div>
    </template>
  </div>
</template>

<script>
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//

import { EditorContent, EditorMenuBar } from 'tiptap';
export default {
  components: {
    EditorContent,
    EditorMenuBar,
  },
  props: ['editor', 'placeholderText', 'showEditorMenu'],

  data() {
    return {
      linkUrl: null,
      linkMenuIsActive: false,
    };
  },
  beforeDestroy() {
    this.editor.destroy();
  },
  methods: {
    showLinkMenu(attrs) {
      this.linkUrl = attrs.href;
      this.linkMenuIsActive = true;
      this.$nextTick(() => {
        this.$refs.linkInput.focus();
      });
    },
    hideLinkMenu() {
      this.linkUrl = null;
      this.linkMenuIsActive = false;
    },
    setLinkUrl(command, url) {
      command({ href: url });
      this.hideLinkMenu();
      this.editor.focus();
    },
  },
};
</script>

<style lang="scss">
// .is-active {
// }
.editor-menu-bar {
  -webkit-align-items: center;
  align-items: center;
  border: none;
  -webkit-border-radius: 2px;
  border-radius: 2px;
  -webkit-box-shadow: 0 4px 5px 0 rgba(0, 0, 0, 0.14),
    0 1px 10px 0 rgba(0, 0, 0, 0.12), 0 2px 4px -1px rgba(0, 0, 0, 0.2);
  box-shadow: 0 4px 5px 0 rgba(0, 0, 0, 0.14), 0 1px 10px 0 rgba(0, 0, 0, 0.12),
    0 2px 4px -1px rgba(0, 0, 0, 0.2);
  display: -webkit-inline-box;
  display: -webkit-inline-flex;
  display: inline-flex;
  margin: 0;
  padding: 8px 2px;
  white-space: nowrap;
  width: 100%;
}
.menubar__button {
  &:hover {
    color: #b6b6b6;
  }
  margin: 0 2%;
  cursor: pointer;
}
.is-active {
  background-color: #b6b6b6;
}
.btn-link {
  display: flex;
  flex-direction: column;
}
form.menubar__form {
  text-align: left;
}
.ProseMirror {
  text-align: right;
  min-height: 20vh;
  padding: 1%;
}
.editor-container {
  padding: 2%;
}
.editor-label {
  font-weight: 100;
  font-size: 12px;
  color: #757575;
}
.editor p.is-empty:first-child::before {
  content: attr(data-empty-text);
  margin: 1%;
  float: right;
  color: #aaa;
  pointer-events: none;
  height: 0;
}
</style>
