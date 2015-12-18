import React, { Component } from 'react'
import ReactDOM from 'react-dom'
import SimpleWebRTC from 'simplewebrtc'

const W = 87
const A = 65
const S = 83
const D = 68
const maxSpeed = 255
const turnSpeed = maxSpeed / 1.5

function clamp (value, min, max) {
  if (value > max) return max
  if (value < min) return min
  return value
}

function clampSpeed (value) {
  return clamp(value, -maxSpeed, maxSpeed)
}

export class App extends Component {
  constructor (props, context) {
    super(props, context)
    this.state = { keys: [] }
    this.handleKeyDown = this.handleKeyDown.bind(this)
    this.handleKeyUp = this.handleKeyUp.bind(this)
  }

  componentDidMount () {
    document.addEventListener('keydown', this.handleKeyDown)
    document.addEventListener('keyup', this.handleKeyUp)
    this._webrtc = new SimpleWebRTC({
      localVideoEl: this.refs.local,
      remoteVideosEl: this.refs.remotes,
      autoRequestMedia: true,
      debug: true
    }).once('readyToCall', () => {
      this._webrtc.joinRoom('tractor-beam')
    })
  }

  componentWillUnmount () {
    document.removeEventListener('keydown', this.handleKeyDown)
    document.removeEventListener('keyup', this.handleKeyUp)
    this._webrtc.leaveRoom()
  }

  updateSpeeds (keys) {
    let direction = 1
    const speeds = [0, 0]
    if (~keys.indexOf(W)) {
      speeds[0] = maxSpeed
      speeds[1] = maxSpeed
    } else if (~keys.indexOf(S)) {
      direction = -1
      speeds[0] = -maxSpeed
      speeds[1] = -maxSpeed
    }
    if (~keys.indexOf(A)) {
      speeds[0] = clampSpeed(speeds[0] - turnSpeed * direction)
      speeds[1] = clampSpeed(speeds[1] + turnSpeed * direction)
    } else if (~keys.indexOf(D)) {
      speeds[0] = clampSpeed(speeds[0] + turnSpeed * direction)
      speeds[1] = clampSpeed(speeds[1] - turnSpeed * direction)
    }
    this._webrtc.sendDirectlyToAll('control', 'speeds', speeds)
  }

  handleKeyDown (e) {
    const keys = this.state.keys.concat(e.keyCode)
    this.setState({ keys })
    this.updateSpeeds(keys)
  }

  handleKeyUp (e) {
    const keys = this.state.keys.filter(k => k !== e.keyCode)
    this.setState({ keys })
    this.updateSpeeds(keys)
  }

  render () {
    return (
      <div>
        <video className='local' ref='local'/>
        <div className='remotes' ref='remotes'/>
      </div>
    )
  }
}
