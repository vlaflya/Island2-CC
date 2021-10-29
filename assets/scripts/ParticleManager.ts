
import { _decorator, Component, Node, Prefab, instantiate, systemEvent, EventTouch, SystemEvent, Touch, Vec3, UITransform, ParticleSystem2D, Vec2 } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('ParticleManager')
export class ParticleManager extends Component {
    // @property({type: Prefab}) tapParticles: Prefab
    @property({type: Prefab}) afterBuildingParticles: Prefab
    @property({type: Prefab}) buildParticles: Prefab
    public static Instance: ParticleManager
    onLoad() {
        ParticleManager.Instance = this
    }
    public setParticlesAfterBuild(transform: UITransform){
        console.log("oke")
        let prt = instantiate(this.afterBuildingParticles).getComponent(ParticleSystem2D)
        prt.node.parent = this.node
        prt.node.worldPosition = transform.node.worldPosition
        prt.posVar = new Vec2(transform.width / 5, transform.height/ 5)
        console.log(prt.posVar.toString())
    }
    public setBuildParticles(node: Node){
        let prt = instantiate(this.buildParticles)
        prt.parent = this.node
        prt.worldPosition = node.worldPosition
    }
}