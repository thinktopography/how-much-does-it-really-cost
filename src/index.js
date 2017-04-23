import React from 'react'
import ReactDOM from 'react-dom'
import './style.less'
import data from './data.json'
import cheerio from 'cheerio'
import _ from 'lodash'

const pallettes = {
  h: [
    { min: 0, max: 0, color: 'white' },
    { min: 1, max: 40, color: 'red' },
    { min: 41, max: 45, color: 'orange' },
    { min: 46, max: 50, color: 'yellow' },
    { min: 51, max: 55, color: 'green' },
    { min: 56, max: 60, color: 'blue' },
    { min: 66, max: 75, color: 'purple' },
    { min: 76, max: 80, color: 'violet' },
    { min: 81, max: 85, color: 'brown' },
    { min: 86, max: 90, color: 'grey' },
    { min: 90, max: 100, color: 'black' }
  ],
  t: [
    { min: 0, max: 0, color: 'white' },
    { min: 1, max: 20, color: 'red' },
    { min: 21, max: 30, color: 'orange' },
    { min: 31, max: 40, color: 'yellow' },
    { min: 41, max: 50, color: 'green' },
    { min: 51, max: 60, color: 'blue' },
    { min: 61, max: 100, color: 'purple' }

  ],
  ht: [
    { min: 0, max: 0, color: 'white' },
    { min: 1, max: 15, color: 'red' },
    { min: 16, max: 20, color: 'orange' },
    { min: 21, max: 25, color: 'yellow' },
    { min: 26, max: 30, color: 'green' },
    { min: 31, max: 100, color: 'blue' }
  ]
}

