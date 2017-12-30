const { TvsApi } = require('./TvsApi.js')

exports.Tvs = class Tvs {

  constructor(config) {
    this.api = new TvsApi(config)
  }

  async magic(language) {
    const groups = await this.api.getGroups()
    this.trackedSeriesIds = []
    for (let groupId in groups) {
      const group = groups[groupId]
      this.trackedSeriesIds = this.trackedSeriesIds.concat(group.categs)
    }
    const data = await this.api.getAllData(this.trackedSeriesIds)
    const result = []
    for (let seriesId in data) {
      const series = data[seriesId]
      const lastSeason = Object.entries(series.epnums).pop()
      const seenAll = series.lastseen == `${lastSeason[0]}x${lastSeason[1]}`
      if (seenAll) {
        continue
      }
      const seasons = []
      for (let seasonNumber in series.episodes) {
        const season = series.episodes[seasonNumber]
        let seasonStatus = 2
        for (let episodeNumber in season) {
          const episode = season[episodeNumber]
          if (seasonStatus == 2 && episode[language] != 2) {
            seasonStatus = episode[language]
          }
        }
        if (seasonStatus == 2) {
          seasons.push(seasonNumber)
        }
      }
      if (seasons.length > 0) {
        result.push({ series, seasons })
      }
    }
    return result
  }

}
