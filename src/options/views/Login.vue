<template>
  <v-container fluid class="custom-sidebar pa-0">
    <custom-toolbar></custom-toolbar>

    <v-row class="pt-0 full-height" justify="center" align="center" no-gutters fill-height>
      <v-col cols="12">
        <v-alert v-model="alert" type="error">
          {{alertMessage}}
        </v-alert>

        <v-form>
          <v-card>
            <v-container fluid>
              <v-row justify="center" no-gutters>
                <v-card-title primary-title >
                  <h3 class="headline">Log into your account</h3>
                </v-card-title>
              </v-row>

              <v-row no-gutters>
                <v-text-field v-model="username" tabindex="1"
                  label="Username" required>
                </v-text-field>
              </v-row>

              <v-row no-gutters>
                <v-text-field v-model="password" type="password" tabindex="2"
                  label="Password" required>
                </v-text-field>
              </v-row>

              <v-row no-gutters>
                <a href="https://trustnet.csail.mit.edu/forgot-password" target="_blank">Forgot your password?</a>
              </v-row>

            </v-container>

            <v-row justify="center" no-gutters>
              <v-card-actions class="mb-2">
                <v-btn tabindex="3" depressed color="primary" @click="login">Login</v-btn>
              </v-card-actions>
            </v-row>

            <v-divider ></v-divider>
            <v-row justify="center" no-gutters>
              <v-card-title primary-title>
                <h3 class="headline">Or sign up</h3>
              </v-card-title>
              <p class="caption mb-2">A new tab will open asking you to sign up on the Trustnet platform.</p>
            </v-row>

            <v-row justify="center" no-gutters>
              <v-card-actions>
                <v-btn tabindex="4" depressed href="https://trustnet.csail.mit.edu/signup" target="_blank">Go to signup</v-btn>
              </v-card-actions>
            </v-row>

          </v-card>
        </v-form>
      </v-col>
    </v-row>
  </v-container>

</template>

<script>
import customToolbar from '@/components/CustomToolbar'

export default {
  components: {
    'custom-toolbar': customToolbar
  },
  data(){
    return {
      username : "",
      password : "",
      alert: false,
      alertMessage: ''
    }
  },
  methods: {
   login: function() {
    let username = this.username;
    let password = this.password;

    this.$store.dispatch('auth/login',
    {
      'username': username,
      'password': password
    })
    .then(() => {
      console.log('successfully logged in')
      this.$router.push({ name: 'Home' });
    })
    .catch(err => {
      this.alertMessage = err.message;
      this.alert = true;
      })
    },
    goToSignup: function() {
      this.$router.push({ name: 'signup' });
    },
    goToPasswordReset: function() {
      this.$router.push({ name: 'forgotPassword' });
    }
  }
}

</script>
