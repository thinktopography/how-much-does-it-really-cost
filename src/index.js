import React from 'react'
import ReactDOM from 'react-dom'
import './style.less'
import data from './data.json'
import routeData from './routes.json'
import cheerio from 'cheerio'
import _ from 'lodash'

const tcat = {
  10: 416,
  11: 485,
  13: 453,
  14: 454,
  15: 455,
  17: 508,
  20: 456,
  21: 439,
  30: 440,
  31: 482,
  32: 459,
  36: 442,
  37: 443,
  40: 444,
  41: 491,
  43: 445,
  51: 489,
  52: 446,
  53: 447,
  65: 448,
  67: 449,
  70: 513,
  72: 512,
  74: 325,
  75: 465,
  77: 407,
  81: 495,
  82: 398,
  83: 487,
  90: 450,
  92: 511,
  93: 451
}

const pallettes = {
  ht: [
    { min: 0, max: 0, color: 'white' },
    { min: 1, max: 40, color: '#74add1' },
    { min: 41, max: 45, color: '#e0f3f8' },
    { min: 46, max: 50, color: '#ffffbf' },
    { min: 51, max: 55, color: '#fee090' },
    { min: 56, max: 60, color: '#fdae61' },
    { min: 61, max: 65, color: '#f46d43' },
    { min: 66, max: 75, color: '#d73027' },
    { min: 76, max: 80, color: '#a50026' },
    { min: 81, max: 85, color: '#b2182b' },
    { min: 86, color: '#67001f' }
  ],
  h: [
    { min: 0, max: 0, color: 'white' },
    { min: 1, max: 20, color: '#74add1' },
    { min: 21, max: 30, color: '#e0f3f8' },
    { min: 31, max: 40, color: '#ffffbf' },
    { min: 41, max: 50, color: '#fdae61' },
    { min: 51, max: 60, color: '#d73027' },
    { min: 61, color: '#a50026' }

  ],
  t: [
    { min: 0, max: 0, color: 'white' },
    { min: 1, max: 15, color: '#e0f3f8' },
    { min: 16, max: 20, color: '#ffffbf' },
    { min: 21, max: 25, color: '#fdae61' },
    { min: 26, max: 30, color: '#d73027' },
    { min: 31, color: '#a50026' }
  ]
}

const percentageSections = [
  {
    label: 'Housing and Transportation',
    type: 'ht',
    data: {
      ht_ami: {
        label: 'Average Income',
        title: 'Housing and Transportation Percent of Income for an Averge Income Household',
        metric: 'ht_ami',
        unit: '%'
      },
      ht_80ami: {
        label: 'Modest Income',
        title: 'Housing and Transportation Percent of Income for an Modest Income Household',
        metric: 'ht_80ami',
        unit: '%'
      }
    }
  },{
    label: 'Housing',
    type: 'h',
    data: {
      h_ami: {
        label: 'Average Income',
        title: 'Housing Percent of Income for an Averge Income Household',
        metric: 'h_ami',
        unit: '%'
      },
      h_80ami: {
        label: 'Modest Income',
        title: 'Housing Percent of Income for an Modest Income Household',
        metric: 'h_80ami',
        unit: '%'
      }
    }
  },{
    label: 'Transportation',
    type: 't',
    data: {
      t_ami: {
        label: 'Average Income',
        title: 'Transportation Percent of Income for an Averge Income Household',
        metric: 't_ami',
        unit: '%'
      },
      t_80ami: {
        label: 'Modest Income',
        title: 'Transportation Percent of Income for an Modest Income Household',
        metric: 't_80ami',
        unit: '%'
      }
    }
  }
]

const resultsSections = [
  {
    label: 'Annual Transportation Cost',
    data: {
      t_cost_ami: {
        label: 'Average Income',
        unit: '$'
      },
      t_cost_80a: {
        label: 'Modest Income',
        unit: '$'
      }
    }
  },{
    label: 'Other',
    data: {
      vmt_per_hh: {
        label: 'Annual VMT per Household',
        unit: 'mi'
      },
      co2_per_hh: {
        label: 'Annual CO2 per Household',
        unit: 'PPM'
      },
      h_cost: {
        label: 'Average Monthly Housing Cost',
        unit: '$'
      }
    }
  }
]
class Main extends React.Component {

  constructor(props) {
    super(props)
    this.ranges = {}
    this.blockgroups = []
    this.routes = []
    this.marker = null
    this.state = {
      type: 'h',
      metric: 'h_ami',
      details: null,
      legend: null,
      busRoutes: [],
      title: ''
    }
  }