const sections = [
  {
    label: 'Housing and Transportation Percentage of Income',
    data: {
      ht_ami: {
        label: 'Average Income',
        unit: '%'
      },
      ht_80ami: {
        label: 'Modest Income',
        unit: '%'
      }
    }
  },{
    label: 'Housing Percentage of Income',
    data: {
      h_ami: {
        label: 'Average Income',
        unit: '%'
      },
      h_80ami: {
        label: 'Modest Income',
        unit: '%'
      }
    }
  },{
    label: 'Transportation Percentage of Income',
    data: {
      t_ami: {
        label: 'Average Income',
        unit: '%'
      },
      t_80ami: {
        label: 'Modest Income',
        unit: '%'
      }
    }
  },{
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
        label: 'Annual Vehicle Miles Traveled per Household',
        unit: 'mi'
      },
      co2_per_hh: {
        label: 'Annual CO2 released per Household',
        unit: 'PPM'
      },
      h_cost: {
        label: 'Average Monthly Housing Cost per Household',
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
    this.marker = null
    this.state = {
      type: 'h',
      metric: 'h_ami',
      details: null,
      legend: null
    }
  }

  render() {
    const { details, legend, metric } = this.state
    return (
      <div className="wdic">
        <div className="wdic-header">
          <div className="metric">
            <h5>Housing</h5>
            <div className="btn-group">
              <button type="button" className={`btn ${metric === 'h_ami' ? 'btn-danger' : 'btn-default'}`} onClick={ this._changeMetric.bind(this, 'h', 'h_ami')}>Average Income</button>
              <button type="button" className={`btn ${metric === 'h_80ami' ? 'btn-danger' : 'btn-default'}`} onClick={ this._changeMetric.bind(this, 'h', 'h_80ami')}>Modest Income</button>
            </div>
          </div>
          <div className="metric">
            <h5>Transportation</h5>
            <div className="btn-group">
              <button type="button" className={`btn ${metric === 't_ami' ? 'btn-danger' : 'btn-default'}`} onClick={ this._changeMetric.bind(this, 't', 't_ami')}>Average Income</button>
              <button type="button" className={`btn ${metric === 't_80ami' ? 'btn-danger' : 'btn-default'}`} onClick={ this._changeMetric.bind(this, 't', 't_80ami')}>Modest Income</button>
            </div>
          </div>
          <div className="metric">
            <h5>Housing & Transportation</h5>
            <div className="btn-group">
              <button type="button" className={`btn ${metric === 'ht_ami' ? 'btn-danger' : 'btn-default'}`} onClick={ this._changeMetric.bind(this, 'ht', 'ht_ami')}>Average Income</button>
              <button type="button" className={`btn ${metric === 'ht_80ami' ? 'btn-danger' : 'btn-default'}`} onClick={ this._changeMetric.bind(this, 'ht', 'ht_80ami')}>Modest Income</button>
            </div>
          </div>
        </div>
        <div className="wdic-body">
          <div className="wdic-sidebar">
            <div className="form">
              <h4>What Does it Really Cost?</h4>
              <p>VHS actually. Quinoa vinyl sartorial, pour-over cronut vexillologist VHS. Af microdosing gentrify bicycle rights, marfa affogato tote bag kickstarter readymade authentic air plant craft beer poke VHS. Selvage letterpress af, lumbersexual snackwave shoreditch butcher marfa. Small batch kombucha offal kinfolk hella, vice hexagon literally mumblecore</p>
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
                <button type="submit" className="btn btn-default btn-block btn-danger">Lookup my House</button>
              </form>
            </div>
          </div>
          <div className="wdic-map" ref="map" />
          <div className="wdic-details">
            { details &&
              <div>
                <h4>BLOCKGROUP { details.ID }</h4>
                { sections.map(section => (
                  <table>
                    <tr>
                      <th colSpan="2">{ section.label }</th>
                    </tr>
                    { Object.keys(section.data).map(key => (
                      <tr>
                        <td>{ section.data[key].label }</td>
                        <td>
                          { section.data[key].unit === '$' ? section.data[key].unit : null }
                          { details[key] }
                          { section.data[key].unit !== '$' ? section.data[key].unit : null }
                        </td>
                      </tr>
                    )) }
                  </table>
                ))}
              </div>
            }
          </div>
        </div>
        <div className="wdic-footer">
          { legend &&
            legend.map((segment, index) => (
              <div className="segment" key={`metric${index}`}>
                <div className={`key`} style={{background: segment.color}}></div>
                <span>{ segment.min } - { segment.max }</span>
              </div>
            ))}
        </div>
      </div>
    )
  }

  componentDidMount() {
    this._prepareData()
    this._drawMap()
    this._changeMetric('h', 'h_ami')
  }

  _prepareData() {
    this.blockgroups = data.features.map((feature, index) => {
      const coordinates = feature.geometry.coordinates[0].map(coordinates => {
        return { lat: coordinates[1], lng: coordinates[0] }
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

      return { coordinates, metadata }
    })
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
    var tompkins = { lat: 42.44738962079579, lng: -76.46789477832033 }
    this.map = new google.maps.Map(this.refs.map, {
      zoom: 11,
      center: tompkins
    })
    this.geocoder = new google.maps.Geocoder()

    this.blockgroups.map((blockgroup, index) => {
      this.blockgroups[index].polygon = new google.maps.Polygon({
        path: blockgroup.coordinates,
        strokeOpacity: 1,
        strokeWeight: 1,
        fillOpacity: 0.35
      })
      this.blockgroups[index].polygon.setMap(this.map)

      this.blockgroups[index].polygon.addListener('click', this._handleClick.bind(this, this.blockgroups[index]))
    })
  }

  _handleClick(blockgroup) {
    this._changeMetric(this.state.type, this.state.metric)
    blockgroup.polygon.setOptions({ fillOpacity: 1 });
    this.setState({
      details: blockgroup.metadata
    })
  }

  _changeMetric(type, metric) {
    const legend = pallettes[type]
    this.blockgroups.map((blockgroup, index) => {
      const value = blockgroup.metadata[metric]
      const color = legend.filter(segment => {
        return value >= segment.min && value <= segment.max
      })[0].color
      blockgroup.polygon.setOptions({
        fillOpacity: 0.35,
        strokeColor: color,
        fillColor: color
      })
    })
    this.setState({ type, metric, legend })
  }

  _handleSubmit(e) {
    const street = this.refs.street.value
    const city = this.refs.city.value
    const state = this.refs.state.value
    const zip = this.refs.zip.value
    const address = `${street} ${city} ${state} ${zip}`
    this.geocoder.geocode({ address }, (results, status) => {
      if(status == google.maps.GeocoderStatus.OK) {
        if(this.marker) {
          this.marker.setMap(null);
          this.marker = null
        }
        this.marker = new google.maps.Marker({
          map: this.map,
          position: results[0].geometry.location
        })
      } else {
        console.log('foo')
      }
    })
    e.preventDefault()
    return false
  }

}



ReactDOM.render(<Main />, document.getElementById('app'))
