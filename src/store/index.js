const state = {
  loadedChars: false,
  loaded: false,
  loadedHasPrompts: false,
  loadAll: {
    characters: false,
    fandoms: false,
    letters: false
  },
  characters: {},
  fandoms: [],
  hasPrompts: {},
  prompts: {},
  bookmarks: [],
  promptmarks: [],
  user: null,
  userPrompts: [],
  categories: [],
  unlock: true,
  showEasterEggs: false,
  options: {
    filter: {
      category: '',
      term: ''
    },
    onlyBookmarks: false,
    onlyPrompts: false,
    onlyPHs: false,
    destyle: false,
    hideCharacters: false
  }
};

const mutations = {
  addChar(state, payload) {
    const old = Object.keys(state.characters).length;
    const newVal = state.characters;
    newVal[payload.key] = payload.result;
    state.characters = {};
    state.characters = newVal;
  },
  loadAllChars(state, val) {
    state.loadAll.characters = true;
  },
  setCharsLoaded(state, val) {
    state.loadedChars = true;
  },
  setCharacters(state, characters) {
    state.characters = characters;
  },

  setLetters(state, letters) {
    state.letters = letters;
  },

  setDbLoaded(state, val) {
    state.loaded = val;
  },

  setHasPromptsLoaded(state, val) {
    state.loadedHasPrompts = val;
  },

  setFandoms(state, fandoms) {
    state.fandoms = fandoms;
  },

  setHasPrompts(state, hasPrompts) {
    state.hasPrompts = hasPrompts;
  },

  setPrompts(state, prompts) {
    state.prompts = prompts;
  },

  setPromptmarks(state, promptmarks) {
    state.promptmarks = promptmarks;
  },

  setBookmarks(state, bookmarks) {
    state.bookmarks = bookmarks;
  },

  setLettermarks(state, lettermarks) {
    state.lettermarks = lettermarks;
  },

  setUser(state, user) {
    state.user = user;
  },

  setUserPrompts(state, prompts) {
    state.userPrompts = prompts;
  },

  setCategories(state, categories) {
    state.categories = categories;
  },

  setOptions(state, options) {
    state.options = options;
  },

  setUnlock(state, unlock) {
    state.unlock = unlock;
  },

  setEggs(state, val) {
    state.showEasterEggs = val;
  }
};

const getters = {
  loadAll: state => state.loadAll,
  loadedChars: state => state.loadedChars,
  loadedHasPrompts: state => state.loadedHasPrompts,
  characters: state => state.characters,
  letters: state => state.letters,
  hasPrompts: state => state.hasPrompts,
  loaded: state => state.loaded,
  fandoms: state => state.fandoms,
  prompts: state => state.prompts,
  categories: state => state.categories,
  bookmarks: state => state.bookmarks,
  lettermarks: state => state.lettermarks,
  promptmarks: state => state.promptmarks,
  user: state => state.user,
  userPrompts: state => state.userPrompts,
  options: state => state.options,
  unlock: state => state.unlock,
  showEasterEggs: state => state.showEasterEggs
};

export default {
  state,
  mutations,
  getters
};
