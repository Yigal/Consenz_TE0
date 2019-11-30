<script lang="ts">
import {Component, Vue} from 'vue-property-decorator';

  @Component({})
export default class ErrorBoundary extends Vue {
  public error: boolean = false;
  public created() {}
  public errorCaptured(err, vm, info) {
    console.log('errorCaptured', err);
    this.error = true;
  }
  public render(h) {
    // return this.error ? h('p', 'Something went wrong') : this.$slots.default[0]
  }
}
</script>

<style lang="scss"></style>
