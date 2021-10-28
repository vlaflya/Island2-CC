
import { _decorator, Component, Node, sp } from 'cc';
const { ccclass, property } = _decorator;
@ccclass('Blob')
export class Blob extends Component {
    private skeleton: sp.Skeleton
    onLoad () {
        this.skeleton = this.getComponent(sp.Skeleton)
        this.skeleton.setEventListener(() => {this.kill})
    }
    private kill(){
        this.node.destroy()
    }
}