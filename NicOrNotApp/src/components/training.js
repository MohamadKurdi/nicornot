import React, { Component } from 'react'
import {
  StyleSheet,
  Text,
  View,
  Image,
  Animated,
  Easing,
  Modal,
  TouchableHighlight
} from 'react-native'
import { shuffleArray } from '../lib/shuffle'
import { metrics, colors, notNicImages } from '../theme'
const { dark, accent, background, light } = colors
const { scale, duration, delayGap } = metrics
const nicImg = require('../images/headshots/nic.png')

export default class App extends Component {
  state = {
    correctCount: 0,
    currentMessage: '',
    quizPics: notNicImages
  }
  // do not use Array(4).fill(new Animated.Value(0)), it shares the instance
  animatedValuesIn = [
    new Animated.Value(0),
    new Animated.Value(0),
    new Animated.Value(0),
    new Animated.Value(0)
  ]
  animatedValuesOut = [new Animated.Value(1)]
  spin = this.animatedValuesOut[0].interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '720deg']
  })

  componentDidMount() {
    this.newQuiz()
  }

  newQuiz = () => {
    this.setState(
      {
        quizPics: this.nicPics()
      },
      this.animateIn
    )
  }

  animateIn = () => {
    this.animatedValuesOut[0].setValue(1) // reset spin-out
    const animations = this.animatedValuesIn.map(val =>
      Animated.spring(val, {
        speed: 2,
        toValue: 1,
        bounciness: 12,
        duration,
        useNativeDriver: true
      })
    )
    Animated.stagger(delayGap, animations).start()
  }

  animateOut = callback => {
    this.animatedValuesIn.map(val =>
      Animated.timing(val, {
        toValue: 0,
        duration,
        easing: Easing.cubic,
        useNativeDriver: true
      }).start()
    )

    Animated.timing(this.animatedValuesOut[0], {
      toValue: 0,
      duration,
      easing: Easing.cubic,
      useNativeDriver: true
    }).start(callback)
  }

  // 3 random pics and 1 nic
  nicPics = () => {
    let pics = []
    while (pics.length < 3) {
      const rando = Math.floor(Math.random() * notNicImages.length)
      if (pics.indexOf(rando) > -1) continue
      pics[pics.length] = rando
    }

    return shuffleArray([
      notNicImages[pics[0]],
      notNicImages[pics[1]],
      notNicImages[pics[2]],
      nicImg
    ])
  }

  picClick = idx => {
    // window.alert(idx)
    this.animateOut(this.newQuiz)
  }

  renderSingleOrb = idx => (
    <Animated.View
      style={[
        styles.orb,
        {
          opacity: this.animatedValuesIn[idx],
          transform: [
            { scaleX: this.animatedValuesIn[idx] },
            { scaleY: this.animatedValuesOut[0] },
            { rotate: this.spin }
          ]
        }
      ]}
    >
      <TouchableHighlight
        key={`orb${idx}`}
        activeOpacity={0.5}
        underlayColor={light}
        onPress={() => this.picClick(idx)}
      >
        <Image style={styles.headshot} source={this.state.quizPics[idx]} />
      </TouchableHighlight>
    </Animated.View>
  )

  renderOrbs = () => {
    return (
      <View style={styles.midContainer}>
        <View style={styles.imgRow}>
          {this.renderSingleOrb(0)}
          {this.renderSingleOrb(1)}
        </View>
        <View style={styles.imgRow}>
          {this.renderSingleOrb(2)}
          {this.renderSingleOrb(3)}
        </View>
      </View>
    )
  }

  renderTest = () => {
    return this.renderOrbs()
  }

  render() {
    return (
      <Modal animationType="fade" visible={this.props.active}>
        <View style={styles.trainingContainer}>
          <Text style={styles.regular}>
            Help us train our recognition model
          </Text>
          <Text style={styles.description}>Please Click on Nic</Text>

          {this.renderTest()}
          <View style={styles.bar} />
        </View>
      </Modal>
    )
  }
}

const styles = StyleSheet.create({
  trainingContainer: {
    flex: 1,
    justifyContent: 'center',
    paddingBottom: 100,
    backgroundColor: dark
  },
  imgRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%'
  },
  regular: {
    textAlign: 'center',
    fontSize: 16,
    color: light
  },
  description: {
    fontSize: 40,
    textAlign: 'center',
    margin: 10,
    color: accent,
    fontFamily: 'ArialRoundedMTBold'
  },
  midContainer: {
    minHeight: scale,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
    zIndex: 2
  },
  orb: {
    backgroundColor: accent,
    borderWidth: 2,
    borderColor: light,
    width: scale,
    height: scale,
    borderRadius: scale / 2,
    margin: scale / 10,
    overflow: 'hidden',
    zIndex: 3
  },
  headshot: {
    width: scale,
    height: scale
  },
  bar: {
    marginTop: -1.75 * scale,
    backgroundColor: background,
    height: scale,
    zIndex: 1
  }
})
