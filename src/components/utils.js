import { includes, find, filter, sortBy } from 'lodash';
import db from '../db.js';

export default {
  getCharacters(fandomKey) {
    const chars = this.characters[fandomKey];
    if (chars !== undefined) {
      return chars;
    }

    if (this.loadAll.characters) {
      return null;
    }

    db.ref('/characters/' + fandomKey)
      .once('value')
      .then(res => {
        const result = res.toJSON();
        this.$store.commit('addChar', { key: fandomKey, result });
        return result;
      });
  },
  highlightChars(letter, key) {
    this.letterChars = {
      fandom: key,
      characters: letter.characters
    };
  },
  getUserPrompts(username) {
    this.$store.commit('setUser', 'Loading');

    db.ref('/users/' + username)
      .once('value')
      .then(snapshot => {
        let results = snapshot.val();

        this.$store.commit('setUser', username);

        if (results && results.length) {
          this.$store.commit('setUserPrompts', results);
        } else {
          this.$store.commit('setUserPrompts', []);
        }
      });
  },
  toggle(fandom) {
    if (includes(this.bookmarks, fandom)) {
      this.remove(fandom);
      return false;
    }
    const newVal = this.bookmarks;
    newVal.push(fandom);
    this.$store.commit('setBookmarks', newVal);
    this.$localStorage.set('bookmarks', JSON.stringify(this.bookmarks));
  },
  togglePromptmark(prompt) {
    if (
      find(this.promptmarks, o => {
        return o.username === prompt.username && o.fandom === prompt.fandom;
      })
    ) {
      this.removePromptmark(prompt);
      return false;
    }

    const newVal = this.promptmarks;
    newVal.push({
      ...prompt
    });

    this.$store.commit('setPromptmarks', newVal);
    this.$localStorage.set('promptmarks', JSON.stringify(this.promptmarks));
  },
  remove(fandom) {
    this.$store.commit(
      'setBookmarks',
      filter(this.bookmarks, o => {
        return o.name !== fandom.name;
      })
    );
    this.$localStorage.set('bookmarks', JSON.stringify(this.bookmarks));
  },
  removePromptmark(prompt) {
    this.$store.commit(
      'setPromptmarks',
      filter(this.promptmarks, o => {
        return (
          (o.username !== prompt.username && o.fandom === prompt.fandom) ||
          o.fandom !== prompt.fandom
        );
      })
    );
    this.$localStorage.set('promptmarks', JSON.stringify(this.promptmarks));
  },
  hasBookmark(fandom) {
    return find(this.bookmarks, o => {
      return o.name === fandom.name;
    });
  },
  hasPromptmark(prompt) {
    return find(this.promptmarks, o => {
      return o.username === prompt.username && o.fandom === prompt.fandom;
    });
  },
  collapse(length, e) {
    e.target.innerText = e.target.innerText !== 'Collapse' ? 'Collapse' : `Expand (${length})`;
    e.target.nextElementSibling.classList.toggle('hide');
  },
  isProlific(name) {
    if (!this.showEasterEggs) {
      return false;
    }

    return false;
  },
  challenges(name) {
    if (!this.showEasterEggs) {
      return false;
    }

    const data = [];

    includes(this.crueltide, name.trim().toLowerCase()) ? data.push('C') : null;
    includes(this.yuleporn, name.trim().toLowerCase()) ? data.push('P') : null;
    includes(this.festivus, name.trim().toLowerCase()) ? data.push('F') : null;

    return data;
  },
  getPrompts(fandomKey) {
    const newVal = this.prompts;
    newVal[fandomKey] = 'loading';
    this.$store.commit('setPrompts', {});
    this.$store.commit('setPrompts', newVal);

    db.ref('/prompts/' + fandomKey)
      .once('value')
      .then(snapshot => {
        let results = snapshot.val();

        if (results && results.length) {
          results = sortBy(results, o => o.username.toLowerCase());
          newVal[fandomKey] = results;
        } else {
          newVal[fandomKey] = [];
        }

        this.$store.commit('setPrompts', {});
        this.$store.commit('setPrompts', newVal);
      });
  },
  formatUrl(url) {
    if (!this.options.destyle || !url) {
      return url;
    }

    url = url.trim();

    const isDW = url.indexOf('dreamwidth.org') > -1;
    const isLJ = url.indexOf('livejournal.com') > -1;
    const isTumblr = url.indexOf('tumblr.com') > -1;
    const isDocs = url.indexOf('docs.google') > -1;

    if (isDW) {
      if (url.indexOf('?style=') === -1 && url.indexOf('&style=') === -1) {
        if (url.indexOf('?') > -1) {
          return `${url}&style=site`;
        }

        return `${url}?style=site`;
      }
    }

    if (isLJ) {
      if (
        url.indexOf('?style=') === -1 &&
        url.indexOf('&style=') === -1 &&
        url.indexOf('format=') === -1
      ) {
        if (url.indexOf('?') > -1) {
          return `${url}&format=light`;
        }

        return `${url}?format=light`;
      }
    }

    if (isTumblr) {
      if (url.indexOf('/mobile') === -1) {
        return `${url}/mobile`;
      }
    }

    if (isDocs) {
      if (url.indexOf('/mobilebasic') === -1) {
        return `${url.replace(/\/edit.*$/, '')}/mobilebasic`;
      }
    }

    return url;
  }
};
