
import { _decorator, Component, Node, sp, loader, assetManager, Sprite, ImageAsset, SpriteFrame, resources, Prefab, tween, instantiate, Vec3, Color, UIOpacity, Button, EventTouch, Touch, UITransform, EventHandler, AudioSource, randomRangeInt } from 'cc';
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
    @property({type: Node}) buildButton: Node = null
    @property({type: Prefab}) tapParticles: Prefab
    @property({type: Prefab}) buildParticles: Prefab
    @property({type: Node}) Zebra: Node = null
    @property({type: Node}) ZebraEndTarget: Node
    @property({type: AudioSource}) shortPhrase: AudioSource = null
    @property({type: AudioSource}) longPhrase: AudioSource = null
    
    private phraseCount: number = 0
    private ZebraStartPos: Vec3

    private point: BuildingPoint = null

    start(){
        this.node.on(Node.EventType.TOUCH_START, this.animate, this)
        let name = this.node.parent.parent.name + "-" + this.point.getCount() + "-1"
        if(this.node.getChildByName(name) != null && this.point != null)
            this.shortPhrase = this.node.getChildByName(name).getComponent(AudioSource)
        else
            console.log(name);
        name = this.node.parent.parent.name + "-" + this.point.getCount() + "-2"
        if(this.node.getChildByName(name) != null && this.point != null)
            this.longPhrase = this.node.getChildByName(name).getComponent(AudioSource)
    }

    private animate(touch: Touch, event: EventTouch){
        if(!this.interactable)
            return
        if(!GameStateMachine.Instance.stateMachine.isCurrentState("idleState"))
            return
        GameStateMachine.Instance.stateMachine.exitState("animationState")
        this.Zebra = this.node.getChildByPath("visuals/Mask/zebra")
        this.ZebraEndTarget = this.node.getChildByPath("visuals/Mask/target")
        console.log(this.Zebra);

        

        if(this.shortPhrase != null && this.longPhrase != null){
            switch(this.phraseCount){
                case 0:{
                    this.longPhrase.play()
                    this.phraseCount++
                    break
                }
                case 1:{
                    this.shortPhrase.play()
                    this.phraseCount++
                    break
                }
                case 2:{
                    let r = randomRangeInt(0, 2)
                    SoundManager.Instance.setRandomZebraSound(this.node)
                    this.phraseCount = 0
                    break
                }
            }
        }
        if(this.point.getCount() == 0){
            let r = randomRangeInt(0, 3)
            SoundManager.Instance.setSound("island2_ruin_" + r, this.node)
        }
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
                .to(0.5, {position: this.ZebraStartPos, scale: new Vec3(0,0,0)})
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
        if(this.buildButton == null)
            this.buildButton = this.node.getChildByName("Button")
        if(isCurrentBuilding){
            this.buildButton.active = true
            let event: EventHandler = new EventHandler()
            event.target = this.node
            event.component = "Building"
            event.handler = "setChoice"
            this.buildButton.getComponent(Button).clickEvents.push(event)
            this.buildButton.getComponent(Button).interactable = true
            console.log(this.buildButton.getComponent(Button).clickEvents.length);
            // this.buildButton.on(Node.EventType.TOUCH_START, this.setChoice, this)
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
            SoundManager.Instance.setSound("island2_build_finish", this.node)
            
        })
        .delay(3)
        .call(() =>{
            if(this.shortPhrase != null)
                this.shortPhrase.play()
        })
        .delay(1)
        .call(() =>{
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
        console.log("oke")
        this.point.setChoice()
    }
    public startBuild(){
        if(GameStateMachine.Instance.stateMachine.isCurrentState("idle")){
            GameStateMachine.Instance.exitIdle("choise")
        }
    }
}
