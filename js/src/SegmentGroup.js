var Factory, LazyVar, Progress, Segment, Shape, assertType, ref;

ref = require("type-utils"), assertType = ref.assertType, Shape = ref.Shape;

Progress = require("progress");

LazyVar = require("lazy-var");

Factory = require("factory");

Segment = Shape("Segment", {
  height: Number,
  onUpdate: Function
});

module.exports = Factory("SegmentGroup", {
  statics: {
    Segment: Segment
  },
  customValues: {
    offset: {
      get: function() {
        return this._offset;
      },
      set: function(offset) {
        var segment;
        assertType(offset, Number, "offset");
        this._offset = offset;
        segment = this._computeSegment(offset);
        this._updateSegments(segment, this._index);
        return this._index = segment;
      }
    },
    startOffset: {
      get: function() {
        return this._startOffset;
      },
      set: function(startOffset) {
        var segment;
        this._offset = startOffset;
        this._startOffset = startOffset;
        if (startOffset === null) {
          this._startIndex = null;
          return this._index = null;
        } else {
          segment = this._computeSegment(startOffset);
          this._startIndex = segment;
          this._index = segment;
          return this._updateSegments(segment);
        }
      }
    },
    distance: {
      get: function() {
        return this.offset - this.startOffset;
      }
    },
    height: {
      get: function() {
        return this._height.get();
      }
    },
    index: {
      get: function() {
        return this._index;
      }
    },
    startIndex: {
      get: function() {
        return this._startIndex;
      }
    }
  },
  initValues: function(segments) {
    return {
      top: null,
      array: [],
      _offset: null,
      _startOffset: null,
      _index: 0,
      _startIndex: null,
      _height: LazyVar((function(_this) {
        return function() {
          var height, i, len, ref1, segment;
          height = 0;
          ref1 = _this.array;
          for (i = 0, len = ref1.length; i < len; i++) {
            segment = ref1[i];
            segment.top = height;
            height += segment.height;
          }
          return height;
        };
      })(this))
    };
  },
  push: function(segment) {
    assertType(segment, Segment, "segment");
    this.array.push(segment);
    if (this._height.hasValue) {
      segment.top = this._height.get();
      this._height.set(segment.top + segment.height);
    }
  },
  _computeSegment: function(offset) {
    var array, height, index, maxIndex, top, y;
    top = this.top, array = this.array;
    assertType(offset, Number);
    assertType(top, Number, "this.top");
    y = offset - top;
    maxIndex = array.length - 1;
    if (maxIndex < 0) {
      return 0;
    }
    index = 0;
    height = 0;
    while (true) {
      height += array[index].height;
      if ((y <= height) || (index === maxIndex)) {
        break;
      }
      index += 1;
    }
    return index;
  },
  _computeSegmentProgress: function(segment, offset) {
    this._height.get();
    return Progress.fromValue(offset, {
      fromValue: segment.top,
      toValue: segment.top + segment.height,
      clamp: true
    });
  },
  _updateSegments: function(index, oldIndex) {
    var fromIndex, toIndex;
    if ((oldIndex == null) || (index - oldIndex === 0)) {
      this._updateSegment(index);
      return;
    }
    if (index < oldIndex) {
      fromIndex = index;
      toIndex = oldIndex;
    } else {
      fromIndex = oldIndex;
      toIndex = index;
    }
    index = fromIndex;
    while (index <= toIndex) {
      this._updateSegment(index);
      index += 1;
    }
  },
  _updateSegment: function(index) {
    var progress, segment;
    segment = this.array[index];
    progress = this._computeSegmentProgress(segment, this._offset);
    if (segment.progress === progress) {
      return;
    }
    segment.onUpdate(progress);
    return segment.progress = progress;
  }
});

//# sourceMappingURL=../../map/src/SegmentGroup.map
