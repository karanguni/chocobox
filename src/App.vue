<template>
	<div id="app">
		<h1>Chocobox 2019 App</h1>

    <p>Searching for something? The <a href="https://chocoboxsearch.herokuapp.com">search tool</a> is a full-text, much faster way to search the tagset - <strong>including relationships!</strong></p>
    <p><strong>LAST UPDATED AT <strong>{{ new Date('2018-12-31T20:16:11.826Z').toLocaleString() }} (local time)</strong>. If anything has changed since that time, it is NOT REFLECTED IN THE APP.
    </p>

    <div v-if="!loaded || !loadedChars" class="loader">Loading...</div>

    <template v-if="loaded && loadedChars && !maintenance">
      <div class="scroll-top" @click="scrollToTop">(^)</div>

      <div v-if="unlock" :class="['menu', { sticky: sticky }]">
        <ul>
          <li class="submit-letter"  @click="showLetterModal = true">
            Submit Letter
          </li>
          <li class="edit-letter"  @click="showEditModal = true">
            Edit Letter
          </li>
          <li class="bookmarks" @click="expandBookmarks = !expandBookmarks">
            Bookmarks
          </li>
          <li class="help" @click="showHelp = true">
            <span class="fas fa-question-circle fa-xxl" ></span>
          </li>
        </ul>
      </div>

      <bookmarks :force-expand="expandBookmarks" @toggle="expandBookmarks = !expandBookmarks"></bookmarks>
      <!-- <add-letter
        v-if="showLetterModal"
        @close="showLetterModal = false">
      </add-letter>
      <edit-letter
        v-if="showEditModal"
        @close="showEditModal = false">
      </edit-letter> -->

      <!-- <user-lookup></user-lookup> -->
      <options></options>

      <table class="main">
        <thead>
          <tr>
            <th class="fandom">Fandom</th>
            <th class="characters" v-if="!options.hideCharacters">Characters</th>
            <th v-if="unlock" class="letters">Letters</th>
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
            <div class="meta hide">
                Key: {{ fandom['.key'] }}
              <span class="category meta-tag" v-if="!options.hideCategory">{{fandom.category.join(', ')}}</span>

            </div>
          </td>
          <td class="characters" v-if="!options.hideCharacters">
            <ul>
              <li
                v-for="char in getCharacters(fandom['.key'], 'char li')"
                :class="{ highlight: letterHasChar(fandom['.key'], char) }"
                :key="`${char}${Math.random()}`"
              >
                {{char}}
              </li>
            </ul>
          </td>
          <td v-if="unlock" class="letters">
            <ul>
              <li v-for="letter in letters[fandom['.key']]" :key="letter.username" class="letter">
                <a
                  class="user"
                  :href="formatUrl(letter.url)" target="_blank"
                >{{ letter.username }}</a>
                <button
                  class="bookmark-letter"
                  @click="toggleLettermark(letter, fandom)"
                >
                  <span v-if="hasLettermark(letter, fandom)" class="fas fa-heart"></span>
                <span v-else class="far fa-heart"></span>
                </button>
                <div class="meta">
                  <!-- TODO: meta stuff -->
                  <span v-if="isProlific(letter.username)">*</span>
                  <sup v-if="showEasterEggs">{{ challenges(letter.username).join(' ') }}</sup>
                  <button class="char-count meta-tag" @click="highlightChars(letter, fandom['.key'])" @mouseleave="letterChars = []">
                    Chars: {{ letter.characters === undefined ? 'Any' : letter.characters.length }}
                  </button>
                </div>

              </li>
            </ul>
          </td>
          <!-- HERE BE PROMPTS -->
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
                    <th class="characters">Characters</th>
                    <th class="prompts">Prompts</th>
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
                      <span v-if="isProlific(prompt.username)">*</span>
                      <sup v-if="showEasterEggs">{{ challenges(prompt.username).join(' ') }}</sup>
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
import AddLetter from './components/add-letter.vue';
import EditLetter from './components/edit-letter.vue';
import Bookmarks from './components/bookmarks.vue';
import Options from './components/options.vue';
import UserLookup from './components/user-lookup.vue';

// third party
import _ from 'lodash';
import db from './db.js';
import { mapGetters } from 'vuex';

// internal
import hasPrompts from './data/hasPrompts.js';
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
    AddLetter,
    EditLetter,
    Bookmarks,
    Options,
    UserLookup
  },
  beforeMount() {
    // this.$store.commit('setUnlock', true);
    this.$store.commit('setOptions', {
      filter: {
        category: '',
        term: ''
      },
      onlyLetters: false,
      onlyBookmarks: false,
      onlyPrompts: true,
      onlyPHs: false,
      destyle: false,
      hideCharacters: false
    });

    const bookmarksJson = this.$localStorage.get('bookmarks');
    if (bookmarksJson) {
      this.$store.commit('setBookmarks', JSON.parse(bookmarksJson));
    }

    const lettermarksJson = this.$localStorage.get('lettermarks');
    if (lettermarksJson) {
      this.$store.commit('setLettermarks', JSON.parse(lettermarksJson));
    }

    const promptmarksJson = this.$localStorage.get('promptmarks');
    if (promptmarksJson) {
      this.$store.commit('setPromptmarks', JSON.parse(promptmarksJson));
    }
  },
  created() {
    document.addEventListener('keydown', this.easterEggs);
    document.addEventListener('keydown', this.unlockModTools);
    document.addEventListener('keyup', this.unlockModTools);
    window.addEventListener('scroll', this.lazyload);
  },
  beforeDestroy() {
    document.removeEventListener('keydown', this.easterEggs);
    document.removeEventListener('keydown', this.unlockModTools);
    document.removeEventListener('keyup', this.unlockModTools);
    window.removeEventListener('scroll', this.lazyload);
  },
  data() {
    return {
      showLetterModal: false,
      showEditModal: false,
      maintenance: false,
      showEggHelp: false,
      showHelp: false,
      hasPrompts,
      expandBookmarks: false,
      down: {},
      mods: false,
      scrollPosition: 100,
      letterChars: {
        fandom: '',
        characters: []
      },
      timesCalled: 0,
      filtered: [],
      updating: true,
      sticky: false,
      promptStates: {}
    };
  },
  computed: {
    lastUpdated() {
      const data = _.find(this.meta, { '.key': 'lastUpdated' });

      if (!data) {
        return '';
      }

      return new Date(data['.value']).toString();
    },
    ...mapGetters([
      'letters',
      'fandoms',
      'loaded',
      'bookmarks',
      'characters',
      'categories',
      'lettermarks',
      'promptmarks',
      'unlock',
      'options',
      'user',
      'prompts',
      'showEasterEggs',
      'loadedChars',
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
        !this.options.onlyLetters &&
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

      // if (this.options.onlyPrompts) {
      //   arr = _.filter(arr, o => {
      //     return this.hasPrompts[o['.key']];
      //   });
      // }

      // if (this.options.onlyLetters) {
      //   arr = _.filter(arr, o => {
      //     return this.letters[o['.key']] !== undefined;
      //   });
      // }

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