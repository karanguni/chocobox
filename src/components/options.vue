<template>
<div class="options">
  <div class="filters row">
    <span class="label">Filter By:</span>

    <div class="option">
      <input id="fandom-filter" type="text" placeholder="Fandom name..." v-model='options.filter.term'>
    </div>

    <div class="option">
      <select id="category-filter" v-model="options.filter.category">
        <option value=''>All Categories</option>
        <option v-for="category in categories" :key="category">{{ category }}</option>
      </select>
    </div>

  </div>
  <div class="row">
    <span class="label">Show Only:</span>

    <div class="option" v-if="unlock">
      <input type="checkbox" id="prompts-fandoms" v-model="options.onlyPrompts">
      <label for="prompts-fandoms">Fandoms with prompts</label>
    </div>
    <div class="option">
      <input type="checkbox" id="bookmarked-fandoms" v-model="options.onlyBookmarks">
      <label for="bookmarked-fandoms">Bookmarked fandoms</label>
    </div>
    <!-- <div class="option" v-if="unlock">
      <input type="checkbox" id="ph" v-model="options.onlyPHs">
      <label for="ph">Only fandoms with pinch hitters</label>
    </div> -->

  </div>

  <div class="row">
    <span class="label">Tools:</span>
    <div class="option" v-if="!loadAll.characters">
      <input type="checkbox" id="load-all" v-model="options.loadAll">
      <label for="load-all">Load everything!</label>
      <sup><span class="fas fa-exclamation-circle warn" @click="showMsg = !showMsg"></span></sup>
    </div>
    <div class="option">
      <input type="checkbox" id="hide-chars" v-model="options.hideCharacters">
      <label for="hide-chars">Hide Relationships</label>
    </div>
    <!-- <div class="option" v-if="unlock">
      <input type="checkbox" id="journal-style" v-model="options.destyle">
      <label for="journal-style">Mobile letter format</label>
    </div> -->

    <div class="clear" v-if="showMsg">
      <small><strong :style="{ color: 'red'}">Load all the fandoms at once instead of as you scroll. This may take your browser a bit!</strong></small>
    </div>
  </div>

  <div class="row" v-if="unlock">
    <span class="label">Username:</span>
    <div class="option-large">
        <input id="search-user" type="text" placeholder="AO3 Username" v-model="userlookup">
        <button class="button-primary search-user-submit" @click="getUserPrompts(userlookup)">Go!</button>
    </div>
  </div>
</div>

</template>

<script>
import { mapGetters } from 'vuex';
import db from '../db.js';
import _ from 'lodash';
import utils from './utils.js';

export default {
  computed: {
    ...mapGetters(['unlock', 'categories', 'loadAll'])
  },
  watch: {
    options: {
      handler(val, oldVal) {
        if (val.filter.term.length && val.filter.term === oldVal.filter.term) {
          _.debounce(() => {
            this.$store.commit('setOptions', val);
          }, 500)();
        } else {
          this.$store.commit('setOptions', val);
        }
      },
      deep: true
    }
  },
  methods: {
    getUserPrompts: utils.getUserPrompts
  },
  data() {
    return {
      showMsg: false,
      userlookup: '',
      options: {
        filter: {
          category: '',
          term: ''
        },
        onlyLetters: false,
        onlyBookmarks: false,
        onlyPrompts: true,
        onlyPHs: false,
        destyle: false,
        loadAll: false,
        hideCharacters: true
      }
    };
  }
};
</script>

<style lang="scss" scoped>
.options {
  overflow: hidden;
  margin-bottom: 10px;

  .label {
    font-weight: bold;
    width: 100px;
    display: inline-block;
  }

  .option {
    display: inline-block;
    width: 210px;
    height: 30px;
    vertical-align: top;
  }

  .option-large {
    display: inline-block;
    width: 500px;
    height: 30px;
    vertical-align: top;
  }

  select {
    max-width: 180px;
  }

  .clear {
    max-width: 750px;
    color: rgba(0, 0, 0, 0.5);
    line-height: 14px;
    margin-bottom: 3px;
  }

  .row {
    margin-bottom: 5px;
  }

  .filters {
    .label {
      vertical-align: top;
    }
  }
}

.search-user,
.search-user-submit {
  display: inline-block;
}

.warn {
  color: #e4a95c;
  padding-left: 2px;
}
</style>
