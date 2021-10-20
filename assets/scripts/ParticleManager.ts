
import { _decorator, Component, Node, Prefab, instantiate, systemEvent, EventTouch, SystemEvent, Touch, Vec3 } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('ParticleManager')
export class ParticleManager extends Component {
    @property({type: Prefab}) tapParticles: Prefab

    start () {
        systemEvent.on(SystemEvent.EventType.TOUCH_END, this.onTouchStart, this)
    }
    onTouchStart(touch: Touch, event: EventTouch){
        let prt = instantiate(this.tapParticles)
        prt.parent = this.node
        let v3: Vec3 = new Vec3(touch.getUILocation().x, touch.getUILocation().y)
        prt.worldPosition = v3
    }
}