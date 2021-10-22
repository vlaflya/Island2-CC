
import { _decorator, Component, Node, Prefab, instantiate, systemEvent, EventTouch, SystemEvent, Touch, Vec3, UITransform, ParticleSystem2D, Vec2 } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('ParticleManager')
export class ParticleManager extends Component {
    @property({type: Prefab}) tapParticles: Prefab
    @property({type: Prefab}) afterBuildingParticles: Prefab
    public static Instance: ParticleManager
    onLoad() {
        ParticleManager.Instance = this
    }
    public setParticlesAfterBuild(transform: UITransform){
        console.log("oke")
        let prt = instantiate(this.afterBuildingParticles).getComponent(ParticleSystem2D)
        prt.node.parent = transform.node
        prt.node.worldPosition = transform.node.worldPosition
        prt.posVar = new Vec2(transform.width, transform.height)
        console.log(prt.posVar.toString())
    }
}