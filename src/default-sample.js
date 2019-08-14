export default `
class Point {
  constructor(x, y) {
      this.x = x
      this.y = y
  }

  toString() {
      return '[X=' + this.x + ', Y=' + this.y + ']'
  }
}

class ColorPoint extends Point {
  static default() {
      return new ColorPoint(0, 0, 'black')
  }

  constructor(x, y, color) {
      super(x, y)
      this.color = color
  }

  toString() {
      return '[X=' + this.x + ', Y=' + this.y + ', color=' + this.color + ']'
  }
}

console.log(\`
The first point is \${new Point(2, 10)}
The second point is \${new ColorPoint(2, 10, 'green')}
The default color point is \${ColorPoint.default()}
\`);
`;