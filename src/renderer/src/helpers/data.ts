export class FileObj {
  public path: string
  public get name() {
    return this.path
  }
  public meta: [origin: string[], anthor: string[], chars: string[]] | []
  public get isEdited() {
    return /^(\[(([^ \[ \]  ]|\s))+\]){2}.+(\.\w+)$/igm.test(this.name)
  }
  constructor(name: string) {
    this.path = name
    if (this.isEdited) {
      const anthorBase = name.match(/(?<=(\[(([^ \[ \]  ]|\s))+\]))(\[(([^ \[ \]  ]|\s)+\]))/ig)![0]
      const originBase = name.match(/(\[(([^ \[ \]  ]|\s))+\])(?=(\[(([^ \[ \]  ]|\s))+\]))/ig)![0]
      const characterBase = name.match(/((?<=(\[(([^ \[ \]  ]|\s))+\])(\[(([^ \[ \]  ]|\s))+\])).+(?=\s\())|((?<=(\[(([^ \[ \]  ]|\s))+\])(\[(([^ \[ \]  ]|\s))+\])).+(?=\.))/ig)![0]
      const metaObj = {
        origin: originBase.substring(1, originBase.length - 1).split('+').map(v => v.trim()),
        anthor: anthorBase.substring(1, anthorBase.length - 1).split('+').map(v => v.trim()),
        character: characterBase.split('+').map(v => v.trim()),
      }
      var meta: typeof this.meta = [metaObj.origin, metaObj.anthor, metaObj.character]
    } else {
      var meta: typeof this.meta = []
    }
    this.meta = meta
  }
  public static empty = new FileObj('')
}