const debug = require('debug')('TvsApi')
const request = require('request-promise-native')

exports.TvsApi = class TvsApi {

  /**
   * @param {!string} url - The URL of the API
   * @param {!string[]} keys - The API keys ordered by API level.
   */
  constructor({ url, keys }) {
    debug(`init url: ${url}, keys: ${keys}`)
    this.url = url
    this.keys = keys
  }

  _call(method, keyLevel, service, task, params) {
    debug('_call %o', { keyLevel, service, task, params })
    if (keyLevel > this.keys.length - 1) {
      throw new Error(`Key level (${keyLevel}) is not provided.`)
    }
    let url = `${this.url}?apikey=${this.keys[keyLevel]}&service=${service}`
    if (task) {
      url += `&task=${task}`
    }
    if (params) {
      url += `&${Object.entries(params).map(p => `${p[0]}=${p[1]}`).join('&')}`
    }
    debug('_call %o', { method, url })
    return method == 'GET' ? request.get({ url, json: true }) : request.post({ url, form: params })
  }

  getUserData() {
    return this._call('GET', 0, 'user')
  }

  getMessageCount() {
    return this._call('GET', 1, 'pm', 'msgcount')
  }

  /**
   * @param {number} [limit=10] - Number of messages to retrieve.
   */
  getLastMessages(limit = 10) {
    return this._call('GET', 2, 'pm', 'latest', { limit })
  }

  /**
   * @param {!string} type - Game type, can be 'tripeaks' or 'memory'.
   * @param {number} [top=10] - A number betweeen 1 and 40.
   */
  getGameTopList(type, top = 10) {
    return this._call('GET', 0, 'games', 'toplist', { type, top })
  }

  /**
   * @param {String} [format=json] - Format of the response, can be 'html', 'image', 'json'.
   */
  getEpisodeStats(format = 'json') {
    return this._call('GET', 0, 'episode', 'stats', { format })
  }

  /**
   * @param {!string} vs - The other user API key level 0.
   */
  getStatComparePicture(vs) {
    return this._call('GET', 0, 'episode', 'compare', { vs })
  }

  /**
   * @param {string} [search] - The search string in series name in all languages.
   * @param {number[]} [seriesIds] - The series ids array.
   * @param {string[]} [fields] - The field names.
   */
  getCategories(search, seriesIds = [], fields = []) {
    return this._call('GET', 0, 'episode', 'tracking', { action: 'getcategs', search, c: seriesIds.join(','), fields: fields.join(',') })
  }

  /**
   * @param {boolean} [onlyFavorites=false] - Return only the favorite groups.
   */
  getGroups(onlyFavorites = false) {
    return this._call('GET', 0, 'episode', 'tracking', { action: 'getgroups', fav: onlyFavorites ? 1 : 0 })
  }

  /**
   * @param {!number[]} seriesIds - The series ids array.
   * @param {string[]} [fields] - The field names.
   */
  getData(seriesIds, fields = []) {
    return this._call('GET', 0, 'episode', 'tracking', { action: 'getdata', c: seriesIds.join(','), fields: fields.join(',') })
  }

  /**
   * @param {!number[]} seriesIds - The series ids array.
   * @param {string[]} [fields] - The field names.
   */
  getAllData(seriesIds, fields = []) {
    return this._call('GET', 0, 'episode', 'tracking', { action: 'getalldata', c: seriesIds.join(','), fields: fields.join(',') })
  }

  /**
   * @param {!number} id - The id of the series.
   * @param {!number} seasonNumber - The season number.
   */
  getSeason(id, seasonNumber) {
    return this._call('GET', 0, 'episode', 'tracking', { action: 'getseason', c: id, s: seasonNumber })
  }

  /**
   * @param {!string} name - The name of the new group.
   * @returns {number} The id of the new group.
   */
  createGroup(name) {
    return this._call('POST', 1, 'episode', 'tracking', { action: 'creategroup', n: name })
  }

  /**
   * @param {!number} groupId - The id of the group to rename.
   * @param {!string} newName - The new name of the group.
   * @returns {number} 1 if successful, 0 if not.
   */
  renameGroup(groupId, newName) {
    return this._call('POST', 1, 'episode', 'tracking', { action: 'renamegroup', g: groupId, n: newName })
  }

  /**
   * @param {!number} groupId - The id of the group to delete.
   * @returns {number} 1 if successful, 0 if not.
   */
  deleteGroup(groupId) {
    return this._call('POST', 1, 'episode', 'tracking', { action: 'deletegroup', g: groupId })
  }

  /**
   * @param {!number} seriesId - The id of the series.
   * @param {number} [groupId] - The id of the group.
   * @returns {number} 1 if successful, 0 if not.
   */
  addSeriesToGroup(seriesId, groupId) {
    return this._call('POST', 1, 'episode', 'tracking', { action: 'setgroup', c: seriesId, g: groupId })
  }

  /**
   * @param {!number} seriesId - The id of the series.
   * @param {number} [groupId] - The id of the group, (optional).
   * @returns {Object} The series data.
   */
  startTrackingSeries(seriesId, groupId) {
    return this._call('POST', 1, 'episode', 'tracking', { action: 'addcateg', c: seriesId, g: groupId })
  }

  /**
   * @param {!number} seriesId - The id of the series.
   * @returns {number} 1 if successful, 0 if not.
   */
  stopTrackingSeriesAndDeleteAllTrackingInformation(seriesId) {
    return this._call('POST', 1, 'episode', 'tracking', { action: 'deletecateg', c: seriesId })
  }

  /**
   *
   * @param {!number} seriesId - The id of the series.
   * @param {string} language - The language.
   * @param {number} seen - 1 is seen, 0 is not seen.
   * @param {number|number[]|*} seasons - The season number like 1 or enumeration 1,2 or interval 1-2 or combined 1-2,4-5.
   * @param {number|number[]|*} [episodes] - The episode number like 1 or enumeration 1,2 or interval 1-2 or combined 1-2,4-5. If not set, then all episodes are used for the given season(s).
   */
  setSeenStatus(seriesId, language, seen, seasons, episodes) {
    return this._call('POST', 1, 'episode', 'tracking', { action: 'setstatus', c: seriesId ,s: seasons, e: episodes,l: language, status: seen })
  }

}
