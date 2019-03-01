# smiple clipText to compatible IE ,chrome and other Browser

### how to use?
```
<script src="./lib/clip-text.js"></script>
clipText(['.test1'])
clipText('.test3', {line:2})
clipText('.test4', {line:2, showTitle: true})
clipText('.test5', {line:2, clipText: '[更多]', clipClick: function(e){
    console.log(e)
}})
```

### options
| name       |     type     |  required   |           defind        |
| --------   |     -----:   |   -----:    |           :----:        |
| line       |     int      |   false     |  clip line              |
| showTitle  |   boolean    |   false     |  add title              |
| clipText   |    string    |   false     |  customize more text    |
| clipClick  |   function   |   false     | click function          |
| animation  |   boolean    |   false     | show animation  //todo  | 

### example
![alt](https://c-rick.github.io/images/clip-text.png)

### how to use in anguular2+?
use clip-text with directive
```
<script src="./lib/clip-text.js"></script>

// ClipTextDirective
import { Directive, ElementRef, HostListener, Input } from '@angular/core';
declare var clipText;
@Directive({
  selector: '[appClipText]'
})
export class ClipTextDirective {
  @Input() set appClipText(obj: any) {
    setTimeout(() => {
      clipText(this._el, {...obj});
    });
  }
  _el: ElementRef;
  _class: any;
  _lineNum: any;
  constructor(private el: ElementRef) {
    this._el = this.el.nativeElement;
  }
}
// template
<P [appClipText]='{line:2}' >{{yourText}}</P>
```