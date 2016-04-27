
# segment-group v1.0.0 ![experimental](https://img.shields.io/badge/stability-experimental-EC5315.svg?style=flat)

```coffee
SegmentGroup = require "segment-group"

segments = SegmentGroup()

# This value reduces the offset by a base amount.
# Use this to normalize a non-zero starting offset.
segments.top = 0



# This segment will be the first to subtract a
# fraction of its height from the offset.
segments.push
  height: 100
  onUpdate: (progress) ->
    console.log "segment[0].progress = " + progress

# Once the first segment has reduced the offset
# by its full height, this segment will be updated
# as the offset increases.
segments.push
  height: 100
  onUpdate: (progress) ->
    console.log "segment[1].progress = " + progress



# The starting offset is used to compute distance.
segments.startOffset = 50

segments.distance # => 0

segments.index    # => 0

segment = segments.array[0]

segment.progress  # => 0.5

segment.top       # => 0



segments.offset = 150

segments.distance # => 100

segments.index    # => 1

segment = segments.array[1]

segment.progress  # => 0.5

segment.top       # => 0
```
