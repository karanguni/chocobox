<template>
	<div id="app">
		<h1>Chocobox 2019 App</h1>

    <p>Looking for something? The <a href="https://chocoboxsearch.herokuapp.com">search tool</a> is a full-text, much faster way to search - <strong>including relationships and full-text prompt search!</strong></p>
    <p><strong>CAVEATS</strong>: until signups close, bookmarked prompts <strong>do not update/get deleted in the Bookmarks pane</strong> if the requester makes changes/deletes them. You can remove and re-add the current version from the main table at any time. <strong>Always check the final signup!</strong></p>

    <div v-if="!loaded || !loadedChars || !loadedHasPrompts" class="loader">Loading...</div>

    <template v-else>
    <p>Last updated at <strong>{{ new Date(timestamp).toLocaleString() }} (local time)</strong>. If anything has changed since that time, it is NOT REFLECTED IN THE APP.
    </p>
      <div class="scroll-top" @click="scrollToTop">(^)</div>
      <bookmarks :force-expand="expandBookmarks" @toggle="expandBookmarks = !expandBookmarks"></bookmarks>

      <user-lookup></user-lookup>
      <options></options>

      <table class="main">
        <thead>
          <tr>
            <th class="fandom">Fandom</th>
            <th class="characters" v-if="!options.hideCharacters">Relationships</th>
            <th v-if="unlock" class="prompts">Prompts</th>
          </tr>
        </thead>
        <tbody>
          <tr class="overlay" v-if="updating">
            <td><div></div></td>
          </tr>
          <tr
          v-if="options.loadAll || index <= scrollPosition"
          v-for="(fandom, index) in filtered"
          :key="index"
          :class="{odd: index % 2 !== 0 }"
        >
          <td class="fandom" data-label="Fandom">
            {{ fandom.name }}
            <button
                class="bookmark"
                @click="toggle(fandom)"
                >
                  <span v-if="hasBookmark(fandom)" class="fas fa-heart"></span>
                  <span v-else class="far fa-heart"></span>
              </button>
            <div class="meta">
              <span class="category meta-tag" v-if="!options.hideCategory">{{fandom.category.join(', ')}}</span>

            </div>
          </td>
          <td class="characters" v-if="!options.hideCharacters">
            <ul>
              <li
                v-for="char in getCharacters(fandom['.key'], 'char li')"
                :key="`${char}${Math.random()}`"
              >
                {{char}}
              </li>
            </ul>
          </td>
          <td v-if="unlock" class="prompts">
            <button class="button-primary" v-if="!prompts[fandom['.key']] && hasPrompts[fandom['.key']]" @click="getPrompts(fandom['.key'])">Get Prompts</button>
            <div v-if="prompts[fandom['.key']] === 'loading'">Loading...</div>
            <template v-if="prompts[fandom['.key']] && prompts[fandom['.key']].length && prompts[fandom['.key']] !== 'loading'">
              <a href="javascript:void(0);" @click="collapse(prompts[fandom['.key']].length, $event)">Collapse</a>
              <table class="prompts">
                <thead>
                  <tr>
                    <th class="fave"><span class="fas fa-heart"></span></th>
                    <th class="username">Username</th>
                    <th class="characters">Relationships</th>
                    <th class="prompts">Prompts</th>
                    <th class="type">Type</th>
                  </tr>
                </thead>
                <tbody>
                  <tr
                    v-for="(prompt, index) in prompts[fandom['.key']]"
                    :key="index"
                  >
                    <td>
                      <button
                        class="bookmark"
                        @click="togglePromptmark(prompt)"
                      >
                          <span v-if="hasPromptmark(prompt)" class="fas fa-heart"></span>
                          <span v-else class="far fa-heart"></span>
                      </button>
                    </td>
                    <td>
                      {{ prompt.username }}
                      <a @click="getUserPrompts(prompt.username)"> (see all)</a>
                    </td>
                    <td>
                      <ul v-if="prompt.characters" class="characters">
                        <li v-for="c in prompt.characters" :key="c">{{ c }}</li>
                      </ul>
                    </td>
                    <td class="prompt">
                      <div v-html="prompt.prompt"></div>
                      <a v-if="prompt.letter" :href="formatUrl(prompt.letter)" target="blank">Letter</a>
                    </td>
                    <td class="type">
                      <p v-if="prompt.fanfic">Fanfic</p>
                      <p v-if="prompt.fanart">Fanart</p>
                    </td>
                  </tr>
                </tbody>
              </table>
            </template>
            <span v-else-if="!hasPrompts[fandom['.key']]">No prompts ):</span>
          </td>
        </tr>
        </tbody>

      </table>
    </template>
	</div>
