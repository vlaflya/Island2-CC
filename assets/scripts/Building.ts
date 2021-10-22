
import { _decorator, Component, Node, sp, loader, assetManager, Sprite, ImageAsset, SpriteFrame, resources, Prefab, tween, instantiate, Vec3, Color, UIOpacity, Button, EventTouch, Touch, UITransform, EventHandler } from 'cc';
import { GameStateMachine } from './GameStateMachine';
import { ChoiceManage } from './ChoiceManage';
import { BuildingPoint } from './BuildingPoint';
import { BuildingManager } from './BuildingManager';
import { ParticleManager } from './ParticleManager';
import { SoundManager } from './SoundManager';
const { ccclass, property } = _decorator;

@ccclass('Building')
export class Building extends Component {
    @property({type: Boolean}) interactable: boolean = true
    @property({type: Node}) buildButton: Node
    @property({type: Prefab}) tapParticles: Prefab
    @property({type: Prefab}) buildParticles: Prefab
    @property({type: Node}) Zebra: Node = null
    @property({type: Node}) ZebraEndTarget: Node
    private ZebraStartPos: Vec3

    private point: BuildingPoint

    start(){
        this.node.on(Node.EventType.TOUCH_START, this.animate, this)
    }

    private animate(touch: Touch, event: EventTouch){
        if(!this.interactable)
            return
        if(!GameStateMachine.Instance.stateMachine.isCurrentState("idleState"))
            return
        GameStateMachine.Instance.stateMachine.exitState("animationState")

        tween(this.node)
        .call(() => {
            let prt: Node = instantiate(this.tapParticles)
            prt.parent = this.node
            let pos = new Vec3(touch.getUILocation().x, touch.getUILocation().y, 0)
            prt.worldPosition = pos
            console.log(prt.name);
        })
        .by(0.1, {scale: new Vec3(-0.05, -0.05, -0.05)}, {easing: 'bounceIn'})
        .by(0.1, {scale: new Vec3(0.05, 0.05, 0.05)}, {easing: 'bounceOut'})
        .call(() => {
            if(this.Zebra != null){
                this.ZebraStartPos = new Vec3(this.Zebra.position)
                this.Zebra.scale = new Vec3(0,0,0)
                tween(this.Zebra)
                .to(0.5, {worldPosition: this.ZebraEndTarget.worldPosition, scale: new Vec3(1,1,1)})
                .delay(1)
                .to(0.5, {position: this.ZebraStartPos})
                .call(() => {
                    GameStateMachine.Instance.stateMachine.exitState()
                })
                .start()
            }
            else{
                GameStateMachine.Instance.stateMachine.exitState()
            }
        })
        .start()
    }

    public init(isCurrentBuilding: boolean, point: BuildingPoint, build: boolean = false){
        this.point = point
        this.buildButton = this.node.getChildByName("Marker")
        if(isCurrentBuilding){
            this.buildButton.active = true
            let event: EventHandler = new EventHandler()
            event.target = this.node
            event.component = "Building"
            event.handler = "setChoice"
            this.buildButton.getComponent(Button).clickEvents[0] = event
            this.buildButton.getComponent(Button).interactable = true
        }
        else
            this.buildButton.active = false
        if(!build)
            return
        this.fadeIn()
    }
    public setNextMarker(){
        console.log("oke2")
        this.buildButton.active = true
        this.buildButton.getComponent(Button).interactable = false
    }
    public fadeIn(){
        this.node.getComponent(UIOpacity).opacity = 255
        
        tween(this.node.getComponent(UIOpacity))
        .to(1, {opacity: 255})
        .call(() => {
            ParticleManager.Instance.setParticlesAfterBuild(this.node.getComponent(UITransform))
            BuildingManager.Instance.setNextMarker()
        })
        .start()
    }
    public fadeOut(){
        SoundManager.Instance.setSound("island_construct2", this.node.parent)
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
