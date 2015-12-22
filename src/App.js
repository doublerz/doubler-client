import React, { Component } from 'react'
import ReactDOM from 'react-dom'
import SimpleWebRTC from 'simplewebrtc'

// Key Codes
const W = 87
const A = 65
const S = 83
const D = 68
const LEFT = 37
const UP = 38
const RIGHT = 39
const DOWN = 40

const MAX_SPEED = 255
const TURN_SPEED = MAX_SPEED / 1.4

function clamp (value, min, max) {
  if (value > max) return max
  if (value < min) return min
  return value
}

function clampSpeed (value) {
  return clamp(value, -MAX_SPEED, MAX_SPEED)
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
    if (~keys.indexOf(W) || ~keys.indexOf(UP)) {
      speeds[0] = MAX_SPEED
      speeds[1] = MAX_SPEED
    } else if (~keys.indexOf(S) || ~keys.indexOf(DOWN)) {
      direction = -1
      speeds[0] = -MAX_SPEED
      speeds[1] = -MAX_SPEED
    }
    if (~keys.indexOf(A) || ~keys.indexOf(LEFT)) {
      speeds[0] = clampSpeed(speeds[0] - TURN_SPEED * direction)
      speeds[1] = clampSpeed(speeds[1] + TURN_SPEED * direction)
    } else if (~keys.indexOf(D) || ~keys.indexOf(RIGHT)) {
      speeds[0] = clampSpeed(speeds[0] + TURN_SPEED * direction)
      speeds[1] = clampSpeed(speeds[1] - TURN_SPEED * direction)
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
