<template>

  <span v-on="clickEnabled ? { click: goToPage } : {}" :class="[clickEnabled ? 'cursor-pointer' : '', 'reset-font'] ">
    <!-- <v-badge v-if="isTrusted === true"
      overlap color="#DAA520" class="custom-badge" bottom content="T">
      <inner-avatar :user="user" :size="size ? size : avatarSize"></inner-avatar>
    </v-badge> -->

    <v-badge v-if="isTrusted === true"
      overlap color="" bottom :icon="icons.shield">
      <inner-avatar :user="user" :size="size ? size : avatarSize"></inner-avatar>
    </v-badge>

    <inner-avatar v-else :user="user" :size="size ? size : avatarSize">
    </inner-avatar>
  </span>

</template>

<script>
import innerAvatar from '../components/InnerAvatar'
import utils from '@/services/utils'
import { mdiShield } from '@mdi/js';

export default {
  components: {
    'inner-avatar': innerAvatar
  },
  props: {
    user: {
      type: Object,
      required: true
    },
    size: {
      type: Number,
      required: false
    },
    clickEnabled: {
      type: Boolean
    }
  },
  data () {
    return {
      icons: {
        shield: mdiShield
      }
    }
  },
  computed: {
    avatarSize: function() {
      return 30;
    },
    isTrusted: function() {
      return utils.isTrusted(this.user);
    }
  },
  methods: {
    goToPage: function(event) {
      event.stopPropagation();
      // this.$router.push({ name: 'profile', params: { username: this.user.userName } });
    }
  }

}
</script>

<style scoped lang="scss">
.reset-font {
  font-size: initial;
}
.custom-badge {
  line-height: initial;
}

</style>
