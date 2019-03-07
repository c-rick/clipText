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
clipText('.test6', {line:2, animation: 100})
```

### options
| name       |     type     |  required   |           defind        |
| --------   |     -----:   |   -----:    |           :----:        |
| line       |     number      |   false     |  clip line              |
| showTitle  |   boolean    |   false     |  add title              |
| clipText   |    string    |   false     |  customize more text    |
| clipClick  |   function   |   false     | click function          |
| animation  |   boolean | number    |   show animation frame by frame    | 

### example
![alt](https://c-rick.github.io/images/clip-text.png)
![alt](https://c-rick.github.io/images/clip-animation.gif)
### how to use in angular2+, vue or react?
use clip-text with directive in angular2+
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
use clip-text with directive in vue

```
<script src="./lib/clip-text.js"></script>

// global directive
Vue.directive('clip', {
  inserted: function (el) {
    clipText(el, { line: 2 })
  }
})
// component
new Vue({
  el: '.vue-app',
  data: {
    text: '[修改前]测试多行省略测试多行多行省略',
    title: 'vue使用'
  }
})
// template
<div class="vue-app text-box">
  <p>{{title}}</p>
  <div v-clip class="test2">{{text}}</div>
</div>

```

use clip-text with component in react

```
<script src="./lib/clip-text.js"></script>

// component
class ClipText extends React.Component {
  constructor(props) {
    super(props)
  }
  componentDidMount(e) {
    clipText(this.refs.clipRef, { line: 2 })
  }
  render() {
    return (<div class='test2' ref='clipRef'>{this.props.clipContent}</div>)
  }
}
// template
ReactDOM.render(
  (
    <div class='text-box'>
      <p>react使用</p>
      <div class='test2'>[修改前]测试多行省略测试多行多行省略</div>
      <ClipText clipContent="[修改前]测试多行省略测试多行多行省略" />
    </div>
  ),
  document.getElementById('root')
);
```