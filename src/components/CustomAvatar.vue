<template>

  <span v-on="clickEnabled ? { click: goToPage } : {}" class="[clickEnabled ? cursor-pointer : ''] reset-font">
    <v-badge v-if="isTrusted === true"
      overlap color="#DAA520" class="custom-badge" bottom content="T">
      <!-- <template v-slot:badge >
        <span class="reset-line-height">T</span>
      </template> -->
      <inner-avatar :user="user" :size="size ? size : avatarSize"></inner-avatar>
    </v-badge>

    <inner-avatar v-else :user="user" :size="size ? size : avatarSize">
    </inner-avatar>
  </span>

</template>

<script>
import innerAvatar from '../components/InnerAvatar'
import utils from '@/services/utils'

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
