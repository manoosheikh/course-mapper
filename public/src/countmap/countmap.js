function CountMap(options) {
  var self = this;
  var segments = valuesToSegments(options.segments, options.segmentKey, options.totalSegments);
  var elementWidth = (segments && segments.length > 0) ? (100 / segments.length) : 0;
  var colorful = options.colorful;
  var container = document.getElementsByClassName(options.container)[0];
  container.style.background = getHeatmap(segments, options.maxValue);
  var tooltip = document.getElementsByClassName(options.tooltip)[0];

  // Attach tooltip hover event
  container.onmousemove = function (e) {
    var rect = container.getBoundingClientRect();
    var xPos = e.clientX;
    var yPos = rect.top - 23;
    tooltip.style.left = (xPos) + 'px';
    tooltip.style.top = (yPos) + 'px';
    tooltip.innerText = getHoveredElementNumber(rect, e);
  };

  container.onclick = function (e) {
    if (self.onCountSelected) {
      var rect = container.getBoundingClientRect();
      var count = getHoveredElementNumber(rect, e);
      self.onCountSelected(count);
    }
  };

  function valuesToSegments(items, name, totalPages) {
    var countsList = _.reduce(items, function (result, value, k) {
      var p = value[name];
      if (!result[p]) result[p] = 0;
      result[p] += 1;
      return result;
    }, {});

    var values = [];
    values.length = totalPages;
    for (var i = 0; i < values.length; i++) {
      var page = i + 1;
      if (countsList[page]) {
        values[i] = countsList[page];
      }
    }
    return values;
  }


  function getHoveredElementNumber(rect, e) {
    var scrollLeft = document.documentElement.scrollLeft ?
      document.documentElement.scrollLeft :
      document.body.scrollLeft;

    var elementLeft = rect.left + scrollLeft;

    var xPos = 0;
    if (document.all) { //detects using IE
      xPos = e.clientX + scrollLeft - elementLeft; //event not evt because of IE
    }
    else {
      xPos = e.pageX - elementLeft;
    }
    var progress = xPos / rect.width;
    // Compute number
    return Math.floor((progress / elementWidth) * 100 + 1);
  }

  function getHeatmap(values, maxValue) {
    var background = '';
    for (var i = 0; i < values.length; i++) {
      var heat = values[i] / maxValue;
      var color = percentToHSLColor(heat);
      var colorStop = elementWidth * (i + 1);
      background += 'linear-gradient(to right, ' + color + ' ' + colorStop + '%, transparent 0%),';
    }
    return background;
  }

  /*
   *  Compute the HSL color value.
   *
   **/
  function percentToHSLColor(value) {
    var normalizedValue = normalizeValue(value);

    var h, l, s;
    if (colorful === true) {
      h = (1.0 - normalizedValue) * 320;
      l = 120 * normalizedValue;
      s = normalizedValue ? 50 : 90;
    }
    else {
      h = 202;
      l = 52;
      s = 100 - normalizedValue * 50;
    }
    return buildHSL(h, l, s);
  }

  function buildHSL(h, s, l) {
    return 'hsl(' + h + ', ' + s + '%, ' + l + '%)';
  }

  function normalizeValue(value) {
    if (!value) {
      return 0.0;
    } else if (value > 1.0) {
      return 1.0;
    } else if (value < 0.0) {
      return 0.0;
    }
    return value;
  }
}