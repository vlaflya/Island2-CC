
import { _decorator, Component, Node, sp, loader, assetManager, Sprite, ImageAsset, SpriteFrame, resources, Prefab, tween, instantiate, Vec3, Color, UIOpacity } from 'cc';
import { GameStateMachine } from './GameStateMachine';
import { ChoiceManage } from './ChoiceManage';
import { BuildingPoint } from './BuildingPoint';
const { ccclass, property } = _decorator;

@ccclass('Building')
export class Building extends Component {
    @property({type: Node}) buildButton: Node
    @property({type: Prefab}) tapParticles: Prefab
    @property({type: Prefab}) buildParticles: Prefab


    private point: BuildingPoint

    start(){
        this.node.on(Node.EventType.TOUCH_START, this.animate, this)
    }

    private animate(){
        if(!GameStateMachine.Instance.stateMachine.isCurrentState("idleState"))
            return
        GameStateMachine.Instance.stateMachine.exitState("animationState")
        tween(this.node)
        .call(() => {
            let prt: Node = instantiate(this.tapParticles)
            prt.parent = this.node
            prt.position = new Vec3(0,0,0)
            console.log(prt.name);
        })
        .by(0.5, {scale: new Vec3(0.1, 0.1, 0.1)}, {easing: 'bounceIn'})
        .by(0.5, {scale: new Vec3(-0.1, -0.1, -0.1)}, {easing: 'bounceOut'})
        .call(() => {
            GameStateMachine.Instance.stateMachine.exitState()
        })
        .start()
    }

    public init(isCurrentBuilding: boolean, point: BuildingPoint, build: boolean = false){
        this.point = point
        if(isCurrentBuilding)
            this.buildButton.active = true
        else
            this.buildButton.active = false
        if(!build)
            return
        this.fadeIn()
    }
    public fadeIn(){
        this.node.getComponent(UIOpacity).opacity = 0
        tween(this.node.getComponent(UIOpacity))
        .to(5, {opacity: 255})
        .start()
    }
    public fadeOut(){
        let prt: Node = instantiate(this.buildParticles)
        prt.parent = this.node.parent.parent.children[1]
        console.log(prt.parent.name)
        prt.position = new Vec3(0,0,0)
        console.log(prt.name);
        tween(this.node.getComponent(UIOpacity))
        .to(1, {opacity: 0})
        .start()
    }
    public setChoice(){
        this.point.setChoice()
    }
    public startBuild(){
        if(GameStateMachine.Instance.stateMachine.isCurrentState("idle")){
            GameStateMachine.Instance.exitIdle("choise")
        }
    }
}