</template>

<script>
import Bookmarks from './components/bookmarks.vue';
import Options from './components/options.vue';
import UserLookup from './components/user-lookup.vue';

// third party
import _ from 'lodash';
import db from './db.js';
import { mapGetters } from 'vuex';

// internal
import utils from './components/utils.js';

// Remove english articles from fandom names
function removeArticlesCompare(o) {
  if (!o) {
    return;
  }
  const regex = /^(the\s|a\s|an\s)/i;
  if (!o.name) {
    return o;
  }
  return o.name.toLowerCase().replace(regex, '');
}

export default {
  name: 'app',
  components: {
    Bookmarks,
    Options,
    UserLookup
  },
  beforeMount() {
    const meta = db
      .ref('/timestamp')
      .once('value')
      .then(res => {
        this.timestamp = res.val().timestamp;
      });
    this.$store.commit('setOptions', {
      filter: {
        category: '',
        term: ''
      },
      onlyBookmarks: false,
      onlyPrompts: true,
      onlyPHs: false,
      destyle: false,
      hideCharacters: true
    });

    const bookmarksJson = this.$localStorage.get('bookmarks');
    if (bookmarksJson) {
      this.$store.commit('setBookmarks', JSON.parse(bookmarksJson));
    }

    const promptmarksJson = this.$localStorage.get('promptmarks');
    if (promptmarksJson) {
      this.$store.commit('setPromptmarks', JSON.parse(promptmarksJson));
    }
  },
  created() {
    window.addEventListener('scroll', this.lazyload);
  },
  beforeDestroy() {
    window.removeEventListener('scroll', this.lazyload);
  },
  data() {
    return {
      maintenance: false,
      timestamp: null,
      showEggHelp: false,
      showHelp: false,
      expandBookmarks: false,
      down: {},
      mods: false,
      scrollPosition: 100,
      filtered: [],
      updating: true,
      sticky: false,
      promptStates: {}
    };
  },
  computed: {
    ...mapGetters([
      'fandoms',
      'loaded',
      'hasPrompts',
      'bookmarks',
      'characters',
      'categories',
      'promptmarks',
      'unlock',
      'options',
      'user',
      'prompts',
      'loadedChars',
      'loadedHasPrompts',
      'loadAll'
    ])
  },
  watch: {
    letters: {
      deep: true,
      handler(val) {
        if (!Object.keys(val).length) {
          return;
        }
        const scrubbed = this.scrubLettermarks(this.lettermarks, val);
        this.$store.commit('setLettermarks', scrubbed);
        this.$localStorage.set('lettermarks', JSON.stringify(scrubbed));
      }
    },
    options: {
      deep: true,
      handler(val) {
        this.updating = true;
        if ((val.loadAll || val.onlyLetters || val.onlyBookmarks) && !this.loadAll.characters) {
          const data = db
            .ref('/characters')
            .orderByKey()
            .startAt(String(0))
            .endAt(String(this.fandoms.length - 1))
            .once('value')
            .then(res => {
              const backFill = res.val();
              // TODO: backfill null values in JSON in chars that should exist in fandoms
              // so that the characters database.length === fandoms.length
              const newVal = { ...this.characters, ...backFill };
              this.$store.commit('loadAllChars', true);
              this.$store.commit('setCharacters', {});
              this.$store.commit('setCharacters', newVal);
              this.scrollPosition = this.fandoms.length;
              this.updateFilter();
              return;
            });
        } else {
          this.updateFilter();
        }
      }
    },
    loaded() {
      this.updateFilter();
    },
    scrollPosition(val) {
      if (val >= this.fandoms.length) {
        return;
      }
      this.updateFilter();
    }
  },
  methods: {
    ...utils,
    updateFilter() {
      this.updating = true;
      if (
        !this.options.onlyPrompts &&
        !this.options.filter.term.length &&
        !this.options.onlyBookmarks &&
        !this.options.onlyPHs &&
        !this.options.filter.category.length
      ) {
        this.filtered = _.take(
          _.sortBy(this.fandoms, ['category', removeArticlesCompare]),
          this.scrollPosition
        );
        setTimeout(() => {
          this.updating = false;
        }, 200);
      }

      let arr = _.filter(this.fandoms, f => {
        return f.name.length;
      });

      if (this.options.onlyPrompts) {
        arr = _.filter(arr, o => {
          return this.hasPrompts[o['.key']];
        });
      }

      if (this.options.onlyBookmarks) {
        const bookmarkedFandoms = [];
        _.each(this.bookmarks, b => {
          bookmarkedFandoms.push(b.name);
        });

        arr = _.filter(arr, o => {
          return _.includes(bookmarkedFandoms, o.name);
        });
      }

      if (this.options.filter.category.length) {
        arr = _.filter(arr, o => {
          return _.includes(o.category, this.options.filter.category);
        });
      }

      if (this.options.filter.term.length) {
        arr = _.filter(arr, o => {
          return o.name.toLowerCase().indexOf(this.options.filter.term.toLowerCase()) > -1;
        });
      }

      // If filtering by term or category, preload everything if there are more than a few
      // Also sort by alpha name instead of alpha category when there is a search term
      if (
        (this.options.filter.term.length || this.options.filter.category.length) &&
        !this.loadAll.characters &&
        arr.length > 5
      ) {
        const data = db
          .ref('/characters')
          .orderByKey()
          .startAt(String(0))
          .endAt(String(this.fandoms.length - 1))
          .once('value')
          .then(res => {
            const backFill = res.val();
            // TODO: backfill null values in JSON in chars that should exist in fandoms
            // so that the characters database.length === fandoms.length
            const newVal = { ...this.characters, ...backFill };
            this.$store.commit('loadAllChars', true);
            this.$store.commit('setCharacters', {});
            this.$store.commit('setCharacters', newVal);
            this.scrollPosition = this.fandoms.length;
            this.filtered = _.sortBy(arr, [removeArticlesCompare]);
            setTimeout(() => {
              this.updating = false;
            }, 200);
          });
        // Otherwise, just take the i/o hit
      } else if (this.options.filter.term.length || this.options.filter.category.length) {
        this.filtered = _.take(_.sortBy(arr, [removeArticlesCompare]), this.scrollPosition);
        setTimeout(() => {
          this.updating = false;
        }, 200);
      } else {
        this.filtered = _.take(
          _.sortBy(arr, ['category', removeArticlesCompare]),
          this.scrollPosition
        );
        setTimeout(() => {
          this.updating = false;
        }, 200);
      }
    },
    lazyload() {
      const y = window.scrollY;
      const totalHeight = document.body.scrollHeight;

      if (window.pageYOffset > 100) {
        this.sticky = true;
      } else {
        this.sticky = false;
      }

      if (this.loadAll.characters) {
        return;
      }

      if (totalHeight - y - (document.documentElement.scrollTop || document.body.scrollTop) < 50) {
        if (this.scrollPosition < this.fandoms.length) {
          const prevPosition = this.scrollPosition + 1 || 101;
          const newPosition = this.scrollPosition + 100;

          const data = db
            .ref('/characters')
            .orderByKey()
            .startAt(String(prevPosition))
            .endAt(String(newPosition))
            .once('value');

          data.then(res => {
            const backFill = res.val();
            const newVal = { ...this.characters, ...backFill };
            this.$store.commit('setCharacters', {});
            this.$store.commit('setCharacters', newVal);
            this.scrollPosition = newPosition;
          });
        }
      }
    },
    collapse(length, e) {
      e.target.innerText = e.target.innerText !== 'Collapse' ? 'Collapse' : `Expand (${length})`;
      e.target.nextElementSibling.classList.toggle('hide');
    },

    unlockModTools(e) {
      if (e.type === 'keydown') {
        this.down[e.keyCode] = true;

        // shift + 1 + 2
        if (this.down[16] && this.down[49] && this.down[50]) {
          this.mods = !this.mods;
        }
      }

      if (e.type === 'keyup') {
        this.down[e.keyCode] = false;
      }
    },
    // show easter eggs on F1
    easterEggs(e) {
      if (e.keyCode !== 112) {
        return;
      }

      this.$store.commit('setEggs', !this.showEasterEggs);
      this.showEggHelp = true;
    },
    // utilities
    scrollToTop() {
      document.body.scrollTop = 0;
      document.documentElement.scrollTop = 0;
    },
    // scrub bookmarks in case letters have changed
    scrubLettermarks(lettermarks, letters) {
      return _.filter(lettermarks, l => {
        const fandom = letters[l.key]; //[l.username];
        return l && fandom && fandom[l.username];
      });
    }
  }
};
</script>

<style lang="scss">
@import './styles/app.scss';
@import './styles/mobile.scss';
</style>