  render() {
    const { details, legend, metric, title } = this.state
    return (
      <div className="wdic">
        <div className="wdic-body">
          <div className="wdic-sidebar">
            <div className="form">
              <img src="./images/logo.png" />
              <p>VHS actually. Quinoa vinyl sartorial, pour-over cronut vexillologist VHS. Af microdosing gentrify bicycle rights, marfa affogato tote bag kickstarter readymade authentic air plant craft beer poke VHS. Selvage letterpress af, lumbersexual snackwave shoreditch butcher marfa.</p>
              <form onSubmit={ this._handleSubmit.bind(this) }>
                <div className="form-group">
                  <input type="text" className="form-control" ref="street" id="street" placeholder="Street" />
                </div>
                <div className="form-group">
                  <input type="text" className="form-control" ref="city" id="city" placeholder="City" />
                </div>
                <div className="form-group">
                  <input type="text" className="form-control" ref="state" id="state" placeholder="State" defaultValue="New York" />
                </div>
                <div className="form-group">
                  <input type="text" className="form-control" ref="zip" id="zip" placeholder="Zip" />
                </div>
                <button type="submit" className="btn btn-default btn-block">Lookup my House</button>
              </form>
              { this.state.busRoutes.length > 0 &&
                <div className="routes">
                  <p>This address is located on the following TCAT bus routes:</p>
                  <ul>
                    { this.state.busRoutes.map((route, index) => {
                      return <li key={`route_${index}`}><a href={`https://tcat.nextinsight.com/routes/${ tcat[route] }`} target="_blank">{ route }</a></li>
                    }) }
                  </ul>
                </div>
              }
            </div>
          </div>
          <div className="wdic-content">
            <div className="wdic-title">
              <h1>{ title }</h1>
            </div>
            <div className="wdic-map" ref="map" />
            <div className="wdic-legend">
              { legend &&
                legend.map((segment, index) => (
                  <div className="segment" key={`metric${index}`}>
                    <div className={`key`} style={{background: segment.color}}></div>
                    <span>{ segment.max ? `${segment.min} - ${segment.max}` : `${segment.min}+` }</span>
                  </div>
                ))}
            </div>
          </div>
          <div className="wdic-details">
            { details &&
              <div>
                <div className="results">
                  <p>VHS actually. Quinoa vinyl sartorial, pour-over cronut vexillologist VHS. Af microdosing gentrify.</p>
                  { percentageSections.map((section, index) => (
                    <table key={`table_${index}`}>
                      <thead>
                        <tr>
                          <th colSpan="2">
                            <img src={`./images/${section.type}.png`} />
                            { section.label }
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        { Object.keys(section.data).map((key, row_index) => (
                          <tr key={`row_${row_index}`} onClick={ this._changeMetric.bind(this, section.type, section.data[key].metric, section.data[key].title) }>
                            <td>
                              { section.data[key].label }
                            </td>
                            <td>
                              { section.data[key].unit === '$' ? section.data[key].unit : null }
                              { details[key] }
                              { section.data[key].unit !== '$' ? section.data[key].unit : null }
                            </td>
                          </tr>
                        )) }
                      </tbody>
                    </table>
                  ))}
                </div>
                <div className="results">
                  <p>VHS actually. Quinoa vinyl sartorial, pour-over cronut vexillologist VHS. Af microdosing gentrify.</p>
                  { resultsSections.map((section, index) => (
                    <table key={`table_${index}`}>
                      <thead>
                        <tr>
                          <th colSpan="2">
                            { section.label }
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        { Object.keys(section.data).map((key, row_index) => (
                          <tr key={`row_${row_index}`}>
                            <td>
                              { section.data[key].label }
                            </td>
                            <td>
                              { section.data[key].unit === '$' ? section.data[key].unit : null }
                              { details[key] }
                              { section.data[key].unit !== '$' ? section.data[key].unit : null }
                            </td>
                          </tr>
                        )) }
                      </tbody>
                    </table>
                  ))}
                </div>
              </div>
            }
          </div>
        </div>
      </div>
    )
  }

  componentDidMount() {
    this._prepareData()
    this._drawMap()
    this._changeMetric('h', 'h_ami', 'Housing and Transportation Percent of Income for an Averge Income Household')
    $('[data-toggle="tooltip"]').tooltip();
  }

