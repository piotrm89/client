// @flow
import React, {PureComponent} from 'react'
import * as Flow from '../util/flow'
import {FlatList, View} from 'react-native'
import * as Styles from '../styles'

import type {Props} from './list2'

class List2<T> extends PureComponent<Props<T>, void> {
  static defaultProps = {
    keyboardShouldPersistTaps: 'handled',
  }

  _itemRender = ({item, index}) => {
    // $ForceType
    const itemT: T = item
    return this.props.renderItem(index, itemT)
  }

  _getItemLayout = (data, index) => {
    switch (this.props.itemHeight.type) {
      case 'fixed':
        return {height: this.props.itemHeight.height, index, offset: this.props.itemHeight.height * index}
      case 'variable': {
        const itemT: T = data[index]
        return {index, ...this.props.itemHeight.getItemLayout(index, itemT)}
      }
      default:
        Flow.ifFlowComplainsAboutThisFunctionYouHaventHandledAllCasesInASwitch(this.props.itemHeight.type)
        return {height: 0, index, offset: 0}
    }
  }

  _keyExtractor = (item, index: number) => {
    if (this.props.indexAsKey || !item) {
      return String(index)
    }

    const keyProp = this.props.keyProperty || 'key'
    // $ForceType
    const key: string = String(item[keyProp])
    return key
  }

  render() {
    return (
      <View style={Styles.collapseStyles([styles.outerView, this.props.style])}>
        {/* need windowSize so iphone 6 doesn't have OOM issues */}
        <FlatList
          bounces={this.props.bounces}
          renderItem={this._itemRender}
          data={this.props.items}
          getItemLayout={this._getItemLayout}
          keyExtractor={this._keyExtractor}
          keyboardShouldPersistTaps={this.props.keyboardShouldPersistTaps}
          onEndReached={this.props.onEndReached}
          windowSize={this.props.windowSize || 10}
          debug={false /* set to true to debug the list */}
        />
      </View>
    )
  }
}

const styles = Styles.styleSheetCreate({
  outerView: {
    flexGrow: 1,
    position: 'relative',
  },
})

export default List2
