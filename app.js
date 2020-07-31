// Brush
function Brush (name, palette, weight = 1) {
  this.name = name
  this.count = 0
  // attributes
  this.palette = palette
  this.weight = 1
  this.pressure = 1
  this.size = 2000 // M
  this.interval = 1
  this.blendMode = MULTIPLY
}
Brush.prototype.render = function (points, x, y) { }
Brush.prototype.setAttributes = function ({ blendMode, palette, presure, interval, weight, size }) {
  this.blendMode = blendMode ? blendMode : this.blendMode
  this.palette = palette ? palette : this.palette
  this.presure = presure ? presure : this.presure
  this.interval = interval ? interval : this.interval
  this.weight = weight ? weight : this.weight
  this.size = size ? size : this.size
}

// DotBrush
function DotBrush () {
  Brush.call(this, 'Dot', ['#000000'])
}
DotBrush.prototype = Object.create(Brush.prototype)
DotBrush.prototype.constructor = DotBrush
DotBrush.prototype.render = function(points, x, y) {
  if (this.count % 3 === 0) {
    push()
    points.push(createVector(x, y))
    strokeWeight(random(4))
    const rgbColor = hexToRgb(random(this.palette))
    stroke(rgbColor.r, rgbColor.g, rgbColor.b, noise(this.count) * this.pressure)
    point(x, y)
    pop()
  }
  this.count++
}

// FlowerBrush
function FlowerBrush () {
  Brush.call(this, 'Flower', ['#000000'])
  this.createFurBall = function (x, y) {
    let inc = TWO_PI / 12
    for (let i = 0; i < TWO_PI; i += inc) {
      let vx = sin(i)
      let vy = cos(i)
      const size = random(4, 6)
      // stroke(30, random(0, 1))
      const rgbColor = hexToRgb(random(this.palette))
      stroke(rgbColor.r, rgbColor.g, rgbColor.b, random(0, 1))
      line(x, y, x + vx * size, y + vy * size)
    }
  }
  this.createFurBallFlower = function (x, y, vx, vy) {
    const tx = x + vx * random(5, 10)
    const ty = y - vy * random(5, 10)
    const rgbColor = hexToRgb(random(this.palette))
    stroke(rgbColor.r, rgbColor.g, rgbColor.b, random(0, 1))
    line(x, y, tx, ty)
    this.createFurBall(tx, ty)
  }
}
FlowerBrush.prototype = Object.create(Brush.prototype)
FlowerBrush.prototype.constructor = FlowerBrush
FlowerBrush.prototype.render = function(points, x, y) {
  if (this.count % 11 === 0) {
    points.forEach((point, index) => {
      const dx = point.x - x
      const dy = point.y - y
      const d = dx * dx + dy * dy
      if (d < 50) {
        if (index > 0) {
          // // console.log(point.x +' x ' +point.y)
          const vector = point.copy().sub(points[index - 1])
          const vectorNormal = vector.normalize()
          this.createFurBallFlower(point.x, point.y, vectorNormal.y, vectorNormal.x)
          // const cx = (point.x + points[index - 1].x)/2
          // const cy = (point.y + points[index - 1].y)/2
          // this.createFurBallFlower(cx, cy, vectorNormal.y, vectorNormal.x)
        }
      }
    })
  }
  this.count++
}

// LinkBrush
function LinkBrush (name) {
  Brush.call(this, name, ['#000000'])
}
LinkBrush.prototype = Object.create(Brush.prototype)
LinkBrush.prototype.constructor = LinkBrush
LinkBrush.prototype.render = function(points, x, y) {
  blendMode(this.blendMode)
  if ((this.count % this.interval) === 0) {
    points.push(createVector(x, y))
    strokeWeight(this.weight)
    const lastIndex = points.length - 1
    points.forEach((point, index) => {
      // can Vector methods
      const dx = point.x - points[lastIndex].x
      const dy = point.y - points[lastIndex].y
      const d = dx * dx + dy * dy
      const minSize = this.size * 0.8
      const maxSize = this.size * 1.2
      if (d < random(minSize, maxSize)) {
        const rgbColor = hexToRgb(random(this.palette))
        stroke(rgbColor.r, rgbColor.g, rgbColor.b, (1 - (d / maxSize)) * 0.1 * this.pressure)
        line(points[lastIndex].x, points[lastIndex].y, point.x, point.y)
      }
    })
  }
  this.count++
}