  _prepareData() {
    this.blockgroups = data.features.map((feature, index) => {
      const coordinates = feature.geometry.coordinates[0].map(coordinates => {
        return { lat: coordinates[1], lng: coordinates[0] }
      })
      const polygon = new google.maps.Polygon({
        path: coordinates
      })
      const parsed = cheerio.load(feature.properties.description)
      const rows = parsed('table table tr')
      const metadata = Object.keys(rows).reduce((metadata, index) => {
        const row = rows[index]
        if(row && row.children && row.children[1]) {
          const key = row.children[1].children[0].data
          const value = row.children[3].children[0].data
          const min = _.get(this.ranges, `${key}.min`)
          const max = _.get(this.ranges, `${key}.max`)
          if(_.isNil(min) || value < min) _.set(this.ranges, `${key}.min`, parseFloat(value))
          if(_.isNil(max)  || value > max) _.set(this.ranges, `${key}.max`, parseFloat(value))
          return {
            ...metadata,
            [key]: value
          }
        }
        return metadata
      }, {})
      return { polygon, metadata }
    })
    this.routes = routeData.features.reduce((routes, feature, index) => {
      if(!feature.geometry.coordinates) return routes
      const coordinates = feature.geometry.coordinates[0].map(coordinates => {
        return { lat: coordinates[1], lng: coordinates[0] }
      })
      const polygon = new google.maps.Polygon({
        path: coordinates
      })
      const parsed = cheerio.load(feature.properties.description)
      const rows = parsed('table table tr')
      const metadata = Object.keys(rows).reduce((metadata, index) => {
        const row = rows[index]
        if(row && row.children && row.children[1]) {
          const key = row.children[1].children[0].data
          const value = row.children[3].children[0].data
          return {
            ...metadata,
            [key]: value
          }
        }
        return metadata
      }, {})
      return [
        ...routes,
        { polygon, metadata }
      ]
    }, [])
    this.ranges = Object.keys(this.ranges).reduce((ranges, key) => {
      return {
        ...ranges,
        [key]: {
          ...this.ranges[key],
          step: (this.ranges[key].max - this.ranges[key].min) / 10
        }
      }
    }, {})
  }

  _drawMap() {
    const tompkins = { lat: 42.44738962079579, lng: -76.46789477832033 }
    const width = $(document).width()
    const zoom = (width > 1024) ? 11 : 10
    this.map = new google.maps.Map(this.refs.map, {
      zoom,
      center: tompkins
    })
    this.geocoder = new google.maps.Geocoder()
    this.blockgroups.map((blockgroup, index) => {
      this.blockgroups[index].polygon.setMap(this.map)
      this.blockgroups[index].polygon.addListener('click', this._handleClick.bind(this, this.blockgroups[index]))
    })
  }

  _handleClick(blockgroup) {
    this._changeMetric(this.state.type, this.state.metric, this.state.title)
    blockgroup.polygon.setOptions({
      fillColor: '#3690B1',
      fillOpacity: 1
    })
    this.setState({
      details: blockgroup.metadata
    })
  }

  _changeMetric(type, metric, title) {
    const legend = pallettes[type]
    this.blockgroups.map((blockgroup, index) => {
      const value = blockgroup.metadata[metric]
      const color = legend.filter(segment => {
        const min = segment.min
        const max = !_.isNil(segment.max) ? segment.max : 1000
        return value >= min && value <= max
      })[0].color
      blockgroup.polygon.setOptions({
        fillOpacity: .5,
        fillColor: color,
        strokeOpacity: 1,
        strokeColor: '#888888',
        strokeWeight: 1
      })
    })
    this.setState({ type, metric, legend, title })
  }

  _handleSubmit(e) {
    const street = this.refs.street.value
    const city = this.refs.city.value
    const state = this.refs.state.value
    const zip = this.refs.zip.value
    const address = `${street} ${city} ${state} ${zip}`
    this.geocoder.geocode({ address }, (results, status) => {
      if(status == google.maps.GeocoderStatus.OK) {
        const latLng = new google.maps.LatLng(results[0].geometry.location.lat(), results[0].geometry.location.lng())
        const busRoutes = this.routes.reduce((routes, route, index) => {
          if(!google.maps.geometry.poly.containsLocation(latLng, route.polygon)) return routes
          if(_.includes(routes, route.metadata.RT_NUM)) return routes
          return [
            ...routes,
            route.metadata.RT_NUM
          ]
        }, []).sort()
        this.setState({
          busRoutes
        })
        const blockgroup = this.blockgroups.reduce((chosen, blockgroup) => {
          if(!google.maps.geometry.poly.containsLocation(latLng, blockgroup.polygon)) return chosen
          return blockgroup
        }, null)
        this._handleClick(blockgroup)
      }
    })
    e.preventDefault()
    return false
  }

}



ReactDOM.render(<Main />, document.getElementById('app'))
