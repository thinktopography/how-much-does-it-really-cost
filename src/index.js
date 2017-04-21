import React from 'react'
import ReactDOM from 'react-dom'
import './style.less'
import data from './data.json'
import cheerio from 'cheerio'
import _ from 'lodash'

class Main extends React.Component {

  constructor(props) {
    super(props)
    this.ranges = {}
    this.blockgroups = []
    this.marker = null
  }

  render() {
    return (
      <div className="wdic">
        <div className="wdic-header">
          <div className="row">
            <div className="col-lg-12 text-center">
              <div className="btn-group">
                <button type="button" className="btn btn-default" onClick={ this._changeMetric.bind(this, 'h_ami')}>h_ami</button>
                <button type="button" className="btn btn-default" onClick={ this._changeMetric.bind(this, 'h_80ami')}>h_80ami</button>
                <button type="button" className="btn btn-default" onClick={ this._changeMetric.bind(this, 'h_nmi')}>h_nmi</button>
                <button type="button" className="btn btn-default" onClick={ this._changeMetric.bind(this, 'ht_ami')}>ht_ami</button>
                <button type="button" className="btn btn-default" onClick={ this._changeMetric.bind(this, 'ht_80ami')}>ht_80ami</button>
                <button type="button" className="btn btn-default" onClick={ this._changeMetric.bind(this, 'ht_nmi')}>ht_nmi</button>
              </div>
            </div>
          </div>
        </div>
        <div className="wdic-body">
          <div className="wdic-sidebar">
            <div className="form">
              <h2>Find My House</h2>
              <p>Enter your address below to find out the specific details for your home</p>
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
                <button type="submit" className="btn btn-default btn-block btn-danger">Locate</button>
              </form>
            </div>
          </div>
          <div className="wdic-map" ref="map" />
        </div>
        <div className="wdic-footer">
          { [0,1,2,3,4,5,6,7,8,9].map(index => {
            return (
              <div className="segment" key={`metric${index}`}>
                <div className={`key segment${index}`}></div>
                <span ref={`metric${index}`} />
              </div>
            )
          })}
        </div>
      </div>
    )
  }

  componentDidMount() {
    this._prepareData()
    this._drawMap()
    this._changeMetric('h_ami')
  }

  _prepareData() {
    this.blockgroups = data.features.map((feature, index) => {
      const coordinates = feature.geometry.coordinates[0].map(coordinates => {
        return { lat: coordinates[1], lng: coordinates[0] }
      })
      const table = cheerio.load(feature.properties.description)
      const rows = table('table table tr')
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
        strokeColor: '#FF0000',
        strokeOpacity: 0.8,
        strokeWeight: 1,
        fillColor: '#FF0000',
        fillOpacity: 0.35
      })
      this.blockgroups[index].polygon.setMap(this.map)
    })
  }

  _changeMetric(key) {
    this.blockgroups.map((blockgroup, index) => {
      const value = blockgroup.metadata[key]
      const step = this.ranges[key].step
      const fillOpacity = Math.floor(value / step) / 10
      blockgroup.polygon.setOptions({ fillOpacity });
    })
    const segments = [0,1,2,3,4,5,6,7,8,9]
    segments.map(segment => {
      const min = this.ranges[key].min + this.ranges[key].step * segment
      const max = (min + this.ranges[key].step).toFixed(2) - .01
      this.refs[`metric${segment}`].innerHTML = `${min.toFixed(2)} - ${max.toFixed(2)}`
    })
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