// App
function App () {
  this.backgroundColor = '#FCFCF8'
  this.brushName = 'pencil'
  this.points = []
  this.count = 0
  this.blendMode = MULTIPLY
  this.palette = ['#000000']
  this.linkBrush = new LinkBrush()
  this.dotBrush = new DotBrush()
  this.flowerBrush = new FlowerBrush()
  this.attributes = []
  this.palettes = []
  this.toolbarX = 0
  this.toolbarY = 0

  // Tools
  this.createToolbar = (x, y) => {
    this.toolbarX = x
    this.toolbarY = y
    this.createSaveButton(0)
    this.createClearButton(1)
    this.createMergeButton(2)
    this.createDotBrush(3)
    this.createPencilBrush(4)
    this.createScratchButton(5)
    this.createFlowerBrush(6)

    this.createPalette(0, 'PAL1', ['#000000'])
    this.createPalette(1, 'PAL2', ['#92140C', '#000000', '#BE7C4D'])
    this.createPalette(2, 'PAL3', ['#333333', '#FF0000'])
    this.createPalette(3, 'PAL4', ['#ECD444', '#808080'])
    this.createPalette(4, 'PAL5', ['#0C7C59', '#58A4B0', '#2B303A'])

    this.addAttribute('BLACK', 0, '1B', { interval: 3 }, true)
    this.addAttribute('BLACK', 1, '2B', { interval: 2 })
    this.addAttribute('BLACK', 2, '3B', { interval: 1 })

    this.addAttribute('HARD', 3, '1H', { presure: 0.6 }, true)
    this.addAttribute('HARD', 4, '2H', { presure: 0.4 })
    this.addAttribute('HARD', 5, '3H', { presure: 0.2 })

    this.addAttribute('SIZE', 6, 'S', { size: 500 })
    this.addAttribute('SIZE', 7, 'M', { size: 2000 }, true)
    this.addAttribute('SIZE', 8, 'L', { size: 3500 })
  }

  this.createStyledButton = (x, y, width, height, color, name) => {
    const button = createButton(name)
    button.style('background-color', color)
    button.style('border', 'none')
    button.style('width', `${width}px`)
    button.style('height', `${height}px`)
    button.position(x, y)
    return button
  }

  this.createMainButtonn = (index, name) => {
    return this.createStyledButton(this.toolbarX, this.toolbarY + index * 45, 50, 40, 'lightGray', name)
  }

  this.createSaveButton = (index) => {
    const button = this.createMainButtonn(index, 'Save')
    button.mousePressed(() => {
      saveCanvas()
    })
  }

  this.createClearButton = (index) => {
    const clearButton = this.createMainButtonn(index, 'Clear')
    clearButton.mousePressed(() => {
      clear()
      this.points.splice(0, this.points.length)
    })
  }

  this.createMergeButton = (index) => {
    const button = this.createMainButtonn(index, 'Merge')
    button.mousePressed(() => {
      this.points.splice(0, this.points.length)
    })
  }

  // Brushes
  this.createDotBrush = (index) => {
    const button = this.createMainButtonn(index, 'Dot')
    button.mousePressed(() => {
      this.brushName = 'dot'
      this.blendMode = MULTIPLY
    })
  }

  this.createFlowerBrush = (index) => {
    const button = this.createMainButtonn(index, 'Flower')
    button.mousePressed(() => {
      this.brushName = 'flower'
      this.blendMode = MULTIPLY
    })
  }

  this.createPencilBrush = (index) => {
    const button = this.createMainButtonn(index, 'Pencil')
    button.mousePressed(() => {
      this.brushName = 'pencil'
      this.blendMode = MULTIPLY
      this.linkBrush.setAttributes({ blendMode: MULTIPLY, palette: this.palette })
    })
  }

  this.createScratchButton = (index) => {
    const button = this.createMainButtonn(index, 'Scratch')
    button.mousePressed(() => {
      this.brushName = 'scratch'
      this.blendMode = BLEND
      this.linkBrush.setAttributes({ blendMode: BLEND, palette: [this.backgroundColor]})
    })
  }

  // Pencil Attributes
  this.createAttributeButtonn = (index, name) => {
    return this.createStyledButton(this.toolbarX + 55, this.toolbarY + index * 45, 50, 40, 'lightGray', name)
  }

  this.disableAttributes = (group) => {
    this.attributes
    .filter(x => x.group === group)
    .forEach(x => x.style('background-color', 'lightGray'))
  }

  this.addAttribute = (group, index, name, { presure, interval, weight, size }, select) => {
    const button = this.createAttributeButtonn(index, name)
    button.group = group
    button.style('background-color', select ? 'darkGray' : 'lightGray')
    if(select) this.linkBrush.setAttributes({ blendMode: this.blendMode, palette: this.palette, presure, interval, weight, size })
    button.mousePressed(() => {
      this.disableAttributes(group)
      button.style('background-color', 'darkGray')
      this.linkBrush.setAttributes({ blendMode: this.blendMode, palette: this.palette, presure, interval, weight, size })
    })
    this.attributes.push(button)
  }

  // Palette
  this.createColorButton = (index, name, color) => {
    return this.createStyledButton(this.toolbarX + 110, this.toolbarY + index * 45, 50, 40, color, name)
  }

  this.disablePalettes = () => {
    this.palettes.forEach(x => x.style('border-color', 'lightGray'))
  }

  this.createPalette = (index, name, palette) => {
    const button = this.createColorButton(index, name, palette[0])
    button.mousePressed(() => {
      this.disablePalettes()
      this.palette = palette
      this.blendMode = MULTIPLY
      this.linkBrush.setAttributes({ blendMode: MULTIPLY, palette })
      this.dotBrush.setAttributes({ blendMode: MULTIPLY, palette })
      this.flowerBrush.setAttributes({ blendMode: MULTIPLY, palette })
    })
    this.palettes.push(button)
  }

  this.createToolbar(1100, 0)
  colorMode(RGB, 255, 255, 255, 1)
  const canvas = createCanvas(1080, 720)
  canvas.style('border', '1px lightGray solid')
  // canvas.center()
  background(this.backgroundColor)
  smooth()
}

App.prototype.draw = function () {
  if (mouseIsPressed) {
    push()
    switch (this.brushName) {
      case 'flower':
        this.flowerBrush.render(this.points, mouseX, mouseY)
        break;
      case 'dot':
        this.dotBrush.render(this.points, mouseX, mouseY)
        break
      case 'pencil':
      case 'scratch':
        this.linkBrush.render(this.points, mouseX, mouseY)
        break;
    }
    pop()
  }
}