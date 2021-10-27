
import { _decorator, Component, Node } from 'cc';
const { ccclass, property } = _decorator;

 
@ccclass('Marker')
export class Marker extends Component {
    @property({type: Node}) activeVisuals: Node
    @property({type: Node}) inactiveVisuals: Node

    public init(active: boolean){
        if(active){
            this.activeVisuals.active = true
            this.inactiveVisuals.active = false
        }
        else{
            this.activeVisuals.active = false
            this.inactiveVisuals.active = true
        }
    }
}
