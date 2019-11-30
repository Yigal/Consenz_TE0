import Firebase from 'firebase/app';
import { Component, Vue } from 'vue-property-decorator';
import { mapActions, mapGetters } from 'vuex';
@Component({
  computed: mapGetters({
    user: 'usersModule/user',
    documentId: 'documentsModule/documentId',
    lastRoute: 'routerModule/lastRoute',
  }),
  methods: {
    ...mapActions({
      onAuthStateChanged: 'usersModule/onAuthStateChanged',
      push: 'routerModule/push',
    }),
  },
})
export default class Login extends Vue {
  public push;
  public loginWithForm: boolean = false;
  private onAuthStateChanged;
  private dialog: boolean = false;
  private existingUser: boolean = false;
  private forgotPassword: boolean = false;
  private showPassword: boolean = false;
  private email: string = '';
  private password: string = '';
  private username: string = '';
  private valid: boolean = true;
  // noinspection JSMismatchedCollectionQueryUpdate
  private emailRules: any[] = [(v) => !!v || 'נא להכניס כתובת אימייל', (v) => /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(v) || 'כתובת לא תקינה'];
  private passwordRules: any[] = [(v) => !!v || 'נא להכניס סיסמה', (v) => v.length >= 8 || 'לפחות 8 תווים'];
  private usernameRules: any[] = [(v) => !!v || 'אנא הכנס שם', (v) => /([^\s])/.test(v) || 'אנא הכנס שם'];
  private specificErrors: any[] = [];
  private emailReset = {
    display: false,
    value: 'שלחנו אלייך מייל לשחזור הסיסמא',
  };
  private loading: boolean = false;
  public lastRoute;
  public documentId;

  private async emailSignIn() {
    this.$ga.event('info', this.documentId, 'login-email', 0);
    this.dialog = true;
    if (this.forgotPassword) {
      Firebase.auth()
        .signInWithEmailAndPassword(this.email, '111111111111')
        .catch((error) => {
          this.dialog = false;
          let errorMessage = error.message;
          if (errorMessage === 'There is no user record corresponding to this identifier. The user may have been deleted.') {
            errorMessage = 'האימייל אינו קיים';
            this.specificErrors.push(errorMessage);
          }
        })
        .then(() => {
          this.specificErrors = [];
          Firebase.auth()
            .sendPasswordResetEmail(this.email)
            .then(() => {
              this.emailReset.display = true;
            });
        });
      // tslint:disable-next-line:no-string-literal
    } else if (this.$validator.validateAll()) {
      this.loading = true;
      const signInFunction = this.existingUser ? Firebase.auth().signInWithEmailAndPassword(this.$data.email, this.$data.password) : Firebase.auth().createUserWithEmailAndPassword(this.$data.email, this.$data.password);
      const result = await Firebase.auth().setPersistence(Firebase.auth.Auth.Persistence.LOCAL);
      signInFunction
        .then(async (result) => {
          await this.handleUser(result);
        })
        .catch((error) => {
          // Handle specificErrors here.
          // const errorCode = error.code;
          let errorMessage = error.message;
          this.specificErrors = [];
          switch (errorMessage) {
            case 'There is no user record corresponding to this identifier. The user may have been deleted.':
              errorMessage = 'האימייל אינו קיים';
              this.specificErrors.push(errorMessage);
              break;
            case 'The password is invalid or the user does not have a password.':
              errorMessage = 'סיסמא שגויה';
              this.specificErrors.push(errorMessage);
              break;
            case 'The email address is already in use by another account.':
              errorMessage = 'כתובת המייל כבר בשימוש';
              this.specificErrors.push(errorMessage);
              break;
            default:
              errorMessage = '';
              this.specificErrors.push(errorMessage);
          }
          this.dialog = false;
          this.loading = false;
        });
    }
  }

  private googleSignIn(): void {
    const provider = new Firebase.auth.GoogleAuthProvider();
    this.providerSignIn(provider);
  }

  private facebookSignIn(): void {
    this.providerSignIn(new Firebase.auth.FacebookAuthProvider());
  }

  private providerSignIn(provider) {
    this.$ga.event('info', this.documentId, 'login-google', 0);
    this.dialog = true;
    Firebase.auth()
      .signInWithPopup(provider)
      .then(
        async (result) => {
          await this.handleUser(result);
        },
        (error) => {
          this.dialog = false;
          alert(error.message);
        },
      );
  }

  private changeLoginMethod() {
    if (!this.existingUser) {
      this.existingUser = true;
    } else if (!this.forgotPassword) {
      this.forgotPassword = true;
    }
  }

  private async handleUser(result) {
    if (result && result.user) {
      this.onAuthStateChanged({ user: result.user, username: this.username ? this.username : result.user.displayName, isNewUser: result.additionalUserInfo.isNewUser });
      this.push({ path: this.lastRoute.fullPath });
      this.dialog = false;
      this.loading = false;
    }
  }
}
