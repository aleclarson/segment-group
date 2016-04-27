
{ assertType, Shape } = require "type-utils"

Progress = require "progress"
LazyVar = require "lazy-var"
Factory = require "factory"

Segment = Shape "Segment",
  height: Number
  onUpdate: Function

module.exports = Factory "SegmentGroup",

  statics: { Segment }

  customValues:

    offset:
      get: -> @_offset
      set: (offset) ->
        assertType offset, Number, "offset"
        @_offset = offset
        segment = @_computeSegment offset
        @_updateSegments segment, @_index
        @_index = segment

    startOffset:
      get: -> @_startOffset
      set: (startOffset) ->
        @_offset = startOffset
        @_startOffset = startOffset
        if startOffset is null
          @_startIndex = null
          @_index = null
        else
          segment = @_computeSegment startOffset
          @_startIndex = segment
          @_index = segment
          @_updateSegments segment

    distance: get: -> # TODO: Maybe back this with a LazyVar.
      @offset - @startOffset

    height: get: ->
      @_height.get()

    index: get: ->
      @_index

    startIndex: get: ->
      @_startIndex

  initValues: (segments) ->

    top: null

    array: []

    _offset: null

    _startOffset: null

    _index: 0

    _startIndex: null

    _height: LazyVar =>
      height = 0
      for segment in @array
        segment.top = height
        height += segment.height
      return height

  push: (segment) ->
    assertType segment, Segment, "segment"
    @array.push segment
    if @_height.hasValue
      segment.top = @_height.get()
      @_height.set segment.top + segment.height
    return

  # TODO: Search from the current segment for efficiency.
  _computeSegment: (offset) ->
    { top, array } = this
    assertType offset, Number
    assertType top, Number, "this.top"
    y = offset - top
    maxIndex = array.length - 1
    return 0 if maxIndex < 0
    index = 0
    height = 0
    loop
      height += array[index].height
      break if (y <= height) or (index is maxIndex)
      index += 1
    return index

  _computeSegmentProgress: (segment, offset) ->
    @_height.get() # Ensure 'segment.top' exists!
    Progress.fromValue offset,
      fromValue: segment.top
      toValue: segment.top + segment.height
      clamp: yes

  _updateSegments: (index, oldIndex) ->

    if (not oldIndex?) or (index - oldIndex is 0)
      @_updateSegment index
      return

    if index < oldIndex
      fromIndex = index
      toIndex = oldIndex
    else
      fromIndex = oldIndex
      toIndex = index

    index = fromIndex
    while index <= toIndex
      @_updateSegment index
      index += 1
    return

  _updateSegment: (index) ->
    segment = @array[index]
    progress = @_computeSegmentProgress segment, @_offset
    return if segment.progress is progress
    segment.onUpdate progress
    segment.progress = progress
